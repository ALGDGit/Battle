import type { ZoneEventChoice, ZoneEventDefinition, ZoneEventOutcome } from "./events/types.js";
import { forEachZoneEventChoice } from "./events/types.js";

const BOSS_FIGHT_CHOICE: ZoneEventChoice = {
  label: "Fight!",
  mood: "angry",
  outcomes: [{ type: "bossFight" }],
};

type BossDialogueDraft = {
  title: string;
  text: string;
  /** Shown after a flavor choice that returns to combat via `next: "ready"`. */
  readyText?: string;
  extraChoices?: ZoneEventChoice[];
  nodes?: ZoneEventDefinition["nodes"];
};

function buildBossDialogue(
  zoneId: string,
  opponentId: string,
  draft: BossDialogueDraft
): ZoneEventDefinition {
  const extras = draft.extraChoices || [];
  const nodes: NonNullable<ZoneEventDefinition["nodes"]> = { ...(draft.nodes || {}) };
  const needsReady = extras.some((choice) => choice.next === "ready");
  if (needsReady && !nodes.ready) {
    nodes.ready = {
      text:
        draft.readyText ||
        "There's nothing left to say. Prove yourself in battle.",
      choices: [BOSS_FIGHT_CHOICE],
    };
  }
  return {
    id: `boss_${zoneId}_${opponentId}`,
    speakerId: opponentId,
    title: draft.title,
    text: draft.text,
    repeatable: true,
    choices: [BOSS_FIGHT_CHOICE, ...extras],
    nodes: Object.keys(nodes).length > 0 ? nodes : undefined,
  };
}

/**
 * Pre-fight boss dialogue keyed by zone → opponent id.
 * Every entry always includes Fight!; extras are optional story choices.
 */
