# Mappd — Build Context & Breakdown

## What We're Building

A localhost dev tool that renders **all screens** of a React app on an **infinite canvas**, connected by flow lines representing navigation paths. Instead of clicking through your app to reach deep screens, you see everything at once and interact in-place — the canvas pans to the next screen instead of navigating away.

**Think:** Figma prototype mode, but with live running React code.

---

## Core Concepts (Mental Model)

| Concept | What It Means |
|---------|--------------|
| **Screen Node** | A React Flow node containing a live iframe preview of a single route |
| **Flow Edge** | A directed arrow between nodes representing a navigation path (Link, navigate(), router.push()) |
| **Canvas Pan** | When you click a link inside a screen node, the canvas smoothly scrolls to the destination node instead of navigating |
| **State Pinning** | Manually seed mock data/state into any screen node so you don't have to click through preceding screens |
| **Route Parser** | AST-based static analysis that reads your routing config and builds the flow graph automatically |

---

## Build Phases (What to Build, In Order)

### Phase 0: PoC — Validate the Core Interaction (THIS IS WHERE WE START)

**Goal:** Prove the "canvas pan instead of navigate" interaction feels right.

**Scope:**
1. A simple React Router demo app with 5 screens: Home → Login → Dashboard → Settings → Detail
2. A **hardcoded** route graph (no parsing — just manually define the nodes and edges)
3. React Flow canvas rendering each route as a custom node with a live iframe inside
4. Click a `<Link>` in one iframe → canvas pans smoothly to the destination node
5. Basic edge connections with labels between nodes
6. Form data entered in Screen A flows through to Screen B after pan

**Explicitly NOT in PoC:**
- No CLI tool
- No AST parsing / route detection
- No file watching
- No state pinning UI
- No auto-layout algorithm

**Success Criteria:**
- See all 5 screens simultaneously
- Click a link → smooth pan to connected screen
- Form data flows between screens
- It feels "magical"

**Estimated effort:** 1–2 weekends (10–20 hours)

---

### Phase 1: MVP — The Real Tool

**Goal:** A usable CLI tool that auto-detects routes and renders the canvas.

**What gets built:**
1. **CLI** (`mappd dev`) — boots a Vite dev server serving the canvas app
2. **Route Parser** — AST analysis (Babel) to detect React Router v6+ and Next.js routes
3. **Navigation Link Detection** — scan for `<Link>`, `useNavigate()`, `router.push()` in component files
4. **Auto-layout** — Dagre/ELK.js to arrange nodes in a directed graph
5. **State Pinning** — side panel per node to inject props, auth context, URL params, mock API responses
6. **File Watcher** — chokidar watches source files, re-renders affected nodes on change
7. **WebSocket Communication** — real-time updates between Mappd server and canvas UI

---

### Phase 2+: Later (documented in PRD, not our concern now)
- State-driven screen detection (useState/useReducer analysis)
- Manual flow correction UI
- VS Code extension
- AI-assisted inference
- Multi-framework support
- Collaboration features

---

## Tech Stack (Decided)

| Component | Tech | Why |
|-----------|------|-----|
| Canvas | React Flow v12+ | Battle-tested, MIT, zoom/pan/minimap/edges, nodes are React components |
| CLI | Node.js + Commander.js | Standard CLI tooling, easy npm distribution |
| AST Parser | @babel/parser + @babel/traverse | Industry standard for JS/TS/JSX static analysis |
| Dev Server | Vite | Fast, modern, excellent HMR — serves the canvas app itself |
| Screen Rendering | Sandboxed iframes | Each screen in its own iframe hitting the project's dev server |
| File Watching | chokidar | Reliable cross-platform FS watcher |
| Communication | WebSocket | Real-time updates between server and canvas UI |
| Language | TypeScript | Throughout |

---

## Key Architecture Decisions

### How screens render: Iframes
Each screen node contains an iframe pointing to the project's running dev server at a specific route. A query param (`?mappd=true&route=/path`) signals the app. This gives us:
- Full isolation between screens
- Each screen runs in its own React context
- No interference between screen states

