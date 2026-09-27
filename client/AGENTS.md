# AGENTS.md

Project-specific guidance for AI coding agents.

## Mandatory project UI standards

Read [docs/ui-standards.md](docs/ui-standards.md) before changing handwritten UI.
These project conventions take precedence over conflicting generated advice below.

- Group public components by entity (`components/tutorial/TutorialDetail.tsx`).
  Put substantial owner-specific internals in `detail/`, `page/`, etc.; put actual
  shared internals in `__private__/`. External consumers use public modules only.
- Module order: imports → SHOUTING_SNAKE_CASE constants → named exports → local
  components/hooks/helpers/private types → StyleX styles at the very bottom.
- Match named exports to their filename (`TutorialDetail`, `TutorialDetailProps`).
  Name local components `TutorialDetail_Notes`, using their module owner as prefix.
- Keep small single-use components, hooks, types, and helpers local. Substantial
  single-owner feature modules need a documented `@module-boundary` reason.
  Relay mutation hooks always have their own `use…Mutation.ts` files.
- Components render prepared state. Move effects, transformations, measurements,
  timers, and complex handlers into hooks/helpers; keep those local unless shared.
- This repository DOES compile StyleX. Use `stylex.create`, `stylex.props`, and
  Astryx `xstyle`; the Astryx CLI advice must be interpreted with this compiled setup. Prefer Astryx layout and tokens; preserve measured portal geometry
  when making structural refactors.
- Run `scripts/node.sh npm run check` from the repository root before finishing UI
  changes. Use `npm run lint:fix` through the same wrapper for safe automatic fixes.
  Do not disable rules or add broad ignores to make checks pass. Rule/fixer regressions live upstream in `@tsquid/eslint-plugin`; add local route and browser coverage for application behavior.

<!-- ASTRYX:START -->
Astryx v0.6.3 · 164 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (This app compiles StyleX: use xstyle and stylex.props; no Tailwind utilities.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   164 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any Astryx or integration dependency bump
<!-- ASTRYX:END -->

## Clog routing and theme

- Declare every route and URL field in `routes.json`; regenerate with `npm run routes`.
- Use generated URI builders and active route contexts. Route entrypoints own initial Relay query graphs; links preload on hover/focus.
- Keep `ClogTheme` dark with orange accents. Put brand colors in the Astryx theme, and use tokens in components.
- Keep session expiry drafts, one-shot mutations, reader permissions, and barcode cleanup intact.
- Run `scripts/test-standalone-browser.sh` after `scripts/node.sh npm run check` for UI changes. It uses a disposable database.
