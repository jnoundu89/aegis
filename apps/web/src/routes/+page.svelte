<script lang="ts">
import { catalog } from '$lib/registry';
import { base } from '$app/paths';
import { t } from '$lib/i18n';
import type { CatalogEntry, Difficulty } from '@aegis/core';

// ── Filter state ──────────────────────────────────────────────────────────
let searchQuery = $state('');
let selectedGameId = $state<string | null>(null);
let selectedAuthor = $state<string | null>(null);
let selectedDifficulty = $state<Difficulty | null>(null);

/** Maximum number of tag pills shown on a card before truncating. */
const MAX_VISIBLE_TAGS = 4;

// ── Derived helpers ───────────────────────────────────────────────────────

/** All unique authors (sorted alphabetically) */
const authors = $derived(
[...new Set(catalog.buildOrders.map((bo) => bo.author).filter(Boolean) as string[])].sort()
);

/** Whether any filter is active */
const hasActiveFilter = $derived(
!!searchQuery || !!selectedGameId || !!selectedAuthor || !!selectedDifficulty
);

/** Filtered + searched build orders */
const filteredBOs = $derived<CatalogEntry[]>(
catalog.buildOrders.filter((bo) => {
if (selectedGameId && bo.gameId !== selectedGameId) return false;
if (selectedAuthor && bo.author !== selectedAuthor) return false;
if (selectedDifficulty && bo.difficulty !== selectedDifficulty) return false;
if (searchQuery) {
const q = searchQuery.toLowerCase().trim();
const hay = [bo.name, bo.civilization, bo.description, bo.author, ...(bo.tags ?? [])]
.filter(Boolean)
.join(' ')
.toLowerCase();
if (!hay.includes(q)) return false;
}
return true;
})
);

/** BOs grouped by gameId, preserving catalog game order */
const groupedBOs = $derived(
(selectedGameId
? catalog.games.filter((g) => g.id === selectedGameId)
: catalog.games
)
.map((game) => ({
game,
bos: filteredBOs.filter((bo) => bo.gameId === game.id)
}))
.filter((g) => g.bos.length > 0)
);

