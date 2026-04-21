import { writable } from 'svelte/store';

export type Lang = 'en' | 'fr';

export interface Settings {
	ttsEnabled: boolean;
	lang: Lang;
}

const STORAGE_KEY = 'aegis_settings';

const defaults: Settings = {
	ttsEnabled: false,
	lang: 'en',
};

function loadFromStorage(): Settings {
	if (typeof localStorage === 'undefined') return { ...defaults };
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return { ...defaults };
	try {
		return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) };
	} catch {
		return { ...defaults };
	}
}

function createSettingsStore() {
	const { subscribe, update } = writable<Settings>(loadFromStorage());

	function save(value: Settings): void {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		}
	}

	return {
		subscribe,

		/** Toggle TTS on / off and persist. */
		toggleTTS(): void {
			update((s) => {
				const updated = { ...s, ttsEnabled: !s.ttsEnabled };
				save(updated);
				return updated;
			});
		},

		/** Switch the UI language and persist. */
		setLang(lang: Lang): void {
			update((s) => {
				const updated = { ...s, lang };
				save(updated);
				return updated;
			});
		},
	};
}

export const settingsStore = createSettingsStore();
