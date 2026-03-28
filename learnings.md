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

### [2026-03-28] OSS demo apps expose parser limitations — monorepos, abstract routing, auth-gated pages
**Context:** Cloned React-Admin (RR v6), Actual Budget (RR v7), and Papermark (Next.js Pages Router) as OSS demos. Ran FlowCanvas parser on each.

**Results:**
- React-Admin: **0 routes** — uses `<Resource>` components that auto-generate routes, not explicit `<Route>` definitions. Parser can't detect this abstraction layer.
- Actual Budget: **0 routes** — monorepo with app in `packages/desktop-client/`. Parser scanned root `package.json` but the react-router dependency and route files live in a nested package.
- Papermark: **7 routes** — only auth pages detected (`/login`, `/register`, `/verify`, etc.). Main app pages live behind middleware/auth patterns the parser doesn't follow.
- Cal.com: **205 routes** — worked perfectly because it uses standard Next.js App Router file-based routing at `apps/web/app/`.

**Key parser gaps identified:**
1. **Monorepo scanning** — parser should detect and scan `packages/*/`, `apps/*/` subdirectories, not just root
2. **Abstract routing** — `<Resource>`, `<Admin>`, and similar meta-frameworks that generate routes programmatically
3. **Auth-gated pages** — Pages Router apps where main pages are behind middleware; parser only finds public pages

**Why it matters:** The parser works great on standard patterns but real OSS apps often use non-standard routing. For demos, use apps with straightforward routing. For product, these are the next parser improvements to tackle.
**Related:** demos/oss/, todo.md

### [2026-03-28] Real-world routing & state patterns — research across 18 open source projects
**Context:** Studied public GitHub projects across all 4 supported frameworks to understand how real apps handle routing and state, and what our parser would miss.

**Projects studied:**
- React Router v6: Bulletproof React (29k stars), LobeChat (74k stars), CoreUI Admin (5k), Refine (30k), React Admin Dashboard
- React Router v7: hoosierhuy/rr7-ssr, micko4develop/rr7-guide, machadop1407/rr7-tutorial, forge-42/base-stack, PaulBratslavsky/rr7-strapi
- Next.js App Router: Dub (link management), Cal.com (34k), Midday (finance), Taxonomy/shadcn, TypeHero
- Next.js Pages Router: Cal.com (pages dir), Papermark (5k), BoxyHQ SaaS Kit (4.8k)

**Key routing patterns our parser needs to handle better:**

1. **Centralized path configs** — Bulletproof React defines all paths in a `paths.ts` config object (`paths.app.discussion.path`). Our parser would need to resolve these indirections.
2. **`lazy: () => import(...)` vs `React.lazy()`** — Two different lazy loading patterns. RR6's native `lazy` returns route module exports, `React.lazy` returns components. We detect neither fully.
3. **`import.meta.glob` auto-discovery** — Vite convention-based routing in user code (not framework). Files matching `**/*.router.tsx` become routes. Would need glob pattern detection.
4. **Custom lazy wrappers** — LobeChat uses `dynamicElement()` and `dynamicLayout()` around `React.lazy`. Parser needs to unwrap custom helpers.
5. **Separate mobile vs desktop router configs** — LobeChat has completely different route trees per platform.
6. **Route guard wrappers** — `<ProtectedRoute>`, `<Authenticated fallback={...}>`, recursive `wrapWithProtectedRoute()`. These are routing-significant but not routes themselves.
7. **`flatRoutes()` with escaped chars** — `robots[.]txt.ts` → `/robots.txt`. The bracket escape syntax.
8. **`layout()` and `prefix()`** in RR v7 — `layout()` wraps children with no URL segment, `prefix()` adds URL prefix with no layout.
9. **Resource routes** — `.ts` (not `.tsx`) files that export only loaders, no UI. Should be excluded from screen nodes.
10. **`clientLoader`/`clientAction`** — RR v7 client-side data fetching. Our parser should detect both server and client variants.
11. **Triple-nested route groups** — Midday: `[locale]/(app)/(sidebar)`. 3+ levels deep.
12. **`(dashboard)/dashboard/` pattern** — Taxonomy: route group containing a URL segment folder.
13. **Server actions as `.action.ts` files** — TypeHero convention. Different from inline `"use server"`.
14. **`_components/` convention** — underscore opts folders out of routing. Different from `_layout` pathless routes.
15. **Three layout patterns in Pages Router** — `getLayout` (canonical), inline `<AppLayout>` wrapping, `Component.PageWrapper` (Cal.com custom).
16. **Re-exported `getServerSideProps`** — imported from utility modules, not defined inline in the page file.
17. **Conditional providers in `_app.tsx`** — Papermark excludes paths from certain providers based on `router.pathname`.
18. **`getInitialProps` in `_app.tsx`** — Legacy pattern still used by Cal.com for locale detection.

