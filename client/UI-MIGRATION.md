# Clog UI conventions

All screens use Astryx 0.6.0 and StyleX.
Use `scripts/node.sh npx astryx component <name>` to read the installed API before
changing a component. `component --list` and `docs tokens` list the available APIs.

Use component props first, then Stack/Grid/Section for layout, then
`stylex.create` with `stylex.props` for DOM or `xstyle` for Astryx components.
Use the documented Astryx tokens for colors, spacing and typography. Do not add
new Tailwind utilities or duplicate Astryx components with bespoke styled HTML.

The root Theme uses neutralTheme in dark mode with orange accents. `index.css` imports the reset,
core and theme CSS once in the documented layer order and defines the color overrides. There are no Tailwind
utilities, compatibility layers, or local UI wrappers.

React Router serves routes from the domain root. Pass app-relative paths (`/items`) through
LinkProvider/RouterLink; use normal anchors for external links and hashes. AppShell
owns the main landmark, skip link, scroll frame and mobile drawer. TopNav marks
Overview selected at `/` and Inventory at `/inventory`; nested routes keep their section
selected. Import logos from `src/assets` so Vite bundles their URLs.

`unplugin-stylex` runs before React in Vite. Its separate `assets/stylex.css` is
absent from Vite's manifest; the standalone PHP shell includes it with a content
hash query parameter. Keep the standalone deep-route browser tests: dev-only checks
will not catch missing extracted CSS in the production HTML shell.

## Component migration map

These APIs were checked through the installed Astryx CLI and TypeScript declarations.
Migrate screen composition directly rather than recreating the old wrapper APIs.

| Existing component | Astryx replacement and differences |
| --- | --- |
| Button | Button requires `label`; use `isDisabled`/`isLoading`, `variant`, `type`, `icon`. |
| Input + Label | TextInput owns its accessible `label`; controlled `value`, `onChange(value, event)`. Use TextArea/NumberInput for the appropriate fields. |
| Select | Selector uses `label`, `options`, `value`, `onChange(value)`; it is not a native select event callback. |
| Table | Table with TableHeader/TableBody/TableRow/TableHeaderCell/TableCell, or data-driven columns; keep proper table sections and server pagination. |
| Card + header/content/footer wrappers | Card takes children; compose Text/Stack and sections instead of forwarding the old slot object. |
| Dialog | Dialog uses `isOpen`/`onOpenChange`, DialogHeader and children; `purpose="form"` protects edits from backdrop dismissal after interaction. |
| DropdownMenu | `button` describes the trigger; `items` describe actions, or use compound menu children. Navigation belongs in links, not an action menu. |
| SidePanel | Use the route-owned aside: details precede the list on narrow screens and sit in an end column on wide screens. Closing navigates to the filtered parent. |

Preserve labels, focus restoration, unsaved input on session expiry, and route
back/forward behavior as each screen migrates. The browser suite checks the frame
using the compiled standalone build, including Overview at 390px and 1280px widths.

For all screens, keep table overflow inside its own container, keep the
name/detail link visible, and move row actions into the detail view (#11). On a
phone, route-owned detail forms should fill the available width; desktop and
portrait screens can use a bounded end panel without forcing the table wider.
Keep portrait layout driven by available width rather than device orientation.
Keep browser coverage for the screen contents as well as the shared frame.

Relay query references belong to routes, fragments to the components reading
them, and mutation hooks to the forms performing them (#36). Reuse the shared
session transport and discard the store on account change; never automatically
retry writes. Use authoritative totals and paginated search connections from
`server/docs/graphql-contract.md`.
