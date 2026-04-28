# Jaco Driver Project Rules

`README.md` is still mostly boilerplate. Use this file as the primary project guide for future work in this repository.

## Product Context

- This is a driver-facing operational web app, not a marketing site and not an admin panel.
- The main audience is mobile users, mostly drivers and dispatch-related staff.
- The UI language is Russian. New copy should stay short, direct, and practical.
- The interface should reduce cognitive load: fast scanning, large tap targets, low visual noise.

## Output And Communication

- Do not output diffs to chat unless explicitly requested.
- Do not paste patch tool output, patch contents, colored code chunks, or generated diff-like blocks into chat unless explicitly requested.
- When work is written to files, reply with a concise recap of what changed and what was verified.

## Stack

- Next.js 16 with the pages router
- React 19
- MUI 7
- Sass/SCSS for screen styling
- Zustand for app state and API actions
- Axios + `query-string` for API requests
- Yandex Metrika + custom analytics helpers
- Sentry initialized in `pages/_app.js`

## Repository Map

- `pages/*`: route entrypoints only
- `widgets/*-screen`: full screens and large page composition
- `widgets/app-header`: app header entrypoint during migration away from `modules/header.jsx`
- `features/*`: user actions and flows
- `entities/*`: domain state, API adapters, normalization, entity-level UI
- `shared/api/*`: transport, API clients, legacy wrappers
- `shared/lib/*`: helpers, formatters, analytics re-exports, utilities
- `shared/ui/*`: reusable UI primitives
- `styles/*.scss`: existing screen/global SCSS kept during migration
- `ui/*`: legacy shared UI bucket during migration
- `components/meta.js`: document title and app icons
- `components/sessionHook.ts`: current lightweight auth/session access

## Architecture Rules

- Keep `pages/*` thin:
  - auth/session guard
  - route redirects
  - `Meta`
  - rendering the page widget
- Put page-sized UI in `widgets/*-screen`.
- Put user actions and flows in `features/*`.
- Put domain state, normalization, and API-facing entity logic in `entities/*`.
- Widget-local `model/*` is allowed only for screen orchestration state. Do not put durable domain state there if it belongs to an entity slice.
- Prefer `shared/api/client.ts` and related `shared/api/*` files for transport. Treat `components/api.js` as legacy isolation only.
- Keep analytics calls in existing analytics conventions instead of ad hoc `window.ym` calls.
- Work within the current auth pattern unless the task explicitly asks for auth refactoring:
  - token in `localStorage`
  - session resolved via `components/sessionHook.ts`
- `modules/*` is legacy. Do not place new screens there.
- `ui/*` and `styles/*` may remain during migration, but new reusable primitives should prefer `shared/ui/*` and new shared helpers should prefer `shared/lib/*`.
- Treat `modules/price_page 2.jsx` and `modules/statistics_page 2.jsx` as legacy duplicates. Do not build new features in those files unless intentionally migrating them.

## Design System

- Primary brand color stays `#CC0033`.
- Secondary project palette is `Graphite Steel` from `ui/palette.js` and `styles/settings.scss`.
- Use the brand red for:
  - top app bar / header
  - primary CTA buttons
  - critical brand accents
- Use graphite/steel blue for:
  - selected navigation state
  - secondary emphasis
  - calm structural highlights
  - info-focused accents in tables and cards
- Prefer white cards and soft cool-gray fills over tinted red surfaces.
- Avoid pink/red haze, blurred decorative backgrounds, and “glow” effects unless there is a very explicit reason.
- Shadows should be soft and slightly graphite-toned, not rosy.
- Use existing palette tokens before adding new colors.

## Visual Language

- Mobile-first first, desktop-second.
- Bold, high-contrast titles are preferred over decorative typography.
- Use generous spacing, but avoid large empty dead zones.
- Cards should feel clean and intentional: rounded, light, and structured.
- Align icon + title groups vertically by center, not by the top edge.
- Avoid unnecessary helper text if the screen already explains itself.
- Remove duplicate headings and redundant explanations when the UI is self-evident.

