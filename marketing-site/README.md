# TryDogfooding Marketing Site

This app lives in `/marketing-site` and rebuilds the `posthog.com` desktop-window homepage pattern for TryDogfooding, with the copy swapped over to our docs-driven messaging.

The site is a Vite + React static frontend. The visual structure is intentionally close to PostHog's current desktop/mobile homepage experience: taskbar, desktop icon rails, floating reader window, textured background, and stacked marketing sections. The deployable copy source is [src/content/ux-copy.json](/Users/jaybhagat/projects/try-dogfooding/marketing-site/src/content/ux-copy.json), which was copied from the repo docs so this app can be published and deployed on its own.

## Getting Up And Running

From the repo root:

```bash
cd marketing-site
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Local Production Build

```bash
cd marketing-site
npm run build
npm run preview
```

The production output lands in `marketing-site/dist`.

## Deployment

This site is a plain static build. There are no runtime environment variables or server functions required for the current version.

### Vercel

- Root directory: `marketing-site`
- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` is already present

### Netlify

- Base directory: `marketing-site`
- Build command: `npm run build`
- Publish directory: `dist`
- `public/_redirects` is already present

### Cloudflare Pages

- Project root: `marketing-site`
- Build command: `npm run build`
- Output directory: `dist`

## Contributing

### Copy

- Treat [src/content/ux-copy.json](/Users/jaybhagat/projects/try-dogfooding/marketing-site/src/content/ux-copy.json) as the deployable copy source for this repo.
- If the website wording and the broader product docs disagree, sync both in the same change.
- Keep the operator-first voice intact. Avoid hype, vague AI language, and claims the docs do not support.

### Structure

- [src/App.tsx](/Users/jaybhagat/projects/try-dogfooding/marketing-site/src/App.tsx) contains the page composition and interactive states.
- [src/content/siteContent.ts](/Users/jaybhagat/projects/try-dogfooding/marketing-site/src/content/siteContent.ts) maps repo docs into homepage copy, nav labels, and section data.
- [src/index.css](/Users/jaybhagat/projects/try-dogfooding/marketing-site/src/index.css) holds the design tokens, window chrome, responsive layout, and section styling.

### Workflow

1. Make the content or UI change.
2. Run `npm run build`.
3. Check the page at desktop and mobile widths.
4. Keep the PostHog-style structure coherent while changing only what needs to be ours.

## Current Notes

- The clone currently focuses on the homepage experience, not a full multi-route PostHog site port.
- Decorative art and icon assets are loaded from PostHog's public Cloudinary assets to stay visually close while we iterate on structure and copy.
- The footer legal links are placeholders until reviewed content exists.
