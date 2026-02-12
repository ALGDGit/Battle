import * as dom from "./dom.js";
import {
  INVENTORY_CONFIG,
  STAGE_ORDER,
  type InventoryKey,
  type Stage,
} from "./constants.js";
import { resetRunState, state, type Character } from "./state.js";

const {
  singlePlayerButton,
  arenaModeButton,
  exitButton,
  mainMenu,
  arenaMenu,
  arenaPlayerList,
  arenaOpponentList,
  arenaStartButton,
  arenaBackButton,
  characterMenu,
  playerList,
  startGameButton,
  backButton,
  actionMenu,
  actionBackButton,
  feedButton,
  trainButton,
  battleButton,
  finalChallengeButton,
  weightCounter,
  winRateDisplay,
  caretakerSprite,
  caretakerName,
  caretakerStage,
  caretakerHp,
  caretakerTypeIcon,
  consumableStatus,
  trainingCounter,
  feedMenu,
  feedBackButton,
  feedMeatButton,
  feedSpriteSlot,
  feedFoodSprite,
  feedFoodContainer,
  feedMushroomButton,
  mushroomCount,
  feedPepperButton,
  pepperCount,
  feedBlueAppleButton,
  blueAppleCount,
  feedMedicineButton,
  medicineCount,
  feedYellowPearButton,
  yellowPearCount,
  feedStormCloudButton,
  stormCloudCount,
  feedPoisonVialButton,
  poisonVialCount,
  feedBeerBottleButton,
  beerBottleCount,
  feedFocusLensButton,
  focusLensCount,
  feedAegisCharmButton,
  aegisCharmCount,
  feedAdrenalSeedButton,
  adrenalSeedCount,
  feedEchoShellButton,
  echoShellCount,
  feedNullPowderButton,
  nullPowderCount,
  feedWeightedAnkletButton,
  weightedAnkletCount,
  feedRationPackButton,
  rationPackCount,
  feedMutationCoreButton,
  mutationCoreCount,
  feedLuckyTokenButton,
  luckyTokenCount,
  feedLastStandEmblemButton,
  lastStandEmblemCount,
  trainMenu,
  trainBackButton,
  trainFill,
  trainStatus,
  trainRetryButton,
  trainSpriteSlot,
  trainBag,
  evolutionScreen,
  evolutionOld,
  evolutionNew,
  evolutionMessage,
  evolutionContinue,
  gameoverScreen,
  gameoverSprite,
  gameoverContinue,
  congratsScreen,
  congratsSprite,
  congratsContinue,
  battleScreen,
  battleBackButton,
  finalChallengeModal,
  finalChallengeConfirmButton,
  finalChallengeCancelButton,
  actionBackModal,
  actionBackConfirmButton,
  actionBackCancelButton,
  battlePlayerName,
  battleOpponentName,
  battlePlayerHp,
  battleOpponentHp,
  battleLog,
  battlePlayerSprite,
  battleOpponentSprite,
  battleField,
  playerStatusParalyzed,
  playerStatusPoisoned,
  playerStatusConfused,
  opponentStatusParalyzed,
  opponentStatusPoisoned,
  opponentStatusConfused,
} = dom;

const inventoryUi = {
  mushroom: { count: mushroomCount, button: feedMushroomButton },
  pepper: { count: pepperCount, button: feedPepperButton },
  blueApple: { count: blueAppleCount, button: feedBlueAppleButton },
  medicine: { count: medicineCount, button: feedMedicineButton },
  yellowPear: { count: yellowPearCount, button: feedYellowPearButton },
  stormCloud: { count: stormCloudCount, button: feedStormCloudButton },
  poisonVial: { count: poisonVialCount, button: feedPoisonVialButton },
  beerBottle: { count: beerBottleCount, button: feedBeerBottleButton },
  focusLens: { count: focusLensCount, button: feedFocusLensButton },
  aegisCharm: { count: aegisCharmCount, button: feedAegisCharmButton },
  adrenalSeed: { count: adrenalSeedCount, button: feedAdrenalSeedButton },
  echoShell: { count: echoShellCount, button: feedEchoShellButton },
  nullPowder: { count: nullPowderCount, button: feedNullPowderButton },
  weightedAnklet: { count: weightedAnkletCount, button: feedWeightedAnkletButton },
  rationPack: { count: rationPackCount, button: feedRationPackButton },
  mutationCore: { count: mutationCoreCount, button: feedMutationCoreButton },
  luckyToken: { count: luckyTokenCount, button: feedLuckyTokenButton },
  lastStandEmblem: { count: lastStandEmblemCount, button: feedLastStandEmblemButton },
};

const consumableLabels = Object.fromEntries(
  INVENTORY_CONFIG.map((item) => [item.activeKey, item.label])
);

type BattleRole = "player" | "opponent";
type StageOrHybrid = Stage | "Armor-Hybrid";
type EggOption = {
  id: string;
  label: string;
  spriteFramesPath: string;
  baby: Character | null;
  hatchedCharacter: Character | null;
};

type EggDefinition = {
  id: string;
  label: string;
  spriteFramesPath: string;
};
type AttackAction = {
  name: "final attack" | "special attack" | "standard attack";
  damage: number;
  status: string;
  displayName?: string;
  heal?: number | "full";
  critKill?: boolean;
  critDamage?: number;
  statusChance?: number;
  hitChance?: number;
  oneHitKO?: boolean;
};

function isStage(value: unknown): value is Stage {
  return STAGE_ORDER.includes(value as Stage);
}

function getStageIndex(value: unknown): number {
  return isStage(value) ? STAGE_ORDER.indexOf(value) : -1;
}

function canUseSpecialAttack(character: Character): boolean {
  if (!character) {
    return false;
  }
  if (character.stage === "Armor-Hybrid") {
    return true;
  }
  return getStageIndex(character.stage) >= 2;
}

const EGG_PROGRESS_KEY = "unlockedEggs";
const EGG_BABY_MAP_KEY = "eggBabyMapV1";
const HISTORY_PLAYED_KEY = "historyPlayedCharacterIds";
const EGG_DEFINITIONS: EggDefinition[] = [
  { id: "egg-agu-2006", label: "Agu2006 Egg", spriteFramesPath: "sprites/Digitama/Agu2006_Digitama" },
  { id: "egg-agu", label: "Agu Egg", spriteFramesPath: "sprites/Digitama/Agu_Digitama" },
  { id: "egg-angora", label: "Angora Egg", spriteFramesPath: "sprites/Digitama/Angora_Digitama" },
  { id: "egg-baku", label: "Baku Egg", spriteFramesPath: "sprites/Digitama/Baku_Digitama" },
  { id: "egg-bear", label: "Bear Egg", spriteFramesPath: "sprites/Digitama/Bear_Digitama" },
  { id: "egg-beta", label: "Beta Egg", spriteFramesPath: "sprites/Digitama/Beta_Digitama" },
  { id: "egg-blackguil", label: "BlackGuil Egg", spriteFramesPath: "sprites/Digitama/BlackGuil_Digitama" },
  { id: "egg-bluco", label: "Bluco Egg", spriteFramesPath: "sprites/Digitama/Bluco_Digitama" },
  { id: "egg-cand", label: "Cand Egg", spriteFramesPath: "sprites/Digitama/Cand_Digitama" },
  { id: "egg-commandra", label: "Commandra Egg", spriteFramesPath: "sprites/Digitama/Commandra_Digitama" },
  { id: "egg-elec", label: "Elec Egg", spriteFramesPath: "sprites/Digitama/Elec_Digitama" },
  { id: "egg-espi", label: "Espi Egg", spriteFramesPath: "sprites/Digitama/Espi_Digitama" },
  { id: "egg-flora", label: "Flora Egg", spriteFramesPath: "sprites/Digitama/Flora_Digitama" },
  { id: "egg-funbee", label: "Funbee Egg", spriteFramesPath: "sprites/Digitama/Funbee_Digitama" },
  { id: "egg-gabublack", label: "GabuBlack Egg", spriteFramesPath: "sprites/Digitama/GabuBlack_Digitama" },
  { id: "egg-gabu", label: "Gabu Egg", spriteFramesPath: "sprites/Digitama/Gabu_Digitama" },
  { id: "egg-gao", label: "Gao Egg", spriteFramesPath: "sprites/Digitama/Gao_Digitama" },
  { id: "egg-gazi", label: "Gazi Egg", spriteFramesPath: "sprites/Digitama/Gazi_Digitama" },
  { id: "egg-ghost", label: "Ghost Egg", spriteFramesPath: "sprites/Digitama/Ghost_Digitama" },
  { id: "egg-goma", label: "Goma Egg", spriteFramesPath: "sprites/Digitama/Goma_Digitama" },
  { id: "egg-guil", label: "Guil Egg", spriteFramesPath: "sprites/Digitama/Guil_Digitama" },
  { id: "egg-heriss", label: "Heriss Egg", spriteFramesPath: "sprites/Digitama/Heriss_Digitama" },
  { id: "egg-hyoko", label: "Hyoko Egg", spriteFramesPath: "sprites/Digitama/Hyoko_Digitama" },
  { id: "egg-imp", label: "Imp Egg", spriteFramesPath: "sprites/Digitama/Imp_Digitama" },
  { id: "egg-kame", label: "Kame Egg", spriteFramesPath: "sprites/Digitama/Kame_Digitama" },
  { id: "egg-kera", label: "Kera Egg", spriteFramesPath: "sprites/Digitama/Kera_Digitama" },
  { id: "egg-koe", label: "Koe Egg", spriteFramesPath: "sprites/Digitama/Koe_Digitama" },
  { id: "egg-kuda-2006", label: "Kuda2006 Egg", spriteFramesPath: "sprites/Digitama/Kuda2006_Digitama" },
  { id: "egg-kuda", label: "Kuda Egg", spriteFramesPath: "sprites/Digitama/Kuda_Digitama" },
  { id: "egg-kune", label: "Kune Egg", spriteFramesPath: "sprites/Digitama/Kune_Digitama" },
  { id: "egg-lala", label: "Lala Egg", spriteFramesPath: "sprites/Digitama/Lala_Digitama" },
  { id: "egg-lioll", label: "Lioll Egg", spriteFramesPath: "sprites/Digitama/Lioll_Digitama" },
  { id: "egg-lop", label: "Lop Egg", spriteFramesPath: "sprites/Digitama/Lop_Digitama" },
  { id: "egg-luce", label: "Luce Egg", spriteFramesPath: "sprites/Digitama/Luce_Digitama" },
  { id: "egg-ludo", label: "Ludo Egg", spriteFramesPath: "sprites/Digitama/Ludo_Digitama" },
  { id: "egg-meicoo", label: "Meicoo Egg", spriteFramesPath: "sprites/Digitama/Meicoo_Digitama" },
  { id: "egg-monodra", label: "Monodra Egg", spriteFramesPath: "sprites/Digitama/Monodra_Digitama" },
  { id: "egg-morpho", label: "Morpho Egg", spriteFramesPath: "sprites/Digitama/Morpho_Digitama" },
  { id: "egg-mush", label: "Mush Egg", spriteFramesPath: "sprites/Digitama/Mush_Digitama" },
  { id: "egg-pal", label: "Pal Egg", spriteFramesPath: "sprites/Digitama/Pal_Digitama" },
  { id: "egg-pata", label: "Pata Egg", spriteFramesPath: "sprites/Digitama/Pata_Digitama" },
  { id: "egg-pawnchessblack", label: "PawnChessBlack Egg", spriteFramesPath: "sprites/Digitama/PawnChessBlack_Digitama" },
  { id: "egg-pawnchesswhite", label: "PawnChessWhite Egg", spriteFramesPath: "sprites/Digitama/PawnChessWhite_Digitama" },
  { id: "egg-phasco", label: "Phasco Egg", spriteFramesPath: "sprites/Digitama/Phasco_Digitama" },
  { id: "egg-picodevi", label: "PicoDevi Egg", spriteFramesPath: "sprites/Digitama/PicoDevi_Digitama" },
  { id: "egg-piyo", label: "Piyo Egg", spriteFramesPath: "sprites/Digitama/Piyo_Digitama" },
  { id: "egg-plot", label: "Plot Egg", spriteFramesPath: "sprites/Digitama/Plot_Digitama" },
  { id: "egg-pulse", label: "Pulse Egg", spriteFramesPath: "sprites/Digitama/Pulse_Digitama" },
  { id: "egg-rena", label: "Rena Egg", spriteFramesPath: "sprites/Digitama/Rena_Digitama" },
  { id: "egg-sunariza", label: "Sunariza Egg", spriteFramesPath: "sprites/Digitama/Sunariza_Digitama" },
  { id: "egg-swim", label: "Swim Egg", spriteFramesPath: "sprites/Digitama/Swim_Digitama" },
  { id: "egg-tento", label: "Tento Egg", spriteFramesPath: "sprites/Digitama/Tento_Digitama" },
  { id: "egg-terrier", label: "Terrier Egg", spriteFramesPath: "sprites/Digitama/Terrier_Digitama" },
  { id: "egg-v", label: "V Egg", spriteFramesPath: "sprites/Digitama/V_Digitama" },
  { id: "egg-vorvo", label: "Vorvo Egg", spriteFramesPath: "sprites/Digitama/Vorvo_Digitama" },
  { id: "egg-worm", label: "Worm Egg", spriteFramesPath: "sprites/Digitama/Worm_Digitama" },
  { id: "egg-zuba", label: "Zuba Egg", spriteFramesPath: "sprites/Digitama/Zuba_Digitama" },
];

