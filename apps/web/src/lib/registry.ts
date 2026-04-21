import type { BuildOrder, Catalog } from '@aegis/core';
import catalogJson from '@aegis/data/catalog.json';
import aoe2FastCastle from '@aegis/data/aoe2/fast_castle.json';
import aoe2FastArcherHera from '@aegis/data/aoe2/fast_archer_hera.json';
import aoe2FastArcherCapoch from '@aegis/data/aoe2/fast_archer_capoch.json';
import aoe2ScoutsCavalryArchers from '@aegis/data/aoe2/scouts_cavalry_archers.json';
import aoe2FastCastleCeltsHoang from '@aegis/data/aoe2/fast_castle_celts_hoang.json';
import aomZeusRush from '@aegis/data/aom/zeus_rush.json';

/** The global catalog manifest — games and lightweight BO metadata. */
export const catalog: Catalog = catalogJson as unknown as Catalog;

/**
 * Map of all available build orders keyed by "<gameId>/<boId>".
 * Add new entries here when introducing additional build order files.
 */
export const buildOrderRegistry: Record<string, BuildOrder> = {
	'aoe2/fast_castle': aoe2FastCastle as unknown as BuildOrder,
	'aoe2/fast_archer_hera': aoe2FastArcherHera as unknown as BuildOrder,
	'aoe2/fast_archer_capoch': aoe2FastArcherCapoch as unknown as BuildOrder,
	'aoe2/scouts_cavalry_archers': aoe2ScoutsCavalryArchers as unknown as BuildOrder,
	'aoe2/fast_castle_celts_hoang': aoe2FastCastleCeltsHoang as unknown as BuildOrder,
	'aom/zeus_rush': aomZeusRush as unknown as BuildOrder
};
