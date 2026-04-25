<script lang="ts">
	import { builderStore } from '$lib/stores/builderStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import type { BuildOrder } from '@aegis/core';
	import { t, localize } from '$lib/i18n';
	import { sprites, getSprite } from '$lib/sprites';
	import SpritePicker from '$lib/components/SpritePicker.svelte';

	let { buildOrder }: { buildOrder: BuildOrder } = $props();

	function adjust(index: number, field: 'villagerCount' | 'food' | 'wood' | 'gold' | 'stone', delta: number) {
		const current = buildOrder.steps[index][field] ?? 0;
		const next = Math.max(0, current + delta);
		builderStore.updateStep(index, { [field]: next });
	}

	const resources = $derived<Array<{
		field: 'food' | 'wood' | 'gold' | 'stone';
		label: string;
		emoji: string;
		text: string;
	}>>([
		{ field: 'food',  label: $t('resource.food'),  emoji: '🍖', text: 'text-green-400'  },
		{ field: 'wood',  label: $t('resource.wood'),  emoji: '🪵', text: 'text-amber-400'  },
		{ field: 'gold',  label: $t('resource.gold'),  emoji: '🪙', text: 'text-yellow-300' },
		{ field: 'stone', label: $t('resource.stone'), emoji: '🪨', text: 'text-slate-300'  },
	]);

	/** Index of the step whose sprite picker is currently open, or -1 if closed. */
	let pickerOpenForStep = $state(-1);
</script>

<div class="flex flex-col gap-4">
	{#each buildOrder.steps as step, i (step.id)}
		<div class="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-4">
			<!-- Step header -->
			<div class="flex items-center justify-between gap-3">
				<span
					class="bg-amber-500 text-stone-950 text-sm font-bold w-8 h-8 rounded-full
					       flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30"
				>
					{step.id}
				</span>

				<button
					onclick={() => builderStore.removeStep(i)}
					disabled={buildOrder.steps.length <= 1}
					class="ml-auto text-stone-500 hover:text-red-400 transition-colors text-lg leading-none
					       disabled:opacity-25 disabled:cursor-not-allowed"
					aria-label={$t('guided.delete_step')}
				>✕</button>
			</div>

			<!-- Phase -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('guided.phase')}
				</span>
				<input
					type="text"
					value={step.phase ?? ''}
					oninput={(e) => builderStore.updateStep(i, { phase: (e.target as HTMLInputElement).value || undefined })}
					placeholder={$t('guided.phase_placeholder')}
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors"
				/>
			</label>

			<!-- Trigger / label -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('guided.trigger')}
				</span>
				<input
					type="text"
					value={localize(step.label, $settingsStore.lang)}
					oninput={(e) => builderStore.updateStep(i, { label: (e.target as HTMLInputElement).value })}
					placeholder={$t('guided.trigger_placeholder')}
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors"
				/>
			</label>

			<!-- Instruction / description -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('guided.instruction')}
				</span>
				<textarea
					value={localize(step.description, $settingsStore.lang)}
					oninput={(e) => builderStore.updateStep(i, { description: (e.target as HTMLTextAreaElement).value })}
					placeholder={$t('guided.instruction_placeholder')}
					rows={2}
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors"
				></textarea>
			</label>

			<!-- Notes / tip -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('guided.notes')}
				</span>
				<input
					type="text"
					value={localize(step.notes, $settingsStore.lang)}
					oninput={(e) => builderStore.updateStep(i, { notes: (e.target as HTMLInputElement).value || undefined })}
					placeholder={$t('guided.notes_placeholder')}
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors"
				/>
			</label>

			<!-- Population / total villagers -->
			<div class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					{$t('guided.population')}
				</span>
				<div class="flex items-center gap-2">
					<button
						onclick={() => adjust(i, 'villagerCount', -1)}
						class="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600
						       text-stone-100 font-bold text-lg flex items-center justify-center transition-colors"
					>−</button>
					<span class="text-cyan-300 font-extrabold text-xl w-10 text-center">
						{step.villagerCount}
					</span>
					<button
						onclick={() => adjust(i, 'villagerCount', 1)}
						class="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600
						       text-stone-100 font-bold text-lg flex items-center justify-center transition-colors"
					>+</button>
				</div>
			</div>

			<!-- Sprites / icons -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-2">
					<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
						{$t('guided.sprites')}
					</span>
					<button
						onclick={() => (pickerOpenForStep = i)}
						class="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
					>
						{$t('guided.add_sprite')}
					</button>
				</div>

				{#if step.sprites && step.sprites.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each step.sprites as sp}
							{@const entry = getSprite(sp.key)}
							<span
								class="inline-flex items-center gap-1.5 bg-stone-800 border border-stone-700
								       rounded-xl pl-2 pr-1 py-1 text-xs text-stone-200"
							>
								{#if entry.url}
									<img
										src={entry.url}
										alt={entry.label}
										class="w-5 h-5 object-contain shrink-0"
										onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
									/>
								{:else}
									<span class="text-base leading-none">{entry.emoji}</span>
								{/if}
								<span>{sp.label ?? entry.label}</span>
								<button
									onclick={() => builderStore.removeSprite(i, sp.key)}
									class="text-stone-500 hover:text-red-400 transition-colors leading-none ml-0.5"
									aria-label={$t('guided.remove_sprite')}
								>✕</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Resource allocations -->
			<div class="grid grid-cols-2 gap-3">
				{#each resources as res}
					<div class="flex flex-col gap-1">
						<span class="text-xs font-semibold {res.text}">
							{res.emoji} {res.label}
						</span>
						<div class="flex items-center gap-1.5">
							<button
								onclick={() => adjust(i, res.field, -1)}
								class="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600
								       text-stone-100 font-bold flex items-center justify-center transition-colors text-sm"
							>−</button>
							<span class="{res.text} font-bold text-base w-8 text-center">
								{step[res.field] ?? 0}
							</span>
							<button
								onclick={() => adjust(i, res.field, 1)}
								class="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600
								       text-stone-100 font-bold flex items-center justify-center transition-colors text-sm"
							>+</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<!-- Add step -->
	<button
		onclick={() => builderStore.addStep()}
		class="w-full h-12 rounded-2xl border-2 border-dashed border-stone-700 text-stone-500
		       hover:border-amber-500/60 hover:text-amber-400 transition-all text-sm font-semibold"
	>
		{$t('guided.add_step')}
	</button>
</div>

{#if pickerOpenForStep >= 0}
	<SpritePicker
		selectedKeys={buildOrder.steps[pickerOpenForStep]?.sprites?.map((s) => s.key) ?? []}
		onselect={(key) => {
			builderStore.addSprite(pickerOpenForStep, key);
		}}
		onclose={() => (pickerOpenForStep = -1)}
	/>
{/if}