singlePlayerButton.addEventListener("click", () => {
  state.mode = "history";
  mainMenu.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  characterMenu.classList.remove("hidden");
  if (state.characters.length === 0) {
    loadCharacters();
  }
  resetSession();
  resetRunState();
  updateWeight();
  updateTraining();
  updateInventory();
  updateConsumableStatus();
  startGameButton.disabled = true;
  renderCharacterLists();
  startSpritePreview();
});

arenaModeButton.addEventListener("click", () => {
  state.mode = "arena";
  mainMenu.classList.add("hidden");
  characterMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  arenaMenu.classList.remove("hidden");
  if (state.characters.length === 0) {
    loadCharacters();
  }
  renderArenaLists();
  startSpritePreview();
});

exitButton.addEventListener("click", () => {
  console.log("Exit selected");
});

backButton.addEventListener("click", () => {
  state.mode = null;
  characterMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  stopSpritePreview();
});

startGameButton.addEventListener("click", () => {
  if (!state.player) {
    return;
  }
  markHistoryCharacterPlayed(state.player);
  stopSpritePreview();
  openActionMenu();
});

actionBackButton.addEventListener("click", async () => {
  const proceed = await showActionBackPopup();
  if (!proceed) {
    return;
  }
  actionMenu.classList.add("hidden");
  feedMenu.classList.add("hidden");
  battleScreen.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  state.mode = null;
  stopSpritePreview();
  stopFeedingPreview();
  resetSession();
  resetRunState();
  updateWeight();
  updateTraining();
  updateInventory();
  updateConsumableStatus();
  updateCaretakerInfo();
});

arenaBackButton.addEventListener("click", () => {
  arenaMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  state.mode = null;
  state.player = null;
  state.opponent = null;
  arenaPlayerSelection = null;
  arenaOpponentSelection = null;
  stopSpritePreview();
});

arenaStartButton.addEventListener("click", () => {
  if (!arenaPlayerSelection || !arenaOpponentSelection) {
    return;
  }
  state.player = arenaPlayerSelection;
  state.opponent = arenaOpponentSelection;
  arenaMenu.classList.add("hidden");
  startBattle();
});

feedButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  feedMenu.classList.remove("hidden");
  startFeedingPreview(false);
});

trainButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  trainMenu.classList.remove("hidden");
  startTraining();
});

battleButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  startBattle();
});

finalChallengeButton.addEventListener("click", async () => {
  const proceed = await showFinalChallengePopup();
  if (!proceed) {
    return;
  }
  state.finalChallenge = true;
  actionMenu.classList.add("hidden");
  startBattle();
});

function showFinalChallengePopup(): Promise<boolean> {
  return new Promise((resolve) => {
    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const close = (accepted: boolean) => {
      finalChallengeModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
      finalChallengeConfirmButton.removeEventListener("click", onConfirm);
      finalChallengeCancelButton.removeEventListener("click", onCancel);
      finalChallengeModal.removeEventListener("click", onBackdropClick);
      window.removeEventListener("keydown", onKeydown);
      if (previousFocused) {
        previousFocused.focus();
      }
      resolve(accepted);
    };

    const onConfirm = () => close(true);
    const onCancel = () => close(false);
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === finalChallengeModal) {
        close(false);
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    };

    finalChallengeModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    finalChallengeConfirmButton.addEventListener("click", onConfirm);
    finalChallengeCancelButton.addEventListener("click", onCancel);
    finalChallengeModal.addEventListener("click", onBackdropClick);
    window.addEventListener("keydown", onKeydown);
    finalChallengeConfirmButton.focus();
  });
}

function showActionBackPopup(): Promise<boolean> {
  return new Promise((resolve) => {
    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const close = (accepted: boolean) => {
      actionBackModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
      actionBackConfirmButton.removeEventListener("click", onConfirm);
      actionBackCancelButton.removeEventListener("click", onCancel);
      actionBackModal.removeEventListener("click", onBackdropClick);
      window.removeEventListener("keydown", onKeydown);
      if (previousFocused) {
        previousFocused.focus();
      }
      resolve(accepted);
    };

    const onConfirm = () => close(true);
    const onCancel = () => close(false);
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === actionBackModal) {
        close(false);
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    };

    actionBackModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    actionBackConfirmButton.addEventListener("click", onConfirm);
    actionBackCancelButton.addEventListener("click", onCancel);
    actionBackModal.addEventListener("click", onBackdropClick);
    window.addEventListener("keydown", onKeydown);
    actionBackConfirmButton.focus();
  });
}

feedBackButton.addEventListener("click", () => {
  feedMenu.classList.add("hidden");
  stopFeedingPreview();
  openActionMenu();
});

trainBackButton.addEventListener("click", () => {
  stopTraining();
  trainMenu.classList.add("hidden");
  openActionMenu();
});

trainRetryButton.addEventListener("click", () => {
  startTraining();
});

evolutionContinue.addEventListener("click", () => {
  evolutionScreen.classList.add("hidden");
  openActionMenu();
});

