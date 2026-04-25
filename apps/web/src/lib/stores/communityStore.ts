import { writable } from 'svelte/store';
import { supabase, supabaseConfigured } from '$lib/supabase';
import type { CommunityBuild } from '$lib/supabase';

function createCommunityStore() {
	const { subscribe, set } = writable<CommunityBuild[]>([]);
	let loading = writable(false);
	let error = writable<string | null>(null);

	return {
		subscribe,
		loading: { subscribe: loading.subscribe },
		error: { subscribe: error.subscribe },

		/** Fetch all approved community builds from Supabase. */
		async load(): Promise<void> {
			if (!supabaseConfigured) {
				error.set('Community features are unavailable: Supabase is not configured.');
				return;
			}
			loading.set(true);
			error.set(null);
			const { data, error: err } = await supabase
				.from('community_builds')
				.select('id, game_id, name, author, civilization, difficulty, data, status, submitted_at')
				.eq('status', 'approved')
				.order('submitted_at', { ascending: false });

			if (err) {
				error.set(err.message);
			} else {
				set((data ?? []) as CommunityBuild[]);
			}
			loading.set(false);
		},

		/** Submit a new build order for community review. Returns the tracking ID or throws. */
		async submit(payload: {
			gameId: string;
			name: string;
			author: string | null;
			civilization: string | null;
			difficulty: string | null;
			data: unknown;
			submitterEmail: string | null;
		}): Promise<string> {
			if (!supabaseConfigured) {
				throw new Error('Community features are unavailable: Supabase is not configured.');
			}
			const { data, error: err } = await supabase
				.from('community_builds')
				.insert({
					game_id: payload.gameId,
					name: payload.name,
					author: payload.author,
					civilization: payload.civilization,
					difficulty: payload.difficulty,
					data: payload.data,
					status: 'pending',
					submitter_email: payload.submitterEmail,
				})
				.select('id')
				.single();

			if (err) {
				const detail = err.details ? ` (${err.details})` : '';
				throw new Error(`${err.message}${detail}`);
			}
			return (data as { id: string }).id;
		},
	};
}

export const communityStore = createCommunityStore();
