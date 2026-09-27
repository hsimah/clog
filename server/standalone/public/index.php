<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';

use Clog\Standalone\{Application, GraphQL as ClogGraphQL, Schema, Session};
use Eleph\SQLite\Database;
use GraphQL\GraphQL;
use GraphQL\Validator\Rules\{QueryDepth, QueryComplexity};

header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
function jsonResponse(array $body, int $status = 200): never {
    http_response_code($status); header('Content-Type: application/json');
    echo json_encode($body, JSON_THROW_ON_ERROR); exit;
}
function escape(string $text): string { return htmlspecialchars($text, ENT_QUOTES, 'UTF-8'); }
try {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];
    $db = new Database(getenv('CLOG_DB') ?: '/var/lib/clog/clog.sqlite');
    Schema::requireReady($db);
    if ($path === '/healthz') jsonResponse(['ok' => true]);
    Session::start();
    $viewer = Session::viewer($db);
    if ($path === '/auth/session' && $method === 'GET') {
        $body = ['userId' => $viewer->id() ?? '0', 'nonce' => $viewer->isAuthenticated() ? $_SESSION['csrf'] : null, 'canWrite' => $viewer->can('inventory.write')];
        session_write_close(); jsonResponse($body);
    }
    if ($path === '/auth/logout' && $method === 'POST') {
        if (!Session::validCsrf($_SERVER['HTTP_X_CLOG_CSRF'] ?? null)) jsonResponse(['error' => 'Invalid session token.'], 403);
        Session::logout(); jsonResponse(['success' => true]);
    }
    if ($path === '/auth/login') {
        if (!in_array($method, ['GET', 'POST'], true)) jsonResponse(['error' => 'Method not allowed.'], 405);
        $error = '';
        if ($method === 'POST') {
            if (!Session::validCsrf($_POST['csrf'] ?? null)) jsonResponse(['error' => 'Invalid session token.'], 403);
            if (Session::login($db, (string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''))) {
                session_write_close(); header('Location: /', true, 303); exit;
            }
            http_response_code(401); $error = 'Could not sign in. Check your username and password.';
        }
        $csrf = escape($_SESSION['csrf']); session_write_close();
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html lang="en" data-theme="dark"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Clog</title><style>:root{color-scheme:dark;background:#121212;color:#f5f5f5}body{font:1rem system-ui;max-width:24rem;margin:10vh auto;padding:1rem}label,input,button{display:block;margin:.7rem 0}input,button{font:inherit;padding:.6rem;box-sizing:border-box;width:100%;border:1px solid #626262;border-radius:.4rem}input{background:#121212;color:#f5f5f5}button{background:#ff5722;color:#121212;border-color:#ff5722;font-weight:600;cursor:pointer}button:hover{filter:brightness(1.08)}:focus-visible{outline:2px solid #ff5722;outline-offset:3px}[role=alert]{color:#ff8a80}</style><main><h1>Sign in to Clog</h1><p role="alert">' . escape($error) . '</p><form method="post" action="/auth/login"><input type="hidden" name="csrf" value="' . $csrf . '"><label for="username">Username</label><input id="username" name="username" autocomplete="username" required maxlength="100"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required><button>Sign in</button></form></main></html>';
        exit;
    }
    if ($path === '/graphql') {
        if ($method !== 'POST') jsonResponse(['error' => 'POST required.'], 405);
        if (!$viewer->isAuthenticated()) jsonResponse(['error' => 'Sign in to continue.'], 401);
        if (!Session::validCsrf($_SERVER['HTTP_X_CLOG_CSRF'] ?? null)) jsonResponse(['error' => 'Invalid session token.'], 403);
        session_write_close(); // Do not serialize a browser's concurrent GraphQL requests.
        if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) jsonResponse(['error' => 'JSON required.'], 415);
        $raw = file_get_contents('php://input', length: 65537);
        if (strlen($raw) > 65536) jsonResponse(['error' => 'Request too large.'], 413);
        try { $body = json_decode($raw, true, 64, JSON_THROW_ON_ERROR); }
        catch (JsonException) { jsonResponse(['error' => 'Invalid JSON.'], 400); }
        if (!is_array($body) || !is_string($body['query'] ?? null) || (isset($body['variables']) && !is_array($body['variables'])) || (isset($body['operationName']) && !is_string($body['operationName']))) jsonResponse(['error' => 'Invalid GraphQL request.'], 400);
        $app = new Application($db, $viewer);
        $result = GraphQL::executeQuery(ClogGraphQL::schema($app), $body['query'], variableValues: $body['variables'] ?? null,
            operationName: $body['operationName'] ?? null, validationRules: [...\GraphQL\Validator\DocumentValidator::allRules(), new QueryDepth(12), new QueryComplexity(500)]);
        jsonResponse($result->toArray());
    }
    session_write_close();
    if (preg_match('~^/(?:|items(?:/[^/]+(?:/edit)?)?|locations(?:/[^/]+(?:/edit)?)?|inventory(?:/.*)?)$~', $path) && $method === 'GET') {
        $dist = dirname(__DIR__, 3) . '/client/dist';
        $manifest = json_decode(file_get_contents($dist . '/.vite/manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $entry = $manifest['index.html'];
        $styles = array_unique([...($entry['css'] ?? []), 'assets/stylex.css']);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clog</title><link rel="icon" type="image/png" href="/assets/clog-white.png" media="(prefers-color-scheme: dark)"><link rel="icon" type="image/png" href="/assets/clog.png" media="(prefers-color-scheme: light)">';
        foreach ($styles as $css) {
            if (!is_file($dist . '/' . $css)) throw new RuntimeException('Missing stylesheet. Build the client first.');
            echo '<link rel="stylesheet" href="/' . escape($css) . '?v=' . substr(hash_file('sha256', $dist . '/' . $css), 0, 12) . '">';
        }
        echo '</head><body><div id="root"></div><script type="module" src="/' . escape($entry['file']) . '"></script></body></html>'; exit;
    }
    jsonResponse(['error' => 'Not found.'], 404);
} catch (Throwable $error) {
    error_log((string) $error);
    jsonResponse(['error' => 'Clog could not complete this request.'], 500);
}
