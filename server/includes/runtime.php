<?php
/**
 * Mounts the Elephentity runtime: schema installation and the GraphQL layer.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Clog\Runtime\Clog;
use Eleph\WPGraphQL\Plugin as ElephGraphQL;
use Eleph\Runtime\Type\NullProcessorRegistry;

/**
 * Register the generated GraphQL surface.
 *
 * Registration is a loop over the compiled manifest — object types, root fields,
 * connections and mutations — resolved through the entity gateway. It replaces the
 * hand-written registrations that read post meta.
 */
add_action( 'plugins_loaded', 'clog_boot_graphql' );
add_filter( 'graphql_wp_connection_type_config', [\Clog\GraphQL\InventoryFields::class, 'connectionConfig'] );
add_action( 'graphql_register_types', static function (): void {
	try {
		(new \Clog\GraphQL\InventoryFields(Clog::instance()->queries()))->register();
	} catch ( RuntimeException $failure ) {
		// The normal boot notice describes a pending schema upgrade.
	}
}, 20 );

function clog_boot_graphql(): void {
	$clog = Clog::instance();

	try {
		// Updates do not rerun activation. Detect a pending upgrade on normal loads,
		// including sites where WPGraphQL is temporarily unavailable.
		$clog->tables()->requireReady();
		if ( ! class_exists( ElephGraphQL::class ) ) {
			return;
		}
		ElephGraphQL::fromManifest(
			$clog->graphqlManifestPath(), $clog->gateway(), new NullProcessorRegistry()
		)->boot();
	} catch ( RuntimeException $failure ) {
		error_log( '[clog] ' . $failure->getMessage() );
		add_action( 'admin_notices', static function () use ( $failure ): void {
			if ( current_user_can( 'manage_options' ) ) {
				echo '<div class="notice notice-error"><p>' . esc_html( $failure->getMessage() ) . '</p></div>';
			}
		} );
	}
}

/**
 * Create the entity tables. Called on activation and by `wp clog install`.
 *
 * @return list<string> Schema statements applied.
 */
function clog_install_tables(): array {
	return Clog::instance()->tables()->install();
}
