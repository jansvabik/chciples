/**
 * Czech typographic pass (port of the legacy Hugo `typographied.html` partial).
 *
 * Inserts a non-breaking space after single-letter prepositions/conjunctions
 * (a/i/o/u/k/s/v/z), after standalone numbers, and after capital-letter
 * abbreviations, so they don't get orphaned at line wraps. Then strips any nbsp
 * that ends up immediately after a heading tag (it would push the heading body
 * to the next line). The whole site is Czech, so this runs on every page.
 */

const NBSP = ' ';

export function applyCzechTypography(input: string): string {
	let out = input;
	// Capital prepositions at the start of a token (optionally wrapped in <a> etc.)
	out = out.replace(/(>|\(|\[|\{)?(A|I|O|U|K|S|V|Z)(<\/[a-z0-9]>)? /g, `$1$2$3${NBSP}`);
	// Lowercase/uppercase prepositions mid-text
	out = out.replace(
		new RegExp(`( |${NBSP})(\\(|\\[|\\{)?(A|I|O|U|K|S|V|Z|a|i|o|u|k|s|v|z)(<\\/[a-z0-9]>)? `, 'g'),
		`$1$2$3$4${NBSP}`,
	);
	// Number followed by space
	out = out.replace(/(>|\(|\[|\{)?(\d\.?) /g, `$1$2${NBSP}`);
	// Capital abbreviation (e.g. "A.")
	out = out.replace(/( |>|\(|\[|\{)([A-Z]\.) /g, `$1$2${NBSP}`);
	// Strip nbsp directly after a heading tag
	out = out.replace(new RegExp(`<h([0-9])${NBSP}`, 'g'), '<h$1 ');
	return out;
}

// Frontmatter keys that hold URLs, icon names or enum values — never prose,
// so the typography pass must skip them.
const NON_PROSE_KEYS = new Set([
	'url',
	'link',
	'src',
	'icon',
	'img',
	'image',
	'illustration',
	'imageSide',
	'theme',
	'anchor',
	'collage',
	'_component',
]);

/** Walk a block tree and run `fn` over every prose string. */
export function typographyDeep<T>(value: T, fn: (s: string) => string): T {
	if (typeof value === 'string') return fn(value) as T;
	if (Array.isArray(value)) return value.map((v) => typographyDeep(v, fn)) as T;
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [key, v] of Object.entries(value)) {
			out[key] = NON_PROSE_KEYS.has(key) && typeof v === 'string' ? v : typographyDeep(v, fn);
		}
		return out as T;
	}
	return value;
}
