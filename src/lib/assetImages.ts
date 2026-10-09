// Resolves a content-authored image name (a bare filename string in markdown
// frontmatter) to the ESM-imported `ImageMetadata` that Astro's <Image> needs
// for optimization (responsive srcset, webp, intrinsic dimensions).
//
// Every photo under src/assets/images is collected once at build time and keyed
// by both its full filename ("band.jpg") and its extension-less basename
// ("band"), so content can reference either form.
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
	'../assets/images/**/*.{jpg,jpeg,png,webp,avif}',
	{ eager: true },
);

const byKey: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(modules)) {
	const file = path.split('/').pop()!; // band.jpg
	const base = file.replace(/\.[^.]+$/, ''); // band
	byKey[file] = mod.default;
	byKey[base] = mod.default;
}

/** Look up an image by filename ("band.jpg") or basename ("band"). */
export function getAssetImage(name: string | undefined): ImageMetadata | undefined {
	if (!name) return undefined;
	return byKey[name] ?? byKey[name.replace(/\.[^.]+$/, '')];
}
