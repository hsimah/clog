<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Location\Contract\LocationSearchQuery;
use Clog\Query\InventoryQueries;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Query\EntityQuery;

final readonly class LocationSearch implements LocationSearchQuery
{
    public function __construct(private InventoryQueries $queries) {}

    public function find(?string $term = null, ?EntityId $item = null): EntityQuery
    {
        return $this->queries->search('Location', $term, item: $item);
    }
}