**Key state patterns our detector needs to handle:**

1. **Zustand** — Most popular external store (LobeChat has 25 store modules). Uses `create()`, `persist` middleware, `subscribeWithSelector`. Some inject `useNavigate` into the store for non-component navigation.
2. **URL search params as state** — `useSearchParams()` for pagination, filters, redirects. Also `nuqs` library for type-safe URL state (Midday).
3. **React Query / tRPC / SWR** — Server state cached on client. Not hook-based state but drives UI significantly. The dominant data fetching pattern across all projects.
4. **Redux** — Still used (CoreUI). `useSelector` for reading, `dispatch` for updates.
5. **Auth state driving routes** — Every project has auth state that determines routing (guards, redirects, conditional layouts). Auth is never "just state" — it's routing-critical.
6. **Navigator injection** — LobeChat registers `useNavigate` into Zustand store so non-component code can navigate. Parser would see `store.navigate()` not `useNavigate()`.
7. **`syncWithLocation`** — Refine syncs internal state bidirectionally with URL. Filters/pagination reflected in URL automatically.
8. **Intent-based forms** — Multiple submit buttons with `name="intent" value="update|delete"` in RR v7 actions.

**What this means for our parser:**
- Our current parser handles ~60-70% of real-world patterns well (file-based routes, Link/useNavigate, basic useState/useReducer)
- The biggest gap is **external state stores** (Zustand, Redux) — 3 of 5 RR v6 projects use one
- Second biggest gap is **lazy loading indirection** — paths defined in config objects, wrapped in helpers
- Third is **server state** (React Query/SWR/tRPC) — the dominant fetching pattern, but not hook-state

**Related:** todo.md State Override Matrix, parser/src/

### [2026-03-28] React state override: dispatch > overrideHookState
**Context:** Building state-driven screen detection — clicking a state button should change the iframe's UI
**Learning:** React DevTools' `overrideHookState(fiber, hookIndex, path, value)` sets the value internally but does NOT trigger a re-render in React 19. The reliable approach is to call `hookState.queue.dispatch(value)` directly — this is the actual setter function (`setStep`, `setTab`, etc.) that React uses internally. It triggers a proper re-render because it goes through React's normal scheduling.
**Why it matters:** Any future state manipulation (Zustand, Redux, etc.) should use the library's own dispatch/setState API rather than trying to poke internal state. The pattern is: find the mechanism the component itself uses to update, and call that.
**Related:** mappd-inject.js, execution.md

### [2026-03-28] useReducer dispatch needs action objects, not raw values
**Context:** State override worked for `useState` (CreateProjectPage steps) but not `useReducer` (AnalyticsPage views)
**Learning:** `useState`'s `dispatch` accepts the new value directly. `useReducer`'s `dispatch` expects an action object (e.g., `{ type: 'SET_VIEW', payload: 'detailed' }`). Sending a raw value silently fails — the reducer's switch statement doesn't match any case and returns the existing state. The fix: inspect the current state object shape, find the key name, and construct `{ type: 'SET_<KEY>', payload: value }`. This heuristic works for the common `SET_X` convention. Custom action formats would need the parser to detect the action type from the source code.
**Why it matters:** When adding new state management support (Redux, Zustand), each has its own dispatch contract. The parser needs to capture not just "what values the state can be" but "how to tell the store to change to that value."
**Related:** mappd-inject.js

### [2026-03-28] Fiber root detection: onCommitFiberRoot > DOM walking
**Context:** `getFiberRoot()` couldn't find React's fiber tree — returned null in React 19
**Learning:** React 19 uses `__reactContainer$xxx` on root DOM elements (not `__reactFiber$`). But the most reliable approach is to track roots via `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot(rendererId, root)` — React calls this on every commit, so we always have a reference to every root. No DOM key guessing needed. The `root.current` property points to the root fiber for tree walking.
**Why it matters:** Don't rely on DOM property key prefixes — they're internal and can change between React versions. The DevTools hook protocol (`inject`, `onCommitFiberRoot`) has been stable across React 16→19 and is the intended integration point.
**Related:** mappd-inject.js

