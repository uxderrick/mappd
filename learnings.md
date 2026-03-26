# Mappd — Learnings

> Insights, patterns, gotchas, and decisions captured during implementation.
> Self-updating — the agent adds entries as we build and discover things.

## Format

```
### [YYYY-MM-DD] Title
**Context:** What we were doing
**Learning:** What we discovered or decided
**Why it matters:** How this affects future work
**Related:** Links to execution entries or todos
```

---

## Learnings Log

<!-- Newest entries at the top -->

### [2026-03-26] Frontend routing falls into three parsing strategies
**Context:** Researched 12 routing frameworks to plan multi-framework support.
**Learning:** All frontend routers fall into three categories that determine parsing strategy:
1. **File-based** (Next.js, Nuxt, SvelteKit, Astro, Expo Router, SolidStart) — scan directories, map file conventions to routes. Easiest to parse. Each framework has its own file naming conventions (`+page.svelte`, `page.tsx`, `[param]`, `$param`) but the approach is identical.
2. **Config-based** (Vue Router, Angular Router, React Router config mode) — AST-parse route definition arrays. Medium difficulty. Angular is hardest due to cross-file lazy imports (`loadChildren`/`loadComponent`).
3. **Code-based** (React Router JSX, TanStack Router, Wouter) — AST-parse JSX or `createRoute()` chains. Most flexible but hardest to parse exhaustively.
Many frameworks support multiple modes (React Router v7 has all three). The parser architecture should have a strategy per mode, not per framework.
**Why it matters:** Building three parsing strategies (filesystem scanner, config array parser, JSX/code parser) covers all 12 frameworks. New frameworks just need a thin adapter mapping their conventions to one of these strategies.
**Related:** todo.md → Multi-Framework Router Support, execution.md → Routing landscape research

### [2026-03-26] Dynamic segment syntax varies but maps to the same concept
**Context:** Each router uses different syntax for dynamic route segments.
**Learning:** The mapping: `[param]` (Next, Nuxt, Svelte, Expo, Solid), `$param` (TanStack, Remix flat routes), `:param` (React Router, Vue Router, Angular config), `{param}` (Gatsby collection routes). Catch-all: `[...slug]`, `$` (Remix), `:rest*` (wouter), `**` (Angular). Route groups (pathless): `(group)` dirs in most file-based routers. All normalize to `:param` in FlowCanvas's internal graph representation.
**Why it matters:** The parser output format is already correct (`:param` style). Each framework adapter just needs its own regex to detect and convert its syntax.
**Related:** todo.md → Multi-Framework Router Support

### [2026-03-26] TanStack Router's generated route tree is a parsing shortcut
**Context:** Evaluating TanStack Router parsing difficulty.
**Learning:** TanStack Router generates a `routeTree.gen.ts` file containing the complete route tree as a typed object. Parsing this generated file is trivial compared to tracing `createRoute()` chains across multiple files. Always check for generated/manifest files first — they're the easiest path to accurate route extraction.
**Why it matters:** Other frameworks may have similar generated artifacts (e.g., Nuxt's `.nuxt/routes.mjs`, Gatsby's `.cache/data.json`). Check for generated outputs before building full AST parsers.
**Related:** todo.md → TanStack Router

### [2026-03-23] Auth state should be global, not per-node
**Context:** Initially built state pinning with auth as a per-node property (like URL params). Each node had its own auth config.
**Learning:** Auth should be global — set once, applied to ALL screen nodes. This matches how real apps work (one session, one cookie, one JWT). Per-node auth forces the developer to configure 18 nodes separately, which defeats the purpose. URL params remain per-node because each `/users/:id` screen genuinely needs different values.
**Why it matters:** The global vs per-node distinction applies to any future pinned state: theme should be global, query params per-node, mock user data global, etc.
**Related:** execution.md → State pinning implementation

### [2026-03-23] Thumbnail-first with live toggle is the right UX pattern
**Context:** Canvas needs to show screen previews in nodes. Two options: always-live iframes, or static screenshots with on-demand live mode.
**Learning:** Always-live iframes for 10+ nodes kills performance — each iframe runs a full React app instance. Static screenshots (Puppeteer) load instantly and look identical at thumbnail zoom levels. Double-click to switch to live iframe when you need to interact. This is the same pattern Figma uses (static render → interactive on focus).
**Why it matters:** Performance architecture for the canvas. As node count grows, this decision becomes critical. Screenshot capture runs once on startup + on file change, not per-render.
**Related:** execution.md → Screenshot capture, ScreenNode component

