<script lang="ts">
	import type { Step, ResourceKey } from '@aegis/core';
	import { catalog } from '$lib/registry';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { listen } from '@tauri-apps/api/event';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { t, ttsLang } from '$lib/i18n';

	let { data } = $props();

	const game = $derived(catalog.games.find((g) => g.id === data.buildOrder.gameId));
	const steps = $derived<Step[]>(data.buildOrder.steps);
	const totalSteps = $derived(steps.length);

	let stepIndex = $state(0);
	let animating = $state(false);
	let strategyNotesOpen = $state(false);

	const currentStep = $derived(steps[stepIndex]);
	const hasPrev = $derived(stepIndex > 0);
	const hasNext = $derived(stepIndex < totalSteps - 1);

	/** Resource display configuration: label, emoji, Tailwind colour classes */
	const resourceConfig = $derived<Record<ResourceKey | 'villagerCount', { label: string; emoji: string; text: string; bg: string }>>({
		villagerCount: { label: $t('resource.villagers'), emoji: '👥', text: 'text-cyan-300', bg: 'bg-cyan-900/40 border border-cyan-700/50' },
		food:          { label: $t('resource.food'),      emoji: '🍖', text: 'text-green-300', bg: 'bg-green-900/40 border border-green-700/50' },
		wood:          { label: $t('resource.wood'),      emoji: '🪵', text: 'text-amber-400', bg: 'bg-amber-900/40 border border-amber-700/50' },
		gold:          { label: $t('resource.gold'),      emoji: '🪙', text: 'text-yellow-300', bg: 'bg-yellow-900/40 border border-yellow-700/50' },
		stone:         { label: $t('resource.stone'),     emoji: '🪨', text: 'text-slate-300',  bg: 'bg-slate-800/60  border border-slate-600/50' },
		favor:         { label: $t('resource.favor'),     emoji: '⚡', text: 'text-purple-300', bg: 'bg-purple-900/40 border border-purple-700/50' }
	});

	/** Ordered resource keys to display (villagerCount always first, then game resources) */
	const resourceKeys = $derived<(ResourceKey | 'villagerCount')[]>([
		'villagerCount',
		...(game?.resources ?? ['food', 'wood', 'gold', 'stone'])
	]);

	/** Speak a text string using the Web Speech API (fires-and-forgets) */
	function speak(text: string) {
		if (!$settingsStore.ttsEnabled) return;
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = $ttsLang;
		utterance.rate = 1.0;
		window.speechSynthesis.speak(utterance);
	}

	/** Animate step transition, update index, then trigger TTS */
	function move(direction: 'next' | 'prev') {
		if (animating) return;
		if (direction === 'next' && !hasNext) return;
		if (direction === 'prev' && !hasPrev) return;
		animating = true;
		setTimeout(() => {
			stepIndex += direction === 'next' ? 1 : -1;
			animating = false;
			speak(currentStep.description);
		}, 180);
	}

	function next() { move('next'); }
	function prev() { move('prev'); }
	function toggleStrategyNotes() { strategyNotesOpen = !strategyNotesOpen; }

	// Register a Tauri event listener for the global F9 shortcut (desktop only)
	onMount(() => {
		if (typeof window === 'undefined' || !('__TAURI__' in window)) return;
		const unlistenPromise = listen('aegis-next-step', () => next()).catch(() => undefined);
		return () => { unlistenPromise.then(fn => fn?.()); };
	});
</script>

<svelte:head>
	<title>Aegis – {data.buildOrder.name}</title>
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'ArrowRight' || e.key === 'F9') next();
		if (e.key === 'ArrowLeft') prev();
	}}
