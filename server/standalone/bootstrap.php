<?php

declare(strict_types=1);

// Deliberately independent of Composer and the WordPress plugin autoloader.
spl_autoload_register(static function (string $class): void {
    $prefixes = [
        'Eleph\\SQLite\\' => __DIR__ . '/vendor/elephentity/sqlite/src/',
        'Eleph\\GraphQL\\' => __DIR__ . '/vendor/elephentity/graphql/src/',
        'Eleph\\Runtime\\' => __DIR__ . '/vendor/elephentity/runtime/src/',
        'GraphQL\\' => __DIR__ . '/vendor/webonyx/graphql-php/src/',
        'Psr\\Log\\' => __DIR__ . '/vendor/psr/log/src/',
        'Psr\\Container\\' => __DIR__ . '/vendor/psr/container/src/',
        'Clog\\Standalone\\' => __DIR__ . '/src/',
        'Clog\\Entity\\' => dirname(__DIR__) . '/generated/',
        'Clog\\Type\\' => dirname(__DIR__) . '/src/Type/',
        'Clog\\' => dirname(__DIR__) . '/src/',
    ];
    foreach ($prefixes as $prefix => $path) {
        if (str_starts_with($class, $prefix)) {
            $file = $path . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
            if (is_file($file)) require $file;
            return;
        }
    }
});
date_default_timezone_set('UTC');
