<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;

final class Session
{
    public static function start(): void
    {
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.gc_maxlifetime', '28800');
        if ($path = getenv('CLOG_SESSION_PATH')) session_save_path($path);
        session_name('clog_session');
        session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => str_starts_with(getenv('CLOG_ORIGIN') ?: 'http://localhost', 'https://'), 'httponly' => true, 'samesite' => 'Lax']);
        session_start();
        if (isset($_SESSION['expires']) && $_SESSION['expires'] <= time()) $_SESSION = [];
        $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    }
    public static function viewer(Database $db): Viewer
    {
        // Sessions from before session versions existed match the initial version 0.
        $row = $db->select('SELECT id, role, admin FROM clog_users WHERE id = ? AND enabled = 1 AND session_version = ?', [
            $_SESSION['user_id'] ?? 0, $_SESSION['session_version'] ?? 0,
        ])[0] ?? null;
        return $row ? new Viewer((string) $row['id'], $row['role'], (int) $row['admin'] === 1) : new Viewer();
    }
    public static function validCsrf(?string $token): bool { return is_string($token) && hash_equals($_SESSION['csrf'], $token); }
    public static function login(Database $db, string $username, string $password): bool
    {
        $user = $db->select('SELECT * FROM clog_users WHERE username = ? AND enabled = 1', [$username])[0] ?? null;
        // Fixed valid dummy hash keeps unknown-user checks on the same password path.
        $hash = $user['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        if (!password_verify($password, $hash) || !$user) return false;
        session_regenerate_id(true);
        $_SESSION = ['user_id' => $user['id'], 'session_version' => $user['session_version'], 'expires' => time() + 28800, 'csrf' => bin2hex(random_bytes(32))];
        return true;
    }
    public static function logout(): void
    {
        $_SESSION = [];
        setcookie(session_name(), '', ['expires' => time() - 3600, ...array_diff_key(session_get_cookie_params(), ['lifetime' => true])]);
        session_destroy();
    }
}
