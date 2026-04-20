<script lang="ts">
	import { builderStore } from '$lib/stores/builderStore';
	import type { BuildOrder } from '@aegis/core';

	let { buildOrder }: { buildOrder: BuildOrder } = $props();

	function adjust(index: number, field: 'villagerCount' | 'food' | 'wood' | 'gold' | 'stone', delta: number) {
		const current = buildOrder.steps[index][field] ?? 0;
		const next = Math.max(0, current + delta);
		builderStore.updateStep(index, { [field]: next });
	}

	const resources: Array<{
		field: 'food' | 'wood' | 'gold' | 'stone';
		label: string;
		emoji: string;
		text: string;
	}> = [
		{ field: 'food',  label: 'Nourriture', emoji: '🍖', text: 'text-green-400'  },
		{ field: 'wood',  label: 'Bois',        emoji: '🪵', text: 'text-amber-400'  },
		{ field: 'gold',  label: 'Or',           emoji: '🪙', text: 'text-yellow-300' },
		{ field: 'stone', label: 'Pierre',       emoji: '🪨', text: 'text-slate-300'  },
	];
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
					aria-label="Supprimer l'étape"
				>✕</button>
			</div>

			<!-- Trigger / label -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					Déclencheur
				</span>
				<input
					type="text"
					value={step.label}
					oninput={(e) => builderStore.updateStep(i, { label: (e.target as HTMLInputElement).value })}
					placeholder="Ex : 6 moutons"
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm focus:outline-none focus:border-amber-500 transition-colors"
				/>
			</label>

			<!-- Instruction / description -->
			<label class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					Instruction
				</span>
				<textarea
					value={step.description}
					oninput={(e) => builderStore.updateStep(i, { description: (e.target as HTMLTextAreaElement).value })}
					placeholder="Détaillez l'action à effectuer…"
					rows={2}
					class="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100
					       text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors"
				></textarea>
			</label>

			<!-- Population / total villagers -->
			<div class="flex flex-col gap-1">
				<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">
					👥 Population (total)
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
		+ Ajouter une étape
	</button>
</div>
