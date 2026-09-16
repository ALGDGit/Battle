/** Countable bag items (meat is handled separately). */
export type InventoryConfigEntry = {
  key: string;
  asset: string;
  alt: string;
  label: string;
  name: string;
  /** Battle-buff consumable key (legacy). */
  activeKey?: string;
  /** Immediate use effect outside/at end of battle. */
  useEffect?: "healFull" | "heal" | "happiness" | "nightmareBurrito" | "gainLife" | "gearUp" | "weight" | "zoneBuff" | "attributes" | "xAntibody" | "opponentDebuff" | "playerBuff" | "cleanse" | "care";
  /** HP restored when `useEffect` is `"heal"`. */
  healAmount?: number;
  /** Weight gained when `useEffect` is `"weight"`. */
  weightAmount?: number;
  /** Discipline / Happiness / Alignment changes when `useEffect` is `"care"`. */
  careGains?: {
    discipline?: number;
    happiness?: number;
    alignment?: number;
  };
  /** Stat buffed when `useEffect` is `"zoneBuff"`. */
  zoneBuffStat?: "attack" | "defense" | "speed" | "intelligence";
  /** Debuffs applied to the foe when `useEffect` is `"opponentDebuff"`. Includes stat debuffs. */
  opponentDebuffs?: readonly (
    | "exposed"
    | "slow"
    | "weak"
    | "distracted"
    | "asleep"
    | "poisoned"
    | "burned"
    | "confused"
    | "demoralized"
    | "silenced"
    | "blinded"
    | "inverted"
    | "negativepole"
    | "cursed"
    | "marked"
    | "drained"
    | "bound"
    | "deepwound"
    | "infatuated"
  )[];
  /** Buffs applied to you when `useEffect` is `"playerBuff"`. */
  playerBuffs?: readonly (
    | "vampirism"
    | "thorns"
    | "reflector"
    | "immune"
    | "reckless"
    | "positivepole"
  )[];
  /** Permanent attribute gains when `useEffect` is `"attributes"`. */
  attributeGains?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    intelligence?: number;
  };
};

export type InventoryItemCategory = "heal" | "debuff" | "statDebuff" | "buff" | "statBuff" | "other";

const STAT_DEBUFF_IDS = new Set(["exposed", "slow", "weak", "distracted"]);

export function isStatDebuffId(id: string): boolean {
  return STAT_DEBUFF_IDS.has(id);
}

export function getInventoryItemCategories(
  item: Pick<InventoryConfigEntry, "useEffect" | "opponentDebuffs"> | null | undefined
): InventoryItemCategory[] {
  const effect = item?.useEffect;
  if (effect === "heal" || effect === "healFull" || effect === "cleanse") {
    return ["heal"];
  }
  if (effect === "opponentDebuff") {
    const effects = item?.opponentDebuffs || [];
    const categories: InventoryItemCategory[] = [];
    if (effects.some((entry) => !isStatDebuffId(entry))) {
      categories.push("debuff");
    }
    if (effects.some((entry) => isStatDebuffId(entry))) {
      categories.push("statDebuff");
    }
    return categories.length ? categories : ["debuff"];
  }
  if (effect === "playerBuff") {
    return ["buff"];
  }
  if (effect === "zoneBuff" || effect === "gearUp") {
    return ["statBuff"];
  }
  return ["other"];
}

export function getInventoryItemCategory(
  item: Pick<InventoryConfigEntry, "useEffect" | "opponentDebuffs"> | null | undefined
): InventoryItemCategory {
  return getInventoryItemCategories(item)[0] || "other";
}

export function formatCareGainText(
  gains: InventoryConfigEntry["careGains"] | null | undefined
): string {
  const parts: string[] = [];
  const push = (label: string, value: number | undefined) => {
    if (!value) {
      return;
    }
    parts.push(`${label} ${value > 0 ? "+" : ""}${value}`);
  };
  push("Discipline", gains?.discipline);
  push("Happiness", gains?.happiness);
  push("Alignment", gains?.alignment);
  return parts.join(". ");
}

/** Chance to roll one wild-win item after beating a zone encounter. */
export const WILD_WIN_ITEM_DROP_CHANCE = 0.05;

/** Max copies of each usable inventory item. */
export const MAX_CONSUMABLE_STACK = 5;

