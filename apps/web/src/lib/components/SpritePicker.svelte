<script lang="ts">
	import { sprites } from '$lib/sprites';
	import { t } from '$lib/i18n';

	interface Props {
		/** Currently selected sprite keys for this step (used to highlight already-added sprites) */
		selectedKeys: string[];
		onselect: (key: string) => void;
		onclose: () => void;
	}

	let { selectedKeys, onselect, onclose }: Props = $props();

	let searchQuery = $state('');

	type CategoryId =
		| 'units'
		| 'food'
		| 'resources'
		| 'buildings'
		| 'technologies'
		| 'age'
		| 'aom';

	const categories: { id: CategoryId; keys: string[] }[] = [
		{
			id: 'units',
			keys: ['villager', 'scout', 'archer', 'spearman', 'militia', 'knight', 'cavalry_archer', 'crossbowman', 'siege', 'monk'],
		},
		{
			id: 'food',
			keys: ['sheep', 'boar', 'deer', 'berries', 'fish', 'farm'],
		},
		{
			id: 'resources',
			keys: ['food', 'wood', 'gold', 'stone', 'favor'],
		},
		{
			id: 'buildings',
			keys: ['house', 'mill', 'lumber_camp', 'mining_camp', 'town_center', 'barracks', 'range', 'stable', 'blacksmith', 'market', 'monastery', 'castle', 'university', 'siege_workshop', 'watch_tower', 'palisade_wall', 'stone_wall', 'gate'],
		},
		{
			id: 'technologies',
			keys: ['loom', 'double_bit_axe', 'horse_collar', 'fletching', 'bodkin_arrow', 'bow_saw', 'wheelbarrow', 'bloodlines', 'husbandry', 'gold_mining', 'crossbow'],
		},
		{
			id: 'age',
			keys: ['feudal_age', 'castle_age', 'imperial_age'],
		},
		{
			id: 'aom',
			keys: ['favor_aom', 'temple', 'armory', 'bolt'],
		},
	];

	const categoryLabelKey: Record<CategoryId, string> = {
		units: 'guided.sprite_categories_units',
		food: 'guided.sprite_categories_food',
		resources: 'guided.sprite_categories_resources',
		buildings: 'guided.sprite_categories_buildings',
		technologies: 'guided.sprite_categories_technologies',
		age: 'guided.sprite_categories_age',
		aom: 'guided.sprite_categories_aom',
	};

	const filteredCategories = $derived(
		categories
			.map((cat) => ({
				...cat,
				keys: cat.keys.filter((key) => {
					if (!searchQuery.trim()) return true;
					const q = searchQuery.toLowerCase().trim();
					const entry = sprites[key];
					return key.includes(q) || (entry?.label ?? '').toLowerCase().includes(q);
				}),
			}))
			.filter((cat) => cat.keys.length > 0),
	);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<!-- Backdrop -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
	onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
>
	<!-- Modal panel -->
	<div
		class="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
		role="dialog"
		aria-modal="true"
		aria-label={$t('guided.sprites')}
	>
		<!-- Header -->
		<div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-800">
			<h3 class="text-sm font-bold text-stone-100">{$t('guided.sprites')}</h3>
			<button
				onclick={onclose}
				class="text-stone-500 hover:text-stone-200 text-lg leading-none transition-colors"
				aria-label="Close"
			>✕</button>
		</div>

		<!-- Search -->
		<div class="px-4 py-2 border-b border-stone-800">
			<input
				type="search"
				bind:value={searchQuery}
				placeholder={$t('guided.sprite_search')}
				class="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-xl
				       px-3 py-2 text-stone-100 placeholder-stone-600 text-sm focus:outline-none transition-colors"
			/>
		</div>

		<!-- Sprite grid (scrollable) -->
		<div class="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-4">
			{#if filteredCategories.length === 0}
				<p class="text-stone-500 text-sm text-center py-6">🔎 No sprites found.</p>
			{:else}
				{#each filteredCategories as cat}
					<div>
						<h4 class="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">
							{$t(categoryLabelKey[cat.id])}
						</h4>
						<div class="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
							{#each cat.keys as key}
								{@const entry = sprites[key] ?? { emoji: '❓', label: key }}
								{@const isSelected = selectedKeys.includes(key)}
								<button
									onclick={() => onselect(key)}
									title={entry.label}
									class="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl text-center
									       transition-all hover:bg-stone-700 active:bg-stone-600
									       {isSelected
										? 'bg-amber-500/20 border border-amber-500/60 ring-1 ring-amber-500/40'
										: 'border border-transparent hover:border-stone-600'}"
								>
									{#if entry.url}
										<img
											src={entry.url}
											alt={entry.label}
											class="w-8 h-8 object-contain"
											onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
										/>
									{:else}
										<span class="text-xl leading-none">{entry.emoji}</span>
									{/if}
									<span class="text-stone-400 text-[10px] leading-tight line-clamp-1 w-full text-center">
										{entry.label}
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<svelte:window onkeydown={handleKeydown} />