### How navigation is intercepted: postMessage
A lightweight script injected into each iframe intercepts link clicks and form submissions. On navigation event:
1. Iframe sends `postMessage` to parent canvas with destination path
2. Canvas finds the matching screen node
3. Canvas animates a smooth pan (ease-in-out, 400–600ms) to that node
4. Form data is forwarded to the destination node's iframe

### How state pinning works: JSON files
Pinned state stored in `.mappd/pins.json` in the project root. Each node can have:
- `props` — key-value pairs passed to the component
- `authContext` — mock user/auth state
- `urlParams` — dynamic route parameters
- `mockApiResponses` — URL pattern → mock response data

---

## Data Model (Core Types)

```typescript
interface ScreenNode {
  id: string;
  routePath: string;           // "/dashboard/settings"
  componentName: string;       // "SettingsPage"
  componentFilePath: string;   // absolute path to source
  isIndex: boolean;
  isDynamic: boolean;          // has :id params
  parentLayoutId?: string;
  pinnedState?: PinnedState;
  position?: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  triggerType: 'link' | 'programmatic' | 'state';
  triggerLabel: string;        // "Click: Submit"
  sourceCodeLocation: { file: string; line: number; column: number };
}

interface PinnedState {
  props?: Record<string, any>;
  authContext?: MockAuthContext;
  urlParams?: Record<string, string>;
  mockApiResponses?: Record<string, any>;
}

interface FlowGraph {
  nodes: ScreenNode[];
  edges: FlowEdge[];
  metadata: {
    projectName: string;
    framework: 'react-router' | 'nextjs-app' | 'nextjs-pages';
    generatedAt: string;
    mappdVersion: string;
  };
}
```

---

## Non-Functional Requirements (Keep in Mind)

- **Performance:** 60fps canvas with up to 20 nodes visible; flow map generation < 5s for 50 routes
- **Zero config:** Should Just Work™ for standard React Router and Next.js projects
- **Non-invasive:** Never modifies the developer's source code or build config
- **Localhost only:** No external network access, no data sent anywhere
- **Graceful degradation:** If a route component fails, show error in that node, don't crash the canvas

---

## Open Design Questions (To Resolve During Build)

1. **Dynamic routes** (`/users/:id`) — one node with ":id" label, or multiple example nodes?
2. **Canvas engine abstraction** — should we build an abstraction layer over React Flow for future swapability?
3. **Runtime injection** — inject a small script into the user's app for better interception, or stay fully non-invasive?
4. **Auth handling** — is pinning per-node enough, or do we need a global "auth profile" that applies everywhere?

---

## Immediate Next Steps (PoC Sprint)

### Step 1: Project Scaffolding
- Initialize a monorepo (or simple workspace) with two packages:
  - `demo-app/` — the 5-screen React Router demo app
  - `canvas/` — the Mappd React Flow application
- Both powered by Vite + TypeScript + React

### Step 2: Build the Demo App
- 5 routes: `/` (Home), `/login`, `/dashboard`, `/dashboard/settings`, `/dashboard/detail/:id`
- Simple forms on Login (username/password) and Settings
- Navigation between all screens using `<Link>` and `useNavigate()`
- Minimal styling (just enough to look like real screens)

### Step 3: Build the Canvas Shell
- React Flow canvas with zoom, pan, minimap
- Custom node component that renders an iframe
- Hardcoded graph: 5 nodes + edges matching the demo app routes
- Auto-layout with Dagre

### Step 4: Implement Navigation Interception
- Inject a script into each iframe that intercepts link clicks
- postMessage bridge between iframes and canvas parent
- Smooth pan animation on navigation event

### Step 5: Implement Data Flow
- Capture form data on submit in source iframe
- Forward to destination iframe via postMessage
- Destination iframe renders with received data

### Step 6: Polish & Validate
- Edge labels showing trigger descriptions
- Thumbnail vs focus mode toggle per node
- Test the "magical" feeling — does it click?

---

*This document is the working context for building Mappd. Update it as decisions are made and questions are resolved.*