const STATUS_DROP_ALIASES: Record<string, string> = {
  sleep: "asleep",
  asleep: "asleep",
  dormido: "asleep",
  poison: "poisoned",
  poisoned: "poisoned",
  burn: "burned",
  burned: "burned",
  quemado: "burned",
  confuse: "confused",
  confused: "confused",
  confuso: "confused",
  demoralize: "demoralized",
  demoralized: "demoralized",
  desmoralizado: "demoralized",
  silence: "silenced",
  silenced: "silenced",
  silenciado: "silenced",
  blind: "blinded",
  blinded: "blinded",
  cegado: "blinded",
  invert: "inverted",
  inverted: "inverted",
  invertido: "inverted",
  "negative pole": "negativepole",
  "negative-pole": "negativepole",
  negativepole: "negativepole",
  curse: "cursed",
  cursed: "cursed",
  mark: "marked",
  marked: "marked",
  drain: "drained",
  drained: "drained",
  bind: "bound",
  bound: "bound",
  "deep wound": "deepwound",
  "deep-wound": "deepwound",
  deepwound: "deepwound",
  infatuate: "infatuated",
  infatuated: "infatuated",
  weak: "weak",
  exposed: "exposed",
  slow: "slow",
  distracted: "distracted",
  vampirism: "vampirism",
  vampire: "vampirism",
  thorns: "thorns",
  reflector: "reflector",
  reflect: "reflector",
  immune: "immune",
  immunity: "immune",
  reckless: "reckless",
  "positive pole": "positivepole",
  "positive-pole": "positivepole",
  positivepole: "positivepole",
};

function normalizeDropStatusId(status: string | null | undefined): string | null {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!normalized || normalized === "none") {
    return null;
  }
  return STATUS_DROP_ALIASES[normalized] || normalized;
}

function isPureStatDebuffItem(item: InventoryConfigEntry): boolean {
  return (
    item.useEffect === "opponentDebuff" &&
    Boolean(item.opponentDebuffs?.length) &&
    (item.opponentDebuffs || []).every((entry) => isStatDebuffId(entry))
  );
}

export function getWildDropHealKey(tier: number): "smallHeal" | "mediumHeal" | "largeHeal" {
  const rank = Math.max(1, Math.floor(Number(tier) || 1));
  if (rank <= 2) {
    return "smallHeal";
  }
  if (rank <= 4) {
    return "mediumHeal";
  }
  return "largeHeal";
}

