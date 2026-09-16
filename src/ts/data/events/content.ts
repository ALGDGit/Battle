import type { ZoneEventDefinition } from "./types.js";

/**
 * Zone story events.
 * Outcome types: message, heal, healToPercent, damage, damagePercent, meat, weight, training, attributes, care, item, keyItem,
 * unlockZones, fight, bossFight, eventRepeat, banForever, endRun, spendAnyItem, spendAnyFood, spendHealItem, spendStatBuffItem,
 * stealRandomInventoryItem, returnStolenItem, statCheck, grantRandomItem, grantWeightedLoot, queueEvent,
 * zoneBuff, zoneDebuff, zoneDebuffRandom.
 * Multi-step: add `nodes` and set choice `next` to a node id (root is `"start"`).
 * Gating: `require` / `unless` on events, choices, or nodes (stats, stage, care, items…).
 * Repeat this run: event/choice `repeatable`, or outcome `{ type: "eventRepeat", value: false }`.
 * Forever: outcome `{ type: "banForever" }` or fight `banForeverOnWin`.
 * Conditional copy: `textVariants` / `labelVariants` + `{stat}` placeholders.
 */
export const ZONE_EVENTS: Record<string, ZoneEventDefinition[]> = {
  native_forest: [
    {
      id: "nf_banker_agumon",
      speakerId: "agumon",
      title: "Failed Banker",
      text: "Agumon sighs. He used to run an item bank… until he lost everything.",
      choices: [
        {
          label: "Give him an item to store (+1 Alignment)",
          requireAnyInventoryItem: true,
          whenFail: "disable",
          disabledHint: "You need an inventory item to deposit.",
          mood: "happy",
          repeatable: false,
          outcomes: [
            { type: "spendAnyItem" },
            { type: "care", alignment: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Agumon carefully files your deposit away. \"Just like old times…\" Alignment +1.",
            },
          ],
        },
        {
          label: "Attack and steal what he has left (−1 Alignment)",
          mood: "angry",
          // Stay available if you lose; ban only happens on win.
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -1 },
            {
              type: "message",
              text: "You draw your weapon. Alignment −1.",
            },
            {
              type: "fight",
              opponentId: "agumon",
              combatProfile: { stage: "Child", tier: 1 },
              rewardOnWin: { key: "smallHeal", amount: 1, label: "Small Heal" },
              banForeverOnWin: true,
            },
          ],
        },
        {
          label: "Ignore him",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You leave Agumon to his empty vault.",
            },
          ],
        },
      ],
    },
    {
      id: "nf_kunemon_hungry",
      speakerId: "kunemon",
      title: "Hungry Kunemon",
      text: "Kunemon blocks the path, antennae twitching. \"Got anything to eat…? I'm starving.\"",
      choices: [
        {
          label: "Give it something to eat (+1 Alignment)",
          requireAnyFood: true,
          whenFail: "hide",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "spendAnyFood" },
            { type: "care", alignment: 1 },
            {
              type: "message",
              text: "Kunemon gobbles it down. \"Thanks… you're alright.\" Alignment +1.",
            },
          ],
        },
        {
          label: "Refuse",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Kunemon's eyes narrow. \"Then you'll do.\"",
            },
            {
              type: "fight",
              opponentId: "kunemon",
              combatProfile: { stage: "Child", tier: 1 },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
    {
      id: "nf_palmon_farm",
      speakerId: "palmon",
      title: "Meat Garden",
      text: "Palmon waves you over to a patch of strange plants. \"I've got a meat plantation! Come eat!\"",
      choices: [
        {
          label: "Take some meat (+1 Meat)",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "meat", amount: 1 },
            {
              type: "message",
              text: "Palmon hands you a fresh cut. Meat +1.",
            },
          ],
        },
        {
          label: "Refuse the offer (+1 Discipline)",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: 1 },
            {
              type: "message",
              text: "You politely decline. Discipline +1.",
            },
          ],
        },
        {
          label: "Attack and steal all meat (−1 Alignment)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -1 },
            {
              type: "message",
              text: "You turn on the host. Alignment −1.",
            },
            {
              type: "fight",
              opponentId: "palmon",
              combatProfile: { stage: "Child", tier: 1 },
              banForeverOnWin: true,
              // Meat granted on win via reward isn't meat type — use dropsOnWin meat
              dropsOnWin: [{ kind: "meat", chance: 1, amount: 5 }],
            },
          ],
        },
      ],
    },
    {
      id: "nf_greymon_predator",
      speakerId: "greymon",
      title: "Forest Predator",
      text: "Greymon snorts and looks past you, uninterested.",
      textVariants: [
        {
          when: { stat: "hpPercent", op: "gte", value: 20 },
          text: "Greymon snorts and looks past you, uninterested.",
        },
        {
          when: { stat: "hpPercent", op: "lt", value: 20 },
          text: "Greymon's nostrils flare. It smells your weakness—and charges!",
        },
      ],
      choices: [
        {
          label: "Walk past",
          whenFail: "hide",
          require: { stat: "hpPercent", op: "gte", value: 20 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Greymon ignores you completely. You slip deeper into the forest.",
            },
          ],
        },
        {
          label: "Defend yourself!",
          mood: "angry",
          whenFail: "hide",
          require: { stat: "hpPercent", op: "lt", value: 20 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "There's nowhere to run. Greymon is already on you!",
            },
            {
              type: "fight",
              opponentId: "greymon",
              combatProfile: { stage: "Adult", tier: 4 },
              banForeverOnWin: true,
              reputationOnWin: 1,
            },
          ],
        },
      ],
    },
    {
      id: "nf_delumon_greeting",
      speakerId: "delumon",
      title: "A Kind Greeting",
      text: "Delumon bows with a flourish. \"Hello there! What a lovely day for a walk.\"",
      choices: [
        {
          label: "Greet them back (+1 Happiness)",
          mood: "happy",
          outcomes: [
            { type: "care", happiness: 1 },
            { type: "item", key: "smallHeal", amount: 1, label: "Small Heal" },
            { type: "banForever" },
            {
              type: "message",
              text: "Delumon smiles and presses a Small Heal into your hands. \"A gift for a kind traveler.\" Happiness +1.",
            },
          ],
        },
        {
          label: "They're weak—attack (−2 Alignment)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -2 },
            {
              type: "message",
              text: "You draw your weapon. Alignment −2.",
            },
          ],
          next: "revealed",
        },
      ],
      nodes: {
        revealed: {
          text: "Delumon's gentle posture vanishes. Power rolls off them—this is no Child. They're Perfect-level.",
      choices: [
        {
              label: "Flee (−2 Discipline)",
              mood: "angry",
              repeatable: true,
              outcomes: [
                { type: "care", discipline: -2 },
                {
                  type: "message",
                  text: "You back off. Delumon watches you go, disappointed. Discipline −2.",
                },
              ],
            },
            {
              label: "Fight anyway (+1 Discipline)",
              mood: "angry",
              repeatable: true,
          outcomes: [
            { type: "care", discipline: 1 },
                {
                  type: "message",
                  text: "You stand your ground. Discipline +1. Delumon sighs and answers in kind!",
                },
                {
                  type: "fight",
                  opponentId: "delumon",
                  combatProfile: { stage: "Perfect", tier: 5 },
                  rewardOnWin: { key: "royalCrown", amount: 1, label: "Royal Crown" },
                  banForeverOnWin: true,
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "nf_etemon_sneak",
      speakerId: "etemon",
      title: "Sneak Attack",
      startOutcomes: [{ type: "damagePercent", percent: 20, minHp: 1 }],
      text: "Etemon drops from the canopy and sucker-punches you! The cheap shot takes 20% of your max HP.",
      choices: [
        {
          label: "Run away (−1 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: -1 },
            {
              type: "message",
              text: "You scramble off while Etemon cackles. Discipline −1.",
            },
          ],
        },
        {
          label: "Fight!",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You square up. Etemon strikes a pose and comes at you!",
            },
            {
              type: "fight",
              opponentId: "etemon",
              combatProfile: { stage: "Perfect", tier: 5 },
              rewardOnWin: { key: "goldenBanana", amount: 1, label: "Golden Banana" },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
  ],
  beach: [
    {
      id: "cb_jellymon_pest",
      speakerId: "jellymon",
      title: "Beach Pest",
      text: "Jellymon won't leave you alone—zaps, splashes, and giggles until it stings you for 10% of your max HP!",
      choices: [
        {
          label: "It's just a kid—leave it alone (+2 Discipline)",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "damagePercent", percent: 10, minHp: 1 },
            { type: "care", discipline: 2 },
            {
              type: "message",
              text: "You grit your teeth and walk on. Discipline +2. Jellymon will probably be back…",
            },
          ],
        },
        {
          label: "Give it a slap (+1 Happiness, −1 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "damagePercent", percent: 10, minHp: 1 },
            { type: "care", happiness: 1, discipline: -1 },
            {
              type: "message",
              text: "You swat Jellymon away. Happiness +1, Discipline −1. It scurries off laughing.",
        },
      ],
    },
    {
          label: "That's the last time you bother me (−2 Alignment)",
          mood: "angry",
          repeatable: false,
          outcomes: [
            { type: "damagePercent", percent: 10, minHp: 1 },
            { type: "care", alignment: -2 },
            {
              type: "message",
              text: "You've had enough. Alignment −2.",
            },
            {
              type: "fight",
              opponentId: "jellymon",
              combatProfile: { stage: "Child", tier: 2 },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
    {
      id: "cb_dagomon_sacrifice",
      speakerId: "dagomon",
      title: "Deep Domain",
      text: "Dagomon's tendrils rise from water too black for a beach. \"You have traveled too deep. This is my domain. Offer a sacrifice.\"",
      choices: [
        {
          label: "Offer yourself (+1 Discipline, −33% max HP)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: 1 },
            { type: "damagePercent", percent: 33 },
            {
              type: "message",
              text: "You yield a piece of yourself to the deep. Discipline +1.",
            },
          ],
        },
        {
          label: "Refuse",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You refuse. The water boils as Dagomon claims you as the offering instead!",
            },
            {
              type: "fight",
              opponentId: "dagomon",
              combatProfile: { stage: "Perfect", tier: 6 },
              rewardOnWin: { key: "cthulhuHeart", amount: 1, label: "Heart of Cthulhu" },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
  ],
  dragon_eye_lake: [
    {
      id: "del_seadramon_wish",
      speakerId: "seadramon",
      title: "Three Wishes",
      text: "Seadramon coils above the water, eyes gleaming. \"I grant three wishes… but in this game, the only one worth making is discovering a new place.\"",
      choices: [
        {
          label: "Wish to discover a new place",
          mood: "happy",
          outcomes: [
            { type: "unlockZones", zoneIds: ["beetle_land"] },
            { type: "banForever" },
            {
              type: "message",
              text: "Seadramon bows its head. \"Granted.\" The path to Beetle Land opens before you.",
            },
          ],
            },
          ],
        },
        {
      id: "del_sirenmon_song",
      speakerId: "sirenmon",
      title: "Lure of the Lake",
      text: "Drawn by a song over the water, you find Sirenmon perched on the rocks. Her voice curls around your thoughts, trying to pull you under.",
      choices: [
        {
          label: "Resist the song",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "discipline", op: "gte", value: 3 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You clamp down on the melody and keep walking. Sirenmon's song fades across the lake.",
            },
          ],
        },
        {
          label: "Give in",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The song wins. Sirenmon's smile turns sharp as she strikes!",
            },
            {
              type: "fight",
              opponentId: "sirenmon",
              combatProfile: { stage: "Perfect", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "keyItem", key: "sirensMirror", chance: 1, amount: 1 }],
            },
          ],
        },
      ],
    },
  ],
  drill_tunnel: [
    {
      id: "dt_drimogemon_dig",
      speakerId: "drimogemon",
      title: "Tunnel Dig",
      text: "Drimogemon paws the dirt eagerly. \"Feed me and I'll dig for treasure!\"",
      choices: [
        {
          label: "Give food and dig",
          mood: "happy",
          requireAnyFood: true,
          whenFail: "hide",
          repeatable: true,
          outcomes: [
            { type: "spendAnyFood" },
            {
              type: "grantWeightedLoot",
              entries: [
                { weight: 40, kind: "inventory", key: "smallHeal", label: "Small Heal" },
                { weight: 20, kind: "inventory", key: "mediumHeal", label: "Medium Heal" },
                { weight: 10, kind: "inventory", key: "largeHeal", label: "Large Heal" },
                { weight: 10, kind: "keyItem", key: "rustedSword", label: "Rusted Sword" },
                { weight: 10, kind: "none" },
                {
                  weight: 5,
                  kind: "keyItem",
                  key: "kismaKeyOfBaal",
                  label: "Kisma Key of Baal",
                },
                { weight: 5, kind: "inventory", key: "substanceX", label: "Substance X" },
          ],
        },
        {
              type: "message",
              text: "Drimogemon takes the food and dives into the earth.",
            },
          ],
        },
        {
          label: "Decline",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Drimogemon shrugs and goes back to scratching the tunnel floor.",
            },
          ],
        },
      ],
    },
  ],
  mt_panorama: [
    {
      id: "mp_renamon_training",
      speakerId: "renamon",
      title: "Extreme Training",
      text: "Renamon's eyes narrow. \"Train with me. My methods are harsh—but you'll grow stronger.\"",
      choices: [
        {
          label: "Train Attack (+1 Attack permanently, −50% max HP)",
          mood: "angry",
          outcomes: [
            { type: "attributes", attack: 1 },
            { type: "damagePercent", percent: 50, minHp: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Renamon pushes you through brutal drills. Attack +1 permanently. You leave battered (50% max HP).",
            },
          ],
        },
        {
          label: "Train Defense (+1 Defense permanently, −50% max HP)",
          mood: "angry",
          outcomes: [
            { type: "attributes", defense: 1 },
            { type: "damagePercent", percent: 50, minHp: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "You brace against relentless strikes. Defense +1 permanently. You leave battered (50% max HP).",
            },
          ],
        },
        {
          label: "Train Speed (+5 Speed permanently, −50% max HP)",
          mood: "angry",
          outcomes: [
            { type: "attributes", speed: 5 },
            { type: "damagePercent", percent: 50, minHp: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "You sprint the mountainside until your legs burn. Speed +5 permanently. You leave battered (50% max HP).",
            },
          ],
        },
        {
          label: "Train Intelligence (+5 Intelligence permanently, −50% max HP)",
          mood: "angry",
          outcomes: [
            { type: "attributes", intelligence: 5 },
            { type: "damagePercent", percent: 50, minHp: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Renamon drills you with tactics until your head spins. Intelligence +5 permanently. You leave battered (50% max HP).",
            },
          ],
        },
        {
          label: "Ignore her",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You decline. Renamon shrugs. \"Another time, then.\"",
            },
          ],
        },
      ],
    },
    {
      id: "mp_unimon_wounded",
      speakerId: "unimon",
      title: "Wounded Unimon",
      text: "Unimon lies on the mountainside, breathing hard. His coat is torn and his horn is cracked. \"Please… I need something to restore my strength.\"",
      choices: [
        {
          label: "Give an HP recovery item (+1 Reputation)",
          requireAnyHealItem: true,
          whenFail: "disable",
          disabledHint: "Need an HP recovery item.",
          mood: "happy",
          outcomes: [
            { type: "spendHealItem" },
            { type: "reputation", amount: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Unimon drinks the remedy and struggles to his hooves. \"You saved me. I won't forget this.\" Reputation +1.",
            },
          ],
        },
        {
          label: "Leave him",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You walk on. Unimon's labored breathing fades behind you.",
            },
          ],
        },
        {
          label: "Finish him (−3 Discipline, −3 Alignment)",
          mood: "angry",
          outcomes: [
            { type: "care", discipline: -3, alignment: -3 },
            {
              type: "item",
              key: "unicornHorn",
              amount: 1,
              label: "Unicorn Horn",
              chance: 0.2,
            },
            { type: "banForever" },
            {
              type: "message",
              text: "Unimon is too wounded to fight back. You end him. Discipline −3. Alignment −3.",
            },
          ],
        },
      ],
    },
    {
      id: "mp_vademon_ray",
      speakerId: "vademon",
      title: "Brain Drain",
      startOutcomes: [{ type: "zoneDebuff", stat: "intelligence" }],
      text: "Vademon fires a sickly green ray from its saucer. The beam claws at your thoughts, trying to siphon your brain!",
      choices: [
        {
          label: "Keep going",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You stagger onward with a buzzing skull. Intelligence is reduced for the rest of this zone.",
            },
          ],
        },
        {
          label: "Attack",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You lunge at the saucer before it can finish the scan!",
            },
            {
              type: "fight",
              opponentId: "vademon",
              stats: { hp: 16, attack: 4, defense: 3, speed: 3, intelligence: 6 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "alienPistol", chance: 0.2 }],
            },
          ],
        },
      ],
    },
  ],
  gear_savanna: [
    {
      id: "gs_piyomon_catch",
      speakerId: "piyomon",
      title: "Catch Challenge",
      text: "Piyomon hops just out of reach, wings flicking. \"Bet you can't catch me!\"",
      choices: [
        {
          label: "Chase Piyomon!",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Piyomon zigzags across the savanna and vanishes into the tall grass. Too slow!",
            },
            { type: "statCheck", mode: "critical", opponentId: "piyomon" },
          ],
          next: "caught",
        },
        {
          label: "Ignore her",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You wave her off. Piyomon squawks and flutters away.",
        },
      ],
    },
      ],
      nodes: {
        caught: {
          text: "You snag Piyomon mid-hop! She laughs and digs through her satchel. \"Okay, okay—you win! Take this!\"",
          choices: [
            {
              label: "Accept the prize",
              mood: "happy",
              repeatable: true,
              outcomes: [
                {
                  type: "grantRandomItem",
                  keys: [
                    "mediumHeal",
                    "steroids",
                    "aspirins",
                    "energyDrink",
                    "greenPurplePill",
                  ],
                },
                {
                  type: "message",
                  text: "Piyomon tosses you a random prize and flutters off, already planning the next race.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "gs_patamon_spar",
      speakerId: "patamon",
      title: "Friendly Spar",
      text: "Patamon floats down, bouncing with energy. \"Hey! Spar with me! I need a real fight!\"",
      choices: [
        {
          label: "Accept the spar (+1 Discipline)",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: 1 },
            {
              type: "message",
              text: "You take your stance. Discipline +1.",
            },
            {
              type: "fight",
              opponentId: "patamon",
              combatProfile: { stage: "Child", tier: 4 },
              incrementEventWinsOnWin: true,
            },
          ],
          next: "after_win",
        },
        {
          label: "Ignore Patamon (−1 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: -1 },
            {
              type: "message",
              text: "You walk past. Patamon droops. Discipline −1.",
        },
      ],
    },
  ],
      nodes: {
        after_win: {
          text: "Patamon lands hard, then grins. \"That was great! Rematch next time?\"",
          textVariants: [
            {
              when: { stat: "eventWins.gs_patamon_spar", op: "gte", value: 3 },
              text: "Patamon bows, out of breath. \"Okay… you're better. Congrats. I yield.\"",
            },
            {
              when: { stat: "eventWins.gs_patamon_spar", op: "eq", value: 2 },
              text: "Patamon shakes it off. \"Two losses… one more and I'll admit it! Rematch later!\"",
            },
            {
              when: { stat: "eventWins.gs_patamon_spar", op: "eq", value: 1 },
              text: "Patamon grins. \"Nice win! I'll get you next time—rematch later!\"",
            },
          ],
      choices: [
        {
              label: "Accept the praise (+1 Reputation)",
              whenFail: "hide",
              require: { stat: "eventWins.gs_patamon_spar", op: "gte", value: 3 },
          outcomes: [
                { type: "reputation", amount: 1 },
                { type: "banForever" },
                {
                  type: "message",
                  text: "Patamon salutes and flies off for good. Reputation +1.",
                },
          ],
        },
        {
              label: "See you around",
              whenFail: "hide",
              require: { stat: "eventWins.gs_patamon_spar", op: "lt", value: 3 },
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "Patamon waves. \"Don't get rusty—I'll find you again!\"",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "gs_elecmon_watch",
      speakerId: "elecmon",
      title: "Silent Watcher",
      text: "Elecmon stares across the savanna. You try to speak… but it says nothing.",
      choices: [
        {
          label: "Touch it",
          mood: "angry",
          outcomes: [
            { type: "damagePercent", percent: 10 },
            {
              type: "message",
              text: "A sharp jolt runs through you! Elecmon still won't speak.",
            },
          ],
          next: "touch_1",
        },
        {
          label: "Attack (−1 Alignment)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -1 },
            {
              type: "message",
              text: "You strike first. Alignment −1.",
            },
            {
              type: "fight",
              opponentId: "elecmon",
              combatProfile: { stage: "Child", tier: 4 },
              rewardOnWin: { key: "emptyBattery", amount: 1, label: "Empty Battery" },
              banForeverOnWin: true,
            },
          ],
        },
        {
          label: "Leave it in peace",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You step away. Elecmon keeps watching the horizon.",
            },
          ],
        },
      ],
      nodes: {
        touch_1: {
          text: "Elecmon flinches but stays put. Another touch…?",
          choices: [
            {
              label: "Touch it again",
              mood: "angry",
              outcomes: [
                { type: "damagePercent", percent: 20 },
                {
                  type: "message",
                  text: "A stronger shock hits you. Still silence.",
                },
              ],
              next: "touch_2",
            },
            {
              label: "Attack",
              mood: "angry",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You've had enough of the silence.",
                },
                {
                  type: "fight",
                  opponentId: "elecmon",
                  combatProfile: { stage: "Child", tier: 4 },
                  rewardOnWin: { key: "emptyBattery", amount: 1, label: "Empty Battery" },
                  banForeverOnWin: true,
                },
              ],
            },
            {
              label: "Flee",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You back off before another shock.",
                },
              ],
            },
          ],
        },
        touch_2: {
          text: "Sparks dance across Elecmon's fur. One more touch…?",
      choices: [
        {
              label: "Touch it a third time",
              mood: "happy",
              repeatable: false,
          outcomes: [
                { type: "damagePercent", percent: 30 },
                { type: "care", discipline: 3 },
                {
                  type: "keyItem",
                  key: "chargedBattery",
                  amount: 1,
                  label: "Charged Battery",
                },
                { type: "banForever" },
                {
                  type: "message",
                  text: "Elecmon finally speaks. \"I was testing your courage.\" It hands you a Charged Battery and bounds away. Discipline +3.",
                },
          ],
        },
        {
              label: "Attack",
              mood: "angry",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You decide the test is over.",
                },
                {
                  type: "fight",
                  opponentId: "elecmon",
                  combatProfile: { stage: "Child", tier: 4 },
                  rewardOnWin: { key: "emptyBattery", amount: 1, label: "Empty Battery" },
                  banForeverOnWin: true,
        },
      ],
    },
    {
              label: "Flee",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You retreat from the sparks.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "gs_nanimon_trash",
      speakerId: "nanimon",
      title: "Trash Tip",
      text: "Nanimon scowls and waves you off. \"Leave me alone!\"",
      textVariants: [
        {
          when: { stat: "discipline", op: "lte", value: -7 },
          text: "Nanimon sizes you up and grins. \"Heh. You're as rotten as I am. Know Trash Mountain? I'll show you—and take this.\"",
        },
        {
          when: { stat: "discipline", op: "gt", value: -7 },
          text: "Nanimon scowls and waves you off. \"Leave me alone!\"",
        },
      ],
      choices: [
        {
          label: "Learn the way to Trash Mountain",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "discipline", op: "lte", value: -7 },
          outcomes: [
            { type: "unlockZones", zoneIds: ["trash_mountain"] },
            { type: "item", key: "beerBottle", amount: 1, label: "Beer Bottle" },
            { type: "banForever" },
            {
              type: "message",
              text: "Nanimon scratches a crude map in the dirt and tosses you a Beer Bottle. Trash Mountain unlocked.",
            },
          ],
        },
        {
          label: "Leave him alone",
          whenFail: "hide",
          require: { stat: "discipline", op: "gt", value: -7 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Nanimon flees into the tall grass, muttering. \"Leave me alone!\"",
            },
          ],
        },
      ],
    },
  ],
  geko_swamp: [
    {
      id: "gk_blossomon_hungry",
      speakerId: "blossomon",
      title: "Hungry Blossomon",
      text: "Blossomon's many mouths snap toward you. \"I'm starving… that meat smells perfect.\"",
      choices: [
        {
          label: "Give food and escape (−1 Discipline)",
          requireAnyFood: true,
          whenFail: "hide",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "spendAnyFood" },
            { type: "care", discipline: -1 },
            {
              type: "message",
              text: "Blossomon swallows the food whole. You slip away while it chews. Discipline −1.",
            },
          ],
        },
        {
          label: "Fight",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You refuse. Blossomon lunges, hungry and furious!",
            },
            {
              type: "fight",
              opponentId: "blossomon",
              stats: {
                hp: 20,
                attack: 4,
                defense: 5,
                speed: 3,
                intelligence: 3,
              },
            },
          ],
        },
      ],
    },
  ],
  volume_villa: [],
  misty_trees: [
    {
      id: "mt_gabumon_jp",
      speakerId: "gabumon",
      title: "Japanese Version",
      text: "Gabumon folds its arms. \"I'm from the Japanese version. I'm jacked. And I'm not afraid of you.\"",
      choices: [
        {
          label: "Attack (+1 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: 1 },
            {
              type: "message",
              text: "You accept the challenge. Discipline +1. Gabumon flares with power!",
            },
            {
              type: "fight",
              opponentId: "gabumon",
              combatProfile: { stage: "Child", tier: 8 },
              opponentStartBuffs: true,
              banForeverOnWin: true,
              reputationOnWin: 1,
              dropsOnWin: [{ kind: "equipment", key: "garurumonCoat", chance: 0.2 }],
            },
          ],
        },
        {
          label: "Flee",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You back into the mist. Gabumon smirks and stays put.",
            },
          ],
        },
      ],
    },
    {
      id: "mt_cockatrimon_gaze",
      speakerId: "cockatrimon",
      title: "Stone Gaze",
      text: "You lock eyes with Cockatrimon. A chill runs through you—your limbs grow heavy as stone creeps across your skin…",
      choices: [
        {
          label: "Attack (start slowed)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You force your petrifying body into a fighting stance!",
            },
            {
              type: "fight",
              opponentId: "cockatrimon",
              combatProfile: { stage: "Adult", tier: 7 },
              playerStartDebuffs: ["slow"],
              banForeverOnWin: true,
              dropsOnWin: [
                { kind: "equipment", key: "cockatriceFeather", chance: 0.2 },
              ],
            },
          ],
          next: "after_win",
        },
        {
          label: "Escape (speed debuff for this zone)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "zoneDebuff", stat: "speed" },
            {
              type: "message",
              text: "You tear your gaze away and flee. Stone still clings to your legs—Speed is reduced for the rest of this zone.",
            },
          ],
        },
      ],
      nodes: {
        after_win: {
          text: "Cockatrimon falls. The stone settles into armor you can live with—your speed returns, and your defense hardens for this zone.",
          choices: [
            {
              label: "Embrace the stone skin",
              mood: "happy",
              outcomes: [
                { type: "clearZoneDebuff", stat: "speed" },
                { type: "zoneBuff", stat: "defense" },
                {
                  type: "message",
                  text: "You feel solid. Defense buffed for this zone run.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "mt_kyubimon_presence",
      speakerId: "kyubimon",
      title: "Foxfire Wisdom",
      text: "Kyubimon drifts through the mist, nine tails glowing with quiet foxfire. Her presence sharpens your mind.",
      choices: [
        {
          label: "Stand in her light (+5 Intelligence permanently)",
          mood: "happy",
          outcomes: [
            { type: "attributes", intelligence: 5 },
            { type: "banForever" },
            {
              type: "message",
              text: "A warm clarity settles over you. Intelligence +5 permanently. Kyubimon fades into the trees.",
            },
          ],
        },
      ],
    },
    {
      id: "mt_youkomon_omen",
      speakerId: "youkomon",
      title: "Ill Omen",
      text: "Youkomon stares from the mist, tails curling like smoke. Meeting its eyes feels like a curse.",
      choices: [
        {
          label: "Look away",
          mood: "angry",
          repeatable: false,
          outcomes: [
            {
              type: "message",
              text: "Bad luck clings to you. Youkomon melts back into the trees.",
            },
            { type: "zoneDebuffRandom", count: 2 },
          ],
        },
      ],
    },
  ],
  trash_mountain: [
    {
      id: "tm_blackkingnumemon_pride",
      speakerId: "blackkingnumemon",
      title: "Fallen King",
      text: "BlackKingNumemon draws himself up among the heaps. \"I come from another region—yet they expect a king to live on this mountain of garbage!\"",
      choices: [
        {
          label: "You're just a slug (+2 Discipline)",
          mood: "angry",
          outcomes: [
            { type: "care", discipline: 2 },
            { type: "banForever" },
            {
              type: "message",
              text: "His pride shatters. Discipline +2. BlackKingNumemon lunges at you!",
            },
            {
              type: "fight",
              opponentId: "blackkingnumemon",
              stats: {
                hp: 24,
                attack: 5,
                defense: 7,
                speed: 2,
                intelligence: 3,
              },
              rewardOnWin: { key: "blackCrown", amount: 1, label: "Black Crown" },
            },
          ],
        },
        {
          label: "Stay at a hotel in Toy Town (+1 Happiness)",
          mood: "happy",
          require: { stat: "unlocked.toy_town", op: "eq", value: 1 },
          whenFail: "hide",
          outcomes: [
            { type: "care", happiness: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "BlackKingNumemon straightens his crown. \"A hotel? In Toy Town? At last, lodging fit for a king.\" He waddles off. Happiness +1.",
            },
          ],
        },
      ],
    },
  ],
  toy_town: [
    {
      id: "tt_hagurumon_plea",
      speakerId: "hagurumon",
      title: "Toy Town Plea",
      text: "Hagurumon rattles in panic. \"Toy Town is enslaved by WaruMonzaemon! Please—help us free it!\"",
      choices: [
        {
          label: "Accept",
          mood: "happy",
          outcomes: [
            { type: "item", key: "mediumHeal", amount: 1, label: "Medium Heal" },
            {
              type: "message",
              text: "Hagurumon presses a Medium Heal into your hands. \"Thank you…\"",
            },
          ],
          next: "after_accept",
        },
        {
          label: "Attack Hagurumon (−2 Alignment)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -2 },
            {
              type: "message",
              text: "You turn on the messenger. Alignment −2.",
            },
            {
              type: "fight",
              opponentId: "hagurumon",
              combatProfile: { stage: "Child", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "gearRing", chance: 0.2 }],
            },
          ],
        },
      ],
      nodes: {
        after_accept: {
          text: "Hagurumon waits for your next move.",
          textVariants: [
            {
              when: { stat: "bossDefeated.warumonzaemon", op: "eq", value: 1 },
              text: "Hagurumon spins with relief. \"You already beat WaruMonzaemon! Take this—Toy Town is free!\"",
            },
            {
              when: { not: { stat: "bossDefeated.warumonzaemon", op: "eq", value: 1 } },
              text: "Hagurumon glances toward the factory shadows. \"WaruMonzaemon still rules here…\"",
            },
          ],
          choices: [
            {
              label: "Claim the Gear Ring (+1 Reputation)",
              require: { stat: "bossDefeated.warumonzaemon", op: "eq", value: 1 },
              whenFail: "hide",
              mood: "happy",
              repeatable: false,
              outcomes: [
                { type: "equipment", key: "gearRing", label: "Gear Ring" },
                { type: "reputation", amount: 1 },
                {
                  type: "message",
                  text: "Hagurumon awards you the Gear Ring. Reputation +1.",
                },
                { type: "banForever" },
              ],
            },
            {
              label: "Attack WaruMonzaemon",
              unless: { stat: "bossDefeated.warumonzaemon", op: "eq", value: 1 },
              whenFail: "hide",
              mood: "angry",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You march toward WaruMonzaemon's stage.",
                },
                {
                  type: "fight",
                  opponentId: "warumonzaemon",
                  dropsOnWin: [
                    { kind: "inventory", key: "nightmareBurrito", chance: 1, amount: 1 },
                  ],
                  stats: {
                    hp: 22,
                    attack: 6,
                    defense: 4,
                    speed: 3,
                    intelligence: 3,
                  },
                },
              ],
            },
            {
              label: "Continue",
              unless: { stat: "bossDefeated.warumonzaemon", op: "eq", value: 1 },
              whenFail: "hide",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You leave without anything new. Hagurumon still hopes you'll return.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "tt_burgermon_mama_patty",
      speakerId: "burgermon_mama",
      title: "The Perfect Burger",
      text: "Burgermon Mama flips imaginary ingredients with flair. \"I'm making the perfect hamburger… I've got everything except the patty!\"",
      choices: [
        {
          label: "Take the Incomplete Hamburger",
          mood: "happy",
          outcomes: [
            {
              type: "keyItem",
              key: "incompleteHamburger",
              amount: 1,
              label: "Incomplete Hamburger",
            },
            { type: "banForever" },
            {
              type: "message",
              text: "She presses a half-finished burger into your hands. \"Find me a patty and we finish this masterpiece!\"",
            },
          ],
        },
      ],
    },
    {
      id: "tt_goldnumemon_card",
      speakerId: "goldnumemon",
      title: "Shiny Score",
      text: "GoldNumemon waddles through Toy Town, clutching a glittering trading card. \"Mine! All mine!\"",
      choices: [
        {
          label: "Grab the card!",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "GoldNumemon slimes out of your grip and vanishes between the toys, card and all.",
            },
            { type: "statCheck", mode: "critical", opponentId: "goldnumemon" },
          ],
          next: "caught",
        },
        {
          label: "Let it go",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You let GoldNumemon waddle off, still hugging the card.",
            },
          ],
        },
      ],
      nodes: {
        caught: {
          text: "You snag GoldNumemon! The card slips free—a first edition holographic prize.",
          choices: [
            {
              label: "Take the card",
              mood: "happy",
              outcomes: [
                {
                  type: "keyItem",
                  key: "firstEditionCharizardCard",
                  amount: 1,
                  label: "First Edition Charizard Card",
                },
                { type: "banForever" },
                {
                  type: "message",
                  text: "GoldNumemon wails and slinks away. You pocket the First Edition Charizard Card. This treasure won't turn up again.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "tt_superstarmon_protagonist",
      speakerId: "superstarmon",
      title: "Main Character Energy",
      text: "Superstarmon strikes a pose in the middle of the street. \"I'm the protagonist of this game. Surrender. Hand over a usable item, or I'll write you out of the story.\"",
      choices: [
        {
          label: "Hand over an item",
          mood: "happy",
          requireAnyInventoryItem: true,
          whenFail: "disable",
          disabledHint: "You need a usable item to surrender.",
          repeatable: true,
          outcomes: [
            { type: "spendAnyItem" },
            {
              type: "message",
              text: "Superstarmon snatches your tribute and waves you aside. \"Good extra. Stay in the background.\"",
            },
          ],
        },
        {
          label: "Fight him",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You refuse to play supporting cast. Superstarmon's visor flares!",
            },
            {
              type: "fight",
              opponentId: "superstarmon",
              combatProfile: { stage: "Perfect", tier: 8 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "keyItem", key: "avariceChain", chance: 1, amount: 1 }],
            },
          ],
        },
      ],
    },
  ],
  factorial_town: [
    {
      id: "ft_terriermon_weapon",
      speakerId: "terriermon",
      title: "Looking for a Weapon",
      text: "Terriermon twitches an ear. \"I need a weapon to become Gaogamon… Got anything that looks the part?\"",
      choices: [
        {
          label: "Give the Toy Weapon (+1 Reputation)",
          mood: "happy",
          requireKeyItem: "toyWeapon",
          whenFail: "hide",
          outcomes: [
            { type: "keyItem", key: "toyWeapon", amount: -1, label: "Toy Weapon" },
            { type: "reputation", amount: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Terriermon's eyes light up. \"This is perfect! Thanks!\" He dashes off toward evolution. Reputation +1.",
            },
          ],
        },
        {
          label: "Ignore him",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You shrug. Terriermon sighs. \"Guess I'll keep looking…\"",
            },
          ],
        },
      ],
    },
    {
      id: "ft_burgermon_papa_patty",
      speakerId: "burgermon_papa",
      title: "The Perfect Patty",
      text: "Burgermon Papa stands over a sizzling pan. \"I came to fry the perfect patty for the hamburger—but I'm missing everything else!\"",
      choices: [
        {
          label: "Take the Burger Patty",
          mood: "happy",
          outcomes: [
            {
              type: "keyItem",
              key: "burgerPatty",
              amount: 1,
              label: "Burger Patty",
            },
            { type: "banForever" },
            {
              type: "message",
              text: "He wraps the hot patty carefully. \"Bring the rest of the burger and we'll assemble greatness!\"",
            },
          ],
        },
      ],
    },
    {
      id: "ft_guardromon_gold",
      speakerId: "guardromon_gold",
      title: "Golden Obsession",
      text: "Guardromon Gold flexes with a metallic gleam. \"I love gold. The look of it, the taste of it, the smell of it, the texture. I love gold so much that I even lost my g... in an unfortunate smelting accident. Hence the name...\"",
      choices: [
        {
          label: "Ignore what you just heard",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You decide not to process that sentence and keep walking.",
            },
          ],
        },
        {
          label: "Attack",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You've heard enough. You draw your weapon!",
            },
            {
              type: "fight",
              opponentId: "guardromon_gold",
              combatProfile: { stage: "Perfect", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [
                { kind: "keyItem", key: "goldmember", chance: 1, amount: 1 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ft_giromon_rampage",
      speakerId: "giromon",
      title: "Rampage",
      text: "Giromon tears through Factorial Town, smashing pipes and storefronts. Someone has to stop him.",
      choices: [
        {
          label: "Stop him (+2 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: 2 },
            {
              type: "message",
              text: "You step into his path. Discipline +2.",
            },
            {
              type: "fight",
              opponentId: "giromon",
              combatProfile: { stage: "Perfect", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "chainsaw", chance: 0.05 }],
            },
          ],
        },
        {
          label: "Run (−2 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: -2 },
            {
              type: "message",
              text: "You try to run. Giromon barrels after you anyway. Discipline −2.",
            },
            {
              type: "fight",
              opponentId: "giromon",
              combatProfile: { stage: "Perfect", tier: 7 },
              playerStartDebuffs: ["demoralized"],
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "chainsaw", chance: 0.05 }],
            },
          ],
        },
      ],
    },
    {
      id: "ft_andromon_server",
      speakerId: "andromon",
      title: "Server Room Alert",
      text: "Andromon's visor flashes. \"Someone is tearing through the server room. It must be stopped.\"",
      textVariants: [
        {
          when: { not: { stat: "banned.ft_giromon_rampage", op: "eq", value: 1 } },
          text: "Andromon's visor flashes. \"Someone is tearing through the server room. It must be stopped.\"",
        },
        {
          when: { stat: "banned.ft_giromon_rampage", op: "eq", value: 1 },
          text: "Andromon nods. \"The server room is stable again. You dealt with Giromon.\"",
        },
      ],
      choices: [
        {
          label: "I stopped Giromon (+1 Reputation)",
          mood: "happy",
          require: { stat: "banned.ft_giromon_rampage", op: "eq", value: 1 },
          whenFail: "hide",
          outcomes: [
            { type: "equipment", key: "metalCoat", label: "Metal Coat" },
            { type: "reputation", amount: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Andromon fits a Metal Coat onto you. \"The servers are safe.\" Reputation +1.",
            },
          ],
        },
        {
          label: "I'll look into it",
          unless: { stat: "banned.ft_giromon_rampage", op: "eq", value: 1 },
          whenFail: "hide",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Andromon points toward the server hall. \"Hurry. The damage is spreading.\"",
            },
          ],
        },
      ],
    },
    {
      id: "ft_metalgreymon_duel",
      speakerId: "metalgreymon",
      title: "Implant Trial",
      text: "MetalGreymon flexes a newly fitted cybernetic arm, servos whirring. \"I need a real fight to test these implants. Duel me.\"",
      choices: [
        {
          label: "Accept the duel",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "MetalGreymon grins behind the visor. \"Don't hold back.\"",
            },
            {
              type: "fight",
              opponentId: "metalgreymon",
              combatProfile: { stage: "Perfect", tier: 7 },
              banForeverOnWin: true,
              reputationOnWin: 1,
              dropsOnWin: [{ kind: "equipment", key: "cyberparts", chance: 1 }],
            },
          ],
        },
        {
          label: "Not now",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "MetalGreymon nods. \"Come back when you're ready to stress-test steel.\"",
            },
          ],
        },
      ],
    },
    {
      id: "ft_metalmamemon_implants",
      speakerId: "metalmamemon",
      title: "Factory Upgrade",
      text: "MetalMamemon taps a steel plate on his head. \"Any Digimon that needs implants should look here in Factorial Town. I used to be a plain Mamemon myself. If you want the upgrade, take these Cyber Parts.\"",
      choices: [
        {
          label: "We don't need tricks to advance (+3 Discipline)",
          outcomes: [
            { type: "care", discipline: 3 },
            { type: "banForever" },
            {
              type: "message",
              text: "MetalMamemon shrugs. \"Pride's a kind of armor too.\" Discipline +3.",
            },
          ],
        },
        {
          label: "Accept the Cyber Parts",
          mood: "happy",
          outcomes: [
            { type: "equipment", key: "cyberparts", label: "Cyber Parts" },
            { type: "banForever" },
            {
              type: "message",
              text: "He hands over a crate of Cyber Parts. \"Wear them well. This town built me.\"",
            },
          ],
        },
      ],
    },
  ],
  mt_infinity: [
    {
      id: "mi_beta_closed",
      speakerId: "mugendramon",
      title: "Sealed Peak",
      forceOnly: true,
      repeatable: true,
      text: "Mugendramon fills the path with steel. \"Mt. Infinity is closed for now. You may only turn back.\"",
      choices: [
        {
          label: "Turn back",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The peak stays sealed. You leave the mountain.",
            },
            { type: "endRun" },
          ],
        },
      ],
    },
  ],
  tropical_jungle: [
    {
      id: "tj_piccolomon_underestimate",
      speakerId: "piccolomon",
      title: "Too Small to Be Strong",
      unless: { stat: "keyItems.trainingManual", op: "gte", value: 1 },
      text: "A tiny Digimon bounces in the undergrowth. Piccolomon puffs up, fists clenched. Something so small couldn't possibly be that strong… right?",
      choices: [
        {
          label: "Ignore him",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You step around the little Digimon. Piccolomon huffs and vanishes into the leaves.",
        },
      ],
    },
    {
          label: "Attack",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You lunge—and Piccolomon hits back like a giant!",
            },
            {
              type: "fight",
              opponentId: "piccolomon",
              stats: {
                hp: 22,
                attack: 7,
                defense: 5,
                speed: 8,
                intelligence: 6,
              },
              rewardOnWin: { key: "trainingManual", amount: 1, label: "Training Manual" },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
    {
      id: "tj_koemon_thief",
      speakerId: "koemon",
      title: "Jungle Snatcher",
      startOutcomes: [{ type: "stealRandomInventoryItem" }],
      text: "Koemon peeks into your bag, finds nothing worth taking, and howls with laughter before vanishing.",
      textVariants: [
        {
          when: { stat: "hasStolenItem", op: "eq", value: 1 },
          text: "Koemon snatches your {stolenItem} and bolts into the trees!",
        },
        {
          when: { stat: "hasStolenItem", op: "eq", value: 0 },
          text: "Koemon peeks into your bag, finds nothing worth taking, and howls with laughter before vanishing.",
        },
      ],
      choices: [
        {
          label: "Chase after him!",
          mood: "angry",
          whenFail: "hide",
          require: { stat: "hasStolenItem", op: "eq", value: 1 },
          repeatable: true,
          outcomes: [{ type: "statCheck", stat: "speed" }],
          next: "caught",
        },
        {
          label: "Keep walking",
          whenFail: "hide",
          require: { stat: "hasStolenItem", op: "eq", value: 0 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You ignore the laughter and keep moving through the jungle.",
            },
          ],
        },
      ],
      nodes: {
        caught: {
          enterOutcomes: [{ type: "returnStolenItem" }],
          text: "You catch Koemon! He sheepishly returns your {stolenItem}. \"Sorry… I got carried away.\"",
          choices: [
            {
              label: "Accept the apology (+2 Discipline)",
              mood: "happy",
          outcomes: [
                { type: "care", discipline: 2 },
                { type: "banForever" },
                {
                  type: "message",
                  text: "You nod and let him go. Discipline +2.",
                },
              ],
            },
            {
              label: "Attack Koemon",
              mood: "angry",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "Apology refused. You draw your weapon!",
                },
            {
              type: "fight",
                  opponentId: "koemon",
                  combatProfile: { stage: "Child", tier: 5 },
                  banForeverOnWin: true,
            },
          ],
        },
      ],
    },
      },
    },
    {
      id: "tj_impmon_greylord",
      speakerId: "impmon",
      title: "Greylord's Mansion Invitation",
      text: "Impmon drops from the canopy, eyes gleaming. \"Greylord's mansion is looking for talent… the crooked kind. Interested?\"",
      choices: [
        {
          label: "Accept the invitation",
          mood: "happy",
          whenFail: "hide",
          require: {
            any: [
              {
                all: [
                  { stat: "attribute", op: "eq", value: "virus" },
                  { stat: "alignment", op: "lte", value: -1 },
                ],
              },
              {
                all: [
                  { stat: "attribute", op: "eq", value: "data" },
                  { stat: "alignment", op: "lte", value: -5 },
                ],
              },
            ],
          },
          outcomes: [
            { type: "unlockZones", zoneIds: ["greylords_mansion"] },
            { type: "banForever" },
            {
              type: "message",
              text: "Impmon cackles. \"Smart choice. Greylord will be waiting.\" The jungle fades as the invitation claims you…",
            },
            { type: "endRun" },
          ],
        },
        {
          label: "Attack Impmon",
          mood: "angry",
          whenFail: "hide",
          require: {
            all: [
              { stat: "attribute", op: "eq", value: "vaccine" },
              { stat: "alignment", op: "gte", value: 3 },
            ],
          },
          outcomes: [
            {
              type: "message",
              text: "You refuse his path and draw your weapon!",
            },
            {
              type: "fight",
              opponentId: "impmon",
              combatProfile: { stage: "Child", tier: 8 },
              banForeverOnWin: true,
            },
          ],
          next: "after_win",
        },
        {
          label: "Watch him flee",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Impmon snorts. \"Wrong crowd.\" He vanishes into the leaves before you can react.",
            },
          ],
        },
      ],
      nodes: {
        after_win: {
          text: "Impmon crumples. Among his scraps you find a crude map marked \"Greylord's Mansion\"—you now know the way.",
      choices: [
        {
              label: "Take the map",
          outcomes: [
            { type: "unlockZones", zoneIds: ["greylords_mansion"] },
            {
              type: "message",
                  text: "The path to Greylord's Mansion is unlocked.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "tj_vegimon_rainplant",
      speakerId: "vegimon",
      title: "Hungry Garden",
      text: "Vegimon drools over a patch of dirt. \"Got anything green for me? A Rain Plant would make this jungle bloom…\"",
      choices: [
        {
          label: "Give the Rain Plant (+10 Meat, +1 Reputation)",
          mood: "happy",
          requireKeyItem: "rainPlant",
          whenFail: "hide",
          outcomes: [
            { type: "keyItem", key: "rainPlant", amount: -1, label: "Rain Plant" },
            { type: "meat", amount: 10 },
            { type: "reputation", amount: 1 },
            { type: "banForever" },
            {
              type: "message",
              text: "Vegimon plants it at once and dumps a pile of meat at your feet. \"Delicious dirt!\" Meat +10, Reputation +1.",
        },
      ],
    },
    {
          label: "Ignore Vegimon",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You walk on. Vegimon shrugs and goes back to chewing leaves.",
            },
          ],
        },
      ],
    },
    {
      id: "tj_lilimon_aroma",
      speakerId: "lilimon",
      title: "Sweet Aroma",
      text: "A heady floral scent fills the jungle. Lilimon drifts closer, petals shimmering. The aroma tugs at your thoughts…",
      choices: [
        {
          label: "Resist the aroma",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "discipline", op: "gte", value: 1 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You steel yourself and push through the perfume. Lilimon's song fades behind you.",
            },
          ],
        },
        {
          label: "Give in",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The scent wins. Lilimon's petals flare as she attacks!",
            },
            {
              type: "fight",
              opponentId: "lilimon",
              combatProfile: { stage: "Perfect", tier: 4 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "lilimonPetals", chance: 0.2 }],
            },
          ],
        },
      ],
    },
  ],
  dino_region: [
    {
      id: "dr_vmon_second_fiddle",
      speakerId: "v_mon",
      title: "Eternal Second",
      text: "V-mon kicks at the dirt. \"It's tough always being the eternal second of the series…\"",
      choices: [
        {
          label: "I don't know who you are (−1 Alignment)",
          mood: "angry",
          outcomes: [
            { type: "care", alignment: -1 },
            { type: "banForever" },
            {
              type: "message",
              text: "V-mon's ears droop. \"…Oh.\" He walks off, crushed. Alignment −1.",
            },
          ],
        },
        {
          label: "You were always my favorite (+2 Happiness)",
          mood: "happy",
          outcomes: [
            { type: "care", happiness: 2 },
            { type: "banForever" },
            {
              type: "message",
              text: "V-mon lights up. \"Really?! That means a lot!\" He trots away grinning. Happiness +2.",
            },
          ],
        },
        {
          label: "Duel to forget your sorrows",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "V-mon cracks a smile. \"Yeah… a fight sounds perfect.\"",
            },
            {
              type: "fight",
              opponentId: "v_mon",
              combatProfile: { stage: "Child", tier: 5 },
              banForeverOnWin: true,
            },
          ],
          next: "after_win",
        },
        {
          label: "Ignore him (−2 Discipline)",
          mood: "angry",
          outcomes: [
            { type: "care", discipline: -2 },
            { type: "banForever" },
            {
              type: "message",
              text: "You walk past without a word. V-mon stares after you. Discipline −2.",
            },
          ],
        },
      ],
      nodes: {
        after_win: {
          text: "V-mon sprawls on the ground, laughing between breaths. \"That… that helped. Thanks.\"",
          choices: [
            {
              label: "Glad you're feeling better (+2 Discipline)",
              mood: "happy",
              outcomes: [
                { type: "care", discipline: 2 },
                {
                  type: "message",
                  text: "You nod. He waves and heads off for good. Discipline +2.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "dr_vdramon_challenge",
      speakerId: "v_dramon",
      title: "V-dramon's Trial",
      text: "V-dramon looks you up and down, then snorts. \"You're not even Perfect. Don't waste my time.\"",
      textVariants: [
        {
          when: { stat: "stage", op: "in", value: ["Perfect", "Ultimate"] },
          text: "V-dramon blocks the canyon path, wings spread. \"A Perfect, at last. Fight me. Now.\"",
        },
        {
          when: { not: { stat: "stage", op: "in", value: ["Perfect", "Ultimate"] } },
          text: "V-dramon looks you up and down, then snorts. \"You're not even Perfect. Don't waste my time.\"",
        },
      ],
      choices: [
        {
          label: "Stand and fight",
          mood: "angry",
          whenFail: "hide",
          require: { stat: "stage", op: "in", value: ["Perfect", "Ultimate"] },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "V-dramon gives you no chance to refuse.",
            },
            {
              type: "fight",
              opponentId: "v_dramon",
              combatProfile: { stage: "Adult", tier: 7 },
              banForeverOnWin: true,
              reputationOnWin: 1,
              dropsOnWin: [{ kind: "equipment", key: "vDramonHorn", chance: 0.2 }],
            },
          ],
        },
        {
          label: "Leave",
          whenFail: "hide",
          require: { not: { stat: "stage", op: "in", value: ["Perfect", "Ultimate"] } },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "V-dramon turns away in contempt. Come back when you've evolved.",
            },
          ],
        },
      ],
    },
  ],
  great_canyon: [
    {
      id: "gc_shellmon_stuck",
      speakerId: "shellmon",
      title: "Wedged Tight",
      text: "Shellmon is jammed in a canyon crack, waving a flipper. \"I'm stuck! I need help—but you can't reach me from this side!\"",
      choices: [
        {
          label: "I'll find another way",
          mood: "happy",
          repeatable: false,
          outcomes: [
            {
              type: "message",
              text: "You promise to look for a path around the rock. Shellmon calls after you, \"Hurry!\"",
            },
          ],
        },
        {
          label: "Leave for now",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You leave Shellmon wedged in the stone. The canyon still echoes with muffled complaints.",
            },
          ],
        },
      ],
    },
    {
      id: "gc_shellmon_rescue",
      speakerId: "shellmon",
      title: "The Other Side",
      requireConsumedEvents: ["gc_shellmon_stuck"],
      text: "You come around the far cliff—and there's Shellmon's other end. One good shove and the shell pops free!",
      choices: [
        {
          label: "Help Shellmon out (+1 Reputation)",
          mood: "happy",
          outcomes: [
            { type: "reputation", amount: 1 },
            { type: "banForever" },
            { type: "banForever", eventId: "gc_shellmon_stuck" },
            {
              type: "message",
              text: "Shellmon dusts off a newspaper. \"I'll publish your heroics! Front page!\" Reputation +1.",
            },
          ],
        },
      ],
    },
    {
      id: "gc_togemon_rumor",
      speakerId: "togemon",
      title: "Canyon Rumor",
      text: "Togemon leans in. \"Have you heard? Ogremon is gathering an army of the strongest Digimon. Some say it's to defend the island. Others say it's to conquer it.\"",
      choices: [
        {
          label: "Keep talking",
          mood: "happy",
          outcomes: [
            {
              type: "message",
              text: "Togemon nods, glad you're listening.",
            },
          ],
          next: "more",
        },
        {
          label: "Not interested",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You walk off. Togemon shrugs. \"Your loss.\"",
            },
          ],
        },
      ],
      nodes: {
        more: {
          text: "\"I don't know where the fortress is… but with enough reputation, you might get in.\"",
          choices: [
            {
              label: "Okay",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "You take the rumor and move on.",
                },
              ],
            },
            {
              label: "Duel Togemon",
              mood: "angry",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "Togemon raises its gloves. \"Let's see if you're army material!\"",
                },
                {
                  type: "fight",
                  opponentId: "togemon",
                  combatProfile: { stage: "Adult", tier: 6 },
                  banForeverOnWin: true,
                  reputationOnWin: 1,
                  dropsOnWin: [
                    { kind: "equipment", key: "boxingGloves", chance: 1 },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "gc_starmon_invite",
      speakerId: "starmon",
      title: "Star Invitation",
      text: "Starmon looks you over, then turns away. \"You're nobody. Don't waste my time.\"",
      textVariants: [
        {
          when: { stat: "reputation", op: "gte", value: 10 },
          text: "Starmon's visor gleams. \"You've made a name for yourself. Ogremon wants Digimon with reputation. I'll show you to the fortress.\"",
        },
        {
          when: { stat: "reputation", op: "lt", value: 10 },
          text: "Starmon looks you over, then turns away. \"You're nobody. Don't waste my time.\"",
        },
      ],
      choices: [
        {
          label: "Accept the invitation",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "reputation", op: "gte", value: 10 },
          outcomes: [
            { type: "unlockZones", zoneIds: ["ogremons_fortress"] },
            { type: "banForever" },
            {
              type: "message",
              text: "Starmon points toward the canyon rim. \"Ogremon's Fortress is that way. Don't embarrass us.\" Ogremon's Fortress unlocked.",
            },
          ],
        },
        {
          label: "Leave",
          whenFail: "hide",
          require: { stat: "reputation", op: "lt", value: 10 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Starmon ignores you completely. You'll need more reputation before this star notices you.",
            },
          ],
        },
      ],
    },
    {
      id: "gc_garudamon_help",
      speakerId: "garudamon",
      title: "Mesa Summit",
      text: "You stand at the summit of a Great Canyon mesa. Garudamon spirals down from the sky, lands before you, and asks if you need help.",
      choices: [
        {
          label: "Yes, I need help",
          mood: "happy",
          repeatable: true,
          outcomes: [
            { type: "heal", amount: 5 },
            {
              type: "message",
              text: "Garudamon carries you to a sheltered ledge and mends your wounds. Recovered 5 HP.",
            },
          ],
        },
        {
          label: "I've come to challenge you",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Garudamon's wings flare. \"Then prove your strength!\"",
            },
            {
              type: "fight",
              opponentId: "garudamon",
              combatProfile: { stage: "Perfect", tier: 6 },
              rewardOnWin: { key: "phoenixFeather", amount: 1, label: "Phoenix Feather" },
              banForeverOnWin: true,
            },
          ],
        },
      ],
    },
  ],
  freezeland: [
    {
      id: "fl_whamon_factorial",
      speakerId: "whamon",
      title: "Crossing to Factorial Town",
      unless: { stat: "unlocked.factorial_town", op: "eq", value: 1 },
      text: "Whamon surfaces through a crack in the ice. \"I could take you to Factorial Town… but I'm not strong enough to make the trip.\"",
      choices: [
        {
          label: "Give a Stat Buff",
          mood: "happy",
          requireAnyStatBuffItem: true,
          whenFail: "hide",
          outcomes: [
            { type: "spendStatBuffItem" },
            { type: "unlockZones", zoneIds: ["factorial_town"] },
            { type: "banForever" },
            {
              type: "message",
              text: "Whamon takes the boost and the ice splits as he swells with power. \"Now I can make the crossing.\" Factorial Town unlocked.",
            },
          ],
        },
        {
          label: "Not now",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Whamon sinks back under the ice. \"Come back if you find something to strengthen me.\"",
            },
          ],
        },
      ],
    },
    {
      id: "fl_plotmon_care",
      speakerId: "plotmon",
      title: "Snowy Concern",
      text: "Plotmon tilts its head. \"You look exhausted… Want me to heal you?\"",
      textVariants: [
        {
          when: { stat: "attribute", op: "eq", value: "virus" },
          text: "Plotmon glances at you, then looks away as if you aren't there.",
        },
        {
          when: {
            any: [
              { stat: "attribute", op: "eq", value: "vaccine" },
              { stat: "attribute", op: "eq", value: "data" },
            ],
          },
          text: "Plotmon tilts its head. \"You look exhausted… Want me to heal you?\"",
        },
      ],
      choices: [
        {
          label: "Accept healing (+20 HP)",
          mood: "happy",
          whenFail: "hide",
          require: {
            any: [
              { stat: "attribute", op: "eq", value: "vaccine" },
              { stat: "attribute", op: "eq", value: "data" },
            ],
          },
          repeatable: true,
          outcomes: [
            { type: "heal", amount: 20 },
            {
              type: "message",
              text: "Plotmon's soft glow eases your wounds. Recovered 20 HP.",
            },
          ],
        },
        {
          label: "Attack Plotmon (−3 Alignment)",
          mood: "angry",
          whenFail: "hide",
          require: {
            any: [
              { stat: "attribute", op: "eq", value: "vaccine" },
              { stat: "attribute", op: "eq", value: "data" },
            ],
          },
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -3 },
            {
              type: "message",
              text: "You turn on the helper. Alignment −3.",
            },
            {
              type: "fight",
              opponentId: "plotmon",
              combatProfile: { stage: "Child", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [
                { kind: "equipment", key: "sacredCollar", chance: 0.2 },
              ],
            },
          ],
        },
        {
          label: "Attack Plotmon",
          mood: "angry",
          whenFail: "hide",
          require: { stat: "attribute", op: "eq", value: "virus" },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Even ignored, you decide to strike!",
            },
            {
              type: "fight",
              opponentId: "plotmon",
              combatProfile: { stage: "Child", tier: 7 },
              banForeverOnWin: true,
              dropsOnWin: [
                { kind: "equipment", key: "sacredCollar", chance: 0.2 },
              ],
            },
          ],
        },
        {
          label: "Walk away",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You leave Plotmon on the ice and keep moving.",
            },
          ],
        },
      ],
    },
    {
      id: "fl_garurumon_rematch",
      speakerId: "garurumon",
      title: "Ice Challenge",
      text: "Garurumon plants its paws in the snow, blue eyes locked on you. \"Fight me.\"",
      choices: [
        {
          label: "Accept the challenge",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You take your stance across the ice.",
            },
            {
              type: "fight",
              opponentId: "garurumon",
              combatProfile: { stage: "Adult", tier: 8 },
            },
          ],
          next: "after_win",
        },
        {
          label: "Flee (−1 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", discipline: -1 },
            {
              type: "message",
              text: "You turn away from the challenge. Discipline −1. Garurumon watches you go.",
            },
          ],
        },
      ],
      nodes: {
        after_win: {
          text: "Garurumon shakes off the snow. \"You only won because you didn't come at the proper hour. I want a rematch.\"",
          choices: [
            {
              label: "Fine—see you another time",
              mood: "happy",
              repeatable: true,
              outcomes: [
                {
                  type: "message",
                  text: "Garurumon nods. \"Don't be late next time.\" The rematch remains open.",
                },
              ],
            },
            {
              label: "No. Enough excuses (+1 Reputation, +1 Discipline)",
              mood: "angry",
              outcomes: [
                { type: "reputation", amount: 1 },
                { type: "care", discipline: 1 },
                { type: "banForever" },
                {
                  type: "message",
                  text: "Garurumon pauses, then bows its head. \"…You're right.\" Reputation +1, Discipline +1.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "fl_penmon_curling",
      speakerId: "penmon",
      title: "Icy Curling",
      text: "Penmon slides a stone across the ice. \"Curling! Win and I'll give you a prize!\"",
      choices: [
        {
          label: "Play along",
          mood: "happy",
          outcomes: [
            {
              type: "message",
              text: "You take a turn… then notice the ice lanes are slanted toward Penmon's house.",
            },
          ],
          next: "rigged",
        },
      ],
      nodes: {
        rigged: {
          text: "Halfway through, it's obvious—the game is rigged.",
          choices: [
            {
              label: "Confront Penmon and leave (+1 Discipline)",
              mood: "angry",
              repeatable: true,
          outcomes: [
                { type: "care", discipline: 1 },
                {
                  type: "message",
                  text: "You call out the cheat and walk off the ice. Discipline +1.",
                },
              ],
            },
            {
              label: "Attack Penmon (−2 Discipline)",
              mood: "angry",
              repeatable: true,
              outcomes: [
                { type: "care", discipline: -2 },
                {
                  type: "message",
                  text: "You lose your temper. Discipline −2.",
                },
                {
                  type: "fight",
                  opponentId: "penmon",
                  combatProfile: { stage: "Child", tier: 1 },
                  banForeverOnWin: true,
                  dropsOnWin: [
                    { kind: "inventory", key: "digiseabass", chance: 1, amount: 1 },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "fl_yukidarumon_blizzard",
      speakerId: "yukidarumon",
      title: "Blizzard",
      text: "A blizzard howls across Freezeland. Through the snow, you glimpse Yukidarumon in the distance.",
      textVariants: [
        {
          when: { stat: "hpPercent", op: "lte", value: 20 },
          text: "A blizzard howls across Freezeland. Yukidarumon waddles out of the white-out and wraps you in warm fur.",
        },
        {
          when: { stat: "hpPercent", op: "gt", value: 20 },
          text: "A blizzard howls across Freezeland. Through the snow, you glimpse Yukidarumon in the distance.",
        },
      ],
      choices: [
        {
          label: "Accept Yukidarumon's help (HP to 75%)",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "hpPercent", op: "lte", value: 20 },
          repeatable: true,
          outcomes: [
            { type: "healToPercent", percent: 75 },
            {
              type: "message",
              text: "Yukidarumon shelters you until the storm eases. Your HP is restored to 75%.",
            },
          ],
        },
        {
          label: "Keep walking",
          whenFail: "hide",
          require: { stat: "hpPercent", op: "gt", value: 20 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You ignore the distant shape and press on through the blizzard.",
            },
          ],
        },
      ],
    },
    {
      id: "fl_sistermon_blanc_invite",
      speakerId: "sistermon_blanc",
      title: "Ice Sanctuary Invitation",
      unless: { stat: "unlocked.ice_sanctuary", op: "eq", value: 1 },
      text: "Sistermon Blanc stands in the snow, eyes closed in prayer. She does not look at you.",
      textVariants: [
        {
          when: {
            any: [
              {
                all: [
                  { stat: "attribute", op: "eq", value: "data" },
                  { stat: "alignment", op: "gte", value: 7 },
                ],
              },
              {
                all: [
                  { stat: "attribute", op: "eq", value: "vaccine" },
                  { stat: "alignment", op: "gte", value: 3 },
                ],
              },
            ],
          },
          text: "Sistermon Blanc opens her eyes and smiles. \"Your heart is clear. Ice Sanctuary would welcome you. Come.\"",
        },
        {
          when: {
            not: {
              any: [
                {
                  all: [
                    { stat: "attribute", op: "eq", value: "data" },
                    { stat: "alignment", op: "gte", value: 7 },
                  ],
                },
                {
                  all: [
                    { stat: "attribute", op: "eq", value: "vaccine" },
                    { stat: "alignment", op: "gte", value: 3 },
                  ],
                },
              ],
            },
          },
          text: "Sistermon Blanc stands in the snow, eyes closed in prayer. She does not look at you.",
        },
      ],
      choices: [
        {
          label: "Accept the invitation",
          mood: "happy",
          whenFail: "hide",
          require: {
            any: [
              {
                all: [
                  { stat: "attribute", op: "eq", value: "data" },
                  { stat: "alignment", op: "gte", value: 7 },
                ],
              },
              {
                all: [
                  { stat: "attribute", op: "eq", value: "vaccine" },
                  { stat: "alignment", op: "gte", value: 3 },
                ],
              },
            ],
          },
          outcomes: [
            { type: "unlockZones", zoneIds: ["ice_sanctuary"] },
            { type: "banForever" },
            {
              type: "message",
              text: "Sistermon Blanc leads you from Freezeland. Ice Sanctuary is unlocked.",
            },
            { type: "endRun" },
          ],
        },
        {
          label: "Leave",
          whenFail: "hide",
          require: {
            not: {
              any: [
                {
                  all: [
                    { stat: "attribute", op: "eq", value: "data" },
                    { stat: "alignment", op: "gte", value: 7 },
                  ],
                },
                {
                  all: [
                    { stat: "attribute", op: "eq", value: "vaccine" },
                    { stat: "alignment", op: "gte", value: 3 },
                  ],
                },
              ],
            },
          },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Sistermon Blanc keeps praying as if you were not there.",
            },
          ],
        },
      ],
    },
    {
      id: "fl_chohakkaimon_hungry",
      speakerId: "chohakkaimon",
      title: "Fallen Appetite",
      text: "ChoHakkaimon hunches in the snow, clutching her stomach. \"I'm starving… got any meat?\"",
      choices: [
        {
          label: "Give her food (+1 Alignment)",
          requireAnyFood: true,
          whenFail: "hide",
          mood: "happy",
          outcomes: [
            { type: "spendAnyFood" },
            { type: "care", alignment: 1 },
          ],
          next: "after_meal",
        },
        {
          label: "Walk away",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "ChoHakkaimon watches you go, still hungry.",
            },
          ],
        },
      ],
      nodes: {
        after_meal: {
          text: "ChoHakkaimon wolfs it down, then sighs. \"I used to be an angel living in the Kernel. They expelled me. If you want in… the entrance is in Ice Sanctuary.\"",
          choices: [
            {
              label: "Thank her and leave",
              mood: "happy",
              outcomes: [
                { type: "banForever" },
                {
                  type: "message",
                  text: "ChoHakkaimon waves you off, already hunting for another meal. Alignment +1.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "fl_zudomon_forge",
      speakerId: "zudomon",
      title: "Frozen Forge",
      text: "You find Zudomon at a frost-rimed forge, hammer ringing on Chrome Digizoid. Steam rolls off the anvil. \"Need a real weapon? Bring Chrondigizoit\u2014or try taking mine.\"",
      choices: [
        {
          label: "Forge Thor's Hammer",
          mood: "happy",
          requireKeyItem: "chrondigizoit",
          whenFail: "hide",
          outcomes: [
            { type: "keyItem", key: "chrondigizoit", amount: -1, label: "Chrondigizoit" },
            { type: "equipment", key: "thorsHammer", label: "Thor's Hammer" },
            { type: "banForever" },
            {
              type: "message",
              text: "Zudomon works the ore into a thunderous mallet and slams it into your hands. \"Wield it with respect.\"",
            },
          ],
        },
        {
          label: "Leave",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You leave the forge ringing behind you. Zudomon keeps working.",
            },
          ],
        },
        {
          label: "Attack and take his hammer (\u22122 Alignment)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", alignment: -2 },
            {
              type: "message",
              text: "You lunge for the hammer. Alignment \u22122. Zudomon bellows and raises his own!",
            },
            {
              type: "fight",
              opponentId: "zudomon",
              combatProfile: { stage: "Perfect", tier: 8 },
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "thorsHammer", chance: 1 }],
            },
          ],
        },
      ],
    },
  ],
  ogremons_fortress: [
    {
      id: "of_beta_closed",
      speakerId: "ogremon",
      title: "Closed Gates",
      forceOnly: true,
      repeatable: true,
      text: "Ogremon blocks the fortress gate with his club. \"Place is closed for now. Beat it. You can only go back.\"",
      choices: [
        {
          label: "Turn back",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The gates stay shut. You leave the fortress.",
            },
            { type: "endRun" },
          ],
        },
          ],
        },
        {
      id: "of_galgomon_resistance",
      speakerId: "galgomon",
      title: "Resistance Supplies",
      text: "Galgomon racks a clip and grins. \"You here to join the resistance too? Take some supplies.\"",
      choices: [
        {
          label: "Take heals (+3 Medium Heals)",
          mood: "happy",
          outcomes: [
            { type: "item", key: "mediumHeal", amount: 3, label: "Medium Heal" },
            { type: "banForever" },
            {
              type: "message",
              text: "Galgomon tosses you three Medium Heals. \"Stay alive out there.\"",
            },
          ],
        },
        {
          label: "Take stimulants (one of each buff)",
          mood: "happy",
          outcomes: [
            { type: "item", key: "steroids", amount: 1, label: "Steroids" },
            { type: "item", key: "aspirins", amount: 1, label: "Aspirins" },
            { type: "item", key: "energyDrink", amount: 1, label: "Energy Drink" },
            { type: "item", key: "greenPurplePill", amount: 1, label: "Green-Purple Pill" },
            { type: "banForever" },
            {
              type: "message",
              text: "Galgomon dumps a full stimulant kit in your bag. \"Hit hard. Hit fast.\"",
            },
          ],
        },
        {
          label: "Take weapon (Gaogamon Machine Gun)",
          mood: "happy",
          outcomes: [
            {
              type: "equipment",
              key: "gaogamonMachineGun",
              label: "Gaogamon Machine Gun",
            },
            { type: "banForever" },
            {
              type: "message",
              text: "Galgomon hands over the Gaogamon Machine Gun. \"Don't point it at allies.\"",
            },
          ],
        },
        {
          label: "Attack Galgomon (−2 Alignment)",
          mood: "angry",
          outcomes: [
            { type: "care", alignment: -2 },
            {
              type: "message",
              text: "You turn on the resistance. Alignment −2.",
            },
            {
              type: "fight",
              opponentId: "galgomon",
              stats: {
                hp: 18,
                attack: 5,
                defense: 4,
                speed: 5,
                intelligence: 3,
              },
              banForeverOnWin: true,
            },
          ],
          next: "after_win",
        },
      ],
      nodes: {
        after_win: {
          text: "Galgomon goes down. His entire supply stash is yours for the taking.",
          choices: [
            {
              label: "Take everything",
              mood: "angry",
              outcomes: [
                { type: "item", key: "mediumHeal", amount: 3, label: "Medium Heal" },
                { type: "item", key: "steroids", amount: 1, label: "Steroids" },
                { type: "item", key: "aspirins", amount: 1, label: "Aspirins" },
                { type: "item", key: "energyDrink", amount: 1, label: "Energy Drink" },
                { type: "item", key: "greenPurplePill", amount: 1, label: "Green-Purple Pill" },
                {
                  type: "equipment",
                  key: "gaogamonMachineGun",
                  label: "Gaogamon Machine Gun",
                },
                {
                  type: "message",
                  text: "You loot heals, stimulants, and the Gaogamon Machine Gun.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "of_igamon_ambush",
      speakerId: "igamon",
      title: "Ninja Ambush",
      text: "Igamon drops from the rafters, blade drawn. \"You—what are you doing in Ogremon's fortress?\"",
      textVariants: [
        {
          when: { not: { stat: "bossDefeated.ogremon", op: "eq", value: 1 } },
          text: "Igamon drops from the rafters, blade drawn. \"You—what are you doing in Ogremon's fortress?\"",
        },
        {
          when: { stat: "bossDefeated.ogremon", op: "eq", value: 1 },
          text: "Igamon lands softly, eyes sharp. \"You… you're the one who took down Ogremon.\"",
        },
      ],
      choices: [
        {
          label: "I'm here to serve Ogremon's army",
          mood: "angry",
          whenFail: "hide",
          unless: { stat: "bossDefeated.ogremon", op: "eq", value: 1 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Igamon's glare hardens. \"A thrall of Ogremon? Then fall here!\"",
            },
            {
              type: "fight",
              opponentId: "igamon",
              stats: {
                hp: 16,
                attack: 5,
                defense: 3,
                speed: 6,
                intelligence: 3,
              },
              banForeverOnWin: true,
              dropsOnWin: [
                { kind: "equipment", key: "poisonedDagger", chance: 1 },
              ],
            },
          ],
        },
        {
          label: "I'm here to end Ogremon",
          mood: "happy",
          whenFail: "hide",
          unless: { stat: "bossDefeated.ogremon", op: "eq", value: 1 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Igamon sheaths his blade and smirks. \"A shared target. Good. I'll leave you to it.\"",
        },
      ],
    },
    {
          label: "I already defeated Ogremon",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "bossDefeated.ogremon", op: "eq", value: 1 },
          outcomes: [
            {
              type: "equipment",
              key: "ninjaStars",
              label: "Ninja Stars",
            },
            { type: "banForever" },
            {
              type: "message",
              text: "Igamon bows and presses Ninja Stars into your hands. \"Then our paths part as allies.\"",
            },
          ],
        },
      ],
    },
    {
      id: "of_darkknightmon_scorn",
      speakerId: "darkknightmon",
      title: "Unworthy",
      text: "DarkKnightmon looks down at you from behind his visor. \"You are worth less than the Troopmon I command. I cannot fathom why they let you through.\"",
      choices: [
        {
          label: "Flee (−2 Happiness, −2 Discipline)",
          mood: "angry",
          repeatable: true,
          outcomes: [
            { type: "care", happiness: -2, discipline: -2 },
            {
              type: "message",
              text: "You slink away under his stare. Happiness −2, Discipline −2.",
            },
          ],
        },
        {
          label: "Fight",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You refuse his scorn and draw your weapon!",
            },
            {
              type: "fight",
              opponentId: "darkknightmon",
              stats: {
                hp: 22,
                attack: 6,
                defense: 6,
                speed: 4,
                intelligence: 4,
              },
              reputationOnWin: 1,
              banForeverOnWin: true,
              dropsOnWin: [{ kind: "equipment", key: "darkLance", chance: 1 }],
            },
          ],
        },
      ],
    },
  ],
  ice_sanctuary: [
    {
      id: "is_beta_closed",
      speakerId: "angemon",
      title: "Sanctuary Closed",
      forceOnly: true,
      repeatable: true,
      text: "Angemon raises a hand before the ice doors. \"The Ice Sanctuary is closed for now. You may only turn back.\"",
      choices: [
        {
          label: "Turn back",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The sanctuary remains sealed. You leave the cathedral.",
            },
            { type: "endRun" },
          ],
        },
      ],
    },
  ],
  beetle_land: [
    {
      id: "bl_turuiemon_tournament",
      speakerId: "turuiemon",
      title: "No Bugs Allowed",
      text: "Turuiemon kicks at the dirt. \"I came all this way for the tournament—and they only let insects in! Fine. You look strong enough. Spar with me instead.\"",
      choices: [
        {
          label: "Accept the challenge",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Turuiemon drops into a stance. \"Show me what a non-insect can do!\"",
            },
            {
              type: "fight",
              opponentId: "turuiemon",
              combatProfile: { stage: "Adult", tier: 8 },
            },
          ],
          next: "after_win",
        },
        {
          label: "Not now",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Turuiemon snorts. \"Whatever. I'll be around.\"",
            },
          ],
        },
      ],
      nodes: {
        after_win: {
          text: "Turuiemon sits back, impressed. \"Okay… you can fight. That'll do.\"",
          choices: [
            {
              label: "Good match (+1 Discipline, +1 Reputation)",
              mood: "happy",
              outcomes: [
                { type: "care", discipline: 1 },
                { type: "reputation", amount: 1 },
                { type: "banForever" },
                {
                  type: "message",
                  text: "You bump fists and part ways. Discipline +1, Reputation +1.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "bl_cannonbeemon_expel",
      speakerId: "cannonbeemon",
      title: "Leave This Land",
      text: "Cannonbeemon lowers its stinger cannon at you. \"You've caused enough trouble in Beetle Land. Get out.\"",
      choices: [
        {
          label: "Leave",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You back away. Cannonbeemon watches until you're gone.",
            },
            { type: "endRun" },
          ],
        },
        {
          label: "Fight",
          mood: "angry",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You refuse to leave. Cannonbeemon locks its cannon on you!",
            },
            {
              type: "fight",
              opponentId: "cannonbeemon",
              combatProfile: { stage: "Perfect", tier: 7 },
              dropsOnWin: [{ kind: "equipment", key: "stingerCannon", chance: 0.1 }],
            },
          ],
        },
      ],
    },
  ],
  greylords_mansion: [
    {
      id: "gm_beta_closed",
      speakerId: "bakemon",
      title: "Mansion Closed",
      forceOnly: true,
      repeatable: true,
      text: "Bakemon drifts in front of the doors. \"No guests today. Greylord's Mansion is closed for now. You can only go back.\"",
      choices: [
        {
          label: "Turn back",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The mansion stays dark. You leave the grounds.",
            },
            { type: "endRun" },
          ],
        },
          ],
        },
        {
      id: "gm_picodevimon_summons",
      speakerId: "picodevimon",
      title: "Mansion Summons",
      text: "PicoDevimon blocks the corridor, smirking. \"You've caused enough damage in this mansion. Myotismon wants an audience with you.\"",
      choices: [
        {
          label: "Accept the audience",
          mood: "angry",
          outcomes: [
            { type: "banForever" },
            { type: "queueEvent", eventId: "gm_myotismon_audience" },
            {
              type: "message",
              text: "PicoDevimon cackles. \"This way… Myotismon is waiting.\"",
            },
          ],
        },
        {
          label: "Refuse and stay",
          mood: "happy",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "You brush past PicoDevimon. The mansion's halls remain open to you—for now.",
            },
          ],
        },
      ],
    },
    {
      id: "gm_wizarmon_ritual",
      speakerId: "wizarmon",
      title: "Gates to Hell",
      text: "Wizarmon leans on his staff. \"Vamdemon is only a puppet of the Seven Demon Lords. There is a ritual that can open the gates to Hell—but it needs seven ingredients: Siren's Mirror, Bottomless Goblet, Avarice Chain, Drowsy Incense, Cinder Heart, Spiteful Needle, and Monarch's Banner. Return when you have them all.\"",
      textVariants: [
        {
          when: { stat: "demonLordIngredients", op: "eq", value: 7 },
          text: "Wizarmon's eyes gleam. \"You have all seven ingredients. The circle can be drawn… when you are ready to open the gates to Hell. Come back then.\"",
        },
        {
          when: {
            all: [
              { stat: "demonLordIngredients", op: "gte", value: 1 },
              { stat: "demonLordIngredients", op: "lte", value: 6 },
            ],
          },
          text: "Wizarmon studies your bag. \"Vamdemon is a puppet of the Seven Demon Lords. The ritual still needs seven ingredients. You hold {demonLordIngredients} of 7: {demonLordIngredientNames}. Return when you have them all.\"",
        },
        {
          when: { stat: "demonLordIngredients", op: "eq", value: 0 },
          text: "Wizarmon leans on his staff. \"Vamdemon is only a puppet of the Seven Demon Lords. There is a ritual that can open the gates to Hell—but it needs seven ingredients: Siren's Mirror, Bottomless Goblet, Avarice Chain, Drowsy Incense, Cinder Heart, Spiteful Needle, and Monarch's Banner. Return when you have them all.\"",
        },
      ],
      choices: [
        {
          label: "I'll find the ingredients",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "demonLordIngredients", op: "lt", value: 7 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Wizarmon nods. \"The Demon Lords' relics are scattered. Do not return empty-handed.\"",
            },
          ],
        },
        {
          label: "I'll return when ready",
          mood: "happy",
          whenFail: "hide",
          require: { stat: "demonLordIngredients", op: "eq", value: 7 },
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "Wizarmon traces a sigil in the air. \"Then the gates will wait.\"",
            },
          ],
        },
      ],
    },
    {
      id: "gm_myotismon_audience",
      speakerId: "picodevimon",
      title: "Audience with Myotismon",
      forceOnly: true,
      text: "PicoDevimon ushers you toward a dark throne room… Myotismon's audience awaits. (Coming soon.)",
      choices: [
        {
          label: "Continue exploring",
          repeatable: true,
          outcomes: [
            {
              type: "message",
              text: "The audience is postponed. You step back into the mansion.",
            },
          ],
        },
      ],
    },
  ],
  cocytus: [],
  kernel: [],
};
