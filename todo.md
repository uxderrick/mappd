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
- [x] ~~**Export as PDF**~~ — Removed in favor of PNG-only export `[P2]` `[removed: 2026-03-28]`
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
- [x] **Figma-style panel hierarchy and spacing** — All 10 points implemented: header as identity, sentence case titles, subtler borders, breathable spacing, inline editable zoom, consistent layout, collapsible sections with SVG chevrons, muted hierarchy, icon-only actions, collapsed one-liner summaries `[P1]` `[done: 2026-03-27]`
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
- [x] **demo-react-router-v6** — Already built (React Router v6, Vite, 10 routes, state patterns) `[P1]` `[done: 2026-03-27]`
- [x] **demo-react-router-v7** — Already built `[P1]` `[done: 2026-03-27]`
- [x] **demo-nextjs-app** — Already built `[P1]` `[done: 2026-03-27]`
- [ ] **Add scroll-heavy pages to all demo apps** — Each demo app needs pages that test hug content: (1) Long static page (terms/data table with 50+ rows), (2) Lazy-loaded content (fetch → render, tests MutationObserver height re-reporting), (3) Infinite scroll feed (tests 3x height cap). Add to all 3 existing demos (v6, v7, nextjs-app) `[P1]` `[added: 2026-03-28]`
- [ ] **demo-nextjs-pages** — Next.js Pages Router with `getServerSideProps` redirects, dynamic routes `[P2]` `[added: 2026-03-27]`
- [ ] **demo-vue** — Vue Router with `createRouter`, `<router-link>`, guards (when Vue parser is built) `[P2]` `[added: 2026-03-27]`
- [ ] **demo-nuxt** — Nuxt with `pages/` directory, `navigateTo()`, middleware (when Nuxt parser is built) `[P2]` `[added: 2026-03-27]`
- [ ] **demo-angular** — Angular Router with lazy routes (when Angular parser is built) `[P3]` `[added: 2026-03-27]`
- [ ] **demo-sveltekit** — SvelteKit with `+page.svelte`, `goto()` (when Svelte parser is built) `[P3]` `[added: 2026-03-27]`

### Real-World Parser Improvements (from research — 2026-03-28)

**Phase 1 — Parser routing gaps (do now):**
- [ ] **Resolve path config indirections** — Detect `paths.app.root.path` config objects and resolve to actual path strings. Bulletproof React pattern. `[P1]` `[added: 2026-03-28]`
- [ ] **Unwrap lazy loading patterns** — Detect `lazy: () => import(...)` (RR native), `React.lazy(() => import(...))`, and custom wrappers like `dynamicElement()`. Resolve the import path to the component file. `[P1]` `[added: 2026-03-28]`
- [ ] **Detect re-exported getServerSideProps** — Follow imports when `getServerSideProps` is imported from a utility module, not defined inline. Cal.com pattern. `[P1]` `[added: 2026-03-28]`
- [ ] **Handle RR v7 `clientLoader`/`clientAction`** — Detect client-side data fetching exports alongside server `loader`/`action`. `[P1]` `[added: 2026-03-28]`
- [ ] **Handle RR v7 `layout()` and `prefix()` helpers** — `layout()` wraps children with no URL segment, `prefix()` adds URL prefix with no layout. Both in routes.ts. `[P1]` `[added: 2026-03-28]`
- [ ] **Handle resource routes** — `.ts` files (not `.tsx`) that export only loaders, no default component. Exclude from screen nodes. `[P1]` `[added: 2026-03-28]`
- [ ] **Handle `_components/` excluded directories** — Underscore prefix on directories opts them out of routing (different from `_layout` pathless routes). `[P1]` `[added: 2026-03-28]`
- [ ] **Handle three Pages Router layout patterns** — `getLayout` (canonical), inline `<AppLayout>` wrapping, `Component.PageWrapper` (Cal.com custom). `[P2]` `[added: 2026-03-28]`
- [ ] **Handle intent-based forms** — Multiple submit buttons with `name="intent" value="update|delete"` as different navigation triggers in RR v7 actions. `[P2]` `[added: 2026-03-28]`
- [ ] **Handle `import.meta.glob` route discovery** — Vite convention-based routing where files matching a glob become routes. `[P3]` `[added: 2026-03-28]`

**Phase 2 — State detection gaps (next):**
- [ ] **Detect Zustand stores** — `create()`, `persist` middleware, `subscribeWithSelector`. Map store shape to state values. LobeChat has 25 store modules. `[P1]` `[added: 2026-03-28]`
- [ ] **Detect Redux stores** — `createSlice`, `useSelector`, `useDispatch`. Map selectors to state shapes. `[P1]` `[added: 2026-03-28]`
- [ ] **Detect URL search params as state** — `useSearchParams()` from react-router, `nuqs` library. Pagination, filters, redirects stored in URL. `[P1]` `[added: 2026-03-28]`
- [ ] **Detect React Query/SWR/tRPC** — Server state cache. Not overridable via hooks but drives UI significantly. At minimum, detect query keys and endpoints. `[P2]` `[added: 2026-03-28]`

**Phase 3 — Canvas UX for large apps (after):**
- [ ] **Route grouping/filtering** — Real apps have 50+ routes. Need collapsible groups, search, filter by path prefix. `[P2]` `[added: 2026-03-28]`
- [ ] **Auth flow visualization** — Show which routes are protected, redirect chains, guard components. `[P2]` `[added: 2026-03-28]`
- [ ] **Lazy loading indicators** — Show which routes are code-split on the canvas. `[P3]` `[added: 2026-03-28]`
- [ ] **Server vs client component markers** — Next.js App Router: visually distinguish server and client components. `[P3]` `[added: 2026-03-28]`

