# UI code standards

These rules apply to handwritten `client/src` code. Relay-generated artifacts
are compiler-owned; tooling/configuration is outside the UI module conventions.

## Entity ownership

```text
components/
  tutorial/
    TutorialPage.tsx
    TutorialDetail.tsx
    TutorialTile.tsx
    TutorialModal.tsx
    TutorialLightbox.tsx
    page/                         # substantial TutorialPage internals
    detail/                       # substantial TutorialDetail internals
      useUnlockTutorialMutation.ts
    __private__/                  # shared within this entity
      TutorialLockIcon.tsx
```

Public modules live directly inside the entity directory and start with its
PascalCase name. Entity directories use lowercase kebab-case. Feature folder
names match the public owner's suffix: `TutorialDetail` owns `detail/`,
`TutorialLightbox` owns `lightbox/`. Create folders only when needed.

Outside consumers import public modules. Feature internals may be imported only
by their public owner and modules in the same feature. `__private__` may be used
throughout its entity, but cannot depend on feature internals. Neither private
nor feature implementations can be exposed through barrels. Generated artifacts
are an explicit exception for Relay infrastructure such as preload registration.

Prefer direct public imports. Optional `index.ts` barrels may contain explicit
public re-exports only. Use relative local imports: the architecture checker
resolves static imports, re-exports, literal dynamic imports, and type imports.
New project aliases need resolver support before being introduced.

## Module layout

Keep declarations in this order:

1. Imports, including type imports.
2. Local module constants in `SHOUTING_SNAKE_CASE`.
3. Named exports: primary component/function/data and closely related types.
4. Local components, hooks, helpers, and private types.
5. StyleX declarations at the very bottom.

Exported constants belong in the exports section and still use uppercase names.
Function-valued helpers keep normal names; the StyleX `styles` binding is also
exempt from constant casing. Module data uses named `const` bindings, not mutable
module state or destructuring. Prefer function declarations for components and
helpers. Do not reorder eager initialization in a way that changes execution.

A module must export its filename's name, or the uppercase equivalent for data.
Entrypoint descriptors use `<Entity>.entrypoint.ts` (for example,
`Tutorial.entrypoint.ts`), with `TutorialEntryPoint` / `TUTORIAL_ENTRY_POINT`
exports. The lint rules treat this suffix as `EntryPoint`. These modules use
`createElement` when a small Relay wrapper is needed; page UI stays in `.tsx`.

Related exports extend that name: `TutorialDetail`, `TutorialDetailProps`,
`TutorialDetailQuery`, `TUTORIAL_DETAIL_QUERY`. No unrelated helper exports,
default exports, or star exports. Export props types only when useful; do not
create a one-consumer `types.ts` file.

```tsx
import * as stylex from '@stylexjs/stylex';
import { Text } from '@astryxdesign/core';

const EMPTY_LABEL = 'No notes';

export interface TutorialDetailProps {
  notes: string | null;
}

export function TutorialDetail({ notes }: TutorialDetailProps) {
  return <TutorialDetail_Notes text={getNotesLabel(notes)} />;
}

function TutorialDetail_Notes({ text }: { text: string }) {
  return <Text xstyle={styles.notes}>{text}</Text>;
}

function getNotesLabel(notes: string | null) {
  return notes?.trim() || EMPTY_LABEL;
}

const styles = stylex.create({
  notes: { color: 'var(--color-text-secondary)' },
});
```

## Local components and module size

Local component names use their module owner, an underscore, and a descriptive
suffix: `TutorialDetail_Notes`, `TutorialPage_Grid`. This also applies to arrow
and memoized components. Declare components at module scope so their identity
survives renders. Local hooks use names such as `useTutorialDetail`; pure helpers
use ordinary descriptive camelCase names.

Keep small single-use components, hooks, helpers, and types in their owner.
Extract a module when it has multiple consumers or forms a substantial,
independently understandable boundary. A larger single-use feature module must
explain its boundary in a documentation comment before the imports:

```ts
/** @module-boundary Owns the editor's keyboard navigation and selection state. */
```

