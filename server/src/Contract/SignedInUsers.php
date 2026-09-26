<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Pattern\ClogPost\ClogPost;
use Clog\Entity\Pattern\ClogPost\Contract\ClogPostSignedInReadPolicy;
use Eleph\Runtime\Policy\PolicyDecision;
use Eleph\Runtime\Policy\Viewer;

final readonly class SignedInUsers implements ClogPostSignedInReadPolicy
{
    public function decide(ClogPost $entity, Viewer $viewer): PolicyDecision
    {
        return self::allows($viewer)
            ? PolicyDecision::allow()
            : PolicyDecision::deny('Sign in to read the inventory.');
    }

    /** Clog's read policy is uniform across rows; aggregates use the same gate. */
    public static function allows(Viewer $viewer): bool
    {
        return $viewer->isAuthenticated();
    }
}
