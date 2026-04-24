#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# download-sprites.sh
#
# Downloads official Age of Empires II: Definitive Edition icons from the
# Age of Empires wiki (ageofempires.fandom.com) and saves them as local PNGs
# under apps/web/static/sprites/aoe2/.
#
# Usage (from repo root):
#   bash apps/web/static/sprites/aoe2/download-sprites.sh
#
# Images are used by the Aegis sprite registry (apps/web/src/lib/sprites.ts).
# The emoji fallback in sprites.ts is shown automatically when an image file
# is missing or fails to load in the browser.
#
# Age of Empires II © Microsoft Corporation. Images used under Microsoft's
# Game Content Usage Rules: https://www.xbox.com/en-us/developers/rules
# ---------------------------------------------------------------------------

set -euo pipefail

DEST="$(cd "$(dirname "$0")" && pwd)"

download() {
  local key="$1"
  local url="$2"
  local out="$DEST/$key.png"
  if [[ -f "$out" ]]; then
    echo "  skip  $key.png (already exists)"
    return
  fi
  echo "  fetch $key.png"
  curl -sSL --retry 3 -o "$out" "$url" || echo "  WARN  failed to download $key"
}

echo "Downloading AoE2 DE sprites to: $DEST"
echo ""

# ── Units ──────────────────────────────────────────────────────────────────
download villager        "https://static.wikia.nocookie.net/ageofempires/images/c/ca/Villager_aoe2DE.png/revision/latest"
download scout           "https://static.wikia.nocookie.net/ageofempires/images/6/62/Scout_Cavalry_aoe2DE.png/revision/latest"
download archer          "https://static.wikia.nocookie.net/ageofempires/images/d/dd/Archer_aoe2DE.png/revision/latest"
download spearman        "https://static.wikia.nocookie.net/ageofempires/images/5/5b/Spearman_aoe2DE.png/revision/latest"
download militia         "https://static.wikia.nocookie.net/ageofempires/images/6/63/Militia_aoe2DE.png/revision/latest"
download knight          "https://static.wikia.nocookie.net/ageofempires/images/7/7e/Knight_aoe2DE.png/revision/latest"
download cavalry_archer  "https://static.wikia.nocookie.net/ageofempires/images/e/ec/Cavalry_Archer_aoe2DE.png/revision/latest"
download crossbowman     "https://static.wikia.nocookie.net/ageofempires/images/d/d1/Crossbowman_aoe2DE.png/revision/latest"
download monk            "https://static.wikia.nocookie.net/ageofempires/images/e/e9/Monk_aoe2DE.png/revision/latest"

# ── Animals / food sources ─────────────────────────────────────────────────
download boar            "https://static.wikia.nocookie.net/ageofempires/images/b/b7/Boar_prev_aoe2de.png/revision/latest"
download sheep           "https://static.wikia.nocookie.net/ageofempires/images/5/5a/Sheep_aoe2DE.png/revision/latest"
download deer            "https://static.wikia.nocookie.net/ageofempires/images/5/57/Deer_aoe2DE.png/revision/latest"
download fish            "https://static.wikia.nocookie.net/ageofempires/images/7/74/Fish_aoe2DE.png/revision/latest"