export const INVENTORY_CONFIG: readonly InventoryConfigEntry[] = [
  {
    key: "potion",
    asset: "data/ui/food_potion.png",
    alt: "Potion",
    label: "Potion: Restores HP to full.",
    name: "Potion",
    useEffect: "healFull",
  },
  {
    key: "smallHeal",
    asset: "data/ui/food_small_heal.png",
    alt: "Small Heal",
    label: "Small Heal: Restores 5 HP.",
    name: "Small Heal",
    useEffect: "heal",
    healAmount: 5,
  },
  {
    key: "mediumHeal",
    asset: "data/ui/food_medium_heal.png",
    alt: "Medium Heal",
    label: "Medium Heal: Restores 15 HP.",
    name: "Medium Heal",
    useEffect: "heal",
    healAmount: 15,
  },
  {
    key: "largeHeal",
    asset: "data/ui/food_large_heal.png",
    alt: "Large Heal",
    label: "Large Heal: Restores 20 HP.",
    name: "Large Heal",
    useEffect: "heal",
    healAmount: 20,
  },
  {
    key: "happyMushroom",
    asset: "data/ui/food_happy_mushroom.png",
    alt: "Happy Mushroom",
    label: "Happy Mushroom: +1 Happiness.",
    name: "Happy Mushroom",
    useEffect: "happiness",
  },
  {
    key: "nightmareBurrito",
    asset: "data/ui/food_nightmare_burrito.png",
    alt: "Nightmare Burrito",
    label: "Nightmare Burrito: Alignment -2. Evolves Monzaemon.",
    name: "Nightmare Burrito",
    useEffect: "nightmareBurrito",
  },
  {
    key: "eternalApple",
    asset: "data/ui/food_eternal_apple.png",
    alt: "Eternal Apple",
    label: "Eternal Apple: +1 Life.",
    name: "Eternal Apple",
    useEffect: "gainLife",
  },
  {
    key: "gearUp",
    asset: "data/ui/food_gear_up.png",
    alt: "Gear Up!",
    label: "Gear Up!: All battle buffs.",
    name: "Gear Up!",
    useEffect: "gearUp",
  },
  {
    key: "digiseabass",
    asset: "data/ui/food_digiseabass.png",
    alt: "Digiseabass",
    label: "Digiseabass: +5 Weight.",
    name: "Digiseabass",
    useEffect: "weight",
    weightAmount: 5,
  },
  {
    key: "digisardine",
    asset: "data/ui/food_digisardine.png",
    alt: "Digisardine",
    label: "Digisardine: +2 Weight.",
    name: "Digisardine",
    useEffect: "weight",
    weightAmount: 2,
  },
  {
    key: "burntMeat",
    asset: "data/ui/food_burnt_meat.png",
    alt: "Burnt Meat",
    label: "Burnt Meat: +2 Weight.",
    name: "Burnt Meat",
    useEffect: "weight",
    weightAmount: 2,
  },
  {
    key: "digichampignon",
    asset: "data/ui/food_digichampignon.png",
    alt: "Digichampignon",
    label: "Digichampignon: +2 Weight.",
    name: "Digichampignon",
    useEffect: "weight",
    weightAmount: 2,
  },
  {
    key: "sirloin",
    asset: "data/ui/food_sirloin.png",
    alt: "Sirloin",
    label: "Sirloin: +3 Weight.",
    name: "Sirloin",
    useEffect: "weight",
    weightAmount: 3,
  },
  {
    key: "mistFruit",
    asset: "data/ui/food_mist_fruit.png",
    alt: "Mist Fruit",
    label: "Mist Fruit: +4 Weight.",
    name: "Mist Fruit",
    useEffect: "weight",
    weightAmount: 4,
  },
  {
    key: "mcWhopper",
    asset: "data/ui/food_mc_whopper.png",
    alt: "McWhopper",
    label: "McWhopper: +5 Weight.",
    name: "McWhopper",
    useEffect: "weight",
    weightAmount: 5,
  },
  {
    key: "lollipop",
    asset: "data/ui/food_lollipop.png",
    alt: "Lollipop",
    label: "Lollipop: +4 Weight.",
    name: "Lollipop",
    useEffect: "weight",
    weightAmount: 4,
  },
  {
    key: "boltSandwich",
    asset: "data/ui/food_bolt_sandwich.png",
    alt: "Bolt Sandwich",
    label: "Bolt Sandwich: +4 Weight.",
    name: "Bolt Sandwich",
    useEffect: "weight",
    weightAmount: 4,
  },
  {
    key: "mixedBerries",
    asset: "data/ui/food_mixed_berries.png",
    alt: "Mixed Berries",
    label: "Mixed Berries: +2 Weight.",
    name: "Mixed Berries",
    useEffect: "weight",
    weightAmount: 2,
  },
  {
    key: "dinofillete",
    asset: "data/ui/food_dinofillete.png",
    alt: "Dinofillete",
    label: "Dinofillete: +4 Weight.",
    name: "Dinofillete",
    useEffect: "weight",
    weightAmount: 4,
  },
  {
    key: "friedCactus",
    asset: "data/ui/food_fried_cactus.png",
    alt: "Fried Cactus",
    label: "Fried Cactus: +3 Weight.",
    name: "Fried Cactus",
    useEffect: "weight",
    weightAmount: 3,
  },
  {
    key: "iceCream",
    asset: "data/ui/food_ice_cream.png",
    alt: "Ice Cream",
    label: "Ice Cream: +3 Weight.",
    name: "Ice Cream",
    useEffect: "weight",
    weightAmount: 3,
  },
  {
    key: "smokedLarva",
    asset: "data/ui/food_smoked_larva.png",
    alt: "Smoked Larva",
    label: "Smoked Larva: +3 Weight.",
    name: "Smoked Larva",
    useEffect: "weight",
    weightAmount: 3,
  },
  {
    key: "sardineSkewer",
    asset: "data/ui/food_sardine_skewer.png",
    alt: "Sardine Skewer",
    label: "Sardine Skewer: +1 Happiness.",
    name: "Sardine Skewer",
    useEffect: "care",
    careGains: { happiness: 1 },
  },
  {
    key: "whitePearl",
    asset: "data/ui/food_white_pearl.png",
    alt: "White Pearl",
    label: "White Pearl: +1 Alignment.",
    name: "White Pearl",
    useEffect: "care",
    careGains: { alignment: 1 },
  },
  {
    key: "charredMeat",
    asset: "data/ui/food_charred_meat.png",
    alt: "Charred Meat",
    label: "Charred Meat: +1 Discipline.",
    name: "Charred Meat",
    useEffect: "care",
    careGains: { discipline: 1 },
  },
  {
    key: "millennialEggs",
    asset: "data/ui/food_millennial_eggs.png",
    alt: "Millennial Eggs",
    label: "Millennial Eggs: +1 Discipline.",
    name: "Millennial Eggs",
    useEffect: "care",
    careGains: { discipline: 1 },
  },
  {
    key: "greenLeaves",
    asset: "data/ui/food_green_leaves.png",
    alt: "Green Leaves",
    label: "Green Leaves: -1 Happiness.",
    name: "Green Leaves",
    useEffect: "care",
    careGains: { happiness: -1 },
  },
  {
    key: "forbiddenFruit",
    asset: "data/ui/food_forbidden_fruit.png",
    alt: "Forbidden Fruit",
    label: "Forbidden Fruit: -1 Alignment.",
    name: "Forbidden Fruit",
    useEffect: "care",
    careGains: { alignment: -1 },
  },
  {
    key: "candies",
    asset: "data/ui/food_candies.png",
    alt: "Candies",
    label: "Candies: +1 Happiness. -1 Discipline.",
    name: "Candies",
    useEffect: "care",
    careGains: { happiness: 1, discipline: -1 },
  },
  {
    key: "metalApple",
    asset: "data/ui/food_metal_apple.png",
    alt: "Metal Apple",
    label: "Metal Apple: -1 Alignment.",
    name: "Metal Apple",
    useEffect: "care",
    careGains: { alignment: -1 },
  },
  {
    key: "rainbowFruit",
    asset: "data/ui/food_rainbow_fruit.png",
    alt: "Rainbow Fruit",
    label: "Rainbow Fruit: +1 Alignment. +1 Happiness. -2 Discipline.",
    name: "Rainbow Fruit",
    useEffect: "care",
    careGains: { alignment: 1, happiness: 1, discipline: -2 },
  },
  {
    key: "prehistoricFruit",
    asset: "data/ui/food_prehistoric_fruit.png",
    alt: "Prehistoric Fruit",
    label: "Prehistoric Fruit: +2 Discipline. -2 Alignment.",
    name: "Prehistoric Fruit",
    useEffect: "care",
    careGains: { discipline: 2, alignment: -2 },
  },
  {
    key: "peyote",
    asset: "data/ui/food_peyote.png",
    alt: "Peyote",
    label: "Peyote: +2 Happiness.",
    name: "Peyote",
    useEffect: "care",
    careGains: { happiness: 2 },
  },
  {
    key: "fressiSuis",
    asset: "data/ui/food_fressi_suis.png",
    alt: "Fressi-suis",
    label: "Fressi-suis: +2 Happiness. -2 Discipline. +2 Alignment.",
    name: "Fressi-suis",
    useEffect: "care",
    careGains: { happiness: 2, discipline: -2, alignment: 2 },
  },
  {
    key: "wormStew",
    asset: "data/ui/food_worm_stew.png",
    alt: "Worm Stew",
    label: "Worm Stew: +3 Discipline. -1 Happiness. -1 Alignment.",
    name: "Worm Stew",
    useEffect: "care",
    careGains: { discipline: 3, happiness: -1, alignment: -1 },
  },
  {
    key: "steroids",
    asset: "data/ui/food_steroids.png",
    alt: "Steroids",
    label: "Steroids: Fortifies Attack.",
    name: "Steroids",
    useEffect: "zoneBuff",
    zoneBuffStat: "attack",
  },
  {
    key: "aspirins",
    asset: "data/ui/food_aspirins.png",
    alt: "Aspirins",
    label: "Aspirins: Protects Defense.",
    name: "Aspirins",
    useEffect: "zoneBuff",
    zoneBuffStat: "defense",
  },
  {
    key: "energyDrink",
    asset: "data/ui/food_energy_drink.png",
    alt: "Energy Drink",
    label: "Energy Drink: Swift Speed.",
    name: "Energy Drink",
    useEffect: "zoneBuff",
    zoneBuffStat: "speed",
  },
  {
    key: "greenPurplePill",
    asset: "data/ui/food_green_purple_pill.png",
    alt: "Green-Purple Pill",
    label: "Green-Purple Pill: Focuses Intelligence.",
    name: "Green-Purple Pill",
    useEffect: "zoneBuff",
    zoneBuffStat: "intelligence",
  },
  {
    key: "perfectHamburger",
    asset: "data/ui/food_perfect_hamburger.png",
    alt: "Perfect Hamburger",
    label:
      "Perfect Hamburger: +1 Attack, +1 Defense, +5 Speed, +5 Intelligence permanently.",
    name: "Perfect Hamburger",
    useEffect: "attributes",
    attributeGains: { attack: 1, defense: 1, speed: 5, intelligence: 5 },
  },
  {
    key: "beerBottle",
    asset: "data/ui/food_beer_bottle.png",
    alt: "Beer Bottle",
    label: "Beer Bottle: +1 HP permanently.",
    name: "Beer Bottle",
    useEffect: "attributes",
    attributeGains: { hp: 1 },
  },
  {
    key: "substanceX",
    asset: "data/ui/food_substance_x.png",
    alt: "Substance X",
    label:
      "Substance X: If this Digimon has an X Antibody form, it evolves into that version (Agumon → Agumon X).",
    name: "Substance X",
    useEffect: "xAntibody",
  },
  {
    key: "unicornHorn",
    asset: "data/ui/food_unicorn_horn.png",
    alt: "Unicorn Horn",
    label: "Unicorn Horn: Exposes Defense, slows Speed, and demoralizes.",
    name: "Unicorn Horn",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["exposed", "slow", "demoralized"],
  },
  {
    key: "goldenBanana",
    asset: "data/ui/food_golden_banana.png",
    alt: "Golden Banana",
    label: "Golden Banana: +10 Speed, −10 Intelligence permanently.",
    name: "Golden Banana",
    useEffect: "attributes",
    attributeGains: { speed: 10, intelligence: -10 },
  },
  {
    key: "phoenixFeather",
    asset: "data/ui/food_phoenix_feather.png",
    alt: "Phoenix Feather",
    label: "Phoenix Feather: +1 Life.",
    name: "Phoenix Feather",
    useEffect: "gainLife",
  },
  {
    key: "morpheusSand",
    asset: "data/ui/food_morpheus_sand.png",
    alt: "Morpheus Sand",
    label: "Morpheus Sand: Sleeps the enemy.",
    name: "Morpheus Sand",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["asleep"],
  },
  {
    key: "poisonIvySeed",
    asset: "data/ui/food_poison_ivy_seed.png",
    alt: "Poison Ivy Seed",
    label: "Poison Ivy Seed: Poisons the enemy.",
    name: "Poison Ivy Seed",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["poisoned"],
  },
  {
    key: "salamanderCoal",
    asset: "data/ui/food_salamander_coal.png",
    alt: "Salamander Coal",
    label: "Salamander Coal: Burns the enemy.",
    name: "Salamander Coal",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["burned"],
  },
  {
    key: "dissonanceBell",
    asset: "data/ui/food_dissonance_bell.png",
    alt: "Dissonance Bell",
    label: "Dissonance Bell: Confuses the enemy.",
    name: "Dissonance Bell",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["confused"],
  },
  {
    key: "terrorDust",
    asset: "data/ui/food_terror_dust.png",
    alt: "Terror Dust",
    label: "Terror Dust: Demoralizes the enemy.",
    name: "Terror Dust",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["demoralized"],
  },
  {
    key: "silenceRune",
    asset: "data/ui/food_silence_rune.png",
    alt: "Silence Rune",
    label: "Silence Rune: Silences the enemy.",
    name: "Silence Rune",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["silenced"],
  },
  {
    key: "basiliskScaleDust",
    asset: "data/ui/food_basilisk_scale_dust.png",
    alt: "Basilisk Scale Dust",
    label: "Basilisk Scale Dust: Blinds the enemy.",
    name: "Basilisk Scale Dust",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["blinded"],
  },
  {
    key: "negativeMagnet",
    asset: "data/ui/food_negative_magnet.png",
    alt: "Negative Magnet",
    label: "Negative Magnet: Applies Negative Pole.",
    name: "Negative Magnet",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["negativepole"],
  },
  {
    key: "blackAndWhitePainting",
    asset: "data/ui/food_black_and_white_painting.png",
    alt: "Black and White Painting",
    label: "Black and White Painting: Inverts healing.",
    name: "Black and White Painting",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["inverted"],
  },
  {
    key: "rosemaryBouquet",
    asset: "data/ui/food_rosemary_bouquet.png",
    alt: "Rosemary Bouquet",
    label: "Rosemary Bouquet: Curses the enemy.",
    name: "Rosemary Bouquet",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["cursed"],
  },
  {
    key: "sights",
    asset: "data/ui/food_sights.png",
    alt: "Sights",
    label: "Sights: Marks the enemy.",
    name: "Sights",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["marked"],
  },
  {
    key: "thirstyDagger",
    asset: "data/ui/food_thirsty_dagger.png",
    alt: "Thirsty Dagger",
    label: "Thirsty Dagger: Drains the enemy.",
    name: "Thirsty Dagger",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["drained"],
  },
  {
    key: "shadowChains",
    asset: "data/ui/food_shadow_chains.png",
    alt: "Shadow Chains",
    label: "Shadow Chains: Binds the enemy.",
    name: "Shadow Chains",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["bound"],
  },
  {
    key: "corkscrew",
    asset: "data/ui/food_corkscrew.png",
    alt: "Corkscrew",
    label: "Corkscrew: Inflicts a Deep Wound.",
    name: "Corkscrew",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["deepwound"],
  },
  {
    key: "playboyMagazine",
    asset: "data/ui/food_playboy_magazine.png",
    alt: "Playboy Magazine",
    label: "Playboy Magazine: Infatuates the enemy.",
    name: "Playboy Magazine",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["infatuated"],
  },
  {
    key: "conservedVampireTooth",
    asset: "data/ui/food_conserved_vampire_tooth.png",
    alt: "Conserved Vampire Tooth",
    label: "Conserved Vampire Tooth: Grants Vampirism.",
    name: "Conserved Vampire Tooth",
    useEffect: "playerBuff",
    playerBuffs: ["vampirism"],
  },
  {
    key: "rose",
    asset: "data/ui/food_rose.png",
    alt: "Rose",
    label: "Rose: Grants Thorns.",
    name: "Rose",
    useEffect: "playerBuff",
    playerBuffs: ["thorns"],
  },
  {
    key: "digitalMirror",
    asset: "data/ui/food_digital_mirror.png",
    alt: "Digital Mirror",
    label: "Digital Mirror: Grants Reflector.",
    name: "Digital Mirror",
    useEffect: "playerBuff",
    playerBuffs: ["reflector"],
  },
  {
    key: "crucifix",
    asset: "data/ui/food_crucifix.png",
    alt: "Crucifix",
    label: "Crucifix: Grants Immune.",
    name: "Crucifix",
    useEffect: "playerBuff",
    playerBuffs: ["immune"],
  },
  {
    key: "genBerserker",
    asset: "data/ui/food_gen_berserker.png",
    alt: "Gen Berserker",
    label: "Gen Berserker: Grants Reckless.",
    name: "Gen Berserker",
    useEffect: "playerBuff",
    playerBuffs: ["reckless"],
  },
  {
    key: "positiveMagnet",
    asset: "data/ui/food_positive_magnet.png",
    alt: "Positive Magnet",
    label: "Positive Magnet: Grants Positive Pole.",
    name: "Positive Magnet",
    useEffect: "playerBuff",
    playerBuffs: ["positivepole"],
  },
  {
    key: "elixir",
    asset: "data/ui/food_elixir.png",
    alt: "Elixir",
    label: "Elixir: Clears all debuffs and stat debuffs.",
    name: "Elixir",
    useEffect: "cleanse",
  },
  {
    key: "fallenEagleFeather",
    asset: "data/ui/food_fallen_eagle_feather.png",
    alt: "Fallen Eagle Feather",
    label: "Fallen Eagle Feather: Weakens the enemy.",
    name: "Fallen Eagle Feather",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["weak"],
  },
  {
    key: "shedSnakeSkin",
    asset: "data/ui/food_shed_snake_skin.png",
    alt: "Shed Snake Skin",
    label: "Shed Snake Skin: Exposes the enemy.",
    name: "Shed Snake Skin",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["exposed"],
  },
  {
    key: "brokenHourglass",
    asset: "data/ui/food_broken_hourglass.png",
    alt: "Broken Hourglass",
    label: "Broken Hourglass: Slows the enemy.",
    name: "Broken Hourglass",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["slow"],
  },
  {
    key: "pendulum",
    asset: "data/ui/food_pendulum.png",
    alt: "Pendulum",
    label: "Pendulum: Distracts the enemy.",
    name: "Pendulum",
    useEffect: "opponentDebuff",
    opponentDebuffs: ["distracted"],
  },
];

