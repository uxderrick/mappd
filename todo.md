# FlowCanvas — TODO

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
- [x] **CLI tool** — `flowcanvas dev` parses, serves, watches `[P1]` `[done: 2026-03-23]`
- [x] **Route parser: React Router v6+** — AST analysis to auto-detect routes `[P1]` `[done: 2026-03-23]`
- [x] **Route parser: Next.js** — App Router + Pages Router file-system scanning `[P1]` `[done: 2026-03-23]`
- [x] **Navigation link detection** — Scan for `<Link>`, `useNavigate()`, `router.push()` `[P1]` `[done: 2026-03-23]`
- [x] **Auto-layout** — Dagre left-to-right positioning `[P1]` `[done: 2026-03-23]`
- [x] **Canvas integration** — Canvas fetches parsed flow-graph.json instead of hardcoded data `[P1]` `[done: 2026-03-23]`
- [x] **State pinning UI** — Global auth + per-node URL params, pin panel sidebar `[P1]` `[done: 2026-03-23]`
- [x] **File watcher + WebSocket** — chokidar watches source, re-parses, broadcasts via WebSocket `[P1]` `[done: 2026-03-23]`

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
- [ ] **Multi-framework support** — Vue, Svelte `[P3]` `[added: 2026-03-23]`

---

## In Progress

_Nothing in progress._

---

## Done

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
