import { z } from 'astro/zod';

/**
 * Content schemas for the block-based pages. Each page's frontmatter carries a
 * `blocks` array; every block is discriminated by `_component` and validated
 * here — this file is the single source of truth for both content validation
 * and the block components' prop types.
 */

// Shared button used inside hero / media / cta blocks.
export const buttonSchema = z.object({
	text: z.string(),
	link: z.string().default('/'),
	theme: z.enum(['solid', 'ghost', 'link']).default('link'),
});

// ---- Blocks -----------------------------------------------------------------

// Full-bleed gradient intro at the top of every page.
const heroBlock = z.object({
	_component: z.literal('hero'),
	// The large display line (e.g. "Chci ples!" or the phone number).
	heading: z.string(),
	// Subtitle under the heading. The literal token `{rotate}` is replaced by
	// an animated word cycling through `rotateWords`.
	motto: z.string(),
	rotateWords: z.array(z.string()).default([]),
	// Mobile-only scroll-down arrow target + a11y label.
	arrowTo: z.string().optional(),
	arrowText: z.string().optional(),
	// Smaller display line (used on the contact page where the heading is a
	// phone number and should not be 7rem tall). Purely presentational.
	smaller: z.boolean().default(false),
});

// "Why us" — a row of icon boxes.
const reasonsBlock = z.object({
	_component: z.literal('reasons'),
	heading: z.string(),
	boxes: z.array(
		z.object({
			icon: z.enum(['beer', 'party', 'marketing']),
			heading: z.string(),
			text: z.string(),
			link: z.object({ url: z.string(), text: z.string() }).optional(),
		}),
	),
});

// Text beside a visual (photo or the CZ map), optionally on a tinted ground.
// Covers the old "last prom", per-service "text-down" and "all of ČR" sections.
const mediaSplitBlock = z.object({
	_component: z.literal('media-split'),
	anchor: z.string().optional(),
	heading: z.string(),
	// Inline markdown / HTML.
	text: z.string(),
	link: z.object({ url: z.string(), text: z.string() }).optional(),
	// Image path under /images, or an illustration keyword ('cz' = map of ČR).
	image: z.string().optional(),
	illustration: z.enum(['cz']).optional(),
	// Visual on the left (default) or right of the copy.
	imageSide: z.enum(['left', 'right']).default('left'),
	// Tinted (gray) ground vs plain white.
	tinted: z.boolean().default(false),
	// Overlapping photo collage (the homepage "last prom" treatment).
	collage: z.array(z.string()).default([]),
});

// Grid of service cards, auto-collected from pages that declare `service`.
const servicesBlock = z.object({
	_component: z.literal('services'),
	heading: z.string(),
});

// Closing call to action / inquiry block.
const ctaBlock = z.object({
	_component: z.literal('cta'),
	anchor: z.string().optional(),
	heading: z.string(),
	// Inline markdown / HTML (may contain a tel: link).
	text: z.string(),
});

export const blockSchema = z.discriminatedUnion('_component', [
	heroBlock,
	reasonsBlock,
	mediaSplitBlock,
	servicesBlock,
	ctaBlock,
]);

// ---- SEO + page -------------------------------------------------------------

export const seoSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	robots: z.string().optional(),
	canonical: z.string().optional(),
	og_image: z.string().optional(),
	og_type: z.string().default('website'),
});

// Card metadata for the homepage services grid. A page that sets this is a
// service page; the `services` block collects and orders them by `weight`.
export const serviceSchema = z.object({
	weight: z.number(),
	// Background keyword → /images/c-services__<image>.jpg.
	image: z.string(),
	heading: z.string(),
	text: z.string(),
	// Keep the page (and its Service structured data) but leave it out of the
	// homepage services grid.
	hidden: z.boolean().default(false),
});

export const pageSchema = z.object({
	title: z.string(),
	seo: seoSchema.optional(),
	service: serviceSchema.optional(),
	blocks: z.array(blockSchema).default([]),
});

export type Block = z.infer<typeof blockSchema>;
export type ButtonData = z.infer<typeof buttonSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