gameoverContinue.addEventListener("click", () => {
  stopEndScreen();
  gameoverScreen.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

congratsContinue.addEventListener("click", () => {
  stopEndScreen();
  congratsScreen.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

feedMeatButton.addEventListener("click", () => {
  state.weight += 1;
  updateWeight();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_meat.svg";
    feedFoodSprite.alt = "Meat";
  }
  startFeedingPreview(true);
});

bindInventoryFeedActions();
setupItemHoverDescriptions();

battleBackButton.addEventListener("click", () => {
  endBattle();
  battleScreen.classList.add("hidden");
  if (state.mode === "arena") {
    arenaMenu.classList.remove("hidden");
    startSpritePreview();
    return;
  }
  openActionMenu();
});

function bindInventoryFeedActions() {
  INVENTORY_CONFIG.forEach((item) => {
    const button = inventoryUi[item.key]?.button;
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      if (state.inventory[item.key] <= 0) {
        return;
      }
      state.inventory[item.key] -= 1;
      updateInventory();
      if (feedFoodSprite) {
        feedFoodSprite.src = item.asset;
        feedFoodSprite.alt = item.alt;
      }
      if (item.activeKey === "ration_pack") {
        state.trainingAutoSuccessCharges += 1;
        logBattle("Ration Pack stored: next missed training can be saved.");
      } else if (item.activeKey === "last_stand_emblem") {
        state.lastStandCharges += 1;
        logBattle("Last Stand Emblem stored: one revive charge gained.");
      } else {
        state.activeConsumable = item.activeKey;
      }
      updateConsumableStatus();
      startFeedingPreview(true);
    });
  });
}

function setupItemHoverDescriptions() {
  if (feedMeatButton) {
    feedMeatButton.classList.add("has-tooltip");
    feedMeatButton.dataset.tooltip = "Meat: Infinite supply.";
  }
  INVENTORY_CONFIG.forEach((item) => {
    const button = inventoryUi[item.key]?.button;
    if (!button) {
      return;
    }
    button.classList.add("has-tooltip");
    button.dataset.tooltip = item.label;
  });
}

async function loadCharacters() {
  try {
    const response = await fetch("data/characters.json");
    if (!response.ok) {
      throw new Error("Failed to load character data");
    }
    const data = await response.json();
    const rawCharacters = Array.isArray(data) ? data : data.characters || [];
    state.characters = rawCharacters.map(normalizeCharacter);
    renderCharacterLists();
    renderArenaLists();
  } catch (error) {
    console.error(error);
  }
}

function normalizeCharacter(character: Character): Character {
  const attacks = Array.isArray(character.attacks) ? character.attacks : [];
  const hasStandard = attacks.some(
    (attack) =>
      attack.name &&
      attack.name.toLowerCase() === "standard attack" &&
      attack.power === 0 &&
      attack.hit === 1000 &&
      attack.status === "none"
  );

  return {
    ...character,
    attacks: hasStandard
      ? attacks
      : [
          {
            name: "standard attack",
            power: 0,
            hit: 1000,
            status: "none",
          },
          ...attacks,
        ],
  };
}

function renderCharacterLists() {
  playerList.innerHTML = "";
  const eggOptions = getEggSelectionOptions();
  state.randomBabies = eggOptions.map((egg) => egg.baby).filter(Boolean);
  eggOptions.forEach((egg) => {
    const playerCard = createEggCard(egg);
    playerList.append(playerCard);
  });
}

let arenaPlayerSelection: Character | null = null;
let arenaOpponentSelection: Character | null = null;

function renderArenaLists() {
  arenaPlayerList.innerHTML = "";
  arenaOpponentList.innerHTML = "";
  arenaPlayerSelection = null;
  arenaOpponentSelection = null;
  state.player = null;
  state.opponent = null;

  const available = getArenaAvailableCharacters();
  if (available.length === 0) {
    const message = document.createElement("p");
    message.className = "character-meta";
    message.textContent = "No characters unlocked for Arena yet. Play History Mode first.";
    arenaPlayerList.append(message);
    arenaOpponentList.append(message.cloneNode(true));
    updateArenaStartButtonState();
    return;
  }

  available.forEach((character) => {
    arenaPlayerList.append(createArenaCharacterCard(character, "arena-player"));
    arenaOpponentList.append(createArenaCharacterCard(character, "arena-opponent"));
  });
  updateArenaStartButtonState();
}

function createArenaCharacterCard(character: Character, scope: "arena-player" | "arena-opponent") {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "character-card";
  card.dataset.id = String(character.id ?? "");
  card.dataset.scope = scope;

  if (character.spriteFramesPath) {
    const frame = document.createElement("div");
    frame.className = "character-sprite-frame";
    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${character.spriteFramesPath}/frame_00.png`;
    sprite.alt = character.name ? `${character.name} sprite` : "Character sprite";
    sprite.dataset.basePath = `data/${character.spriteFramesPath}`;
    frame.append(sprite);
    card.append(frame);
  }

  const name = document.createElement("h3");
  name.className = "character-name";
  name.textContent = character.name || "Unknown";

  const meta = document.createElement("p");
  meta.className = "character-meta";
  const metaParts = [
    character.type,
    character.element,
    character.stage ? `Stage: ${character.stage}` : null,
    typeof character.power === "number" ? `Power: ${character.power}` : null,
  ].filter(Boolean);
  meta.textContent = metaParts.length
    ? metaParts.join(" · ")
    : character.description || "No description yet.";

  card.append(name, meta);
  card.addEventListener("click", () => {
    if (scope === "arena-player") {
      arenaPlayerSelection = character;
      updateSelection(arenaPlayerList, character.id);
    } else {
      arenaOpponentSelection = character;
      updateSelection(arenaOpponentList, character.id);
    }
    updateArenaStartButtonState();
  });
  return card;
}

function updateArenaStartButtonState() {
  const ready = Boolean(arenaPlayerSelection && arenaOpponentSelection);
  arenaStartButton.disabled = !ready;
}

function createEggCard(egg: EggOption) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "character-card";
  card.dataset.id = egg.id;

  if (egg.spriteFramesPath) {
    const frame = document.createElement("div");
    frame.className = "character-sprite-frame";

    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${egg.spriteFramesPath}/frame_00.png`;
    sprite.alt = `${egg.label} sprite`;
    sprite.dataset.basePath = `data/${egg.spriteFramesPath}`;
    sprite.dataset.previewMode = "egg";
    sprite.dataset.frameIndex = "0";

    frame.append(sprite);
    card.append(frame);
  }

  const name = document.createElement("h3");
  name.className = "character-name";
  name.textContent = egg.label;

  const meta = document.createElement("p");
  meta.className = "character-meta";
  meta.textContent = "Stage: Egg · Click to hatch";

  card.append(name, meta);

  card.addEventListener("click", () => {
    if (!egg.hatchedCharacter) {
      const sprite = card.querySelector<HTMLImageElement>(".character-sprite");
      if (!sprite) {
        return;
      }
      sprite.dataset.previewMode = "egg-selected";
      sprite.dataset.lockedFrame = "02";
      sprite.src = `data/${egg.spriteFramesPath}/frame_02.png`;

      const selected = pickEggBaby(egg.baby);
      egg.hatchedCharacter = selected;

      window.setTimeout(() => {
        name.textContent = selected.name || "Unknown";
        const metaParts = [
          selected.type,
          selected.element,
          selected.stage ? `Stage: ${selected.stage}` : null,
          typeof selected.power === "number" ? `Power: ${selected.power}` : null,
        ].filter(Boolean);
        meta.textContent = metaParts.length
          ? metaParts.join(" · ")
          : selected.description || "No description yet.";

        if (selected.spriteFramesPath) {
          sprite.src = `data/${selected.spriteFramesPath}/frame_00.png`;
          sprite.alt = selected.name ? `${selected.name} sprite` : "Character sprite";
          sprite.dataset.basePath = `data/${selected.spriteFramesPath}`;
          sprite.dataset.previewMode = "default";
          delete sprite.dataset.lockedFrame;
          sprite.dataset.frameIndex = "0";
          sprite.dataset.cycleIndex = "0";
        }
      }, 220);
    }

    state.player = egg.hatchedCharacter;
    updateSelection(playerList, egg.id);
    startGameButton.disabled = !state.player;
  });

  return card;
}

let spriteTickerId: number | null = null;
let feedTickerId: number | null = null;
let trainTickerId: number | null = null;
let trainProgress = 0;
let trainDirection = 1;
let trainActive = false;
let trainIdleTickerId: number | null = null;
let trainResultTickerId: number | null = null;
let endScreenTickerId: number | null = null;

function startSpritePreview() {
  if (spriteTickerId) {
    return;
  }

  spriteTickerId = window.setInterval(() => {
    const sprites = document.querySelectorAll<HTMLImageElement>(
      '#character-menu .character-sprite, #arena-menu .character-sprite, #action-menu .character-sprite[data-preview-scope="caretaker"]'
    );
    if (sprites.length === 0) {
      return;
    }
    sprites.forEach((sprite) => {
      const basePath = sprite.dataset.basePath;
      if (!basePath) {
        return;
      }
      const mode = sprite.dataset.previewMode || "default";
      if (mode === "egg-selected") {
        const lockedFrame = sprite.dataset.lockedFrame || "02";
        sprite.src = `${basePath}/frame_${lockedFrame}.png`;
        return;
      }
      if (mode === "egg") {
        const cycle = Number(sprite.dataset.cycleIndex || "0");
        const next = cycle % 2;
        sprite.dataset.cycleIndex = String((cycle + 1) % 2);
        sprite.dataset.frameIndex = String(next);
        sprite.src = `${basePath}/frame_0${next}.png`;
        return;
      }
      const roll = Math.random();
      let next;
      if (roll < 0.2) {
        next = 2;
      } else {
        const cycle = Number(sprite.dataset.cycleIndex || "0");
        next = cycle % 2;
        sprite.dataset.cycleIndex = String((cycle + 1) % 2);
      }
      sprite.dataset.frameIndex = String(next);
      sprite.src = `${basePath}/frame_0${next}.png`;
    });
  }, 1000);
}

function stopSpritePreview() {
  if (spriteTickerId) {
    window.clearInterval(spriteTickerId);
    spriteTickerId = null;
  }
}

let battleTickerId: number | null = null;
let attackCleanupId: (() => void) | null = null;

function startBattle() {
  characterMenu.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  if (state.mode !== "arena" || !state.opponent) {
    state.opponent = pickRandomOpponent();
  }
  updateBattleBackground();

  const activeConsumable = state.mode === "arena" ? null : state.activeConsumable;
  state.battle = {
    playerHp: getBattleHp(state.player),
    opponentHp: typeof state.opponent.hp === "number" ? state.opponent.hp : 3,
    turn: "player",
    forceSpecial: activeConsumable === "pepper" ? "player" : null,
    status: {
      player: {
        paralyzed: false,
        confused: false,
        poisoned: false,
      },
      opponent: {
        paralyzed: false,
        confused: false,
        poisoned: false,
      },
    },
    statusImmune: {
      player: activeConsumable === "medicine",
      opponent: false,
    },
    specialBonus:
      (activeConsumable === "yellow_pear" ? 0.2 : 0) +
      (activeConsumable === "focus_lens" ? 0.25 : 0),
    statusBonus: {
      paralyze: activeConsumable === "storm_cloud" ? 0.1 : 0,
      poison: activeConsumable === "poison_vial" ? 0.1 : 0,
      confuse: activeConsumable === "beer_bottle" ? 0.1 : 0,
    },
    statusShield: {
      player: activeConsumable === "aegis_charm",
      opponent: false,
    },
    adrenalineReady: {
      player: activeConsumable === "adrenal_seed",
      opponent: false,
    },
    echoShellReady: {
      player: activeConsumable === "echo_shell",
      opponent: false,
    },
    hitModifier: {
      player: activeConsumable === "weighted_anklet" ? -0.05 : 0,
      opponent: activeConsumable === "weighted_anklet" ? -0.15 : 0,
    },
    luckyDropBonus: activeConsumable === "lucky_token",
    extraTurnQueued: null,
  };
  if (activeConsumable === "null_powder") {
    state.battle.status.player = { paralyzed: false, confused: false, poisoned: false };
    state.battle.status.opponent = { paralyzed: false, confused: false, poisoned: false };
    logBattle("Null Powder clears all status effects.");
  }
  if (activeConsumable === "medicine") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (activeConsumable === "yellow_pear" || activeConsumable === "focus_lens") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (
    activeConsumable === "storm_cloud" ||
    activeConsumable === "poison_vial" ||
    activeConsumable === "beer_bottle" ||
    activeConsumable === "aegis_charm" ||
    activeConsumable === "adrenal_seed" ||
    activeConsumable === "echo_shell" ||
    activeConsumable === "null_powder" ||
    activeConsumable === "weighted_anklet" ||
    activeConsumable === "lucky_token"
  ) {
    state.activeConsumable = null;
    updateConsumableStatus();
  }

  battlePlayerName.textContent = state.player.name || "Player";
  battleOpponentName.textContent = state.opponent.name || "Opponent";
  battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;

  battlePlayerSprite.innerHTML = "";
  battleOpponentSprite.innerHTML = "";
  battlePlayerSprite.append(
    createBattleSprite(
      state.player.spriteFramesPath,
      state.player.name,
      true,
      "player"
    )
  );
  battleOpponentSprite.append(
    createBattleSprite(
      state.opponent.spriteFramesPath,
      state.opponent.name,
      false,
      "opponent"
    )
  );

  battleLog.innerHTML = "";
  logBattle(`${state.player.name} starts the battle!`);
  updateStatusIcons();
  playBattleIntro().then(() => {
    scheduleNextTurn();
  });
}

function updateBattleBackground() {
  if (!battleField || !state.player) {
    return;
  }
  let stage: StageOrHybrid = isStage(state.player.stage) ? state.player.stage : "Child";
  if (state.finalChallenge && state.opponent?.stage) {
    stage = state.opponent.stage === "Armor-Hybrid" || isStage(state.opponent.stage)
      ? state.opponent.stage
      : "Child";
  }
  const mapping: Record<StageOrHybrid, string> = {
    "Baby I": "bg_baby_i.svg",
    "Baby II": "bg_baby_ii.svg",
    Child: "bg_child.svg",
    Adult: "bg_adult.svg",
    Perfect: "bg_perfect.svg",
    Ultimate: "bg_ultimate.svg",
    "Armor-Hybrid": "bg_armor_hybrid.svg",
  };
  const file = mapping[stage] || mapping.Child;
  battleField.style.backgroundImage = `url(\"data/ui/${file}\")`;
}

function getBattleHp(character: Character) {
  let hp = typeof character.hp === "number" ? character.hp : 3;
  if (state.activeConsumable === "mushroom") {
    hp += 1;
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  return hp;
}

function openActionMenu() {
  characterMenu.classList.add("hidden");
  actionMenu.classList.remove("hidden");
  battleScreen.classList.add("hidden");
  feedMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  evolutionScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  congratsScreen.classList.add("hidden");
  stopEndScreen();
  updateCaretakerInfo();
  startSpritePreview();
  updateWeight();
  updateTraining();
  updateInventory();
  updateConsumableStatus();
  renderWinRate();
}

function updateWeight() {
  weightCounter.textContent = `Weight: ${state.weight}`;
}

function updateTraining() {
  trainingCounter.textContent = `Training: ${state.training}/4`;
  if (state.training >= 4) {
    trainButton.classList.add("hidden");
  } else {
    trainButton.classList.remove("hidden");
  }
}

function updateInventory() {
  INVENTORY_CONFIG.forEach((item) => {
    const refs = inventoryUi[item.key];
    if (!refs?.count || !refs.button) {
      return;
    }
    const total = state.inventory[item.key];
    refs.count.textContent = `x${total}`;
    refs.button.classList.toggle("hidden", total <= 0);
  });
  updateConsumableStatus();
}

function updateConsumableStatus() {
  if (!consumableStatus) {
    return;
  }
  const label = state.activeConsumable
    ? consumableLabels[state.activeConsumable] || "None"
    : "None";
  const extras: string[] = [];
  if (state.trainingAutoSuccessCharges > 0) {
    extras.push(`Training Saves: ${state.trainingAutoSuccessCharges}`);
  }
  if (state.lastStandCharges > 0) {
    extras.push(`Revives: ${state.lastStandCharges}`);
  }
  const extraText = extras.length > 0 ? ` | ${extras.join(" | ")}` : "";
  consumableStatus.textContent = `Consumable: ${label}${extraText}`;
}

function updateCaretakerInfo() {
  if (!state.player) {
    caretakerSprite.innerHTML = "";
    caretakerName.textContent = "---";
    caretakerStage.textContent = "Stage: ---";
    caretakerHp.textContent = "HP: 0";
    if (finalChallengeButton) {
      finalChallengeButton.classList.add("hidden");
    }
    return;
  }

  caretakerName.textContent = state.player.name || "---";
  caretakerStage.textContent = `Stage: ${state.player.stage || "---"}`;
  caretakerHp.textContent = `HP: ${state.player.hp ?? 0}`;
  if (finalChallengeButton) {
    if (state.player.stage === "Ultimate") {
      finalChallengeButton.classList.remove("hidden");
    } else {
      finalChallengeButton.classList.add("hidden");
    }
  }
  updateTypeIcon();

  caretakerSprite.innerHTML = "";
  const spriteFrame = document.createElement("div");
  spriteFrame.className = "character-sprite-frame";

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_00.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  sprite.dataset.previewScope = "caretaker";
  spriteFrame.append(sprite);
  caretakerSprite.append(spriteFrame);
}

function updateTypeIcon() {
  if (!caretakerTypeIcon || !state.player) {
    return;
  }
  const element = state.player.element || "";
  const supportedElements = ["Vaccine", "Data", "Virus"];
  if (!supportedElements.includes(element)) {
    caretakerTypeIcon.classList.add("hidden");
    return;
  }
  caretakerTypeIcon.classList.remove("hidden");
  const file = `${element.toLowerCase()}.svg`;
  caretakerTypeIcon.src = `data/ui/type_icons/${file}`;
  caretakerTypeIcon.alt = element;
}

function startFeedingPreview(triggerChew) {
  if (!state.player) {
    return;
  }

  feedSpriteSlot.innerHTML = "";
  const frame = document.createElement("div");
  frame.className = "character-sprite-frame";

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_03.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  frame.append(sprite);
  feedSpriteSlot.append(frame);

  if (feedTickerId) {
    window.clearInterval(feedTickerId);
    feedTickerId = null;
  }

  let idleToggle = false;
  const runIdle = () => {
    if (feedTickerId) {
      window.clearInterval(feedTickerId);
    }
    feedTickerId = window.setInterval(() => {
      idleToggle = !idleToggle;
      sprite.src = `${sprite.dataset.basePath}/frame_0${idleToggle ? "0" : "1"}.png`;
    }, 1000);
  };

  runIdle();

  if (triggerChew && feedFoodSprite) {
    if (feedTickerId) {
      window.clearInterval(feedTickerId);
      feedTickerId = null;
    }
    if (feedFoodContainer) {
      feedFoodContainer.classList.add("active");
    }
    let chewToggle = false;
    let cycles = 0;
    feedTickerId = window.setInterval(() => {
      chewToggle = !chewToggle;
      sprite.src = `${sprite.dataset.basePath}/frame_${chewToggle ? "02" : "03"}.png`;
      cycles += 1;
      if (cycles >= 6) {
        window.clearInterval(feedTickerId);
        feedTickerId = null;
        if (feedFoodContainer) {
          feedFoodContainer.classList.remove("active");
        }
        runIdle();
      }
    }, 750);
    feedFoodSprite.classList.add("chew");
    window.setTimeout(() => {
      feedFoodSprite.classList.remove("chew");
    }, 4500);
  }
}

function stopFeedingPreview() {
  if (feedTickerId) {
    window.clearInterval(feedTickerId);
    feedTickerId = null;
  }
  if (feedFoodSprite) {
    feedFoodSprite.classList.remove("chew");
  }
  if (feedFoodContainer) {
    feedFoodContainer.classList.remove("active");
  }
}

function startTraining() {
  stopTraining();
  const existingProjectile = trainMenu.querySelector(".train-projectile");
  if (existingProjectile) {
    existingProjectile.remove();
  }
  trainProgress = 0;
  trainDirection = 1;
  trainActive = true;
  trainFill.style.width = "0%";
  trainStatus.textContent = "Press Space when the bar is between 80% and 100%.";
  renderTrainingSprite();
  trainTickerId = window.setInterval(() => {
    if (!trainActive) {
      return;
    }
    trainProgress += trainDirection * 2;
    if (trainProgress >= 100) {
      trainProgress = 100;
      trainDirection = -1;
    } else if (trainProgress <= 0) {
      trainProgress = 0;
      trainDirection = 1;
    }
    trainFill.style.width = `${trainProgress}%`;
  }, 50);
}

function stopTraining() {
  trainActive = false;
  if (trainTickerId) {
    window.clearInterval(trainTickerId);
    trainTickerId = null;
  }
  if (trainIdleTickerId) {
    window.clearInterval(trainIdleTickerId);
    trainIdleTickerId = null;
  }
  if (trainResultTickerId) {
    window.clearInterval(trainResultTickerId);
    trainResultTickerId = null;
  }
  const existingProjectile = trainMenu.querySelector(".train-projectile");
  if (existingProjectile) {
    existingProjectile.remove();
  }
  if (trainBag) {
    trainBag.classList.remove("hit");
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }
  if (trainMenu.classList.contains("hidden") || !trainActive) {
    return;
  }
  event.preventDefault();
  trainActive = false;
  stopTraining();
  let win = trainProgress >= 80 && trainProgress <= 100;
  let usedAutoSave = false;
  if (!win && state.trainingAutoSuccessCharges > 0) {
    state.trainingAutoSuccessCharges -= 1;
    win = true;
    usedAutoSave = true;
    updateConsumableStatus();
  }
  playTrainingResult(win);
  if (win) {
    state.training = Math.min(4, state.training + 1);
    updateTraining();
  }
  if (usedAutoSave) {
    trainStatus.textContent = "Saved by Ration Pack! Training complete.";
  } else {
    trainStatus.textContent = win
      ? "Success! Training complete."
      : "Missed! Try again.";
  }
});

function renderTrainingSprite() {
  if (!state.player || !trainSpriteSlot) {
    return;
  }
  trainSpriteSlot.innerHTML = "";
  const frame = document.createElement("div");
  frame.className = "character-sprite-frame";

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_00.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  frame.append(sprite);
  trainSpriteSlot.append(frame);

  let idleToggle = false;
  if (trainIdleTickerId) {
    window.clearInterval(trainIdleTickerId);
  }
  trainIdleTickerId = window.setInterval(() => {
    if (!trainActive || trainMenu.classList.contains("hidden")) {
      window.clearInterval(trainIdleTickerId);
      trainIdleTickerId = null;
      return;
    }
    idleToggle = !idleToggle;
    sprite.src = `${sprite.dataset.basePath}/frame_0${idleToggle ? "0" : "1"}.png`;
  }, 1000);
}

function playTrainingResult(win) {
  const sprite = trainSpriteSlot.querySelector<HTMLImageElement>(".character-sprite");
  if (!sprite) {
    return;
  }
  const base = sprite.dataset.basePath;
  if (trainIdleTickerId) {
    window.clearInterval(trainIdleTickerId);
    trainIdleTickerId = null;
  }
  const bag = trainBag;
  sprite.src = `${base}/frame_11.png`;
  if (trainResultTickerId) {
    window.clearInterval(trainResultTickerId);
  }
  window.setTimeout(() => {
    const projectile = document.createElement("div");
    projectile.className = "projectile train-projectile";
    trainMenu.querySelector<HTMLElement>(".train-visual")?.append(projectile);
    window.setTimeout(() => {
      projectile.classList.add("fly");
    }, 20);
    let toggle = false;
    let cycles = 0;
    const frames = win ? ["03", "07"] : ["06", "08"];
    trainResultTickerId = window.setInterval(() => {
      toggle = !toggle;
      sprite.src = `${base}/frame_${frames[toggle ? 0 : 1]}.png`;
      cycles += 1;
      if (win && bag) {
        bag.classList.toggle("hit", toggle);
      }
      if (cycles >= 4) {
        window.clearInterval(trainResultTickerId);
        trainResultTickerId = null;
        if (bag) {
          bag.classList.remove("hit");
        }
        projectile.remove();
      }
    }, 600);
  }, 450);
}

function updateWinRate(playerWon) {
  state.stats.battles += 1;
  if (playerWon) {
    state.stats.wins += 1;
  }
  saveStats();
  renderWinRate();
}

function renderWinRate() {
  const rate =
    state.stats.battles === 0
      ? 0
      : Math.round((state.stats.wins / state.stats.battles) * 100);
  winRateDisplay.textContent = `Win Rate: ${rate}%`;
}

function loadStats() {
  try {
    const raw = window.localStorage.getItem("battleStats");
    if (!raw) {
      renderWinRate();
      return;
    }
    const parsed = JSON.parse(raw);
    state.stats.wins = Number(parsed.wins) || 0;
    state.stats.battles = Number(parsed.battles) || 0;
    renderWinRate();
  } catch (error) {
    console.error(error);
    renderWinRate();
  }
}

function saveStats() {
  window.localStorage.setItem(
    "battleStats",
    JSON.stringify({
      wins: state.stats.wins,
      battles: state.stats.battles,
    })
  );
}

function resetSession() {
  state.stats.wins = 0;
  state.stats.battles = 0;
  window.localStorage.removeItem("battleStats");
  renderWinRate();
}

function getRandomBabies(count: number): Character[] {
  const babies = state.characters.filter((char) => char.stage === "Baby I");
  const shuffled = babies.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getEggSelectionOptions(): EggOption[] {
  const unlockedEggs = getUnlockedEggDefinitions();
  const babies = getBabyICharacters();
  if (babies.length === 0) {
    return [];
  }
  const assignment = getOrCreateEggBabyMap();
  return unlockedEggs.map((egg, index) => ({
    id: egg.id,
    label: egg.label,
    spriteFramesPath: egg.spriteFramesPath,
    baby: babies.find((baby) => String(baby.id || "") === assignment[egg.id]) || babies[index % babies.length],
    hatchedCharacter: null,
  }));
}

function pickEggBaby(assigned: Character | null): Character {
  if (assigned) {
    return assigned;
  }
  const babies = getBabyICharacters();
  return babies[Math.floor(Math.random() * babies.length)] || {};
}

function getBabyICharacters(): Character[] {
  return state.characters
    .filter((char) => char.stage === "Baby I")
    .slice()
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function getOrCreateEggBabyMap(): Record<string, string> {
  const babies = getBabyICharacters();
  if (babies.length === 0) {
    return {};
  }

  const validEggIds = new Set(EGG_DEFINITIONS.map((egg) => egg.id));
  const validBabyIds = new Set(babies.map((baby) => String(baby.id || "")));
  const parsed = readEggBabyMap();
  const map: Record<string, string> = {};

  Object.entries(parsed).forEach(([eggId, babyId]) => {
    if (validEggIds.has(eggId) && validBabyIds.has(babyId)) {
      map[eggId] = babyId;
    }
  });

  const usedBabyIds = new Set(Object.values(map));
  const byId = new Map(babies.map((baby) => [String(baby.id || ""), baby]));

  EGG_DEFINITIONS.forEach((egg, index) => {
    if (map[egg.id]) {
      return;
    }
    const unmatched = babies.filter((baby) => !usedBabyIds.has(String(baby.id || "")));
    const bestUnmatched = pickBestMatchingBaby(egg, unmatched);
    if (bestUnmatched) {
      const bestId = String(bestUnmatched.id || "");
      map[egg.id] = bestId;
      usedBabyIds.add(bestId);
      return;
    }
    if (unmatched.length > 0) {
      const id = String(unmatched[0].id || "");
      map[egg.id] = id;
      usedBabyIds.add(id);
      return;
    }
    const fallback = babies[index % babies.length];
    map[egg.id] = String(fallback.id || "");
  });

  Object.keys(map).forEach((eggId) => {
    if (!validEggIds.has(eggId) || !byId.has(map[eggId])) {
      delete map[eggId];
    }
  });

  writeEggBabyMap(map);
  return map;
}

function readEggBabyMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(EGG_BABY_MAP_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).map(([eggId, babyId]) => [String(eggId), String(babyId)])
    );
  } catch (error) {
    console.error(error);
    return {};
  }
}

