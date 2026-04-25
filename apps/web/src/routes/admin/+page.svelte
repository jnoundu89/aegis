<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import { supabase } from '$lib/supabase';
	import type { CommunityBuild } from '$lib/supabase';
	import { t } from '$lib/i18n';
	import type { RealtimeChannel, User } from '@supabase/supabase-js';

	let user = $state<User | null>(null);
	let authChecked = $state(false);
	let loginEmail = $state('');
	let loginSent = $state(false);
	let loginError = $state<string | null>(null);
	let loginLoading = $state(false);

	let pendingBuilds = $state<CommunityBuild[]>([]);
	let loadError = $state<string | null>(null);

	let channel: RealtimeChannel | null = null;

	async function loadPending() {
		const { data, error } = await supabase
			.from('community_builds')
			.select('id, game_id, name, author, civilization, difficulty, status, submitted_at, moderator_notes')
			.eq('status', 'pending')
			.order('submitted_at', { ascending: true });

		if (error) {
			loadError = error.message;
		} else {
			pendingBuilds = (data ?? []) as CommunityBuild[];
		}
	}

	async function sendMagicLink() {
		loginLoading = true;
		loginError = null;
		const { error } = await supabase.auth.signInWithOtp({
			email: loginEmail.trim(),
			options: {
				emailRedirectTo: `${window.location.origin}${base}/admin`,
			},
		});
		loginLoading = false;
		if (error) {
			loginError = error.message;
		} else {
			loginSent = true;
		}
	}

	async function logout() {
		await supabase.auth.signOut();
		user = null;
		pendingBuilds = [];
	}

	onMount(async () => {
		// Handle OAuth/magic link callback in the URL hash
		const { data: { session } } = await supabase.auth.getSession();
		user = session?.user ?? null;
		authChecked = true;

		if (user) {
			await loadPending();

			// Subscribe to realtime inserts on community_builds
			channel = supabase
				.channel('admin-pending')
				.on(
					'postgres_changes',
					{ event: 'INSERT', schema: 'public', table: 'community_builds' },
					(payload) => {
						const newBuild = payload.new as CommunityBuild;
						if (newBuild.status === 'pending') {
							pendingBuilds = [...pendingBuilds, newBuild];
						}
					},
				)
				.subscribe();
		}

		// Listen for auth state changes (magic link redirect)
		supabase.auth.onAuthStateChange(async (_event, session) => {
			user = session?.user ?? null;
			if (user && pendingBuilds.length === 0) {
				await loadPending();
			}
		});
	});

	onDestroy(() => {
		channel?.unsubscribe();
	});
</script>

<svelte:head>
	<title>Aegis – Admin</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-10 gap-6">
	<header class="w-full max-w-3xl flex items-center gap-4">
		<a
			href="{base}/"
			class="text-stone-500 hover:text-amber-400 transition-colors text-xl leading-none"
			aria-label="Back"
		>←</a>
		<h1 class="text-2xl font-extrabold tracking-tight">{$t('admin.title')}</h1>

		{#if user}
			<button
				onclick={logout}
				class="ml-auto text-xs text-stone-500 hover:text-red-400 transition-colors font-semibold"
			>
				{$t('admin.logout')}
			</button>
		{/if}
	</header>

	{#if !authChecked}
		<p class="text-stone-500 text-sm">…</p>
	{:else if !user}
		<!-- Login form -->
		<div class="w-full max-w-sm bg-stone-900 border border-stone-700 rounded-2xl p-6 flex flex-col gap-5">
			<h2 class="text-base font-bold">{$t('admin.login_title')}</h2>

			{#if loginSent}
				<div class="bg-green-900/40 border border-green-700/50 rounded-xl px-4 py-3">
					<p class="text-green-300 text-sm">{$t('admin.login_sent')}</p>
				</div>
			{:else}
				<label class="flex flex-col gap-1">
					<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
						{$t('admin.login_email')}
					</span>
					<input
						type="email"
						bind:value={loginEmail}
						placeholder="admin@example.com"
						class="bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-xl
						       px-3 py-2 text-stone-100 text-sm focus:outline-none transition-colors"
					/>
				</label>

				{#if loginError}
					<p class="text-red-400 text-sm">{$t('admin.login_error', { error: loginError })}</p>
				{/if}

				<button
					onclick={sendMagicLink}
					disabled={!loginEmail.trim() || loginLoading}
					class="h-11 rounded-2xl font-bold text-sm transition-all
					       {loginEmail.trim() && !loginLoading
						? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
						: 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}"
				>
					{loginLoading ? '…' : $t('admin.login_btn')}
				</button>
			{/if}
		</div>
	{:else}
		<!-- Moderation queue -->
		<section class="w-full max-w-3xl flex flex-col gap-4">
			<div class="flex items-center gap-3">
				<h2 class="text-sm uppercase tracking-widest text-stone-500 font-semibold">
					{$t('admin.pending')}
				</h2>
				<span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
					{pendingBuilds.length}
				</span>
			</div>

			{#if loadError}
				<div class="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3" role="alert">
					<p class="text-red-300 text-sm">{loadError}</p>
				</div>
			{/if}

			{#if pendingBuilds.length === 0}
				<p class="text-stone-500 text-sm py-6 text-center">{$t('admin.no_pending')}</p>
			{:else}
				<div class="flex flex-col gap-3">
					{#each pendingBuilds as build (build.id)}
						<div class="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-4">
							<div class="flex-1 min-w-0">
								<p class="font-semibold text-stone-100 text-sm truncate">{build.name}</p>
								<p class="text-xs text-stone-500 mt-0.5">
									{build.game_id}
									{#if build.civilization} · {build.civilization}{/if}
									{#if build.author} · ✍️ {build.author}{/if}
								</p>
								<p class="text-xs text-stone-600 mt-0.5">
									{$t('admin.submitted_at')}:
									{new Date(build.submitted_at).toLocaleString()}
								</p>
								<p class="text-xs text-stone-600 font-mono mt-0.5 truncate">
									{$t('admin.tracking_id')}: {build.id}
								</p>
							</div>
							<a
								href="{base}/admin/{build.id}"
								class="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400
								       text-stone-950 font-bold text-xs transition-all"
							>
								{$t('admin.view_btn')}
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</main>
