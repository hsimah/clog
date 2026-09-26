# Clog UI conventions

Astryx 0.6.0 and StyleX are the target UI stack. The application frame is migrated;
the feature screens still use the legacy UI components until issues #38/#39 land.
Use `scripts/node.sh npx astryx component <name>` to read the installed API before
changing a component. `component --list` and `docs tokens` list the available APIs.

Use component props first, then Stack/Grid/Section for layout, then
`stylex.create` with `stylex.props` for DOM or `xstyle` for Astryx components.
Use the documented Astryx tokens for colors, spacing and typography. Do not add
new Tailwind utilities or duplicate Astryx components with bespoke styled HTML.

The root Theme uses neutralTheme in light mode while legacy screens still have
light-only colors. `index.css` imports the reset, core and theme CSS once, in the
documented layer order with transitional Tailwind layers. Legacy semantic color
utilities are inlined so shared CSS variable names cannot change their meaning.
Do not import the optional Tailwind token bridge during this migration.

React Router owns the `/clog` basename. Pass app-relative paths (`/items`) through
LinkProvider/RouterLink; use normal anchors for external links and hashes. AppShell
owns the main landmark, skip link, scroll frame and mobile drawer. TopNav marks
Inventory selected at both `/` and `/inventory`; nested routes keep their section
selected. Import logos from `src/assets` so Vite bundles URLs for WordPress.

`unplugin-stylex` runs before React in Vite. Its separate `assets/stylex.css` is
absent from Vite's manifest; `clog_get_vite_assets()` includes it with a content
hash query parameter. Keep the WordPress deep-route browser test: dev-only checks
will not catch missing extracted CSS in the plugin's custom HTML shell.

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
| SidePanel | Compose a route-owned Dialog with an end position or fullscreen presentation for a small screen; closing navigates to the parent. Overlay is a media overlay, not a drawer replacement. |

Preserve labels, focus restoration, unsaved input on session expiry, and route
back/forward behavior as each screen migrates. The browser suite checks the frame
at 390×844, 1080×1920 and 1440×900, plus the WordPress-served build.

For subsequent screens, keep table overflow inside its own container, keep the
name/detail link visible, and move row actions into the detail view (#11). On a
phone, route-owned detail forms should fill the available width; desktop and
portrait screens can use a bounded end panel without forcing the table wider.
Keep portrait layout driven by available width rather than device orientation.
Verify these screen behaviors as #38/#39 migrate their owners; the frame tests
alone do not complete the whole portrait-display issue #25.

Relay query references belong to routes, fragments to the components reading
them, and mutation hooks to the forms performing them (#36). Reuse the shared
session transport and discard the store on account change; never automatically
retry writes. Use authoritative totals and paginated search connections from
`server/docs/graphql-contract.md`, not the temporary DataContext arrays.