### Bugs / Polish
- [x] **Auto re-layout on viewport change** — Changing viewport (Desktop→Mobile) changes node height, causing nodes to overlap. Auto re-runs dagre layout when viewport preset changes `[P1]` `[done: 2026-03-27]`
- [x] **Investigate DevTools section** — Verify DevTools (Console/Network/Storage) works in right panel after moving from per-node. Test: does the iframe registry return the right ref? Does postMessage still flow? Are console entries attributed to the correct node? `[P1]` `[added: 2026-03-27]`
- [x] **Panel breathing room** — Increased spacing across all panels (section padding, row gaps, font sizes, input heights). First pass done. `[P1]` `[done: 2026-03-27]`
- [ ] **Iframe scroll handling** — Scroll toggle (mouse icon in header) partially implemented but not working reliably. Root cause: React Flow's `panOnScroll` overrides the `nowheel` class (known bug #1322). Attempted fixes: (1) toggle `panOnScroll` off when scroll mode active, (2) add `nowheel nopan` classes to active node, (3) `fc-scroll-mode` postMessage to stop inject script forwarding wheel events. Still conflicts with React Flow's event handling. May need: custom wheel handler wrapper around ReactFlow, or an Electron approach with `webContents` that bypasses iframe sandboxing entirely `[P2]` `[added: 2026-03-27]`
- [x] **Export selected screen** — When a node is selected, exports just that screen (Puppeteer screenshot). When no node selected, exports the full canvas `[P1]` `[done: 2026-03-28]`
- [x] **State override not working** — All three issues addressed: iframe registry handles null refs safely, mappd-inject.js installs hook before React loads, overrideHookState uses dispatch-first strategy with DevTools fallback `[P1]` `[done: 2026-03-28]`
- [x] **Phosphor Icons** — Replaced all inline SVG icons with `@phosphor-icons/react`. Covers: ControlPanel (ArrowClockwise, Play, Monitor, PencilSimple, ArrowSquareOut, CaretDown, Minus, Plus, ArrowsClockwise, Download, FilePdf), ScreenListPanel (Browser), StatusBar (Monitor, ArrowsLeftRight, Question, X) `[P2]` `[done: 2026-03-27]`

### Phase 2+ Backlog
- [x] **Per-node DevTools panel** — Console, Network, Storage tabs built. Moved from per-node to right panel (Figma-style). Uses iframe registry + postMessage for data flow `[P1]` `[done: 2026-03-27]`
- [x] **State-driven screen detection** — AST analysis for useState/useReducer patterns. Parser detects state hooks, canvas overrides them via fiber dispatch. Works for React Router v6/v7, Next.js App/Pages `[P2]` `[done: 2026-03-28]`

### State Override Matrix (roadmap)
**Currently supported:**
- [x] React `useState` (primitives) — via `queue.dispatch(value)` `[done: 2026-03-28]`
- [x] React `useReducer` (single-key state, SET_KEY convention) — via `queue.dispatch({ type: 'SET_KEY', payload: value })` `[done: 2026-03-28]`

**Phase 2 — React ecosystem stores:**
- [ ] **Zustand** — override via `store.setState()`. Parser detects `create()` store definitions, inject script calls `setState` directly `[P1]`
- [ ] **Redux / Redux Toolkit** — override via `store.dispatch()`. Parser detects `createSlice`, inject script dispatches actions `[P1]`
- [ ] **React Context** — state lives in a Provider higher up the tree. Need to walk fiber tree to find the Provider and override its state `[P2]`
- [ ] **Jotai / Recoil** — atom-based, override via `store.set(atom, value)` `[P2]`
- [ ] **MobX** — observable-based, override via direct property mutation `[P3]`
- [ ] **URL state** (search params, hash) — override via `history.replaceState` with new params `[P2]`

**Phase 3 — Non-React frameworks (build alongside parsers):**
- [ ] **Vue** — `ref()` / `reactive()` / Pinia stores. Vue DevTools has its own hook protocol `[P1]`
- [ ] **Svelte** — `$state` / stores. Svelte DevTools protocol `[P2]`
- [ ] **Angular** — signals / RxJS / NgRx. Angular DevTools protocol `[P2]`

**Known limitations:**
- Custom reducers with non-standard action formats (e.g., `{ kind: 'navigate' }` instead of `{ type: 'SET_X' }`)
- Custom hooks that wrap multiple `useState` calls (hook index mismatch between parser AST and runtime)
- React Server Components (no client-side hooks to override)
- Server state (React Query, SWR, tRPC) — cached responses, not overridable via hooks
- [ ] **Manual flow correction UI** — Drag to create/remove connections `[P2]` `[added: 2026-03-23]`
- [ ] **VS Code extension** — Canvas in a webview panel `[P2]` `[added: 2026-03-23]`
- [x] **Export canvas as image** — PNG export built into control panel (PDF removed — PNG covers all use cases) `[P3]` `[done: 2026-03-27]`
- [ ] **AI-assisted flow inference** `[P3]` `[added: 2026-03-23]`
- [x] **Interactive CLI fallback** — 3-question prompt when auto-detect fails: framework (4 choices with dep scanning to highlight detected), entry point (with validation + 3 retries), port (auto-detected from package.json scripts). Saves to `.mappd/config.json`. `[P1]` `[done: 2026-03-27]`

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