function writeEggBabyMap(map: Record<string, string>) {
  window.localStorage.setItem(EGG_BABY_MAP_KEY, JSON.stringify(map));
}

function pickBestMatchingBaby(egg: EggDefinition, candidates: Character[]): Character | null {
  if (candidates.length === 0) {
    return null;
  }
  const eggKey = normalizeEggKey(egg);
  let best: Character | null = null;
  let bestScore = 0;

  candidates.forEach((baby) => {
    const score = getNameMatchScore(eggKey, normalizeBabyKey(baby.name || ""));
    if (score > bestScore) {
      best = baby;
      bestScore = score;
    }
  });

  return bestScore > 0 ? best : null;
}

function normalizeEggKey(egg: EggDefinition): string {
  const fromPath = (egg.spriteFramesPath.split("/").pop() || "").replace(/_digitama$/i, "");
  return fromPath.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeBabyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(baby i\)/g, "")
    .replace(/baby ?i/gi, "")
    .replace(/[^a-z0-9]/g, "");
}

function getNameMatchScore(eggKey: string, babyKey: string): number {
  if (!eggKey || !babyKey) {
    return 0;
  }
  if (eggKey === babyKey) {
    return 4;
  }
  if (eggKey.startsWith(babyKey) || babyKey.startsWith(eggKey)) {
    return 3;
  }
  if (eggKey.includes(babyKey) || babyKey.includes(eggKey)) {
    return 2;
  }
  const prefixLen = commonPrefixLength(eggKey, babyKey);
  if (prefixLen >= 3) {
    return 1;
  }
  return 0;
}

