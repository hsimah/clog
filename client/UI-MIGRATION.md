# Clog UI conventions

Read [AGENTS.md](AGENTS.md) and [UI standards](docs/ui-standards.md) before changing
handwritten UI. Clog uses tsquid, React Router 8, Relay 21, Astryx 0.6, StyleX,
and Vite 8. Local imports are relative so tsquid's architecture checker can
resolve the full import graph.

## Routes and data

`routes.json` declares routes and typed URL fields. After editing it, run
`scripts/node.sh npm run routes` and commit the generated catalogue.
`npm run routes:check` rejects stale output.

- Build destinations with generated `*URI.getURI(input)` methods.
- Read and update URL state with the active entrypoint's generated context hook.
  Item, location, and inventory searches survive reload, detail/edit navigation,
  closing panels, and browser history. Search replaces the current history entry;
  choosing a location pushes one.
- `*.entrypoint.ts` describes the initial query graph. Inventory starts its list,
  location tabs, and selected detail queries together. `*Route.ts` reads the
  references and composes the page and selected panel.
- `RouteResource` lazily loads route UI. `NavigationLink` adapts Astryx's `href`
  to tsquid's link; hover and keyboard focus preload code and query graphs.
- Initial query references belong to tsquid. `useRouteQuery` handles explicit
  refreshes and on-demand picker/expanded-row requests, disposing those requests
  when replaced or unmounted. Component data belongs in Relay fragments.
- Dedicated `use…Mutation.ts` hooks own mutation documents. Keep uncertain writes
  explicit and never replay them automatically. Session recovery must preserve
  drafts; account changes clear the store and require a reload.

See [Relay conventions](RELAY.md) for pagination, stock additions, and scanning.

## Frame and theme

TopNav suits the four stable sections: Overview, Items, Locations, and Inventory.
AppShell owns the main landmark, skip link, and mobile navigation. Content has a
1440px maximum width; tables fill their region and own their overflow. A selected
detail uses a 384px end column at 1000px and above. Below that breakpoint, the
detail precedes the list at full width. Grid and Stack enforce this contract.

Dense records use tables; Overview totals are independent Card widgets. Use Astryx
props first and tokens for any additional StyleX styling. Structural region widths
may be explicit; interior spacing, color, typography, and motion use tokens.

`src/theme/ClogTheme.ts` owns the dark surfaces and deep-orange accent. The Astryx
CLI compiles it into `src/theme/__generated__/` before development and production
builds. Global CSS imports the reset, core styles, and compiled theme in order;
it does not override color tokens. Theme mode stays dark. Fonts use the system
stack, with no external font request.

The tsquid Vite preset runs StyleX before React and Relay. Its extracted
`assets/stylex.css` is outside Vite's manifest, so the PHP shell includes it
explicitly with a content hash. Keep browser coverage against the compiled PHP
application; Vite-only checks cannot verify that shell.

## Checks

```sh
scripts/node.sh npm run check
scripts/test-standalone-browser.sh
```

`check` validates generated routes, URI contracts, tsquid lint and architecture,
Relay artifacts, TypeScript (including browser tests), and the production build.
The browser suite uses disposable databases and covers preloading, filters,
responsive layout, sessions, permissions, CRUD, pagination, and scanner cleanup.
