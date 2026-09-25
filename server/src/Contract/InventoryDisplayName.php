<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Inventory\Contract\InventoryDisplayNameSideEffect;
use Clog\Entity\Inventory\Inventory;
use Clog\Entity\Inventory\InventoryPreCommitContext;
use Clog\Entity\Item\Item;
use Clog\Entity\Location\Location;
use DomainException;
use Eleph\Runtime\Gateway\EntityGateway;
use Eleph\Runtime\Identity\EntityId;

/** Resolve both relationships before any field or edge is written. */
final readonly class InventoryDisplayName implements InventoryDisplayNameSideEffect
{
    public function __construct(private EntityGateway $gateway)
    {
    }

    public function handle(InventoryPreCommitContext $context): void
    {
        $original = $context->originalEntity();
        $itemId = $context->isItemChanged()
            ? $context->pendingItem()
            : ($original instanceof Inventory ? $original->getItem()?->getId() : null);
        $locationId = $context->isLocationChanged()
            ? $context->pendingLocation()
            : ($original instanceof Inventory ? $original->getLocation()?->getId() : null);

        if (!$itemId instanceof EntityId || !$locationId instanceof EntityId) {
            throw new DomainException('Inventory requires an existing item and location.');
        }

        $item = $this->gateway->find('Item', $itemId);
        $location = $this->gateway->find('Location', $locationId);
        if (!$item instanceof Item || !$location instanceof Location) {
            throw new DomainException('The inventory item or location does not exist.');
        }

        $context->setName(mb_substr($item->getName() . ' @ ' . $location->getName(), 0, 200));
    }
}