### [2026-03-23] Dagre center-point to top-left conversion is required for React Flow
**Context:** Dagre outputs node positions as center-points. React Flow expects top-left corner positions.
**Learning:** After Dagre layout, convert positions: `x = dagre.x - width/2`, `y = dagre.y - height/2`. This is easy to miss and causes nodes to overlap if forgotten. Node dimensions must match between Dagre config and React Flow rendering.
**Why it matters:** Any layout library swap (e.g., to ELK) will likely have its own coordinate convention. Always check.
**Related:** execution.md → Auto-layout with Dagre

### [2026-03-23] Babel AST tracks variable origins for navigation detection
**Context:** Need to detect `navigate('/dashboard')` calls, but the variable name `navigate` comes from `const navigate = useNavigate()`.
**Learning:** Build an import map first (track all `import X from Y` and `const X = useY()`), then during traversal check if a `CallExpression`'s callee matches a known navigation function. This handles aliasing (`const nav = useNavigate()` → `nav('/foo')` is detected). Template literal interpolations become `:param` placeholders automatically.
**Why it matters:** Regex-based detection would miss aliased names, renamed imports, and template literals. AST approach is correct by construction.
**Related:** execution.md → Navigation link detection

### [2026-03-23] Next.js route conventions map cleanly to dynamic params
**Context:** Parsing Next.js filesystem routes for the graph.
**Learning:** `[param]` → `:param`, `[...slug]` → `:slug*`, `(group)` segments are layout groups (skip them in path). `page.tsx` = route exists, `layout.tsx` = wrapper. This convention is well-documented and stable across Next.js versions.
**Why it matters:** Filesystem-based parsing is simpler and more reliable than AST for Next.js. No need to parse code — just scan directories.
**Related:** execution.md → Route parsers

### [2026-03-23] 300ms debounce is the sweet spot for file watcher re-parse
**Context:** chokidar fires events per-file. Saving a file in VS Code can trigger multiple events (write + rename on some OS).
**Learning:** 300ms debounce on the watcher callback prevents redundant re-parses while still feeling instant. The full parse → layout → write → broadcast cycle completes in ~100-200ms for a small project, so total latency is ~500ms from save to canvas update.
**Why it matters:** Too short = wasted CPU on duplicate parses. Too long = feels laggy. 300ms is the standard debounce for file watchers (also used by Vite, webpack).
**Related:** execution.md → File watcher + WebSocket

### [2026-03-23] Per-node DevTools is feasible via iframe script injection
**Context:** Explored whether each screen node could have its own Console/Network/Sources panel.
**Learning:** Console and Network are fully feasible by injecting a script that monkey-patches `console.*`, `fetch`, and `XMLHttpRequest`, then forwards data to parent via `postMessage`. Same technique as CodeSandbox/StackBlitz. Application storage is also readable. Full debugger features (breakpoints, memory profiling) are NOT possible — those need Chrome DevTools Protocol.
**Why it matters:** Strong Phase 2 differentiator. No competing tool embeds per-screen debug output alongside live previews on a canvas.
**Related:** todo.md → Per-node DevTools panel

### [2026-03-23] Global form interception conflicts with React event handlers
**Context:** Mappd interception script was catching form submits in capture phase, preventing React's `onSubmit` from firing.
**Learning:** `document.addEventListener('submit', ..., true)` fires before React synthetic events. The interception script sent a postMessage with the form's `action` URL (current page `/login`) instead of the programmatic destination (`/dashboard`). Fix: removed global form interception; programmatic navigation handled by `useMappdNavigate` hook.
**Why it matters:** For MVP auto-detection, be careful about global vs. app-handled events. Hook-based approach is cleaner for programmatic navigation.
**Related:** execution.md → PoC implementation

### [2026-03-23] React Flow setCenter needs measured node dimensions
**Context:** Canvas pan-on-navigate was showing the corner of the target node instead of centering it.
**Learning:** `setCenter(x, y)` in React Flow uses the top-left corner as `position`. To center a node, use `position + (measuredWidth/2, measuredHeight/2)`. Use `getInternalNode()` for accurate measured dimensions instead of hardcoded estimates.
**Why it matters:** Always use React Flow's measured dimensions, not guesses.
**Related:** execution.md → PoC implementation
