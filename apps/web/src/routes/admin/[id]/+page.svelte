<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { supabase } from '$lib/supabase';
	import type { CommunityBuild } from '$lib/supabase';
	import type { BuildOrder } from '@aegis/core';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { t, localize } from '$lib/i18n';
	import { catalog } from '$lib/registry';
	import type { User } from '@supabase/supabase-js';

	let { data } = $props<{ data: { id: string } }>();

	let user = $state<User | null>(null);
	let build = $state<CommunityBuild | null>(null);
	let loadError = $state<string | null>(null);

	let moderatorNotes = $state('');
	let moderating = $state(false);
	let moderateResult = $state<string | null>(null);
	let moderateError = $state<string | null>(null);

	const buildOrder = $derived(build?.data as BuildOrder | null);
	const game = $derived(buildOrder ? catalog.games.find((g) => g.id === buildOrder.gameId) : null);

	async function loadBuild() {
		const { data: row, error } = await supabase
			.from('community_builds')
			.select('*')
			.eq('id', data.id)
			.single();

		if (error) {
			loadError = error.message;
		} else {
			build = row as CommunityBuild;
			moderatorNotes = row.moderator_notes ?? '';
		}
	}

	async function moderate(newStatus: 'approved' | 'rejected') {
		if (!build || moderating) return;
		moderating = true;
		moderateResult = null;
		moderateError = null;

		const { error } = await supabase
			.from('community_builds')
			.update({
				status: newStatus,
				moderated_at: new Date().toISOString(),
				moderator_notes: moderatorNotes.trim() || null,
			})
			.eq('id', build.id);

		moderating = false;

		if (error) {
			moderateError = $t('admin.moderate_error', { error: error.message });
		} else {
			moderateResult = $t('admin.moderate_success');
			build = { ...build, status: newStatus };
		}
	}

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		user = session?.user ?? null;
		if (user) await loadBuild();
	});
</script>

<svelte:head>
	<title>Aegis – Admin Review</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-10 gap-6">
	<header class="w-full max-w-3xl flex items-center gap-4">
		<a
			href="{base}/admin"
			class="text-stone-500 hover:text-amber-400 transition-colors text-xl leading-none"
			aria-label={$t('admin.back')}
		>←</a>
		<h1 class="text-xl font-extrabold tracking-tight">{$t('admin.back')}</h1>
	</header>

	{#if !user}
		<p class="text-stone-500 text-sm">
			<a href="{base}/admin" class="text-amber-400 hover:underline">{$t('admin.login_title')}</a>
		</p>
	{:else if loadError}
		<div class="w-full max-w-3xl bg-red-900/40 border border-red-700/50 rounded-2xl px-4 py-3" role="alert">
			<p class="text-red-300 text-sm">{loadError}</p>
		</div>
	{:else if !build}
		<p class="text-stone-500 text-sm">…</p>
	{:else}
		<!-- Build metadata -->
		<section class="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3">
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="text-lg font-bold">{build.name}</h2>
					<p class="text-xs text-stone-500 mt-0.5">
						{build.game_id}
						{#if build.civilization} · {build.civilization}{/if}
						{#if build.author} · ✍️ {build.author}{/if}
					</p>
					{#if build.difficulty}
						<p class="text-xs text-amber-400 mt-0.5">{build.difficulty}</p>
					{/if}
				</div>
				<span class="text-xs px-2 py-1 rounded-full font-bold
				       {build.status === 'approved' ? 'bg-green-900/50 text-green-300'
				       : build.status === 'rejected' ? 'bg-red-900/50 text-red-300'
				       : 'bg-amber-900/50 text-amber-300'}">
					{$t(`admin.${build.status}`)}
				</span>
			</div>
			<p class="text-xs text-stone-600">
				{$t('admin.submitted_at')}: {new Date(build.submitted_at).toLocaleString()}
			</p>
			<p class="text-xs text-stone-600 font-mono">{$t('admin.tracking_id')}: {build.id}</p>
		</section>

		<!-- Step preview -->
		{#if buildOrder}
			<section class="w-full max-w-3xl flex flex-col gap-3">
				<h3 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{game?.icon ?? ''} {game?.name ?? buildOrder.gameId} — {buildOrder.steps.length} steps
				</h3>
				<div class="flex flex-col gap-2 max-h-[28rem] overflow-y-auto pr-1">
					{#each buildOrder.steps as step, i}
						<div class="bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 flex gap-3 items-start">
							<span class="bg-amber-500 text-stone-950 text-xs font-bold w-6 h-6 rounded-full
							             flex items-center justify-center shrink-0 mt-0.5">
								{step.id}
							</span>
							<div class="flex-1 min-w-0">
								<p class="text-stone-100 text-sm font-semibold">
									{localize(step.label, $settingsStore.lang)}
								</p>
								<p class="text-stone-400 text-xs mt-0.5 leading-relaxed">
									{localize(step.description, $settingsStore.lang)}
								</p>
							</div>
							<div class="text-xs text-stone-500 text-right shrink-0">
								<span class="text-cyan-300 font-bold">{step.villagerCount}</span> pop
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Moderation panel -->
		<section class="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-4">
			<h3 class="text-xs uppercase tracking-widest text-stone-500 font-semibold">Moderation</h3>

			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('admin.notes_label')}
				</span>
				<textarea
					bind:value={moderatorNotes}
					placeholder={$t('admin.notes_placeholder')}
					rows={3}
					class="bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-xl
					       px-3 py-2 text-stone-100 text-sm resize-none focus:outline-none transition-colors"
				></textarea>
			</label>

			{#if moderateResult}
				<div class="bg-green-900/40 border border-green-700/50 rounded-xl px-4 py-3">
					<p class="text-green-300 text-sm">{moderateResult}</p>
				</div>
			{/if}

			{#if moderateError}
				<div class="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3" role="alert">
					<p class="text-red-300 text-sm">{moderateError}</p>
				</div>
			{/if}

			<div class="flex gap-3">
				<button
					onclick={() => moderate('approved')}
					disabled={moderating || build.status === 'approved'}
					class="flex-1 h-11 rounded-2xl font-bold text-sm transition-all
					       {!moderating && build.status !== 'approved'
						? 'bg-green-600 hover:bg-green-500 text-white'
						: 'bg-stone-800 text-stone-500 opacity-50 cursor-not-allowed'}"
				>
					{$t('admin.approve_btn')}
				</button>
				<button
					onclick={() => moderate('rejected')}
					disabled={moderating || build.status === 'rejected'}
					class="flex-1 h-11 rounded-2xl font-bold text-sm transition-all
					       {!moderating && build.status !== 'rejected'
						? 'bg-red-700 hover:bg-red-600 text-white'
						: 'bg-stone-800 text-stone-500 opacity-50 cursor-not-allowed'}"
				>
					{$t('admin.reject_btn')}
				</button>
			</div>
		</section>
	{/if}
</main>
