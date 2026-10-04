<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;

/**
 * One-off v4 seed of the cave stock photographed on 2026-09-28. Delete this class
 * and its call once released; the v4 upgrade then only records the version.
 */
final class CaveInventorySeed
{
    private const LOCATION = 2;
    private const DATE_ADDED = '2026-09-28 00:00:00';
    /** Name, barcode as the scanner reads it (UPC-A has 12 digits), units photographed. */
    private const STOCK = [
        ['Suerte Tequila Blanco', '851738004002', 2],
        ['Tanqueray London Dry Gin 1.75 L', '088110110505', 1],
        ['Taste of the Wild Ancient Stream Dog Food 5 lb', '074198614493', 1],
        ['Kirkland Signature Organic Apple Cider Vinegar 946 mL', '096619307692', 3],
        ['Kirkland Signature Organic Tomato Paste 6 oz', '096619937295', 1],
        ["Campbell's SpaghettiOs with Meatballs", '051000233141', 1],
        ['Natierra Organic Freeze-Dried Bananas 2.5 oz', '812907011085', 2],
        ['WD-40 Multi-Use Product Smart Straw 12 oz', '079567490050', 1],
        ["Burt's Bees for Dogs Oatmeal Shampoo 2-pack", '742797996134', 1],
        ['Gringo Bandito Original Hot Sauce', '794171152506', 2],
        ['Arm & Hammer Pure Baking Soda', null, 1], // The barcode photo is unreadable.
        ['Kirkland Signature Organic Brown Sugar', '096619003716', 1],
        ['Kirkland Signature Organic Cane Sugar 10 lb', '096619635283', 1],
        ['Who Gives A Crap Facial Tissues', '9369999054847', 1],
        ['Alka-Seltzer Original 72 Tablets', '016500546054', 1],
    ];

    /** Runs inside the v4 upgrade transaction. Storage without the cave location is left unchanged. */
    public static function apply(Database $db): void
    {
        $location = $db->scalar('SELECT name FROM app_clog_location WHERE id = ?', [self::LOCATION]);
        if (!is_string($location)) return;
        $now = gmdate('Y-m-d H:i:s');
        foreach (self::STOCK as [$name, $barcode, $units]) {
            // Reuse an item already recorded with this barcode (or, without one, this name).
            $existing = $barcode === null
                ? $db->select('SELECT id, name FROM app_clog_item WHERE barcode IS NULL AND name = ? COLLATE CLOG_NOCASE ORDER BY id LIMIT 1', [$name])
                : $db->select('SELECT id, name FROM app_clog_item WHERE barcode = ? COLLATE CLOG_NOCASE', [$barcode]);
            [$item, $itemName] = $existing
                ? [(int) $existing[0]['id'], $existing[0]['name']]
                : [$db->insert('app_clog_item', ['created_at' => $now, 'updated_at' => $now, 'name' => $name, 'barcode' => $barcode]), $name];
            // Matches the runtime's InventoryDisplayName side effect.
            $label = mb_substr($itemName . ' @ ' . $location, 0, 200);
            for ($unit = 0; $unit < $units; ++$unit) {
                $db->insert('app_clog_inventory', ['created_at' => $now, 'updated_at' => $now, 'name' => $label,
                    'date_added' => self::DATE_ADDED, 'item_id' => $item, 'location_id' => self::LOCATION]);
            }
        }
    }
}
