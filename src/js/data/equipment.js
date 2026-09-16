/** Equipment never consumes on use. Add future gear here. */
export const EQUIPMENT_CONFIG = [
    {
        key: "woodenSword",
        asset: "data/ui/equip_wooden_sword.png",
        alt: "Wood Sword",
        label: "Wood Sword",
        name: "Wood Sword",
        bonuses: { attack: 1 },
    },
    {
        key: "carapaceArmor",
        asset: "data/ui/equip_carapace_armor.png",
        alt: "Carapace Armor",
        label: "Carapace Armor",
        name: "Carapace Armor",
        bonuses: { defense: 2 },
    },
    {
        key: "cyberparts",
        asset: "data/ui/equip_cyberparts.png",
        alt: "Cyber Parts",
        label: "Cyber Parts",
        name: "Cyber Parts",
        bonuses: { attack: 3, defense: 3 },
    },
    {
        key: "baseballBat",
        asset: "data/ui/equip_baseball_bat.png",
        alt: "Baseball Bat",
        label: "Baseball Bat",
        name: "Baseball Bat",
        bonuses: { attack: 3 },
    },
    {
        key: "kaisersGoggles",
        asset: "data/ui/equip_kaisers_goggles.png",
        alt: "Kaiser's Goggles",
        label: "Kaiser's Goggles",
        name: "Kaiser's Goggles",
        bonuses: { intelligence: 5 },
    },
    {
        key: "hardScale",
        asset: "data/ui/equip_hard_scale.png",
        alt: "Hard Scale",
        label: "Hard Scale",
        name: "Hard Scale",
        bonuses: { defense: 2 },
        statusImmunities: ["confused", "confuse", "confuso", "confusion"],
    },
    {
        key: "narwhalHorn",
        asset: "data/ui/equip_narwhal_horn.png",
        alt: "Narwhal Horn",
        label: "Narwhal Horn",
        name: "Narwhal Horn",
        bonuses: { attack: 2 },
        onHitEffect: { status: "exposed", chance: 0.1 },
    },
    {
        key: "cursedHorn",
        asset: "data/ui/equip_cursed_horn.png",
        alt: "Cursed Horn",
        label: "Cursed Horn",
        name: "Cursed Horn",
        bonuses: { attack: 2 },
        onHitEffect: { status: "confused", chance: 0.1 },
    },
    {
        key: "mightyHorn",
        asset: "data/ui/equip_mighty_horn.png",
        alt: "Mighty Horn",
        label: "Mighty Horn",
        name: "Mighty Horn",
        bonuses: { attack: 3 },
    },
    {
        key: "blazingArmor",
        asset: "data/ui/equip_blazing_armor.png",
        alt: "Blazing Armor",
        label: "Blazing Armor",
        name: "Blazing Armor",
        bonuses: { defense: 1 },
        thorns: 1,
    },
    {
        key: "ancientRelic",
        asset: "data/ui/equip_ancient_relic.png",
        alt: "Ancient Relic",
        label: "Ancient Relic",
        name: "Ancient Relic",
        bonuses: { speed: 5, intelligence: 5 },
    },
    {
        key: "catGloves",
        asset: "data/ui/equip_cat_gloves.png",
        alt: "Cat Gloves",
        label: "Cat Gloves",
        name: "Cat Gloves",
        bonuses: { attack: 1, speed: 5 },
    },
    {
        key: "despairClaw",
        asset: "data/ui/equip_despair_claw.png",
        alt: "Despair Claw",
        label: "Despair Claw",
        name: "Despair Claw",
        bonuses: { speed: 5 },
        onHitEffect: { status: "confused", chance: 0.1 },
    },
    {
        key: "jumboCannon",
        asset: "data/ui/equip_jumbo_cannon.png",
        alt: "Jumbo Cannon",
        label: "Jumbo Cannon",
        name: "Jumbo Cannon",
        bonuses: { attack: 4 },
    },
    {
        key: "cyberSword",
        asset: "data/ui/equip_cyber_sword.png",
        alt: "Cyber Sword",
        label: "Cyber Sword",
        name: "Cyber Sword",
        bonuses: { attack: 4, speed: 15 },
        onHitEffect: { status: "slow", chance: 0.1 },
    },
    {
        key: "arsenal",
        asset: "data/ui/equip_arsenal.png",
        alt: "Arsenal",
        label: "Arsenal",
        name: "Arsenal",
        bonuses: { attack: 7 },
        selfDamageOnAttack: 1,
    },
    {
        key: "ancientTablet",
        asset: "data/ui/equip_ancient_tablet.png",
        alt: "Ancient Tablet",
        label: "Ancient Tablet",
        name: "Ancient Tablet",
        bonuses: { intelligence: 10 },
    },
    {
        key: "infiniteHeads",
        asset: "data/ui/equip_infinite_heads.png",
        alt: "Infinite Heads",
        label: "Infinite Heads",
        name: "Infinite Heads",
        bonuses: { attack: 1, defense: 1, intelligence: 5, speed: 5 },
    },
    {
        key: "furCoat",
        asset: "data/ui/equip_fur_coat.png",
        alt: "Fur Coat",
        label: "Fur Coat",
        name: "Fur Coat",
        bonuses: {},
        debuffImmune: true,
    },
    {
        key: "infinityGauntlet",
        asset: "data/ui/equip_infinity_gauntlet.png",
        alt: "Infinity Gauntlet",
        label: "Infinity Gauntlet",
        name: "Infinity Gauntlet",
        bonuses: {},
        criticalDamageBonus: 0.5,
    },
    {
        key: "shellArmor",
        asset: "data/ui/equip_shell_armor.png",
        alt: "Shell Armor",
        label: "Shell Armor",
        name: "Shell Armor",
        bonuses: { defense: 4, speed: 10 },
    },
    {
        key: "garurumonCoat",
        asset: "data/ui/equip_garurumon_coat.png",
        alt: "Garurumon Coat",
        label: "Garurumon Coat: +2 Defense. Immune to Demoralized.",
        name: "Garurumon Coat",
        bonuses: { defense: 2 },
        statusImmunities: ["demoralized"],
    },
    {
        key: "gearRing",
        asset: "data/ui/equip_gear_ring.png",
        alt: "Gear Ring",
        label: "Gear Ring: 20% chance to gain Swift on each attack.",
        name: "Gear Ring",
        bonuses: {},
        onHitEffect: { status: "swift", chance: 0.2, target: "self" },
    },
    {
        key: "sacredCollar",
        asset: "data/ui/equip_sacred_collar.png",
        alt: "Sacred Collar",
        label: "Sacred Collar: +1 HP after each combat.",
        name: "Sacred Collar",
        bonuses: {},
        healAfterCombat: 1,
    },
    {
        key: "cockatriceFeather",
        asset: "data/ui/equip_cockatrice_feather.png",
        alt: "Cockatrice Feather",
        label: "Cockatrice Feather: +5 Speed. 10% chance to demoralize on hit.",
        name: "Cockatrice Feather",
        bonuses: { speed: 5 },
        onHitEffect: { status: "demoralized", chance: 0.1 },
    },
    {
        key: "gaogamonMachineGun",
        asset: "data/ui/equip_gaogamon_machine_gun.png",
        alt: "Gaogamon Machine Gun",
        label: "Gaogamon Machine Gun: +3 Attack, +10 Speed.",
        name: "Gaogamon Machine Gun",
        bonuses: { attack: 3, speed: 10 },
    },
    {
        key: "poisonedDagger",
        asset: "data/ui/equip_poisoned_dagger.png",
        alt: "Poisoned Dagger",
        label: "Poisoned Dagger: +1 Attack. 20% chance to poison on hit.",
        name: "Poisoned Dagger",
        bonuses: { attack: 1 },
        onHitEffect: { status: "poison", chance: 0.2 },
    },
    {
        key: "ninjaStars",
        asset: "data/ui/equip_ninja_stars.png",
        alt: "Ninja Stars",
        label: "Ninja Stars: +20 Speed.",
        name: "Ninja Stars",
        bonuses: { speed: 20 },
    },
    {
        key: "boxingGloves",
        asset: "data/ui/equip_boxing_gloves.png",
        alt: "Boxing Gloves",
        label: "Boxing Gloves: +3 Attack. 15% chance to confuse on hit.",
        name: "Boxing Gloves",
        bonuses: { attack: 3 },
        onHitEffect: { status: "confused", chance: 0.15 },
    },
    {
        key: "chainsaw",
        asset: "data/ui/equip_chainsaw.png",
        alt: "Chainsaw",
        label: "Chainsaw: +4 Attack. 20% chance to demoralize on hit.",
        name: "Chainsaw",
        bonuses: { attack: 4 },
        onHitEffect: { status: "demoralized", chance: 0.2 },
    },
    {
        key: "metalCoat",
        asset: "data/ui/equip_metal_coat.png",
        alt: "Metal Coat",
        label: "Metal Coat: +3 Defense. Immune to Defense debuffs.",
        name: "Metal Coat",
        bonuses: { defense: 3 },
        statDebuffImmunities: ["defense"],
    },
    {
        key: "stingerCannon",
        asset: "data/ui/equip_stinger_cannon.png",
        alt: "Stinger Cannon",
        label: "Stinger Cannon: +3 Attack. 20% chance to poison on hit.",
        name: "Stinger Cannon",
        bonuses: { attack: 3 },
        onHitEffect: { status: "poison", chance: 0.2 },
    },
    {
        key: "darkLance",
        asset: "data/ui/equip_dark_lance.png",
        alt: "Dark Lance",
        label: "Dark Lance: +2 Attack. 30% chance to demoralize on hit.",
        name: "Dark Lance",
        bonuses: { attack: 2 },
        onHitEffect: { status: "demoralized", chance: 0.3 },
    },
    {
        key: "vDramonHorn",
        asset: "data/ui/equip_v_dramon_horn.png",
        alt: "V-dramon Horn",
        label: "V-dramon Horn: +3 Attack. 20% chance to inflict Deep Wound on hit.",
        name: "V-dramon Horn",
        bonuses: { attack: 3 },
        onHitEffect: { status: "deepwound", chance: 0.2 },
    },
    {
        key: "lilimonPetals",
        asset: "data/ui/equip_lilimon_petals.png",
        alt: "Lilimon Petals",
        label: "Lilimon Petals: Attacks can inflict Infatuated.",
        name: "Lilimon Petals",
        bonuses: {},
        onHitEffect: { status: "infatuated", chance: 0.2 },
    },
    {
        key: "alienPistol",
        asset: "data/ui/equip_alien_pistol.png",
        alt: "Alien Pistol",
        label: "Alien Pistol: +1 Attack. 20% chance to inflict Distracted. 20% chance to inflict Confused.",
        name: "Alien Pistol",
        bonuses: { attack: 1 },
        onHitEffects: [
            { status: "distracted", chance: 0.2 },
            { status: "confused", chance: 0.2 },
        ],
    },
    {
        key: "thorsHammer",
        asset: "data/ui/equip_thors_hammer.png",
        alt: "Thor's Hammer",
        label: "Thor's Hammer: +3 Attack.",
        name: "Thor's Hammer",
        bonuses: { attack: 3 },
    },
    {
        key: "growmonFang",
        asset: "data/ui/equip_growmon_fang.png",
        alt: "Growmon Fang",
        label: "Growmon Fang: +2 Attack. Attacks can Burn.",
        name: "Growmon Fang",
        bonuses: { attack: 2 },
        onHitEffect: { status: "burned", chance: 0.2 },
    },
    {
        key: "hedgehogShell",
        asset: "data/ui/equip_hedgehog_shell.png",
        alt: "Hedgehog Shell",
        label: "Hedgehog Shell: +2 Defense. Start combat with Thorns.",
        name: "Hedgehog Shell",
        bonuses: { defense: 2 },
        startStatuses: ["thorns"],
    },
];
function titleCaseStat(stat) {
    return stat.charAt(0).toUpperCase() + stat.slice(1);
}
function equipmentStatusLabel(status) {
    const key = String(status || "").toLowerCase();
    if (key.startsWith("demoral"))
        return "Demoralized";
    if (key.startsWith("confus"))
        return "Confused";
    if (key.startsWith("poison"))
        return "Poisoned";
    if (key === "sleep" || key === "asleep" || key === "dormido")
        return "Asleep";
    if (key.startsWith("silen"))
        return "Silenced";
    if (key.startsWith("blind") || key === "cegado")
        return "Blinded";
    if (key.startsWith("invert"))
        return "Inverted";
    if (key.startsWith("burn") || key === "quemado")
        return "Burned";
    if (key.startsWith("vampir"))
        return "Vampirism";
    if (key === "thorns" || key === "espinas")
        return "Thorns";
    if (key.startsWith("reflect") || key === "reflejo")
        return "Reflector";
    if (key.startsWith("immun") || key === "inmune")
        return "Immune";
    if (key.startsWith("reckless") || key === "temerario" || key === "imprudente")
        return "Reckless";
    if (key.startsWith("curs") || key === "maldito")
        return "Cursed";
    if (key.startsWith("mark") || key === "marcado")
        return "Marked";
    if (key.startsWith("drain") || key === "drenado")
        return "Drained";
    if (key.startsWith("bound") || key === "atado")
        return "Bound";
    if (key.includes("positive") || key === "polopositivo")
        return "Positive Pole";
    if (key.includes("negative") || key === "polonegativo")
        return "Negative Pole";
    if (key.includes("deep") || key.includes("herida"))
        return "Deep Wound";
    if (key.startsWith("infatuat") || key === "enamorado" || key === "enamored")
        return "Infatuated";
    if (key === "distracted" || key === "distraido")
        return "Distracted";
    if (key === "swift")
        return "Swift";
    if (key === "slow")
        return "Slow";
    if (key === "exposed")
        return "Exposed";
    if (key === "weak")
        return "Weak";
    return key ? key.charAt(0).toUpperCase() + key.slice(1) : status;
}
/** Short combat effect line for hover / debug. */
export function formatEquipmentEffect(item) {
    const parts = [];
    const bonuses = item.bonuses || {};
    Object.entries(bonuses).forEach(([stat, value]) => {
        if (Number(value)) {
            parts.push(`+${value} ${titleCaseStat(stat)}`);
        }
    });
    const gear = item;
    if (gear.debuffImmune) {
        parts.push("Immune to debuffs");
    }
    if (gear.statDebuffImmunities?.length) {
        parts.push(`Immune to ${gear.statDebuffImmunities.map(titleCaseStat).join(", ")} debuffs`);
    }
    if (gear.statusImmunities?.length) {
        const immuneLabels = [...new Set(gear.statusImmunities.map(equipmentStatusLabel))];
        parts.push(`Immune to ${immuneLabels.join(", ")}`);
    }
    const hitEffects = [
        ...(gear.onHitEffect?.status ? [gear.onHitEffect] : []),
        ...(gear.onHitEffects || []),
    ];
    hitEffects.forEach((effect) => {
        if (!effect?.status) {
            return;
        }
        const target = effect.target === "self" ? "self" : "foe";
        parts.push(`${Math.round(effect.chance * 100)}% ${equipmentStatusLabel(effect.status)} (${target})`);
    });
    if (gear.startStatuses?.length) {
        const labels = [...new Set(gear.startStatuses.map(equipmentStatusLabel))];
        parts.push(`Start combat with ${labels.join(", ")}`);
    }
    if (Number(gear.thorns) > 0) {
        parts.push(`${gear.thorns} thorns`);
    }
    if (Number(gear.selfDamageOnAttack) > 0) {
        parts.push(`${gear.selfDamageOnAttack} self-damage on attack`);
    }
    if (Number(gear.criticalDamageBonus) > 0) {
        parts.push(`Crits +${Math.round(Number(gear.criticalDamageBonus) * 100)}% damage`);
    }
    if (Number(gear.healAfterCombat) > 0) {
        parts.push(`+${gear.healAfterCombat} HP after combat`);
    }
    const effect = parts.join(" · ");
    if (!effect) {
        return item.label || item.name;
    }
    if (item.label && item.label !== item.name) {
        return item.label;
    }
    return `${item.name}: ${effect}`;
}
