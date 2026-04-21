<script lang="ts">
	import { builderStore } from '$lib/stores/builderStore';
	import type { BuildOrder } from '@aegis/core';
	import { t } from '$lib/i18n';

	let { buildOrder }: { buildOrder: BuildOrder } = $props();

	const columns = $derived<Array<{
		field: 'villagerCount' | 'food' | 'wood' | 'gold' | 'stone';
		label: string;
		emoji: string;
		text: string;
	}>>([
		{ field: 'villagerCount', label: 'Pop',                emoji: '👥', text: 'text-cyan-300'   },
		{ field: 'food',          label: $t('resource.food'),  emoji: '🍖', text: 'text-green-400'  },
		{ field: 'wood',          label: $t('resource.wood'),  emoji: '🪵', text: 'text-amber-400'  },
		{ field: 'gold',          label: $t('resource.gold'),  emoji: '🪙', text: 'text-yellow-300' },
		{ field: 'stone',         label: $t('resource.stone'), emoji: '🪨', text: 'text-slate-300'  },
	]);
</script>

<div class="overflow-x-auto rounded-2xl border border-stone-800">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="bg-stone-900 border-b border-stone-800">
				<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider w-8">
					#
				</th>
				<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider min-w-[120px]">
					{$t('table.trigger')}
				</th>
				<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider min-w-[160px]">
					{$t('table.instruction')}
				</th>
				{#each columns as col}
					<th class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-center {col.text}">
						{col.emoji} {col.label}
					</th>
				{/each}
				<th class="px-2 py-2 w-8"></th>
			</tr>
		</thead>
		<tbody>
			{#each buildOrder.steps as step, i (step.id)}
				<tr class="border-b border-stone-800/60 hover:bg-stone-800/40 transition-colors">
					<!-- Step number -->
					<td class="px-3 py-1.5 text-center">
						<span class="bg-amber-500 text-stone-950 text-xs font-bold w-6 h-6 rounded-full
						            flex items-center justify-center mx-auto shadow-sm shadow-amber-500/20">
							{step.id}
						</span>
					</td>

					<!-- Label -->
					<td class="px-2 py-1.5">
						<input
							type="text"
							value={step.label}
							oninput={(e) => builderStore.updateStep(i, { label: (e.target as HTMLInputElement).value })}
							placeholder={$t('table.trigger_placeholder')}
							class="w-full bg-transparent border border-transparent hover:border-stone-700
							       focus:border-amber-500 rounded-lg px-2 py-1 text-stone-100 text-sm
							       focus:outline-none transition-colors"
						/>
					</td>

					<!-- Description -->
					<td class="px-2 py-1.5">
						<input
							type="text"
							value={step.description}
							oninput={(e) => builderStore.updateStep(i, { description: (e.target as HTMLInputElement).value })}
							placeholder={$t('table.instruction_placeholder')}
							class="w-full bg-transparent border border-transparent hover:border-stone-700
							       focus:border-amber-500 rounded-lg px-2 py-1 text-stone-100 text-sm
							       focus:outline-none transition-colors"
						/>
					</td>

					<!-- Numeric resource cells -->
					{#each columns as col}
						<td class="px-2 py-1.5 text-center">
							<input
								type="number"
								min="0"
								value={step[col.field] ?? 0}
								oninput={(e) => {
									const val = parseInt((e.target as HTMLInputElement).value, 10);
									builderStore.updateStep(i, { [col.field]: isNaN(val) ? 0 : Math.max(0, val) });
								}}
								class="w-14 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1
								       text-center font-bold {col.text} focus:outline-none focus:border-amber-500
								       transition-colors text-sm"
							/>
						</td>
					{/each}

					<!-- Remove -->
					<td class="px-2 py-1.5 text-center">
						<button
							onclick={() => builderStore.removeStep(i)}
							disabled={buildOrder.steps.length <= 1}
							class="text-stone-600 hover:text-red-400 transition-colors text-base
							       disabled:opacity-25 disabled:cursor-not-allowed"
							aria-label={$t('table.delete_step')}
						>✕</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Add step row -->
	<div class="px-4 py-2 bg-stone-900/50">
		<button
			onclick={() => builderStore.addStep()}
			class="text-sm text-stone-500 hover:text-amber-400 transition-colors font-semibold"
		>
			{$t('table.add_step')}
		</button>
	</div>
</div>
