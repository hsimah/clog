<?php

declare(strict_types=1);

namespace Clog\Query;

use Eleph\Runtime\Gateway\EntityGateway;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Policy\ViewerProvider;
use Eleph\SQLite\Database;
use InvalidArgumentException;

/** Fixed SQL identifiers, parameterized values, and no joins that duplicate entities. */
final readonly class InventoryQueries
{
    /** @var array<string, string> Trusted, quoted names from the generated schema. */
    private array $tables;

    public function __construct(private Database $db, private EntityGateway $gateway, private ViewerProvider $viewers)
    {
        $manifest = require dirname(__DIR__, 2) . '/generated/sqlite/storage-manifest.php';
        $tables = [];
        foreach ($manifest->tables as $entity => $table) {
            $tables[$entity] = Database::identifier($table->name);
        }
        $this->tables = $tables;
    }

    public function search(string $entity, ?string $term = null, ?EntityId $location = null, ?EntityId $item = null, bool $stockedOnly = false): SqlEntityQuery
    {
        $tables = $this->tables;
        if (!isset($tables[$entity])) {
            throw new InvalidArgumentException('Unknown inventory entity.');
        }
        $from = $tables[$entity] . ' e';
        $where = ['1=1'];
        $bindings = [];
        $term = trim($term ?? '');
        $like = '%' . addcslashes(mb_substr($term, 0, 200), '\\%_') . '%';
        if ($stockedOnly && 'Item' !== $entity) {
            throw new InvalidArgumentException('Only items support stocked-only search.');
        }
        if ($stockedOnly) {
            $stockWhere = ['s.item_id = e.id'];
            if (null !== $location) {
                $stockWhere[] = 's.location_id = ?';
                $bindings[] = (string) $location;
            }
            if ('' !== $term) {
                $stockWhere[] = '(e.name LIKE ? ESCAPE \'\\\' OR e.barcode LIKE ? ESCAPE \'\\\' OR l.name LIKE ? ESCAPE \'\\\')';
                array_push($bindings, $like, $like, $like);
            }
            $where[] = 'EXISTS (SELECT 1 FROM ' . $tables['Inventory'] . ' s INNER JOIN '
                . $tables['Location'] . ' l ON s.location_id = l.id WHERE ' . implode(' AND ', $stockWhere) . ')';
        } elseif ('Inventory' === $entity) {
            $from .= ' INNER JOIN ' . $tables['Item'] . ' i ON e.item_id = i.id'
                . ' INNER JOIN ' . $tables['Location'] . ' l ON e.location_id = l.id';
            if ('' !== $term) {
                $where[] = '(i.name LIKE ? ESCAPE \'\\\' OR i.barcode LIKE ? ESCAPE \'\\\' OR l.name LIKE ? ESCAPE \'\\\')';
                array_push($bindings, $like, $like, $like);
            }
            foreach (['item' => $item, 'location' => $location] as $edge => $id) {
                if (null !== $id) {
                    $where[] = "e.{$edge}_id = ?";
                    $bindings[] = (string) $id;
                }
            }
        } else {
            if ('' !== $term) {
                $where[] = 'Item' === $entity ? '(e.name LIKE ? ESCAPE \'\\\' OR e.barcode LIKE ? ESCAPE \'\\\')' : 'e.name LIKE ? ESCAPE \'\\\'';
                $bindings[] = $like;
                if ('Item' === $entity) {
                    $bindings[] = $like;
                }
            }
            $id = 'Item' === $entity ? $location : $item;
            if (null !== $id) {
                $own = 'Item' === $entity ? 'item' : 'location';
                $other = 'Item' === $entity ? 'location' : 'item';
                $where[] = 'EXISTS (SELECT 1 FROM ' . $tables['Inventory'] . " s WHERE s.{$own}_id = e.id AND s.{$other}_id = ?)";
                $bindings[] = (string) $id;
            }
        }
        return new SqlEntityQuery($this->db, $this->gateway, $this->viewers, $entity, $from,
            implode(' AND ', $where), $bindings, 'Inventory' === $entity ? 'e.date_added DESC, e.id ASC' : 'e.name COLLATE CLOG_NOCASE ASC, e.id ASC');
    }
}