// ── Badge helpers ─────────────────────────────────────────────────────────
const difficultyConfig: Record<Difficulty, { bg: string; text: string }> = {
beginner:     { bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
intermediate: { bg: 'bg-amber-900/50',   text: 'text-amber-300'  },
advanced:     { bg: 'bg-red-900/50',      text: 'text-red-300'    }
};

const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

function resetFilters() {
searchQuery = '';
selectedGameId = null;
selectedAuthor = null;
selectedDifficulty = null;
}
</script>

<svelte:head>
<title>Aegis – Build Order Library</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-100">

<!-- ── Hero header ───────────────────────────────────────────────────────── -->
<header class="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 px-4 py-10">
<div class="max-w-4xl mx-auto flex flex-col items-center gap-5 text-center">
<div class="space-y-2">
<h1 class="text-5xl font-extrabold tracking-tight">⚔️ Aegis</h1>
<p class="text-stone-400 text-base">{$t('home.tagline')}</p>
</div>

<a
href="{base}/builder"
class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all"
>
{$t('home.create_bo')}
</a>

<!-- Quick stats per game -->
<div class="flex items-center gap-6 text-xs text-stone-500 font-medium">
{#each catalog.games as game}
{@const count = catalog.buildOrders.filter((bo) => bo.gameId === game.id).length}
<span class="flex items-center gap-1.5">
<span>{game.icon}</span>
<span class="text-stone-300 font-semibold">{count}</span>
<span>{game.name}</span>
</span>
{/each}
</div>
</div>
</header>

<div class="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">

<!-- ── Search + Filters ──────────────────────────────────────────────── -->
<section class="flex flex-col gap-4">

<!-- Search bar -->
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-base pointer-events-none">🔍</span>
<input
type="search"
bind:value={searchQuery}
placeholder={$t('home.search_placeholder')}
class="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/70 rounded-2xl
       pl-11 pr-4 py-3 text-stone-100 placeholder-stone-600 text-sm
       focus:outline-none transition-colors"
/>
</div>

<!-- Filter rows -->
<div class="flex flex-col gap-3">

<!-- Game filter -->
<div class="flex flex-wrap gap-2 items-center">
<span class="text-xs uppercase tracking-widest text-stone-600 font-semibold shrink-0 min-w-[4rem]">
{$t('home.filter_game')}
</span>
<button
onclick={() => (selectedGameId = null)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedGameId === null
? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{$t('home.all_games')}
</button>
{#each catalog.games as game}
<button
onclick={() => (selectedGameId = selectedGameId === game.id ? null : game.id)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedGameId === game.id
? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{game.icon} {game.name}
</button>
{/each}
</div>

<!-- Author filter -->
{#if authors.length > 0}
<div class="flex flex-wrap gap-2 items-center">
<span class="text-xs uppercase tracking-widest text-stone-600 font-semibold shrink-0 min-w-[4rem]">
{$t('home.filter_author')}
</span>
<button
onclick={() => (selectedAuthor = null)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedAuthor === null
? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{$t('home.all_authors')}
</button>
{#each authors as author}
<button
onclick={() => (selectedAuthor = selectedAuthor === author ? null : author)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedAuthor === author
? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{author}
</button>
{/each}
</div>
{/if}

<!-- Difficulty filter -->
<div class="flex flex-wrap gap-2 items-center">
<span class="text-xs uppercase tracking-widest text-stone-600 font-semibold shrink-0 min-w-[4rem]">
{$t('home.filter_difficulty')}
</span>
<button
onclick={() => (selectedDifficulty = null)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedDifficulty === null
? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{$t('home.all_difficulties')}
</button>
{#each difficulties as d}
{@const cfg = difficultyConfig[d]}
<button
onclick={() => (selectedDifficulty = selectedDifficulty === d ? null : d)}
class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all
{selectedDifficulty === d
? `${cfg.bg} ${cfg.text} ring-1 ring-current`
: 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'}"
>
{$t(`difficulty.${d}`)}
</button>
{/each}
</div>

<!-- Active filter summary + reset -->
{#if hasActiveFilter}
<div class="flex items-center gap-3">
<span class="text-xs text-stone-500">
{filteredBOs.length} {$t('home.results')}
</span>
<button
onclick={resetFilters}
class="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
>
✕ {$t('home.clear_filters')}
</button>
</div>
{/if}
</div>
</section>

<!-- ── Onboarding tip ────────────────────────────────────────────────── -->
{#if !hasActiveFilter}
<section class="bg-stone-900/60 border border-stone-700/50 rounded-2xl px-5 py-4 flex gap-4 items-start">
<span class="text-2xl shrink-0">💡</span>
<div class="flex flex-col gap-1">
<p class="text-sm font-semibold text-stone-200">{$t('home.onboarding_title')}</p>
<p class="text-xs text-stone-400 leading-relaxed">{$t('home.onboarding_body')}</p>
</div>
</section>
{/if}

<!-- ── Build order groups ────────────────────────────────────────────── -->
{#if groupedBOs.length === 0}
<section class="text-center py-16 flex flex-col items-center gap-4">
<span class="text-5xl">🔎</span>
<p class="text-stone-400 text-base">{$t('home.no_results')}</p>
<button
onclick={resetFilters}
class="text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors"
>
{$t('home.clear_filters')}
</button>
</section>
{:else}
{#each groupedBOs as { game, bos }}
<section class="flex flex-col gap-4">

<!-- Game section header -->
<div class="flex items-center gap-3">
<span class="text-2xl leading-none">{game.icon}</span>
<h2 class="text-lg font-bold text-stone-100">{game.name}</h2>
<span class="text-xs font-semibold text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
{bos.length}
</span>
<div class="flex-1 h-px bg-stone-800"></div>
</div>

<!-- BO card grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{#each bos as bo (bo.id)}
<a
href="{base}/{bo.gameId}/{bo.id}"
class="group bg-stone-900 border border-stone-800 hover:border-amber-500/60
       rounded-2xl p-5 flex flex-col gap-3 transition-all
       hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]"
>
<!-- Top row: difficulty + author -->
<div class="flex items-center justify-between gap-2 min-h-[1.5rem]">
{#if bo.difficulty}
{@const cfg = difficultyConfig[bo.difficulty]}
<span class="text-xs font-semibold px-2 py-0.5 rounded-full {cfg.bg} {cfg.text}">
{$t(`difficulty.${bo.difficulty}`)}
</span>
{:else}
<span></span>
{/if}
{#if bo.author}
<span class="text-xs text-sky-400 font-medium shrink-0 flex items-center gap-1">
<span>✍️</span>
<span>{bo.author}</span>
</span>
{/if}
</div>

<!-- Title -->
<h3 class="text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors leading-snug">
{bo.name}
</h3>

{#if bo.civilization}
<p class="text-xs text-amber-500 font-medium leading-snug">{bo.civilization}</p>
{/if}

{#if bo.description}
<p class="text-xs text-stone-400 leading-relaxed line-clamp-2 flex-1">{bo.description}</p>
{/if}

<!-- Tags -->
{#if bo.tags && bo.tags.length > 0}
<div class="flex flex-wrap gap-1 mt-auto pt-1">
{#each bo.tags.slice(0, MAX_VISIBLE_TAGS) as tag}
<span class="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">{tag}</span>
{/each}
{#if bo.tags.length > MAX_VISIBLE_TAGS}
<span class="text-xs text-stone-600 px-1">+{bo.tags.length - MAX_VISIBLE_TAGS}</span>
{/if}
</div>
{/if}

<!-- Arrow -->
<div class="flex justify-end">
<span class="text-stone-700 group-hover:text-amber-500 transition-colors text-sm font-bold">→</span>
</div>
</a>
{/each}
</div>
</section>
{/each}
{/if}

</div>
</main>
