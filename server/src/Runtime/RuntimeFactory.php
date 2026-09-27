<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Clog\Contract\InventoryDisplayName;
use Clog\Contract\SignedInUsers;
use Clog\Contract\StaffMayWrite;
use Clog\Entity\Catalogue;
use Clog\Entity\Inventory\Contract\InventoryDisplayNameSideEffect;
use Clog\Entity\Pattern\ClogPost\Contract\ClogPostSignedInReadPolicy;
use Clog\Entity\Pattern\ClogPost\Contract\ClogPostStaffWritePolicy;
use Eleph\Runtime\Catalogue\BootCheck;
use Eleph\Runtime\Gateway\Runtime;
use Eleph\Runtime\Gateway\UnitOfWorkFactory;
use Eleph\Runtime\Policy\ReadGate;
use Eleph\Runtime\Policy\ViewerProvider;
use Eleph\Runtime\Policy\WriteGate;
use Eleph\Runtime\Storage\StorageAdaptor;
use Eleph\Runtime\Type\NullProcessorRegistry;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

/** The same generated contracts and write path serve HTTP, CLI and tests. */
final class RuntimeFactory
{
    public static function create(
        StorageAdaptor $storage,
        ViewerProvider $viewers,
        \Eleph\SQLite\Database $database,
        LoggerInterface $logger = new NullLogger(),
    ): Runtime {
        $container = new Container();
        $catalogue = new Catalogue($container);
        $runtime = new Runtime(
            $storage,
            $catalogue,
            new UnitOfWorkFactory($storage, $catalogue, new NullProcessorRegistry(), $logger),
            new ReadGate($catalogue, $viewers, $logger),
            new WriteGate($catalogue, $viewers),
        );

        $container->set(ClogPostSignedInReadPolicy::class, new SignedInUsers());
        $container->set(ClogPostStaffWritePolicy::class, new StaffMayWrite());
        $container->set(InventoryDisplayNameSideEffect::class, new InventoryDisplayName($runtime));
        $queries = new \Clog\Query\InventoryQueries($database, $runtime, $viewers);
        $container->set(\Clog\Entity\Item\Contract\ItemSearchQuery::class, new \Clog\Contract\ItemSearch($queries));
        $container->set(\Clog\Entity\Item\Contract\ItemStockedQuery::class, new \Clog\Contract\ItemStocked($queries));
        $container->set(\Clog\Entity\Location\Contract\LocationSearchQuery::class, new \Clog\Contract\LocationSearch($queries));
        $container->set(\Clog\Entity\Inventory\Contract\InventorySearchQuery::class, new \Clog\Contract\InventorySearch($queries));
        (new BootCheck($catalogue, $container))->run();

        return $runtime;
    }
}
