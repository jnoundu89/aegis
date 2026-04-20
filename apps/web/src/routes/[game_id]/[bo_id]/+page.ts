import type { PageLoad } from './$types';
import { buildOrderRegistry } from '$lib/registry';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	const key = `${params.game_id}/${params.bo_id}`;
	const buildOrder = buildOrderRegistry[key];
	if (!buildOrder) {
		error(404, `Build order "${params.bo_id}" not found for game "${params.game_id}".`);
	}
	return { buildOrder };
};
