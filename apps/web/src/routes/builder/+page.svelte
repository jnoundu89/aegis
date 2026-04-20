<script lang="ts">
	import { onMount } from 'svelte';
	import { compressToEncodedURIComponent } from 'lz-string';
	import { validateStep } from '@aegis/core';
	import { base } from '$app/paths';
	import { builderStore } from '$lib/stores/builderStore';
	import GuidedView from '$lib/components/GuidedView.svelte';
	import TableView from '$lib/components/TableView.svelte';

	type ViewMode = 'guided' | 'table';
	let viewMode = $state<ViewMode>('guided');

	// Reactive snapshot of the store (auto-subscribes via the $ prefix)
	const buildOrder = $derived($builderStore);

	// Collect all validation errors across every step
	const allErrors = $derived(
		buildOrder.steps.flatMap((step, i) => {
			const msgs = validateStep(step);
			return msgs.map((msg) => `Étape ${i + 1} — ${msg}`);
		}),
	);

	const isValid = $derived(allErrors.length === 0);

	let shareUrl = $state<string | null>(null);

	function handleShare() {
		if (!isValid) return;
		const compressed = compressToEncodedURIComponent(JSON.stringify(buildOrder));
		shareUrl = `${window.location.origin}${base}/builder?bo=${compressed}`;
	}

	onMount(() => {
		builderStore.load();
	});
</script>

<svelte:head>
	<title>Aegis – Éditeur de Build Order</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-10 gap-6">
	<!-- Header -->
	<header class="w-full max-w-3xl flex items-center gap-4">
		<a
			href="{base}/"
			class="text-stone-500 hover:text-amber-400 transition-colors text-xl leading-none"
			aria-label="Retour à la bibliothèque"
		>←</a>
		<div class="flex-1">
			<h1 class="text-2xl font-extrabold tracking-tight">⚒️ Éditeur de Build Order</h1>
			<p class="text-stone-500 text-xs mt-0.5">Les modifications sont sauvegardées automatiquement</p>
		</div>
	</header>

	<!-- Build order name -->
	<section class="w-full max-w-3xl">
		<label class="flex flex-col gap-1">
			<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
				Nom du Build Order
			</span>
			<input
				type="text"
				value={buildOrder.name}
				oninput={(e) => builderStore.updateName((e.target as HTMLInputElement).value)}
				class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-100
				       text-lg font-bold focus:outline-none focus:border-amber-500 transition-colors w-full"
			/>
		</label>
	</section>

	<!-- View toggle -->
	<section class="w-full max-w-3xl flex items-center gap-3">
		<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">Vue :</span>
		<div class="flex bg-stone-900 border border-stone-800 rounded-full p-1 gap-1">
			<button
				onclick={() => (viewMode = 'guided')}
				class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
				       {viewMode === 'guided'
					? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				🃏 Guidée
			</button>
			<button
				onclick={() => (viewMode = 'table')}
				class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
				       {viewMode === 'table'
					? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				📋 Tableau
			</button>
		</div>
	</section>

	<!-- Editor -->
	<section class="w-full max-w-3xl">
		{#if viewMode === 'guided'}
			<GuidedView {buildOrder} />
		{:else}
			<TableView {buildOrder} />
		{/if}
	</section>

	<!-- Share section -->
	<section class="w-full max-w-3xl space-y-3">
		<button
			onclick={handleShare}
			disabled={!isValid}
			class="w-full h-12 rounded-2xl font-bold text-base transition-all
			       {isValid
				? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950 shadow-lg shadow-amber-500/30'
				: 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}"
		>
			🔗 Partager ce Build Order
		</button>

		{#if shareUrl}
			<div class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 flex flex-col gap-1">
				<span class="text-xs text-stone-500 font-semibold uppercase tracking-wider">
					Lien de partage
				</span>
				<p class="text-amber-400 text-sm break-all font-mono">{shareUrl}</p>
			</div>
		{/if}
	</section>

	<!-- Reset -->
	<section class="w-full max-w-3xl">
		<button
			onclick={() => { builderStore.reset(); shareUrl = null; }}
			class="text-sm text-stone-600 hover:text-red-400 transition-colors font-medium"
		>
			↺ Réinitialiser le brouillon
		</button>
	</section>

	<!-- Error banner (always visible if there are errors) -->
	{#if allErrors.length > 0}
		<div
			class="fixed bottom-0 left-0 right-0 z-50 bg-red-900/95 border-t-2 border-red-500
			       backdrop-blur-sm px-4 py-3 flex flex-col gap-1"
			role="alert"
		>
			<p class="text-red-200 font-bold text-sm flex items-center gap-2">
				⚠️ Erreurs de validation ({allErrors.length})
			</p>
			<ul class="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
				{#each allErrors as error}
					<li class="text-red-300 text-xs">{error}</li>
				{/each}
			</ul>
		</div>
	{/if}
</main>
