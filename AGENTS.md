# GasQuiz — Agent Instructions

This file is the single source of truth for AI agent behavior in this repository.
All principles from the global AGENTS.md apply here unless explicitly overridden.

## Project Overview

GasQuiz is a browser-based quiz game built with SvelteKit, PixiJS, and TypeScript. It runs entirely in the browser as a static SPA — no backend, no server-side rendering. The game renders primarily on an HTML5 canvas via PixiJS, with SvelteKit serving as a minimal shell for bootstrapping, routing (if needed), and any HTML-based UI (settings, menus).

- **Repository**: https://github.com/tcaxias/GasQuiz
- **License**: MIT + Apache 2.0 (dual, user's choice)
- **Lifecycle**: active development
- **Deployment target**: Cloudflare Pages (static)

## Goals

- Deliver a fun, fast, browser-native quiz game
- Keep bundle size small — no unnecessary dependencies
- Maintain clean separation between Svelte shell and PixiJS game engine

## Architecture

### Rendering Model

```
SvelteKit (shell)
  +layout.svelte  — imports global CSS, renders children
  +page.svelte    — mounts PixiJS canvas container
       |
       v
  PixiJS Application (Game.ts)
       |  creates canvas, manages scenes, handles game loop
       |
       v
  Canvas (WebGL 2D)
       renders all game visuals: questions, answers, timers, animations
```

- **SvelteKit** owns the HTML document, routing, and any non-canvas UI
- **PixiJS** owns the canvas and all game rendering
- The boundary is `src/routes/+page.svelte` which mounts/unmounts the `Game` instance via `onMount`/`onDestroy`
- Game state lives inside the PixiJS layer, not in Svelte stores (unless sharing state between Svelte UI and canvas becomes necessary)

### Key Directories

| Directory             | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `src/routes/`         | SvelteKit pages and layouts                      |
| `src/lib/game/`       | PixiJS game engine — `Game.ts`, scenes, entities |
| `src/lib/components/` | Svelte UI components (menus, settings, overlays) |
| `src/lib/types/`      | Shared TypeScript type definitions               |
| `e2e/`                | Playwright end-to-end tests                      |
| `static/`             | Static assets served as-is (favicon, etc.)       |
| `build/`              | Production output (adapter-static)               |

## Tech Stack

| Category        | Technology           | Notes                                        |
| --------------- | -------------------- | -------------------------------------------- |
| Framework       | SvelteKit + Svelte 5 | Minimal shell, adapter-static for Cloudflare |
| Build           | Vite                 | Bundled with SvelteKit                       |
| Language        | TypeScript           | strict mode, bundler module resolution       |
| Rendering       | PixiJS               | WebGL 2D renderer for all game visuals       |
| Styling         | Tailwind CSS v4      | Vite plugin, for any HTML UI elements        |
| Unit testing    | Vitest               | happy-dom environment                        |
| E2E testing     | Playwright           | Chromium, tests canvas visibility            |
| Package manager | bun                  | All commands use `bun run`                   |
| Linting         | ESLint               | Flat config with TS + Svelte + Prettier      |
| Formatting      | Prettier             | prettier-plugin-svelte                       |

## Commands

```bash
bun install           # install dependencies
bun run dev           # start dev server (port 5173)
bun run build         # production build to build/
bun run preview       # preview production build
bun run test          # run unit tests (vitest)
bun run test:watch    # run unit tests in watch mode
bun run test:e2e      # run E2E tests (playwright)
bun run lint          # run ESLint
bun run format        # format all files (prettier)
bun run format:check  # check formatting without modifying
bun run check         # svelte-check (type checking)
```

## Testing

- **Unit tests**: Vitest with happy-dom. Test files live next to source files as `*.test.ts`. Run with `bun run test`.
- **E2E tests**: Playwright in `e2e/` directory. Tests run against the dev server. Run with `bun run test:e2e`.
- **Type checking**: `bun run check` runs svelte-check against the full project.

## Agent Guardrails

### Do NOT change without discussion

- **License**: Dual MIT + Apache 2.0. Do not change, remove, or add license files.
- **Rendering approach**: PixiJS for game canvas, Svelte for shell. Do not introduce a second rendering library or move game rendering to DOM.
- **Package manager**: bun. Do not switch to npm, pnpm, or yarn.
- **Static SPA**: The app must remain a fully static SPA (adapter-static, `ssr = false`). Do not add server-side rendering or server endpoints without explicit approval.

### Conventions

- **Feature flags**: All new user-visible behavior behind a feature flag. Implementation TBD — can be as simple as a config object for now.
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- **Branches**: `feature/<description>`, `fix/<description>`.
- **Tests**: New game logic must have unit tests. New user-facing flows should have E2E coverage.
- **No server code**: Do not add API endpoints, server routes, or form actions. If backend is needed later, it will be via Cloudflare Workers as a separate concern.

### Code Organization

- **Game logic** goes in `src/lib/game/`. This is the PixiJS layer.
- **Svelte components** go in `src/lib/components/`. These are HTML/CSS UI components.
- **Types** go in `src/lib/types/`. Shared between game and Svelte layers.
- **Routes** stay minimal. `+page.svelte` mounts the game. Additional routes only if genuinely needed (e.g., a settings page).
- **Assets**: Game assets (sprites, sounds) go in `static/` or are imported via Vite's asset pipeline.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
