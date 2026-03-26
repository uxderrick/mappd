# Mappd — Product Plan

**From PoC to v1.0 and beyond.**
*Last updated: 2026-03-26*

---

## The One-Line Pitch

> See your entire React app at once. Stop clicking through screens.

---

## What We've Built (PoC)

| Component | Status |
|-----------|--------|
| Route parser (React Router v6+ & Next.js) | Done |
| CLI tool (`mappd dev`) | Done |
| Infinite canvas (React Flow) | Done |
| Navigation interception (postMessage) | Done |
| State pinning (global auth + per-node URL params) | Done |
| File watcher + WebSocket hot reload | Done |
| Auto-layout (Dagre) | Done |
| Staggered iframe loading | Done |
| Screenshot thumbnails (Puppeteer) | Done |
| Figma-inspired dark UI | Done |

The PoC proves the concept works. Now we need to turn it into a product people can install, use, and love.

---

## Product Philosophy

Borrowed from Linear, Figma, and Vercel:

1. **Be opinionated.** React first. Do it exceptionally well. Don't spread thin.
2. **Speed is the feature.** 60fps canvas. Instant iframe loading. No spinners.
3. **The aesthetic IS the marketing.** Premium feel from day 1. Linear spent $35K on marketing total — the product sold itself.
4. **Individual first, team later.** Figma: 70% of enterprise accounts started with one person on the free tier.
5. **Easy in, easy out.** Zero-config entry. No lock-in. Developers trust tools they can walk away from.

---

## MECE Product Breakdown

### 1. Core Engine

```
├── 1.1 Route Detection
│   ├── React Router v6+ ✅ (v1.0)
│   ├── Next.js App Router ✅ (v1.1)
│   ├── React Router v7 file-based (v1.2)
│   └── Vue/Svelte/Angular (v2.0+)
├── 1.2 Edge Detection
│   ├── Links, programmatic nav, redirects, forms ✅
│   └── State-driven transitions (v2.0)
├── 1.3 Screen Rendering
│   ├── Iframe live preview ✅
│   ├── Screenshot thumbnails ✅
│   └── Staggered loading ✅
├── 1.4 Canvas
│   ├── Pan/zoom/minimap ✅
│   ├── Auto-layout ✅
│   ├── Pan-on-navigate ✅
│   └── Active state highlighting ✅
├── 1.5 State Pinning
│   ├── Global auth ✅
│   ├── Per-node URL params ✅
│   ├── Mock API responses (v1.1)
│   └── Props injection (v1.2)
└── 1.6 Per-Node DevTools (v1.1)
    ├── Console capture
    ├── Network capture
    └── "Open in Editor" links
```

### 2. Developer Experience

```
├── 2.1 Installation: `npx mappd` zero-config
├── 2.2 CLI: dev, init, export commands
├── 2.3 Error handling: graceful failures, clear messages
├── 2.4 Documentation: README, guides, troubleshooting
└── 2.5 Onboarding: bundled demo, "magic moment" in <30 seconds
```

### 3. Performance & Scale

```
├── 3.1 Canvas: 60fps with 50+ nodes (virtualization)
├── 3.2 Parser: incremental re-parse, AST caching
└── 3.3 Dev server: staggered loading, Turbopack recommendations
```

### 4. Distribution & Packaging

```
├── 4.1 npm package (single install, canvas bundled into CLI)
├── 4.2 Semantic versioning + changelog
├── 4.3 CI/CD: automated tests + publish pipeline
└── 4.4 Open source: MIT license, GitHub repo, community templates
```

### 5. Go-to-Market

```
├── 5.1 Positioning: "Live app topology for React developers"
├── 5.2 Launch: Product Hunt + Hacker News + community
├── 5.3 Community: Discord, GitHub Discussions, building in public
└── 5.4 Business model: Open-core (free individual, paid team)
```

### 6. Technical Hardening

```
├── 6.1 Code quality: strict TS, tests, lint, remove hacks
├── 6.2 Architecture: bundle canvas into CLI, config system
├── 6.3 Security: localhost-only, iframe sandbox, no exfiltration
└── 6.4 Persistence: pins.json, layout.json, overrides.json
```

### 7. Competitive Moat

```
├── 7.1 Unique: live screen map, per-node DevTools, auto-detected graph
├── 7.2 Network effects: .mappd config in repos, community plugins
└── 7.3 Switching costs: saved pins, custom layouts, team workflows
```

### 8. Platform Expansion

