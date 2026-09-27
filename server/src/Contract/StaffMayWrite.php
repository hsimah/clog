<?php

declare(strict_types=1);

namespace Clog\Contract;

use Clog\Entity\Pattern\ClogPost\ClogPost;
use Clog\Entity\Pattern\ClogPost\Contract\ClogPostStaffWritePolicy;
use Eleph\Runtime\Policy\PolicyDecision;
use Eleph\Runtime\Policy\Viewer;
use Eleph\Runtime\Policy\WriteContext;

/** Editors may change inventory in any hosting integration. */
final readonly class StaffMayWrite implements ClogPostStaffWritePolicy
{
    public function decide(?ClogPost $entity, WriteContext $context, Viewer $viewer): PolicyDecision
    {
        return $viewer->isAuthenticated() && $viewer->can('inventory.write')
            ? PolicyDecision::allow()
            : PolicyDecision::deny('Inventory changes require editor access.');
    }
}

