<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

use Clog\Standalone\{InitialRouteData, Schema, Viewer};
use Eleph\SQLite\Database;
use Eleph\Tsquid\{InitialData, Manifest};

function ensure(bool $ok, string $label): void { if (!$ok) throw new RuntimeException($label); }

$db = new Database(':memory:');
Schema::install($db);
$viewer = new Viewer('1', 'editor');
$initial = new InitialData(
    Manifest::fromFile(dirname(__DIR__, 2) . '/generated/tsquid/tsquid-manifest.php'),
    static fn ($text, $variables, $operation, $id) => InitialRouteData::execute($db, $viewer, $text, $variables, $operation),
);
$shell = '<html><head></head><body><script type="module" src="/app.js"></script></body></html>';
ensure(str_contains($initial->render('/', $shell)->body, 'id="tsquid-data"'), 'Successful queries inline data');

// A real resolver failure preserves errors in the direct-load payload for client validation.
$db->execute('DROP TABLE app_clog_item');
$failed = $initial->render('/', $shell)->body;
preg_match('~<script type="application/json" id="tsquid-data">(.*?)</script>~', $failed, $match);
$payload = json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);
ensure($payload['responses'][0]['response']['data']['clogSummary'] === null, 'Failed summary is null');
ensure(!empty($payload['responses'][0]['response']['errors']), 'Resolver errors survive initial-data encoding');

echo "PASS: initial-data success and resolver errors\n";
