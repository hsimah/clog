<?php

declare(strict_types=1);

use Clog\Runtime\Tables;
use Eleph\WordPress\Database\Database;
use Eleph\WordPress\WordPress;
use PHPUnit\Framework\TestCase;

final class TablesTest extends TestCase
{
    public function testLegacyProjectionSchemaIsRefusedWithoutWritingAnything(): void
    {
        $database = $this->createMock(Database::class);
        $database->method('prefix')->willReturn('test_');
        $manifest = WordPress::manifest(__DIR__ . '/../../generated/wordpress/storage-manifest.php');
        $columns = [];
        $indexes = [];
        foreach ($manifest->withPrefix('test_')->everyTable() as $name => $table) {
            foreach ($table->columns as $column) {
                $columns[$name][] = [
                    'Field' => $column->name,
                    'Type' => $column->type,
                    'Null' => $column->nullable ? 'YES' : 'NO',
                    'Key' => $column->name === $table->primaryKey ? 'PRI' : '',
                    'Default' => $column->default,
                    'Extra' => $column->autoIncrement ? 'auto_increment' : '',
                ];
            }
            $columns[$name][] = [
                'Field' => 'post_id', 'Type' => 'BIGINT UNSIGNED', 'Null' => 'NO',
                'Key' => '', 'Default' => null, 'Extra' => '',
            ];
            foreach ($table->indexes as $index) {
                foreach ($index->columns as $column) {
                    $indexes[$name][] = ['Key_name' => $index->name, 'Column_name' => $column, 'Non_unique' => $index->unique ? 0 : 1];
                }
            }
        }
        $database->method('describeTable')->willReturnCallback(static fn ($name) => $columns[$name] ?? []);
        $database->method('describeIndexes')->willReturnCallback(static fn ($name) => $indexes[$name] ?? []);
        $database->expects(self::never())->method('execute');
        $tables = new Tables($database, $manifest);
        self::assertFalse($tables->plan()->isSafe());
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('wp clog migration status');
        $tables->install();
    }

    public function testMissingSchemaCannotBootTheRuntime(): void
    {
        $database = $this->createMock(Database::class);
        $database->method('prefix')->willReturn('test_');
        $database->method('describeTable')->willReturn([]);
        $database->expects(self::never())->method('execute');
        $tables = new Tables($database, WordPress::manifest(__DIR__ . '/../../generated/wordpress/storage-manifest.php'));
        self::assertCount(3, $tables->missing());
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('wp clog install');
        $tables->requireReady();
    }
}