/>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-8 gap-6">

	<!-- Back link + title -->
	<header class="w-full max-w-lg flex items-start gap-4">
		<a
			href="{base}/"
			class="mt-1 text-stone-500 hover:text-amber-400 transition-colors text-lg leading-none"
			aria-label={$t('nav.back_to_library')}
		>←</a>
		<div class="flex-1 min-w-0">
			<p class="text-xs text-stone-500 uppercase tracking-widest font-semibold">
				{game?.icon ?? ''} {game?.name ?? data.buildOrder.gameId}
				{#if data.buildOrder.civilization}
					· {data.buildOrder.civilization}
				{/if}
			</p>
			<h1 class="text-2xl font-extrabold tracking-tight">{data.buildOrder.name}</h1>
			{#if data.buildOrder.description}
				<p class="mt-1 text-sm text-stone-400 italic leading-relaxed">{data.buildOrder.description}</p>
			{/if}
		</div>
	</header>

	<!-- Strategy Notes collapsible panel -->
	{#if data.buildOrder.strategy_notes && data.buildOrder.strategy_notes.length > 0}
		<div class="w-full max-w-lg">
			<button
			onclick={toggleStrategyNotes}
				class="w-full flex items-center justify-between px-4 py-3 rounded-xl
					bg-stone-800 border border-stone-700 hover:border-amber-600/60
					hover:bg-stone-700 active:bg-stone-600 transition-all duration-150
					text-sm font-semibold text-stone-200"
				aria-expanded={strategyNotesOpen}
			>
				<span class="flex items-center gap-2">
					<span>📋</span>
					<span>{$t('viewer.strategy_notes')}</span>
				</span>
				<span class="text-stone-400 text-xs transition-transform duration-200 {strategyNotesOpen ? 'rotate-180' : ''}">▼</span>
			</button>

			{#if strategyNotesOpen}
				<div class="mt-2 rounded-xl bg-stone-900 border border-stone-700 divide-y divide-stone-800 overflow-hidden">
					{#each data.buildOrder.strategy_notes as phase}
						<div class="px-4 py-3">
							<h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">{phase.phase}</h3>
							<ul class="space-y-1.5">
								{#each phase.notes as note}
									<li class="text-sm text-stone-300 leading-relaxed flex gap-2">
										<span class="text-stone-600 shrink-0 mt-0.5">•</span>
										<span>{note}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Progress bar -->
	<div class="w-full max-w-lg space-y-1">
		<div class="flex justify-between text-xs text-stone-500 font-mono">
			<span>{$t('viewer.step')}</span>
			<span>{stepIndex + 1} / {totalSteps}</span>
		</div>
		<div class="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
			<div
				class="h-full bg-amber-500 rounded-full transition-all duration-300"
				style="width: {((stepIndex + 1) / totalSteps) * 100}%"
			></div>
		</div>
	</div>

	<!-- Step card with fade/slide transition -->
	<div
		class="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 transition-all duration-200
			{animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}"
	>
		<!-- Step header -->
		<div class="flex items-center gap-3">
			<span class="bg-amber-500 text-stone-950 text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
				{currentStep.id}
			</span>
			<h2 class="text-2xl font-bold leading-tight">{currentStep.label}</h2>
		</div>

		<!-- Instruction -->
		<p class="text-stone-200 text-lg leading-relaxed">{currentStep.description}</p>

		<!-- Tip -->
		{#if currentStep.notes}
			<div class="bg-amber-900/30 border border-amber-700/40 rounded-xl px-4 py-3">
				<p class="text-amber-300 text-sm leading-relaxed">💡 {currentStep.notes}</p>
			</div>
		{/if}

		<!-- Economy snapshot — colour-coded by resource type -->
		<div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
			{#each resourceKeys as key}
				{@const cfg = resourceConfig[key]}
				{@const value = key === 'villagerCount' ? currentStep.villagerCount : currentStep[key as ResourceKey]}
				{#if value !== undefined}
					<div class="rounded-xl p-3 text-center {cfg.bg}">
						<div class="text-lg leading-none">{cfg.emoji}</div>
						<div class="text-xs {cfg.text} font-medium mt-1">{cfg.label}</div>
						<div class="text-xl font-extrabold {cfg.text} mt-0.5">{value}</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Navigation — massive touch targets -->
	<nav class="w-full max-w-lg grid grid-cols-2 gap-4">
		<button
			onclick={prev}
			disabled={!hasPrev || animating}
			class="h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-2
				bg-stone-800 hover:bg-stone-700 active:bg-stone-600
				disabled:opacity-25 disabled:cursor-not-allowed
				transition-all duration-150 shadow-md"
		>
			{$t('viewer.prev')}
		</button>
		<button
			onclick={next}
			disabled={!hasNext || animating}
			class="h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-2
				bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950
				disabled:opacity-25 disabled:cursor-not-allowed
				transition-all duration-150 shadow-lg shadow-amber-500/30"
		>
			{$t('viewer.next')}
		</button>
	</nav>

	<!-- Keyboard hint -->
	<p class="text-xs text-stone-600">
		{$t('nav.arrow_keys_hint', { key: 'F9' })}
	</p>
</main>
