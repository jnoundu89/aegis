import { writable } from 'svelte/store';
import type { BuildOrder, Step } from '@aegis/core';

const STORAGE_KEY = 'aegis_draft_bo';

const defaultBuildOrder: BuildOrder = {
	id: 'draft',
	gameId: 'aoe2',
	name: 'Nouvel Ordre de Construction',
	steps: [
		{
			id: 1,
			label: 'Étape 1',
			description: '',
			villagerCount: 0,
			food: 0,
			wood: 0,
			gold: 0,
			stone: 0,
		},
	],
};

function createBuilderStore() {
	const { subscribe, set, update } = writable<BuildOrder>(
		structuredClone(defaultBuildOrder),
	);

	/** Persist the current build order to localStorage. */
	function save(value: BuildOrder): void {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		}
	}

	return {
		subscribe,

		/** Load a previously saved draft from localStorage. */
		load(): void {
			if (typeof localStorage === 'undefined') return;
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			try {
				set(JSON.parse(raw) as BuildOrder);
			} catch {
				// Ignore malformed data
			}
		},

		/** Replace the entire build order and persist. */
		setBuildOrder(bo: BuildOrder): void {
			set(bo);
			save(bo);
		},

		/** Update the build order name. */
		updateName(name: string): void {
			update((bo) => {
				const updated = { ...bo, name };
				save(updated);
				return updated;
			});
		},

		/** Patch a single step by its array index. */
		updateStep(index: number, patch: Partial<Step>): void {
			update((bo) => {
				const steps = bo.steps.map((s, i) =>
					i === index ? { ...s, ...patch } : s,
				);
				const updated = { ...bo, steps };
				save(updated);
				return updated;
			});
		},

		/** Append a new blank step. */
		addStep(): void {
			update((bo) => {
				const lastId = bo.steps.at(-1)?.id ?? 0;
				const newStep: Step = {
					id: lastId + 1,
					label: `Étape ${lastId + 1}`,
					description: '',
					villagerCount: 0,
					food: 0,
					wood: 0,
					gold: 0,
					stone: 0,
				};
				const updated = { ...bo, steps: [...bo.steps, newStep] };
				save(updated);
				return updated;
			});
		},

		/** Remove a step by its array index. */
		removeStep(index: number): void {
			update((bo) => {
				const steps = bo.steps.filter((_, i) => i !== index);
				const updated = { ...bo, steps };
				save(updated);
				return updated;
			});
		},

		/** Reset to default empty draft and clear localStorage. */
		reset(): void {
			const fresh = structuredClone(defaultBuildOrder);
			set(fresh);
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
		},
	};
}

export const builderStore = createBuilderStore();
