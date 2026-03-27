# Mappd — TODO

> Running backlog of planned work, features, and tasks.
> Updated by the agent as new items are identified or completed.

## Format

```
- [ ] **Task title** — Brief description `[priority]` `[added: YYYY-MM-DD]`
  - Context or subtasks if needed
  - Links to related execution/learnings entries
```

Priorities: `P0` (critical/blocking), `P1` (important), `P2` (nice-to-have), `P3` (someday)

---

## Backlog

- [x] **Thumbnail vs Focus mode toggle** — ⊕/⊖ button on header, 480→960px with 0.75 scale `[P1]` `[done: 2026-03-24]`
- [x] **Improve edge label styling** — Pill-shaped labels, hover effects, better contrast `[P2]` `[done: 2026-03-24]`
- [x] **Polish pan animation** — 600ms duration, zoom-aware maxZoom capping `[P2]` `[done: 2026-03-24]`

### MVP Backlog
- [x] **CLI tool** — `mappd dev` parses, serves, watches `[P1]` `[done: 2026-03-23]`
- [x] **Route parser: React Router v6+** — AST analysis to auto-detect routes `[P1]` `[done: 2026-03-23]`
- [x] **Route parser: Next.js** — App Router + Pages Router file-system scanning `[P1]` `[done: 2026-03-23]`
- [x] **Navigation link detection** — Scan for `<Link>`, `useNavigate()`, `router.push()` `[P1]` `[done: 2026-03-23]`
- [x] **Auto-layout** — Dagre left-to-right positioning `[P1]` `[done: 2026-03-23]`
- [x] **Canvas integration** — Canvas fetches parsed flow-graph.json instead of hardcoded data `[P1]` `[done: 2026-03-23]`
- [x] **State pinning UI** — Global auth + per-node URL params, pin panel sidebar `[P1]` `[done: 2026-03-23]`
- [x] **File watcher + WebSocket** — chokidar watches source, re-parses, broadcasts via WebSocket `[P1]` `[done: 2026-03-23]`

### Control Panel (Right Sidebar)

**v1 — P1 (build now)**
- [x] **Screen selector dropdown** — Select any route from a list, canvas zooms to it `[P1]` `[done: 2026-03-27]`
- [x] **Zoom controls** — Zoom %, fit all, fit selection `[P1]` `[done: 2026-03-27]`
- [x] **Viewport size toggle** — Mobile (375x667) / Tablet (768x1024) / Desktop (1280x800) `[P1]` `[done: 2026-03-27]`
- [x] **Open in editor** — Open component file in VS Code (`vscode://file/...`) `[P1]` `[done: 2026-03-27]`
- [x] **Export as PNG** — Screenshot the full canvas `[P1]` `[done: 2026-03-27]`
- [x] **Open in browser** — Open route in a new tab on target dev server `[P1]` `[done: 2026-03-27]`

**v1.1 — P2 (after launch)**
- [x] **Canvas theme toggle** — Dark / Light canvas background `[P2]` `[done: 2026-03-27]`
- [x] **Show/hide edges** — Toggle flow connections visibility `[P2]` `[done: 2026-03-27]`
- [x] **Show/hide labels** — Toggle route labels `[P2]` `[done: 2026-03-27]`
- [x] **Layout direction toggle** — LR (left-to-right) / TB (top-to-bottom) `[P2]` `[done: 2026-03-27]`
- [x] **Re-layout button** — Re-run Dagre, discard manual positioning `[P2]` `[done: 2026-03-27]`
- [x] **Export as PDF** — Flow diagram as PDF `[P2]` `[done: 2026-03-27]`
- [x] **Reload screen** — Refresh a single screen's iframe `[P2]` `[done: 2026-03-27]`
- [x] **Live/Thumbnail toggle** — Force live or static preview per node `[P2]` `[done: 2026-03-27]`
- [x] **Edge style options** — Solid / Dashed / Animated `[P2]` `[done: 2026-03-27]`

**Bottom status bar (always visible)**
- [x] **Route count** — "23 screens, 26 connections" `[P1]` `[done: 2026-03-27]`
- [x] **Target server status** — "localhost:3000" with green/red dot `[P1]` `[done: 2026-03-27]`
- [x] **Keyboard shortcuts help** — `?` icon opens shortcut reference `[P2]` `[done: 2026-03-27]`

