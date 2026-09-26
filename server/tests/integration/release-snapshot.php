<?php

// This fixture intentionally snapshots complete stored rows, IDs and relationships.
if ('clog_test' !== DB_NAME || 'http://clog.test' !== get_option('home')) throw new RuntimeException('Not the disposable release test database.');
global $wpdb;
$rows = [];
foreach (['item', 'location', 'inventory'] as $table) {
    $name = $wpdb->prefix . 'clog_' . $table;
    $rows[$table] = $wpdb->get_results("SELECT * FROM `$name` ORDER BY id", ARRAY_A);
}
echo wp_json_encode($rows, JSON_PRETTY_PRINT) . "\n";
