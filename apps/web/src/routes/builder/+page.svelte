<script lang="ts">
	import { onMount } from 'svelte';
	import { compressToEncodedURIComponent } from 'lz-string';
	import { validateStep, buildOrderSchema } from '@aegis/core';
	import type { Difficulty } from '@aegis/core';
	import { base } from '$app/paths';
	import { catalog } from '$lib/registry';
	import { builderStore } from '$lib/stores/builderStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import GuidedView from '$lib/components/GuidedView.svelte';
	import TableView from '$lib/components/TableView.svelte';
	import { t, localize } from '$lib/i18n';

	type ViewMode = 'guided' | 'table';
	let viewMode = $state<ViewMode>('guided');

	const buildOrder = $derived($builderStore);

	const allErrors = $derived(
		buildOrder.steps.flatMap((step, i) => {
			const msgs = validateStep(step);
			return msgs.map((msg) => `Step ${i + 1} — ${msg}`);
		}),
	);

	const isValid = $derived(allErrors.length === 0);

	let shareUrl = $state<string | null>(null);
	let importError = $state<string | null>(null);

	const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

	function handleShare() {
		if (!isValid) return;
		const compressed = compressToEncodedURIComponent(JSON.stringify(buildOrder));
		shareUrl = `${window.location.origin}${base}/share?data=${compressed}`;
	}

	function handleExport() {
		const json = JSON.stringify(buildOrder, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${buildOrder.name.replace(/\s+/g, '_')}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport(event: Event) {
		importError = null;
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const parsed = JSON.parse(e.target?.result as string);
				const result = buildOrderSchema.safeParse(parsed);
				if (!result.success) {
					const details = result.error.issues.map((i) => i.message).join(' · ');
					importError = $t('builder.invalid_file', { details });
					return;
				}
				builderStore.setBuildOrder(result.data);
				shareUrl = null;
			} catch {
				importError = $t('builder.file_read_error');
			}
		};
		reader.readAsText(file);
		input.value = '';
	}

	onMount(() => {
		builderStore.load();
	});
</script>

<svelte:head>
	<title>Aegis – Build Order Editor</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-10 gap-6">
	<!-- Header -->
	<header class="w-full max-w-3xl flex items-center gap-4">
		<a
			href="{base}/"
			class="text-stone-500 hover:text-amber-400 transition-colors text-xl leading-none"
			aria-label={$t('builder.back_label')}
		>←</a>
		<div class="flex-1">
			<h1 class="text-2xl font-extrabold tracking-tight">{$t('builder.title')}</h1>
			<p class="text-stone-500 text-xs mt-0.5">{$t('builder.autosave')}</p>
		</div>
	</header>

	<!-- Metadata section -->
	<section class="w-full max-w-3xl flex flex-col gap-4">
		<h2 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.metadata')}</h2>

		<!-- Name + Game row -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.bo_name')}</span>
				<input
					type="text"
					value={buildOrder.name}
					oninput={(e) => builderStore.updateName((e.target as HTMLInputElement).value)}
					placeholder="My Build Order"
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       font-bold focus:outline-none focus:border-amber-500 transition-colors w-full text-base"
				/>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.game')}</span>
				<select
					value={buildOrder.gameId}
					onchange={(e) => builderStore.updateGameId((e.target as HTMLSelectElement).value)}
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       focus:outline-none focus:border-amber-500 transition-colors w-full text-sm"
				>
					{#each catalog.games as game}
						<option value={game.id}>{game.icon} {game.name}</option>
					{/each}
				</select>
			</label>
		</div>

		<!-- Author + Civilization row -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.author')}</span>
				<input
					type="text"
					value={buildOrder.author ?? ''}
					oninput={(e) => builderStore.updateMeta('author', (e.target as HTMLInputElement).value)}
					placeholder="Your name / channel"
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors w-full"
				/>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.civilization')}</span>
				<input
					type="text"
					value={buildOrder.civilization ?? ''}
					oninput={(e) => builderStore.updateMeta('civilization', (e.target as HTMLInputElement).value)}
					placeholder="e.g. Britons, Mayans, Any"
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors w-full"
				/>
			</label>
		</div>

		<!-- Description + Difficulty row -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<label class="flex flex-col gap-1 sm:col-span-2">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.description')}</span>
				<input
					type="text"
					value={localize(buildOrder.description, $settingsStore.lang)}
					oninput={(e) => builderStore.updateMeta('description', (e.target as HTMLInputElement).value)}
					placeholder="Brief strategy overview…"
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors w-full"
				/>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.difficulty')}</span>
				<select
					value={buildOrder.difficulty ?? 'beginner'}
					onchange={(e) => builderStore.updateDifficulty((e.target as HTMLSelectElement).value as typeof difficulties[number])}
					class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors w-full"
				>
					{#each difficulties as d}
						<option value={d}>{$t(`difficulty.${d}`)}</option>
					{/each}
				</select>
			</label>
		</div>
	</section>

	<!-- View toggle -->
	<section class="w-full max-w-3xl flex items-center gap-3">
		<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.view')}</span>
		<div class="flex bg-stone-900 border border-stone-800 rounded-full p-1 gap-1">
			<button
				onclick={() => (viewMode = 'guided')}
				class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
				       {viewMode === 'guided'
					? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				{$t('builder.view_guided')}
			</button>
			<button
				onclick={() => (viewMode = 'table')}
				class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
				       {viewMode === 'table'
					? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				{$t('builder.view_table')}
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

	<!-- Import / Export section -->
	<section class="w-full max-w-3xl space-y-3">
		<h2 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.import_export')}</h2>
		<div class="flex flex-wrap gap-3">
			<!-- Export -->
			<button
				onclick={handleExport}
				class="flex-1 h-12 rounded-2xl font-bold text-base transition-all
				       bg-stone-800 hover:bg-stone-700 active:bg-stone-600 border border-stone-700
				       hover:border-amber-600/60 text-stone-200"
			>
				{$t('builder.export_json')}
			</button>

			<!-- Import -->
			<label
				class="flex-1 h-12 rounded-2xl font-bold text-base transition-all cursor-pointer
				       bg-stone-800 hover:bg-stone-700 active:bg-stone-600 border border-stone-700
				       hover:border-amber-600/60 text-stone-200 flex items-center justify-center"
			>
				{$t('builder.import_json')}
				<input
					type="file"
					accept=".json,application/json"
					onchange={handleImport}
					class="sr-only"
					data-testid="import-file-input"
				/>
			</label>
		</div>

		{#if importError}
			<div class="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3" role="alert">
				<p class="text-red-300 text-sm">⚠️ {importError}</p>
			</div>
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
			{$t('builder.share')}
		</button>

		{#if shareUrl}
			<div class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 flex flex-col gap-1">
				<span class="text-xs text-stone-500 font-semibold uppercase tracking-wider">
					{$t('builder.share_link')}
				</span>
				<a
					href={shareUrl}
					data-testid="share-url"
					class="text-amber-400 text-sm break-all font-mono hover:underline"
				>
					{shareUrl}
				</a>
			</div>
		{/if}
	</section>

	<!-- Reset -->
	<section class="w-full max-w-3xl">
		<button
			onclick={() => { builderStore.reset(); shareUrl = null; importError = null; }}
			class="text-sm text-stone-600 hover:text-red-400 transition-colors font-medium"
		>
			{$t('builder.reset')}
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
				{$t('builder.validation_errors', { count: allErrors.length })}
			</p>
			<ul class="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
				{#each allErrors as error}
					<li class="text-red-300 text-xs">{error}</li>
				{/each}
			</ul>
		</div>
	{/if}
</main>