### Layout Restructure (explore)
- [x] **Figma-style 3-panel layout** — Left panel = screen list, Canvas = middle, Right panel = selected node actions `[P1]` `[done: 2026-03-27]`
  - **Left panel:** Full screen list (replaces dropdown), click to zoom to node. Always visible, scrollable
  - **Right panel:** Everything about the selected node — DevTools tabs, Pin State, Open in editor, Viewport, Reload. Consolidates PinPanel + DevToolsPanel + node actions into one panel
  - **Canvas:** Takes up the middle, no more per-node DevTools (removes clutter, keeps node height consistent)

### Panel Design Polish (Figma-inspired)
- [ ] **Figma-style panel hierarchy and spacing** — Redesign both panels to match Figma's information hierarchy `[P1]` `[added: 2026-03-27]`
  - **Key patterns from Figma's right panel:**
    1. **Selected element name as header** — bold, large, with type icon + overflow menu (···). Not a section, it IS the panel identity
    2. **Section titles are single words** — "Position", "Auto layout", "Fill", "Stroke", "Effects". No sentence-case descriptions
    3. **Sections use + buttons** for additive actions (add fill, add effect) instead of toggles
    4. **Dense but breathable** — tight vertical spacing (4-6px between rows) but clear horizontal separation between label and value
    5. **Inline editable fields** — values are directly editable in-place, not hidden behind modals or dropdowns
    6. **Consistent field layout** — label left, value right, always the same width ratio
    7. **Collapsible sections** — sections like "Auto layout" expand/collapse with a subtle triangle, no border around them
    8. **Muted hierarchy** — section titles are slightly bolder than field labels, but both are subdued. Only the selected element name is prominent
    9. **No buttons for navigation** — actions are icon-only (grid icon, eye icon, settings icon) aligned right of section titles
    10. **Bottom sections are single-line** — "Stroke", "Effects", "Export" show as collapsed one-liners with a + button, expanding only when content exists
  - **Apply to Mappd:**
    - Left panel: match Figma's Layers panel — compact rows, indent for hierarchy, type icons per route
    - Right panel: selected route as header, sections = Actions | Pin State | DevTools | Canvas. Each section title = single word, collapsible, icon-only action buttons

### Demo Apps (per-framework test fixtures)
- [ ] **demo-react-router-v6** — Current demo-app, already built (React Router v6, Vite, 10 routes, state patterns) `[P1]` `[added: 2026-03-27]`
- [ ] **demo-react-router-v7** — React Router v7 framework mode with `routes.ts`, flat-routes, loaders/actions `[P1]` `[added: 2026-03-27]`
- [ ] **demo-nextjs-app** — Next.js App Router with route groups, dynamic routes, layouts, middleware `[P1]` `[added: 2026-03-27]`
- [ ] **demo-nextjs-pages** — Next.js Pages Router with `getServerSideProps` redirects, dynamic routes `[P2]` `[added: 2026-03-27]`
- [ ] **demo-vue** — Vue Router with `createRouter`, `<router-link>`, guards (when Vue parser is built) `[P2]` `[added: 2026-03-27]`
- [ ] **demo-nuxt** — Nuxt with `pages/` directory, `navigateTo()`, middleware (when Nuxt parser is built) `[P2]` `[added: 2026-03-27]`
- [ ] **demo-angular** — Angular Router with lazy routes (when Angular parser is built) `[P3]` `[added: 2026-03-27]`
- [ ] **demo-sveltekit** — SvelteKit with `+page.svelte`, `goto()` (when Svelte parser is built) `[P3]` `[added: 2026-03-27]`

