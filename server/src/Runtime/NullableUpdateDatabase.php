<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Eleph\WordPress\Database\Database;
use LogicException;

/**
 * WordPress adapter 0.2.3 binds every update value to %s. wpdb turns a null
 * binding into an empty string, unlike its insert() API. Preserve SQL NULL for
 * the adapter's exact generated UPDATE shape until this is fixed upstream.
 * Identifiers stay in the generated SQL; all non-null values remain bound.
 */
final readonly class NullableUpdateDatabase implements Database
{
    public function __construct(private Database $inner)
    {
    }

    public function execute(string $sql, array $bindings = []): int
    {
        if (in_array(null, $bindings, true) && preg_match(
            '/^(UPDATE `[A-Za-z0-9_]+` SET )(`[A-Za-z0-9_]+` = %s(?:, `[A-Za-z0-9_]+` = %s)*)( WHERE `id` = %d)$/D',
            $sql,
            $match,
        )) {
            $assignments = explode(', ', $match[2]);
            if (count($bindings) !== count($assignments) + 1 || null === $bindings[array_key_last($bindings)]) {
                throw new LogicException('Unexpected nullable update bindings.');
            }
            $values = [];
            foreach ($assignments as $index => $assignment) {
                if (null === $bindings[$index]) {
                    $assignments[$index] = str_replace('%s', 'NULL', $assignment);
                } else {
                    $values[] = $bindings[$index];
                }
            }
            $values[] = $bindings[array_key_last($bindings)];
            return $this->inner->execute($match[1] . implode(', ', $assignments) . $match[3], $values);
        }
        return $this->inner->execute($sql, $bindings);
    }

    public function prefix(): string { return $this->inner->prefix(); }
    public function select(string $sql, array $bindings = []): array { return $this->inner->select($sql, $bindings); }
    public function scalar(string $sql, array $bindings = []): string|int|float|null { return $this->inner->scalar($sql, $bindings); }
    public function insert(string $table, array $values): int { return $this->inner->insert($table, $values); }
    public function beginTransaction(): void { $this->inner->beginTransaction(); }
    public function commit(): void { $this->inner->commit(); }
    public function rollBack(): void { $this->inner->rollBack(); }
    public function describeTable(string $table): array { return $this->inner->describeTable($table); }
    public function describeIndexes(string $table): array { return $this->inner->describeIndexes($table); }
    public function tablesWithPrefix(string $prefix): array { return $this->inner->tablesWithPrefix($prefix); }
}
