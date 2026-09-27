<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Clog\Runtime\RuntimeFactory;
use Clog\Query\InventoryQueries;
use Eleph\Runtime\Gateway\Runtime;
use Eleph\SQLite\Database;
use Eleph\SQLite\SQLiteAdaptor;
use Eleph\SQLite\Sql\FieldMap;
use Eleph\SQLite\Sql\QueryCompiler;

final readonly class Application
{
    public Runtime $runtime;
    public InventoryQueries $queries;
    public function __construct(public Database $database, public Viewer $viewer)
    {
        Schema::requireReady($database);
        $manifest = (require dirname(__DIR__) . '/manifests/storage.php')->withPrefix($database->prefix());
        $storage = new SQLiteAdaptor($database, $manifest->tables, new FieldMap($manifest->columns), $manifest->placements,
            new QueryCompiler(placements: $manifest->placements));
        $this->runtime = RuntimeFactory::create($storage, $viewer, $database);
        $this->queries = new InventoryQueries($database, $this->runtime, $viewer);
    }
}
