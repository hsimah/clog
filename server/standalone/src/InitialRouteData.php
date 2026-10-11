<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;
use GraphQL\GraphQL as Executor;
use GraphQL\Validator\DocumentValidator;
use GraphQL\Validator\Rules\{QueryDepth, QueryComplexity};

final class InitialRouteData
{
    public static function execute(Database $db, Viewer $viewer, string $text, array $variables, string $operation): ?array
    {
        $started = hrtime(true);
        $busyTimeout = (int) $db->scalar('PRAGMA busy_timeout');
        $db->execute('PRAGMA busy_timeout = 250');
        try {
            $result = Executor::executeQuery(
                GraphQL::schema(new Application($db, $viewer)), $text, variableValues: $variables,
                operationName: $operation,
                validationRules: [...DocumentValidator::allRules(), new QueryDepth(12), new QueryComplexity(500)],
            )->toArray();
            // PDO cannot interrupt a running query; late results fall back to client loading.
            return hrtime(true) - $started <= 500_000_000 ? $result : null;
        } finally {
            $db->execute('PRAGMA busy_timeout = ' . $busyTimeout);
        }
    }
}