## Page-Specific UI Rules

### Left Menu

- Drawer header stays red.
- Active navigation item should be blue/steel, not red.
- Contact labels should stay on one line when possible.
- Phone numbers should be formatted and centered cleanly under the label.

### Auth / Password Recovery

- Keep a single clear form panel, without extra promo cards.
- Avoid mismatched autofill backgrounds and broken input radii.
- Auth screens should fill the viewport cleanly without large empty tails under the main panel.

### Graph Page

- Keep the graph screen simplified and operational.
- The schedule table is the main focus.
- Current user row may be accented more strongly than neutral rows.
- Today may be highlighted, but the highlight must not clash with weekend or current-user emphasis.
- Error tables should stay compact and avoid horizontal scrolling on mobile.
- Month picker bottom sheet should have:
  - a drag handle
  - enough side insets
  - enough bottom inset so the last option does not touch the screen edge
  - no redundant title text

### Tables

- Avoid horizontal scroll unless the data model truly requires it.
- If a table becomes too wide on mobile, reduce it to essential columns first.
- Prefer meaningful emphasis:
  - current user
  - today
  - weekend
  - active selection
- Do not rely on subtle gray differences alone when the user needs to notice a state.

## Styling Rules

- Prefer SCSS tokens from `styles/settings.scss` and JS tokens from `ui/palette.js`.
- Avoid random hardcoded colors. If a new one is necessary, it should fit the existing palette.
- Use inline styles only for small MUI-specific runtime values. Put reusable visual logic in SCSS.
- When MUI selected/hover states fight the intended design, override `.Mui-selected` explicitly.
- Keep radii soft and modern:
  - buttons/cards often in the `16px` to `28px` range
- Keep borders and fills subtle; use contrast through hierarchy before adding saturation.

## Copy Rules

- Russian only for user-facing text unless the screen is technical by nature.
- Prefer short action labels:
  - `Показать статистику`
  - `Восстановить пароль`
  - `График работы`
- Avoid long paragraphs unless they help a high-friction flow.
- Empty states should be calm and specific.

## Data Handling Rules

- Backend responses are not always normalized. Code defensively.
- Expect mixed shapes and fallbacks such as:
  - `user_id` or `driver_id`
  - `user_name` at root or inside nested row cells
  - numeric flags returned as strings like `"0"` / `"1"`
  - empty string instead of `null`
- Normalize boolean-like settings before using them in UI.
- When identity comes from the server payload, prefer the payload over front-end heuristics.

## Analytics Rules

- Important user actions should be logged through `log(...)`.
- Keep event naming readable and action-oriented.
- Preserve existing patterns for:
  - page opens
  - menu actions
  - phone calls
  - modal open/close
  - month selection

## Verification Rules

- Do not run frontend tests, lint, build, or similar verification commands unless the user explicitly asks for them.
- There are existing lint warnings in the repo. Do not silently add new ones.
- For visual tasks, prefer checking the real browser state before calling the work done.

## Recommended Codex Skills For This Repo

- `playwright`: for browser verification, layout checks, and interaction debugging
- `figma` or `figma-implement-design`: when a Figma source is provided
- `screenshot`: when comparing visual states or documenting UI results

Notes:

- This repo is not an admin/content dashboard, so `next-mui-admin-page` is usually not the right default here.
- Use browsing only when the task truly needs external current documentation or verification.

## Working Agreements

- Preserve unrelated user changes in the worktree.
- Prefer incremental refinements over broad redesigns without alignment.
- Keep the app practical, fast to scan, and comfortable on mobile.
- When unsure between “louder” and “cleaner”, prefer cleaner.
- When unsure between “more columns” and “less scroll”, prefer less scroll.

## Future Extension

- If needed later, this file can be turned into a dedicated project-specific Codex skill.
- Until then, `AGENTS.md` is the source of truth for design and implementation conventions in this repository.
