# Mappd Product Strategy Brief

> Compiled 2026-03-26 from research across 15+ topics covering dev tool GTM, pricing, growth, and positioning.

---

## Table of Contents

1. [What Mappd Is Competing On](#1-what-mappd-is-competing-on)
2. [Jobs to Be Done Analysis](#2-jobs-to-be-done-analysis)
3. [Lessons from Analogous Products](#3-lessons-from-analogous-products)
4. [Go-to-Market Strategy](#4-go-to-market-strategy)
5. [Pricing Model](#5-pricing-model)
6. [Finding Early Users](#6-finding-early-users)
7. [v1.0 Scope: Minimum Lovable Product](#7-v10-scope-minimum-lovable-product)
8. [Prioritization Framework](#8-prioritization-framework)
9. [Distribution Strategy](#9-distribution-strategy)
10. [Building in Public Playbook](#10-building-in-public-playbook)
11. [Common Mistakes to Avoid](#11-common-mistakes-to-avoid)
12. [Recommended Phased Roadmap](#12-recommended-phased-roadmap)

---

## 1. What Mappd Is Competing On

Mappd is not a design tool, not a component library, and not a project management tool. It occupies a new category:

**"Live application topology for frontend developers."**

The closest analogues are:
- **Storybook** — renders components in isolation (but not full screens, no flow connections, no canvas)
- **Figma** — infinite canvas with design artifacts (but not live code, not the real app)
- **React DevTools** — inspects live app state (but no spatial overview, no flow visualization)
- **Vercel Preview Deployments** — shows live app (but one screen at a time)

Mappd's unique value: **see your entire app's screen topology rendered live, simultaneously, on an infinite canvas with flow connections.** No other tool does this.

### Positioning Statement

> Mappd gives React developers a bird's-eye view of their entire application — every screen rendered live, connected by actual navigation flows, on an infinite canvas. Stop clicking through your app to verify changes. See everything at once.

---

## 2. Jobs to Be Done Analysis

The JTBD framework (Tony Ulwick / Strategyn) asks: what "job" is the developer "hiring" Mappd to do? The answer is NOT "render screens on a canvas." That's a feature. The jobs are:

### Primary Job
**"When I'm building a multi-screen React app, help me understand and verify the full picture without manually navigating screen by screen."**

### Supporting Jobs
| Job | Current Solution | Pain Level |
|-----|-----------------|------------|
| Verify a change didn't break other screens | Manually click through the app | High — tedious, error-prone |
| Understand app flow architecture | Mental model, or outdated Figma files | Medium — cognitive load |
| Onboard onto unfamiliar codebase | Read router config, click around | High — slow, incomplete |
| Review a PR's visual impact | Deploy preview, click through | Medium — no spatial context |
| Present app flow to stakeholders | Screenshots stitched together | Low frequency, high effort |

### Emotional Jobs
- **Feel in control** of a growing application
- **Reduce anxiety** about unintended side effects
- **Feel productive** instead of doing manual QA clicking

### Key Insight
The most powerful JTBD is the **onboarding/understanding job** — "help me see the whole app." This is the "wow" moment. It's also the most shareable moment (screenshots of your app's full topology are inherently viral among dev teams).

---

## 3. Lessons from Analogous Products

### Figma: Community-Led Growth (5 Phases)

Figma grew from stealth to $749M revenue and 13M users. Claire Butler (first business hire) documented 5 phases:

1. **Stealth** — Planted seeds with power users. Built relationships before the product was ready. Gave early access to influential designers who would become evangelists.
2. **Public Launch** — "Took over design Twitter." Marketed to people who bristle at traditional SaaS marketing. Let the product speak.
3. **Community Trial** — Got people to try it even if they wouldn't switch full-time yet. Low-commitment entry points.
4. **Evangelists** — Built an evangelist program. Gave insiders access to betas, roadmaps, and executives.
5. **Enterprise** — Connected individual users who loved the product with an enterprise sales motion. 70% of enterprise accounts started with one designer upgrading from free to pro.

**Applies to Mappd:**
- Phase 1 is NOW. Find 10-20 React developers who build multi-screen apps. Give them early access. Build relationships.
- The "wow" screenshot of an app's full canvas IS the viral artifact (like Figma's multiplayer cursors).
- Don't rush to enterprise. Let individuals fall in love first.

### Linear: Opinionated Craft

Linear reached $400M valuation with only $35K lifetime marketing spend. Key principles:

- **Taste-driven development.** They don't A/B test. They make opinionated choices based on conviction and deep user understanding.
- **Speed as a feature.** Everything is fast. No loading spinners. This became their brand.
- **Limited customization.** They guide users toward a default process rather than offering infinite configurability.
- **Bottom-up adoption.** Teams invite colleagues. Network effects without ad spend.
- **Premium positioning.** Linear is described as "a Veblen good for developers" — using it signals you care about craft.

**Applies to Mappd:**
- Be opinionated. Don't try to support every framework. React first. Do it exceptionally well.
- Speed is non-negotiable. Canvas interactions must be 60fps. Iframe loading must feel instant.
- The aesthetic matters. Developers using Mappd should feel like they're using a premium tool.
- Position as "for teams that care about their frontend." Not "for everyone."

### Vercel: Open Source to Commercial Flywheel

Vercel crossed $200M revenue with 100,000+ monthly signups via freemium self-serve. Their playbook:

- **Own the framework.** Next.js gave Vercel top-of-funnel at scale no marketing could match.
- **Commercial product = best way to use the OSS tool.** Vercel is the best place to deploy Next.js.
- **Give away as much as possible to individuals.** The free tier's job is to make developers fall in love.
- **Tier strategy:** Free (fall in love) -> Pro (idea to deployment fast) -> Enterprise (end-to-end platform).
- **Target specific verticals.** They picked Media/Publishing and Ecommerce first — verticals where performance mattered most.

**Applies to Mappd:**
- The CLI + canvas viewer should be free forever for individual developers.
- Identify which types of React apps benefit most (multi-screen apps with complex flows: dashboards, SaaS products, e-commerce).
- If you build an open-source parser/renderer, the commercial value is in the hosted/team experience.

### Storybook / Chromatic: Open Source + SaaS Companion

Storybook is used by thousands of companies (Airbnb, Microsoft, LEGO). Monetization:

- **Storybook is free and open source.** Not owned by any single commercial entity.
- **Chromatic is the SaaS companion.** Cloud rendering, visual testing, CI integration.
- **Enterprise support** as a separate revenue stream.
- **Pledge:** Won't withhold OSS features to monetize them. Commercial products are additive.

**Applies to Mappd:**
- The Storybook model validates "OSS tool + cloud companion." Mappd could follow: free local tool + paid cloud service (shared team canvas, CI visual diffs, hosted previews).
- Storybook's weakness is Mappd's opportunity: Storybook renders components in isolation. Mappd renders full screens in context with flow connections.

---

## 4. Go-to-Market Strategy

### Phase 1: Pre-Launch (Now - v0.1)
**Goal: Build distribution before the product is ready.**

- Start sharing on X/Twitter NOW. Show the canvas rendering. Post GIFs/videos of the "wow" moment.
- Write 2-3 "thinking out loud" posts about the problem (not the solution). "Why do frontend devs still manually click through their apps to verify changes?"
- Engage in React/frontend communities (Reddit r/reactjs, Discord servers, dev.to).

### Phase 2: Early Access (v0.1 - v0.5)
**Goal: 50-100 early users giving active feedback.**

- Hand-pick users. Reach out to developers who build multi-screen React apps.
- Give them a private Discord or Slack channel.
- Weekly updates. Show what you built based on their feedback.
- Evil Martians' data: by strong PMF, 50-70% of signups should be organic (word-of-mouth, GitHub, community). Start tracking this early.

### Phase 3: Public Launch (v1.0)
**Goal: Product Hunt launch + community buzz.**

- Product Hunt launch (Appwrite Sites hit #1 Product of the Day as a dev tool).
- Hacker News "Show HN" post.
- Blog post: "I built a tool that shows your entire React app on one screen."
- Demo video showing a real app (open-source project like cal.com or maybe a demo app) rendered on the canvas.

### Phase 4: Growth (v1.0+)
**Goal: Organic adoption through PLG.**

- npm install should "just work" on any React project.
- The generated canvas view should be inherently shareable (screenshots, links).
- GitHub README badge: "View app flow on Mappd."

### Key GTM Metrics (from Evil Martians PMF Compass)
- Users returning within a week
- Users converting to paid without sales pressure
- Users expanding usage over time
- Past $500K ARR = early PMF confirmed

---

## 5. Pricing Model

### Recommended: Free Individual + Paid Team

Based on research across Figma, Linear, Vercel, Storybook/Chromatic, and dev tool pricing best practices:

| Tier | Price | What's Included | Success Metric |
|------|-------|----------------|----------------|
| **Free (Individual)** | $0 forever | CLI, local canvas, all core features, single-user | Developer falls in love |
| **Team** | $12-20/user/mo | Shared canvas, comments, team annotations, CI integration | Team adopts as standard workflow |
| **Enterprise** | Custom | SSO, audit logs, private hosting, priority support | Org-wide deployment |

### Pricing Principles

1. **60-70% of core features should be in the free tier.** This is the industry benchmark for dev tools.
2. **Gate on collaboration, not functionality.** The individual experience should never feel artificially limited.
3. **The free tier creates future enterprise champions.** Figma's data: 70% of enterprise accounts started with one individual upgrading from free to pro. That individual must love the free product first.
4. **Seat-based pricing is standard** but consider contributor-based (per person who has a project connected) as an alternative.
5. **Don't charge too early.** You need PMF signal before monetization. Charging too early kills growth. Vercel gave away everything to individuals first.

### What NOT to Do
- Don't paywall features that make the individual experience great.
- Don't do usage-based pricing (developers hate unpredictable bills).
- Don't offer annual-only plans at launch (friction).
- Don't undercharge. $12-20/user/mo is the sweet spot for premium dev tools (Linear is $8/user, Figma is $12/user, Vercel Pro is $20/user).

---

## 6. Finding Early Users

### Tier 1: Direct Outreach (Highest Signal)
- Find developers who publicly complain about navigating multi-screen apps.
- Look for teams building complex React dashboards (SaaS companies, fintech, e-commerce).
- Reach out to open-source maintainers of large React apps (cal.com, Plane, Hoppscotch, etc.).
- Attend/watch React meetups and conferences. DM speakers who talk about DX.

### Tier 2: Community Seeding
- Post in r/reactjs, r/webdev, r/frontend with a genuine "I'm building this, would you use it?" framing.
- Share in React Discord servers, Reactiflux.
- dev.to and Hashnode articles about the problem space.
- Twitter/X threads showing the canvas in action.

### Tier 3: Content Marketing
- "How [open-source app] looks on Mappd" — render well-known React apps and share the result.
- "The case against clicking through your app" — problem-awareness content.
- Video walkthroughs on YouTube/Twitter.

### Selection Criteria for Early Users
From the research: early users should be people who will:
1. Give good, honest feedback
2. Fit the target market (React, multi-screen apps)
3. Become champions (have an audience, or work at companies with teams)

### The 90-9-1 Rule
In any community: 90% consume content, 9% participate when they have issues, 1% create content and help others. Your job is to find and nurture the 1% first.

---

## 7. v1.0 Scope: Minimum Lovable Product

### Why MLP, Not MVP

Research confirms: for developer tools, MVP is not enough. Developers have high standards and abundant alternatives. An MVP that feels rough will be dismissed. An MLP creates emotional connection — users return and recommend it.

The MLP bar for Mappd:

### Must Have for v1.0 (MLP)
| Feature | Why It's Essential |
|---------|--------------------|
| `npx mappd` works on any React Router app | Zero-config entry point. This IS the product. |
| Infinite canvas with smooth pan/zoom | Core interaction. Must be 60fps. Janky = dead. |
| All screens rendered live via iframes | The "wow" moment. Must actually show real screens. |
| Flow lines connecting screens by navigation | Differentiator from "just a grid of iframes." |
| Auto-layout (no manual positioning needed) | Developers won't manually arrange screens. |
| Works with React Router v6+ | Covers the majority of React apps. |
| Beautiful default theme | Linear lesson: aesthetics matter. Premium feel from day 1. |
| Shareable screenshot/export | Viral mechanism. "Look at my app's flow." |

### Defer to v1.x
| Feature | Why It Can Wait |
|---------|----------------|
| Next.js App Router support | Important but not launch-critical. React Router first. |
| Team/collaboration features | Individual must work first. Monetization comes later. |
| CI integration | Requires hosted infrastructure. Adds complexity. |
| Custom annotations/pins | Nice to have. Not core to "see your app." |
| State injection between screens | Powerful but complex. Ship without it first. |
| Plugin system | Way too early. You don't know the extension points yet. |

### Defer to v2.0+
| Feature | Why It's Premature |
|---------|--------------------|
| Framework-agnostic (Vue, Svelte, etc.) | Be opinionated. React only for now. |
| Visual regression testing | Chromatic's territory. Don't compete yet. |
| Design-to-code comparison | Cool idea, but not the core job. |
| Enterprise features (SSO, audit logs) | No enterprise customers yet. |

### The Quality Bar (from Evil Martians, 2026)
Six things developer tools must have to earn trust:
1. **Explicit consent for new features** — don't surprise users with behavior changes
2. **Performance** — slowness kills adoption quietly; developers drop slow tools without telling you
3. **Clear documentation** — studied 100 dev tool landing pages; clarity beats cleverness
4. **Predictable behavior** — do what the developer expects, every time
5. **Easy escape hatch** — developers must feel they can stop using your tool without consequence
6. **Transparent roadmap** — builds trust, especially for early adopters betting on you

---

## 8. Prioritization Framework

### Recommended: ICE for Now, RICE Later

**ICE** (Impact, Confidence, Ease) is better for early-stage startups that need speed and agility. Switch to **RICE** (Reach, Impact, Confidence, Effort) when you have user data to inform "Reach" estimates.

### ICE Scoring for Current Features

| Feature | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE Score |
|---------|--------------|-------------------|-------------|-----------|
| Zero-config CLI (`npx mappd`) | 10 | 9 | 6 | 540 |
| Smooth canvas pan/zoom | 9 | 10 | 7 | 630 |
| Live iframe rendering | 10 | 8 | 5 | 400 |
| Flow line connections | 8 | 9 | 6 | 432 |
| Auto-layout algorithm | 7 | 7 | 4 | 196 |
| Screenshot export | 6 | 9 | 8 | 432 |
| Next.js support | 7 | 6 | 3 | 126 |
| Team sharing | 5 | 5 | 3 | 75 |

### Decision: Build in This Order
1. Canvas interaction (pan/zoom) — highest ICE, foundational
2. CLI zero-config — highest impact, defines the product
3. Flow connections + screenshot export — tied, both high value
4. Live iframe rendering — high impact but hardest engineering
5. Auto-layout — needed for usability but can start simple
6. Everything else — defer

---

## 9. Distribution Strategy

### Primary: npm / npx

```
npx mappd          # zero-install, runs immediately
npm install -D mappd  # project dependency
```

Key principles from research:
- **The gap between "works for me" and "works for everyone" is distribution.** Package carefully.
- Entry point in `package.json` bin field pointing to CLI executable.
- Semantic versioning from day 1. Developers trust tools that version properly.
- `prepublishOnly` script to prevent accidental publishes.

### Secondary: GitHub

- Open-source the core (parser + canvas renderer).
- GitHub stars = social proof = discovery.
- GitHub Issues = free feedback channel.
- GitHub Actions integration = CI story for later.

### Discovery Channels
| Channel | Effort | Reach | Timeline |
|---------|--------|-------|----------|
| npm registry | Low | High (searchable) | Immediate |
| Product Hunt | Medium | High (spike) | Launch day |
| Hacker News | Low | High (spike) | Launch day |
| r/reactjs | Low | Medium | Ongoing |
| Twitter/X | Medium | Medium (compounds) | Start now |
| Dev.to / Hashnode | Medium | Medium | Pre-launch |
| React conf talks | High | High | 6+ months |

---

## 10. Building in Public Playbook

### What Works
- **Build audience before product.** One indie hacker grew to 2,400 followers and launched to $8K MRR day one by sharing their journey first.
- **Share the problem, not just the solution.** "I'm frustrated that I have to click through 30 screens to verify a CSS change" resonates more than "I built a tool."
- **Show real numbers.** Downloads, GitHub stars, user feedback. Transparency builds trust.
- **Weekly updates.** Consistency > virality.

### What to Watch Out For
- **Audience capture risk.** If you build in public, there's a high chance you end up building for other indie hackers / builders, not for your actual target users. Stay focused on React developers building real apps, not the "build in public" meta-audience.
- **Don't let sharing replace building.** Building in public is marketing, not product development.
- **Avoid premature metrics sharing.** Sharing "$0 MRR" every week gets old fast. Share what you're learning instead.

### Recommended Cadence
| What | Where | Frequency |
|------|-------|-----------|
| Progress GIFs/videos | Twitter/X | 2-3x/week |
| Technical deep-dives | Blog / dev.to | 2x/month |
| User feedback highlights | Twitter/X | 1x/week |
| Milestone announcements | All channels | As they happen |
| "Thinking out loud" threads | Twitter/X | 1x/week |

---

## 11. Common Mistakes to Avoid

### Product Mistakes
1. **Building for too many frameworks too early.** React only. Be excellent at one thing.
2. **Over-engineering before PMF.** Ship the simplest thing that creates the "wow" moment.
3. **Ignoring performance.** Developers silently abandon slow tools. Canvas must be smooth.
4. **Adding features instead of polishing core.** Linear's lesson: craft > features.
5. **Building collaboration features before individual experience is perfect.** Figma got single-player right first.

### GTM Mistakes
1. **Launching without an audience.** Start sharing NOW, not when v1.0 is ready.
2. **Targeting "all developers" instead of a specific segment.** Start with "React developers building multi-screen SaaS apps."
3. **Paying for ads.** Linear spent $35K on marketing TOTAL. Dev tools grow through product quality and word-of-mouth.
4. **Charging before PMF.** Give it away. Learn. Charge when people would be angry if you took it away.
5. **Ignoring the landing page.** Evil Martians studied 100 dev tool landing pages — clarity, a live demo, and immediate "try it" CTA are what work.

### Business Model Mistakes
1. **Open-sourcing everything with no commercial strategy.** Have a plan for what's free vs. paid before you open source.
2. **Paywalling individual features to force team upgrades.** Developers resent artificial limits.
3. **Not having an escape hatch.** If developers feel locked in, they won't adopt. Make it easy to stop using Mappd.

---

## 12. Recommended Phased Roadmap

### Phase 0: Now (Pre-launch)
- [ ] Finish PoC (hardcoded 5-screen canvas)
- [ ] Start posting about the problem on Twitter/X
- [ ] Identify 20 potential early users (React devs building multi-screen apps)
- [ ] Create a simple landing page with waitlist

### Phase 1: v0.1 - Alpha (Month 1-2)
- [ ] CLI that auto-discovers routes in a React Router app
- [ ] Canvas renders all screens as live iframes
- [ ] Basic pan/zoom navigation
- [ ] Share with 10-20 hand-picked early users
- [ ] Collect feedback weekly

### Phase 2: v0.5 - Beta (Month 3-4)
- [ ] Flow lines connecting screens by navigation
- [ ] Auto-layout algorithm
- [ ] Polish canvas interactions to 60fps
- [ ] Screenshot/export feature
- [ ] Expand to 50-100 beta users
- [ ] Blog post / Twitter thread about what you've learned

### Phase 3: v1.0 - Public Launch (Month 5-6)
- [ ] `npx mappd` works zero-config on React Router apps
- [ ] Beautiful default theme (Linear-level polish)
- [ ] Landing page with live demo
- [ ] Product Hunt launch
- [ ] Hacker News Show HN
- [ ] npm publish with proper semver

### Phase 4: v1.x - Growth (Month 7-12)
- [ ] Next.js App Router support
- [ ] Pin/annotation system
- [ ] State injection between screens
- [ ] Evaluate team features based on demand
- [ ] Start building toward paid tier if PMF signals are strong

---

## Summary: The Mappd Playbook

| Question | Answer |
|----------|--------|
| **What are we building?** | A live infinite canvas that renders all screens of a React app with flow connections |
| **Who is it for?** | React developers building multi-screen apps (SaaS, dashboards, e-commerce) |
| **What's the positioning?** | "See your entire app at once. Stop clicking through screens." |
| **What's the GTM?** | Build in public -> hand-picked alpha -> community launch -> PLG |
| **What's the pricing?** | Free forever for individuals. $12-20/user/mo for teams. Enterprise custom. |
| **What's the distribution?** | npm/npx + GitHub + Product Hunt + community |
| **What's v1.0?** | Zero-config CLI, smooth canvas, live iframes, flow lines, auto-layout, export |
| **What's deferred?** | Next.js, team features, CI integration, plugins, other frameworks |
| **How do we find users?** | Direct outreach to React devs, community posts, build in public, viral screenshots |
| **What's the business model?** | Open-core: free local tool + paid team/cloud features |

---

## Sources

- [Figma's 5 Phases of Community-Led Growth (First Round Review)](https://review.firstround.com/the-5-phases-of-figmas-community-led-growth-from-stealth-to-enterprise/)
- [Figma's Product-Led Growth Success (Ranjeet Tayi)](https://ranzeeth.medium.com/figmas-product-led-growth-success-a-ux-driven-strategic-analysis-9546c210c2dd)
- [The Figma Product Growth Strategy (Aakash Gupta)](https://www.news.aakashg.com/p/the-figma-product-growth-strategy)
- [How Figma Grows (Open Source CEO)](https://www.opensourceceo.com/p/how-figma-grows)
- [Figma: Community to Enterprise Sales Engine (ProfitSnack)](https://profitsnack.com/p/figma-infinite-canvas-community)
- [Linear App Case Study: $400M Issue Tracker (Eleken)](https://www.eleken.co/blog-posts/linear-app-case-study)
- [Linear: Designing for Developers (Sequoia Capital)](https://sequoiacap.com/article/linear-spotlight/)
- [The Linear Method: Opinionated Software (Figma Blog)](https://www.figma.com/blog/the-linear-method-opinionated-software/)
- [Linear's Unconventional Strategy (Michael Goitein)](https://michaelgoitein.substack.com/p/linears-unconventional-strategy-to)
- [How Developer Experience Powered Vercel's $200M+ Growth (Reo.dev)](https://www.reo.dev/blog/how-developer-experience-powered-vercels-200m-growth)
- [Vercel's Path to Product-Market Fit (First Round Review)](https://review.firstround.com/vercels-path-to-product-market-fit/)
- [Vercel: Open-Source to Enterprise (Decibel VC)](https://www.decibel.vc/articles/from-open-source-to-enterprise-how-vercel-built-a-product-led-motion-on-top-of-nextjs)
- [Reverse-Engineering Vercel's GTM (DEV Community)](https://dev.to/michaelaiglobal/reverse-engineering-vercel-the-go-to-market-playbook-that-won-the-frontend-3n5o)
- [Why Chroma's Getting Behind Storybook (Chromatic)](https://www.chromatic.com/blog/why-chromas-getting-behind-storybook/)
- [Product-Market Fit Methodology for Devtools (Evil Martians)](https://evilmartians.com/chronicles/product-market-fit-methodology-devtools)
- [6 Things Dev Tools Must Have in 2026 (Evil Martians)](https://evilmartians.com/chronicles/six-things-developer-tools-must-have-to-earn-trust-and-adoption)
- [Pricing Developer Tools (Heavybit)](https://www.heavybit.com/library/article/pricing-developer-tools)
- [Dev Tool Pricing Examples (Markepear)](https://www.markepear.dev/examples/pricing)
- [Technical Feature Gating in Developer Tools (Monetizely)](https://www.getmonetizely.com/articles/technical-feature-gating-in-developer-tools-pricing-strategy-guide-for-code-quality-amp-devops-products)
- [Developer Marketing Playbook (Decibel VC)](https://www.decibel.vc/articles/developer-marketing-and-community-an-early-stage-playbook-from-a-devtools-and-open-source-marketer)
- [Developer Marketing in 2025 (Carilu)](https://www.carilu.com/p/developer-marketing-in-2025-what)
- [Everything About Devtools Marketing (Draft.dev)](https://draft.dev/learn/everything-ive-learned-about-devtools-marketing)
- [RICE Prioritization Framework (Intercom)](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)
- [RICE vs ICE Comparison (ProductLift)](https://www.productlift.dev/blog/rice-vs-ice)
- [MVP vs MLP Comparison (Adam Fard)](https://adamfard.com/blog/mvp-vs-mlp)
- [Jobs to Be Done Framework (Strategyn)](https://strategyn.com/jobs-to-be-done/)
- [JTBD Framework (ProductPlan)](https://www.productplan.com/glossary/jobs-to-be-done-framework/)
- [Building in Public (Indie Hackers)](https://www.indiehackers.com/group/building-in-public)
- [Twitter Strategy for Indie Hackers 2026 (Teract)](https://www.teract.ai/resources/twitter-strategy-indie-hackers-2026)
- [Bootstrapped Indie App Growth Strategies (OctoSpark)](https://octospark.ai/blog/bootstrapped-indie-app-growth-strategies-zero-to-100k)
- [12 Fastest Growing OSS Dev Tools (Landbase)](https://www.landbase.com/blog/fastest-growing-open-source-dev-tools)
- [Open-Core Business Model (FourWeekMBA)](https://fourweekmba.com/open-core/)
