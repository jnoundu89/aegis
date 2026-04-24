<script lang="ts">
import type { Step, ResourceKey } from '@aegis/core';
import { catalog } from '$lib/registry';
import { getSprite } from '$lib/sprites';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { listen } from '@tauri-apps/api/event';
import { settingsStore } from '$lib/stores/settingsStore';
import { t, ttsLang } from '$lib/i18n';

let { data } = $props();

const game = $derived(catalog.games.find((g) => g.id === data.buildOrder.gameId));
const steps = $derived<Step[]>(data.buildOrder.steps);
const totalSteps = $derived(steps.length);

type ViewMode = 'guided' | 'table';
let viewMode = $state<ViewMode>('guided');
let stepIndex = $state(0);
let animating = $state(false);
let strategyNotesOpen = $state(false);
let checkpointsOpen = $state(false);

const currentStep = $derived(steps[stepIndex]);
const hasPrev = $derived(stepIndex > 0);
const hasNext = $derived(stepIndex < totalSteps - 1);

/** Whether the current step starts a new phase (phase divider needed) */
const phaseChanges = $derived<boolean[]>(
steps.map((step, i) => {
if (i === 0) return !!step.phase;
return !!step.phase && step.phase !== steps[i - 1].phase;
})
);

/** Phase colour mapping */
const phaseColorMap: Record<string, { bg: string; text: string; border: string }> = {
'Dark Age':     { bg: 'bg-stone-800',   text: 'text-stone-300',  border: 'border-stone-600'  },
'Feudal Age':   { bg: 'bg-amber-900/50', text: 'text-amber-300',  border: 'border-amber-700'  },
'Castle Age':   { bg: 'bg-blue-900/50',  text: 'text-blue-300',   border: 'border-blue-700'   },
'Imperial Age': { bg: 'bg-purple-900/50',text: 'text-purple-300', border: 'border-purple-700' },
};

function phaseColor(phase: string) {
return phaseColorMap[phase] ?? { bg: 'bg-stone-800', text: 'text-stone-300', border: 'border-stone-600' };
}

/** Resource display configuration */
const resourceConfig = $derived<Record<ResourceKey | 'villagerCount', { label: string; emoji: string; text: string; bg: string }>>({
villagerCount: { label: $t('resource.villagers'), emoji: '👥', text: 'text-cyan-300', bg: 'bg-cyan-900/40 border border-cyan-700/50' },
food:          { label: $t('resource.food'),      emoji: '🍖', text: 'text-green-300', bg: 'bg-green-900/40 border border-green-700/50' },
wood:          { label: $t('resource.wood'),      emoji: '🪵', text: 'text-amber-400', bg: 'bg-amber-900/40 border border-amber-700/50' },
gold:          { label: $t('resource.gold'),      emoji: '🪙', text: 'text-yellow-300', bg: 'bg-yellow-900/40 border border-yellow-700/50' },
stone:         { label: $t('resource.stone'),     emoji: '🪨', text: 'text-slate-300',  bg: 'bg-slate-800/60  border border-slate-600/50' },
favor:         { label: $t('resource.favor'),     emoji: '⚡', text: 'text-purple-300', bg: 'bg-purple-900/40 border border-purple-700/50' }
});

const resourceKeys = $derived<(ResourceKey | 'villagerCount')[]>([
'villagerCount',
...(game?.resources ?? ['food', 'wood', 'gold', 'stone'])
]);

function speak(text: string) {
if (!$settingsStore.ttsEnabled) return;
if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
window.speechSynthesis.cancel();
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = $ttsLang;
utterance.rate = 1.0;
window.speechSynthesis.speak(utterance);
}

function move(direction: 'next' | 'prev') {
if (animating) return;
if (direction === 'next' && !hasNext) return;
if (direction === 'prev' && !hasPrev) return;
animating = true;
setTimeout(() => {
stepIndex += direction === 'next' ? 1 : -1;
animating = false;
speak(currentStep.description);
}, 180);
}

function next() { move('next'); }
function prev() { move('prev'); }

/** Hide the failed image and reveal its emoji fallback sibling. */
function onSpriteError(e: Event) {
const img = e.currentTarget as HTMLImageElement;
img.classList.add('hidden');
const fb = img.nextElementSibling as HTMLElement;
if (fb) fb.classList.remove('hidden');
}

onMount(() => {
if (typeof window === 'undefined' || !('__TAURI__' in window)) return;
const unlistenPromise = listen('aegis-next-step', () => next()).catch(() => undefined);
return () => { unlistenPromise.then(fn => fn?.()); };
});
</script>

<svelte:head>
<title>Aegis – {data.buildOrder.name}</title>
</svelte:head>

