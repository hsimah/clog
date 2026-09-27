<?php

declare(strict_types=1);

/* Experimental standalone snapshot; maintained here until upstream codegen supports this target. */

namespace Eleph\SQLite\Manifest;

use Eleph\SQLite\Sql\Column;
use Eleph\SQLite\Sql\EdgePlacement;
use Eleph\SQLite\Sql\Index;
use Eleph\SQLite\Sql\TableSchema;
use Eleph\Runtime\Storage\RelationKind;

/**
 * The compiled physical schema.
 *
 * Loaded at boot and handed to the adaptor as-is. Nothing here is worked out
 * per request; the spec decided all of it.
 */
return new StorageManifest(
    tables: [
        'Inventory' => new TableSchema(
            'clog_inventory',
            [
                'id' => new Column('id', 'BIGINT UNSIGNED', false, true, null),
                'created_at' => new Column('created_at', 'DATETIME', false, false, null),
                'updated_at' => new Column('updated_at', 'DATETIME', false, false, null),
                'name' => new Column('name', 'VARCHAR(200)', false, false, null),
                'date_added' => new Column('date_added', 'DATETIME', false, false, null),
                'item_id' => new Column('item_id', 'BIGINT UNSIGNED', true, false, null),
                'location_id' => new Column('location_id', 'BIGINT UNSIGNED', true, false, null),
            ],
            [
                'clog_inventory_item_id_idx' => new Index('clog_inventory_item_id_idx', ['item_id'], false),
                'clog_inventory_location_id_idx' => new Index('clog_inventory_location_id_idx', ['location_id'], false),
            ],
            'id',
        ),
        'Item' => new TableSchema(
            'clog_item',
            [
                'id' => new Column('id', 'BIGINT UNSIGNED', false, true, null),
                'created_at' => new Column('created_at', 'DATETIME', false, false, null),
                'updated_at' => new Column('updated_at', 'DATETIME', false, false, null),
                'name' => new Column('name', 'VARCHAR(200)', false, false, null),
                'barcode' => new Column('barcode', 'VARCHAR(64)', true, false, null),
            ],
            [
                'clog_item_name_idx' => new Index('clog_item_name_idx', ['name'], false),
                'clog_item_barcode_uniq' => new Index('clog_item_barcode_uniq', ['barcode'], true),
            ],
            'id',
        ),
        'Location' => new TableSchema(
            'clog_location',
            [
                'id' => new Column('id', 'BIGINT UNSIGNED', false, true, null),
                'created_at' => new Column('created_at', 'DATETIME', false, false, null),
                'updated_at' => new Column('updated_at', 'DATETIME', false, false, null),
                'name' => new Column('name', 'VARCHAR(200)', false, false, null),
            ],
            [
                'clog_location_name_uniq' => new Index('clog_location_name_uniq', ['name'], true),
            ],
            'id',
        ),
    ],
    placements: [
        'Inventory.item' => new EdgePlacement(
            'Inventory',
            'item',
            'Item',
            RelationKind::ManyToOne,
            'clog_inventory',
            'item_id',
            null,
            'clog_item',
        ),
        'Inventory.location' => new EdgePlacement(
            'Inventory',
            'location',
            'Location',
            RelationKind::ManyToOne,
            'clog_inventory',
            'location_id',
            null,
            'clog_location',
        ),
    ],
    columns: [
        'Inventory' => ['createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'name' => 'name', 'dateAdded' => 'date_added'],
        'Item' => ['createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'name' => 'name', 'barcode' => 'barcode'],
        'Location' => ['createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'name' => 'name'],
    ],
    joinTables: [

    ],
);
