# Contributing to GasQuiz

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run checks: `bun run lint && bun run test && bun run check`
7. Commit with a descriptive message
8. Push and open a Pull Request

## Branch Naming

```
feature/<description>    # new functionality
fix/<description>        # bug fixes
chore/<description>      # maintenance, deps, config
docs/<description>       # documentation only
```

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add timer countdown to quiz screen
fix: correct score calculation for partial answers
chore: bump pixi.js to latest
docs: add architecture diagram
test: add E2E test for answer selection
refactor: extract scene management from Game class
```

## Build & Test

```bash
bun run dev           # dev server (port 5173)
bun run build         # production build
bun run test          # unit tests (vitest)
bun run test:watch    # unit tests in watch mode
bun run test:e2e      # E2E tests (playwright)
bun run lint          # ESLint
bun run format        # format with Prettier
bun run format:check  # check formatting
bun run check         # svelte-check type checking
```

## Code Organization

| Directory             | What goes here                                  |
| --------------------- | ----------------------------------------------- |
| `src/lib/game/`       | PixiJS game engine: scenes, entities, game loop |
| `src/lib/components/` | Svelte UI components: menus, overlays, settings |
| `src/lib/types/`      | Shared TypeScript types                         |
| `src/routes/`         | SvelteKit pages (keep minimal)                  |
| `e2e/`                | Playwright E2E tests                            |
| `static/`             | Static assets (images, sounds, favicon)         |

## Pull Request Checklist

- [ ] Code compiles (`bun run check`)
- [ ] Tests pass (`bun run test`)
- [ ] Lint passes (`bun run lint`)
- [ ] Formatting is correct (`bun run format:check`)
- [ ] New game logic has unit tests
- [ ] New user-facing flows have E2E coverage (if applicable)
- [ ] No console.log or debug statements left in

## Architecture Notes

- **PixiJS** handles all game rendering on canvas. Game logic lives in `src/lib/game/`.
- **Svelte** is the shell — it mounts/unmounts the canvas and handles any HTML UI (menus, settings).
- **No backend** — the app is a static SPA. Don't add server routes or API endpoints.
- **New features** should be behind a feature flag when possible.

## License

By contributing, you agree that your contributions will be dual-licensed under MIT and Apache 2.0 (see [README](./README.md#license)).
