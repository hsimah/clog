<?php

declare(strict_types=1);

namespace Clog\Query;

use Eleph\Runtime\Gateway\EntityGateway;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Policy\ViewerProvider;
use Eleph\WordPress\Database\Database;
use InvalidArgumentException;

/** Fixed SQL identifiers, parameterized values, and no joins that duplicate entities. */
final readonly class InventoryQueries
{
    public function __construct(private Database $db, private EntityGateway $gateway, private ViewerProvider $viewers)
    {
    }

    public function search(string $entity, ?string $term = null, ?EntityId $location = null, ?EntityId $item = null, bool $stockedOnly = false): SqlEntityQuery
    {
        $prefix = $this->db->prefix();
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $prefix)) {
            throw new InvalidArgumentException('Unsupported table prefix.');
        }
        $tables = [
            'Item' => "`{$prefix}clog_item`",
            'Location' => "`{$prefix}clog_location`",
            'Inventory' => "`{$prefix}clog_inventory`",
        ];
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
                $stockWhere[] = 's.location_id = %s';
                $bindings[] = (string) $location;
            }
            if ('' !== $term) {
                $stockWhere[] = '(e.name LIKE %s OR e.barcode LIKE %s OR l.name LIKE %s)';
                array_push($bindings, $like, $like, $like);
            }
            $where[] = 'EXISTS (SELECT 1 FROM ' . $tables['Inventory'] . ' s INNER JOIN '
                . $tables['Location'] . ' l ON s.location_id = l.id WHERE ' . implode(' AND ', $stockWhere) . ')';
        } elseif ('Inventory' === $entity) {
            $from .= ' INNER JOIN ' . $tables['Item'] . ' i ON e.item_id = i.id'
                . ' INNER JOIN ' . $tables['Location'] . ' l ON e.location_id = l.id';
            if ('' !== $term) {
                $where[] = '(i.name LIKE %s OR i.barcode LIKE %s OR l.name LIKE %s)';
                array_push($bindings, $like, $like, $like);
            }
            foreach (['item' => $item, 'location' => $location] as $edge => $id) {
                if (null !== $id) {
                    $where[] = "e.{$edge}_id = %s";
                    $bindings[] = (string) $id;
                }
            }
        } else {
            if ('' !== $term) {
                $where[] = 'Item' === $entity ? '(e.name LIKE %s OR e.barcode LIKE %s)' : 'e.name LIKE %s';
                $bindings[] = $like;
                if ('Item' === $entity) {
                    $bindings[] = $like;
                }
            }
            $id = 'Item' === $entity ? $location : $item;
            if (null !== $id) {
                $own = 'Item' === $entity ? 'item' : 'location';
                $other = 'Item' === $entity ? 'location' : 'item';
                $where[] = 'EXISTS (SELECT 1 FROM ' . $tables['Inventory'] . " s WHERE s.{$own}_id = e.id AND s.{$other}_id = %s)";
                $bindings[] = (string) $id;
            }
        }
        return new SqlEntityQuery($this->db, $this->gateway, $this->viewers, $entity, $from,
            implode(' AND ', $where), $bindings, 'Inventory' === $entity ? 'e.date_added DESC, e.id ASC' : 'e.name ASC, e.id ASC');
    }
}
