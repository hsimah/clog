<?php

declare(strict_types=1);
namespace Clog\Standalone;

final readonly class Viewer implements \Eleph\Runtime\Policy\Viewer, \Eleph\Runtime\Policy\ViewerProvider
{
    public function __construct(private ?string $userId = null, private string $role = 'reader') {}
    public function id(): ?string { return $this->userId; }
    public function isAuthenticated(): bool { return $this->userId !== null; }
    public function hasRole(string $role): bool { return $this->isAuthenticated() && $this->role === $role; }
    public function can(string $capability): bool { return $capability === 'inventory.write' && $this->hasRole('editor'); }
    public function viewer(): \Eleph\Runtime\Policy\Viewer { return $this; }
}
