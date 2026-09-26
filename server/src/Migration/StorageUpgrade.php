<?php

declare(strict_types=1);

namespace Clog\Migration;

use Eleph\WordPress\Database\Database;
use Eleph\WordPress\Manifest\StorageManifest;
use Eleph\WordPress\Migration\Introspector;
use Eleph\WordPress\Sql\DdlCompiler;
use Eleph\WordPress\Sql\TableSchema;
use RuntimeException;

/** Copy, verify, then atomically exchange all three tables. Never drop user data. */
final readonly class StorageUpgrade
{
    public const VERSION = 2;
    public const STAGE = '_clog_v2_stage';
    public const BACKUP = '_clog_v1_backup';

    public function __construct(private Database $db, private StorageManifest $target)
    {
    }

    /** Read-only inspection; also used before every execution, never a cached option. */
    public function status(): array
    {
        $tables = $this->target->withPrefix($this->db->prefix())->everyTable();
        $legacy = (require dirname(__DIR__, 2) . '/migrations/v1-storage.php')
            ->withPrefix($this->db->prefix())->everyTable();
        $states = [];
        $counts = [];
        $artifacts = [];
        $introspector = new Introspector();
        foreach ($tables as $name => $table) {
            $this->identifier($name . self::BACKUP);
            $current = $introspector->inspect($this->db, $name);
            $states[$name] = null === $current ? 'absent'
                : ($current == $table ? 'v2' : ($current == $legacy[$name] ? 'v1' : 'unsupported'));
            $counts[$name] = null === $current ? 0 : $this->count($name);
            foreach ([self::STAGE, self::BACKUP] as $suffix) {
                if (null !== $introspector->inspect($this->db, $name . $suffix)) {
                    $artifacts[] = $name . $suffix;
                }
            }
        }
        $unique = array_values(array_unique($states));
        $state = 1 === count($unique) ? $unique[0] : 'mixed';
        $projections = (int) $this->db->scalar(
            'SELECT COUNT(*) FROM ' . $this->identifier($this->db->prefix() . 'posts')
                . " WHERE post_type IN ('clog_item', 'clog_location', 'clog_inventory')",
        );
        if ('absent' === $state) {
            $state = $projections > 0 ? 'legacy-posts' : 'fresh';
        }
        if ([] !== $artifacts && 'v2' !== $state) {
            $state = 'interrupted';
        }
        if ('v2' === $state && array_filter($artifacts, static fn ($name) => str_ends_with($name, self::STAGE))) {
            $state = 'interrupted';
        }
        return ['version' => self::VERSION, 'state' => $state, 'tables' => $states,
            'counts' => $counts, 'projectionPosts' => $projections, 'retainedTables' => $artifacts];
    }

    /** An inspectable plan. Validation precedes even the first CREATE TABLE. */
    public function plan(): array
    {
        $status = $this->status();
        if ('v2' === $status['state']) {
            return [];
        }
        if ('v1' !== $status['state']) {
            throw new RuntimeException('Storage upgrade refused: ' . $status['state']
                . '. Run wp clog migration status and consult docs/storage-upgrade.md. No tables were changed.');
        }
        $version = (string) $this->db->scalar('SELECT VERSION()');
        $maria = str_contains($version, 'MariaDB');
        preg_match('/(\d+\.\d+\.\d+)/', $version, $match);
        if ($maria || !isset($match[1]) || version_compare($match[1], '8.0.13', '<')) {
            throw new RuntimeException('This migration requires MySQL 8.0.13+; MariaDB needs a separately tested cutover strategy. No tables changed.');
        }
        $this->validateRelationships();
        $this->validateProjections();
        $sql = [];
        $renames = [];
        foreach ($this->target->withPrefix($this->db->prefix())->everyTable() as $name => $table) {
            $meta = $this->db->select('SELECT ENGINE, AUTO_INCREMENT FROM information_schema.TABLES'
                . ' WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s', [$name])[0] ?? [];
            if ('InnoDB' !== ($meta['ENGINE'] ?? null)) {
                throw new RuntimeException('Only InnoDB source tables support this migration: ' . $name);
            }
            $foreignKeys = (int) $this->db->scalar('SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE'
                . ' WHERE (TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND REFERENCED_TABLE_NAME IS NOT NULL)'
                . ' OR (REFERENCED_TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = %s)', [$name, $name]);
            $triggers = (int) $this->db->scalar('SELECT COUNT(*) FROM information_schema.TRIGGERS'
                . ' WHERE EVENT_OBJECT_SCHEMA = DATABASE() AND EVENT_OBJECT_TABLE = %s', [$name]);
            if ($foreignKeys + $triggers > 0) {
                throw new RuntimeException('Unsupported foreign keys or triggers on ' . $name . '; inspect before migration.');
            }
            $stage = $name . self::STAGE;
            $sql[] = (new DdlCompiler())->createTable(new TableSchema($stage, $table->columns, $table->indexes, $table->primaryKey));
            $columns = implode(', ', array_map($this->identifier(...), array_keys($table->columns)));
            $values = implode(', ', array_map(fn ($col) => 'updated_at' === $col
                ? 'COALESCE(`updated_at`, `created_at`)' : $this->identifier($col), array_keys($table->columns)));
            $sql[] = 'INSERT INTO ' . $this->identifier($stage) . " ($columns) SELECT $values FROM " . $this->identifier($name);
            // Preserve high-water marks too: deleted IDs must never be reused.
            $sql[] = 'ALTER TABLE ' . $this->identifier($stage) . ' AUTO_INCREMENT = ' . max(1, (int) ($meta['AUTO_INCREMENT'] ?? 1));
            $renames[] = $this->identifier($name) . ' TO ' . $this->identifier($name . self::BACKUP);
            $renames[] = $this->identifier($stage) . ' TO ' . $this->identifier($name);
        }
        $sql[] = 'RENAME TABLE ' . implode(', ', $renames);
        return $sql;
    }

    /** Caller must hold site maintenance and have an independently verified backup. */
    public function run(): array
    {
        $lock = 'clog-upgrade-' . substr(hash('sha256', (string) $this->db->scalar('SELECT DATABASE()') . $this->db->prefix()), 0, 32);
        if (1 !== (int) $this->db->scalar('SELECT GET_LOCK(%s, 0)', [$lock])) {
            throw new RuntimeException('Another Clog migration is running.');
        }
        try {
            $plan = $this->plan();
            if ([] === $plan) {
                return $this->status();
            }
            $rename = array_pop($plan);
            // CREATE/ALTER implicitly commit in MySQL; originals are never altered.
            foreach ($plan as $sql) {
                if (!str_starts_with($sql, 'INSERT')) {
                    $this->db->execute($sql);
                }
            }
            $locks = ['`' . $this->db->prefix() . 'posts` READ'];
            foreach ($this->target->withPrefix($this->db->prefix())->everyTable() as $name => $table) {
                $locks[] = $this->identifier($name) . ' WRITE';
                $locks[] = $this->identifier($name . self::STAGE) . ' WRITE';
            }
            $this->db->execute('LOCK TABLES ' . implode(', ', $locks));
            try {
                $this->validateProjections();
                foreach ($plan as $sql) {
                    if (str_starts_with($sql, 'INSERT')) {
                        $this->db->execute($sql);
                    }
                }
                $this->verifyCopies();
                $this->db->execute($rename);
            } finally {
                $this->db->execute('UNLOCK TABLES');
            }
            return $this->status();
        } finally {
            $this->db->scalar('SELECT RELEASE_LOCK(%s)', [$lock]);
        }
    }

    private function validateRelationships(): void
    {
        $inventory = $this->identifier($this->db->prefix() . 'clog_inventory');
        foreach (['item', 'location'] as $edge) {
            $parent = $this->identifier($this->db->prefix() . 'clog_' . $edge);
            if (0 !== (int) $this->db->scalar("SELECT COUNT(*) FROM $inventory LEFT JOIN $parent"
                . " ON $inventory.`{$edge}_id` = $parent.`id` WHERE $parent.`id` IS NULL")) {
                throw new RuntimeException('Inventory has missing ' . $edge . ' relationships. Repair the source data before migration.');
            }
        }
    }

    private function validateProjections(): void
    {
        $posts = $this->identifier($this->db->prefix() . 'posts');
        foreach (['item', 'location', 'inventory'] as $entity) {
            $table = $this->identifier($this->db->prefix() . 'clog_' . $entity);
            $type = 'clog_' . $entity;
            $invalid = (int) $this->db->scalar("SELECT COUNT(*) FROM $table LEFT JOIN $posts ON $table.post_id = $posts.ID"
                . " WHERE $posts.ID IS NULL OR $posts.post_type <> %s", [$type]);
            $unmapped = (int) $this->db->scalar("SELECT COUNT(*) FROM $posts LEFT JOIN $table ON $posts.ID = $table.post_id"
                . " WHERE $posts.post_type = %s AND $table.id IS NULL", [$type]);
            if ($invalid + $unmapped > 0) {
                throw new RuntimeException("Mixed or broken $type post projections. Inspect a backup before choosing an import or repair.");
            }
        }
    }

    private function verifyCopies(): void
    {
        $this->validateRelationships();
        foreach ($this->target->withPrefix($this->db->prefix())->everyTable() as $name => $table) {
            $source = $this->identifier($name);
            $copy = $this->identifier($name . self::STAGE);
            $differences = [];
            foreach ($table->columns as $col) {
                $field = $this->identifier($col->name);
                $value = 'updated_at' === $col->name ? "COALESCE($source.`updated_at`, $source.`created_at`)" : "$source.$field";
                // Binary comparison detects even case/whitespace changes to strings.
                $differences[] = "NOT (BINARY $copy.$field <=> BINARY $value)";
            }
            $mismatches = (int) $this->db->scalar("SELECT COUNT(*) FROM $source LEFT JOIN $copy ON $source.id = $copy.id WHERE " . implode(' OR ', $differences));
            if ($this->count($name) !== $this->count($name . self::STAGE) || 0 !== $mismatches) {
                throw new RuntimeException('Copy verification failed for ' . $name . '. Originals and staging tables retained; do not reopen writes.');
            }
            $next = fn (string $table): int => (int) $this->db->scalar('SELECT AUTO_INCREMENT FROM information_schema.TABLES'
                . ' WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s', [$table]);
            if ($next($name . self::STAGE) < $next($name)) {
                throw new RuntimeException('Source ID counter changed during migration: ' . $name . '. Drain all writers before retrying.');
            }
        }
    }

    private function count(string $table): int
    {
        return (int) $this->db->scalar('SELECT COUNT(*) FROM ' . $this->identifier($table));
    }

    private function identifier(string $name): string
    {
        if (!preg_match('/^[a-zA-Z0-9_]{1,64}$/', $name)) {
            throw new RuntimeException('Unsupported SQL identifier: ' . $name);
        }
        return '`' . $name . '`';
    }
}
