import type { BuildOrder, Catalog } from '@aegis/core';
import catalogJson from '@aegis/data/catalog.json';
import aoe2FastCastle from '@aegis/data/aoe2/fast_castle.json';
import aomZeusRush from '@aegis/data/aom/zeus_rush.json';

/** The global catalog manifest — games and lightweight BO metadata. */
export const catalog: Catalog = catalogJson as unknown as Catalog;

/**
 * Map of all available build orders keyed by "<gameId>/<boId>".
 * Add new entries here when introducing additional build order files.
 */
export const buildOrderRegistry: Record<string, BuildOrder> = {
	'aoe2/fast_castle': aoe2FastCastle as unknown as BuildOrder,
	'aom/zeus_rush': aomZeusRush as unknown as BuildOrder
};