function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let idx = 0;
  while (idx < limit && a[idx] === b[idx]) {
    idx += 1;
  }
  return idx;
}

function getUnlockedEggDefinitions(): EggDefinition[] {
  const saved = readUnlockedEggIds();
  if (saved.length === 0) {
    const initial = EGG_DEFINITIONS.slice(0, 2);
    writeUnlockedEggIds(initial.map((egg) => egg.id));
    return initial;
  }
  const mapped = saved
    .map((id) => EGG_DEFINITIONS.find((egg) => egg.id === id))
    .filter(Boolean) as EggDefinition[];
  if (mapped.length >= 2) {
    return mapped;
  }
  const fallback = EGG_DEFINITIONS.slice(0, 2);
  writeUnlockedEggIds(fallback.map((egg) => egg.id));
  return fallback;
}

function readUnlockedEggIds(): string[] {
  try {
    const raw = window.localStorage.getItem(EGG_PROGRESS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const validIds = new Set(EGG_DEFINITIONS.map((egg) => egg.id));
    return parsed
      .map((id) => String(id))
      .filter((id, index, arr) => validIds.has(id) && arr.indexOf(id) === index);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function writeUnlockedEggIds(ids: string[]) {
  window.localStorage.setItem(EGG_PROGRESS_KEY, JSON.stringify(ids));
}

function unlockRandomEgg(): EggDefinition | null {
  const unlockedIds = readUnlockedEggIds();
  const locked = EGG_DEFINITIONS.filter((egg) => !unlockedIds.includes(egg.id));
  if (locked.length === 0) {
    return null;
  }
  const unlocked = locked[Math.floor(Math.random() * locked.length)];
  writeUnlockedEggIds([...unlockedIds, unlocked.id]);
  return unlocked;
}

function getArenaAvailableCharacters(): Character[] {
  const playedIds = new Set(readHistoryPlayedIds());
  if (playedIds.size === 0) {
    return [];
  }
  return state.characters
    .filter((character) => playedIds.has(String(character.id || "")))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function markHistoryCharacterPlayed(character: Character | null) {
  if (state.mode !== "history" || !character) {
    return;
  }
  const id = String(character.id || "");
  if (!id) {
    return;
  }
  const current = readHistoryPlayedIds();
  if (current.includes(id)) {
    return;
  }
  current.push(id);
  writeHistoryPlayedIds(current);
}

function readHistoryPlayedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_PLAYED_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((id) => String(id));
  } catch (error) {
    console.error(error);
    return [];
  }
}

function writeHistoryPlayedIds(ids: string[]) {
  const deduped = ids.filter((id, index) => id && ids.indexOf(id) === index);
  window.localStorage.setItem(HISTORY_PLAYED_KEY, JSON.stringify(deduped));
}

function pickRandomOpponent(): Character {
  if (!state.player) {
    return state.characters[0] || {};
  }

  const armorPool = state.characters.filter((char) => char.stage === "Armor-Hybrid");
  if (state.finalChallenge && armorPool.length > 0) {
    return armorPool[Math.floor(Math.random() * armorPool.length)];
  }

  const playerStageIndex = getStageIndex(state.player.stage);
  if (playerStageIndex === -1) {
    const pool = state.characters.filter((char) => char.id !== state.player.id);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const roll = Math.random();
  let offset = 0;
  if (roll < 0.7) {
    offset = 0;
  } else if (roll < 0.9) {
    offset = Math.random() < 0.5 ? -1 : 1;
  } else {
    offset = Math.random() < 0.5 ? -2 : 2;
  }
  let targetIndex = playerStageIndex + offset;
  targetIndex = Math.min(targetIndex, STAGE_ORDER.length - 1);
  targetIndex = Math.max(0, targetIndex);

  let pool = state.characters.filter(
    (char) => char.stage === STAGE_ORDER[targetIndex]
  );
  if (pool.length === 0) {
    pool = state.characters;
  }

  const filtered = pool.filter((char) => char.id !== state.player.id);
  if (filtered.length > 0) {
    pool = filtered;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function endBattle() {
  if (battleTickerId) {
    window.clearTimeout(battleTickerId);
    battleTickerId = null;
  }
  if (state.battle?.endTickerId) {
    window.clearInterval(state.battle.endTickerId);
  }
  if (attackCleanupId) {
    attackCleanupId();
    attackCleanupId = null;
  }
  state.battle = null;
}

function createBattleSprite(
  spriteFramesPath: string | undefined,
  name: string | undefined,
  mirrored: boolean,
  role: BattleRole
) {
  const frame = document.createElement("div");
  frame.className = "character-sprite-frame battle-sprite-frame";
  if (mirrored) {
    frame.classList.add("mirrored");
  }

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${spriteFramesPath || ""}/frame_00.png`;
  sprite.alt = name ? `${name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${spriteFramesPath}`;
  if (role) {
    sprite.dataset.role = role;
  }
  frame.append(sprite);
  return frame;
}

function playBattleIntro(): Promise<void> {
  return new Promise<void>((resolve) => {
    const battleSprites = document.querySelectorAll<HTMLImageElement>(
      ".battle-sprite-frame .character-sprite"
    );
    battleSprites.forEach((sprite) => {
      const basePath = sprite.dataset.basePath;
      if (!basePath) {
        return;
      }
      sprite.src = `${basePath}/frame_06.png`;
    });

    window.setTimeout(() => {
      battleSprites.forEach((sprite) => {
        const basePath = sprite.dataset.basePath;
        if (!basePath) {
          return;
        }
        sprite.src = `${basePath}/frame_08.png`;
      });
      window.setTimeout(resolve, 400);
    }, 1000);
  });
}

function scheduleNextTurn() {
  if (battleTickerId) {
    window.clearTimeout(battleTickerId);
  }
  battleTickerId = window.setTimeout(runBattleTurn, 800);
}

async function runBattleTurn() {
  if (!state.battle) {
    return;
  }

  const attackerRole = state.battle.turn as BattleRole;
  const defenderRole: BattleRole = state.battle.turn === "player" ? "opponent" : "player";
  const attacker = (attackerRole === "player" ? state.player : state.opponent) || {};

  if (state.battle.status[attackerRole]?.confused) {
    if (Math.random() < 0.2) {
      applySelfDamage(attackerRole, attacker, "confused");
      applyLastStandIfNeeded();
      if (resolveBattleIfFinished()) {
        return;
      }
      finalizeTurn(defenderRole);
      return;
    }
  }

  if (state.battle.status[attackerRole]?.paralyzed) {
    if (Math.random() < 0.3) {
      logBattle(`${attacker.name} is paralyzed and can't move!`);
      finalizeTurn(defenderRole);
      return;
    }
  }

  const defenderCharacter = defenderRole === "player" ? state.player : state.opponent;
  const attack = chooseAttack(attackerRole, attacker);
  const baseHitChance = typeof attack.hitChance === "number"
    ? attack.hitChance
    : attack.name === "final attack"
      ? 0.8
      : getHitChance(attacker, defenderCharacter);
  const roleModifier = state.battle.hitModifier?.[attackerRole] || 0;
  const hitChance = typeof attack.hitChance === "number"
    ? Math.max(0, Math.min(1, baseHitChance))
    : Math.max(0.05, Math.min(1, baseHitChance + roleModifier));
  const hit = Math.random() < hitChance;
  await animateAttack(attackerRole, defenderRole, attacker, attack, hit);

  if (hit) {
    const critical = Math.random() < 0.1;
    let damage = attack.damage;
    if (critical) {
      damage = typeof attack.critDamage === "number" ? attack.critDamage : attack.damage + 1;
    }
    if (attack.oneHitKO) {
      damage = defenderRole === "opponent" ? state.battle.opponentHp : state.battle.playerHp;
    }
    if (attack.critKill && critical) {
      damage = defenderRole === "opponent" ? state.battle.opponentHp : state.battle.playerHp;
    }
    if (defenderRole === "opponent") {
      state.battle.opponentHp = Math.max(0, state.battle.opponentHp - damage);
      battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
    } else {
      state.battle.playerHp = Math.max(0, state.battle.playerHp - damage);
      battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
    }
    if (attack.heal) {
      applyHeal(attackerRole, attacker, attack.heal);
    }
    if (
      attack.name === "special attack" &&
      attackerRole === "player" &&
      state.battle.echoShellReady?.player
    ) {
      state.battle.echoShellReady.player = false;
      const echoDamage = Math.max(1, Math.ceil(damage * 0.5));
      state.battle.opponentHp = Math.max(0, state.battle.opponentHp - echoDamage);
      battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
      logBattle(`Echo Shell repeats the attack for ${echoDamage} damage!`);
    }
    logBattle(
      `${attacker.name} hits with ${
        attack.name === "final attack"
          ? "Final Attack"
          : attack.name === "special attack"
            ? attack.displayName || "Special Attack"
            : "Standard Attack"
      }${critical ? " (Critical)" : ""}!`
    );
    applyStatus(defenderRole, attack.status, attack.statusChance);
    if (
      defenderRole === "player" &&
      state.battle.playerHp <= 0 &&
      state.battle.adrenalineReady?.player
    ) {
      state.battle.adrenalineReady.player = false;
      state.battle.playerHp = 1;
      battlePlayerHp.textContent = "HP: 1";
      state.battle.extraTurnQueued = "player";
      logBattle(`${state.player.name} endures with Adrenal Seed and fights on!`);
    }
  } else {
    logBattle(
      `${attacker.name} misses ${
        attack.name === "final attack"
          ? "Final Attack"
          : attack.name === "special attack"
            ? attack.displayName || "Special Attack"
            : "Standard Attack"
      }!`
    );
  }

  if (state.battle.status[attackerRole]?.poisoned) {
    applyPoison(attackerRole, attacker);
  }
  applyLastStandIfNeeded();
  if (resolveBattleIfFinished()) {
    return;
  }

  finalizeTurn(defenderRole);
}

function applyLastStandIfNeeded() {
  if (!state.battle || state.battle.playerHp > 0 || state.lastStandCharges <= 0) {
    return;
  }
  state.lastStandCharges -= 1;
  state.battle.playerHp = 1;
  state.battle.status.player = {
    paralyzed: false,
    confused: false,
    poisoned: false,
  };
  battlePlayerHp.textContent = "HP: 1";
  updateStatusIcons();
  updateConsumableStatus();
  state.battle.extraTurnQueued = "player";
  logBattle(`${state.player.name} rises again with Last Stand Emblem!`);
}

function resolveBattleIfFinished(): boolean {
  if (!state.battle || (state.battle.playerHp > 0 && state.battle.opponentHp > 0)) {
    return false;
  }
  const playerWon = state.battle.playerHp > 0;
  const winner = playerWon ? state.player.name : state.opponent.name;
  logBattle(`${winner} wins!`);
  if (state.finalChallenge) {
    state.finalChallenge = false;
    endBattle();
    battleScreen.classList.add("hidden");
    showEndScreen(playerWon);
    return true;
  }
  attemptItemDrop();
  if (state.mode === "history" && playerWon) {
    attemptEvolution(state.opponent);
  }
  if (state.mode === "history") {
    updateWinRate(playerWon);
  }
  if (battleTickerId) {
    window.clearTimeout(battleTickerId);
    battleTickerId = null;
  }
  state.battle.ended = true;
  playBattleEnd(playerWon);
  return true;
}

function logBattle(message) {
  const entry = document.createElement("p");
  entry.textContent = message;
  battleLog.append(entry);
  battleLog.scrollTop = battleLog.scrollHeight;
}

function finalizeTurn(nextRole) {
  if (state.battle.ended) {
    return;
  }
  if (state.battle.extraTurnQueued) {
    state.battle.turn = state.battle.extraTurnQueued;
    state.battle.extraTurnQueued = null;
    scheduleNextTurn();
    return;
  }
  state.battle.turn = nextRole;
  scheduleNextTurn();
}

function applyStatus(defenderRole, status, explicitChance?: number) {
  if (!status || status === "none") {
    return;
  }
  if (state.battle.statusImmune?.[defenderRole]) {
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} is immune to status effects!`);
    return;
  }
  if (state.battle.statusShield?.[defenderRole]) {
    state.battle.statusShield[defenderRole] = false;
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} blocks the status with Aegis Charm!`);
    return;
  }
  const normalized = String(status).toLowerCase();
  let applyChance = typeof explicitChance === "number" ? explicitChance : 1;
  if (typeof explicitChance !== "number" && defenderRole === "opponent") {
    if (normalized === "paralyze" || normalized === "paralyzed") {
      applyChance += state.battle.statusBonus.paralyze || 0;
    } else if (normalized === "poison" || normalized === "poisoned") {
      applyChance += state.battle.statusBonus.poison || 0;
    } else if (normalized === "confuse" || normalized === "confused") {
      applyChance += state.battle.statusBonus.confuse || 0;
    }
  }
  if (Math.random() > Math.min(1, applyChance)) {
    return;
  }
  const target = state.battle.status[defenderRole];
  if (!target) {
    return;
  }
  if (normalized === "paralyze" || normalized === "paralyzed") {
    target.paralyzed = true;
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} is paralyzed!`);
  } else if (normalized === "confuse" || normalized === "confused") {
    target.confused = true;
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} is confused!`);
  } else if (normalized === "poison" || normalized === "poisoned") {
    target.poisoned = true;
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} is poisoned!`);
  }
  updateStatusIcons();
}

function applySelfDamage(role, attacker, reason) {
  if (role === "player") {
    state.battle.playerHp = Math.max(0, state.battle.playerHp - 1);
    battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  } else {
    state.battle.opponentHp = Math.max(0, state.battle.opponentHp - 1);
    battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
  }
  logBattle(`${attacker.name} hurts itself in confusion!`);
}

function applyPoison(role, attacker) {
  if (role === "player") {
    state.battle.playerHp = Math.max(0, state.battle.playerHp - 1);
    battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  } else {
    state.battle.opponentHp = Math.max(0, state.battle.opponentHp - 1);
    battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
  }
  logBattle(`${attacker.name} takes poison damage!`);
}

function applyHeal(role, attacker, amount) {
  const maxHp = role === "player" ? state.player.hp : state.opponent.hp;
  const healAmount = amount === "full" ? maxHp : amount;
  if (role === "player") {
    state.battle.playerHp = Math.min(maxHp, state.battle.playerHp + healAmount);
    battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  } else {
    state.battle.opponentHp = Math.min(maxHp, state.battle.opponentHp + healAmount);
    battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
  }
  logBattle(`${attacker.name} heals!`);
}

function updateStatusIcons() {
  if (!state.battle) {
    return;
  }
  const p = state.battle.status.player;
  const o = state.battle.status.opponent;
  if (playerStatusParalyzed) {
    playerStatusParalyzed.style.display = p.paralyzed ? "block" : "none";
  }
  if (playerStatusPoisoned) {
    playerStatusPoisoned.style.display = p.poisoned ? "block" : "none";
  }
  if (playerStatusConfused) {
    playerStatusConfused.style.display = p.confused ? "block" : "none";
  }
  if (opponentStatusParalyzed) {
    opponentStatusParalyzed.style.display = o.paralyzed ? "block" : "none";
  }
  if (opponentStatusPoisoned) {
    opponentStatusPoisoned.style.display = o.poisoned ? "block" : "none";
  }
  if (opponentStatusConfused) {
    opponentStatusConfused.style.display = o.confused ? "block" : "none";
  }
}

function getStageKey(stage: string | undefined): string {
  switch (stage) {
    case "Baby I":
      return "baby_i";
    case "Baby II":
      return "baby_ii";
    case "Child":
      return "child";
    case "Adult":
      return "adult";
    case "Perfect":
      return "perfect";
    case "Ultimate":
      return "ultimate";
    default:
      return "child";
  }
}

function getElementProjectile(element: string | undefined, stageKey: string | undefined): string {
  const normalized = (element || "").toLowerCase();
  const safeElement =
    normalized === "vaccine" || normalized === "virus" || normalized === "data"
      ? normalized
      : "vaccine";
  const safeStage = stageKey || "child";
  return `data/ui/projectiles/${safeStage}_${safeElement}.svg`;
}

function getSpecialProjectile(attacker: Character, attack: AttackAction): string {
  if (attacker.specialAttackSprite) {
    return attacker.specialAttackSprite;
  }
  if (attack.critKill) {
    return "data/ui/projectile_special_crit.svg";
  }
  if (attack.heal) {
    return "data/ui/projectile_special_heal.svg";
  }
  if (attack.status && attack.status !== "none") {
    return "data/ui/projectile_special_status.svg";
  }
  return "data/ui/projectile_special_damage.svg";
}

function chooseAttack(attackerRole: BattleRole, attacker: Character): AttackAction {
  const hp = attackerRole === "player" ? state.battle.playerHp : state.battle.opponentHp;
  if (state.battle.forceSpecial === attackerRole) {
    state.battle.forceSpecial = null;
    state.activeConsumable = null;
    updateConsumableStatus();
    return { name: "final attack", damage: 2, status: "none" };
  }
  if (attackerRole === "opponent" && state.finalChallenge && attacker.stage === "Armor-Hybrid" && hp === 1) {
    return {
      name: "special attack",
      displayName: "Ultimate Attack",
      damage: 0,
      status: "none",
      hitChance: 0.1,
      oneHitKO: true,
    };
  }
  if (hp === 1 && Math.random() < 0.1) {
    return { name: "final attack", damage: 2, status: "none" };
  }
  if (canUseSpecialAttack(attacker) && Math.random() < 0.2) {
    const special = getSpecialAttack(attacker);
    if (special) {
      return special;
    }
  }
  return { name: "standard attack", damage: 1, status: "none" };
}

function getHitChance(attacker: Character | null, defender: Character | null): number {
  const baseChance = 0.75;
  if (!attacker || !defender) {
    return baseChance;
  }
  const advantageMap = {
    Vaccine: "Virus",
    Virus: "Data",
    Data: "Vaccine",
  };
  const attackerType = attacker.element;
  const defenderType = defender.element;
  const hasAdvantage = advantageMap[attackerType] === defenderType;
  const bonus = hasAdvantage ? 0.1 : 0;
  return Math.min(1, baseChance + bonus);
}

function getSpecialAttack(attacker: Character): AttackAction | null {
  if (!attacker || !canUseSpecialAttack(attacker)) {
    return null;
  }
  if (attacker.stage === "Armor-Hybrid") {
    return {
      name: "special attack",
      damage: 2,
      status: "none",
      displayName: attacker.specialAttackName || "Special Attack",
    };
  }
  const displayName = attacker.specialAttackName || "Special Attack";
  const element = (attacker.element || "").toLowerCase();
  if (element === "vaccine") {
    return {
      name: "special attack",
      damage: 1,
      heal: 1,
      status: "paralyze",
      statusChance: 0.5,
      displayName,
    };
  }
  if (element === "data") {
    return {
      name: "special attack",
      damage: 2,
      status: "confuse",
      statusChance: 0.5,
      displayName,
    };
  }
  if (element === "virus") {
    return {
      name: "special attack",
      damage: 2,
      critDamage: 4,
      status: "poison",
      statusChance: 0.5,
      displayName,
    };
  }
  return {
    name: "special attack",
    damage: 2,
    status: "none",
    displayName,
  };
}

function randomStatus(): string {
  const options = ["poison", "paralyze", "confuse"] as const;
  return options[Math.floor(Math.random() * options.length)];
}

function getEvolutionCandidates(player: Character, nextStage: Stage): Character[] {
  const nextStagePool = state.characters.filter((char) => char.stage === nextStage);
  if (nextStagePool.length === 0) {
    return [];
  }

  const playerElement = (player.element || "").toLowerCase();
  const playerType = (player.type || "").toLowerCase();

  return nextStagePool.filter((char) => {
    const sameElement = playerElement !== "" && (char.element || "").toLowerCase() === playerElement;
    const sameType = playerType !== "" && (char.type || "").toLowerCase() === playerType;
    return sameElement || sameType;
  });
}

function attemptEvolution(opponent: Character) {
  if (!state.player || !opponent) {
    return;
  }

  const playerStageIndex = getStageIndex(state.player.stage);
  const opponentStageIndex = getStageIndex(opponent.stage);
  if (playerStageIndex === -1 || opponentStageIndex === -1) {
    return;
  }
  if (playerStageIndex >= STAGE_ORDER.length - 1) {
    return;
  }

  const usingMutationCore = state.activeConsumable === "mutation_core";
  if (!state.debugEvo && state.activeConsumable !== "blue_apple") {
    const baseChance = 0.5 * Math.pow(0.5, playerStageIndex);
    const trainingBonus = Math.min(state.training, 4) * 0.02;
    const mutationBonus = usingMutationCore ? 0.2 : 0;
    const missBonus = state.evolutionMissBonus * 0.01;
    let stageBonus = 0;
    const diff = opponentStageIndex - playerStageIndex;
    if (diff === 1) {
      stageBonus = 0.05;
    } else if (diff >= 2) {
      stageBonus = 0.15;
    }
    const chance = Math.min(1, baseChance + trainingBonus + stageBonus + mutationBonus + missBonus);
    const roll = Math.random();
    if (roll > chance) {
      state.evolutionMissBonus += 1;
      if (usingMutationCore) {
        state.activeConsumable = null;
        updateConsumableStatus();
      }
      return;
    }
  }

  const nextStage = STAGE_ORDER[playerStageIndex + 1];
  let pool: Character[] = [];
  if (Array.isArray(state.player.evolvesTo) && state.player.evolvesTo.length > 0) {
    const allowed = new Set(state.player.evolvesTo.map(String));
    pool = state.characters.filter(
      (char) => allowed.has(String(char.id || "")) && char.stage === nextStage
    );
  } else {
    pool = getEvolutionCandidates(state.player, nextStage);
  }
  if (pool.length === 0) {
    state.evolutionMissBonus += 1;
    return;
  }
  const evolved = pool[Math.floor(Math.random() * pool.length)];
  const previous = state.player;
  state.player = evolved;
  markHistoryCharacterPlayed(evolved);
  state.evolutionMissBonus = 0;
  state.training = 0;
  updateTraining();
  if (state.activeConsumable === "blue_apple") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (usingMutationCore) {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (state.debugEvo) {
    state.debugEvo = false;
  }
  showEvolutionScreen(previous, evolved);
}

function attemptItemDrop() {
  if (Math.random() >= 0.2) {
    return;
  }
  type DropEntry = { threshold: number; key: InventoryKey; label: string };
  const lucky = Boolean(state.battle?.luckyDropBonus);
  const roll = lucky ? Math.pow(Math.random(), 1.35) : Math.random();
  const drops: DropEntry[] = [
    { threshold: 0.04, key: "blueApple", label: "Blue Apple" },
    { threshold: 0.08, key: "mutationCore", label: "Mutation Core" },
    { threshold: 0.18, key: "pepper", label: "Pepper" },
    { threshold: 0.26, key: "stormCloud", label: "Storm Cloud" },
    { threshold: 0.34, key: "poisonVial", label: "Poison Vial" },
    { threshold: 0.42, key: "beerBottle", label: "Beer Bottle" },
    { threshold: 0.52, key: "medicine", label: "Medicine" },
    { threshold: 0.61, key: "yellowPear", label: "Yellow Pear" },
    { threshold: 0.70, key: "mushroom", label: "Mushroom" },
    { threshold: 0.76, key: "focusLens", label: "Focus Lens" },
    { threshold: 0.82, key: "aegisCharm", label: "Aegis Charm" },
    { threshold: 0.87, key: "adrenalSeed", label: "Adrenal Seed" },
    { threshold: 0.91, key: "echoShell", label: "Echo Shell" },
    { threshold: 0.95, key: "nullPowder", label: "Null Powder" },
    { threshold: 0.98, key: "weightedAnklet", label: "Weighted Anklet" },
    { threshold: 0.99, key: "rationPack", label: "Ration Pack" },
    { threshold: 0.995, key: "luckyToken", label: "Lucky Token" },
    { threshold: 1, key: "lastStandEmblem", label: "Last Stand Emblem" },
  ];
  const found = drops.find((item) => roll < item.threshold) || drops[drops.length - 1];
  state.inventory[found.key] += 1;
  updateInventory();
  logBattle(`Found ${/^[AEIOU]/.test(found.label) ? "an" : "a"} ${found.label}!`);
  if (lucky) {
    logBattle("Lucky Token improved this drop.");
  }
}

function showEvolutionScreen(previous, evolved) {
  if (!previous || !evolved) {
    return;
  }

  battleScreen.classList.add("hidden");
  actionMenu.classList.add("hidden");
  evolutionScreen.classList.remove("hidden");

  evolutionOld.className = "character-sprite-frame";
  evolutionNew.className = "character-sprite-frame";
  evolutionOld.innerHTML = "";
  evolutionNew.innerHTML = "";

  const oldSprite = document.createElement("img");
  oldSprite.className = "character-sprite";
  oldSprite.src = `data/${previous.spriteFramesPath}/frame_11.png`;
  oldSprite.alt = previous.name ? `${previous.name} sprite` : "Old sprite";
  evolutionOld.append(oldSprite);

  const newSprite = document.createElement("img");
  newSprite.className = "character-sprite";
  newSprite.src = `data/${evolved.spriteFramesPath}/frame_00.png`;
  newSprite.alt = evolved.name ? `${evolved.name} sprite` : "New sprite";
  evolutionNew.append(newSprite);
  evolutionNew.style.opacity = "0";

  evolutionMessage.textContent = `Congratulations, your ${previous.name} has become ${evolved.name}.`;

  evolutionOld.classList.add("fade-out");
  window.setTimeout(() => {
    evolutionNew.classList.add("reveal");
    evolutionNew.style.opacity = "";
  }, 2000);

  if (evolutionContinue) {
    evolutionContinue.focus();
  }
}

function showEndScreen(playerWon) {
  stopEndScreen();
  if (playerWon) {
    unlockRandomEgg();
  }
  const spriteContainer = playerWon ? congratsSprite : gameoverSprite;
  if (!spriteContainer || !state.player) {
    mainMenu.classList.remove("hidden");
    return;
  }
  congratsScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  spriteContainer.innerHTML = "";

  const frame = document.createElement("div");
  frame.className = "character-sprite-frame";
  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_${playerWon ? "03" : "09"}.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  frame.append(sprite);
  spriteContainer.append(frame);

  const screen = playerWon ? congratsScreen : gameoverScreen;
  screen.classList.remove("hidden");

  let toggle = false;
  endScreenTickerId = window.setInterval(() => {
    toggle = !toggle;
    sprite.src = `${sprite.dataset.basePath}/frame_${playerWon ? (toggle ? "03" : "07") : (toggle ? "09" : "10")}.png`;
  }, 1000);
}

function stopEndScreen() {
  if (endScreenTickerId) {
    window.clearInterval(endScreenTickerId);
    endScreenTickerId = null;
  }
}

function playBattleEnd(playerWon: boolean) {
  const { playerSprite, opponentSprite } = getBattleSprites();
  if (!playerSprite || !opponentSprite) {
    return;
  }

  const playerBase = playerSprite.dataset.basePath;
  const opponentBase = opponentSprite.dataset.basePath;

  const winnerSprite = playerWon ? playerSprite : opponentSprite;
  const loserSprite = playerWon ? opponentSprite : playerSprite;
  const winnerBase = playerWon ? playerBase : opponentBase;
  const loserBase = playerWon ? opponentBase : playerBase;
  if (state.battle?.endTickerId) {
    window.clearInterval(state.battle.endTickerId);
  }

  let toggle = false;
  const updateFrames = () => {
    toggle = !toggle;
    winnerSprite.src = `${winnerBase}/frame_${toggle ? "03" : "07"}.png`;
    loserSprite.src = `${loserBase}/frame_${toggle ? "09" : "10"}.png`;
  };

  updateFrames();
  state.battle.endTickerId = window.setInterval(updateFrames, 1000);
}

function getBattleSprites(): {
  playerSprite: HTMLImageElement | null;
  opponentSprite: HTMLImageElement | null;
} {
  const playerSprite = battleScreen.querySelector<HTMLImageElement>(
    '.character-sprite[data-role="player"]'
  );
  const opponentSprite = battleScreen.querySelector<HTMLImageElement>(
    '.character-sprite[data-role="opponent"]'
  );
  return { playerSprite, opponentSprite };
}

function animateAttack(
  attackerRole: BattleRole,
  defenderRole: BattleRole,
  attacker: Character,
  attack: AttackAction,
  hit: boolean
): Promise<void> {
  return new Promise<void>((resolve) => {
    const { playerSprite, opponentSprite } = getBattleSprites();
    const attackerSprite =
      attackerRole === "player" ? playerSprite : opponentSprite;
    const defenderSprite =
      defenderRole === "player" ? playerSprite : opponentSprite;
    const defenderFrame = defenderSprite?.closest<HTMLElement>(".battle-sprite-frame");

    if (!attackerSprite || !defenderSprite) {
      resolve();
      return;
    }

    const attackerBase = attackerSprite.dataset.basePath;
    const defenderBase = defenderSprite.dataset.basePath;

    attackerSprite.src = `${attackerBase}/frame_11.png`;

    const idleInterval = window.setInterval(() => {
      const current = defenderSprite.dataset.idleIndex || "0";
      const next = current === "0" ? "1" : "0";
      defenderSprite.dataset.idleIndex = next;
      defenderSprite.src = `${defenderBase}/frame_0${next}.png`;
    }, 250);

    const timeouts: number[] = [];
    const projectile = document.createElement("div");
    projectile.className = "projectile";
    if (attackerRole === "player") {
      projectile.classList.add("from-left");
    } else {
      projectile.classList.add("from-right");
    }
    if (attack?.name === "final attack") {
      projectile.classList.add("fireball");
      const img = document.createElement("img");
      img.src = "data/ui/fireball.svg";
      img.alt = "Fireball";
      img.className = "fireball-sprite";
      projectile.append(img);
    } else if (attack?.name === "special attack") {
      projectile.classList.add("element");
      const img = document.createElement("img");
      img.src = getSpecialProjectile(attacker, attack);
      img.alt = "Special Attack";
      img.className = "element-projectile projectile-stage-ultimate";
      projectile.append(img);
    } else {
      projectile.classList.add("element");
      const img = document.createElement("img");
      const stageKey = getStageKey(attacker.stage);
      if (attacker.stage === "Armor-Hybrid") {
        img.src = "data/ui/projectile_armor_hybrid.svg";
        img.className = "element-projectile projectile-stage-ultimate";
      } else {
        img.src = getElementProjectile(attacker.element, stageKey);
        img.className = `element-projectile projectile-stage-${stageKey}`;
      }
      img.alt = "Projectile";
      projectile.append(img);
    }
    battleScreen.querySelector<HTMLElement>(".battle")?.append(projectile);

    timeouts.push(
      window.setTimeout(() => {
        projectile.classList.add("fly");
      }, 20)
    );

    const cleanup = () => {
      window.clearInterval(idleInterval);
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      projectile.remove();
      resolve();
    };
    attackCleanupId = cleanup;

    timeouts.push(
      window.setTimeout(() => {
        if (state.battle?.ended) {
          cleanup();
          return;
        }
        if (hit) {
          if (defenderFrame) {
            defenderFrame.classList.add("hit");
          }
          window.clearInterval(idleInterval);
          defenderSprite.src = `${defenderBase}/frame_10.png`;
          timeouts.push(
            window.setTimeout(() => {
              if (defenderFrame) {
                defenderFrame.classList.remove("hit");
              }
              cleanup();
            }, 1000)
          );
        } else {
          if (defenderFrame) {
            defenderFrame.classList.add("flip");
          }
          timeouts.push(
            window.setTimeout(() => {
              if (defenderFrame) {
                defenderFrame.classList.remove("flip");
              }
              cleanup();
            }, 1000)
          );
        }
      }, 600)
    );
  });
}

function updateSelection(list, selectedId) {
  list.querySelectorAll(".character-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === String(selectedId));
  });
}
