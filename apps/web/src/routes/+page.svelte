<script lang="ts">
	import steps from '@aegis/data/fast_castle.json';
	import { StateMachine } from '@aegis/core';

	const sm = new StateMachine(steps);

	let currentStep = $state(sm.currentStep);
	let currentIndex = $state(sm.index);

	function next() {
		sm.next();
		currentStep = sm.currentStep;
		currentIndex = sm.index;
	}

	function prev() {
		sm.prev();
		currentStep = sm.currentStep;
		currentIndex = sm.index;
	}
</script>

<svelte:head>
	<title>Aegis – Build Order Assistant</title>
</svelte:head>

<main class="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6">
	<h1 class="text-4xl font-bold tracking-tight mb-2">⚔️ Aegis</h1>
	<p class="text-stone-400 mb-10 text-sm">Age of Empires II – Build Order Assistant</p>

	<!-- Progress indicator -->
	<p class="text-xs text-stone-500 mb-6 uppercase tracking-widest">
		Step {currentIndex + 1} / {sm.totalSteps}
	</p>

	<!-- Step card -->
	<div class="w-full max-w-lg bg-stone-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<span class="bg-amber-500 text-stone-900 text-sm font-bold px-3 py-1 rounded-full">
				#{currentStep.id}
			</span>
			<h2 class="text-xl font-semibold">{currentStep.label}</h2>
		</div>

		<p class="text-stone-300 leading-relaxed">{currentStep.description}</p>

		{#if currentStep.notes}
			<p class="text-sm text-amber-400 bg-amber-900/30 rounded-lg px-4 py-2">
				💡 {currentStep.notes}
			</p>
		{/if}

		<!-- Economy snapshot -->
		<div class="grid grid-cols-5 gap-2 mt-2">
			{#each [
				{ label: '👥 Villagers', value: currentStep.villagerCount },
				{ label: '🍖 Food', value: currentStep.food },
				{ label: '🪵 Wood', value: currentStep.wood },
				{ label: '🪙 Gold', value: currentStep.gold },
				{ label: '🪨 Stone', value: currentStep.stone }
			] as stat}
				<div class="bg-stone-700 rounded-lg p-2 text-center">
					<div class="text-xs text-stone-400">{stat.label}</div>
					<div class="font-bold text-lg">{stat.value}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Navigation -->
	<div class="flex gap-4 mt-8">
		<button
			onclick={prev}
			disabled={!sm.hasPrev}
			class="px-6 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
		>
			← Previous
		</button>
		<button
			onclick={next}
			disabled={!sm.hasNext}
			class="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition"
		>
			Next →
		</button>
	</div>
</main>
