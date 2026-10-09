// Build-time Open Graph image (1200×630), one per content page. Echoes the
// site's homepage hero rather than a generic card: the hero photo under the
// blue→purple brand gradient, a big bold white title and the signature white
// rule. Satori renders it to SVG; sharp rasterizes to PNG. Text becomes vector
// paths, so previews never depend on the viewer's fonts.
import { readFileSync } from 'node:fs';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../../data/site';

// Brand tokens.
const BRAND_BLUE = '#0055ff';
const BRAND_PURPLE = '#7700ff';
const SITE_HOST = 'chciples.cz';

// Montserrat, committed under src/assets/fonts so the build needs no network.
// latin-ext is loaded as a second family so the stack falls back to it for
// Czech diacritics (á/č/ř/ž/…).
type SatoriFonts = Parameters<typeof satori>[1]['fonts'];
const fonts: SatoriFonts = (() => {
	const read = (f: string) => readFileSync(`src/assets/fonts/${f}`);
	return [
		{ name: 'Montserrat', data: read('montserrat-latin-400-normal.woff'), weight: 400, style: 'normal' },
		{ name: 'Montserrat', data: read('montserrat-latin-700-normal.woff'), weight: 700, style: 'normal' },
		{ name: 'MontserratExt', data: read('montserrat-latin-ext-400-normal.woff'), weight: 400, style: 'normal' },
		{ name: 'MontserratExt', data: read('montserrat-latin-ext-700-normal.woff'), weight: 700, style: 'normal' },
	];
})();

// The logo (white wordmark), read once and inlined as a data URI.
const logo = await (async () => {
	try {
		const buf = readFileSync('public/images/logo.png');
		const meta = await sharp(buf).metadata();
		const ratio = meta.width && meta.height ? meta.width / meta.height : 3;
		return { src: `data:image/png;base64,${buf.toString('base64')}`, ratio };
	} catch {
		return null;
	}
})();

// The hero photo, pre-cropped to the card size so it tiles the whole background
// (same photo the homepage hero uses). Inlined as a data URI — no runtime fetch.
const heroPhoto = await (async () => {
	try {
		const buf = readFileSync('src/assets/images/c-intro__prom--optimized.jpg');
		const out = await sharp(buf).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer();
		return `data:image/jpeg;base64,${out.toString('base64')}`;
	} catch {
		return null;
	}
})();

// Satori accepts React-like element objects; no JSX needed.
function el(type: string, style: Record<string, unknown>, children?: unknown) {
	return { type, props: { style, children } };
}

// The SEO titles carry decorative emoji (💃🎸📷…); Montserrat has no glyph for
// them, so Satori would render tofu boxes. Strip them for the OG card.
function stripEmoji(text: string): string {
	return text
		.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Scale the title down as it gets longer so it always fits the card.
function titleSize(text: string): number {
	if (text.length > 55) return 56;
	if (text.length > 38) return 68;
	return 84;
}

export const getStaticPaths: GetStaticPaths = async () => {
	const pages = await getCollection('pages');
	return pages.map((page) => ({
		params: { path: page.id },
		props: {
			title: page.data.seo?.title ?? page.data.title,
			description: page.data.seo?.description ?? site.defaultDescription,
		},
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const title = stripEmoji((props.title as string) ?? site.defaultTitle);
	const description = stripEmoji((props.description as string) ?? '');

	const logoNode = logo
		? { type: 'img', props: { src: logo.src, height: 54, width: Math.round(54 * logo.ratio), style: {} } }
		: el('div', { fontSize: 38, fontWeight: 700, color: '#ffffff' }, site.name);

	const children: unknown[] = [];

	// Background photo (if available) — tiled to the full card.
	if (heroPhoto) {
		children.push({
			type: 'img',
			props: {
				src: heroPhoto,
				width: 1200,
				height: 630,
				style: { position: 'absolute', top: 0, left: 0 },
			},
		});
	}
	// Brand gradient over the photo (the homepage hero overlay), then a soft
	// darkening toward the bottom so the white title stays legible.
	children.push(
		el('div', {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundImage: `linear-gradient(150deg, rgba(0,85,255,0.82) 0%, rgba(119,0,255,0.82) 59%)`,
		}),
		el('div', {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundImage: `linear-gradient(180deg, rgba(10,0,40,0) 40%, rgba(10,0,40,0.4) 100%)`,
		}),
		// Logo, top-left.
		el('div', { position: 'absolute', top: '60px', left: '72px', display: 'flex' }, [logoNode]),
		// Host, top-right.
		el(
			'div',
			{
				position: 'absolute',
				top: '72px',
				right: '72px',
				display: 'flex',
				fontSize: 26,
				fontWeight: 700,
				color: 'rgba(255,255,255,0.9)',
			},
			SITE_HOST
		)
	);

	// Bottom-anchored content: title + white rule + description.
	children.push(
		el(
			'div',
			{
				position: 'absolute',
				left: '72px',
				right: '72px',
				bottom: '70px',
				display: 'flex',
				flexDirection: 'column',
			},
			[
				el(
					'div',
					{
						fontSize: titleSize(title),
						fontWeight: 700,
						color: '#ffffff',
						lineHeight: 1.05,
						letterSpacing: '-2px',
						display: '-webkit-box',
						WebkitBoxOrient: 'vertical',
						WebkitLineClamp: 3,
						overflow: 'hidden',
					},
					title
				),
				// signature white rule under the heading
				el('div', {
					marginTop: '26px',
					height: '6px',
					width: '128px',
					borderRadius: '9999px',
					backgroundColor: '#ffffff',
				}),
				description
					? el(
							'div',
							{
								marginTop: '26px',
								fontSize: 29,
								lineHeight: 1.4,
								letterSpacing: '-0.5px',
								color: 'rgba(255,255,255,0.92)',
								display: '-webkit-box',
								WebkitBoxOrient: 'vertical',
								WebkitLineClamp: 2,
								overflow: 'hidden',
							},
							description
						)
					: null,
			]
		)
	);

	const tree = el(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			position: 'relative',
			backgroundImage: `linear-gradient(150deg, ${BRAND_BLUE} 0%, ${BRAND_PURPLE} 59%)`,
			fontFamily: 'Montserrat, MontserratExt',
		},
		children
	);

	const svg = await satori(tree, { width: 1200, height: 630, fonts });
	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
