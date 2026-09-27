<?php

declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

use Clog\Standalone\{Schema, Viewer, Application, GraphQL};
use Eleph\SQLite\Database;

try {
    $path = getenv('CLOG_DB') ?: '/var/lib/clog/clog.sqlite';
    $db = new Database($path);
    switch ($argv[1] ?? '') {
        case 'install': Schema::install($db); echo "SQLite schema ready.\n"; break;
        case 'user:add':
            Schema::requireReady($db);
            [$username, $role] = [$argv[2] ?? '', $argv[3] ?? 'editor'];
            if (!preg_match('/^[a-zA-Z0-9_.@-]{1,100}$/D', $username) || !in_array($role, ['reader','editor'], true)) throw new RuntimeException('Usage: user:add USERNAME reader|editor (password from stdin)');
            $password = rtrim(stream_get_contents(STDIN), "\r\n");
            if (strlen($password) < 12 || strlen($password) > 72) throw new RuntimeException('Use a password between 12 and 72 bytes.');
            $db->insert('clog_users', ['username' => $username, 'role' => $role, 'password_hash' => password_hash($password, PASSWORD_DEFAULT)]);
            echo "Account created.\n"; break;
        case 'backup':
            Schema::requireReady($db);
            $target = $argv[2] ?? '';
            if (!$target || file_exists($target)) throw new RuntimeException('Specify a new backup file path.');
            $db->execute('VACUUM INTO ?', [$target]); chmod($target, 0600); echo "Backup created.\n"; break;
        case 'schema':
            Schema::requireReady($db);
            echo \GraphQL\Utils\SchemaPrinter::doPrint(GraphQL::schema(new Application($db, new Viewer()))); break;
        default: throw new RuntimeException('Commands: install | user:add USERNAME [reader|editor] | backup FILE | schema');
    }
} catch (Throwable $error) { fwrite(STDERR, $error->getMessage() . "\n"); exit(1); }