const ZONE_BOSS_DIALOGUE_DRAFTS: Record<string, Record<string, BossDialogueDraft>> = {
  native_forest: {
    wormmon: {
      title: "Silk Sentinel",
      text: "Wormmon bars the trail, silk threads quivering. \"This forest is under my watch. Prove you belong here.\"",
      extraChoices: [
        {
          label: "Ask to pass peacefully",
          mood: "happy",
          outcomes: [
            {
              type: "message",
              text: "Wormmon hesitates… then steels itself. Words will not open this path.",
            },
          ],
          next: "ready",
        },
      ],
    },
  },
  beach: {
    coelamon: {
      title: "Tide Guard",
      text: "Coelamon rises from the surf. \"The beach answers to me. Cross at your peril.\"",
      extraChoices: [
        {
          label: "Offer 2 meat",
          requireMeat: 2,
          disabledHint: "You need 2 meat.",
          outcomes: [
            { type: "meat", amount: -2 },
            {
              type: "message",
              text: "Coelamon snaps up the meat—but still blocks the way, hungrier than before.",
            },
          ],
          next: "ready",
        },
      ],
    },
    ikkakumon: {
      title: "Horn of the Shore",
      text: "Ikkakumon stamps the sand. \"A strong horn for a strong challenger. Show me yours.\"",
    },
  },
  dragon_eye_lake: {
    waruseadramon: {
      title: "Cursed Depths",
      text: "WaruSeadramon coils above the dark water. \"This lake remembers fear. Join it.\"",
      extraChoices: [
        {
          label: "Back away from the water",
          outcomes: [
            {
              type: "message",
              text: "You step back. The serpent watches… then sinks. The boss still waits for another day.",
            },
          ],
        },
      ],
    },
    megaseadramon: {
      title: "Lake Sovereign",
      text: "MegaSeadramon towers over the waves. \"Only the worthy may leave Dragon Eye Lake.\"",
    },
  },
  drill_tunnel: {
    meramon: {
      title: "Burning Gate",
      text: "Meramon flares in the tunnel mouth. \"Hot enough for you? Then come closer.\"",
    },
  },
  mt_panorama: {
    stiffilmon: {
      title: "Summit Watch",
      text: "Stiffilmon plants himself on the ridge, stuffing bristling in the wind. \"This peak is under my watch. Prove you belong here.\"",
    },
  },
  gear_savanna: {
    leomon: {
      title: "Savanna Pride",
      text: "Leomon plants a spear in the dust. \"Justice walks this plain. Face it.\"",
      extraChoices: [
        {
          label: "Salute his honor (+1 Alignment)",
          outcomes: [
            { type: "care", alignment: 1 },
            {
              type: "message",
              text: "Leomon nods—but honor still demands a trial by combat.",
            },
          ],
          next: "ready",
        },
        {
          label: "Offer the Kisma Key of Baal",
          requireKeyItem: "kismaKeyOfBaal",
          whenFail: "hide",
          mood: "happy",
          outcomes: [
            {
              type: "keyItem",
              key: "kismaKeyOfBaal",
              amount: -1,
              label: "Kisma Key of Baal",
            },
            {
              type: "message",
              text: "You tell Leomon the key is an heirloom of his ancestors and place it in his paws.",
            },
          ],
          next: "enraged",
        },
      ],
      nodes: {
        enraged: {
          speakerId: "madleomon",
          text: "Leomon reads the inscription aloud: \"It is Key that you Kisma Baals.\" His eyes go wide—then wild. Rage twists him into MadLeomon!",
          choices: [
            {
              label: "Fight!",
              mood: "angry",
              outcomes: [{ type: "bossFight", opponentId: "madleomon" }],
            },
          ],
        },
      },
    },
    tailmon: {
      title: "Sacred Claws",
      text: "Tailmon's rings gleam. \"I protect what matters. Do you?\"",
    },
  },
  geko_swamp: {
    gekomon: {
      title: "Muddy Chorus",
      text: "Gekomon croaks from a lily pad throne. \"Ribbit… challenge accepted?\"",
    },
  },
  volume_villa: {
    digitamamon: {
      title: "Villa Host",
      text: "Digitamamon adjusts a napkin. \"Dinner or duel? I recommend duel.\"",
      extraChoices: [
        {
          label: "Ask for leftovers",
          outcomes: [
            { type: "meat", amount: 1 },
            {
              type: "message",
              text: "A scrap of meat lands at your feet. The bill, however, is still a fight.",
            },
          ],
          next: "ready",
        },
      ],
    },
  },
  misty_trees: {
    jyureimon: {
      title: "Rooted Tyrant",
      text: "Jyureimon's branches blot the fog. \"These woods do not forgive trespassers.\"",
    },
  },
  trash_mountain: {
    numemon: {
      title: "Heap King",
      text: "Numemon oozes atop the garbage crown. \"Mine! All mine! Fight for scrap!\"",
      extraChoices: [
        {
          label: "Hold your nose and leave",
          outcomes: [
            {
              type: "message",
              text: "You retreat from the stench. Numemon cackles from the pile.",
            },
          ],
        },
      ],
    },
  },
  toy_town: {
    warumonzaemon: {
      title: "Broken Parade",
      text: "WaruMonzaemon looms over shattered toys. \"Playtime is over.\"",
    },
    jumbogamemon: {
      title: "Cannon Carnival",
      text: "JumboGamemon loads a toy cannon. \"Big boom time!\"",
    },
  },
  factorial_town: {
    hiandromon: {
      title: "Factory Judge",
      text: "HiAndromon scans you. \"Efficiency check: combat protocols engaged.\"",
    },
    grandlocomon: {
      title: "Rail Tyrant",
      text: "GrandLocomon blocks the tracks. \"All lines terminate here.\"",
    },
    gundramon: {
      title: "Arsenal Line",
      text: "Gundramon's guns whir online. \"Target acquired.\"",
    },
  },
  mt_infinity: {
    mugendramon: {
      title: "Infinite Core",
      text: "MugenDramon fills the peak with steel. \"Infinity has a gatekeeper.\"",
    },
  },
  tropical_jungle: {
    centaurmon: {
      title: "Jungle Tablet",
      text: "Centaurmon lowers a glowing tablet. \"Read this with your strength.\"",
    },
  },
  dino_region: {
    growmon: {
      title: "Crimson Roar",
      text: "Growmon snarls, claws sparking. \"This territory is mine!\"",
    },
    mastertyranomon: {
      title: "Tyrant King",
      text: "MasterTyranomon stomps into the clearing, heat rolling off its hide. \"The pack answers to me.\"",
    },
  },
  great_canyon: {
    orochimon: {
      title: "Many Heads",
      text: "Orochimon's heads weave above the canyon rim. \"Pick a head. They all bite.\"",
    },
  },
  freezeland: {
    ancientmegatheriumon: {
      title: "Frozen Fur",
      text: "AncientMegatheriumon exhales a blizzard. \"Warm blood does not last here.\"",
    },
    blastmon: {
      title: "Crystal Fist",
      text: "Blastmon cracks his knuckles into diamonds. \"One punch. Make it count.\"",
    },
  },
  ogremons_fortress: {
    ogremon: {
      title: "Fortress Bully",
      text: "Ogremon grins from the gate. \"You knock. I smash.\"",
    },
  },
  ice_sanctuary: {
    angemon: {
      title: "Sanctuary Trial",
      text: "Angemon spreads radiant wings. \"Prove your heart before the light.\"",
      extraChoices: [
        {
          label: "Kneel in respect (+1 Alignment)",
          outcomes: [
            { type: "care", alignment: 1 },
            {
              type: "message",
              text: "Angemon softens—then raises a staff. \"Respect is the beginning of the trial.\"",
            },
          ],
          next: "ready",
        },
      ],
    },
  },
  beetle_land: {
    heraklekabuterimon: {
      title: "Beetle Crown",
      text: "HerakleKabuterimon's horn casts a long shadow. \"The colony has a champion. Face it.\"",
    },
  },
  greylords_mansion: {
    bakemon: {
      title: "Haunted Welcome",
      text: "Bakemon drifts through the foyer. \"Guests who enter… rarely leave.\"",
    },
  },
  cocytus: {
    bakemon: {
      title: "Frozen Wail",
      text: "A Bakemon of Cocytus moans through black ice. \"Cold forever… unless you win.\"",
    },
  },
  kernel: {
    angemon: {
      title: "Kernel Gate",
      text: "Angemon bars the luminous gate. \"The Kernel is not a shortcut. Earn it.\"",
    },
  },
};

