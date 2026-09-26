<?php
/**
 * WP-CLI commands for the Elephentity runtime.
 *
 * Usage:
 *   wp clog install          apply safe additive schema changes
 *   wp clog status           report table state and what the runtime can see
 *   wp clog entity <cmd>     exercise the gateway: list, create, get, delete
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	return;
}

use Clog\Runtime\Clog;
use Eleph\Runtime\Identity\EntityId;

WP_CLI::add_command( 'clog install', 'clog_cli_install' );
WP_CLI::add_command( 'clog status', 'clog_cli_status' );
WP_CLI::add_command( 'clog entity', 'clog_cli_entity' );
WP_CLI::add_command( 'clog migration', 'clog_cli_migration' );

/**
 * Inspect or explicitly apply the versioned storage upgrade.
 *
 * ## OPTIONS
 *
 * <command>
 * : status, plan (read-only dry run), or run.
 *
 * [--backup-verified]
 * : Confirm a full external database backup has been verified and retained.
 *
 * ## EXAMPLES
 *
 *     wp clog migration status --user=admin
 *     wp clog migration plan --user=admin
 *     wp clog migration run --backup-verified --user=admin
 *
 * @when after_wp_load
 */
function clog_cli_migration( array $args, array $assoc ): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		WP_CLI::error( 'Migration commands require --user=<administrator>.' );
	}
	$migration = Clog::instance()->migration();
	try {
		switch ( $args[0] ) {
			case 'status':
				WP_CLI::log( wp_json_encode( $migration->status(), JSON_PRETTY_PRINT ) );
				break;
			case 'plan':
				WP_CLI::log( wp_json_encode( $migration->status(), JSON_PRETTY_PRINT ) );
				foreach ( $migration->plan() as $sql ) {
					WP_CLI::log( $sql . ';' );
				}
				WP_CLI::success( 'Dry run complete. No data changed. Null updated_at values will use created_at; originals and posts will be retained.' );
				break;
			case 'run':
				// Check the file, not wp_is_maintenance_mode(): the latter expires after ten minutes.
				if ( ! file_exists( ABSPATH . '.maintenance' ) || ! isset( $assoc['backup-verified'] ) ) {
					throw new RuntimeException( 'Activate maintenance, drain writers, and verify a full database backup first; then pass --backup-verified. See docs/storage-upgrade.md.' );
				}
				WP_CLI::log( wp_json_encode( $migration->run(), JSON_PRETTY_PRINT ) );
				WP_CLI::success( 'Storage upgrade verified. Keep the backup and old plugin for rollback.' );
				break;
			default:
				WP_CLI::error( 'Expected status, plan, or run.' );
		}
	} catch ( RuntimeException $failure ) {
		WP_CLI::error( $failure->getMessage() );
	}
}

/**
 * Apply safe additive schema changes; refuse destructive upgrades.
 *
 * ## EXAMPLES
 *
 *     wp clog install
 *
 * @when after_wp_load
 */
function clog_cli_install(): void {
	try {
		$created = clog_install_tables();
	} catch ( RuntimeException $failure ) {
		WP_CLI::error( $failure->getMessage() );
		return;
	}

	if ( [] === $created ) {
		WP_CLI::success( 'Entity schema is up to date.' );
		return;
	}

	foreach ( $created as $table ) {
		WP_CLI::log( "Applied: {$table}" );
	}

	WP_CLI::success( sprintf( 'Applied %d schema statement(s).', count( $created ) ) );
}

/**
 * Report what the runtime sees.
 *
 * ## EXAMPLES
 *
 *     wp clog status --user=admin
 *
 * @when after_wp_load
 */
function clog_cli_status(): void {
	$clog    = Clog::instance();
	$missing = $clog->tables()->missing();

	WP_CLI::log( 'Tables: ' . ( [] === $missing ? 'all present' : 'MISSING ' . implode( ', ', $missing ) ) );

	if ( [] !== $missing ) {
		WP_CLI::warning( 'Run `wp clog install`.' );
		return;
	}

	try {
		$clog->tables()->requireReady();
	} catch ( RuntimeException $failure ) {
		WP_CLI::warning( $failure->getMessage() );
		return;
	}

	$gateway = $clog->gateway();
	$rows    = [];

	foreach ( [ 'Item', 'Location', 'Inventory' ] as $entity ) {
		$rows[] = [
			'entity' => $entity,
			'rows'   => $gateway->all( $entity )->count(),
		];
	}

	WP_CLI\Utils\format_items( 'table', $rows, [ 'entity', 'rows' ] );
}

