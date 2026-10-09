// Primary navigation (ported from the old Hugo config.toml [menu]).
export interface NavItem {
	url: string;
	name: string;
}

export const mainNav: NavItem[] = [
	{ url: '/', name: 'Organizace plesů' },
	{ url: '/#zaridime', name: 'Co zařídíme' },
	{ url: '/kontakt/', name: 'Kontakt' },
];
