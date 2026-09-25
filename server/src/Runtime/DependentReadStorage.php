<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Eleph\Runtime\Capability\Capabilities;
use Eleph\Runtime\Identity\EntityId;
use Eleph\Runtime\Storage\Criteria;
use Eleph\Runtime\Storage\EdgeFilter;
use Eleph\Runtime\Storage\Page;
use Eleph\Runtime\Storage\Record;
use Eleph\Runtime\Storage\StorageAdaptor;
use Eleph\Runtime\Storage\Write\WriteBatch;
use Eleph\Runtime\Storage\Write\WriteResult;

/**
 * Compatibility for runtime 0.10's DeletionPlanner.
 *
 * It uses EdgeFilter::along while querying the dependent/declaring entity.
 * Inventory.item/location must instead be read backwards to select stock by
 * its foreign key. Otherwise IDs coinciding across tables select unrelated stock.
 * Applied only to the unit-of-work storage, never general application queries.
 * Remove when the upstream planner selects dependents in the correct direction.
 */
final readonly class DependentReadStorage implements StorageAdaptor
{
    public function __construct(private StorageAdaptor $inner)
    {
    }

    public function capabilities(): Capabilities
    {
        return $this->inner->capabilities();
    }

    public function get(string $entity, EntityId $id): ?Record
    {
        return $this->inner->get($entity, $id);
    }

    public function getMany(string $entity, array $ids): array
    {
        return $this->inner->getMany($entity, $ids);
    }

    public function query(Criteria $criteria): Page
    {
        return $this->inner->query($this->dependents($criteria));
    }

    public function count(Criteria $criteria): int
    {
        return $this->inner->count($this->dependents($criteria));
    }

    public function write(WriteBatch $batch): WriteResult
    {
        return $this->inner->write($batch);
    }

    public function transaction(callable $work): mixed
    {
        return $this->inner->transaction($work);
    }

    private function dependents(Criteria $criteria): Criteria
    {
        if ('Inventory' !== $criteria->entity || [] === $criteria->links) {
            return $criteria;
        }

        $fixed = Criteria::for($criteria->entity);
        foreach ($criteria->filters as $filter) {
            $fixed = $fixed->where($filter);
        }
        foreach ($criteria->order as $order) {
            $fixed = $fixed->orderBy($order);
        }
        if (null !== $criteria->limit) {
            $fixed = $fixed->take($criteria->limit, $criteria->after);
        }
        foreach ($criteria->links as $link) {
            if ('Inventory' === $link->entity && !$link->reversed && in_array($link->edge, ['item', 'location'], true)) {
                $link = EdgeFilter::back($link->entity, $link->edge, ...$link->from);
            }
            $fixed = $fixed->linkedTo($link);
        }

        return $fixed;
    }
}
