<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$stage = $root . '/build/.standalone-' . bin2hex(random_bytes(6));
$archive = $root . '/build/clog-standalone.tar.gz';

function runCommand(array $command, string $cwd): void
{
    $process = proc_open($command, [0 => STDIN, 1 => STDOUT, 2 => STDERR], $pipes, $cwd);
    if (!is_resource($process) || proc_close($process) !== 0) {
        throw new RuntimeException('Packaging command failed: ' . implode(' ', $command));
    }
}

function copyPath(string $source, string $target): void
{
    if (is_dir($source)) {
        foreach (new DirectoryIterator($source) as $entry) {
            if (!$entry->isDot()) copyPath($entry->getPathname(), $target . '/' . $entry->getFilename());
        }
    } else {
        if (!is_dir(dirname($target))) mkdir(dirname($target), 0755, true);
        if (!copy($source, $target)) throw new RuntimeException('Could not copy ' . $source);
    }
}

try {
    if (!is_file($root . '/client/dist/.vite/manifest.json')) throw new RuntimeException('Build the client first.');
    if (!is_file($root . '/client/dist/assets/stylex.css')) throw new RuntimeException('Missing extracted StyleX stylesheet.');
    mkdir($stage, 0755, true);
    foreach ([
        'server/composer.json', 'server/composer.lock', 'server/generated',
        'server/src/Contract', 'server/src/Query', 'server/src/Runtime/RuntimeFactory.php',
        'server/src/Runtime/Container.php', 'server/src/Runtime/DependentReadStorage.php',
        'server/standalone/bootstrap.php', 'server/standalone/cli.php',
        'server/standalone/src', 'server/standalone/public', 'client/dist', 'hosting',
    ] as $path) {
        copyPath($root . '/' . $path, $stage . '/' . $path);
    }
    // Install from the lock into staging. Never strip or modify the development vendor tree.
    runCommand(['composer', 'install', '--no-dev', '--prefer-dist', '--no-interaction', '--no-scripts', '--no-plugins', '--classmap-authoritative'], $stage . '/server');
    runCommand(['composer', 'check-platform-reqs', '--no-dev'], $stage . '/server');
    runCommand(['tar', '-czf', $archive, 'server', 'client', 'hosting'], $stage);
} finally {
    if (is_dir($stage)) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($stage, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($files as $file) {
            $file->isDir() && !$file->isLink() ? rmdir($file->getPathname()) : unlink($file->getPathname());
        }
        rmdir($stage);
    }
}
