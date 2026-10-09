// Organization facts used by JSON-LD and llms.txt. Edit these to match the real
// Chciples.cz entity details (email, socials, registry numbers) as they firm up.
export const organization = {
	name: 'Chciples.cz',
	url: 'https://chciples.cz/',
	logo: 'https://chciples.cz/images/logo.png',
	description:
		'Organizace výjimečných plesů v celé České republice — reprezentační, maturitní, firemní i soukromé plesy. Postaráme se o celý ples, abyste si ho mohli užít i vy.',
	telephone: '+420727911636',
	// Public contact e-mail — left empty until there is one to publish; JSON-LD
	// and llms.txt omit the contact e-mail while this is blank.
	email: '',
	areaServed: 'CZ',
	// Real social/profile URLs go here once they exist (Instagram, Facebook …).
	// Left empty rather than fabricated; JSON-LD omits `sameAs` while empty.
	sameAs: [] as string[],
} as const;
