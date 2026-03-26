# FlowCanvas — Execution Log

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
**What was done:** Built `cli/src/screenshot.ts` — Puppeteer headless browser captures each route at 1280×800, writes PNGs to `.flowcanvas/screenshots/`, generates `screenshots.json` manifest. Concurrency capped at 2. Waits for `networkidle2` + 1s extra for client-side render. Fallback: 1×1 transparent PNG on failure.
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

### [2026-03-23] CLI tool — `flowcanvas dev`
**What was done:** Built `cli/src/` — Commander.js CLI with `flowcanvas dev` command. Options: `--port` (canvas, default 4200), `--target-port` (dev server, default 5173), `--dir` (project dir). Orchestrates: validate project → detect framework → parse routes → write `.flowcanvas/flow-graph.json` → start Express server → start file watcher → capture screenshots.
**Why:** Single command to go from "I have a React app" to "I see my entire flow on a canvas."
**Trade-offs:** Express over Fastify (simpler, more familiar). Single process orchestrates everything (parser, server, watcher, screenshot) — could be split into workers later if perf matters. `.flowcanvas/` output directory keeps artifacts out of source.
**Outcome:** `flowcanvas dev` runs end-to-end. Serves canvas on specified port. Hot reloads on file changes.
**Related:** todo.md → CLI tool (done)

### [2026-03-23] Feasibility analysis — per-node DevTools
**What was done:** Investigated whether each screen node could have Console/Network/Sources panels like browser DevTools.
**Why:** User wants embedded debug output per screen node — would be a major differentiator.
**Trade-offs:** Full Chrome DevTools fidelity isn't possible from web context. But console logs + network requests + storage are feasible via iframe script injection (monkey-patching). This covers 80% of what a developer needs while debugging a specific screen.
**Outcome:** Confirmed feasible for Console, Network, Application tabs. Added to Phase 2 backlog in todo.md with implementation approach.
**Related:** todo.md → Per-node DevTools panel, learnings.md → iframe script injection feasibility

### [2026-03-23] PoC implementation — demo-app + canvas
**What was done:** Built two Vite+React+TS apps from scratch. Demo-app (5 routes with auth flow) on :5173, canvas (React Flow with iframe nodes) on :4200. Implemented postMessage navigation interception and active node highlighting.
**Why:** Validate the core FlowCanvas interaction — click a link in one screen, canvas pans to the destination screen.
**Trade-offs:** Used iframes (isolation, framework-agnostic) over React portals (tighter integration but coupled). Hardcoded graph instead of auto-parsing — intentional for PoC. Removed global form submit interception after it conflicted with React handlers.
**Outcome:** Both apps running. Link click interception works. Active node glow works. Node centering still needs tuning (using getInternalNode for measured dimensions). Form submit flow needs verification.
**Related:** learnings.md → form interception conflict, setCenter dimensions

### [2026-03-23] Created project tracking files
**What was done:** Created `todo.md`, `learnings.md`, and `execution.md` as persistent tracking documents.
**Why:** Establish a living memory system for planned work, implementation insights, and execution history across conversations.
**Trade-offs:** Considered putting these in `.claude/` memory but chose project root — these are project artifacts the user may want to review and edit directly, not just agent context.
**Outcome:** Three files in place with consistent formatting, ready for use.
**Related:** —
