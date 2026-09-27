<?php
require dirname(__DIR__) . '/bootstrap.php';
$db = new Eleph\SQLite\Database(':memory:');
Clog\Standalone\Schema::install($db);
$schema = Clog\Standalone\GraphQL::schema(new Clog\Standalone\Application($db, new Clog\Standalone\Viewer()));
$schema->assertValid();
$printed = rtrim(preg_replace('/[ \t]+$/m', '', GraphQL\Utils\SchemaPrinter::doPrint($schema))) . "\n";
$target = dirname(__DIR__, 3) . '/client/schema.graphql';
if (in_array('--check', $argv, true)) {
    if (file_get_contents($target) !== $printed) { fwrite(STDERR, "Standalone GraphQL schema has drifted.\n"); exit(1); }
} else { file_put_contents($target, $printed); }
