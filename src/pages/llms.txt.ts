// Generates /llms.txt — a plain-text map of the site's canonical pages so LLMs
// and AI agents can locate authoritative information. Prerendered at build time.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { organization } from '../data/organization';
import { site } from '../data/site';

function isNoIndex(robots: string | undefined): boolean {
	return !!robots && robots.includes('noindex');
}

// Content id → site-absolute URL ('index' → '/', 'na-ples/dj' → '/na-ples/dj/').
function urlOf(id: string): string {
	const slug = id.replace(/\/?index$/, '');
	return slug ? `${site.url}/${slug}/` : `${site.url}/`;
}

export const GET: APIRoute = async () => {
	const pages = await getCollection('pages');

	const entries = pages
		.filter((p) => !isNoIndex(p.data.seo?.robots))
		.map((p) => ({
			title: p.data.seo?.title ?? p.data.title,
			url: urlOf(p.id),
			description: p.data.seo?.description ?? site.defaultDescription,
		}))
		.sort((a, b) => a.title.localeCompare(b.title, 'cs'));

	const sections: string[] = [
		`# ${organization.name}`,
		``,
		`> ${site.defaultDescription}`,
		``,
		`${organization.name} organizuje plesy po celé České republice — reprezentační, maturitní, firemní i soukromé. Postaráme se o celý ples: kapelu, moderátora, DJ, vystoupení, výzdobu, tombolu, fotokoutek, vstupenky, šerpování, foto- i videoreport a celkovou organizaci. Tento soubor uvádí kanonické stránky webu, aby LLM a AI agenti snadno našli směrodatné informace.`,
		``,
		`## Stránky`,
		``,
		...entries.map((e) => `- [${e.title}](${e.url}): ${e.description}`),
		``,
		`## Kontakt`,
		``,
		`- Telefon: ${site.phoneDisplay} (${organization.telephone})`,
		...(organization.email ? [`- E-mail: ${organization.email}`] : []),
		``,
	];

	return new Response(sections.join('\n'), {
		status: 200,
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
