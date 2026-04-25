import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** Whether Supabase has been configured with real credentials. */
export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured && typeof window !== 'undefined') {
	console.warn(
		'[Aegis] Supabase is not configured. Community features will be unavailable.\n' +
		'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
	);
}

/**
 * Client-side Supabase client using the public anon key.
 * Row Level Security policies on the `community_builds` table enforce access control:
 *   - Anyone can INSERT (submit) a build order with status='pending'
 *   - Anyone can SELECT builds with status='approved'
 *   - Only authenticated admins can UPDATE/DELETE rows
 *
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
 * Community features are gracefully disabled when credentials are absent.
 */
export const supabase = createClient(
	supabaseUrl || 'https://placeholder.supabase.co',
	supabaseAnonKey || 'placeholder',
);

/** Shape of a row in the `community_builds` table. */
export interface CommunityBuild {
	id: string;
	game_id: string;
	name: string;
	author: string | null;
	civilization: string | null;
	difficulty: string | null;
	data: unknown;
	status: 'pending' | 'approved' | 'rejected';
	submitted_at: string;
	moderated_at: string | null;
	moderator_notes: string | null;
	submitter_email: string | null;
}
