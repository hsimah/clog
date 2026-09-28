<?php

declare(strict_types=1);
namespace Clog\Standalone;

use Eleph\SQLite\Database;
use GraphQL\Error\UserError;

/** Authentication accounts are application-owned, separate from inventory entities. */
final readonly class User
{
    public function __construct(public string $id) {}

    public function changePassword(Database $db, Viewer $viewer, string $currentPassword, string $newPassword): void
    {
        if (!$viewer->isAuthenticated() || $viewer->id() !== $this->id) {
            throw new UserError('You can only change your own password.');
        }
        $hash = $db->scalar('SELECT password_hash FROM clog_users WHERE id = ? AND enabled = 1', [$this->id]);
        if (!is_string($hash) || !password_verify($currentPassword, $hash)) {
            throw new UserError('Current password is incorrect.');
        }
        if (strlen($newPassword) < 12 || strlen($newPassword) > 72 || str_contains($newPassword, "\0")) {
            throw new UserError('New password must be 12–72 bytes and contain no null characters.');
        }
        // Compare-and-swap prevents a concurrent change from accepting a stale password.
        $updated = $db->execute('UPDATE clog_users SET password_hash = ? WHERE id = ? AND enabled = 1 AND password_hash = ?', [
            password_hash($newPassword, PASSWORD_DEFAULT), $this->id, $hash,
        ]);
        if ($updated !== 1) throw new UserError('Password changed or account unavailable. Check your current password and try again.');
    }
}
