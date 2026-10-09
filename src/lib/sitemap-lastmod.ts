// Build-time helper: produce an accurate `<lastmod>` for each sitemap URL from
// the git history of the underlying content file — not file mtime, which flips
// every time prettier runs. Requires full git history at build time (the
// `build` script runs `git fetch --unshallow`).
//
// If git is unavailable or a URL doesn't map to a file, the item ships without
// `<lastmod>` — better than an inaccurate date, which Google penalizes.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { SitemapItem } from '@astrojs/sitemap';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const PAGES_DIR = path.join(repoRoot, 'src/content/pages');

const lastmodCache = new Map<string, string | null>();

function gitLastmod(absPath: string): string | null {
	const cached = lastmodCache.get(absPath);
	if (cached !== undefined) return cached;
	if (!existsSync(absPath)) {
		lastmodCache.set(absPath, null);
		return null;
	}
	try {
		const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', absPath], {
			cwd: repoRoot,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		const value = out || null;
		lastmodCache.set(absPath, value);
		return value;
	} catch {
		lastmodCache.set(absPath, null);
		return null;
	}
}

// Map a sitemap URL (e.g. https://chciples.cz/ or /na-ples/dj/) back to the
// content file that drives its lastmod.
function resolveLastmod(urlString: string): string | null {
	let pathname: string;
	try {
		pathname = new URL(urlString).pathname;
	} catch {
		return null;
	}
	const rel = pathname.replace(/^\/+|\/+$/g, ''); // '' | 'na-ples/dj'

	for (const candidate of rel
		? [path.join(PAGES_DIR, `${rel}.md`), path.join(PAGES_DIR, rel, 'index.md')]
		: [path.join(PAGES_DIR, 'index.md')]) {
		if (existsSync(candidate)) return gitLastmod(candidate);
	}
	return null;
}

export function serializeWithLastmod(item: SitemapItem): SitemapItem {
	const ts = resolveLastmod(item.url);
	if (!ts) return item;
	return { ...item, lastmod: ts };
}