/**
 * Read and write entities through the gateway.
 *
 * ## OPTIONS
 *
 * <command>
 * : One of list, get, create, delete.
 *
 * <entity>
 * : Item, Location or Inventory.
 *
 * [<id>]
 * : Entity id, for get and delete.
 *
 * [--<field>=<value>]
 * : Field values, for create.
 *
 * ## EXAMPLES
 *
 *     wp clog entity list Location --user=admin
 *     wp clog entity create Location --name="Pantry" --user=admin
 *     wp clog entity get Location 1 --user=admin
 *     wp clog entity delete Location 1 --user=admin
 *
 * @when after_wp_load
 */
function clog_cli_entity( array $args, array $assoc ): void {
	[ $command, $entity ] = [ $args[0], $args[1] ?? '' ];

	$gateway = Clog::instance()->gateway();

	switch ( $command ) {
		case 'list':
			$rows = [];
			foreach ( $gateway->all( $entity )->all() as $found ) {
				$rows[] = clog_cli_entity_row( $found );
			}
			if ( [] === $rows ) {
				WP_CLI::log( "No {$entity} rows." );
				return;
			}
			WP_CLI\Utils\format_items( 'table', $rows, array_keys( $rows[0] ) );
			return;

		case 'get':
			$found = $gateway->find( $entity, EntityId::of( (int) $args[2] ) );
			if ( null === $found ) {
				WP_CLI::error( "No {$entity} with id {$args[2]}." );
			}
			WP_CLI\Utils\format_items( 'table', [ clog_cli_entity_row( $found ) ], array_keys( clog_cli_entity_row( $found ) ) );
			return;

		case 'create':
			$id = $gateway->create( $entity, clog_cli_coerce( $assoc ) )->id;
			WP_CLI::success( sprintf( 'Created %s %s.', $entity, $id ) );
			return;

		case 'delete':
			$gateway->delete( $entity, EntityId::of( (int) $args[2] ) );
			WP_CLI::success( sprintf( 'Deleted %s %s.', $entity, $args[2] ) );
			return;

		default:
			WP_CLI::error( "Unknown command: {$command}" );
	}
}

/**
 * Flatten a read model into scalars for tabular output.
 *
 * @return array<string, scalar|null>
 */
function clog_cli_entity_row( object $entity ): array {
	$row = [];

	foreach ( get_class_methods( $entity ) as $method ) {
		if ( ! str_starts_with( $method, 'get' ) ) {
			continue;
		}

		$value = $entity->{$method}();

		// Edge accessors return lazy queries and entities; a flat table is not the
		// place to walk them.
		if ( is_object( $value ) && ! $value instanceof DateTimeInterface && ! $value instanceof Stringable ) {
			continue;
		}

		$row[ lcfirst( substr( $method, 3 ) ) ] = $value instanceof DateTimeInterface
			? $value->format( 'Y-m-d H:i:s' )
			: ( is_object( $value ) ? (string) $value : $value );
	}

	return $row;
}

/**
 * WP-CLI hands everything over as strings; the input appliers want real types.
 *
 * @param array<string, string> $assoc
 *
 * @return array<string, mixed>
 */
function clog_cli_coerce( array $assoc ): array {
	$coerced = [];

	foreach ( $assoc as $key => $value ) {
		// Deliberately no numeric coercion. A barcode is a string of digits, and
		// nothing exposes a field's primitive at runtime for this to consult — the
		// catalogue reports declared types only — so guessing from the value turns
		// "013000006057" into an int and the input applier rejects it.
		$coerced[ $key ] = match ( true ) {
			'' === $value      => null,
			'true' === $value  => true,
			'false' === $value => false,
			default            => $value,
		};
	}

	return $coerced;
}