/** Dedicated item that applies this special-attack status, if one exists. */
export function findInventoryItemForStatus(
  status: string | null | undefined
): InventoryConfigEntry | undefined {
  const id = normalizeDropStatusId(status);
  if (!id) {
    return undefined;
  }
  const buff = INVENTORY_CONFIG.find(
    (item) =>
      item.useEffect === "playerBuff" &&
      item.playerBuffs?.length === 1 &&
      item.playerBuffs[0] === id
  );
  if (buff) {
    return buff;
  }
  return INVENTORY_CONFIG.find(
    (item) =>
      item.useEffect === "opponentDebuff" &&
      item.opponentDebuffs?.length === 1 &&
      item.opponentDebuffs[0] === id
  );
}

/**
 * Equal-weight wild drop slots. The 5% roll picks one slot, then one item in it.
 * Slot 6 is always an array of special keys and is omitted when that array is empty.
 */
function asDropKeyList(keys: string | readonly string[] | null | undefined): string[] {
  if (!keys) {
    return [];
  }
  const list = typeof keys === "string" ? [keys] : [...keys];
  return [...new Set(list.filter(Boolean))];
}

function listWildWinDropSlots(
  tier: number,
  specialStatus?: string | null,
  specialItemKeys?: string | readonly string[] | null
): string[][] {
  const slots: string[][] = [
    [getWildDropHealKey(tier)],
    INVENTORY_CONFIG.filter((item) => item.useEffect === "zoneBuff").map((item) => item.key),
    INVENTORY_CONFIG.filter(isPureStatDebuffItem).map((item) => item.key),
    INVENTORY_CONFIG.filter((item) => item.useEffect === "playerBuff").map((item) => item.key),
  ];
  const statusItem = findInventoryItemForStatus(specialStatus);
  if (statusItem) {
    slots.push([statusItem.key]);
  }
  const extras = asDropKeyList(specialItemKeys);
  if (extras.length) {
    slots.push(extras);
  }
  return slots.filter((keys) => keys.length);
}

