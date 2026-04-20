import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { buildOrderSchema } from '@aegis/core';

export const ssr = false;

export const load: PageLoad = ({ url }) => {
	const encoded = url.searchParams.get('data');

	if (!encoded) {
		error(400, 'Paramètre de partage manquant. Le lien est incomplet ou invalide.');
	}

	let decompressed: string;
	try {
		decompressed = decompressFromEncodedURIComponent(encoded) ?? '';
		if (!decompressed) throw new Error('empty');
	} catch {
		return { buildOrder: null, errorMessage: 'Le lien est corrompu et ne peut pas être décompressé.' };
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(decompressed);
	} catch {
		return { buildOrder: null, errorMessage: 'Le lien contient des données invalides (JSON malformé).' };
	}

	const result = buildOrderSchema.safeParse(parsed);

	if (!result.success) {
		const details = result.error.issues.map((i) => i.message).join(' · ');
		return {
			buildOrder: null,
			errorMessage: `Le Build Order importé est invalide ou incompatible avec la version actuelle d'Aegis. Détails : ${details}`,
		};
	}

	return { buildOrder: result.data, errorMessage: null };
};
