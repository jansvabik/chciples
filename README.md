# Chci ples!

[![Netlify Status](https://api.netlify.com/api/v1/badges/6185b679-5878-47bf-87a0-a4f57c563885/deploy-status)](https://app.netlify.com/sites/chciples/deploys)

Chciples.cz project website. Built with [Astro](https://astro.build/) (static
output), Tailwind CSS v4 and a single Svelte island.

## Architecture

Block-based pages. Every page lives in `src/content/pages/**.md`; its frontmatter
carries a `blocks` array, each block discriminated by `_component` and validated
by the zod schema in `src/lib/schemas.ts` (the single source of truth). A catch-all
route (`src/pages/[...slug].astro`) renders them via `src/lib/BlockRenderer.astro`,
which auto-registers every component under `src/components/blocks/`.

Service pages (`src/content/pages/na-ples/*.md`) also declare a `service:` block
of card metadata; the homepage `services` block collects and orders them.

### SEO

- **OG images** — generated per page with Satori + sharp (`src/pages/og/[...path].png.ts`).
- **Sitemap** — `@astrojs/sitemap`, with `<lastmod>` derived from each file's git
  history (`src/lib/sitemap-lastmod.ts`).
- **llms.txt** — `src/pages/llms.txt.ts`.
- **JSON-LD** — `@graph` builder in `src/lib/jsonld.ts` (LocalBusiness, WebSite,
  BreadcrumbList, per-service Service), injected once in the layout.
- **robots.txt** — `public/robots.txt`.

## Develop

    pnpm install
    pnpm dev

## Build

    pnpm build      # outputs to dist/
    pnpm preview    # serve the production build locally
