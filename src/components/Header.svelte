<script lang="ts">
	// The site's one interactive island: the overlay header with a mobile nav
	// toggle. Sits absolutely over the hero, white text on the gradient.
	import { mainNav } from '../data/nav';

	let { currentPath = '/' }: { currentPath?: string } = $props();
	let open = $state(false);

	const isActive = (url: string) => url === currentPath;
</script>

<header
	class="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-24 md:py-12"
>
	<a href="/" class="shrink-0" aria-label="Chciples.cz — domů">
		<img src="/images/logo.png" alt="Logo Chciples.cz" class="h-14 w-auto rounded" />
	</a>

	<button
		type="button"
		class="flex h-14 w-14 items-center justify-center rounded bg-white md:hidden"
		aria-expanded={open}
		aria-controls="main-nav"
		onclick={() => (open = !open)}
	>
		<span class="sr-only">Zobrazit/skrýt navigaci</span>
		<svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
			<rect width="22" height="2" rx="1" fill="#111" />
			<rect y="7" width="22" height="2" rx="1" fill="#111" />
			<rect y="14" width="22" height="2" rx="1" fill="#111" />
		</svg>
	</button>

	<nav
		id="main-nav"
		class:hidden={!open}
		class="absolute inset-x-0 top-full bg-white/90 p-6 md:static md:block md:bg-transparent md:p-0"
	>
		<ul class="flex flex-col md:flex-row">
			{#each mainNav as item (item.url)}
				<li class="md:ml-8">
					<a
						href={item.url}
						class="block border-b border-gray-300 px-4 py-5 text-lg font-light text-black last:border-0 md:inline-block md:border-0 md:p-0 md:text-xl md:text-white
							{isActive(item.url) ? 'md:border-b md:border-white md:pb-1' : ''}"
					>
						{item.name}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
