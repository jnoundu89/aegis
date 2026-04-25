<script lang="ts">
	import type { BuildOrder } from '@aegis/core';
	import { communityStore } from '$lib/stores/communityStore';
	import { t } from '$lib/i18n';

	interface Props {
		buildOrder: BuildOrder;
		onclose: () => void;
	}

	let { buildOrder, onclose }: Props = $props();

	let email = $state('');
	let rulesAccepted = $state(false);
	let submitting = $state(false);
	let successId = $state<string | null>(null);
	let submitError = $state<string | null>(null);

	async function handleSubmit() {
		if (!rulesAccepted || submitting) return;
		submitting = true;
		submitError = null;
		try {
			const id = await communityStore.submit({
				gameId: buildOrder.gameId,
				name: buildOrder.name,
				author: buildOrder.author ?? null,
				civilization: buildOrder.civilization ?? null,
				difficulty: buildOrder.difficulty ?? null,
				data: buildOrder,
				submitterEmail: email.trim() || null,
			});
			successId = id;
		} catch (e) {
			submitError = (e as Error).message;
		} finally {
			submitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
	onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
>
	<div
		class="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col gap-5 p-6"
		role="dialog"
		aria-modal="true"
	>
		{#if successId}
			<!-- Success state -->
			<div class="flex flex-col gap-4 items-center text-center">
				<span class="text-4xl">✅</span>
				<p class="text-stone-100 font-semibold">
					{$t('builder.submit_success', { id: successId })}
				</p>
				<p class="text-stone-500 text-xs font-mono break-all">{successId}</p>
				<button
					onclick={onclose}
					class="mt-2 w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all"
				>
					OK
				</button>
			</div>
		{:else}
			<!-- Form -->
			<div class="flex items-center justify-between gap-3">
				<h3 class="text-base font-bold text-stone-100">{$t('builder.submit_modal_title')}</h3>
				<button
					onclick={onclose}
					class="text-stone-500 hover:text-stone-200 text-lg leading-none transition-colors"
					aria-label="Close"
				>✕</button>
			</div>

			<p class="text-stone-400 text-sm leading-relaxed">{$t('builder.submit_modal_body')}</p>

			<!-- Build summary -->
			<div class="bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 flex flex-col gap-1">
				<p class="text-stone-100 font-semibold text-sm">{buildOrder.name}</p>
				{#if buildOrder.civilization}
					<p class="text-amber-400 text-xs">{buildOrder.civilization}</p>
				{/if}
				{#if buildOrder.author}
					<p class="text-stone-400 text-xs">✍️ {buildOrder.author}</p>
				{/if}
			</div>

			<!-- Email -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('builder.submit_email_label')}
				</span>
				<input
					type="email"
					bind:value={email}
					placeholder={$t('builder.submit_email_placeholder')}
					class="bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-xl
					       px-3 py-2 text-stone-100 text-sm placeholder-stone-600 focus:outline-none transition-colors"
				/>
			</label>

			<!-- Rules checkbox -->
			<label class="flex items-start gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={rulesAccepted}
					class="mt-0.5 w-4 h-4 accent-amber-500 shrink-0"
				/>
				<span class="text-stone-400 text-xs leading-relaxed">
					{$t('builder.submit_rules')}
				</span>
			</label>

			{#if submitError}
				<div class="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3" role="alert">
					<p class="text-red-300 text-sm">{$t('builder.submit_error', { error: submitError })}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex gap-3">
				<button
					onclick={onclose}
					class="flex-1 h-11 rounded-2xl font-semibold text-sm transition-all
					       bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300"
				>
					{$t('builder.submit_cancel')}
				</button>
				<button
					onclick={handleSubmit}
					disabled={!rulesAccepted || submitting}
					class="flex-1 h-11 rounded-2xl font-bold text-sm transition-all
					       {rulesAccepted && !submitting
						? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/30'
						: 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}"
				>
					{submitting ? '…' : $t('builder.submit_btn')}
				</button>
			</div>
		{/if}
	</div>
</div>

<svelte:window onkeydown={handleKeydown} />