function collectDialogueCharacterIds(event: ZoneEventDefinition): string[] {
  const ids: string[] = [];
  const add = (value: string | undefined) => {
    const id = String(value || "").trim();
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  };
  add(event.speakerId);
  Object.values(event.nodes || {}).forEach((node) => add(node?.speakerId));
  forEachZoneEventChoice(event, (choice) => {
    (choice.outcomes || []).forEach((outcome: ZoneEventOutcome) => {
      if (outcome?.type === "fight") {
        add(outcome.opponentId);
      }
      if (outcome?.type === "bossFight") {
        add(outcome.opponentId);
      }
    });
  });
  return ids;
}

/** Speakers and fight targets from a zone's boss dialogues (includes transforms like MadLeomon). */
export function listBossDialogueCharacterIds(zoneId: string): string[] {
  const drafts = ZONE_BOSS_DIALOGUE_DRAFTS[zoneId];
  if (!drafts) {
    return [];
  }
  const ids: string[] = [];
  Object.entries(drafts).forEach(([opponentId, draft]) => {
    const event = buildBossDialogue(zoneId, opponentId, draft);
    collectDialogueCharacterIds(event).forEach((id) => {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    });
  });
  return ids;
}

/** Resolve pre-fight dialogue for a zone boss opponent (always includes Fight!). */
export function getZoneBossDialogue(zoneId: string, opponentId: string): ZoneEventDefinition {
  const draft = ZONE_BOSS_DIALOGUE_DRAFTS[zoneId]?.[opponentId];
  if (draft) {
    return buildBossDialogue(zoneId, opponentId, draft);
  }
  return buildBossDialogue(zoneId, opponentId, {
    title: "Boss Encounter",
    text: "A powerful Digimon blocks the path.",
  });
}
