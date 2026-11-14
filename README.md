# ciderboi.xyz

Personal site for Nitya Naman — graphics, systems, and low-level software.

Built with **Astro** (static output, zero client JS by default), **Tailwind v4**, and a
single **three.js** WebGL renderer for the hero's volumetric fog.

## Develop

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:4321.

## Build

```bash
npm run build     # static output in dist/
npm run preview   # serve dist/ locally
```

## Deploy (Vercel)

The repo is preconfigured for Vercel:

- `vercel.json` — build command, static output directory, social redirects (308),
  long-lived caching for `/img` and `/_astro`, and baseline security headers.
- `astro.config.mjs` — `site` URL and the same redirects, so `dist/` is portable to
  any static host.

Import the repo into Vercel and deploy; no environment variables are required.

## Content

Everything editable lives in `src/content/*.json`:

| File | Contents |
| --- | --- |
| `site.json` | name, tagline, description, socials, nav, redirects |
| `projects.json` | projects, ordered by `order`; optional `log[]` entries |
| `experiences.json` | experience timeline |
| `skills.json` | grouped skill lists |
| `songs.json` | releases (generated from the old catalogue) |

Types and accessors are in `src/lib/content.ts`. Add a project by appending an object
to `projects.json` — the index, detail page, and homepage all pick it up.

## Performance

The hero ships as three layers:

1. **Inline LQIP** (144 bytes) painted immediately.
2. **Progressive AVIF** (`public/img/bg-*.avif`, 11–62 KB) chosen by viewport.
3. **WebGL fog** (`fog.*.js`, dynamically imported, ~120 KB gzip) — loaded only on
   4G/!saveData connections, after `load`, and only while the hero is on screen.

Slow connections get the photograph, grain, and vignette, which is a complete
experience on its own. Page HTML is ~3.5 KB gzipped with zero JS before the loader.

## Structure

```
src/
  components/Container.astro
  content/*.json
  layouts/Base.astro
  lib/content.ts        types + typed accessors
  lib/scene/fog.ts      WebGL renderer
  lib/scene/shaders.ts  GLSL
  pages/
    index.astro  work/  about.astro  stack.astro  music.astro  404.astro
  styles/global.css
```