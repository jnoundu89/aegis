<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { t } from '$lib/i18n';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<!-- Floating settings widget -->
<div class="fixed bottom-4 right-4 z-50 flex items-center gap-2">
	<!-- TTS toggle -->
	<button
		onclick={() => settingsStore.toggleTTS()}
		title={$settingsStore.ttsEnabled ? $t('settings.tts_disable') : $t('settings.tts_enable')}
		class="flex items-center justify-center w-10 h-10 rounded-xl text-base font-semibold
		       transition-all bg-stone-800 border
		       {$settingsStore.ttsEnabled
			? 'border-amber-500/60 text-amber-400 shadow-md shadow-amber-500/20'
			: 'border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-600'}"
	>
		{$settingsStore.ttsEnabled ? '🔊' : '🔇'}
	</button>

	<!-- Language toggle -->
	<button
		onclick={() => settingsStore.setLang($settingsStore.lang === 'en' ? 'fr' : 'en')}
		title={$t('settings.lang_switch')}
		class="flex items-center justify-center w-10 h-10 rounded-xl text-xs font-bold
		       transition-all bg-stone-800 border border-stone-700
		       text-stone-300 hover:text-amber-400 hover:border-amber-600/50"
	>
		{$t('settings.lang_label')}
	</button>
</div>