export function listWildWinDropKeys(
  tier: number,
  specialStatus?: string | null,
  specialItemKeys?: string | readonly string[] | null
): string[] {
  return [...new Set(listWildWinDropSlots(tier, specialStatus, specialItemKeys).flat())];
}

export function pickWildWinDropKey(
  tier: number,
  specialStatus?: string | null,
  inventory?: Record<string, number> | null,
  specialItemKeys?: string | readonly string[] | null
): string | null {
  const slots = listWildWinDropSlots(tier, specialStatus, specialItemKeys)
    .map((keys) => keys.filter((key) => (Number(inventory?.[key]) || 0) < MAX_CONSUMABLE_STACK))
    .filter((keys) => keys.length);
  if (!slots.length) {
    return null;
  }
  const slot = slots[Math.floor(Math.random() * slots.length)];
  return slot[Math.floor(Math.random() * slot.length)] || null;
}

export type InventoryKey = (typeof INVENTORY_CONFIG)[number]["key"] | string;
export type ActiveConsumableKey = string;

/**
 * Story / event-only items. Shown on Home → Key Items.
 * Not usable from Usable Items or combat unless `onUse` is set (e.g. combine recipes).
 * Gate events with `keyItems.<key>` conditions and grant/spend via
 * `{ type: "keyItem", key, amount?, label? }`.
 */
