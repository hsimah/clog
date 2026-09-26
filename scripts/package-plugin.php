<?php

declare(strict_types=1);

// The staging directory is disposable build output, never the working vendor tree.
$root = dirname(__DIR__);
$stage = $root . '/build/plugin/clog';
function removeBuildDirectory(string $path): void {
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    if (!is_dir($path)) return;
    foreach (new DirectoryIterator($path) as $entry) {
        if (!$entry->isDot()) removeBuildDirectory($entry->getPathname());
    }
    rmdir($path);
}
function copyRuntime(string $source, string $target): void {
    if (is_link($source)) throw new RuntimeException('Runtime source must not contain symlinks: ' . $source);
    if (is_dir($source)) {
        if (!is_dir($target)) mkdir($target, 0777, true);
        foreach (new DirectoryIterator($source) as $entry) {
            if (!$entry->isDot()) copyRuntime($entry->getPathname(), $target . '/' . $entry->getFilename());
        }
    } elseif (!copy($source, $target)) {
        throw new RuntimeException('Could not copy ' . $source);
    }
}
if ('prepare' === ($argv[1] ?? '')) {
    $version = $argv[2] ?? '';
    if ('' !== $version && !preg_match('/^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/D', $version)) {
        throw new InvalidArgumentException('Expected a semantic release version.');
    }
    if (!is_file($root . '/client/dist/.vite/manifest.json')) throw new RuntimeException('Build the client before packaging.');
    removeBuildDirectory($stage);
    mkdir($stage, 0777, true);
    foreach (['clog.php', 'composer.json', 'composer.lock', 'includes', 'src', 'generated', 'migrations', 'templates', 'assets', 'docs'] as $path) {
        copyRuntime($root . '/server/' . $path, $stage . '/' . $path);
    }
    copyRuntime($root . '/client/dist', $stage . '/dist');
    if ('' !== $version) {
        $plugin = file_get_contents($stage . '/clog.php');
        $plugin = preg_replace('/^ \* Version: .*$/m', ' * Version: ' . $version, $plugin, 1, $count);
        if (1 !== $count) throw new RuntimeException('Plugin version header missing.');
        file_put_contents($stage . '/clog.php', $plugin);
    }
    echo "Prepared production plugin staging directory.\n";
    exit;
}
if ('archive' !== ($argv[1] ?? '')) throw new InvalidArgumentException('Use prepare or archive.');
require $stage . '/vendor/autoload.php';
foreach (['elephentity/cli', 'elephentity/codegen', 'phpunit/phpunit'] as $package) {
    if (Composer\InstalledVersions::isInstalled($package)) throw new RuntimeException('Development package in release: ' . $package);
}
foreach (['vendor/autoload.php', 'generated/Catalogue.php', 'generated/wordpress/storage-manifest.php', 'generated/wpgraphql/graphql-manifest.php', 'migrations/v1-storage.php', 'dist/assets/stylex.css'] as $path) {
    if (!is_file($stage . '/' . $path)) throw new RuntimeException('Missing release file: ' . $path);
}
$manifest = json_decode(file_get_contents($stage . '/dist/.vite/manifest.json'), true, flags: JSON_THROW_ON_ERROR);
if (empty($manifest['index.html']['isEntry'])) throw new RuntimeException('Client entry point missing.');
foreach ($manifest as $entry) {
    foreach (array_merge([$entry['file']], $entry['css'] ?? [], $entry['assets'] ?? []) as $path) {
        if (!is_file($stage . '/dist/' . $path)) throw new RuntimeException('Missing built asset: ' . $path);
    }
}
$zip = new ZipArchive();
$archive = $root . '/build/clog.zip';
if (true !== $zip->open($archive, ZipArchive::CREATE | ZipArchive::OVERWRITE)) throw new RuntimeException('Could not create release ZIP.');
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($stage, FilesystemIterator::SKIP_DOTS)) as $entry) {
    if ($entry->isLink()) throw new RuntimeException('Symlink in release: ' . $entry->getPathname());
    if (!$entry->isFile()) continue;
    $relative = substr($entry->getPathname(), strlen($stage) + 1);
    if (!$zip->addFile($entry->getPathname(), 'clog/' . $relative)) throw new RuntimeException('Could not archive ' . $relative);
}
$zip->close();
echo 'Built build/clog.zip (SHA256 ' . hash_file('sha256', $archive) . ").\n";
