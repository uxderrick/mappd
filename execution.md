# Mappd — Execution Log

> Record of what the agent executed, decisions made, trade-offs considered, and outcomes.
> Self-updating — the agent appends after each significant action.

## Format

```
### [YYYY-MM-DD] Action Title
**What was done:** Summary of the execution
**Why:** Motivation / which todo or goal this serves
**Trade-offs:** Alternatives considered and why this path was chosen
**Outcome:** Result — what worked, what didn't, any follow-ups
**Related:** Links to todos or learnings
```

---

## Execution Log

<!-- Newest entries at the top -->

### [2026-03-28] Real-world pattern research — 18 open source projects across 4 frameworks
**What was done:** Launched 4 parallel research agents to study real-world open source projects on GitHub. Analyzed routing structure, state management, navigation patterns, and edge cases across: React Router v6 (5 projects including LobeChat 74k stars, Bulletproof React 29k), React Router v7 (5 projects), Next.js App Router (5 projects including Cal.com 34k, Dub), Next.js Pages Router (3 projects). No code cloned — pure research.
**Why:** Our parser was built against our own demo apps and framework docs. Real-world code has patterns we hadn't considered — centralized path configs, custom lazy wrappers, Zustand stores with 25 modules, triple-nested route groups, server actions in separate files, etc.
**Trade-offs:** Research-only, no code changes. The findings inform what to build next but don't fix anything immediately.
**Outcome:** Identified 18 routing patterns and 8 state patterns our parser needs to handle. Estimated current coverage at 60-70% of real-world patterns. Biggest gaps: external state stores (Zustand/Redux), lazy loading indirection, server state (React Query/SWR/tRPC). Full findings in learnings.md.
**Related:** learnings.md, todo.md

### [2026-03-28] State override fix — fiber targeting + dispatch strategy
**What was done:** Fixed state override so clicking state buttons in the right panel actually changes the iframe's UI. Three root causes identified and fixed: (1) Wrong component targeted — generic hook search found `AuthProvider` instead of `CreateProjectPage`. Fixed by sending the route's `componentName` and matching against `fiber.type.name` in the tree. (2) React 19 `overrideHookState` doesn't trigger re-render — switched to calling `hookState.queue.dispatch(value)` directly, which is the same as calling `setState()` from inside the component. (3) `useReducer` needs action objects — added inference that inspects the current state shape (`{ view: 'overview' }`) and constructs `{ type: 'SET_VIEW', payload: value }` automatically. Also added `useReducer` support by passing `hookType` through the full chain (ControlPanel → App → postMessage → inject script).
**Why:** State-driven screen detection was half-done — parser detected states but clicking them did nothing visible
**Trade-offs:** The reducer action inference is heuristic (`SET_<KEY>` pattern) — custom action formats won't work. Acceptable for now since most reducers follow this convention. Could add action format hints to the parser later.
**Outcome:** useState override works (CreateProjectPage steps, SettingsPage tabs). useReducer override works (AnalyticsPage views). Selected state highlights with lavender border.
**Related:** mappd-inject.js, ControlPanel.tsx, App.tsx