```
├── 8.1 Desktop: Electron or Tauri (solves injection problem natively)
├── 8.2 IDE: VS Code extension, JetBrains plugin
├── 8.3 Frameworks: Vue, Svelte, Angular
└── 8.4 Collaboration: real-time multiplayer, annotations, comments
```

### 9. Analytics & Telemetry

```
├── 9.1 Anonymous usage metrics (opt-in)
├── 9.2 Parser failure tracking (which patterns fail?)
└── 9.3 Feature usage (which features are used most?)
```

### 10. Accessibility

```
├── 10.1 Keyboard navigation for canvas
├── 10.2 Screen reader support for node labels
└── 10.3 High contrast mode
```

---

## v1.0 MLP Scope (Minimum Lovable Product)

What ships. Nothing more. Everything else defers.

### Must Have

| Feature | Why |
|---------|-----|
| `npx mappd` zero-config on React Router apps | This IS the product |
| 60fps canvas pan/zoom | Janky = dead |
| Live iframe rendering for all detected screens | The "wow" moment |
| Flow lines with auto-detected navigation edges | The differentiator |
| Auto-layout (no manual arrangement needed) | Developers won't manually place nodes |
| Beautiful dark theme | Premium feel = word-of-mouth |
| Screenshot export | Viral artifact — "look at my app's flow" |
| Error resilience (broken screen = error state, not crash) | Trust |

### Defer to v1.1

| Feature | Why It Can Wait |
|---------|----------------|
| Next.js App Router support | React Router first. Most React apps. |
| Per-node DevTools (Console/Network) | Strong differentiator but not launch-critical |
| Mock API responses | Powerful but complex |
| Pin persistence to file | In-memory works for PoC |

### Defer to v2.0+

| Feature | Why It's Premature |
|---------|--------------------|
| Multi-framework (Vue, Svelte) | Be excellent at React first |
| Team collaboration | Individual must work first |
| Desktop app (Electron/Tauri) | Browser-based is fine for v1 |
| Enterprise features | No enterprise customers yet |
| AI-assisted inference | Cool but not essential |

---

## Go-to-Market Timeline

### Now → Launch (4-6 weeks)

| Week | Action |
|------|--------|
| 1-2 | Bundle canvas into CLI. `npx mappd` works end-to-end. |
| 2-3 | Polish: error handling, edge cases, performance. Test on 5+ real projects. |
| 3-4 | Landing page. README. Demo video/GIF. |
| 4 | Share with 10-20 hand-picked React developers. Collect feedback. |
| 5-6 | Fix feedback. Publish to npm. Launch on Product Hunt + HN. |

### Post-Launch (Month 2-6)

| Month | Action |
|-------|--------|
| 2-3 | Next.js support. Per-node DevTools. Based on user feedback. |
| 3-4 | Grow to 500+ users. Track retention. Identify PMF signals. |
| 4-6 | Evaluate team features. Start paid tier if strong PMF. |

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 forever | CLI, canvas, all core features, single-user |
| **Team** | $12-20/user/mo | Shared canvas, comments, CI integration |
| **Enterprise** | Custom | SSO, audit logs, private hosting |

**Rule:** Don't charge until people would be angry if you took the tool away.

---

## What Makes This Defensible

1. **No one else does this.** Live app topology on an infinite canvas — new category.
2. **The parser is the moat.** Detecting routes and navigation across React Router + Next.js is hard. Each framework we add deepens the moat.
3. **Config files in repos.** When teams commit `.mappd/` to their repos, Mappd becomes infrastructure.
4. **The viral screenshot.** Seeing your entire app laid out on a canvas is inherently shareable. Every screenshot is marketing.

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Iframe rendering is too heavy for large apps | Staggered loading + screenshot thumbnails (already built) |
| Devs don't see value in flow visualization | Focus on the "skip the clicking" job, not the "view the map" job |
| Framework ecosystem fragments (React → other) | Parser plugin architecture already designed for this |
| Competition from Figma/Storybook adding similar features | Speed. Ship fast. They move slow on dev tooling. |
| Script injection breaks target apps | Non-invasive by default. Injection is opt-in and lightweight. |

---

## Next Immediate Actions

1. [ ] Bundle canvas into CLI (single `npm install`)
2. [ ] Test `npx mappd` on 5 diverse React Router projects
3. [ ] Write README with quick start + demo GIF
4. [ ] Create landing page (even a simple one)
5. [ ] Start posting about the problem on Twitter/X
6. [ ] Identify 20 early users and reach out
