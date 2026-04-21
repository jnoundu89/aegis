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
  villager:          { emoji: '🧑‍🌾', label: 'Villager' },
  scout:             { emoji: '🐎', label: 'Scout' },
  archer:            { emoji: '🏹', label: 'Archer' },
  spearman:          { emoji: '🗡️', label: 'Spearman' },
  militia:           { emoji: '⚔️', label: 'Militia' },
  knight:            { emoji: '🛡️', label: 'Knight' },
  cavalry_archer:    { emoji: '🏹🐎', label: 'Cavalry Archer' },
  crossbowman:       { emoji: '🏹', label: 'Crossbowman' },
  siege:             { emoji: '💣', label: 'Siege' },
  monk:              { emoji: '✝️', label: 'Monk' },
  // ── Animals / food sources ───────────────────────────────────────────────
  sheep:             { emoji: '🐑', label: 'Sheep' },
  boar:              { emoji: '🐗', label: 'Boar' },
  deer:              { emoji: '🦌', label: 'Deer' },
  berries:           { emoji: '🫐', label: 'Berries' },
  fish:              { emoji: '🐟', label: 'Fish' },
  farm:              { emoji: '🌾', label: 'Farm' },
  // ── Resources ────────────────────────────────────────────────────────────
  food:              { emoji: '🍖', label: 'Food' },
  wood:              { emoji: '🪵', label: 'Wood' },
  gold:              { emoji: '🪙', label: 'Gold' },
  stone:             { emoji: '🪨', label: 'Stone' },
  favor:             { emoji: '⚡', label: 'Favor' },
  // ── Buildings ────────────────────────────────────────────────────────────
  house:             { emoji: '🏠', label: 'House' },
  mill:              { emoji: '🏭', label: 'Mill' },
  lumber_camp:       { emoji: '🪓', label: 'Lumber Camp' },
  mining_camp:       { emoji: '⛏️', label: 'Mining Camp' },
  town_center:       { emoji: '🏰', label: 'Town Center' },
  barracks:          { emoji: '🏯', label: 'Barracks' },
  range:             { emoji: '🎯', label: 'Range' },
  stable:            { emoji: '🐴', label: 'Stable' },
  blacksmith:        { emoji: '🔨', label: 'Blacksmith' },
  market:            { emoji: '🏪', label: 'Market' },
  monastery:         { emoji: '⛪', label: 'Monastery' },
  castle:            { emoji: '🏰', label: 'Castle' },
  university:        { emoji: '🎓', label: 'University' },
  siege_workshop:    { emoji: '⚙️', label: 'Siege Workshop' },
  watch_tower:       { emoji: '🗼', label: 'Watch Tower' },
  palisade_wall:     { emoji: '🧱', label: 'Palisade Wall' },
  stone_wall:        { emoji: '🧱', label: 'Stone Wall' },
  gate:              { emoji: '🚪', label: 'Gate' },
  // ── Technologies ─────────────────────────────────────────────────────────
  loom:              { emoji: '🧵', label: 'Loom' },
  double_bit_axe:    { emoji: '🪓', label: 'Double-Bit Axe' },
  horse_collar:      { emoji: '🔗', label: 'Horse Collar' },
  fletching:         { emoji: '🪶', label: 'Fletching' },
  bodkin_arrow:      { emoji: '🪶', label: 'Bodkin Arrow' },
  bow_saw:           { emoji: '🪚', label: 'Bow Saw' },
  wheelbarrow:       { emoji: '🛒', label: 'Wheelbarrow' },
  bloodlines:        { emoji: '🩸', label: 'Bloodlines' },
  husbandry:         { emoji: '🐴', label: 'Husbandry' },
  gold_mining:       { emoji: '⛏️', label: 'Gold Mining' },
  crossbow:          { emoji: '🏹', label: 'Crossbow' },
  // ── Age-up ───────────────────────────────────────────────────────────────
  feudal_age:        { emoji: '🏰', label: 'Feudal Age' },
  castle_age:        { emoji: '⚔️', label: 'Castle Age' },
  imperial_age:      { emoji: '👑', label: 'Imperial Age' },
  // ── AoM specific ─────────────────────────────────────────────────────────
  favor_aom:         { emoji: '⚡', label: 'Favor' },
  temple:            { emoji: '🏛️', label: 'Temple' },
  armory:            { emoji: '🛡️', label: 'Armory' },
  bolt:              { emoji: '⚡', label: 'Bolt' },
};

/**
 * Resolve a sprite key to its entry (falls back to a generic icon if unknown).
 */
export function getSprite(key: string): SpriteEntry {
  return sprites[key] ?? { emoji: '❓', label: key };
}
