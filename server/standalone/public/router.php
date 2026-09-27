<?php
// Development only. Production nginx serves assets directly and runs index.php.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($path, '/assets/')) {
    $root = realpath(dirname(__DIR__, 3) . '/client/dist/assets');
    $file = realpath($root . '/' . substr($path, strlen('/assets/')));
    if ($root && $file && str_starts_with($file, $root . '/') && is_file($file)) {
        $type = match (pathinfo($file, PATHINFO_EXTENSION)) {'js'=>'text/javascript','css'=>'text/css','png'=>'image/png','svg'=>'image/svg+xml','woff2'=>'font/woff2', default=>'application/octet-stream'};
        header('Content-Type: ' . $type); readfile($file); return;
    }
    http_response_code(404); return;
}
require __DIR__ . '/index.php';
