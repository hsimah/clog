<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Inventory\Contract\InventorySearchQuery;
use Clog\Query\InventoryQueries;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Query\EntityQuery;

final readonly class InventorySearch implements InventorySearchQuery
{
    public function __construct(private InventoryQueries $queries) {}

    public function find(?string $term = null, ?EntityId $location = null, ?EntityId $item = null): EntityQuery
    {
        return $this->queries->search('Inventory', $term, $location, $item);
    }
}
