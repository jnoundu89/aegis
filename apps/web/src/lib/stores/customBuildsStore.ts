import { writable } from 'svelte/store';
import type { BuildOrder } from '@aegis/core';

const STORAGE_KEY = 'aegis_custom_builds';

function loadFromStorage(): BuildOrder[] {
	if (typeof localStorage === 'undefined') return [];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as BuildOrder[];
	} catch {
		return [];
	}
}

function createCustomBuildsStore() {
	const { subscribe, set, update } = writable<BuildOrder[]>([]);

	return {
		subscribe,

		/** Load saved custom builds from localStorage. */
		load(): void {
			set(loadFromStorage());
		},

		/** Save a build order to the custom builds list. */
		save(bo: BuildOrder): void {
			update((builds) => {
				// Replace if same id already exists, otherwise append
				const exists = builds.some((b) => b.id === bo.id);
				const updated = exists
					? builds.map((b) => (b.id === bo.id ? bo : b))
					: [...builds, bo];
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},

		/** Remove a build order by id. */
		remove(id: string): void {
			update((builds) => {
				const updated = builds.filter((b) => b.id !== id);
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
	};
}

export const customBuildsStore = createCustomBuildsStore();
