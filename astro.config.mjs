// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import { serializeWithLastmod } from './src/lib/sitemap-lastmod.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://chciples.cz',
	trailingSlash: 'ignore',
	integrations: [
		sitemap({
			filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
			// `<lastmod>` derived from each page's git history — see
			// src/lib/sitemap-lastmod.ts.
			serialize: serializeWithLastmod,
		}),
		svelte(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	// Self-host Montserrat (the brand face) via Astro's native font support,
	// exposed as a CSS variable consumed in global.css.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Montserrat',
			cssVariable: '--font-montserrat',
			weights: ['300', '400', '500', '600', '700', '800'],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext'],
		},
	],
	build: {
		format: 'directory',
	},
	devToolbar: {
		enabled: false,
	},
});