### [2026-03-28] Component name from parser ≠ component name at runtime
**Context:** Parser's `stateScreens` had `componentName: "div"` — the rendered JSX element, not the React component
**Learning:** The parser's AST analysis identifies the conditionally rendered element (a `<div>`), not the parent component function. The route node's `componentName` (from the file's default export) is the correct name to match against `fiber.type.name`. Always use the route-level component name for fiber search, not the stateScreen's `componentName`.
**Why it matters:** This distinction will matter for every framework — the parser knows file-level component names, but state screen entries might reference child elements. Keep these separate in the data model.
**Related:** App.tsx, flow-graph.json

### [2026-03-28] Figma's panel model: identity header + context-aware sections
**Context:** Redesigning the right panel to match Figma's information hierarchy
**Learning:** Figma's key insight: the panel header IS the selected element — not a generic "Properties" label. When nothing is selected, the header says the canvas/project name. When something is selected, it shows that element's name prominently, with actions as icon buttons on the same row. Sections below are context-aware — they appear/disappear based on selection. Canvas-wide settings (zoom, viewport, display) collapse behind a disclosure when node-specific content takes priority. This hierarchy — identity first, context-aware content second, global settings third — prevents the "wall of controls" problem.
**Why it matters:** Any tool with a properties panel should follow this pattern. The header isn't chrome — it's the most important piece of information.
**Related:** ControlPanel.tsx, App.css

### [2026-03-27] Interactive CLI fallback is essential for real-world adoption
**Context:** Testing on projects where auto-detect failed (no recognized router in package.json or unconventional structure).
**Learning:** Three-tier fallback is the right pattern: auto-detect → saved config → interactive prompt. The saved config (`.mappd/config.json`) means users only answer once. The prompt uses Node's built-in `readline` — no extra dependency. The parser accepts `frameworkOverride` and `entryPointOverride` options that bypass `detectFramework()`.
**Why it matters:** Zero-config is the goal, but some projects won't match auto-detection patterns. The fallback must be frictionless — ask 3 questions, save, never ask again.
**Related:** execution.md, cli/src/prompt.ts

### [2026-03-27] Viewport preset affects iframe scale ratio, not just dimensions
**Context:** Building viewport size toggle (Desktop/Tablet/Mobile) for the control panel
**Learning:** When the viewport preset changes from 1280×800 to 375×667, the iframe scale factor changes too (`nodeWidth / iframeWidth`). This means mobile preview nodes are taller relative to their width (portrait ratio) while desktop nodes are wider (landscape). The node width stays fixed at 480px but height adjusts dynamically. This is the right behavior — it matches how Figma handles frame presets.
**Why it matters:** Don't hardcode `containerHeight` or `iframeScale` — derive them from the viewport dimensions. Future viewport presets (custom sizes, etc.) will just work.
**Related:** ScreenNode.tsx, ControlPanel.tsx

### [2026-03-27] Cross-origin iframe injection is fundamentally impossible from a web context
**Context:** Tried three approaches to inject mappd-inject.js into target app iframes: (1) HTML proxy with `<base href>` — broke client-side routing because React Router sees `/proxy/dashboard` as the URL. (2) HTML proxy rewriting asset URLs to absolute — broke Vite's inline module imports (`/@react-refresh`, `/@vite/client`) which can't be rewritten via regex. (3) `contentDocument.createElement('script')` after iframe load — fails silently because iframes from `localhost:3000` are cross-origin to the canvas on `localhost:3569`.
**Learning:** The only reliable approach for web-based injection: **copy the script to the target project's `public/` directory AND inject a `<script>` tag into the HTML entry point** (`index.html` for Vite, `app/layout.tsx` for Next.js). This makes it same-origin and loads before the app boots. The CLI auto-injects on startup and restores the original files on Ctrl+C shutdown. An Electron-based version could use `webContents.executeJavaScript()` to bypass this entirely.
**Why it matters:** Every future framework integration needs a strategy for finding and modifying the HTML entry point. Vite = `index.html`, Next.js App Router = `app/layout.tsx` (inject `<head>` if missing), Next.js Pages Router = `pages/_document.tsx`, CRA = `public/index.html`.
**Related:** execution.md → Script injection saga

### [2026-03-27] Next.js App Router layouts often have no `<head>` tag
**Context:** Tried injecting `<script>` into partner-dashboard's `app/layout.tsx` but the file had no `<head>` tag — Next.js App Router uses the `metadata` export, not a literal `<head>` element.
**Learning:** When injecting into Next.js App Router layouts, check for `<head>` first. If missing, insert `<head><script src="/mappd-inject.js" defer></script></head>` after the `<html>` opening tag. Next.js handles this correctly — the `<head>` merges with metadata-generated head content.
**Why it matters:** This is the common case for Next.js 13+. The injection must handle both patterns.
**Related:** execution.md → Partner-dashboard testing

### [2026-03-27] Iframe loading threshold of zoom > 1.0 is too conservative
**Context:** Users had to double-click nodes to activate them because the auto-load threshold was too high.
**Learning:** Lowered from `zoom > 1.0` to `zoom > 0.3` — nodes now auto-activate at almost any zoom level. Also changed activation from double-click to single-click, and increased queue concurrency from 2 to 4. The original conservative settings were designed for the 18-iframe Next.js overload problem, but with the staggered queue in place, the dev server handles 4 concurrent loads fine.
**Why it matters:** First impression matters. If a user opens the canvas and sees blank placeholders, they'll think it's broken. Screens should load as soon as possible.
**Related:** execution.md → Loading UX improvements

### [2026-03-26] The *.replace() fallback for navigation detection creates too many false positives
**Context:** Testing parser against partner-dashboard. `name.replace('Access Bank ', '')` was detected as a navigation call.
**Learning:** The fallback `*.replace()` catch-all (meant to catch `untracked_router.replace('/path')`) also catches `String.replace()`, `Array.splice.replace()`, etc. `String.replace()` is called constantly in real codebases. The fix: only use `.push()` in the untracked fallback, never `.replace()`. Tracked router variables (`const router = useRouter()`) still correctly detect `router.replace()` because they're in the `routerVars` set. Also: bare-segment validation in `normalizePath` must reject strings with spaces — `'Access Bank '` is not a route segment.
**Why it matters:** Any AST heuristic that fires on common method names will produce false positives at scale. Always prefer tracked-variable matching over name-based fallbacks.
**Related:** execution.md → Real-world parser testing

### [2026-03-26] Relative path resolution is simpler than expected but covers 90%+ of cases
**Context:** Implementing relative path resolution for `navigate('../settings')`, `<Link to="..">`, etc.
**Learning:** A simple segment-based algorithm (split source path by `/`, apply `..` = pop, `.` = noop, else push) handles the vast majority of relative navigation patterns. React Router's actual algorithm is more complex (considers route tree hierarchy, not just URL segments), but at static analysis time we don't always have the full route tree context. The simple approach works for all common patterns and only fails for edge cases where the route tree structure diverges from the URL structure (rare in practice).
**Why it matters:** Don't over-engineer the solution. The simple approach unlocked detection of ALL relative navigations that were previously invisible. A more sophisticated approach can be added later if needed.
**Related:** execution.md → Deep parser audit round 3

### [2026-03-26] React Router v7 has three completely different routing modes
**Context:** Building the v7 parser revealed that v7 framework mode is architecturally different from v6.
**Learning:** React Router v7 supports three modes: (1) SPA mode — same as v6, uses `createBrowserRouter`. (2) Framework mode with `routes.ts` config — uses `route()`, `index()`, `layout()`, `prefix()` helpers from `@react-router/dev/routes`. (3) Framework mode with file-based routing — uses `flatRoutes()` from `@react-router/fs-routes` with completely different naming conventions (`$param` instead of `:param`, dot-nesting instead of directories, `_pathless` prefix). The detection is key: `@react-router/dev` in package.json + presence of `app/routes.ts` or `react-router.config.ts` = framework mode.
**Why it matters:** Can't just "extend" the v6 parser. Each mode needs its own extraction strategy. The flat-routes file naming is particularly tricky — dots are path separators, dollars are params, underscores have two meanings (leading = pathless, trailing = escape nesting).
**Related:** execution.md → Deep parser audit round 3

### [2026-03-26] Next.js 16 renamed middleware.ts to proxy.ts
**Context:** Validating parser against current Next.js docs.
**Learning:** Next.js 16 officially renamed `middleware.ts` to `proxy.ts` and the exported function from `middleware()` to `proxy()`. The parser must scan both filenames for backward compatibility. This is not just a rename — the API surface also changed slightly.
**Why it matters:** Any Next.js 16+ project will use `proxy.ts`. Projects upgrading will have either file. Scan both.
**Related:** execution.md → Deep parser audit round 3

### [2026-03-26] getServerSideProps/getStaticProps redirects are a very common Pages Router pattern
**Context:** Auditing Next.js Pages Router patterns.
**Learning:** `return { redirect: { destination: '/login', permanent: false } }` from `getServerSideProps` or `getStaticProps` is the standard way to do server-side redirects in Pages Router. This pattern was completely undetected. It requires AST parsing of the return statement inside specifically-named exported functions — you can't just scan for `redirect()` calls.
**Why it matters:** Many enterprise Next.js apps still use Pages Router. Auth redirects (unauthenticated → /login) are nearly universal and all use this pattern.
**Related:** execution.md → Deep parser audit round 3

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
