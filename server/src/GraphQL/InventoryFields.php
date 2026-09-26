<?php

declare(strict_types=1);

namespace Clog\GraphQL;

use Clog\Contract\SignedInUsers;
use Clog\Query\InventoryQueries;
use Eleph\Runtime\Identity\EntityId;
use Eleph\WordPress\Viewer\WordPressViewerProvider;
use Eleph\WPGraphQL\Relay\GlobalId;
use GraphQL\Error\UserError;

/** Application aggregates complement the generated entity and search contracts. */
final readonly class InventoryFields
{
    public function __construct(private InventoryQueries $queries) {}

    /** Bridge `where` and typed IDs to the locked Elephentity query contracts. */
    public static function connectionConfig(array $config): array
    {
        if ('RootQuery' !== ($config['fromType'] ?? '') || !in_array($config['fromFieldName'] ?? '',
            ['clogItemSearch', 'clogStockedItems', 'clogLocationSearch', 'clogInventorySearch'], true)) {
            return $config;
        }
        $resolve = $config['resolve'];
        $config['resolve'] = static function ($source, array $args, $context, $info) use ($resolve): array {
            if (isset($args['last']) || isset($args['before'])) {
                throw new UserError('Clog search supports forward pagination with first/after.');
            }
            if (isset($args['first']) && ($args['first'] < 1 || $args['first'] > 100)) {
                throw new UserError('first must be between 1 and 100.');
            }
            if (isset($args['after'])) {
                $decoded = base64_decode($args['after'], true);
                if (!is_string($decoded) || !preg_match('/^offset:\d+$/', $decoded)) {
                    throw new UserError('Invalid Clog pagination cursor.');
                }
            }
            $filters = $args['where'] ?? [];
            foreach (['location' => 'ClogLocation', 'item' => 'ClogItem'] as $field => $type) {
                if (isset($filters[$field])) {
                    // Runtime 0.10 orders query arguments but does not decode IDs
                    // into the EntityId required by generated finder signatures.
                    $filters[$field] = self::id($filters[$field], $type);
                }
            }
            return $resolve($source, array_replace($args, $filters), $context, $info);
        };
        return $config;
    }

    public function register(): void
    {
        register_graphql_object_type('ClogSummary', ['fields' => [
            'items' => ['type' => ['non_null' => 'Int']],
            'locations' => ['type' => ['non_null' => 'Int']],
            'inventory' => ['type' => ['non_null' => 'Int']],
        ]]);
        register_graphql_field('RootQuery', 'clogSummary', [
            'type' => 'ClogSummary',
            'description' => 'Authoritative catalogue and stock totals, independent of loaded pages.',
            'resolve' => function (): ?array {
                if (!SignedInUsers::allows((new WordPressViewerProvider())->viewer())) {
                    return null;
                }
                return [
                    'items' => $this->queries->search('Item')->count(),
                    'locations' => $this->queries->search('Location')->count(),
                    'inventory' => $this->queries->search('Inventory')->count(),
                ];
            },
        ]);
        register_graphql_field('ClogItem', 'stockCount', [
            'type' => ['non_null' => 'Int'],
            'args' => ['location' => ['type' => 'ID']],
            'description' => 'All stocked units of this item, optionally restricted to one location.',
            'resolve' => fn ($item, array $args): int => $this->queries->search('Inventory',
                location: self::id($args['location'] ?? null, 'ClogLocation'), item: $item->getId())->count(),
        ]);
        register_graphql_field('ClogLocation', 'stockCount', [
            'type' => ['non_null' => 'Int'],
            'args' => ['item' => ['type' => 'ID']],
            'description' => 'All stocked units at this location, optionally restricted to one item.',
            'resolve' => fn ($location, array $args): int => $this->queries->search('Inventory',
                location: $location->getId(), item: self::id($args['item'] ?? null, 'ClogItem'))->count(),
        ]);
    }

    private static function id(mixed $value, string $type): ?EntityId
    {
        if (null === $value) return null;
        $decoded = is_string($value) ? GlobalId::decode($value) : null;
        if (null !== $decoded && $type !== $decoded->type) {
            throw new UserError('Expected an ID for ' . $type . '.');
        }
        $id = GlobalId::entityId($value);
        if (null === $id) throw new UserError('Invalid entity ID.');
        return $id;
    }
}
