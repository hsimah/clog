<?php

function releaseCheck(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
    WP_CLI::log('PASS ' . $message);
}
releaseCheck(!is_dir(CLOG_PLUGIN_DIR . 'spec') && !is_dir(CLOG_PLUGIN_DIR . 'tests'), 'ZIP has no source specs or test harness dependency');
$installed = json_decode(file_get_contents(CLOG_PLUGIN_DIR . 'vendor/composer/installed.json'), true, flags: JSON_THROW_ON_ERROR);
$packageNames = array_column($installed['packages'], 'name');
foreach (['elephentity/cli', 'elephentity/codegen', 'phpunit/phpunit'] as $package) {
    releaseCheck(!in_array($package, $packageNames, true), 'production runtime boots without ' . $package);
}
$assets = clog_get_vite_assets();
releaseCheck('' !== $assets['js'] && is_file(CLOG_PLUGIN_DIR . 'dist/' . $assets['js']), 'ZIP includes the manifest entry module');
releaseCheck(count($assets['css']) >= 2, 'ZIP includes app CSS and separately extracted StyleX CSS');
foreach ($assets['css'] as $asset) {
    releaseCheck(is_file(CLOG_PLUGIN_DIR . 'dist/' . explode('?', $asset)[0]), 'stylesheet is packaged: ' . $asset);
}
$result = graphql(['query' => '{ clogSummary { items locations inventory } clogStockedItems(first: 1) { totalCount nodes { id stockCount } } }']);
releaseCheck(empty($result['errors']) && $result['data']['clogSummary']['inventory'] > 0, 'ZIP serves the current GraphQL contract with stored stock');
releaseCheck(!str_contains(file_get_contents(CLOG_PLUGIN_DIR . 'vendor/composer/installed.json'), '"type": "path"'), 'production packages contain no local path repositories');
WP_CLI::success('Production plugin ZIP verified.');