<svelte:window
onkeydown={(e) => {
if (e.key === 'ArrowRight' || e.key === 'F9') next();
if (e.key === 'ArrowLeft') prev();
}}
/>

<main class="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center px-4 py-8 gap-6">

<!-- Back link + title + meta -->
<header class="w-full max-w-2xl flex items-start gap-4">
<a
href="{base}/"
class="mt-1 text-stone-500 hover:text-amber-400 transition-colors text-lg leading-none"
aria-label={$t('nav.back_to_library')}
>←</a>
<div class="flex-1 min-w-0 flex flex-col gap-2">
<p class="text-xs text-stone-500 uppercase tracking-widest font-semibold">
{game?.icon ?? ''} {game?.name ?? data.buildOrder.gameId}
{#if data.buildOrder.civilization}
· {data.buildOrder.civilization}
{/if}
</p>
<h1 class="text-2xl font-extrabold tracking-tight">{data.buildOrder.name}</h1>

<!-- Author + difficulty badges -->
<div class="flex flex-wrap gap-2 items-center">
{#if data.buildOrder.author}
<span class="text-xs bg-sky-900/50 text-sky-300 border border-sky-700/40 px-2 py-0.5 rounded-full font-medium">
✍️ {data.buildOrder.author}
</span>
{/if}
{#if data.buildOrder.difficulty}
{@const d = data.buildOrder.difficulty}
<span class="text-xs px-2 py-0.5 rounded-full font-medium
{d === 'beginner' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40' :
 d === 'intermediate' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/40' :
 'bg-red-900/50 text-red-300 border border-red-700/40'}">
{$t(`difficulty.${d}`)}
</span>
{/if}
</div>

{#if data.buildOrder.description}
<p class="text-sm text-stone-400 italic leading-relaxed">{data.buildOrder.description}</p>
{/if}
</div>
</header>

<!-- View mode toggle -->
<div class="w-full max-w-2xl flex items-center gap-3">
<span class="text-xs uppercase tracking-widest text-stone-500 font-semibold">{$t('builder.view')}</span>
<div class="flex bg-stone-900 border border-stone-800 rounded-full p-1 gap-1">
<button
onclick={() => (viewMode = 'guided')}
class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
       {viewMode === 'guided'
? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
: 'text-stone-400 hover:text-stone-200'}"
>
{$t('viewer.view_guided')}
</button>
<button
onclick={() => (viewMode = 'table')}
class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all
       {viewMode === 'table'
? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
: 'text-stone-400 hover:text-stone-200'}"
>
{$t('viewer.view_table')}
</button>
</div>
</div>

<!-- ── GUIDED VIEW ──────────────────────────────────────────────────────── -->
{#if viewMode === 'guided'}

<!-- Strategy Notes collapsible panel -->
{#if data.buildOrder.strategy_notes && data.buildOrder.strategy_notes.length > 0}
<div class="w-full max-w-2xl">
<button
onclick={() => (strategyNotesOpen = !strategyNotesOpen)}
class="w-full flex items-center justify-between px-4 py-3 rounded-xl
bg-stone-800 border border-stone-700 hover:border-amber-600/60
hover:bg-stone-700 active:bg-stone-600 transition-all duration-150
text-sm font-semibold text-stone-200"
aria-expanded={strategyNotesOpen}
>
<span class="flex items-center gap-2">
<span>📋</span>
<span>{$t('viewer.strategy_notes')}</span>
</span>
<span class="text-stone-400 text-xs transition-transform duration-200 {strategyNotesOpen ? 'rotate-180' : ''}">▼</span>
</button>
{#if strategyNotesOpen}
<div class="mt-2 rounded-xl bg-stone-900 border border-stone-700 divide-y divide-stone-800 overflow-hidden">
{#each data.buildOrder.strategy_notes as phase}
<div class="px-4 py-3">
<h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">{phase.phase}</h3>
<ul class="space-y-1.5">
{#each phase.notes as note}
<li class="text-sm text-stone-300 leading-relaxed flex gap-2">
<span class="text-stone-600 shrink-0 mt-0.5">•</span>
<span>{note}</span>
</li>
{/each}
</ul>
</div>
{/each}
</div>
{/if}
</div>
{/if}

<!-- Checkpoints collapsible panel -->
{#if data.buildOrder.checkpoints && data.buildOrder.checkpoints.length > 0}
<div class="w-full max-w-2xl">
<button
onclick={() => (checkpointsOpen = !checkpointsOpen)}
class="w-full flex items-center justify-between px-4 py-3 rounded-xl
bg-stone-800 border border-stone-700 hover:border-amber-600/60
hover:bg-stone-700 active:bg-stone-600 transition-all duration-150
text-sm font-semibold text-stone-200"
aria-expanded={checkpointsOpen}
>
<span class="flex items-center gap-2">
<span>🎯</span>
<span>{$t('viewer.checkpoints')}</span>
</span>
<span class="text-stone-400 text-xs transition-transform duration-200 {checkpointsOpen ? 'rotate-180' : ''}">▼</span>
</button>
{#if checkpointsOpen}
<div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
{#each data.buildOrder.checkpoints as cp}
<div class="rounded-xl bg-stone-900 border border-amber-800/50 p-4 flex flex-col gap-2">
<p class="text-xs font-bold uppercase tracking-widest text-amber-400">{cp.label}</p>
{#if cp.clickTime || cp.arrivalTime}
<div class="flex gap-4 text-xs">
{#if cp.clickTime}
<span class="text-stone-400">{$t('viewer.click_time')}: <span class="text-stone-200 font-mono font-bold">{cp.clickTime}</span></span>
{/if}
{#if cp.arrivalTime}
<span class="text-stone-400">{$t('viewer.arrival_time')}: <span class="text-stone-200 font-mono font-bold">{cp.arrivalTime}</span></span>
{/if}
</div>
{/if}
<!-- Resource snapshot -->
<div class="grid grid-cols-4 gap-1.5 mt-1">
{#each resourceKeys.filter(k => k !== 'villagerCount') as key}
{@const cfg = resourceConfig[key]}
{@const val = cp[key as keyof typeof cp]}
{#if val !== undefined && typeof val === 'number'}
<div class="rounded-lg p-1.5 text-center {cfg.bg}">
<div class="text-sm leading-none">{cfg.emoji}</div>
<div class="text-sm font-extrabold {cfg.text} mt-0.5">{val}</div>
</div>
{/if}
{/each}
</div>
</div>
{/each}
</div>
{/if}
</div>
{/if}

<!-- Progress bar -->
<div class="w-full max-w-2xl space-y-1">
<div class="flex justify-between text-xs text-stone-500 font-mono">
<span>
{#if currentStep.phase}
<span class="text-amber-500/80">{currentStep.phase}</span>
<span class="mx-1">·</span>
{/if}
{$t('viewer.step')}
</span>
<span>{stepIndex + 1} / {totalSteps}</span>
</div>
<div class="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
<div
class="h-full bg-amber-500 rounded-full transition-all duration-300"
style="width: {((stepIndex + 1) / totalSteps) * 100}%"
></div>
</div>
</div>

<!-- Step card with fade/slide transition -->
<div
class="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 transition-all duration-200
{animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}"
>
<!-- Phase badge (shown if step has a phase) -->
{#if currentStep.phase}
{@const pc = phaseColor(currentStep.phase)}
<div class="flex">
<span class="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border {pc.bg} {pc.text} {pc.border}">
{currentStep.phase}
</span>
</div>
{/if}

<!-- Step header -->
<div class="flex items-center gap-3">
<span class="bg-amber-500 text-stone-950 text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
{currentStep.id}
</span>
<h2 class="text-xl font-bold leading-tight">{currentStep.label}</h2>
</div>

<!-- Sprites row -->
{#if currentStep.sprites && currentStep.sprites.length > 0}
<div class="flex gap-3 flex-wrap">
{#each currentStep.sprites as sprite}
{@const entry = getSprite(sprite.key)}
<div class="flex flex-col items-center gap-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 min-w-[3.5rem]">
{#if entry.url}
<img
	src={entry.url}
	alt={sprite.label ?? entry.label}
	width="40"
	height="40"
	class="object-contain rounded-md hover:scale-110 transition-transform duration-150"
	onerror={onSpriteError}
/>
<span class="text-2xl leading-none hidden">{entry.emoji}</span>
{:else}
<span class="text-2xl leading-none">{entry.emoji}</span>
{/if}
<span class="text-xs text-stone-400 font-medium text-center">{sprite.label ?? entry.label}</span>
</div>
{/each}
</div>
{/if}

<!-- Instruction -->
<p class="text-stone-200 text-lg leading-relaxed">{currentStep.description}</p>

<!-- Tip -->
{#if currentStep.notes}
<div class="bg-amber-900/30 border border-amber-700/40 rounded-xl px-4 py-3">
<p class="text-amber-300 text-sm leading-relaxed">💡 {currentStep.notes}</p>
</div>
{/if}

<!-- Economy snapshot -->
<div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
{#each resourceKeys as key}
{@const cfg = resourceConfig[key]}
{@const value = key === 'villagerCount' ? currentStep.villagerCount : currentStep[key as ResourceKey]}
{#if value !== undefined}
<div class="rounded-xl p-3 text-center {cfg.bg}">
<div class="text-lg leading-none">{cfg.emoji}</div>
<div class="text-xs {cfg.text} font-medium mt-1">{cfg.label}</div>
<div class="text-xl font-extrabold {cfg.text} mt-0.5">{value}</div>
</div>
{/if}
{/each}
</div>
</div>

<!-- Navigation -->
<nav class="w-full max-w-2xl grid grid-cols-2 gap-4">
<button
onclick={prev}
disabled={!hasPrev || animating}
class="h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-2
bg-stone-800 hover:bg-stone-700 active:bg-stone-600
disabled:opacity-25 disabled:cursor-not-allowed
transition-all duration-150 shadow-md"
>
{$t('viewer.prev')}
</button>
<button
onclick={next}
disabled={!hasNext || animating}
class="h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-2
bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950
disabled:opacity-25 disabled:cursor-not-allowed
transition-all duration-150 shadow-lg shadow-amber-500/30"
>
{$t('viewer.next')}
</button>
</nav>

<!-- Keyboard hint -->
<p class="text-xs text-stone-600">
{$t('nav.arrow_keys_hint', { key: 'F9' })}
</p>

<!-- ── TABLE VIEW ────────────────────────────────────────────────────────── -->
{:else}
<div class="w-full max-w-4xl overflow-x-auto rounded-2xl border border-stone-800">
<table class="w-full text-sm border-collapse">
<thead>
<tr class="bg-stone-900 border-b border-stone-800">
<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider w-10">#</th>
<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider w-28">Phase</th>
<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider min-w-[120px]">{$t('table.trigger')}</th>
<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider">Icons</th>
<th class="text-left px-3 py-2 text-stone-500 font-semibold text-xs uppercase tracking-wider min-w-[200px]">{$t('table.instruction')}</th>
{#each resourceKeys as key}
{@const cfg = resourceConfig[key]}
<th class="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-center {cfg.text}">
{cfg.emoji}
</th>
{/each}
</tr>
</thead>
<tbody>
{#each steps as step, i (step.id)}
<!-- Phase divider row -->
{#if phaseChanges[i] && step.phase}
{@const pc = phaseColor(step.phase)}
<tr>
<td colspan="99" class="px-4 py-2 {pc.bg} border-b border-t {pc.border}">
<span class="text-xs font-bold uppercase tracking-widest {pc.text}">{step.phase}</span>
</td>
</tr>
{/if}
<tr
class="border-b border-stone-800/60 transition-colors cursor-pointer
       {i === stepIndex && viewMode === 'table' ? 'bg-amber-900/20' : 'hover:bg-stone-800/40'}"
onclick={() => { stepIndex = i; viewMode = 'guided'; }}
>
<td class="px-3 py-2 text-center">
<span class="bg-amber-500 text-stone-950 text-xs font-bold w-6 h-6 rounded-full
            flex items-center justify-center mx-auto shadow-sm shadow-amber-500/20">
{step.id}
</span>
</td>
<td class="px-2 py-2">
{#if step.phase}
{@const pc = phaseColor(step.phase)}
<span class="text-xs font-medium {pc.text}">{step.phase}</span>
{/if}
</td>
<td class="px-2 py-2 text-stone-300 text-xs font-medium">{step.label}</td>
<td class="px-2 py-2">
{#if step.sprites && step.sprites.length > 0}
<div class="flex gap-1 flex-wrap">
{#each step.sprites as sprite}
{@const entry = getSprite(sprite.key)}
{#if entry.url}
<img
	src={entry.url}
	alt={sprite.label ?? entry.label}
	title={sprite.label ?? entry.label}
	width="20"
	height="20"
	class="object-contain rounded"
	onerror={onSpriteError}
/>
<span class="text-base hidden" title={sprite.label ?? entry.label}>{entry.emoji}</span>
{:else}
<span class="text-base" title={sprite.label ?? entry.label}>{entry.emoji}</span>
{/if}
{/each}
</div>
{/if}
</td>
<td class="px-2 py-2 text-stone-400 text-xs leading-relaxed">{step.description}</td>
{#each resourceKeys as key}
{@const cfg = resourceConfig[key]}
{@const value = key === 'villagerCount' ? step.villagerCount : step[key as ResourceKey]}
<td class="px-2 py-2 text-center font-bold text-sm {cfg.text}">
{value ?? '–'}
</td>
{/each}
</tr>
{/each}
</tbody>
</table>
</div>

<p class="text-xs text-stone-600 text-center">{$t('nav.table_click_hint')}</p>
{/if}

</main>
