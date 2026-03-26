# FlowCanvas

See your entire React app at once. Stop clicking through screens.

FlowCanvas renders every route in your application on an infinite canvas, connected by auto-detected navigation flows. It is a localhost dev tool for React developers who are tired of manually navigating through their apps to reach deep screens.

<!-- TODO: Add screenshot/GIF of canvas -->

---

## Quick Start

```bash
npm install -g flowcanvas
cd your-react-project
flowcanvas dev
```

That's it. FlowCanvas parses your routes, starts a canvas server, and opens your entire app on one screen.

Your app's dev server should already be running (default: port 5173).

---

## What You Get

- **All screens rendered live on an infinite canvas.** Every route in your app, visible at once, each in its own iframe.
- **Navigation flows auto-detected from your code.** `<Link>`, `useNavigate()`, `router.push()` -- all parsed via AST analysis and drawn as directed edges.
- **Click a link, canvas pans to the destination.** Instead of navigating away, the canvas smoothly scrolls to the target screen.
- **State pinning.** Skip login flows, inject auth context, set URL params. Jump directly to deep screens without clicking through prerequisites.
- **File watcher.** Edit your code, save, and the canvas updates in real-time via WebSocket.
- **Screenshot thumbnails.** Captured automatically in the background for quick visual reference.

---

## Supported Frameworks

| Framework | Status |
|-----------|--------|
| React Router v6+ | Supported |
| Next.js App Router | Supported |
| React Router v7 (file-based) | Planned |
| Vue / Svelte / Angular | Future |

---

## CLI Reference

### `flowcanvas dev`

Start the FlowCanvas dev server for the current project.

```bash
flowcanvas dev [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --port <port>` | Canvas server port | `4200` |
| `-t, --target-port <port>` | Your app's dev server port | `5173` |
| `-d, --dir <path>` | Project directory | `.` |

**Examples:**

```bash
# Default: canvas on :4200, app on :5173
flowcanvas dev

# Custom ports
flowcanvas dev --port 3000 --target-port 8080

# Point to a different project directory
flowcanvas dev --dir ./packages/web
```

---

## How It Works

FlowCanvas uses Babel-based AST analysis to statically parse your routing configuration and detect navigation patterns (`<Link>`, `useNavigate()`, `router.push()`). It builds a directed graph of your app's screens and connections, then renders each route as a live iframe on a React Flow canvas. A lightweight script injected into each iframe intercepts navigation events via `postMessage`, so clicking a link pans the canvas instead of navigating away. A file watcher monitors your source code and pushes graph updates over WebSocket in real-time.

---

## Configuration

FlowCanvas is designed to work with zero configuration. The CLI flags above cover most use cases.

Project-specific data is stored in a `.flowcanvas/` directory in your project root. This is created automatically and contains:

- `flow-graph.json` -- the parsed route graph
- `pins.json` -- pinned state for screen nodes (auth context, URL params, props)
- Screenshot thumbnails

You can commit `.flowcanvas/` to your repo or add it to `.gitignore`. Your call.

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Open a pull request

For bugs, open an issue with reproduction steps. For feature requests, open an issue describing the use case.

---

## License

MIT
