# TryDogfooding Marketing Site — The Dogfooding Academy

The public-facing website at [trydogfooding.com](https://trydogfooding.com). A static SPA built with Vite + React, themed as "The Dogfooding Academy" — a green chalkboard aesthetic with school-themed illustrations and dog character sprites.

This app lives in `/marketing-site` within the monorepo.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 6 |
| **Bundler** | Vite 8 |
| **Routing** | react-router-dom 7 |
| **Styling** | Vanilla CSS (design tokens in `index.css`) |
| **Build output** | Static HTML/JS/CSS → `dist/` |

## Getting Started

From the repo root:

```bash
cd marketing-site
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Production Build

```bash
cd marketing-site
npm run build
npm run preview    # preview the production build locally
```

The production output lands in `marketing-site/dist/`.

## Deployment

This site is a static build. No runtime environment variables, no server functions, no SSR.

### Vercel

- **Project:** `trydogfooding-marketing-site`
- **Root directory:** `marketing-site`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA routing:** handled by `vercel.json` rewrite rule (`/* → /index.html`)

Vercel auto-deploys from the `main` branch. Preview deploys are created for every PR.

## Project Structure

```
marketing-site/
├── index.html              # Vite entry point
├── package.json
├── vite.config.ts          # Vite config (React plugin, parent dir access)
├── vercel.json             # Vercel SPA rewrite
├── tsconfig.json           # TypeScript project references
├── eslint.config.js
├── public/                 # Static assets (images, sprites, favicon)
└── src/
    ├── main.tsx            # React entry
    ├── App.tsx             # Page composition, routing, interactive state
    ├── App.css             # Component-level styles
    ├── index.css           # Design system — tokens, layout, typography, sections
    ├── assets/             # Imported assets (images, SVGs)
    └── content/
        ├── siteContent.ts  # Homepage copy, nav labels, section data
        └── ux-copy.json    # Deployable copy source (synced from docs)
```

## Contributing

### Copy

- Treat [`src/content/ux-copy.json`](src/content/ux-copy.json) as the deployable copy source.
- If website copy and the broader product docs (`docs/central-doc.md`) disagree, sync both in the same change.
- Keep the operator-first voice intact. Avoid hype, vague AI language, and claims the docs don't support.

### Design

- The site uses "The Dogfooding Academy" chalkboard theme — green backgrounds, chalk-like accents, school-themed illustrations.
- Dog character sprites serve as mascots (Principal, Teacher, Paraprofessional).
- Design tokens live in [`src/index.css`](src/index.css). Use existing tokens rather than ad-hoc values.

### Workflow

1. Make the content or UI change.
2. Run `npm run build` — confirm no TypeScript or build errors.
3. Check the page at desktop and mobile widths.
4. Run `npm run lint` for code quality.

## CI/CD

Lint and build run automatically on every PR via [GitHub Actions](../.github/workflows/ci.yml). Vercel handles production deploys on push to `main`.

## Current Notes

- The site is a single-page homepage experience, not a multi-route app.
- The footer legal links are placeholders until reviewed content exists.
