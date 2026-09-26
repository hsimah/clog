<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Item\Contract\ItemStockedQuery;
use Clog\Query\InventoryQueries;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Query\EntityQuery;

final readonly class ItemStocked implements ItemStockedQuery
{
    public function __construct(private InventoryQueries $queries) {}

    public function find(?string $term = null, ?EntityId $location = null): EntityQuery
    {
        return $this->queries->search('Item', $term, $location, stockedOnly: true);
    }
}
