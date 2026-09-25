<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Eleph\WordPress\Database\Database;
use Eleph\WordPress\Manifest\StorageManifest;
use Eleph\WordPress\Migration\MigrationPlan;
use Eleph\WordPress\Migration\SchemaInstaller;
use RuntimeException;

/** Never infer a destructive upgrade from a changed generated manifest. */
final readonly class Tables
{
    private SchemaInstaller $installer;

    public function __construct(private Database $database, StorageManifest $manifest)
    {
        $this->installer = new SchemaInstaller($database, $manifest);
    }

    public function plan(): MigrationPlan
    {
        return $this->installer->plan();
    }

    /** @return list<string> Applied SQL statements. */
    public function install(): array
    {
        $plan = $this->installer->install();
        if (!$plan->isSafe()) {
            throw new RuntimeException($this->describe($plan));
        }

        return $plan->statements;
    }

    public function requireReady(): void
    {
        $plan = $this->plan();
        if (!$plan->isEmpty()) {
            throw new RuntimeException($this->describe($plan));
        }
    }

    /** @return list<string> */
    public function missing(): array
    {
        return array_keys(array_filter(
            $this->installer->tables(),
            fn ($table): bool => [] === $this->database->describeTable($table->name),
        ));
    }

    private function describe(MigrationPlan $plan): string
    {
        if (!$plan->isSafe()) {
            return 'Clog requires an explicit data migration; no schema changes were applied. '
                . implode('; ', array_map(static fn ($refusal): string => $refusal->describe(), $plan->refusals));
        }

        return 'Clog schema is not installed or is out of date. Run wp clog install.';
    }
}
