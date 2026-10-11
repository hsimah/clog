<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;
use GraphQL\GraphQL as Executor;
use GraphQL\Validator\DocumentValidator;
use GraphQL\Validator\Rules\{QueryDepth, QueryComplexity};

final class InitialRouteData
{
    public static function execute(Database $db, Viewer $viewer, string $text, array $variables, string $operation): array
    {
        return Executor::executeQuery(
            GraphQL::schema(new Application($db, $viewer)), $text, variableValues: $variables,
            operationName: $operation,
            validationRules: [...DocumentValidator::allRules(), new QueryDepth(12), new QueryComplexity(500)],
        )->toArray();
    }
}
