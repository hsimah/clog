<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\Runtime\Storage\{Cursor, Offset};
use Eleph\SQLite\Database;
use GraphQL\Error\UserError;

/** Authentication accounts are application-owned, separate from inventory entities. */
final readonly class User
{
    private const COLUMNS = 'id, username, role, admin, enabled';

    public function __construct(
        public string $id,
        public string $username,
        public string $role,
        public bool $admin,
        public bool $enabled,
    ) {}

    public static function find(Database $db, string $id): ?self
    {
        $row = $db->select('SELECT ' . self::COLUMNS . ' FROM clog_users WHERE id = ?', [$id])[0] ?? null;
        return $row ? self::fromRow($row) : null;
    }

    /** Administrators page every account by username; others see no accounts. */
    public static function page(Database $db, Viewer $viewer, int $first, ?string $after): ?array
    {
        if (!$viewer->isAdmin()) return null;
        $start = Offset::fromCursor($after === null ? null : Cursor::of($after))->value;
        $rows = $db->select('SELECT ' . self::COLUMNS . ' FROM clog_users ORDER BY username, id LIMIT ? OFFSET ?', [$first + 1, $start]);
        $users = array_map(self::fromRow(...), array_slice($rows, 0, $first));
        $edges = [];
        foreach ($users as $index => $user) {
            $edges[] = ['cursor' => (string) (new Offset($start + $index + 1))->toCursor(), 'node' => $user];
        }
        return [
            'nodes' => $users,
            'edges' => $edges,
            'pageInfo' => [
                'hasNextPage' => count($rows) > $first, 'hasPreviousPage' => $start > 0,
                'startCursor' => $edges[0]['cursor'] ?? null, 'endCursor' => $edges === [] ? null : $edges[count($edges) - 1]['cursor'],
            ],
            'totalCount' => (int) $db->scalar('SELECT COUNT(*) FROM clog_users'),
        ];
    }

    public static function changePassword(Database $db, Viewer $viewer, string $id, string $currentPassword, string $newPassword): self
    {
        if (!$viewer->isAuthenticated() || $viewer->id() !== $id) {
            throw new UserError('You can only change your own password.');
        }
        $hash = $db->scalar('SELECT password_hash FROM clog_users WHERE id = ? AND enabled = 1', [$id]);
        if (!is_string($hash) || !password_verify($currentPassword, $hash)) {
            throw new UserError('Current password is incorrect.');
        }
        self::assertPassword($newPassword, 'New password');
        // Compare-and-swap prevents a concurrent change from accepting a stale password.
        $updated = $db->execute('UPDATE clog_users SET password_hash = ? WHERE id = ? AND enabled = 1 AND password_hash = ?', [
            password_hash($newPassword, PASSWORD_DEFAULT), $id, $hash,
        ]);
        if ($updated !== 1) throw new UserError('Password changed or account unavailable. Check your current password and try again.');
        return self::find($db, $id);
    }

    public static function create(Database $db, Viewer $viewer, string $username, string $password, string $role, bool $admin): self
    {
        self::assertAdmin($viewer);
        self::assertUsername($username);
        self::assertRole($role);
        self::assertPassword($password, 'Password');
        return $db->transaction(static function () use ($db, $username, $password, $role, $admin): self {
            if ($db->scalar('SELECT 1 FROM clog_users WHERE username = ?', [$username]) !== null) {
                throw new UserError('That username is already in use.');
            }
            $id = $db->insert('clog_users', [
                'username' => $username, 'role' => $role, 'admin' => $admin ? 1 : 0,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
            return self::find($db, (string) $id);
        });
    }

    /**
     * Administrators set another account's password without knowing the old one.
     * Bumping session_version signs that account out everywhere on its next request.
     */
    public static function resetPassword(Database $db, Viewer $viewer, string $id, string $newPassword): self
    {
        self::assertAdmin($viewer);
        if ($viewer->id() === $id) throw new UserError('Use Change password for your own account.');
        self::assertPassword($newPassword, 'New password');
        $updated = $db->execute('UPDATE clog_users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?', [
            password_hash($newPassword, PASSWORD_DEFAULT), $id,
        ]);
        if ($updated !== 1) throw new UserError('Account not found.');
        return self::find($db, $id);
    }

    /**
     * Sessions resolve their account on every request, so deletion signs the user out.
     * AUTOINCREMENT ids are never reused by a later account. Administrators cannot
     * delete themselves, which also guarantees at least one administrator remains.
     */
    public static function delete(Database $db, Viewer $viewer, string $id): void
    {
        self::assertAdmin($viewer);
        if ($viewer->id() === $id) throw new UserError('You cannot delete your own account.');
        if ($db->execute('DELETE FROM clog_users WHERE id = ?', [$id]) !== 1) throw new UserError('Account not found.');
    }

    public static function assertUsername(string $username): void
    {
        if (!preg_match('/^[a-zA-Z0-9_.@-]{1,100}$/D', $username)) {
            throw new UserError('Username must be 1–100 letters, digits, or . _ @ - characters.');
        }
    }

    public static function assertRole(string $role): void
    {
        if (!in_array($role, ['reader', 'editor'], true)) throw new UserError('Role must be reader or editor.');
    }

    public static function assertPassword(string $password, string $label): void
    {
        if (strlen($password) < 12 || strlen($password) > 72 || str_contains($password, "\0")) {
            throw new UserError($label . ' must be 12–72 bytes and contain no null characters.');
        }
    }

    private static function assertAdmin(Viewer $viewer): void
    {
        if (!$viewer->isAdmin()) throw new UserError('Administrator access is required to manage accounts.');
    }

    private static function fromRow(array $row): self
    {
        return new self((string) $row['id'], $row['username'], $row['role'], (int) $row['admin'] === 1, (int) $row['enabled'] === 1);
    }
}