The checker counts distinct importing modules, including type imports. Two imports
from one consumer do not establish reuse. A one-consumer module cannot live in
`__private__`, even with a boundary comment: put it in its feature or inline it.
Do not add dummy consumers to satisfy lint. Review boundary explanations; line
counts alone cannot determine useful ownership.

**Relay mutation hooks always get their own `use<Operation>Mutation.ts` file**,
with the matching named hook export. Keep the mutation document and optimistic
response/updater there even with one consumer. Use the owning feature folder, or
`__private__` for a shared mutation hook.

## Renderers and logic

Components render prepared state. Move data normalization, filtering, sorting,
reductions, subscriptions, timers, effects, DOM measurements, and mutation handling
into hooks or pure helpers. Start with local helpers: extracting logic does not
imply creating a file. Hooks return state and actions needed by the renderer.

Renderers may read Relay fragments/queries, call hooks, destructure results, use
simple display conditions, and map prepared items to JSX. Complex event handlers
belong in hooks/helpers; pass their actions to the renderer.

Lint rejects direct effect hooks, network/mutation side effects, timers, async
components, and `filter`/`flatMap`/`reduce`/`sort`/`toSorted` calls in renderers,
including inline callbacks. React hook rules and exhaustive dependencies are
errors. Static checks catch common violations; they cannot prove purity or
judge arbitrary business logic. Reviewers still check data flow and cleanup.

## Styling

This repository compiles StyleX. Use `stylex.create()` at the bottom of the owner,
`stylex.props()` on DOM elements, and Astryx's `xstyle` prop. Prefer Astryx components
and tokens for ordinary layout/appearance. Measurement-dependent geometry belongs
in dynamic StyleX entries. Do not introduce inline style objects, parallel CSS
frameworks, or tiny single-use style files. Preserve portal geometry and responsive behavior when moving components.

## Enforcement and fixes

From the repository root:

```bash
scripts/node.sh npm run lint       # ESLint + complete source import graph
scripts/node.sh npm run lint:fix   # safe fixes, then architecture check
scripts/node.sh npm run test:routes  # typed URI regression tests
scripts/node.sh npm run check      # route tests + route freshness + lint + Relay/TypeScript/Vite build
```

Every violation fails lint. There is no baseline suppressing existing violations.
`npm run check` is required before review/merge. The Standalone SQLite workflow runs it
on pull requests and pushes to main. Generated files are excluded.
`main.tsx` is the bootstrap exception to constant casing, declaration ordering,
and local component naming; it performs imperative app initialization.

| Check | Automatic fix |
| --- | --- |
| `tsquid/module-order` | Reorders only when eager initialization order is unchanged and no comments/directives can be misattached. |
| `tsquid/constant-names` | Scope-aware local renames; preserves object keys and type annotations. |
| `tsquid/module-exports` | Diagnostic only: public API changes require updating consumers. |
| `tsquid/local-component-names` | Scope-aware local renames including JSX references. |
| `tsquid/render-only-components` | Diagnostic only: extracting logic requires judgment. |
| Architecture graph | Diagnostic only: directories, boundaries, consumers, mutation exceptions. |

Renames refuse collisions, exported bindings, modules with default exports, and
modules containing `eval`. Moves refuse changes to runtime initialization order.
File moves and logic extraction intentionally have no automatic fixer.

Do not weaken rules or add broad ignores to make checks pass. Fix the structure;
for a real exception, document its reason narrowly and add regression coverage
when the rule must distinguish a valid pattern. Architectural judgment remains a
review responsibility even when the mechanical checks pass.

Rules and fixer tests are maintained upstream in `@tsquid/eslint-plugin`; Clog runs the published rules and architecture checker. The implementation uses [ESLint's rule/fixer API](https://eslint.org/docs/latest/extend/custom-rules)
and [RuleTester](https://eslint.org/docs/latest/integrate/nodejs-api#ruletester).
The parser needs the JavaScript compiler API, so dependencies follow the official
[TypeScript 6/7 side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0):
`typescript` supplies the TypeScript 6 compatibility API; `@typescript/native`
supplies the TypeScript 7 `tsc` used in builds.
