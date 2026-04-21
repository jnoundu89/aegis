<script lang="ts">
	import { catalog } from '$lib/registry';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';

	let selectedGameId = $state<string | null>(null);

	const filteredBOs = $derived(
		selectedGameId
			? catalog.buildOrders.filter((bo) => bo.gameId === selectedGameId)
			: catalog.buildOrders
	);

	function selectGame(id: string) {
		selectedGameId = selectedGameId === id ? null : id;
	}
</script>

<svelte:head>
	<title>Aegis – Build Order Library</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-10 gap-10">
	<!-- Header -->
	<header class="text-center space-y-4">
		<h1 class="text-5xl font-extrabold tracking-tight">⚔️ Aegis</h1>
		<p class="text-stone-400 text-base">{$t('home.tagline')}</p>
		<a
			href="{base}/builder"
			class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all"
		>
			{$t('home.create_bo')}
		</a>
	</header>

	<!-- Game filter pills -->
	<section class="w-full max-w-2xl space-y-3">
		<h2 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('home.filter_by_game')}</h2>
		<div class="flex flex-wrap gap-3">
			<button
				onclick={() => (selectedGameId = null)}
				class="px-4 py-2 rounded-full text-sm font-semibold transition-all
					{selectedGameId === null
					? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
					: 'bg-stone-800 text-stone-300 hover:bg-stone-700'}"
			>
				{$t('home.all_games')}
			</button>
			{#each catalog.games as game}
				<button
					onclick={() => selectGame(game.id)}
					class="px-4 py-2 rounded-full text-sm font-semibold transition-all
						{selectedGameId === game.id
						? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
						: 'bg-stone-800 text-stone-300 hover:bg-stone-700'}"
				>
					{game.icon} {game.name}
				</button>
			{/each}
		</div>
	</section>

	<!-- Build order grid -->
	<section class="w-full max-w-2xl space-y-3">
		<h2 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
			{filteredBOs.length} {$t('home.build_order')}{filteredBOs.length !== 1 ? 's' : ''}
		</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each filteredBOs as bo (bo.id)}
				{@const game = catalog.games.find((g) => g.id === bo.gameId)}
				<a
					href="{base}/{bo.gameId}/{bo.id}"
					class="group bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]"
				>
					<!-- Game badge -->
					<span class="text-xs text-stone-500 font-medium">
						{game?.icon ?? ''} {game?.name ?? bo.gameId}
					</span>

					<!-- Title -->
					<h3 class="text-xl font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
						{bo.name}
					</h3>

					{#if bo.civilization}
						<span class="text-sm text-amber-500 font-medium">{bo.civilization}</span>
					{/if}

					{#if bo.description}
						<p class="text-sm text-stone-400 leading-relaxed line-clamp-2">{bo.description}</p>
					{/if}

					<!-- Tags -->
					{#if bo.tags && bo.tags.length > 0}
						<div class="flex flex-wrap gap-1 mt-auto">
							{#each bo.tags as tag}
								<span class="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full"
									>{tag}</span
								>
							{/each}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>
</main>

