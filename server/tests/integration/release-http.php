<?php

$html = file_get_contents('/tmp/clog-release.html');
$assets = clog_get_vite_assets();
if (!str_contains($html, 'id="root"') || !str_contains($html, 'id="clog-config"') || !str_contains($html, 'type="module"') || !str_contains($html, 'stylex.css?ver=')) {
    throw new RuntimeException('The installed ZIP did not serve its authenticated React shell.');
}
foreach (array_merge([$assets['js']], $assets['css']) as $asset) {
    $url = plugins_url('dist/' . $asset, CLOG_PLUGIN_DIR . 'clog.php');
    if (!str_contains($html, esc_url($url))) throw new RuntimeException('Missing compiled asset in deep-route HTML: ' . $asset);
    echo $url . "\n";
}
foreach (['clog.png', 'clog-white.png'] as $asset) {
    $url = plugins_url('assets/' . $asset, CLOG_PLUGIN_DIR . 'clog.php');
    if (!str_contains($html, esc_url($url))) throw new RuntimeException('Missing favicon in deep-route HTML.');
    echo $url . "\n";
}
