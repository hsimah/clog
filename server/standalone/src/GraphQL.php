<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\GraphQL\SchemaBuilder;
use Eleph\GraphQL\Registration\{TypeRegistrar, MutationRegistrar};
use Eleph\GraphQL\Relay\GlobalId;
use Eleph\Runtime\Identity\EntityId;
use GraphQL\Error\UserError;
use GraphQL\Type\Schema;

final class GraphQL
{
    public static function id(mixed $value, string $type): ?EntityId
    {
        if ($value === null) return null;
        $decoded = GlobalId::decode((string) $value);
        if ($decoded && $decoded->type !== $type) throw new UserError('Expected an ID for ' . $type . '.');
        $raw = $decoded?->id ?? (string) $value;
        if (!preg_match('/^[1-9][0-9]*$/D', $raw)) throw new UserError('Invalid entity ID.');
        return EntityId::of($raw);
    }

    public static function schema(Application $app): Schema
    {
        $manifest = require dirname(__DIR__, 2) . '/generated/graphql/graphql-manifest.php';
        $builder = new SchemaBuilder();
        $registrar = new TypeRegistrar($manifest, $app->runtime);
        $builder->interface('Node', ['id' => ['type' => ['non_null' => 'ID']]], static function ($node) use ($builder, $manifest) {
            foreach ($manifest->objects as $object) {
                $class = 'Clog\\Entity\\' . $object->entity . '\\' . $object->entity;
                if ($node instanceof $class) return $builder->type($object->name);
            }
            return null;
        });
        $builder->object('PageInfo', ['fields' => [
            'hasNextPage' => ['type' => ['non_null' => 'Boolean']], 'hasPreviousPage' => ['type' => ['non_null' => 'Boolean']],
            'startCursor' => ['type' => 'String'], 'endCursor' => ['type' => 'String'],
        ]]);
        foreach ($registrar->enumConfigs() as $name => $config) $builder->enum($name, $config);
        foreach ($registrar->objectConfigs() as $name => $config) $builder->object($name, $config);
        foreach ($registrar->rootFieldConfigs() as $config) {
            $entity = substr($config['field']['type'], 4); $type = $config['field']['type'];
            $config['field']['resolve'] = fn ($source, $args) => $app->runtime->find($entity, self::id($args['id'], $type));
            $builder->field('RootQuery', $config['name'], $config['field']);
        }
        foreach ($registrar->connectionConfigs() as $config) {
            $resolve = $config['resolve'];
            $config['resolve'] = static function ($source, array $args) use ($resolve) {
                if (isset($args['last']) || isset($args['before'])) throw new UserError('Only forward pagination is supported.');
                if (isset($args['first']) && ($args['first'] < 1 || $args['first'] > 100)) throw new UserError('first must be between 1 and 100.');
                if (isset($args['after']) && !preg_match('/^offset:[0-9]+$/D', base64_decode($args['after'], true) ?: '')) throw new UserError('Invalid pagination cursor.');
                $filters = $args['where'] ?? [];
                foreach (['item' => 'ClogItem', 'location' => 'ClogLocation'] as $field => $type) {
                    if (isset($filters[$field])) $filters[$field] = self::id($filters[$field], $type);
                }
                return $resolve($source, array_replace($args, $filters));
            };
            $builder->connection($config);
        }
        foreach ((new MutationRegistrar($manifest, $app->runtime))->configs() as $name => $config) {
            $mutate = $config['mutateAndGetPayload'];
            $config['mutateAndGetPayload'] = static function (array $input) use ($mutate, $name): array {
                preg_match('/Clog(Item|Location|Inventory)$/', $name, $match);
                foreach (['id' => 'Clog' . $match[1], 'item' => 'ClogItem', 'location' => 'ClogLocation'] as $field => $type) {
                    if (isset($input[$field])) self::id($input[$field], $type);
                }
                return $mutate($input);
            };
            $builder->mutation($name, $config);
        }
        $builder->field('RootQuery', 'node', ['type' => 'Node', 'args' => ['id' => ['type' => ['non_null' => 'ID']]], 'resolve' => static function ($source, $args) use ($app, $manifest) {
            $id = GlobalId::decode($args['id']);
            if (!$id || !isset($manifest->objects[$id->type])) throw new UserError('Invalid node ID.');
            return $app->runtime->find($manifest->objects[$id->type]->entity, self::id($args['id'], $id->type));
        }]);
        $builder->object('ClogSummary', ['fields' => array_fill_keys(['items','locations','inventory'], ['type' => ['non_null' => 'Int']])]);
        $builder->field('RootQuery', 'clogSummary', ['type' => 'ClogSummary', 'resolve' => fn () => !$app->viewer->isAuthenticated() ? null : [
            'items' => $app->queries->search('Item')->count(), 'locations' => $app->queries->search('Location')->count(), 'inventory' => $app->queries->search('Inventory')->count(),
        ]]);
        foreach (['ClogItem' => 'location', 'ClogLocation' => 'item'] as $type => $filter) {
            $builder->field($type, 'stockCount', ['type' => ['non_null' => 'Int'], 'args' => [$filter => ['type' => 'ID']], 'resolve' => static function ($node, $args) use ($app, $filter) {
                $id = self::id($args[$filter] ?? null, 'Clog' . ucfirst($filter));
                return $app->queries->search('Inventory', location: $filter === 'location' ? $id : $node->getId(), item: $filter === 'item' ? $id : $node->getId())->count();
            }]);
        }
        $builder->object('ClogUser', ['fields' => [
            'id' => ['type' => ['non_null' => 'ID'], 'resolve' => fn (User $user) => GlobalId::encode('ClogUser', $user->id)],
        ]]);
        $builder->mutation('changeClogUserPassword', [
            'inputFields' => [
                'id' => ['type' => ['non_null' => 'ID']],
                'currentPassword' => ['type' => ['non_null' => 'String']],
                'newPassword' => ['type' => ['non_null' => 'String']],
            ],
            'outputFields' => ['clogUser' => ['type' => ['non_null' => 'ClogUser']]],
            'mutateAndGetPayload' => static function (array $input) use ($app): array {
                $user = new User((string) self::id($input['id'], 'ClogUser'));
                $user->changePassword($app->database, $app->viewer, $input['currentPassword'], $input['newPassword']);
                return ['clogUser' => $user];
            },
        ]);
        return $builder->build();
    }
}
