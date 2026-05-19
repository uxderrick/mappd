# Mappd

See your entire React app at once. Stop clicking through screens.

Mappd renders every route in your application on an infinite canvas, connected by auto-detected navigation flows. It is a localhost dev tool for React developers who are tired of manually navigating through their apps to reach deep screens.

<img width="3068" height="2096" alt="Mappd canvas showing a React app's routes" src="https://github.com/user-attachments/assets/fffb479e-c595-4a6b-a46b-f6d2e234113a" />

---

## Prerequisites

- **Node.js 20 or later** (`node -v` to check)
- A React project using **React Router** or **Next.js**
- One of: **npm**, **pnpm**, or **yarn**

---

## Quick Start

**Step 1 — Install Mappd globally**

```bash
npm install -g mappd
# or: pnpm add -g mappd
# or: yarn global add mappd
```

**Step 2 — Start your app's dev server (in one terminal)**

```bash
cd your-react-project
npm run dev
```

**Step 3 — Start Mappd (in another terminal, same project)**

```bash
mappd dev
```

Open `http://localhost:3569` in your browser. You'll see every route in your app laid out on a canvas.

Mappd auto-detects which port your dev server is running on (Vite = 5173, Next.js = 3000, etc.). If detection fails, pass it manually: `mappd dev --target-port 3000`.

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
| React Router v6 | Supported |
| React Router v7 (framework + SPA mode) | Supported |
| Next.js App Router | Supported |
| Next.js Pages Router | Supported |
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
| `-p, --port <port>` | Canvas server port | `3569` |
| `-t, --target-port <port>` | Your app's dev server port | Auto-detected |
| `-d, --dir <path>` | Project directory | `.` |
| `--screenshots` | Capture route screenshots on startup (launches headless Chrome) | `false` |

**Examples:**

```bash
# Default: canvas on :3569, app port auto-detected
mappd dev

# Custom ports
mappd dev --port 3000 --target-port 8080

# Point to a different project directory (monorepos)
mappd dev --dir ./apps/web

# Capture route screenshots on startup
mappd dev --screenshots
```

---

## Using the Canvas

Once the canvas opens at `http://localhost:3569`:

- **Pan** — drag empty space or use trackpad two-finger scroll
- **Zoom** — pinch trackpad or `Cmd/Ctrl + scroll`
- **Click a screen** — selects it and shows controls in the right panel
- **Click a link inside a screen** — canvas pans to the destination screen instead of navigating away
- **Focus mode** — click the expand icon on a node to enlarge it (great for forms and interaction testing)
- **Pin state** — set auth tokens, URL params, or mock data so you can jump straight to deep screens
- **Export** — save the canvas as a PNG or capture a single route as a screenshot

Edit any file in your project and the canvas updates automatically — no refresh needed.

---

## Troubleshooting

<details>
<summary><strong>"Could not detect a running dev server"</strong></summary>

Mappd couldn't find your app. Make sure your dev server is running, then pass the port explicitly:

```bash
mappd dev --target-port 3000
```
</details>

<details>
<summary><strong>"Port 3569 in use"</strong></summary>

Mappd auto-increments to the next free port (3570, 3571, ...). Check the terminal output for the actual URL, or override:

```bash
mappd dev --port 4000
```
</details>

<details>
<summary><strong>Screenshots fail with "Could not find Chrome"</strong></summary>

Puppeteer needs Chrome installed. Run:

```bash
npx puppeteer browsers install chrome
```

Or skip screenshots entirely — they're optional. Just don't pass `--screenshots`.
</details>

<details>
<summary><strong>Canvas is blank or screens won't load</strong></summary>

Open the browser console. The most common cause: your dev server is on a different port than Mappd detected. Pass `--target-port` explicitly.
</details>

<details>
<summary><strong>Mappd crashed and left files behind</strong></summary>

Delete `public/mappd-inject.js` from your project and remove any `<script src="/mappd-inject.js">` tag from your HTML entry (`index.html` or `app/layout.tsx`).
</details>

<details>
<summary><strong>My laptop feels slow when Mappd is running</strong></summary>