### Bugs / Polish
- [x] **Auto re-layout on viewport change** — Changing viewport (Desktop→Mobile) changes node height, causing nodes to overlap. Auto re-runs dagre layout when viewport preset changes `[P1]` `[done: 2026-03-27]`
- [x] **Investigate DevTools section** — Verify DevTools (Console/Network/Storage) works in right panel after moving from per-node. Test: does the iframe registry return the right ref? Does postMessage still flow? Are console entries attributed to the correct node? `[P1]` `[added: 2026-03-27]`
- [x] **Panel breathing room** — Increased spacing across all panels (section padding, row gaps, font sizes, input heights). First pass done. `[P1]` `[done: 2026-03-27]`
- [ ] **Iframe scroll handling** — When a node is selected and the user scrolls inside it, should the iframe content scroll or the canvas pan? Currently the overlay blocks scroll when not selected, and when selected pointer events pass through but scroll behavior is inconsistent. Need to decide: (1) scroll inside iframe when selected, (2) always pan canvas and never scroll iframe, or (3) hold a modifier key to switch between iframe scroll and canvas pan `[P1]` `[added: 2026-03-27]`
- [x] **Phosphor Icons** — Replaced all inline SVG icons with `@phosphor-icons/react`. Covers: ControlPanel (ArrowClockwise, Play, Monitor, PencilSimple, ArrowSquareOut, CaretDown, Minus, Plus, ArrowsClockwise, Download, FilePdf), ScreenListPanel (Browser), StatusBar (Monitor, ArrowsLeftRight, Question, X) `[P2]` `[done: 2026-03-27]`

### Phase 2+ Backlog
- [ ] **Per-node DevTools panel** — Console, Network, Application tabs per screen node `[P1]` `[added: 2026-03-23]`
  - Console: override `console.*` in iframe, forward via postMessage — **feasible**
  - Network: monkey-patch `fetch`/`XMLHttpRequest`, capture req/res metadata — **feasible**
  - Application: read `localStorage`, `sessionStorage`, cookies — **feasible**
  - Sources: show component file path + "Open in Editor" link — **feasible as editor link**
  - NOT feasible: breakpoints, step debugging, memory profiling (requires Chrome DevTools Protocol)
  - Implementation: inject `fc-devtools.js` into each iframe, collapsible tabbed panel below preview
- [ ] **State-driven screen detection** — AST analysis for useState/useReducer patterns `[P2]` `[added: 2026-03-23]`
- [ ] **Manual flow correction UI** — Drag to create/remove connections `[P2]` `[added: 2026-03-23]`
- [ ] **VS Code extension** — Canvas in a webview panel `[P2]` `[added: 2026-03-23]`
- [ ] **Export canvas as image/PDF** `[P3]` `[added: 2026-03-23]`
- [ ] **AI-assisted flow inference** `[P3]` `[added: 2026-03-23]`
- [ ] **Interactive CLI fallback** — If auto-detect fails, prompt user to pick framework + entry point. Save to `.flowcanvas/config.json` so they only answer once. `[P1]` `[added: 2026-03-26]`

### Multi-Framework Router Support (researched 2026-03-26)

**Phase 2 — P1 (highest adoption, biggest gaps)**
- [x] **React Router v7 full support** — `routes.ts` config, flat-routes filesystem, `<Form>`, `loader`/`action`, server `redirect()` `[P1]` `[done: 2026-03-26]`
- [ ] **Vue Router** — Config-based `createRouter({ routes })`, `<router-link>`, `useRouter().push()`, navigation guards `[P1]` `[added: 2026-03-26]`
- [ ] **Nuxt** — File-based `pages/` scanning, `[param]` segments, `navigateTo()`, `<NuxtLink>`, `middleware/` `[P1]` `[added: 2026-03-26]`
- [ ] **Angular Router** — Config-based `Routes[]` arrays, `routerLink`, `Router.navigate()`, lazy `loadComponent`/`loadChildren` cross-file resolution `[P1]` `[added: 2026-03-26]`

**Phase 3 — P2 (growing fast or low-effort)**
- [ ] **SvelteKit** — File-based `src/routes/`, `+page.svelte`, `goto()`, plain `<a href>` detection `[P2]` `[added: 2026-03-26]`
- [ ] **TanStack Router** — Code + file-based, `routeTree.gen.ts` auto-generated tree is parseable goldmine `[P2]` `[added: 2026-03-26]`
- [ ] **Expo Router** — File-based `app/`, mirrors Next.js conventions, `_layout.tsx`, `<Tabs>`/`<Stack>` navigators `[P2]` `[added: 2026-03-26]`
- [ ] **Astro** — File-based `src/pages/`, `.astro`/`.md`/`.mdx` files, `getStaticPaths()`, plain `<a>` links `[P2]` `[added: 2026-03-26]`

