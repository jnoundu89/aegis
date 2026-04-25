<script lang="ts">
	import { onMount } from 'svelte';
	import { compressToEncodedURIComponent } from 'lz-string';
	import { base } from '$app/paths';
	import { catalog } from '$lib/registry';
	import { communityStore } from '$lib/stores/communityStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { t, localize } from '$lib/i18n';
	import type { Difficulty } from '@aegis/core';

	const builds = $derived($communityStore);

	let selectedGameId = $state<string | null>(null);
	let selectedDifficulty = $state<Difficulty | null>(null);
	let searchQuery = $state('');

	const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

	const difficultyConfig: Record<Difficulty, { bg: string; text: string }> = {
		beginner:     { bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
		intermediate: { bg: 'bg-amber-900/50',   text: 'text-amber-300'  },
		advanced:     { bg: 'bg-red-900/50',      text: 'text-red-300'    },
	};

	const filteredBuilds = $derived(
		builds.filter((b) => {
			if (selectedGameId && b.game_id !== selectedGameId) return false;
			if (selectedDifficulty && b.difficulty !== selectedDifficulty) return false;
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const hay = [b.name, b.author, b.civilization].filter(Boolean).join(' ').toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		}),
	);

	function loadInViewer(build: typeof builds[number]) {
		try {
			const compressed = compressToEncodedURIComponent(JSON.stringify(build.data));
			window.open(`${window.location.origin}${base}/share?data=${compressed}`, '_blank');
		} catch {
			// ignore
		}
	}

	onMount(() => {
		communityStore.load();
	});
</script>

<svelte:head>
	<title>Aegis – Community Builds</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100">
	<!-- Header -->
	<header class="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 px-4 py-8">
		<div class="max-w-4xl mx-auto flex flex-col gap-3">
			<a href="{base}/" class="text-stone-500 hover:text-amber-400 transition-colors text-sm w-fit">
				{$t('community.back')}
			</a>
			<h1 class="text-3xl font-extrabold tracking-tight">{$t('community.title')}</h1>
			<p class="text-stone-400 text-sm">{$t('community.tagline')}</p>
		</div>
	</header>

	<div class="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

		<!-- Filters -->
		<section class="flex flex-col gap-3">
			<!-- Search -->
			<div class="relative">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-base pointer-events-none">🔍</span>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder={$t('home.search_placeholder')}
					class="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/70 rounded-2xl
					       pl-11 pr-4 py-3 text-stone-100 placeholder-stone-600 text-sm
					       focus:outline-none transition-colors"
				/>
			</div>

			<!-- Game filter -->
			<div class="flex flex-wrap gap-2 items-center">
				<span class="text-xs uppercase tracking-widest text-stone-600 font-semibold shrink-0 min-w-[4rem]">
					{$t('home.filter_game')}
				</span>
				<button
					onclick={() => (selectedGameId = null)}
					class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
					{selectedGameId === null
						? 'bg-amber-500 text-stone-950'
						: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
				>
					{$t('home.all_games')}
				</button>
				{#each catalog.games as game}
					<button
						onclick={() => (selectedGameId = selectedGameId === game.id ? null : game.id)}
						class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
						{selectedGameId === game.id
							? 'bg-amber-500 text-stone-950'
							: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
					>
						{game.icon} {game.name}
					</button>
				{/each}
			</div>

			<!-- Difficulty filter -->
			<div class="flex flex-wrap gap-2 items-center">
				<span class="text-xs uppercase tracking-widest text-stone-600 font-semibold shrink-0 min-w-[4rem]">
					{$t('home.filter_difficulty')}
				</span>
				<button
					onclick={() => (selectedDifficulty = null)}
					class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
					{selectedDifficulty === null
						? 'bg-violet-600 text-white'
						: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
				>
					{$t('home.all_difficulties')}
				</button>
				{#each difficulties as d}
					{@const cfg = difficultyConfig[d]}
					<button
						onclick={() => (selectedDifficulty = selectedDifficulty === d ? null : d)}
						class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
						{selectedDifficulty === d
							? `${cfg.bg} ${cfg.text} ring-1 ring-current`
							: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
					>
						{$t(`difficulty.${d}`)}
					</button>
				{/each}
			</div>
		</section>

		<!-- Build list -->
		{#if filteredBuilds.length === 0}
			<section class="text-center py-16 flex flex-col items-center gap-4">
				<span class="text-5xl">🌍</span>
				<p class="text-stone-400 text-base">
					{builds.length === 0 ? $t('community.empty') : $t('community.no_results')}
				</p>
			</section>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredBuilds as build (build.id)}
					{@const game = catalog.games.find((g) => g.id === build.game_id)}
					<div
						class="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3"
					>
						<!-- Top row -->
						<div class="flex items-center justify-between gap-2 min-h-[1.5rem]">
							{#if build.difficulty && (build.difficulty === 'beginner' || build.difficulty === 'intermediate' || build.difficulty === 'advanced')}
								{@const cfg = difficultyConfig[build.difficulty as Difficulty]}
								<span class="text-xs font-semibold px-2 py-0.5 rounded-full {cfg.bg} {cfg.text}">
									{$t(`difficulty.${build.difficulty}`)}
								</span>
							{:else}
								<span></span>
							{/if}
							{#if game}
								<span class="text-xs text-stone-500">{game.icon} {game.name}</span>
							{/if}
						</div>

						<!-- Title -->
						<h3 class="text-base font-bold text-stone-100 leading-snug">{build.name}</h3>

						{#if build.civilization}
							<p class="text-xs text-amber-500 font-medium">{build.civilization}</p>
						{/if}

						{#if build.author}
							<p class="text-xs text-sky-400">
								{$t('community.submitted_by')} {build.author}
							</p>
						{/if}

						<p class="text-xs text-stone-600 mt-auto">
							{new Date(build.submitted_at).toLocaleDateString($settingsStore.lang === 'fr' ? 'fr-FR' : 'en-US')}
						</p>

						<!-- Load button -->
						<button
							onclick={() => loadInViewer(build)}
							class="w-full h-10 rounded-xl font-semibold text-sm transition-all
							       bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950
							       shadow-md shadow-amber-500/20"
						>
							{$t('community.load')}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
