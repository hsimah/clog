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
ensure((int) $db->scalar('PRAGMA busy_timeout') === 3000, 'Successful queries restore the normal lock timeout');

// A real resolver failure preserves errors in the direct-load payload for client validation.
$db->execute('DROP TABLE app_clog_item');
$failed = $initial->render('/', $shell)->body;
preg_match('~<script type="application/json" id="tsquid-data">(.*?)</script>~', $failed, $match);
$payload = json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);
ensure($payload['responses'][0]['response']['data']['clogSummary'] === null, 'Failed summary is null');
ensure(!empty($payload['responses'][0]['response']['errors']), 'Resolver errors survive initial-data encoding');
ensure((int) $db->scalar('PRAGMA busy_timeout') === 3000, 'Failed queries restore the normal lock timeout');

$db = new Database(':memory:');
Schema::install($db);
$db->insert('app_clog_item', ['name' => 'Slow item', 'created_at' => '2026-10-11T00:00:00Z', 'updated_at' => '2026-10-11T00:00:00Z']);
$initial = new InitialData(
    Manifest::fromFile(dirname(__DIR__, 2) . '/generated/tsquid/tsquid-manifest.php'),
    static fn ($text, $variables, $operation, $id) => InitialRouteData::execute($db, $viewer, $text, $variables, $operation),
);
$observedTimeout = null;
$db->pdo->sqliteCreateFunction('count', static function () use ($db, &$observedTimeout): int {
    $observedTimeout = (int) $db->scalar('PRAGMA busy_timeout');
    usleep(600000);
    return 1;
}, 0);
ensure($initial->render('/', $shell)->body === $shell, 'Queries exceeding the initial-data budget preserve the plain shell');
ensure($observedTimeout === 250, 'Initial-data queries use a short SQLite lock wait');
ensure((int) $db->scalar('PRAGMA busy_timeout') === 3000, 'Late queries restore the normal lock timeout');
echo "PASS: initial-data resolver errors, late-result fallback and SQLite lock timeout restoration\n";
