<?php

declare(strict_types=1);

namespace Clog\Query;

use Clog\Contract\SignedInUsers;
use Eleph\Runtime\Gateway\EntityGateway;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Policy\ViewerProvider;
use Eleph\Runtime\Query\EntityQuery;
use Eleph\Runtime\Storage\Cursor;
use Eleph\Runtime\Storage\Offset;
use Eleph\Runtime\Storage\Page;
use Eleph\SQLite\Database;

/**
 * @implements EntityQuery<object>
 *
 * Clog has a uniform signed-in read policy, so SQL COUNT is authorized without
 * hydrating every row. Individual returned records still pass through the gateway.
 * If row-specific read policies are introduced, update this query and its counts.
 */
final readonly class SqlEntityQuery implements EntityQuery
{
    public function __construct(
        private Database $db,
        private EntityGateway $gateway,
        private ViewerProvider $viewers,
        private string $entity,
        private string $from,
        private string $where,
        private array $bindings,
        private string $order,
    ) {
    }

    public function count(): int
    {
        return SignedInUsers::allows($this->viewers->viewer())
            ? (int) $this->db->scalar("SELECT COUNT(*) FROM {$this->from} WHERE {$this->where}", $this->bindings)
            : 0;
    }

    public function page(int $limit, ?Cursor $after = null): Page
    {
        if (!SignedInUsers::allows($this->viewers->viewer())) {
            return Page::empty();
        }
        $limit = max(1, min(100, $limit));
        $offset = Offset::fromCursor($after)->value;
        $rows = $this->db->select("SELECT e.id FROM {$this->from} WHERE {$this->where} ORDER BY {$this->order} LIMIT %d OFFSET %d",
            [...$this->bindings, $limit + 1, $offset]);
        $next = count($rows) > $limit ? (new Offset($offset + $limit))->toCursor() : null;
        $entities = [];
        foreach (array_slice($rows, 0, $limit) as $row) {
            $entity = $this->gateway->find($this->entity, EntityId::of((string) $row['id']));
            if (null !== $entity) {
                $entities[] = $entity;
            }
        }
        return new Page($entities, $next);
    }

    public function all(): array
    {
        $all = [];
        $cursor = null;
        do {
            $page = $this->page(100, $cursor);
            array_push($all, ...$page->items);
            $cursor = $page->next;
        } while (null !== $cursor);
        return $all;
    }

    public function first(): ?object
    {
        return $this->page(1)->items[0] ?? null;
    }

    public function exists(): bool
    {
        return $this->count() > 0;
    }
}