**Phase 4 — P3 (niche or declining)**
- [ ] **SolidStart** — File-based `src/routes/`, `<A href>`, JSX nearly identical to React `[P3]` `[added: 2026-03-26]`
- [ ] **Gatsby** — File-based `src/pages/` + programmatic `createPages` in `gatsby-node.js` (hard to fully parse) `[P3]` `[added: 2026-03-26]`
- [ ] **Wouter** — Lightweight React/Preact router, tiny API surface `[P3]` `[added: 2026-03-26]`
- [ ] **Inertia.js** — Server-side routes (Laravel/Rails), client `<Link>`, `router.visit()` — hardest to parse `[P3]` `[added: 2026-03-26]`

---

## In Progress

_Nothing in progress._

---

## Done

- [x] **Deep parser audit + comprehensive fix (round 3)** — Validated against official docs, fixed all critical gaps `[done: 2026-03-26]`
  - React Router v7 framework mode: routes.ts config (route/index/layout/prefix), flat-routes filesystem ($param, _index, dot-nesting, ($optional), [escaped], folder/route.tsx), flatRoutes() rootDirectory support
  - Framework detection: @react-router/dev, @react-router/node, @react-router/cloudflare, react-router.config.ts
  - Next.js: next.config.ts support, basePath/trailingSlash/pageExtensions extraction, proxy.ts (v16 middleware rename)
  - Next.js: getServerSideProps/getStaticProps redirect detection, Server Action ('use server') redirect scanning
  - Next.js: loading.tsx, error.tsx, global-error.tsx, not-found.tsx, template.tsx, forbidden.tsx, unauthorized.tsx awareness
  - Link detector: relative path resolution (../settings, ./edit, ..), fetcher.Form (JSXMemberExpression), Link href as object, forbidden()/unauthorized() functions
  - Removed phantom replace() export, validated against reactrouter.com and nextjs.org docs
- [x] **Parser final audit + fix (round 2)** — Second doc scrape found 10 more gaps, all fixed `[done: 2026-03-23]`
  - Object form href {{ pathname }}, useRoutes() hook, createRoutesFromElements wrapping
  - route.ts scanning for edges, fetcher.load/submit, NextResponse.redirect/rewrite
  - middleware.ts/proxy.ts scanning, cross-file route imports, notFound(), next.config redirects/rewrites
- [x] **Parser comprehensive gap fix (round 1)** — Scraped Next.js + React Router docs, fixed all detected gaps `[done: 2026-03-23]`
  - Next.js: parallel routes @folder, intercepting routes, route.ts anywhere, %5F prefix, optional catch-all, conflict detection
  - React Router: JSX <Route>/<Routes> detection, pathless layout routes, splat routes
  - Link detector: <Navigate to>, redirect()/permanentRedirect(), <Form action>, useSubmit(), window.history API, router.prefetch()
- [x] **Zoom-level threshold + staggered iframe loading** — Figma-inspired lifecycle management `[done: 2026-03-23]`
  - Placeholder at overview zoom, screenshots at mid zoom, live iframe when focused
  - Concurrency queue (max 2) prevents dev server overload
- [x] **Iframe wheel forwarding** — Scroll-to-zoom works over iframes via postMessage forwarding `[done: 2026-03-23]`
- [x] **Trackpad pan** — panOnScroll + panOnScrollSpeed for Figma-like trackpad navigation `[done: 2026-03-23]`
- [x] **Max zoom increased to 4x** — Can zoom deep into node previews `[done: 2026-03-23]`
- [x] **Fix node centering on navigate** — Using fitView with padding + maxZoom cap `[done: 2026-03-23]`
- [x] **Verify Login → Dashboard submit flow** — Confirmed working `[done: 2026-03-23]`
- [x] **Active node connectors highlight** — Edges turn indigo when node is active `[done: 2026-03-23]`
- [x] **Active node state** — Indigo glow + header change on navigated/clicked node `[done: 2026-03-23]`
- [x] **PoC: Navigation interception** — postMessage bridge for link clicks `[done: 2026-03-23]`
- [x] **PoC: Scaffold demo-app and canvas** — Both apps running (demo-app :5173, canvas :4200) `[done: 2026-03-23]`
