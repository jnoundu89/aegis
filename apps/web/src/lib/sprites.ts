/**
 * Sprite / icon registry for Aegis.
 *
 * Each entry maps a well-known key to a visual representation.
 * The `emoji` field is always present as a universal fallback.
 * The optional `url` field can point to a hosted image asset.
 *
 * Keys are stable identifiers used inside JSON build-order files.
 */

export interface SpriteEntry {
  /** Emoji fallback (always shown when no image URL is available) */
  emoji: string;
  /** Human-readable default label */
  label: string;
  /** Optional hosted image URL */
  url?: string;
}

/** Master sprite registry — extend freely as new games / icons are needed. */
export const sprites: Record<string, SpriteEntry> = {
  // ── Units ────────────────────────────────────────────────────────────────
  villager:          { emoji: '🧑‍🌾', label: 'Villager',        url: '/sprites/aoe2/villager.png' },
  scout:             { emoji: '🐎',   label: 'Scout',           url: '/sprites/aoe2/scout.png' },
  archer:            { emoji: '🏹',   label: 'Archer',          url: '/sprites/aoe2/archer.png' },
  spearman:          { emoji: '🗡️',  label: 'Spearman',        url: '/sprites/aoe2/spearman.png' },
  militia:           { emoji: '⚔️',  label: 'Militia',         url: '/sprites/aoe2/militia.png' },
  knight:            { emoji: '🛡️',  label: 'Knight',          url: '/sprites/aoe2/knight.png' },
  cavalry_archer:    { emoji: '🏹🐎', label: 'Cavalry Archer',  url: '/sprites/aoe2/cavalry_archer.png' },
  crossbowman:       { emoji: '🏹',   label: 'Crossbowman',     url: '/sprites/aoe2/crossbowman.png' },
  siege:             { emoji: '💣',   label: 'Siege' },
  monk:              { emoji: '✝️',   label: 'Monk',            url: '/sprites/aoe2/monk.png' },
  // ── Animals / food sources ───────────────────────────────────────────────
  sheep:             { emoji: '🐑',   label: 'Sheep',           url: '/sprites/aoe2/sheep.png' },
  boar:              { emoji: '🐗',   label: 'Boar',            url: '/sprites/aoe2/boar.png' },
  deer:              { emoji: '🦌',   label: 'Deer',            url: '/sprites/aoe2/deer.png' },
  berries:           { emoji: '🫐',   label: 'Berries' },
  fish:              { emoji: '🐟',   label: 'Fish',            url: '/sprites/aoe2/fish.png' },
  farm:              { emoji: '🌾',   label: 'Farm' },
  // ── Resources ────────────────────────────────────────────────────────────
  food:              { emoji: '🍖',   label: 'Food' },
  wood:              { emoji: '🪵',   label: 'Wood' },
  gold:              { emoji: '🪙',   label: 'Gold' },
  stone:             { emoji: '🪨',   label: 'Stone' },
  favor:             { emoji: '⚡',   label: 'Favor' },
  // ── Buildings ────────────────────────────────────────────────────────────
  house:             { emoji: '🏠',   label: 'House',           url: '/sprites/aoe2/house.png' },
  mill:              { emoji: '🏭',   label: 'Mill',            url: '/sprites/aoe2/mill.png' },
  lumber_camp:       { emoji: '🪓',   label: 'Lumber Camp',     url: '/sprites/aoe2/lumber_camp.png' },
  mining_camp:       { emoji: '⛏️',  label: 'Mining Camp',     url: '/sprites/aoe2/mining_camp.png' },
  town_center:       { emoji: '🏰',   label: 'Town Center',     url: '/sprites/aoe2/town_center.png' },
  barracks:          { emoji: '🏯',   label: 'Barracks',        url: '/sprites/aoe2/barracks.png' },
  range:             { emoji: '🎯',   label: 'Range',           url: '/sprites/aoe2/range.png' },
  stable:            { emoji: '🐴',   label: 'Stable',          url: '/sprites/aoe2/stable.png' },
  blacksmith:        { emoji: '🔨',   label: 'Blacksmith',      url: '/sprites/aoe2/blacksmith.png' },
  market:            { emoji: '🏪',   label: 'Market',          url: '/sprites/aoe2/market.png' },
  monastery:         { emoji: '⛪',   label: 'Monastery',       url: '/sprites/aoe2/monastery.png' },
  castle:            { emoji: '🏰',   label: 'Castle',          url: '/sprites/aoe2/castle.png' },
  university:        { emoji: '🎓',   label: 'University',      url: '/sprites/aoe2/university.png' },
  siege_workshop:    { emoji: '⚙️',  label: 'Siege Workshop',  url: '/sprites/aoe2/siege_workshop.png' },
  watch_tower:       { emoji: '🗼',   label: 'Watch Tower',     url: '/sprites/aoe2/watch_tower.png' },
  palisade_wall:     { emoji: '🧱',   label: 'Palisade Wall',   url: '/sprites/aoe2/palisade_wall.png' },
  stone_wall:        { emoji: '🧱',   label: 'Stone Wall',      url: '/sprites/aoe2/stone_wall.png' },
  gate:              { emoji: '🚪',   label: 'Gate' },
  // ── Technologies ─────────────────────────────────────────────────────────
  loom:              { emoji: '🧵',   label: 'Loom',            url: '/sprites/aoe2/loom.png' },
  double_bit_axe:    { emoji: '🪓',   label: 'Double-Bit Axe',  url: '/sprites/aoe2/double_bit_axe.png' },
  horse_collar:      { emoji: '🔗',   label: 'Horse Collar',    url: '/sprites/aoe2/horse_collar.png' },
  fletching:         { emoji: '🪶',   label: 'Fletching',       url: '/sprites/aoe2/fletching.png' },
  bodkin_arrow:      { emoji: '🪶',   label: 'Bodkin Arrow',    url: '/sprites/aoe2/bodkin_arrow.png' },
  bow_saw:           { emoji: '🪚',   label: 'Bow Saw',         url: '/sprites/aoe2/bow_saw.png' },
  wheelbarrow:       { emoji: '🛒',   label: 'Wheelbarrow',     url: '/sprites/aoe2/wheelbarrow.png' },
  bloodlines:        { emoji: '🩸',   label: 'Bloodlines',      url: '/sprites/aoe2/bloodlines.png' },
  husbandry:         { emoji: '🐴',   label: 'Husbandry',       url: '/sprites/aoe2/husbandry.png' },
  gold_mining:       { emoji: '⛏️',  label: 'Gold Mining',     url: '/sprites/aoe2/gold_mining.png' },
  crossbow:          { emoji: '🏹',   label: 'Crossbow',        url: '/sprites/aoe2/crossbow.png' },
  // ── Age-up ───────────────────────────────────────────────────────────────
  feudal_age:        { emoji: '🏰',   label: 'Feudal Age',      url: '/sprites/aoe2/feudal_age.png' },
  castle_age:        { emoji: '⚔️',  label: 'Castle Age',      url: '/sprites/aoe2/castle_age.png' },
  imperial_age:      { emoji: '👑',   label: 'Imperial Age',    url: '/sprites/aoe2/imperial_age.png' },
  // ── AoM specific ─────────────────────────────────────────────────────────
  favor_aom:         { emoji: '⚡',   label: 'Favor' },
  temple:            { emoji: '🏛️',  label: 'Temple' },
  armory:            { emoji: '🛡️',  label: 'Armory' },
  bolt:              { emoji: '⚡',   label: 'Bolt' },
};

/**
 * Resolve a sprite key to its entry (falls back to a generic icon if unknown).
 */
export function getSprite(key: string): SpriteEntry {
  return sprites[key] ?? { emoji: '❓', label: key };
}