# ── Buildings ──────────────────────────────────────────────────────────────
download town_center     "https://static.wikia.nocookie.net/ageofempires/images/5/5f/Town_Center_aoe2DE.png/revision/latest"
download barracks        "https://static.wikia.nocookie.net/ageofempires/images/5/50/Barracks_aoe2DE.png/revision/latest"
download range           "https://static.wikia.nocookie.net/ageofempires/images/7/73/Archery_Range_aoe2DE.png/revision/latest"
download stable          "https://static.wikia.nocookie.net/ageofempires/images/2/2d/Stable_aoe2DE.png/revision/latest"
download blacksmith      "https://static.wikia.nocookie.net/ageofempires/images/e/ee/Blacksmith_aoe2DE.png/revision/latest"
download market          "https://static.wikia.nocookie.net/ageofempires/images/3/3b/Market_aoe2DE.png/revision/latest"
download monastery       "https://static.wikia.nocookie.net/ageofempires/images/e/ee/Monastery_aoe2DE.png/revision/latest"
download mill            "https://static.wikia.nocookie.net/ageofempires/images/c/ca/Mill_aoe2DE.png/revision/latest"
download lumber_camp     "https://static.wikia.nocookie.net/ageofempires/images/7/73/Lumber_Camp_aoe2DE.png/revision/latest"
download mining_camp     "https://static.wikia.nocookie.net/ageofempires/images/4/4a/Mining_Camp_aoe2DE.png/revision/latest"
download house           "https://static.wikia.nocookie.net/ageofempires/images/3/37/House_aoe2DE.png/revision/latest"
download castle          "https://static.wikia.nocookie.net/ageofempires/images/3/36/Castle_aoe2DE.png/revision/latest"
download siege_workshop  "https://static.wikia.nocookie.net/ageofempires/images/a/ab/Siege_Workshop_aoe2DE.png/revision/latest"
download university      "https://static.wikia.nocookie.net/ageofempires/images/f/f4/University_aoe2DE.png/revision/latest"
download watch_tower     "https://static.wikia.nocookie.net/ageofempires/images/5/54/Watch_Tower_aoe2DE.png/revision/latest"
download palisade_wall   "https://static.wikia.nocookie.net/ageofempires/images/3/37/Palisade_Wall_aoe2DE.png/revision/latest"
download stone_wall      "https://static.wikia.nocookie.net/ageofempires/images/9/97/Stone_Wall_aoe2DE.png/revision/latest"

# ── Technologies ───────────────────────────────────────────────────────────
download loom            "https://static.wikia.nocookie.net/ageofempires/images/e/e3/Loom_aoe2DE.png/revision/latest"
download double_bit_axe  "https://static.wikia.nocookie.net/ageofempires/images/f/f9/Double-Bit_Axe_aoe2DE.png/revision/latest"
download horse_collar    "https://static.wikia.nocookie.net/ageofempires/images/c/c6/Horse_Collar_aoe2DE.png/revision/latest"
download wheelbarrow     "https://static.wikia.nocookie.net/ageofempires/images/e/ea/Wheelbarrow_aoe2DE.png/revision/latest"
download bloodlines      "https://static.wikia.nocookie.net/ageofempires/images/e/e8/Bloodlines_aoe2DE.png/revision/latest"
download fletching       "https://static.wikia.nocookie.net/ageofempires/images/9/95/Fletching_aoe2DE.png/revision/latest"
download bow_saw         "https://static.wikia.nocookie.net/ageofempires/images/a/a3/Bow_Saw_aoe2DE.png/revision/latest"
download husbandry       "https://static.wikia.nocookie.net/ageofempires/images/5/52/Husbandry_aoe2DE.png/revision/latest"
download gold_mining     "https://static.wikia.nocookie.net/ageofempires/images/c/cd/Gold_Mining_aoe2DE.png/revision/latest"
download crossbow        "https://static.wikia.nocookie.net/ageofempires/images/c/c4/Crossbow_aoe2DE.png/revision/latest"
download bodkin_arrow    "https://static.wikia.nocookie.net/ageofempires/images/7/7b/Bodkin_Arrow_aoe2DE.png/revision/latest"

# ── Age-up ─────────────────────────────────────────────────────────────────
download feudal_age      "https://static.wikia.nocookie.net/ageofempires/images/6/60/Feudal_Age_aoe2DE.png/revision/latest"
download castle_age      "https://static.wikia.nocookie.net/ageofempires/images/7/78/Castle_Age_aoe2DE.png/revision/latest"
download imperial_age    "https://static.wikia.nocookie.net/ageofempires/images/3/33/Imperial_Age_aoe2DE.png/revision/latest"

echo ""
echo "Done. $(ls "$DEST"/*.png 2>/dev/null | wc -l) PNG file(s) present in $DEST"
