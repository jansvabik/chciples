// JSON-LD graph builder. Every page emits a single <script type="application/
// ld+json"> holding an @graph: Organization/LocalBusiness (home only) + WebSite
// + BreadcrumbList (+ a Service node on service pages). IDs are shared via @id
// so the nodes reference one another.
import { organization } from '../data/organization';
import { site } from '../data/site';

const SITE_URL = site.url;
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
	return {
		// LocalBusiness is an Organization subtype — richer for a service that
		// operates across a named area (the whole ČR).
		'@type': 'LocalBusiness',
		'@id': ORG_ID,
		name: organization.name,
		url: organization.url,
		logo: organization.logo,
		image: organization.logo,
		description: organization.description,
		telephone: organization.telephone,
		areaServed: { '@type': 'Country', name: 'Česká republika' },
		...(organization.email ? { email: organization.email } : {}),
		...(organization.sameAs.length > 0 ? { sameAs: organization.sameAs } : {}),
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer support',
			telephone: organization.telephone,
			...(organization.email ? { email: organization.email } : {}),
			areaServed: organization.areaServed,
			availableLanguage: ['Czech'],
		},
	};
}

export function websiteJsonLd(): JsonLdObject {
	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: `${SITE_URL}/`,
		name: site.name,
		description: site.defaultDescription,
		publisher: { '@id': ORG_ID },
		inLanguage: 'cs-CZ',
	};
}

export function breadcrumbJsonLd(pathname: string, title: string): JsonLdObject | null {
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length === 0) return null;

	const items = [{ '@type': 'ListItem', position: 1, name: 'Domů', item: `${SITE_URL}/` }];
	let acc = '';
	segments.forEach((seg, i) => {
		acc += `/${seg}`;
		const isLast = i === segments.length - 1;
		items.push({
			'@type': 'ListItem',
			position: i + 2,
			name: isLast ? title : humanize(seg),
			item: `${SITE_URL}${acc}/`,
		});
	});

	return { '@type': 'BreadcrumbList', itemListElement: items };
}

function humanize(slug: string): string {
	return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// A single service offering (one per /na-ples/* page), provided by the org and
// delivered across ČR.
export function serviceJsonLd(opts: {
	name: string;
	description: string;
	url: string;
}): JsonLdObject {
	return {
		'@type': 'Service',
		name: opts.name,
		...(opts.description ? { description: opts.description } : {}),
		url: opts.url,
		serviceType: opts.name,
		provider: { '@id': ORG_ID },
		areaServed: { '@type': 'Country', name: 'Česká republika' },
	};
}

export function buildGraph(opts: {
	pathname: string;
	title: string;
	description: string;
	isService?: boolean;
	serviceName?: string;
	extra?: JsonLdObject[];
}): JsonLdObject[] {
	const isHome = opts.pathname.replace(/\/$/, '').split('/').filter(Boolean).length === 0;
	const graph: JsonLdObject[] = [];

	// The business identity is declared once, on the home page.
	if (isHome) graph.push(organizationJsonLd());
	graph.push(websiteJsonLd());

	const breadcrumb = breadcrumbJsonLd(opts.pathname, opts.title);
	if (breadcrumb) graph.push(breadcrumb);

	if (opts.isService) {
		graph.push(
			serviceJsonLd({
				name: opts.serviceName ?? opts.title,
				description: opts.description,
				url: `${SITE_URL}${opts.pathname.endsWith('/') ? opts.pathname : opts.pathname + '/'}`,
			}),
		);
	}

	for (const obj of opts.extra ?? []) graph.push(obj);

	return graph;
}