The biggest resource cost is your own dev server (Next.js Turbopack ≈ 450 MB, Vite ≈ 100 MB). Mappd itself uses ~80 MB. If screenshots are enabled, headless Chrome adds ~250 MB — drop the `--screenshots` flag to skip it.
</details>

---

## How It Works

Mappd uses Babel-based AST analysis to statically parse your routing configuration and detect navigation patterns (`<Link>`, `useNavigate()`, `router.push()`, `redirect()`). It supports both code-based routing (React Router JSX/config) and file-based routing (Next.js `app/` and `pages/` directories). It builds a directed graph of your app's screens and connections, then renders each route as a live iframe on a React Flow canvas. A lightweight script injected into each iframe intercepts navigation events via `postMessage`, so clicking a link pans the canvas instead of navigating away. A file watcher monitors your source code and pushes graph updates over WebSocket in real-time.

When auto-detection fails (no recognized router in `package.json`), Mappd falls back to an interactive prompt that asks for framework and entry point, then saves the config to `.mappd/config.json` so you only answer once.

---

## Configuration

Mappd is designed to work with zero configuration. The CLI flags above cover most use cases.

Project-specific data is stored in a `.mappd/` directory in your project root. This is created automatically and contains:

- `flow-graph.json` -- the parsed route graph
- `config.json` -- saved framework/entry point config (so you only configure once)
- `screenshots/` -- captured screenshot thumbnails
- `screenshots.json` -- screenshot manifest

You can commit `.mappd/` to your repo or add it to `.gitignore`. Your call.

---

## FAQ

<details>
<summary><strong>Does my app need to be running?</strong></summary>

No — for route parsing. Mappd reads your source files statically. But yes — for live screen previews and screenshots. Your dev server (Vite, Next.js, etc.) should be running so the iframes can render your actual UI.
</details>

<details>
<summary><strong>Does Mappd modify my code?</strong></summary>

Temporarily. It copies a small script (`mappd-inject.js`) to your project's `public/` directory and adds a `<script>` tag to your HTML entry point (`index.html` or `app/layout.tsx`). Both are automatically removed when you stop Mappd with Ctrl+C. If Mappd crashes without cleanup, just delete `mappd-inject.js` and remove the script tag.
</details>

<details>
<summary><strong>How does it handle auth-protected routes?</strong></summary>

State pinning. Set auth state once (JWT, session token, user object) in the right panel, and it gets injected into every screen node globally — just like a real browser session. No need to log in on each screen.
</details>

<details>
<summary><strong>Does it work with monorepos?</strong></summary>

Yes. Mappd scans `apps/*/` and `packages/*/` subdirectories to find your app's entry point and routing config. You can also point directly at a sub-package with `mappd dev --dir ./packages/web`.
</details>

<details>
<summary><strong>What if my framework isn't auto-detected?</strong></summary>

Mappd falls back to an interactive prompt — it asks 3 questions (framework, entry point, dev server port), then saves the answers to `.mappd/config.json`. You only answer once per project.
</details>

<details>
<summary><strong>How many routes can it handle?</strong></summary>

Tested up to 205 routes (Cal.com). For apps with 30+ routes, screens load on-click rather than all at once to prevent browser resource exhaustion. The route graph and canvas itself handle hundreds of nodes without issue.
</details>

<details>
<summary><strong>Can I use it with TypeScript?</strong></summary>

Yes. The parser uses Babel with TypeScript and JSX plugins enabled. `.ts`, `.tsx`, `.js`, and `.jsx` files are all supported.
</details>

<details>
<summary><strong>Does clicking a link in a screen actually navigate?</strong></summary>

No — that's the point. Mappd intercepts navigation events inside each iframe and pans the canvas to the destination screen instead. You see the flow without losing your place.
</details>

<details>
<summary><strong>Can I export the route map?</strong></summary>

Yes. Export as PNG from the canvas controls. Individual screen screenshots can also be captured on demand via the built-in Puppeteer API.
</details>

<details>
<summary><strong>Is this a production dependency?</strong></summary>

No. Mappd is a dev-only tool. It runs alongside your dev server and doesn't touch your build output, bundle, or deployment. Nothing ships to your users.
</details>

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