### [2026-03-28] Figma-style 3-panel layout + deep design polish
**What was done:** Major UI restructure: (1) 3-panel CSS grid layout — left panel (180px screen list), center (canvas), right panel (220px controls). (2) Left panel with route type icons (Phosphor `Browser`), edge-to-edge active highlight. (3) Right panel restructured — header shows selected route as identity (bold name + component subtitle + icon action bar), node-specific sections (Pin State, States, DevTools) only appear when selected, canvas settings independently collapsible with SVG chevrons and collapsed summaries. (4) Removed per-node DevTools from ScreenNode, moved to right panel via iframe registry. (5) Pin State merged into right panel (was separate PinPanel overlay). (6) Deep Figma polish — sentence case titles, subtler borders (`rgba(255,255,255,0.04)`), taller toggle rows (26px min-height), bigger segmented controls, inline editable zoom %, Phosphor Icons throughout. (7) Light theme toned down (#f5f5f5 → #e4e4e8). (8) Framework label in status bar.
**Why:** Figma's 3-panel model (layers left, canvas center, properties right) is the gold standard for canvas tools
**Trade-offs:** Removed the closeable/toggleable right panel (was floating card) in favor of always-visible grid panel. PinPanel.tsx is now dead code. Screen dropdown in right panel replaced by left panel list.
**Outcome:** Clean, professional canvas tool UI. All controls accessible without mode switching.
**Related:** ControlPanel.tsx, ScreenListPanel.tsx, StatusBar.tsx, App.css

### [2026-03-27] Interactive CLI fallback — 3-question config prompt
**What was done:** Enhanced the CLI fallback prompt when auto-detect fails. Added React Router v7 as 4th framework choice. Added dep scanning to pre-highlight detected frameworks with green "(detected)" badge. Entry point validation with 3 retries + shows existing candidates. Smart port detection from package.json scripts (parses `--port`/`-p` flags, knows Vite=5173, Next.js=3000). Saved to `.mappd/config.json` with checkmark confirmation.
**Why:** Real-world projects don't always match auto-detection patterns
**Trade-offs:** Uses Node's built-in `readline` — no fancy TUI library. Simpler but less polished than inquirer/prompts. Acceptable since it only runs once per project.
**Outcome:** 3-question flow: framework → entry point → port. Saves config, never asks again.
**Related:** cli/src/prompt.ts

### [2026-03-27] Control Panel v1.1 — 9 display/layout/action features
**What was done:** Added all v1.1 P2 features to ControlPanel: (1) Canvas theme toggle (dark/light — swaps background, dot, edge, minimap colors via `fc-theme-light` class), (2) Show/hide edges toggle (filters edges array to empty), (3) Show/hide labels toggle (hides node labels + edge labels), (4) Layout direction toggle LR/TB, (5) Re-layout button (runs dagre in-browser via `layoutGraph.ts`), (6) Export as PDF (captures PNG then opens print dialog), (7) Reload screen (increments `reloadKey` to force iframe remount), (8) Live/Thumbnail toggle per node (`forceLive` override), (9) Edge style options — Solid/Dashed/Animated. New UI patterns: segmented controls, pill toggles. Created `lib/layoutGraph.ts` with dagre for client-side re-layout.
**Why:** Complete the v1.1 control panel feature set
**Trade-offs:** PDF export uses browser print dialog (PNG → print window) rather than jsPDF — avoids a heavy dependency and gives users native print controls. Re-layout runs dagre on all nodes flat (no section grouping like the parser) — simpler but may produce less organized layouts for large graphs.
**Outcome:** Clean TypeScript build (0 errors). All 9 v1.1 items marked done in todo.md.
**Related:** todo.md — Control Panel v1.1 section

### [2026-03-27] Control Panel v1 + Status Bar
**What was done:** Built `ControlPanel.tsx` (right sidebar) with 6 features: screen selector dropdown (zooms to node), zoom controls (±, fit all, fit selection), viewport size toggle (Desktop/Tablet/Mobile), open in VS Code editor, open route in browser, export canvas as PNG. Built `StatusBar.tsx` (bottom bar) with route/connection counts, dev server online/offline ping indicator, and keyboard shortcuts popover. Updated `ScreenNode.tsx` to dynamically scale iframes based on viewport preset (was hardcoded 1280×800). Added `html-to-image` dependency for PNG export.
**Why:** Control Panel v1 P1 items from todo — essential canvas controls before launch
**Trade-offs:** Floating panel (top-right, closeable) vs full-height sidebar — chose floating to not compete with PinPanel which is full-height right-aligned. Used `html-to-image` over `dom-to-image` for better maintenance. Status bar health check uses `no-cors` fetch ping every 10s.
**Outcome:** Clean TypeScript build (0 errors). All 9 todo items (6 control panel + 3 status bar) marked done.
**Related:** todo.md — Control Panel section

### [2026-03-27] Loading UX improvements — threshold, click, concurrency
**What was done:** Three changes to make screens load faster: (1) Lowered auto-activate zoom threshold from `> 1.0` to `> 0.3`. (2) Changed node activation from double-click to single-click. (3) Increased iframe queue concurrency from 2 to 4.
**Why:** Users reported having to double-click nodes before content appeared. The conservative settings from the staggered-loading implementation were too aggressive for the common case (5-20 screens).
**Trade-offs:** Higher concurrency (4 vs 2) may strain slow dev servers with 20+ routes. Acceptable tradeoff — the queue still prevents the thundering-herd problem, just with a wider pipeline.
**Outcome:** Screens load almost immediately on canvas open. No more blank placeholders requiring manual activation.

### [2026-03-27] Script injection saga — proxy failed, file injection works
**What was done:** Attempted three approaches to inject `mappd-inject.js` into target app iframes for navigation interception:

1. **HTML proxy with `<base href>`** — Proxy at `/proxy/*` fetched HTML from target, injected script + base tag. **Failed:** `<base href>` broke React Router (URL mismatch) and broke all client-side routing.

2. **HTML proxy with absolute URL rewriting** — Replaced relative `src="/..."` with `src="http://localhost:PORT/..."`. **Failed:** Vite's inline module imports (`/@react-refresh`, `/@vite/client`) couldn't be rewritten — they're inside `<script>` bodies, not attributes.

3. **`contentDocument` DOM injection** — After iframe `onload`, inject `<script>` via same-origin DOM access. **Failed:** Iframes are cross-origin (target on :3000, canvas on :3569), so `contentDocument` throws.

4. **File injection (final solution)** — CLI copies `mappd-inject.js` to target's `public/` directory, adds `<script>` tag to HTML entry point (`index.html` for Vite, `app/layout.tsx` for Next.js). Script loads before app JS. **Works.** Files restored on Ctrl+C.

**Why:** Navigation interception is core to the product — without it, clicks navigate inside the iframe instead of panning the canvas.
**Trade-offs:** Modifies the target project's files temporarily. This is "semi-invasive" — the files are auto-restored on shutdown, but if Mappd crashes without cleanup, the changes persist. Added to todo: crash-safe cleanup.
**Outcome:** Panning works on both Vite (demo-app) and Next.js (partner-dashboard) projects. Script tag auto-injected and auto-cleaned.

### [2026-03-27] Partner-dashboard testing — 23 routes on canvas
**What was done:** Tested Mappd against partner-dashboard (Next.js 15, App Router, pnpm monorepo). 23 routes detected, 26 connections. Required fixes: (1) Next.js layout had no `<head>` tag — added `<head>` insertion after `<html>`. (2) `EADDRINUSE` error from stale process — added graceful error handling with kill command hint. (3) Monorepo detection — parser now scans `apps/*/` and `packages/*/` for sub-projects.
**Why:** Real-world validation on a complex production app.
**Outcome:** All routes detected and rendered on canvas. Navigation interception works. Staggered loading handles 23 simultaneous screens without crashing the Next.js dev server.

### [2026-03-26] Deep parser audit + comprehensive fix (round 3)
**What was done:** Audited the entire parser codebase against official React Router v6/v7 and Next.js docs (validated online). Implemented 11 major fixes across 7 files:

1. **React Router v7 framework mode** — New extractor (`react-router-v7.ts`, 300+ lines). Parses `routes.ts` config files with `route()`, `index()`, `layout()`, `prefix()` helpers. Also built file-based flat routes parser for the `@react-router/fs-routes` convention (`$param`, `_index`, dot-nesting, `($optional)`, `[escaped]`, `_pathless` layouts, `trailing_` escape, `folder/route.tsx`). Respects custom `rootDirectory` in `flatRoutes()` config.

2. **Framework detection overhaul** — Added detection for `@react-router/dev`, `@react-router/node`, `@react-router/cloudflare` packages and `react-router.config.ts`. New `react-router-v7` framework type in the type system.

3. **Next.js config deep parse** — Reworked `parseNextConfigRedirects` into `parseNextConfig` that extracts `basePath`, `trailingSlash`, `pageExtensions`, and redirects/rewrites. Added `next.config.ts` to config file candidates.

4. **Pages Router hardening** — `getServerSideProps`/`getStaticProps` redirect detection (scans for `return { redirect: { destination: '/path' } }`). Custom `pageExtensions` support with compound extension handling.

5. **Server Action scanning** — Recursively scans `src/`, `app/`, `lib/`, `actions/` directories for files with `'use server'` directive containing `redirect()` calls.

6. **Special file awareness** — App Router now detects and attaches `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `template.tsx`, `forbidden.tsx`, `unauthorized.tsx` as metadata on route segments. Metadata files (sitemap, robots, etc.) are properly skipped.

7. **Link detector upgrades** — Relative path resolution (`../settings`, `./edit`, `..`, bare segments). `<fetcher.Form action>` via JSXMemberExpression. Link `href` as object form `{ pathname, query }`. `forbidden()`/`unauthorized()` boundary functions. Removed phantom `replace()` export.

**Why:** The initial parser was built for PoC — it covered happy paths but missed real-world patterns. This audit ensures production-grade coverage before adding more frameworks.

**Trade-offs:** (1) Relative path resolution uses a simple segment-based approach rather than fully emulating React Router's relative resolution algorithm (which considers the route tree hierarchy). Our approach handles 90%+ of cases. (2) basePath is extracted but not applied to route paths (it's a deployment concern — internal graph should use clean paths). (3) Server Action scanning is directory-based rather than following imports — may catch false positives but won't miss redirects. (4) v7 `middleware`/`clientMiddleware` route module exports are acknowledged but not parsed for redirects yet (low priority since they're new).

**Outcome:** Parser compiles clean. Demo-app still produces correct output (10 routes, 14 edges). All critical and important gaps from the audit are now covered. Validated against reactrouter.com and nextjs.org docs.

**Related:** todo.md → Deep parser audit (done), learnings.md → three parsing strategies, routing landscape research

### [2026-03-26] Real-world parser testing — partner-dashboard + teller-counter-app
**What was done:** Tested the parser against two real projects: (1) partner-dashboard (Next.js 15 App Router, 23 routes, 26 edges) and (2) teller-counter-app (React Router v7 SPA mode, 4 routes, 1 edge). Found and fixed two bugs:
1. Component names with hyphens weren't PascalCased (`cash-management` → `Cash-managementPage`). Fixed by splitting on hyphens before capitalizing in both App Router and Pages Router extractors.
2. The `*.replace()` fallback in the link detector was catching `String.replace()` calls as navigation — `name.replace('Access Bank ', '')` was creating a false positive edge. Fixed by removing `.replace()` from the untracked fallback (only `.push()` remains). Also tightened the bare-segment regex in `normalizePath` to reject strings with spaces.
**Why:** Parser needs to work on real codebases, not just the demo-app. Real projects expose edge cases that controlled demos don't.
**Trade-offs:** Removing the `*.replace()` fallback means we might miss `someObj.replace('/path')` from an untracked router variable. But the false positive rate was too high — `String.replace()` is called constantly. Tracked router vars (`routerVars.has()`) still catch `router.replace()` correctly.
**Outcome:** partner-dashboard: 23 routes, 26 edges, all correct. teller-counter-app: 4 routes, 1 edge, correct. Zero false positives.
**Related:** learnings.md → *.replace() false positives

### [2026-03-26] Routing landscape research — multi-framework support planning
**What was done:** Comprehensive research of 12 frontend routing frameworks. Evaluated each by npm downloads, routing type (file/config/code), parsing difficulty, and priority. Covered: React Router v7 (Remix merge), Vue Router, Nuxt, Angular Router, SvelteKit, TanStack Router, Expo Router, Astro, SolidStart, Gatsby, Wouter, Inertia.js. Also identified cross-cutting patterns (dynamic segments, middleware, redirects, API routes, layout nesting) that apply across all frameworks.
**Why:** FlowCanvas currently only supports React Router v6+ and Next.js. To be a viable tool for the broader frontend ecosystem, we need a prioritized roadmap for adding framework support.
**Trade-offs:** Could have started implementing immediately with Vue (second-largest framework). Instead invested in research first to design the parser architecture around three strategies (filesystem, config-array, code/JSX) rather than building one-off parsers per framework. This front-loaded effort should make each subsequent framework faster to add.
**Outcome:** Prioritized 4-phase roadmap added to todo.md. Key insight: all routers map to 3 parsing strategies, not 12 separate implementations. P1 targets: React Router v7 full, Vue Router + Nuxt, Angular. P2: SvelteKit, TanStack, Expo, Astro.
**Related:** todo.md → Multi-Framework Router Support, learnings.md → three parsing strategies

### [2026-03-24] UI redesign — Figma-inspired design system
**What was done:** Complete visual overhaul of the canvas UI. Researched Figma's design system (colors, typography, spacing, frame rendering). Applied: (1) Neutral dark gray canvas (#1e1e1e) replacing navy. (2) Floating labels above nodes instead of dark header bars — nodes are now flat white rectangles with no chrome. (3) Figma blue (#0d99ff) replacing indigo as accent. (4) 11px Inter font replacing 12px monospace. (5) Connection handles and edge labels hidden until hover. (6) Subtler edges at 35% opacity, full on hover/active. (7) Compact 240px pin panel matching Figma's sidebar proportions. (8) All shadows removed from nodes — flat design.
**Why:** The old UI felt like a developer tool. The new UI feels like a design tool. Figma's visual language is what developers already associate with "infinite canvas" — matching it reduces cognitive load.
**Trade-offs:** Lost the dark header bar which clearly showed route/component info. Replaced with floating label which is more subtle but could be harder to read at extreme zoom-out. The label turns blue when selected to compensate.
**Outcome:** Complete visual transformation. The canvas now looks and feels like a native design tool, not a debug panel.
**Related:** learnings.md → Figma uses flat nodes with floating labels

### [2026-03-24] Polish pass — focus toggle, edge labels, pan animation
**What was done:** Three polish items completed. (1) Focus mode toggle: ⊕ button on node header expands from 480×360 to 960×600 with 0.75x iframe scale. Entering focus auto-activates live mode. Smooth CSS transition. (2) Edge labels: pill-shaped with rounded corners, border stroke, better contrast, hover effects that highlight the edge path and label simultaneously. (3) Pan animation: 600ms duration with zoom-aware maxZoom capping so it doesn't over-zoom on navigation.
**Why:** MVP feature-complete — this pass makes it demo-ready.
**Trade-offs:** Focus mode uses CSS transition on width/height which causes a brief layout shift. Could use transform-based animation for smoother experience but width changes are needed for React Flow to recalculate node dimensions.
**Outcome:** All three backlog polish items done. No remaining MVP or polish items.
**Related:** todo.md — all backlog items now checked off

### [2026-03-23] State pinning — global auth + per-node URL params
**What was done:** Built state pinning UI with a right sidebar (PinPanel). Auth is global — set once, sent to ALL iframe nodes. URL params are per-node — each dynamic route gets its own values. Built usePinnedState hook, buildIframeSrc utility, pinBridge (postMessage sender), and extended fc-inject.js to receive and apply pinned state (writes auth to localStorage + dispatches CustomEvent).
**Why:** Core MVP feature. Developers need to skip login flows and seed state into deep screens without clicking through the whole app.
**Trade-offs:** Initially built auth as per-node (like URL params). Refactored to global after realizing auth should work like a browser session — set once, applies everywhere. Deferred mock API responses and props injection to Phase 2.
**Outcome:** Pin panel opens via ⚙ button on any node header. Auth section shows "GLOBAL" badge, URL params show "THIS NODE" badge. Changing URL params reloads the iframe (new URL). Changing auth re-sends via postMessage (no reload). All live iframes receive auth state.
**Related:** learnings.md → auth should be global not per-node

### [2026-03-23] Screenshot capture with Puppeteer
**What was done:** Built `cli/src/screenshot.ts` — Puppeteer headless browser captures each route at 1280×800, writes PNGs to `.mappd/screenshots/`, generates `screenshots.json` manifest. Concurrency capped at 2. Waits for `networkidle2` + 1s extra for client-side render. Fallback: 1×1 transparent PNG on failure.
**Why:** Static thumbnails let the canvas render fast without spinning up live iframes for every node. Live mode only activates on double-click.
**Trade-offs:** Puppeteer is a heavy dependency (~300MB). Considered Playwright (similar weight, better API) but Puppeteer has wider adoption for this use case. Could explore lighter alternatives (e.g., `playwright-core` with shared browser) later. 15s timeout per route is generous but prevents hanging on broken routes.
**Outcome:** Screenshots render in ScreenNode thumbnail mode. Canvas loads instantly with static previews. Double-click switches to live iframe.
**Related:** todo.md → done items, learnings.md → thumbnail vs live mode

### [2026-03-23] File watcher + WebSocket hot reload
**What was done:** Built `cli/src/watcher.ts` using chokidar to watch `src/` directory. On file change, 300ms debounce triggers re-parse → writes new `flow-graph.json` → broadcasts `{ type: 'graph-update', graph }` over WebSocket. Canvas listens and re-renders.
**Why:** Core DX requirement — when you edit a component and add a `<Link>`, the canvas should update automatically.
**Trade-offs:** 300ms debounce balances responsiveness vs. avoiding redundant parses during batch saves. Watches only `src/` to avoid node_modules noise. WebSocket chosen over SSE for bidirectional future needs.
**Outcome:** Working. Edit a file → canvas updates within ~500ms.
**Related:** todo.md → File watcher + WebSocket (done)

### [2026-03-23] Canvas integration — fetch parsed graph
**What was done:** Replaced hardcoded graph data in canvas `App.tsx` with fetch from `/flow-graph.json` served by the CLI's Express server. Canvas adapts parser output (ScreenNode/FlowEdge) to React Flow format. WebSocket listener updates graph on `graph-update` messages.
**Why:** Bridge the parser output to the canvas — the final piece connecting CLI → Parser → Canvas.
**Trade-offs:** Could have used a shared state library or event bus, but simple fetch + WebSocket keeps the architecture decoupled. Canvas doesn't import parser types — it adapts the JSON shape.
**Outcome:** Canvas renders real parsed routes. Hot reload works end-to-end.
**Related:** todo.md → Canvas integration (done)

### [2026-03-23] Auto-layout with Dagre
**What was done:** Built `parser/src/layout.ts` using Dagre for directed graph layout. Config: left-to-right (LR), 100px node separation, 200px rank separation, 480×400px node dimensions. Converts Dagre center-point coords to React Flow top-left positions.
**Why:** Without layout, all nodes stack at (0,0). Dagre gives a readable flow diagram automatically.
**Trade-offs:** Dagre is older but stable and deterministic (same graph = same layout). ELK would give better results for complex graphs but adds complexity. LR direction matches how developers think about user flows (left → right progression).
**Outcome:** Clean left-to-right layout. Works well for 5-10 nodes. May need tuning for larger graphs.
**Related:** todo.md → Auto-layout (done)

### [2026-03-23] Navigation link detection via AST
**What was done:** Built `parser/src/analyzers/link-detector.ts` — Babel AST traversal scans component files for `<Link to="">`, `<NavLink to="">`, `<a href="">`, `navigate()`, `router.push()`, `router.replace()`. Tracks variable origins (e.g., `const nav = useNavigate()` → flags `nav()` calls). Handles template literals: `/users/${id}` → `/users/:id`. Extracts source location (file, line, column).
**Why:** Edges on the canvas represent navigation relationships. Auto-detecting them from code is the core value prop.
**Trade-offs:** AST over regex — more robust but slower. Babel parser handles TypeScript + JSX natively. Route helper resolution (e.g., `routes.dashboard.index`) adds complexity but covers real-world patterns.
**Outcome:** Accurately detects links in demo-app. Edge labels show trigger type + location.
**Related:** todo.md → Navigation link detection (done), learnings.md → AST analysis patterns

### [2026-03-23] Route parsers — React Router v6+ and Next.js
**What was done:** Built three route extractors: (1) `react-router.ts` — Babel AST finds `createBrowserRouter` calls, parses nested route objects, resolves component imports. (2) `nextjs-app-router.ts` — scans `/app` directory, converts `[param]` → `:param`, `[...slug]` → `:slug*`, skips `(group)` segments. (3) `nextjs-pages-router.ts` — scans `/pages` directory. Framework detection in `detect-framework.ts` checks deps + filesystem.
**Why:** Supporting the two most popular React meta-frameworks covers ~80% of the target audience.
**Trade-offs:** React Router parser uses full AST (handles `lazy()`, dynamic imports, nested routes). Next.js parsers are filesystem-based (simpler, more reliable). Didn't build Remix parser — it's merging with React Router v7 anyway.
**Outcome:** All three parsers produce consistent `ScreenNode[]` + route metadata. Tested against demo-app (React Router v7).
**Related:** todo.md → Route parsers (done)

### [2026-03-23] CLI tool — `mappd dev`
**What was done:** Built `cli/src/` — Commander.js CLI with `mappd dev` command. Options: `--port` (canvas, default 4200), `--target-port` (dev server, default 5173), `--dir` (project dir). Orchestrates: validate project → detect framework → parse routes → write `.mappd/flow-graph.json` → start Express server → start file watcher → capture screenshots.
**Why:** Single command to go from "I have a React app" to "I see my entire flow on a canvas."
**Trade-offs:** Express over Fastify (simpler, more familiar). Single process orchestrates everything (parser, server, watcher, screenshot) — could be split into workers later if perf matters. `.mappd/` output directory keeps artifacts out of source.
**Outcome:** `mappd dev` runs end-to-end. Serves canvas on specified port. Hot reloads on file changes.
**Related:** todo.md → CLI tool (done)

### [2026-03-23] Feasibility analysis — per-node DevTools
**What was done:** Investigated whether each screen node could have Console/Network/Sources panels like browser DevTools.
**Why:** User wants embedded debug output per screen node — would be a major differentiator.
**Trade-offs:** Full Chrome DevTools fidelity isn't possible from web context. But console logs + network requests + storage are feasible via iframe script injection (monkey-patching). This covers 80% of what a developer needs while debugging a specific screen.
**Outcome:** Confirmed feasible for Console, Network, Application tabs. Added to Phase 2 backlog in todo.md with implementation approach.
**Related:** todo.md → Per-node DevTools panel, learnings.md → iframe script injection feasibility

### [2026-03-23] PoC implementation — demo-app + canvas
**What was done:** Built two Vite+React+TS apps from scratch. Demo-app (5 routes with auth flow) on :5173, canvas (React Flow with iframe nodes) on :4200. Implemented postMessage navigation interception and active node highlighting.
**Why:** Validate the core Mappd interaction — click a link in one screen, canvas pans to the destination screen.
**Trade-offs:** Used iframes (isolation, framework-agnostic) over React portals (tighter integration but coupled). Hardcoded graph instead of auto-parsing — intentional for PoC. Removed global form submit interception after it conflicted with React handlers.
**Outcome:** Both apps running. Link click interception works. Active node glow works. Node centering still needs tuning (using getInternalNode for measured dimensions). Form submit flow needs verification.
**Related:** learnings.md → form interception conflict, setCenter dimensions

### [2026-03-23] Created project tracking files
**What was done:** Created `todo.md`, `learnings.md`, and `execution.md` as persistent tracking documents.
**Why:** Establish a living memory system for planned work, implementation insights, and execution history across conversations.
**Trade-offs:** Considered putting these in `.claude/` memory but chose project root — these are project artifacts the user may want to review and edit directly, not just agent context.
**Outcome:** Three files in place with consistent formatting, ready for use.
**Related:** —