export type KeyItemConfigEntry = {
  key: string;
  asset: string;
  alt: string;
  label: string;
  name: string;
  /**
   * Optional Key Items menu action.
   * When requirements are met, the item becomes clickable.
   */
  onUse?: {
    type: "combineIntoInventory";
    requireKeyItems: readonly string[];
    consumeKeyItems: readonly string[];
    grantInventoryKey: string;
    grantAmount?: number;
    successMessage?: string;
  };
};

/** Shared recipe: Incomplete Hamburger + Burger Patty → Perfect Hamburger. */
const PERFECT_HAMBURGER_RECIPE: NonNullable<KeyItemConfigEntry["onUse"]> = {
  type: "combineIntoInventory",
  requireKeyItems: ["incompleteHamburger", "burgerPatty"],
  consumeKeyItems: ["incompleteHamburger", "burgerPatty"],
  grantInventoryKey: "perfectHamburger",
  grantAmount: 1,
  successMessage: "You assembled the Perfect Hamburger!",
};

/** Add key items here as you invent them. */
export const KEY_ITEMS_CONFIG: readonly KeyItemConfigEntry[] = [
  {
    key: "chargedBattery",
    asset: "data/ui/item_charged_battery.png",
    alt: "Charged Battery",
    label: "Charged Battery: A fully charged cell entrusted by Elecmon.",
    name: "Charged Battery",
  },
  {
    key: "emptyBattery",
    asset: "data/ui/item_empty_battery.png",
    alt: "Empty Battery",
    label: "Empty Battery: A drained cell taken from Elecmon.",
    name: "Empty Battery",
  },
  {
    key: "toyWeapon",
    asset: "data/ui/item_toy_weapon.png",
    alt: "Toy Weapon",
    label: "Toy Weapon: A plastic armament sought by Terriermon.",
    name: "Toy Weapon",
  },
  {
    key: "incompleteHamburger",
    asset: "data/ui/item_incomplete_hamburger.png",
    alt: "Incomplete Hamburger",
    label:
      "Incomplete Hamburger: Burgermon Mama's near-perfect burger—still missing the patty. Combine with Burger Patty in Key Items.",
    name: "Incomplete Hamburger",
    onUse: PERFECT_HAMBURGER_RECIPE,
  },
  {
    key: "burgerPatty",
    asset: "data/ui/item_burger_patty.png",
    alt: "Burger Patty",
    label:
      "Burger Patty: Burgermon Papa's perfectly fried patty. Combine with Incomplete Hamburger in Key Items.",
    name: "Burger Patty",
    onUse: PERFECT_HAMBURGER_RECIPE,
  },
  {
    key: "rustedSword",
    asset: "data/ui/item_rusted_sword.png",
    alt: "Rusted Sword",
    label: "Rusted Sword: A corroded blade dug up from the tunnels.",
    name: "Rusted Sword",
  },
  {
    key: "kismaKeyOfBaal",
    asset: "data/ui/item_kisma_key_of_baal.png",
    alt: "Kisma Key of Baal",
    label: "Kisma Key of Baal: An ominous key humming with ancient power.",
    name: "Kisma Key of Baal",
  },
  {
    key: "goldmember",
    asset: "data/ui/item_goldmember.png",
    alt: "Goldmember",
    label: "Goldmember: A solid-gold keepsake recovered from Guardromon Gold.",
    name: "Goldmember",
  },
  {
    key: "rainPlant",
    asset: "data/ui/item_rain_plant.png",
    alt: "Rain Plant",
    label: "Rain Plant: A thirsty jungle plant Vegimon would love to grow.",
    name: "Rain Plant",
  },
  {
    key: "firstEditionCharizardCard",
    asset: "data/ui/item_first_edition_charizard_card.png",
    alt: "First Edition Charizard Card",
    label:
      "First Edition Charizard Card: A legendary holographic treasure pried from GoldNumemon.",
    name: "First Edition Charizard Card",
  },
  {
    key: "blackCrown",
    asset: "data/ui/item_black_crown.png",
    alt: "Black Crown",
    label: "Black Crown: A grim circlet claimed from BlackKingNumemon.",
    name: "Black Crown",
  },
  {
    key: "cthulhuHeart",
    asset: "data/ui/item_cthulhu_heart.png",
    alt: "Heart of Cthulhu",
    label: "Heart of Cthulhu: A still-beating relic torn from Dagomon's deep-sea domain.",
    name: "Heart of Cthulhu",
  },
  {
    key: "royalCrown",
    asset: "data/ui/item_royal_crown.png",
    alt: "Royal Crown",
    label: "Royal Crown: A gilded circlet taken from Delumon after underestimating them.",
    name: "Royal Crown",
  },
  {
    key: "sirensMirror",
    asset: "data/ui/item_sirens_mirror.png",
    alt: "Siren's Mirror",
    label: "Siren's Mirror: A sea-glass relic demanded by Wizarmon's hell ritual.",
    name: "Siren's Mirror",
  },
  {
    key: "bottomlessGoblet",
    asset: "data/ui/item_bottomless_goblet.png",
    alt: "Bottomless Goblet",
    label: "Bottomless Goblet: A cup that never empties, sought for Wizarmon's hell ritual.",
    name: "Bottomless Goblet",
  },
  {
    key: "avariceChain",
    asset: "data/ui/item_avarice_chain.png",
    alt: "Avarice Chain",
    label: "Avarice Chain: Gilded links that bind greed, sought for Wizarmon's hell ritual.",
    name: "Avarice Chain",
  },
  {
    key: "drowsyIncense",
    asset: "data/ui/item_drowsy_incense.png",
    alt: "Drowsy Incense",
    label: "Drowsy Incense: Sleep-heavy smoke for Wizarmon's hell ritual.",
    name: "Drowsy Incense",
  },
  {
    key: "cinderHeart",
    asset: "data/ui/item_cinder_heart.png",
    alt: "Cinder Heart",
    label: "Cinder Heart: A still-burning core for Wizarmon's hell ritual.",
    name: "Cinder Heart",
  },
  {
    key: "spitefulNeedle",
    asset: "data/ui/item_spiteful_needle.png",
    alt: "Spiteful Needle",
    label: "Spiteful Needle: A venomous pin for Wizarmon's hell ritual.",
    name: "Spiteful Needle",
  },
  {
    key: "monarchsBanner",
    asset: "data/ui/item_monarchs_banner.png",
    alt: "Monarch's Banner",
    label: "Monarch's Banner: A proud standard for Wizarmon's hell ritual.",
    name: "Monarch's Banner",
  },
  {
    key: "chrondigizoit",
    asset: "data/ui/item_chrondigizoit.png",
    alt: "Chrondigizoit",
    label: "Chrondigizoit: Rare Chrome Digizoid ore. Zudomon's forge in Freezeland can work it into a hammer.",
    name: "Chrondigizoit",
  },
  {
    key: "trainingManual",
    asset: "data/ui/item_training_manual.png",
    alt: "Training Manual",
    label:
      "Training Manual: Each successful training counts as two, but still costs 1 Weight. The 4-train cap still applies.",
    name: "Training Manual",
  },
];

/** Seven Demon Lord ritual ingredients for Wizarmon's hell gate. */
export const DEMON_LORD_INGREDIENT_KEYS = [
  "sirensMirror",
  "bottomlessGoblet",
  "avariceChain",
  "drowsyIncense",
  "cinderHeart",
  "spitefulNeedle",
  "monarchsBanner",
] as const;

export function countDemonLordIngredients(
  keyItems: Record<string, number> | null | undefined
): number {
  return DEMON_LORD_INGREDIENT_KEYS.filter(
    (key) => (Number(keyItems?.[key]) || 0) > 0
  ).length;
}

export function listOwnedDemonLordIngredientNames(
  keyItems: Record<string, number> | null | undefined
): string {
  return DEMON_LORD_INGREDIENT_KEYS.filter((key) => (Number(keyItems?.[key]) || 0) > 0)
    .map((key) => KEY_ITEMS_CONFIG.find((item) => item.key === key)?.name || key)
    .join(", ");
}

export type KeyItemKey = (typeof KEY_ITEMS_CONFIG)[number]["key"] | string;
