# Mappd

See your entire React app at once. Stop clicking through screens.

Mappd renders every route in your application on an infinite canvas, connected by auto-detected navigation flows. It is a localhost dev tool for React developers who are tired of manually navigating through their apps to reach deep screens.

<!-- TODO: Add screenshot/GIF of canvas -->
<img width="3068" height="2096" alt="image" src="https://github.com/user-attachments/assets/fffb479e-c595-4a6b-a46b-f6d2e234113a" />

---

## Quick Start

```bash
npm install -g mappd
cd your-react-project
mappd dev
```

That's it. Mappd parses your routes, starts a canvas server, and opens your entire app on one screen.

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

### `mappd dev`

Start the Mappd dev server for the current project.

```bash
mappd dev [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --port <port>` | Canvas server port | `4200` |
| `-t, --target-port <port>` | Your app's dev server port | `5173` |
| `-d, --dir <path>` | Project directory | `.` |

**Examples:**

```bash
# Default: canvas on :4200, app on :5173
mappd dev

# Custom ports
mappd dev --port 3000 --target-port 8080

# Point to a different project directory
mappd dev --dir ./packages/web
```

---

## How It Works

Mappd uses Babel-based AST analysis to statically parse your routing configuration and detect navigation patterns (`<Link>`, `useNavigate()`, `router.push()`). It builds a directed graph of your app's screens and connections, then renders each route as a live iframe on a React Flow canvas. A lightweight script injected into each iframe intercepts navigation events via `postMessage`, so clicking a link pans the canvas instead of navigating away. A file watcher monitors your source code and pushes graph updates over WebSocket in real-time.

---

## Configuration

Mappd is designed to work with zero configuration. The CLI flags above cover most use cases.

Project-specific data is stored in a `.mappd/` directory in your project root. This is created automatically and contains:

- `flow-graph.json` -- the parsed route graph
- `pins.json` -- pinned state for screen nodes (auth context, URL params, props)
- Screenshot thumbnails

You can commit `.mappd/` to your repo or add it to `.gitignore`. Your call.

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
