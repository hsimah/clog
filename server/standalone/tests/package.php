<?php
// Test the release in a new process so the checkout's autoloader cannot hide omissions.
$root = dirname(__DIR__, 3);
$dir = sys_get_temp_dir() . '/clog-release-' . bin2hex(random_bytes(5));
mkdir($dir, 0700);
try {
    (new PharData($root . '/build/clog-standalone.tar.gz'))->extractTo($dir);
    foreach (['server/standalone/vendor', 'server/standalone/manifests', 'server/clog.php', 'server/generated/wordpress', 'server/generated/wpgraphql', 'server/vendor/elephentity/wordpress', 'server/vendor/elephentity/wpgraphql', 'server/vendor/elephentity/cli', 'server/vendor/elephentity/schema', 'server/vendor/elephentity/codegen', 'server/vendor/elephentity/codegen-sqlite', 'server/vendor/elephentity/codegen-graphql-php', 'server/vendor/phpunit'] as $legacy) {
        if (file_exists($dir . '/' . $legacy)) throw new RuntimeException('Legacy code included: ' . $legacy);
    }
    $code = <<<'CODE'
require $argv[1] . '/server/standalone/bootstrap.php';
foreach (['elephentity/runtime', 'elephentity/sqlite', 'elephentity/graphql', 'webonyx/graphql-php'] as $package) {
    if (!Composer\InstalledVersions::isInstalled($package)) throw new RuntimeException('Missing production dependency: ' . $package);
}
$db = new Eleph\SQLite\Database($argv[1] . '/database.sqlite');
Clog\Standalone\Schema::install($db);
$app = new Clog\Standalone\Application($db, new Clog\Standalone\Viewer('1','editor'));
$app->runtime->create('Item', ['name'=>'Packaged item']);
$schema = Clog\Standalone\GraphQL::schema($app);
$result = GraphQL\GraphQL::executeQuery($schema, '{clogSummary{items}}')->toArray();
if (($result['data']['clogSummary']['items'] ?? null) !== 1) throw new RuntimeException('Packaged GraphQL failed');
$db->execute('VACUUM INTO ?', [$argv[1] . '/backup.sqlite']);
$restored = new Eleph\SQLite\Database($argv[1] . '/backup.sqlite');
Clog\Standalone\Schema::requireReady($restored);
if ((int)$restored->scalar('SELECT COUNT(*) FROM app_clog_item') !== 1) throw new RuntimeException('Backup restore failed');
echo "PASS: isolated release install, entity write, GraphQL and SQLite backup/restore\n";
CODE;
    $process = proc_open([PHP_BINARY, '-r', $code, $dir], [0=>STDIN,1=>STDOUT,2=>STDERR], $pipes);
    if (proc_close($process) !== 0) throw new RuntimeException('Packaged runtime failed.');
} finally {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($files as $file) { $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname()); }
    rmdir($dir);
}
