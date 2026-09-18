import * as dom from "./dom.js";
import {
  EQUIPMENT_CONFIG,
  INVENTORY_CONFIG,
  KEY_ITEMS_CONFIG,
  formatEquipmentEffect,
  formatCareGainText,
  getInventoryItemCategories,
  WILD_WIN_ITEM_DROP_CHANCE,
  MAX_CONSUMABLE_STACK,
  pickWildWinDropKey,
  getWildSpecialDropKeys,
  getZoneDifficultyTier,
  countDemonLordIngredients,
  listOwnedDemonLordIngredientNames,
  STAGE_ORDER,
  ZONE_CONFIG,
  ZONE_ENCOUNTERS,
  ZONE_EVENTS,
  ZONE_BOSSES,
  isZoneUnavailable,
  EVENT_CHANCE_STEP,
  EVENT_CHANCE_MAX,
  EVENT_ROOT_NODE_ID,
  MAX_LIVES,
  ENCOUNTER_STAGES,
  clampCareStat,
  eventPassesRequirements,
  filterEligibleZoneEvents,
  forEachZoneEventChoice,
  getAlignmentLabel,
  getDisciplineLabel,
  getHappinessLabel,
  getTimeOfDayForZoneLevel,
  getZoneBackgroundFile,
  getZoneRunDayOffset,
  addCombatStatDelta,
  getBossCombatStats,
  getCharacterCombatStats,
  getStageBaseStats,
  getTableCombatStats,
  getWildCombatStats,
  getEncounterEntryStats,
  findZoneEncounterEntry,
  getZoneEventNode,
  getZoneRunRules,
  getZoneStagePool,
  getZoneEncounterStageWeights,
  isIndoorZone,
  listZoneBossOpponentIds,
  listBossDialogueCharacterIds,
  filterDropsForOpponent,
  listZoneEncounterIds,
  pickWeightedEncounterId,
  pickWeightedIndex,
  pickWeightedZoneEvent,
  resolveConditionalText,
  getZoneBossDialogue,
  TIME_OF_DAY_ICONS,
  TIME_OF_DAY_LABELS,
  type EncounterStage,
  type EventStatSnapshot,
  type InventoryItemCategory,
  type Stage,
  type ZoneBossConfig,
  type ZoneEventChoice,
  type ZoneEventDefinition,
  type ZoneEventOutcome,
} from "./constants.js";
import { applyStarterAttributes, resetRunState, state, type Character } from "./state.js";
import {
  getAttackProjectile,
  getCriticalChance,
  getStageKey,
  hasTypeAdvantage,
  normalizeBattleType,
} from "./combat/projectiles.js";
import {
  resolveUniqueEffect,
  type UniqueBuffId,
  type UniqueDebuffId,
} from "./combat/uniqueEffects.js";
import {
  getDefaultUnlockedZoneIds,
  getSeenZoneContent,
  bumpBgCalendarDay,
  readBgCalendarDay,
  isZoneBossDefeated,
  isZoneUnlocked,
  markBossOpponentDefeated,
  markSeenZoneEntry,
  markZoneBossDefeated,
  readDefeatedBossOpponentIds,
  readUnlockedZoneIds,
  resetZoneProgressForNewGame,
  unlockZoneIds,
  type SeenZoneContent,
} from "./persist/zoneProgress.js";
import { banEventForever, getExcludedEventIds, incrementEventWinCount, readAllEventWinCounts, readBannedEventIds } from "./persist/eventProgress.js";


const {
  singlePlayerButton,
  arenaModeButton,
  vpetUploadButton,
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
  hubMenu,
  hubHouseButton,
  hubPathButton,
  hubBackButton,
  hubFinalChallengeButton,
  zoneMenu,
  zoneMap,
  zoneBackButton,
  zoneInfoMenu,
  zoneInfoTitle,
  zoneInfoSubtitle,
  zoneInfoEncountersHeading,
  zoneInfoEventsHeading,
  zoneInfoBossesHeading,
  zoneInfoEncounters,
  zoneInfoEvents,
  zoneInfoBosses,
  zoneInfoBackButton,
  actionMenu,
  actionBackButton,
  feedButton,
  trainButton,
  equipmentButton,
  keyItemsButton,
  weightCounter,
  livesRow,
  meatCount,
  disciplineCounter,
  happinessCounter,
  alignmentCounter,
  attrHpCounter,
  attrAttackCounter,
  attrDefenseCounter,
  attrSpeedCounter,
  attrIntelligenceCounter,
  winRateDisplay,
  caretakerSprite,
  caretakerName,
  caretakerStage,
  caretakerTypeIcon,
  equipmentStatus,
  feedMenu,
  feedBackButton,
  feedFilters,
  feedItemDesc,
  feedMeatButton,
  feedItemList,
  feedSpriteSlot,
  feedFoodSprite,
  feedFoodContainer,
  equipmentMenu,
  equipmentBackButton,
  equipmentItemDesc,
  equipmentSpriteSlot,
  equipmentPreviewImg,
  keyItemsMenu,
  keyItemsDesc,
  keyItemsBackButton,
  keyItemsList,
  keyItemsEmpty,
  itemHoverTooltip,
  equipWoodenSwordButton,
  woodenSwordStatus,
  equipCarapaceArmorButton,
  carapaceArmorStatus,
  equipCyberpartsButton,
  cyberpartsStatus,
  equipBaseballBatButton,
  baseballBatStatus,
  equipKaisersGogglesButton,
  kaisersGogglesStatus,
  equipHardScaleButton,
  hardScaleStatus,
  equipNarwhalHornButton,
  narwhalHornStatus,
  equipCursedHornButton,
  cursedHornStatus,
  equipMightyHornButton,
  mightyHornStatus,
  equipBlazingArmorButton,
  blazingArmorStatus,
  equipAncientRelicButton,
  ancientRelicStatus,
  equipCatGlovesButton,
  catGlovesStatus,
  equipDespairClawButton,
  despairClawStatus,
  equipJumboCannonButton,
  jumboCannonStatus,
  equipCyberSwordButton,
  cyberSwordStatus,
  equipArsenalButton,
  arsenalStatus,
  equipAncientTabletButton,
  ancientTabletStatus,
  equipInfiniteHeadsButton,
  infiniteHeadsStatus,
  equipFurCoatButton,
  furCoatStatus,
  equipInfinityGauntletButton,
  infinityGauntletStatus,
  equipShellArmorButton,
  shellArmorStatus,
  equipGarurumonCoatButton,
  garurumonCoatStatus,
  equipGearRingButton,
  gearRingStatus,
  equipSacredCollarButton,
  sacredCollarStatus,
  equipCockatriceFeatherButton,
  cockatriceFeatherStatus,
  equipGaogamonMachineGunButton,
  gaogamonMachineGunStatus,
  equipPoisonedDaggerButton,
  poisonedDaggerStatus,
  equipNinjaStarsButton,
  ninjaStarsStatus,
  equipBoxingGlovesButton,
  boxingGlovesStatus,
  equipChainsawButton,
  chainsawStatus,
  equipMetalCoatButton,
  metalCoatStatus,
  equipStingerCannonButton,
  stingerCannonStatus,
  equipDarkLanceButton,
  darkLanceStatus,
  equipVDramonHornButton,
  vDramonHornStatus,
  equipLilimonPetalsButton,
  lilimonPetalsStatus,
  equipAlienPistolButton,
  alienPistolStatus,
  equipThorsHammerButton,
  thorsHammerStatus,
  equipGrowmonFangButton,
  growmonFangStatus,
  equipHedgehogShellButton,
  hedgehogShellStatus,
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
  eventScreen,
  eventTitle,
  eventZoneLabel,
  eventPanel,
  zoneSceneFade,
  eventSpeakerSprite,
  eventSpeakerName,
  eventText,
  eventChoices,
  eventPostActions,
  eventContinueButton,
  eventFeedButton,
  eventRetreatButton,
  battleScreen,
  battleTitle,
  fastCombatButton,
  zoneLevelLabel,
  battleBackButton,
  battleDefaultActions,
  zonePostBattleActions,
  zoneContinueButton,
  zoneFeedButton,
  zoneRetreatButton,
  zoneBattleItems,
  zoneEventItems,
  finalChallengeModal,
  finalChallengeConfirmButton,
  finalChallengeCancelButton,
  actionBackModal,
  actionBackConfirmButton,
  actionBackCancelButton,
  endRunModal,
  endRunTitle,
  endRunMessage,
  endRunConfirmButton,
  dropModal,
  dropModalTitle,
  dropModalMessage,
  dropModalList,
  dropModalConfirmButton,
  battlePlayerName,
  battleOpponentName,
  battlePlayerHp,
  battleOpponentHp,
  battleLog,
  battlePlayerSprite,
  battleOpponentSprite,
  battleField,
  playerStatusAsleep,
  playerStatusPoisoned,
  playerStatusConfused,
  playerStatusDemoralized,
  playerStatusSilenced,
  playerStatusBlinded,
  playerStatusInverted,
  playerStatusBurned,
  playerStatusVampirism,
  playerStatusThorns,
  playerStatusReflector,
  playerStatusImmune,
  playerStatusReckless,
  playerStatusPositivePole,
  playerStatusCursed,
  playerStatusMarked,
  playerStatusDrained,
  playerStatusBound,
  playerStatusNegativePole,
  playerStatusDeepWound,
  playerStatusInfatuated,
  playerStatusFortified,
  playerStatusProtected,
  playerStatusSwift,
  playerStatusFocused,
  playerStatusWeak,
  playerStatusExposed,
  playerStatusSlow,
  playerStatusDistracted,
  opponentStatusAsleep,
  opponentStatusPoisoned,
  opponentStatusConfused,
  opponentStatusDemoralized,
  opponentStatusSilenced,
  opponentStatusBlinded,
  opponentStatusInverted,
  opponentStatusBurned,
  opponentStatusVampirism,
  opponentStatusThorns,
  opponentStatusReflector,
  opponentStatusImmune,
  opponentStatusReckless,
  opponentStatusPositivePole,
  opponentStatusCursed,
  opponentStatusMarked,
  opponentStatusDrained,
  opponentStatusBound,
  opponentStatusNegativePole,
  opponentStatusDeepWound,
  opponentStatusInfatuated,
  opponentStatusFortified,
  opponentStatusProtected,
  opponentStatusSwift,
  opponentStatusFocused,
  opponentStatusWeak,
  opponentStatusExposed,
  opponentStatusSlow,
  opponentStatusDistracted,
} = dom;

const inventoryUi: Record<string, { count: HTMLElement; button: HTMLButtonElement }> = {};
const equipmentUi: Record<
  string,
  { status: HTMLElement | null; button: HTMLButtonElement | null }
> = {
  woodenSword: { status: woodenSwordStatus, button: equipWoodenSwordButton },
  carapaceArmor: { status: carapaceArmorStatus, button: equipCarapaceArmorButton },
  cyberparts: { status: cyberpartsStatus, button: equipCyberpartsButton },
  baseballBat: { status: baseballBatStatus, button: equipBaseballBatButton },
  kaisersGoggles: { status: kaisersGogglesStatus, button: equipKaisersGogglesButton },
  hardScale: { status: hardScaleStatus, button: equipHardScaleButton },
  narwhalHorn: { status: narwhalHornStatus, button: equipNarwhalHornButton },
  cursedHorn: { status: cursedHornStatus, button: equipCursedHornButton },
  mightyHorn: { status: mightyHornStatus, button: equipMightyHornButton },
  blazingArmor: { status: blazingArmorStatus, button: equipBlazingArmorButton },
  ancientRelic: { status: ancientRelicStatus, button: equipAncientRelicButton },
  catGloves: { status: catGlovesStatus, button: equipCatGlovesButton },
  despairClaw: { status: despairClawStatus, button: equipDespairClawButton },
  jumboCannon: { status: jumboCannonStatus, button: equipJumboCannonButton },
  cyberSword: { status: cyberSwordStatus, button: equipCyberSwordButton },
  arsenal: { status: arsenalStatus, button: equipArsenalButton },
  ancientTablet: { status: ancientTabletStatus, button: equipAncientTabletButton },
  infiniteHeads: { status: infiniteHeadsStatus, button: equipInfiniteHeadsButton },
  furCoat: { status: furCoatStatus, button: equipFurCoatButton },
  infinityGauntlet: { status: infinityGauntletStatus, button: equipInfinityGauntletButton },
  shellArmor: { status: shellArmorStatus, button: equipShellArmorButton },
  garurumonCoat: { status: garurumonCoatStatus, button: equipGarurumonCoatButton },
  gearRing: { status: gearRingStatus, button: equipGearRingButton },
  sacredCollar: { status: sacredCollarStatus, button: equipSacredCollarButton },
  cockatriceFeather: { status: cockatriceFeatherStatus, button: equipCockatriceFeatherButton },
  gaogamonMachineGun: { status: gaogamonMachineGunStatus, button: equipGaogamonMachineGunButton },
  poisonedDagger: { status: poisonedDaggerStatus, button: equipPoisonedDaggerButton },
  ninjaStars: { status: ninjaStarsStatus, button: equipNinjaStarsButton },
  boxingGloves: { status: boxingGlovesStatus, button: equipBoxingGlovesButton },
  chainsaw: { status: chainsawStatus, button: equipChainsawButton },
  metalCoat: { status: metalCoatStatus, button: equipMetalCoatButton },
  stingerCannon: { status: stingerCannonStatus, button: equipStingerCannonButton },
  darkLance: { status: darkLanceStatus, button: equipDarkLanceButton },
  vDramonHorn: { status: vDramonHornStatus, button: equipVDramonHornButton },
  lilimonPetals: { status: lilimonPetalsStatus, button: equipLilimonPetalsButton },
  alienPistol: { status: alienPistolStatus, button: equipAlienPistolButton },
  thorsHammer: { status: thorsHammerStatus, button: equipThorsHammerButton },
  growmonFang: { status: growmonFangStatus, button: equipGrowmonFangButton },
  hedgehogShell: { status: hedgehogShellStatus, button: equipHedgehogShellButton },
};

type BattleRole = "player" | "opponent";
type StageOrHybrid = Stage | "Armor-Hybrid";
type EggOption = {
  id: string;
  label: string;
  spriteFramesPath: string;
  locked: boolean;
  baby: Character | null;
  hatchedCharacter: Character | null;
};

type EggDefinition = {
  id: string;
  label: string;
  spriteFramesPath: string;
  babyId: string;
};
type CombatStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
};

type AttackAction = {
  name: "final attack" | "special attack" | "standard attack";
  damage?: number;
  status: string;
  /** Optional self buff/debuff applied to the attacker. */
  selfStatus?: string;
  displayName?: string;
  isSpecial?: boolean;
  isCritical?: boolean;
  heal?: number | "full";
  critKill?: boolean;
  critDamage?: number;
  statusChance?: number;
  selfStatusChance?: number;
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
/** TEMP debug: reveal all zone Info entries. Set to false before release. */
const DEBUG_REVEAL_ZONE_INFO = false;
const LOCKED_EGG_LABEL = "????";
const LOCKED_EGG_SPRITE = "sprites/Digitama/locked_digitama";
const ZONE_INFO_UNKNOWN = "?";

const EGG_DEFINITIONS: EggDefinition[] = [
  // DMC Ver.1–5
  { id: "egg-beta", label: "Beta Egg", spriteFramesPath: "sprites/Digitama/Beta_Digitama", babyId: "botamon" },
  { id: "egg-puni", label: "Puni Egg", spriteFramesPath: "sprites/Digitama/Puni_Digitama", babyId: "punimon" },
  { id: "egg-poyo", label: "Poyo Egg", spriteFramesPath: "sprites/Digitama/Poyo_Digitama", babyId: "poyomon" },
  { id: "egg-yura", label: "Yura Egg", spriteFramesPath: "sprites/Digitama/Yura_Digitama", babyId: "yuramon" },
  { id: "egg-zuba", label: "Zuba Egg", spriteFramesPath: "sprites/Digitama/Zuba_Digitama", babyId: "zurumon" },
  // Pendulum Color 1–6
  { id: "egg-bubb", label: "Bubb Egg", spriteFramesPath: "sprites/Digitama/Bubb_Digitama", babyId: "bubbmon" },
  { id: "egg-pitch", label: "Pitch Egg", spriteFramesPath: "sprites/Digitama/Pitch_Digitama", babyId: "pitchmon" },
  { id: "egg-moku", label: "Moku Egg", spriteFramesPath: "sprites/Digitama/Moku_Digitama", babyId: "mokumon" },
  { id: "egg-nyoki", label: "Nyoki Egg", spriteFramesPath: "sprites/Digitama/Nyoki_Digitama", babyId: "nyokimon" },
  { id: "egg-choro", label: "Choro Egg", spriteFramesPath: "sprites/Digitama/Choro_Digitama", babyId: "choromon" },
  { id: "egg-yukimi", label: "Yukimi Egg", spriteFramesPath: "sprites/Digitama/Yukimi_Digitama", babyId: "yukimibotamon" },
  // Pendulum Color 6–7
  { id: "egg-fuka", label: "Fuka Egg", spriteFramesPath: "sprites/Digitama/Fuka_Digitama", babyId: "fukamon" },
  { id: "egg-tomo", label: "Tomo Egg", spriteFramesPath: "sprites/Digitama/Tomo_Digitama", babyId: "tomorimon" },
];

singlePlayerButton.addEventListener("click", () => {
  state.mode = "history";
  mainMenu.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  characterMenu.classList.remove("hidden");
  if (state.characters.length === 0) {
    loadCharacters();
  }
  resetSession();
  resetRunState();
  resetZoneProgressForNewGame();
  updateZoneUnlockUi();
  updateWeight();
  updateCareStats();
  updateAttributes();
  updateInventory();
  updateEquipmentStatus();
  startGameButton.disabled = true;
  renderCharacterLists();
  startSpritePreview();
});

arenaModeButton.addEventListener("click", () => {
  return;
});

vpetUploadButton.addEventListener("click", () => {
  return;
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
  openHubMenu();
});

actionBackButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  openHubMenu();
});

hubHouseButton.addEventListener("click", () => {
  openActionMenu();
});

hubPathButton.addEventListener("click", () => {
  openZoneMenu();
});

hubBackButton.addEventListener("click", async () => {
  const proceed = await showActionBackPopup();
  if (!proceed) {
    return;
  }
  hubMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  feedMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  zoneInfoMenu.classList.add("hidden");
  battleScreen.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  state.mode = null;
  stopSpritePreview();
  stopFeedingPreview();
  resetSession();
  resetRunState();
  updateWeight();
  updateCareStats();
  updateAttributes();
  updateInventory();
  updateEquipmentStatus();
  updateCaretakerInfo();
});

hubFinalChallengeButton.addEventListener("click", async () => {
  const proceed = await showFinalChallengePopup();
  if (!proceed) {
    return;
  }
  state.finalChallenge = true;
  hubMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  startBattle();
});

zoneMap.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return;
  }
  const infoButton = target.closest<HTMLButtonElement>(".zone-info-button[data-zone]");
  if (infoButton) {
    event.stopPropagation();
    const zoneId = infoButton.dataset.zone;
    if (zoneId && isZoneUnlocked(zoneId) && !isZoneUnavailable(zoneId)) {
      openZoneInfoMenu(zoneId);
    }
    return;
  }
  const zoneButton = target.closest<HTMLButtonElement>(".zone-spot[data-zone]");
  if (!zoneButton) {
    return;
  }
  const zoneId = zoneButton.dataset.zone;
  if (zoneId && isZoneUnlocked(zoneId) && !isZoneUnavailable(zoneId)) {
    enterZone(zoneId);
  }
});

zoneBackButton.addEventListener("click", () => {
  zoneMenu.classList.add("hidden");
  openHubMenu();
});

zoneInfoBackButton.addEventListener("click", () => {
  zoneInfoMenu.classList.add("hidden");
  openZoneMenu();
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
  openFeedMenu("home");
});

trainButton.addEventListener("click", () => {
  if (!canTrainNow()) {
    return;
  }
  actionMenu.classList.add("hidden");
  trainMenu.classList.remove("hidden");
  startTraining();
});

equipmentButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  equipmentMenu.classList.remove("hidden");
  equipmentItemDesc.textContent = ITEM_HOVER_PLACEHOLDER;
  hideItemHoverTooltip();
  updateEquipment();
  startEquipmentPreview();
});

keyItemsButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  keyItemsMenu.classList.remove("hidden");
  keyItemsDesc.textContent = ITEM_HOVER_PLACEHOLDER;
  hideItemHoverTooltip();
  updateKeyItems();
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

function showEndRunPopup(unlockedNames: readonly string[]): Promise<void> {
  return new Promise((resolve) => {
    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const close = () => {
      endRunModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
      endRunConfirmButton.removeEventListener("click", onConfirm);
      endRunModal.removeEventListener("click", onBackdropClick);
      window.removeEventListener("keydown", onKeydown);
      if (previousFocused) {
        previousFocused.focus();
      }
      resolve();
    };

    const onConfirm = () => close();
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === endRunModal) {
        close();
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        close();
      }
    };

    const unlockLine =
      unlockedNames.length > 0
        ? `Unlocked: ${unlockedNames.join(", ")}.`
        : "A new path has been marked.";
    endRunTitle.textContent = "Run Complete";
    endRunMessage.textContent = `${unlockLine} This zone run has ended. Returning home.`;

    endRunModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    endRunConfirmButton.addEventListener("click", onConfirm);
    endRunModal.addEventListener("click", onBackdropClick);
    window.addEventListener("keydown", onKeydown);
    endRunConfirmButton.focus();
  });
}

type DropNotice = {
  name: string;
  amount: number;
  asset: string;
};

const MEAT_DROP_ICON = "data/ui/food_meat.png";
let pendingDropNotices: DropNotice[] = [];

function resolveDropIcon(kind: string, key?: string): string {
  if (kind === "meat" || key === "meat") {
    return MEAT_DROP_ICON;
  }
  if (kind === "equipment" || (key && EQUIPMENT_CONFIG.some((item) => item.key === key))) {
    return EQUIPMENT_CONFIG.find((item) => item.key === key)?.asset || MEAT_DROP_ICON;
  }
  if (kind === "keyItem" || (key && KEY_ITEMS_CONFIG.some((item) => item.key === key))) {
    return KEY_ITEMS_CONFIG.find((item) => item.key === key)?.asset || MEAT_DROP_ICON;
  }
  return INVENTORY_CONFIG.find((item) => item.key === key)?.asset || MEAT_DROP_ICON;
}

function queueDropNotice(name: string, amount: number, asset: string) {
  const qty = Math.max(1, Math.floor(Number(amount) || 1));
  const existing = pendingDropNotices.find((entry) => entry.name === name && entry.asset === asset);
  if (existing) {
    existing.amount += qty;
    return;
  }
  pendingDropNotices.push({ name, amount: qty, asset });
}

function takePendingDropNotices(): DropNotice[] {
  const notices = pendingDropNotices;
  pendingDropNotices = [];
  return notices;
}

function showDropPopup(notices: readonly DropNotice[], sourceName?: string): Promise<void> {
  return new Promise((resolve) => {
    if (!notices.length) {
      resolve();
      return;
    }
    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const close = () => {
      dropModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
      dropModalConfirmButton.removeEventListener("click", onConfirm);
      dropModal.removeEventListener("click", onBackdropClick);
      window.removeEventListener("keydown", onKeydown);
      if (previousFocused) {
        previousFocused.focus();
      }
      resolve();
    };
    const onConfirm = () => close();
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === dropModal) {
        close();
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        close();
      }
    };
    const who = String(sourceName || "The enemy").trim() || "The enemy";
    dropModalTitle.textContent = notices.length > 1 ? "Items Found!" : "Item Found!";
    dropModalMessage.textContent = `${who} dropped:`;
    dropModalList.innerHTML = "";
    notices.forEach((notice) => {
      const row = document.createElement("div");
      row.className = "drop-modal-item";
      const icon = document.createElement("img");
      icon.src = notice.asset;
      icon.alt = notice.name;
      const label = document.createElement("strong");
      label.textContent = notice.amount > 1 ? `${notice.name} ×${notice.amount}` : notice.name;
      row.append(icon, label);
      dropModalList.append(row);
    });
    dropModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    dropModalConfirmButton.addEventListener("click", onConfirm);
    dropModal.addEventListener("click", onBackdropClick);
    window.addEventListener("keydown", onKeydown);
    dropModalConfirmButton.focus();
  });
}

feedBackButton.addEventListener("click", () => {
  closeFeedMenu();
});

equipmentBackButton.addEventListener("click", () => {
  hideItemHoverTooltip();
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  openActionMenu();
});

keyItemsBackButton.addEventListener("click", () => {
  hideItemHoverTooltip();
  keyItemsMenu.classList.add("hidden");
  openActionMenu();
});

trainBackButton.addEventListener("click", () => {
  stopTraining();
  trainMenu.classList.add("hidden");
  openActionMenu();
});

trainRetryButton.addEventListener("click", () => {
  if (!canTrainNow()) {
    return;
  }
  startTraining();
});

evolutionContinue.addEventListener("click", () => {
  evolutionScreen.classList.add("hidden");
  if (resumeZoneAfterEvolution()) {
    return;
  }
  advanceBgCalendarAfterZoneRun();
  state.currentZone = null;
  state.zoneLevel = 0;
  state.zoneEventChance = 0;
  state.activeEvent = null;
  state.eventBattleOverride = null;
  state.zoneBossFight = null;
  state.zoneBossFoughtThisRun = false;
  state.zoneBossVictory = false;
  state.gearUpActive = false;
  hideZonePostBattleActions();
  battleDefaultActions.classList.remove("hidden");
  openActionMenu();
});

function resumeZoneAfterEvolution(): boolean {
  if (!state.currentZone) {
    return false;
  }
  const maxHp = getPlayerCombatStats().hp;
  if (typeof state.zoneRunHp !== "number") {
    state.zoneRunHp = maxHp;
  } else {
    state.zoneRunHp = Math.max(1, Math.min(maxHp, state.zoneRunHp));
  }
  const canContinue = !state.zoneBossVictory;
  if (state.battle) {
    state.battle.ended = true;
    state.battle.playerStats = { ...getPlayerCombatStats() };
    state.battle.playerHp = state.zoneRunHp;
  }
  battleScreen.classList.remove("hidden");
  actionMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  feedMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  eventScreen.classList.add("hidden");
  if (battlePlayerName && state.player) {
    battlePlayerName.textContent = state.player.name || "Player";
  }
  if (battlePlayerSprite && state.player?.spriteFramesPath) {
    battlePlayerSprite.innerHTML = "";
    battlePlayerSprite.append(
      createBattleSprite(state.player.spriteFramesPath, state.player.name, true, "player")
    );
  }
  syncAdventureHpDisplay();
  updateZoneLevelLabel();
  showZonePostBattleActions(canContinue);
  if (canContinue) {
    logBattle(`${state.player?.name || "Your Digimon"} is ready to continue.`);
  }
  return true;
}

gameoverContinue.addEventListener("click", () => {
  stopEndScreen();
  gameoverScreen.classList.add("hidden");
  resetRunState();
  mainMenu.classList.remove("hidden");
});

congratsContinue.addEventListener("click", () => {
  stopEndScreen();
  congratsScreen.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

feedMeatButton.addEventListener("click", () => {
  if (feedReturnContext !== "home") {
    return;
  }
  if ((state.meat ?? 0) <= 0) {
    return;
  }
  state.meat -= 1;
  state.weight += 1;
  updateWeight();
  updateMeatDisplay();
  updateCareStats();
  updateAttributes();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_meat.png";
    feedFoodSprite.alt = "Meat";
  }
  startFeedingPreview(true);
  checkEvolution();
});

buildInventoryFeedCards();
bindInventoryFeedActions();
bindEquipmentActions();
setupItemHoverDescriptions();
feedItemList.addEventListener("scroll", hideItemHoverTooltip);
document.getElementById("equipment-item-list")?.addEventListener("scroll", hideItemHoverTooltip);
keyItemsList.addEventListener("scroll", hideItemHoverTooltip);

battleBackButton.addEventListener("click", () => {
  endBattle();
  battleScreen.classList.add("hidden");
  if (state.mode === "arena") {
    arenaMenu.classList.remove("hidden");
    startSpritePreview();
    return;
  }
  openHubMenu();
});

zoneContinueButton.addEventListener("click", () => {
  continueZoneRun();
});

zoneFeedButton.addEventListener("click", () => {
  openFeedMenu("battle");
});

zoneRetreatButton.addEventListener("click", () => {
  if (!canRetreatZoneRun()) {
    return;
  }
  retreatZoneRun();
});

eventContinueButton.addEventListener("click", () => {
  if (zonePreBattle?.active || state.eventBattleOverride) {
    beginFightFromPrep();
    return;
  }
  if (pendingEventEndRun) {
    pendingEventEndRun = false;
    const unlocks = pendingEventEndRunUnlocks;
    pendingEventEndRunUnlocks = [];
    void showEndRunPopup(unlocks).then(() => {
      retreatZoneRun();
    });
    return;
  }
  continueZoneRun();
});

eventFeedButton.addEventListener("click", () => {
  openFeedMenu("event");
});

eventRetreatButton.addEventListener("click", () => {
  if (!canRetreatZoneRun()) {
    return;
  }
  retreatZoneRun();
});

function bindInventoryFeedActions() {
  INVENTORY_CONFIG.forEach((item) => {
    const button = inventoryUi[item.key]?.button;
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      const context =
        feedReturnContext === "event"
          ? "event"
          : feedReturnContext === "battle"
            ? "adventure"
            : "home";
      useInventoryItem(item.key, context);
    });
  });
}

type FeedItemFilter = "all" | InventoryItemCategory;

const FEED_ITEM_FILTERS: ReadonlyArray<{ id: FeedItemFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "heal", label: "Heal" },
  { id: "debuff", label: "Debuff" },
  { id: "statDebuff", label: "Stat Debuff" },
  { id: "buff", label: "Buff" },
  { id: "statBuff", label: "Stat Buff" },
  { id: "other", label: "Other" },
];

let feedItemFilter: FeedItemFilter = "all";

function getFeedItemCategories(itemKey: string | "meat"): InventoryItemCategory[] {
  if (itemKey === "meat") {
    return ["other"];
  }
  const item = INVENTORY_CONFIG.find((entry) => entry.key === itemKey);
  return getInventoryItemCategories(item);
}

function matchesFeedItemFilter(itemKey: string | "meat"): boolean {
  return feedItemFilter === "all" || getFeedItemCategories(itemKey).includes(feedItemFilter);
}

function bindFeedItemFilters() {
  if (!feedFilters) {
    return;
  }
  feedFilters.innerHTML = "";
  FEED_ITEM_FILTERS.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dex-filter dex-filter-${entry.id}`;
    if (feedItemFilter === entry.id) {
      button.classList.add("is-active");
    }
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      if (feedItemFilter === entry.id) {
        return;
      }
      feedItemFilter = entry.id;
      feedFilters.querySelectorAll(".dex-filter").forEach((node) => {
        node.classList.toggle("is-active", node === button);
      });
      updateMeatDisplay();
      updateInventory();
    });
    feedFilters.append(button);
  });
}

bindFeedItemFilters();

function bindEquipmentActions() {
  EQUIPMENT_CONFIG.forEach((item) => {
    const button = equipmentUi[item.key]?.button;
    if (!button) {
        return;
      }
    button.addEventListener("click", () => {
      if ((state.equipment[item.key] || 0) <= 0) {
        return;
      }
      state.equipped = item.key;
      if (equipmentPreviewImg) {
        equipmentPreviewImg.src = item.asset;
        equipmentPreviewImg.alt = item.alt;
      }
      updateEquipment();
      updateEquipmentStatus();
      updateAttributes();
      // Perfect → Ultimate can trigger on equipping the required item.
      if (state.player?.stage === "Perfect" && getPerfectUltimateTargetId()) {
        equipmentMenu.classList.add("hidden");
        checkEvolution();
      }
    });
  });
}

const ITEM_HOVER_PLACEHOLDER = "Hover an item to see its effect.";

function hideItemHoverTooltip() {
  itemHoverTooltip.classList.add("hidden");
  itemHoverTooltip.textContent = "";
}

function showItemHoverTooltip(anchor: HTMLElement, text: string) {
  const desc = String(text || "").trim();
  if (!desc) {
    hideItemHoverTooltip();
    return;
  }
  if (!feedMenu.classList.contains("hidden")) {
    feedItemDesc.textContent = desc;
  }
  if (!equipmentMenu.classList.contains("hidden")) {
    equipmentItemDesc.textContent = desc;
  }
  if (!keyItemsMenu.classList.contains("hidden")) {
    keyItemsDesc.textContent = desc;
  }
  itemHoverTooltip.textContent = desc;
  itemHoverTooltip.classList.remove("hidden");
  const rect = anchor.getBoundingClientRect();
  const tipRect = itemHoverTooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tipRect.width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
  let top = rect.top - tipRect.height - 10;
  if (top < 8) {
    top = rect.bottom + 10;
  }
  itemHoverTooltip.style.left = `${Math.round(left)}px`;
  itemHoverTooltip.style.top = `${Math.round(top)}px`;
}

function bindItemHoverDescription(button: HTMLElement, text: string) {
  const desc = String(text || "").trim();
  button.dataset.tooltip = desc;
  button.addEventListener("mouseenter", () => showItemHoverTooltip(button, desc));
  button.addEventListener("focus", () => showItemHoverTooltip(button, desc));
  button.addEventListener("mouseleave", hideItemHoverTooltip);
  button.addEventListener("blur", hideItemHoverTooltip);
}

function setupItemHoverDescriptions() {
  bindItemHoverDescription(feedMeatButton, "Meat: +1 Weight.");
  INVENTORY_CONFIG.forEach((item) => {
    const button = inventoryUi[item.key]?.button;
    if (!button) {
      return;
    }
    bindItemHoverDescription(button, item.label || item.name);
  });
  EQUIPMENT_CONFIG.forEach((item) => {
    const button = equipmentUi[item.key]?.button;
    if (!button) {
      return;
    }
    bindItemHoverDescription(button, formatEquipmentEffect(item));
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
  ].filter(Boolean);
  meta.textContent = metaParts.length
    ? metaParts.join(" \u00B7 ")
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
  card.className = egg.locked ? "character-card locked" : "character-card";
  card.dataset.id = egg.id;
  if (egg.locked) {
    card.disabled = true;
    card.setAttribute("aria-disabled", "true");
  }

  const displayLabel = egg.locked ? LOCKED_EGG_LABEL : egg.label;
  const displaySprite = egg.locked ? LOCKED_EGG_SPRITE : egg.spriteFramesPath;

  if (displaySprite) {
    const frame = document.createElement("div");
    frame.className = "character-sprite-frame";

    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${displaySprite}/frame_00.png`;
    sprite.alt = egg.locked ? "Locked egg" : `${egg.label} sprite`;
    sprite.dataset.basePath = `data/${displaySprite}`;
    sprite.dataset.previewMode = "egg";
    sprite.dataset.frameIndex = "0";

    frame.append(sprite);
    card.append(frame);
  }

  const name = document.createElement("h3");
  name.className = "character-name";
  name.textContent = displayLabel;

  const meta = document.createElement("p");
  meta.className = "character-meta";
  meta.textContent = egg.locked ? "Stage: Egg \u00B7 Locked" : "Stage: Egg \u00B7 Click to hatch";

  card.append(name, meta);

  if (egg.locked) {
    return card;
  }

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
        ].filter(Boolean);
        meta.textContent = metaParts.length
          ? metaParts.join(" \u00B7 ")
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
    applyStarterAttributes();
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
      if (roll < 0.1) {
        next = 8;
      } else if (roll < 0.2) {
        next = 7;
      } else if (roll < 0.32) {
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
const FAST_COMBAT_KEY = "fastCombatV1";
const FAST_COMBAT_SCALE = 0.18;
const PROJECTILE_PX_PER_SEC = 420;
const FAST_PROJECTILE_PX_PER_SEC = 2200;

function isFastCombat(): boolean {
  return fastCombatButton.getAttribute("aria-pressed") === "true";
}

function combatMs(ms: number): number {
  const value = Math.max(0, Number(ms) || 0);
  if (!isFastCombat()) {
    return value;
  }
  return Math.max(1, Math.round(value * FAST_COMBAT_SCALE));
}

function combatProjectileSpeed(): number {
  return isFastCombat() ? FAST_PROJECTILE_PX_PER_SEC : PROJECTILE_PX_PER_SEC;
}

function setFastCombat(on: boolean) {
  fastCombatButton.setAttribute("aria-pressed", on ? "true" : "false");
  fastCombatButton.classList.toggle("is-pressed", on);
  battleScreen.classList.toggle("fast-combat", on);
  writeFastCombatSetting(on);
}

function syncFastCombatUi() {
  setFastCombat(readFastCombatSetting());
}

function readFastCombatSetting(): boolean {
  try {
    return window.localStorage.getItem(FAST_COMBAT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeFastCombatSetting(on: boolean) {
  try {
    window.localStorage.setItem(FAST_COMBAT_KEY, on ? "1" : "0");
  } catch {
    // Ignore quota / private-mode failures.
  }
}

syncFastCombatUi();
fastCombatButton.addEventListener("click", () => {
  setFastCombat(!isFastCombat());
});
let attackCleanupId: (() => void) | null = null;
/** Pre-rolled zone wild opponent (flee check / chase). Cleared when battle starts. */
let pendingZoneOpponent: Character | null = null;
/** Zone fight is queued; player may use one item after seeing the opponent. */
let zonePreBattle: { active: true; itemUsed: boolean; kind: "wild" | "event" | "boss" } | null =
  null;
/** Soft-end zone run after event Continue / popup (recruit paths). */
let pendingEventEndRun = false;
let pendingEventEndRunUnlocks: string[] = [];
/** Next zone event id forced after Continue (same zone). */
let pendingQueuedEventId: string | null = null;
/** Boss rolled for pre-fight dialogue; cleared when fight starts or dialogue is abandoned. */
let pendingBossEncounter: { boss: ZoneBossConfig; opponentId: string } | null = null;
const FLEE_STAGE_GAP = 2;
const FLEE_CHANCE = 0.2;

function startBattle() {
  characterMenu.classList.add("hidden");
  arenaMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  zoneInfoMenu.classList.add("hidden");
  eventScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  hideZonePostBattleActions();
  if (state.eventBattleOverride) {
    const forced = state.characters.find(
      (char) => String(char.id) === String(state.eventBattleOverride?.opponentId)
    );
    state.opponent = forced || state.characters[0] || {};
    pendingZoneOpponent = null;
  } else if (state.zoneBossFight) {
    const forced = state.characters.find(
      (char) => String(char.id) === String(state.zoneBossFight?.opponentId)
    );
    state.opponent = forced || state.characters[0] || {};
    pendingZoneOpponent = null;
  } else if (pendingZoneOpponent) {
    state.opponent = pendingZoneOpponent;
    pendingZoneOpponent = null;
  } else if (state.mode !== "arena" || !state.opponent) {
    state.opponent = pickRandomOpponent();
  }
  if (
    state.currentZone &&
    !state.zoneBossFight &&
    !state.eventBattleOverride &&
    state.opponent?.id
  ) {
    markSeenZoneEntry(state.currentZone, "encounters", String(state.opponent.id));
  }
  updateZoneLevelLabel();
  updateBattleBackground();

  const activeConsumable = state.mode === "arena" ? null : state.activeConsumable;
  const playerStats = getPlayerCombatStats();
  const opponentStats = getOpponentCombatStats(state.opponent);
  let startingPlayerHp = playerStats.hp;
  if (state.currentZone && typeof state.zoneRunHp === "number") {
    startingPlayerHp = Math.max(1, Math.min(playerStats.hp, state.zoneRunHp));
  }
  if (activeConsumable === "mushroom") {
    startingPlayerHp += 1;
    state.activeConsumable = null;
    updateEquipmentStatus();
  }
  state.battle = {
    playerHp: startingPlayerHp,
    opponentHp: opponentStats.hp,
    playerStats,
    opponentStats,
    turn: "player",
    forceSpecial: activeConsumable === "pepper" ? "player" : null,
    status: {
      player: createEmptyBattleStatus(),
      opponent: createEmptyBattleStatus(),
    },
    statMods: {
      player: createEmptyStatMods(),
      opponent: createEmptyStatMods(),
    },
    statusImmune: {
      player: activeConsumable === "medicine",
      opponent: false,
    },
    specialBonus:
      (activeConsumable === "yellow_pear" ? 0.2 : 0) +
      (activeConsumable === "focus_lens" ? 0.25 : 0),
    statusBonus: {
      sleep: activeConsumable === "storm_cloud" ? 0.1 : 0,
      poison: activeConsumable === "poison_vial" ? 0.1 : 0,
      confuse: activeConsumable === "beer_bottle" ? 0.1 : 0,
      demoralize: 0,
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
    extraTurnQueued: null,
    bossTimers: isBossBattle() ? { status: {}, debuff: {} } : null,
  };
  if (activeConsumable === "null_powder") {
    state.battle.status.player = createEmptyBattleStatus();
    state.battle.status.opponent = createEmptyBattleStatus();
    state.battle.statMods.player = createEmptyStatMods();
    state.battle.statMods.opponent = createEmptyStatMods();
    logBattle("Null Powder clears all status effects.");
  }
  if (state.gearUpActive) {
    applyGearUpBuffs();
    logBattle("Gear Up! All buffs are active.");
  }
  applyZoneRunBuffsToBattle();
  if (state.eventBattleOverride?.opponentStartBuffs) {
    applyOpponentStartBuffs(state.eventBattleOverride.opponentStartBuffs);
  }
  if (state.eventBattleOverride?.playerStartDebuffs?.length) {
    applyPlayerStartDebuffs(state.eventBattleOverride.playerStartDebuffs);
  }
  applyPendingOpponentCombatEffects();
  applyPendingPlayerCombatEffects();
  applyEquippedStartStatuses();
  if (activeConsumable === "medicine") {
    state.activeConsumable = null;
    updateEquipmentStatus();
  }
  if (activeConsumable === "yellow_pear" || activeConsumable === "focus_lens") {
    state.activeConsumable = null;
    updateEquipmentStatus();
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
    updateEquipmentStatus();
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
  if (state.currentZone) {
    const file = getZoneBackgroundFile(state.currentZone, state.zoneLevel, readBgCalendarDay());
    if (file) {
      battleField.style.backgroundImage = `url("data/ui/${file}")`;
      rememberZoneBackgroundUrl(`url("data/ui/${file}")`);
      return;
    }
  }
  let stage: StageOrHybrid = isStage(state.player.stage) ? state.player.stage : "Child";
  if (state.finalChallenge && state.opponent?.stage) {
    stage = state.opponent.stage === "Armor-Hybrid" || isStage(state.opponent.stage)
      ? state.opponent.stage
      : "Child";
  }
  const mapping: Record<StageOrHybrid, string> = {
    "Baby I": "bg_baby_i.png",
    "Baby II": "bg_baby_ii.png",
    Child: "bg_child.png",
    Adult: "bg_adult.png",
    Perfect: "bg_perfect.png",
    Ultimate: "bg_ultimate.png",
    "Armor-Hybrid": "bg_armor_hybrid.png",
  };
  const file = mapping[stage] || mapping.Child;
  battleField.style.backgroundImage = `url("data/ui/${file}")`;
}

function getStatProcChance(statValue: number): number {
  const value = Number(statValue);
  const safe = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1, (10 + safe) / 100));
}

function getPlayerCombatStats(): CombatStats {
  const bonuses = getEquipmentBonuses();
  const attrs = state.attributes;
  const train = getHomeTrainBoost();
  return {
    hp: attrs.hp + (bonuses.hp || 0),
    attack: attrs.attack + (bonuses.attack || 0) + train,
    defense: attrs.defense + (bonuses.defense || 0) + train,
    speed: attrs.speed + (bonuses.speed || 0) + train,
    intelligence: attrs.intelligence + (bonuses.intelligence || 0) + train,
  };
}

function getOpponentCombatStats(opponent: Character | null): CombatStats {
  if (state.eventBattleOverride?.stats) {
    return { ...state.eventBattleOverride.stats };
  }
  if (state.zoneBossFight?.stats) {
    return { ...state.zoneBossFight.stats };
  }
  const zoneId = state.currentZone;
  const encounterId = opponent?.id != null ? String(opponent.id) : "";
  let identity = null;
  if (zoneId && encounterId && zoneId in ZONE_ENCOUNTERS) {
    const config = ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS];
    const entry = findZoneEncounterEntry(config, encounterId);
    identity = entry ? getEncounterEntryStats(entry) : null;
  }
  if (zoneId) {
    return getWildCombatStats(opponent, zoneId, identity);
  }
  return getCharacterCombatStats(opponent);
}

function getCombatStats(role: BattleRole): CombatStats {
  const base =
    role === "player"
      ? state.battle?.playerStats || getPlayerCombatStats()
      : state.battle?.opponentStats || getOpponentCombatStats(state.opponent);
  return applyBattleStatMods(role, applyCursedEquipmentInversion(role, base));
}

function applyCursedEquipmentInversion(role: BattleRole, stats: CombatStats): CombatStats {
  if (role !== "player" || !hasBattleStatus(role, "cursed")) {
    return stats;
  }
  const bonuses = getEquipmentBonuses();
  const invert = (stat: keyof CombatStats) => {
    const bonus = Number(bonuses[stat]) || 0;
    if (!bonus) {
      return stats[stat];
    }
    return Math.max(0, Number(stats[stat]) - bonus * 2);
  };
  return {
    hp: invert("hp"),
    attack: invert("attack"),
    defense: invert("defense"),
    speed: invert("speed"),
    intelligence: invert("intelligence"),
  };
}

function openZoneMenu() {
  characterMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  battleScreen.classList.add("hidden");
  eventScreen.classList.add("hidden");
  feedMenu.classList.add("hidden");
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  evolutionScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  congratsScreen.classList.add("hidden");
  hubMenu.classList.add("hidden");
  zoneInfoMenu.classList.add("hidden");
  renderZoneMap();
  zoneMenu.classList.remove("hidden");
  updateZoneUnlockUi();
  stopEndScreen();
  stopSpritePreview();
}

function renderZoneMap() {
  if (!zoneMap) {
    return;
  }
  zoneMap.innerHTML = "";
  ZONE_CONFIG.forEach((zone) => {
    const wrap = document.createElement("div");
    wrap.className = "zone-spot-wrap";

    const infoButton = document.createElement("button");
    infoButton.type = "button";
    infoButton.className = isZoneUnavailable(zone.id)
      ? "zone-info-button unavailable"
      : "zone-info-button locked";
    infoButton.dataset.zone = zone.id;
    infoButton.setAttribute("aria-label", `${zone.name} info`);
    infoButton.title = isZoneUnavailable(zone.id) ? "Unavailable" : "Info";
    infoButton.disabled = true;
    infoButton.textContent = "i";

    const zoneButton = document.createElement("button");
    zoneButton.type = "button";
    zoneButton.className = isZoneUnavailable(zone.id)
      ? `hub-spot zone-spot zone-tier-${zone.difficultyTier} unavailable`
      : `hub-spot zone-spot zone-tier-${zone.difficultyTier} locked`;
    zoneButton.dataset.zone = zone.id;
    zoneButton.dataset.tier = String(zone.difficultyTier);
    zoneButton.disabled = true;

    const img = document.createElement("img");
    img.className = "hub-image";
    img.src = zone.asset;
    img.alt = zone.name;
    img.width = 160;
    img.height = 160;

    const label = document.createElement("span");
    label.className = "hub-label";
    label.textContent = zone.name;

    zoneButton.append(img, label);
    wrap.append(infoButton, zoneButton);
    zoneMap.append(wrap);
  });
}

function unlockZones(zoneIds: readonly string[] | string[]): string[] {
  const newly = unlockZoneIds(zoneIds);
  if (newly.length > 0) {
    updateZoneUnlockUi();
  }
  return newly;
}

function updateZoneUnlockUi() {
  if (!zoneMap) {
    return;
  }
  if (!zoneMap.querySelector(".zone-spot")) {
    renderZoneMap();
  }
  const unlocked = new Set(readUnlockedZoneIds());
  zoneMap.querySelectorAll<HTMLButtonElement>(".zone-spot[data-zone]").forEach((button) => {
    const id = button.dataset.zone || "";
    const unavailable = isZoneUnavailable(id);
    const isOpen = !unavailable && unlocked.has(id);
    button.disabled = !isOpen;
    button.classList.toggle("unavailable", unavailable);
    button.classList.toggle("locked", !isOpen && !unavailable);
  });
  zoneMap.querySelectorAll<HTMLButtonElement>(".zone-info-button[data-zone]").forEach((button) => {
    const id = button.dataset.zone || "";
    const unavailable = isZoneUnavailable(id);
    const isOpen = !unavailable && unlocked.has(id);
    button.disabled = !isOpen;
    button.classList.toggle("unavailable", unavailable);
    button.classList.toggle("locked", !isOpen && !unavailable);
    button.title = unavailable ? "Unavailable" : "Info";
  });
}

function getZoneEncounterIds(zoneId: string): string[] {
  if (!(zoneId in ZONE_ENCOUNTERS)) {
    return [];
  }
  const config = ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS];
  return listZoneEncounterIds(config);
}

function getZoneBossOpponentIds(zoneId: string): string[] {
  if (!(zoneId in ZONE_BOSSES)) {
    return [];
  }
  const boss = ZONE_BOSSES[zoneId as keyof typeof ZONE_BOSSES];
  const ids = listZoneBossOpponentIds(boss);
  listBossDialogueCharacterIds(zoneId).forEach((id) => {
    if (!ids.includes(id)) {
      ids.push(id);
    }
  });
  return ids;
}

function getZoneEncounterStats(
  zoneId: string,
  encounterId: string
): { hp: number; attack: number; defense: number; speed: number; intelligence: number } | null {
  if (!(zoneId in ZONE_ENCOUNTERS)) {
    return null;
  }
  const config = ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS];
  const entry = findZoneEncounterEntry(config, encounterId);
  const character = state.characters.find((char) => String(char.id) === String(encounterId));
  if (!character && !entry) {
    return null;
  }
  const identity = entry ? getEncounterEntryStats(entry) : null;
  return getWildCombatStats(character, zoneId, identity);
}

function getZoneBossEntry(zoneId: string, opponentId: string) {
  if (!(zoneId in ZONE_BOSSES)) {
    return null;
  }
  const boss = ZONE_BOSSES[zoneId as keyof typeof ZONE_BOSSES];
  const id = String(opponentId);
  if (listZoneBossOpponentIds(boss).includes(id)) {
    return boss;
  }
  return listBossDialogueCharacterIds(zoneId).includes(id) ? boss : null;
}

function formatCombatStatsLine(stats: {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}): string {
  return `HP ${stats.hp} · Atk ${stats.attack} · Def ${stats.defense} · Spd ${stats.speed} · Int ${stats.intelligence}`;
}

function formatDropChance(chance: number): string {
  const pct = Math.round(Number(chance) * 100);
  return `${pct}%`;
}

function resolveDropDisplayName(drop: {
  kind: string;
  key?: string;
  label?: string;
}): string {
  if (drop.label) {
    return drop.label;
  }
  if (drop.kind === "meat") {
    return "Meat";
  }
  if (drop.kind === "equipment" && drop.key) {
    const item = EQUIPMENT_CONFIG.find((entry) => entry.key === drop.key);
    return item?.name || drop.key;
  }
  if (drop.key) {
    const item = INVENTORY_CONFIG.find((entry) => entry.key === drop.key);
    return item?.name || drop.key;
  }
  return "Item";
}

function formatDropsLine(
  drops:
    | ReadonlyArray<{
        kind: string;
        key?: string;
        chance: number;
        amount?: number;
        label?: string;
      }>
    | null
    | undefined
): string {
  if (!drops?.length) {
    return "Drops: —";
  }
  const parts = drops.map((drop) => {
    const name = resolveDropDisplayName(drop);
    const amount =
      (drop.kind === "inventory" || drop.kind === "meat") && Number(drop.amount || 1) > 1
        ? ` x${Number(drop.amount)}`
        : "";
    return `${name}${amount} (${formatDropChance(drop.chance)})`;
  });
  return `Drops: ${parts.join(", ")}`;
}

function formatWildEncounterDropsLine(zoneId: string, opponentId: string): string {
  const configured = getZoneEncounterDrops(zoneId, opponentId);
  if (configured.length) {
    return formatDropsLine(configured);
  }
  return "Drops: random item (5%)";
}

function getZoneEncounterDrops(
  zoneId: string,
  opponentId: string
): ReadonlyArray<{ kind: string; key?: string; chance: number; amount?: number }> {
  if (!(zoneId in ZONE_ENCOUNTERS)) {
    return [];
  }
  const config = ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS] as {
    enemyDrops?: Record<
      string,
      ReadonlyArray<{ kind: string; key?: string; chance: number; amount?: number }>
    >;
  };
  return config.enemyDrops?.[opponentId] || [];
}

function resolveEventFightStats(outcome: Extract<ZoneEventOutcome, { type: "fight" }>): {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
} | null {
  if (outcome.combatProfile) {
    return getTableCombatStats(outcome.combatProfile.stage, outcome.combatProfile.tier);
  }
  if (outcome.stats) {
    return { ...outcome.stats };
  }
  return null;
}

function getEventFightPreview(eventDef: ZoneEventDefinition): {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
  } | null;
  drops: Array<{ kind: string; key: string; chance: number; amount?: number; label?: string }>;
} {
  let stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
  } | null = null;
  const drops: Array<{
    kind: string;
    key: string;
    chance: number;
    amount?: number;
    label?: string;
  }> = [];
  forEachZoneEventChoice(eventDef, (choice) => {
    (choice.outcomes || []).forEach((outcome) => {
      if (outcome?.type !== "fight") {
        return;
      }
      if (!stats) {
        const resolved = resolveEventFightStats(outcome);
        if (resolved) {
          stats = resolved;
        }
      }
      if (outcome.rewardOnWin?.key) {
        drops.push({
          kind: "inventory",
          key: outcome.rewardOnWin.key,
          chance: 1,
          amount: outcome.rewardOnWin.amount || 1,
          label: outcome.rewardOnWin.label,
        });
      }
    });
  });
  return { stats, drops };
}

function createZoneInfoCard(options: {
  seen: boolean;
  label: string;
  meta: string;
  spritePath?: string | null;
  statsLine?: string | null;
  dropsLine?: string | null;
}) {
  const card = document.createElement("div");
  card.className = options.seen
    ? "character-card zone-info-card"
    : "character-card zone-info-card locked";

  if (options.seen && options.spritePath) {
    const frame = document.createElement("div");
    frame.className = "character-sprite-frame";
    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${options.spritePath}/frame_00.png`;
    sprite.alt = `${options.label} sprite`;
    frame.append(sprite);
    card.append(frame);
  } else {
    const unknown = document.createElement("div");
    unknown.className = "zone-info-unknown";
    unknown.textContent = ZONE_INFO_UNKNOWN;
    unknown.setAttribute("aria-hidden", "true");
    card.append(unknown);
  }

  const name = document.createElement("h3");
  name.className = "character-name";
  name.textContent = options.seen ? options.label : ZONE_INFO_UNKNOWN;

  const meta = document.createElement("p");
  meta.className = "character-meta";
  meta.textContent = options.seen ? options.meta : "Not seen yet";

  card.append(name, meta);

  if (options.seen) {
    if (options.statsLine) {
      const stats = document.createElement("p");
      stats.className = "character-meta zone-info-detail";
      stats.textContent = options.statsLine;
      card.append(stats);
    }
    if (options.dropsLine) {
      const drops = document.createElement("p");
      drops.className = "character-meta zone-info-detail";
      drops.textContent = options.dropsLine;
      card.append(drops);
    }
  }
  return card;
}

function fillZoneInfoList(
  container: HTMLElement,
  heading: HTMLElement,
  title: string,
  cards: HTMLElement[]
) {
  container.innerHTML = "";
  const seenCount = cards.filter((card) => !card.classList.contains("locked")).length;
  heading.textContent = `${title} (${seenCount}/${cards.length})`;
  if (cards.length === 0) {
    const empty = document.createElement("p");
    empty.className = "zone-info-empty";
    empty.textContent = "Nothing listed for this zone yet.";
    container.append(empty);
    return;
  }
  cards.forEach((card) => container.append(card));
}

function openZoneInfoMenu(zoneId: string) {
  if (!isZoneUnlocked(zoneId) || isZoneUnavailable(zoneId)) {
    return;
  }
  const seen = getSeenZoneContent(zoneId);
  const seenEncounters = new Set(seen.encounters);
  const seenEvents = new Set(seen.events);
  const seenBosses = new Set(seen.bosses);
  const revealAll = DEBUG_REVEAL_ZONE_INFO;

  zoneInfoTitle.textContent = `${getZoneName(zoneId)} Info`;
  zoneInfoSubtitle.textContent = revealAll
    ? "DEBUG: all zone content is revealed."
    : "Only creatures and events you have already seen are revealed.";

  const encounterCards = getZoneEncounterIds(zoneId).map((id) => {
    const character = state.characters.find((char) => String(char.id) === String(id));
    const isSeen = revealAll || seenEncounters.has(id);
    const stats = getZoneEncounterStats(zoneId, id);
    return createZoneInfoCard({
      seen: isSeen,
      label: character?.name || id,
      meta: character?.stage ? `Stage: ${character.stage}` : "Encounter",
      spritePath: character?.spriteFramesPath,
      statsLine: stats ? formatCombatStatsLine(stats) : null,
      dropsLine: formatWildEncounterDropsLine(zoneId, id),
    });
  });

  const eventDefs = ZONE_EVENTS[zoneId] || [];
  const eventCards = eventDefs.map((eventDef) => {
    const speaker = state.characters.find(
      (char) => String(char.id) === String(eventDef.speakerId)
    );
    const isSeen = revealAll || seenEvents.has(eventDef.id);
    const fightPreview = getEventFightPreview(eventDef);
    return createZoneInfoCard({
      seen: isSeen,
      label: eventDef.title || "Event",
      meta: speaker?.name ? `With ${speaker.name}` : "Event",
      spritePath: speaker?.spriteFramesPath,
      statsLine: fightPreview.stats
        ? `Fight: ${formatCombatStatsLine(fightPreview.stats)}`
        : "Fight: —",
      dropsLine: formatDropsLine(fightPreview.drops),
    });
  });

  const bossCards = getZoneBossOpponentIds(zoneId).map((id) => {
    const character = state.characters.find((char) => String(char.id) === String(id));
    const isSeen = revealAll || seenBosses.has(id);
    const boss = getZoneBossEntry(zoneId, id);
    return createZoneInfoCard({
      seen: isSeen,
      label: character?.name || id,
      meta: "Boss",
      spritePath: character?.spriteFramesPath,
      statsLine: formatCombatStatsLine(getBossCombatStats(zoneId)),
      dropsLine: formatDropsLine(filterDropsForOpponent(boss?.drops, id)),
    });
  });

  fillZoneInfoList(
    zoneInfoEncounters,
    zoneInfoEncountersHeading,
    "Encounters",
    encounterCards
  );
  fillZoneInfoList(zoneInfoEvents, zoneInfoEventsHeading, "Events", eventCards);
  fillZoneInfoList(zoneInfoBosses, zoneInfoBossesHeading, "Bosses", bossCards);

  zoneMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  zoneInfoMenu.classList.remove("hidden");
}

function getZoneBackgroundUrl(zoneId: string | null = state.currentZone): string {
  if (!zoneId) {
    return "";
  }
  const file = getZoneBackgroundFile(zoneId, state.zoneLevel, readBgCalendarDay());
  return file ? `url("data/ui/${file}")` : "";
}

let lastZoneBackgroundUrl = "";
let zoneSceneTransitioning = false;
let zoneSceneFadeTimer = 0;

function preloadCssBackground(cssUrl: string): Promise<void> {
  const match = cssUrl.match(/url\(["']?([^"')]+)["']?\)/);
  const src = match?.[1];
  if (!src) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function rememberZoneBackgroundUrl(cssUrl: string) {
  lastZoneBackgroundUrl = cssUrl;
}

function playZoneBackgroundTransition(then: () => void) {
  const nextUrl = getZoneBackgroundUrl();
  if (!zoneSceneFade || nextUrl === lastZoneBackgroundUrl) {
    then();
    rememberZoneBackgroundUrl(nextUrl);
    return;
  }
  zoneSceneTransitioning = true;
  window.clearTimeout(zoneSceneFadeTimer);
  zoneSceneFade.classList.add("active");
  const fadeMs = 550;
  const started = Date.now();
  void preloadCssBackground(nextUrl).then(() => {
    const wait = Math.max(80, fadeMs - (Date.now() - started));
    zoneSceneFadeTimer = window.setTimeout(() => {
      then();
      rememberZoneBackgroundUrl(nextUrl);
      zoneSceneFadeTimer = window.setTimeout(() => {
        zoneSceneFade.classList.remove("active");
        zoneSceneTransitioning = false;
      }, 90);
    }, wait);
  });
}

function getZoneTimeOfDay(zoneId: string | null = state.currentZone) {
  if (!zoneId || isIndoorZone(zoneId) || state.zoneLevel <= 0) {
    return null;
  }
  return getTimeOfDayForZoneLevel(state.zoneLevel);
}

function renderZoneProgressLabel(target: HTMLElement, suffix = "") {
  if (!state.currentZone || state.zoneLevel <= 0) {
    target.textContent = "";
    return;
  }
  const tod = getZoneTimeOfDay();
  const name = getZoneName();
  const text = suffix ? `${name} ${suffix}` : `${name} ${state.zoneLevel}`;
  target.textContent = "";
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  target.append(textSpan);
  if (tod) {
    const icon = document.createElement("img");
    icon.src = TIME_OF_DAY_ICONS[tod];
    icon.alt = TIME_OF_DAY_LABELS[tod];
    icon.title = TIME_OF_DAY_LABELS[tod];
    icon.className = "tod-icon";
    target.append(icon);
  }
}

function enterZone(zoneId: string) {
  if (!isZoneUnlocked(zoneId) || isZoneUnavailable(zoneId)) {
    return;
  }
  const rules = getZoneRunRules(zoneId);
  state.currentZone = zoneId;
  state.zoneLevel = 1;
  state.zoneRunHp = getPlayerCombatStats().hp;
  state.zoneEventChance =
    typeof rules.eventChanceStart === "number" ? rules.eventChanceStart : 0;
  state.activeEvent = null;
  state.eventBattleOverride = null;
  state.zoneBossFight = null;
  state.zoneBossFoughtThisRun = false;
  state.zoneBossVictory = false;
  state.lastRolledZoneEventId = null;
  if (state.gearUpPending) {
    state.gearUpActive = true;
    state.gearUpPending = false;
  }
  state.zoneRunBuffs = {
    attack: Boolean(state.zoneRunBuffsPending.attack),
    defense: Boolean(state.zoneRunBuffsPending.defense),
    speed: Boolean(state.zoneRunBuffsPending.speed),
    intelligence: Boolean(state.zoneRunBuffsPending.intelligence),
  };
  state.zoneRunBuffsPending = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  state.zoneRunDebuffs = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  pendingZoneOpponent = null;
  pendingBossEncounter = null;
  zonePreBattle = null;
  zoneMenu.classList.add("hidden");
  zoneInfoMenu.classList.add("hidden");
  playZoneBackgroundTransition(() => {
    if (tryStartZoneOpeningEvent(zoneId)) {
      return;
    }
    beginZoneEncounter();
  });
}

/** Returns true if an opening event was started. */
function tryStartZoneOpeningEvent(zoneId: string): boolean {
  const rules = getZoneRunRules(zoneId);
  if (!rules.startEvent) {
    return false;
  }
  const events = ZONE_EVENTS[zoneId] || [];
  if (events.length === 0) {
    return false;
  }
  const snapshot = buildEventStatSnapshot();
  if (rules.startEvent === true) {
    const picked = pickWeightedZoneEvent(events, snapshot, {
      excludeIds: getZoneEncounterExcludeIds(),
    });
    if (!picked) {
      return false;
    }
    startZoneEvent([picked]);
    return true;
  }
  const forced = events.filter(
    (event) =>
      event.id === rules.startEvent &&
      !getZoneEncounterExcludeIds().includes(event.id) &&
      eventPassesRequirements(event, snapshot)
  );
  if (forced.length === 0) {
    return false;
  }
  startZoneEvent(forced);
  return true;
}

function getZoneEncounterExcludeIds(): string[] {
  const excluded = getExcludedEventIds(state.consumedEventIds);
  if (state.lastRolledZoneEventId) {
    excluded.push(state.lastRolledZoneEventId);
  }
  return [...new Set(excluded)];
}

function isResolvedStoryZoneEvent(): boolean {
  const id = String(state.activeEvent?.id || "");
  if (!state.activeEvent?.resolved || !id) {
    return false;
  }
  if (id === "opponent_flee" || id === "player_flee" || id === "pre_battle") {
    return false;
  }
  if (id.startsWith("boss_")) {
    return false;
  }
  return true;
}

function getZoneEventChanceStep(zoneId: string | null = state.currentZone): number {
  const rules = getZoneRunRules(zoneId);
  return typeof rules.eventChanceStep === "number" ? rules.eventChanceStep : EVENT_CHANCE_STEP;
}

function getZoneEventChanceMax(zoneId: string | null = state.currentZone): number {
  const rules = getZoneRunRules(zoneId);
  return typeof rules.eventChanceMax === "number" ? rules.eventChanceMax : EVENT_CHANCE_MAX;
}

function beginZoneEncounter() {
  if (!state.currentZone) {
    return;
  }
  closeEventScreen();
  state.zoneBossFight = null;
  if (pendingQueuedEventId) {
    const queuedId = pendingQueuedEventId;
    pendingQueuedEventId = null;
    const queued = (ZONE_EVENTS[state.currentZone] || []).find(
      (event) => event.id === queuedId
    );
    if (queued) {
      startForcedZoneEvent(queued);
      return;
    }
  }
  const boss =
    state.currentZone in ZONE_BOSSES
      ? ZONE_BOSSES[state.currentZone as keyof typeof ZONE_BOSSES]
      : null;
  if (
    boss &&
    !isZoneBossDefeated(state.currentZone) &&
    !state.zoneBossFoughtThisRun &&
    state.zoneLevel > boss.appearAfterLevel &&
    Math.random() < boss.chance
  ) {
    beginZoneBossDialogue(boss);
    return;
  }
  const events = ZONE_EVENTS[state.currentZone] || [];
  const snapshot = buildEventStatSnapshot();
  const eligible = filterEligibleZoneEvents(events, snapshot, {
    excludeIds: getZoneEncounterExcludeIds(),
  });
  const rollEvent = eligible.length > 0 && Math.random() < state.zoneEventChance;
  if (rollEvent) {
    startZoneEvent(eligible);
    return;
  }
  startZoneWildBattle();
}

function opponentMayTryFlee(player: Character | null, opponent: Character | null): boolean {
  if (!player || !opponent) {
    return false;
  }
  const playerStage = getStageIndex(player.stage);
  const opponentStage = getStageIndex(opponent.stage);
  if (playerStage < 0 || opponentStage < 0) {
    return false;
  }
  return playerStage - opponentStage >= FLEE_STAGE_GAP;
}

/** Player is 2+ stages below the opponent — may skip the fight. */
function playerMayTryFlee(player: Character | null, opponent: Character | null): boolean {
  if (!player || !opponent) {
    return false;
  }
  const playerStage = getStageIndex(player.stage);
  const opponentStage = getStageIndex(opponent.stage);
  if (playerStage < 0 || opponentStage < 0) {
    return false;
  }
  return opponentStage - playerStage >= FLEE_STAGE_GAP;
}

/** Zone wild fight: roll opponent, maybe flee prompt, else battle. */
function startZoneWildBattle() {
  pendingZoneOpponent = null;
  state.lastRolledZoneEventId = null;
  const opponent = pickRandomOpponent();
  if (opponentMayTryFlee(state.player, opponent) && Math.random() < FLEE_CHANCE) {
    showOpponentFleePrompt(opponent);
    return;
  }
  if (playerMayTryFlee(state.player, opponent)) {
    showPlayerFleePrompt(opponent);
    return;
  }
  pendingZoneOpponent = opponent;
  showPreBattlePrep(opponent, "wild");
}

function showOpponentFleePrompt(opponent: Character) {
  pendingZoneOpponent = opponent;
  if (state.currentZone && opponent?.id) {
    markSeenZoneEntry(state.currentZone, "encounters", String(opponent.id));
  }
  endBattle();
  battleScreen.classList.add("hidden");
  hideZonePostBattleActions();
  state.activeEvent = { id: "opponent_flee", resolved: false };
  const name = opponent?.name || "The Digimon";
  eventTitle.textContent = "Flee!";
  updateEventZoneLabel();
  eventPanel.style.backgroundImage = getZoneBackgroundUrl();
  eventSpeakerSprite.innerHTML = "";
  if (opponent?.spriteFramesPath) {
    eventSpeakerSprite.append(
      createBattleSprite(opponent.spriteFramesPath, opponent.name, false, "event")
    );
  }
  eventSpeakerName.textContent = name;
  eventText.textContent = `${name} panics at your power and tries to run!`;
  eventChoices.innerHTML = "";
  eventPostActions.classList.add("hidden");
  eventContinueButton.classList.add("hidden");
  eventContinueButton.disabled = true;

  const chaseButton = document.createElement("button");
  chaseButton.type = "button";
  chaseButton.className = "menu-button";
  chaseButton.textContent = "Chase and attack (−1 Alignment)";
  chaseButton.addEventListener("click", () => {
    if (!state.activeEvent || state.activeEvent.id !== "opponent_flee" || state.activeEvent.resolved) {
      return;
    }
    state.alignment = clampCareStat(state.alignment - 1);
    updateCareStats();
    state.activeEvent = null;
    closeEventScreen();
    pendingZoneOpponent = opponent;
    showPreBattlePrep(opponent, "wild");
  });

  const letFleeButton = document.createElement("button");
  letFleeButton.type = "button";
  letFleeButton.className = "menu-button secondary";
  letFleeButton.textContent = "Let it flee";
  letFleeButton.addEventListener("click", () => {
    if (!state.activeEvent || state.activeEvent.id !== "opponent_flee" || state.activeEvent.resolved) {
      return;
    }
    state.activeEvent.resolved = true;
    pendingZoneOpponent = null;
    state.opponent = null;
    continueZoneRun();
  });

  eventChoices.append(chaseButton, letFleeButton);
  eventScreen.classList.remove("hidden");
  startEventSpeakerAnim("angry");
}

/** Outmatched by 2+ stages: optional escape (skip encounter, −1 Discipline). */
function showPlayerFleePrompt(opponent: Character) {
  pendingZoneOpponent = opponent;
  if (state.currentZone && opponent?.id) {
    markSeenZoneEntry(state.currentZone, "encounters", String(opponent.id));
  }
  endBattle();
  battleScreen.classList.add("hidden");
  hideZonePostBattleActions();
  state.activeEvent = { id: "player_flee", resolved: false };
  const name = opponent?.name || "The Digimon";
  eventTitle.textContent = "Outmatched!";
  updateEventZoneLabel();
  eventPanel.style.backgroundImage = getZoneBackgroundUrl();
  eventSpeakerSprite.innerHTML = "";
  if (opponent?.spriteFramesPath) {
    eventSpeakerSprite.append(
      createBattleSprite(opponent.spriteFramesPath, opponent.name, false, "event")
    );
  }
  eventSpeakerName.textContent = name;
  eventText.textContent = `${name} looks far stronger. You could slip away…`;
  eventChoices.innerHTML = "";
  eventPostActions.classList.add("hidden");
  eventContinueButton.classList.add("hidden");
  eventContinueButton.disabled = true;

  const fightButton = document.createElement("button");
  fightButton.type = "button";
  fightButton.className = "menu-button";
  fightButton.textContent = "Stand and fight";
  fightButton.addEventListener("click", () => {
    if (!state.activeEvent || state.activeEvent.id !== "player_flee" || state.activeEvent.resolved) {
      return;
    }
    state.activeEvent = null;
    closeEventScreen();
    pendingZoneOpponent = opponent;
    showPreBattlePrep(opponent, "wild");
  });

  const escapeButton = document.createElement("button");
  escapeButton.type = "button";
  escapeButton.className = "menu-button secondary";
  escapeButton.textContent = "Escape (−1 Discipline)";
  escapeButton.addEventListener("click", () => {
    if (!state.activeEvent || state.activeEvent.id !== "player_flee" || state.activeEvent.resolved) {
      return;
    }
    state.discipline = clampCareStat(state.discipline - 1);
    updateCareStats();
    state.activeEvent.resolved = true;
    pendingZoneOpponent = null;
    state.opponent = null;
    continueZoneRun();
  });

  eventChoices.append(fightButton, escapeButton);
  eventScreen.classList.remove("hidden");
  startEventSpeakerAnim("angry");
}

function beginZoneBossDialogue(boss: ZoneBossConfig) {
  const ids = listZoneBossOpponentIds(boss);
  const opponentId = ids[Math.floor(Math.random() * ids.length)] || String(boss.opponentId || "");
  pendingBossEncounter = { boss, opponentId };
  // Consumed for this run as soon as the boss rolls in (even if the player leaves).
  state.zoneBossFoughtThisRun = true;
  if (state.currentZone && opponentId) {
    markSeenZoneEntry(state.currentZone, "bosses", opponentId);
  }
  const dialogue = getZoneBossDialogue(state.currentZone || "", opponentId);
  endBattle();
  battleScreen.classList.add("hidden");
  hideZonePostBattleActions();
  showZoneEventDialogue(dialogue, EVENT_ROOT_NODE_ID);
}

function startZoneBossFight(boss: ZoneBossConfig, forcedOpponentId?: string) {
  const ids = listZoneBossOpponentIds(boss);
  const forced = forcedOpponentId ? String(forcedOpponentId) : "";
  const opponentId =
    (forced ? forced : null) ||
    ids[Math.floor(Math.random() * ids.length)] ||
    String(boss.opponentId || "");
  state.zoneBossFight = {
    opponentId,
    stats: getBossCombatStats(state.currentZone),
    unlockZones: [...boss.unlockZones],
    drops: filterDropsForOpponent(boss.drops, opponentId),
  };
  state.zoneBossFoughtThisRun = true;
  pendingBossEncounter = null;
  if (state.currentZone) {
    markSeenZoneEntry(state.currentZone, "bosses", opponentId);
  }
  const opponent =
    state.characters.find((char) => String(char.id) === String(opponentId)) ||
    state.characters[0];
  if (opponent) {
    showPreBattlePrep(opponent, "boss");
    return;
  }
  startBattle();
  if (battleTitle) {
    battleTitle.textContent = "Boss Battle";
  }
  if (zoneLevelLabel) {
    renderZoneProgressLabel(zoneLevelLabel, "Boss");
    zoneLevelLabel.classList.remove("hidden");
  }
  logBattle(`${state.opponent?.name || "The boss"} blocks the path!`);
}

function getZoneName(zoneId: string | null = state.currentZone): string {
  const zone = ZONE_CONFIG.find((entry) => entry.id === zoneId);
  return zone?.name || "Zone";
}

function updateZoneLevelLabel() {
  if (!battleTitle || !zoneLevelLabel) {
    return;
  }
  if (state.currentZone && state.zoneLevel > 0) {
    battleTitle.textContent = "Battle";
    renderZoneProgressLabel(zoneLevelLabel);
    zoneLevelLabel.classList.remove("hidden");
  } else {
    battleTitle.textContent = "Battle";
    zoneLevelLabel.textContent = "";
    zoneLevelLabel.classList.add("hidden");
  }
}

function updateEventZoneLabel() {
  if (!eventZoneLabel || !eventTitle) {
    return;
  }
  if (state.currentZone && state.zoneLevel > 0) {
    renderZoneProgressLabel(eventZoneLabel);
    eventZoneLabel.classList.remove("hidden");
  } else {
    eventZoneLabel.textContent = "";
    eventZoneLabel.classList.add("hidden");
  }
}

function hideZonePostBattleActions() {
  zonePostBattleActions.classList.add("hidden");
  if (state.currentZone) {
    battleDefaultActions.classList.add("hidden");
  } else {
    battleDefaultActions.classList.remove("hidden");
  }
}

const ZONE_RETREAT_INTERVAL = 3;

function isBossEncounterBlockingRetreat(): boolean {
  if (state.zoneBossVictory) {
    return false;
  }
  if (state.zoneBossFight) {
    return true;
  }
  if (pendingBossEncounter) {
    return true;
  }
  if (zonePreBattle?.kind === "boss") {
    return true;
  }
  return String(state.activeEvent?.id || "").startsWith("boss_");
}

function canRetreatZoneRun(): boolean {
  if (!state.currentZone) {
    return true;
  }
  if (isBossEncounterBlockingRetreat()) {
    return false;
  }
  if (state.zoneBossVictory) {
    return true;
  }
  if (typeof state.zoneRunHp === "number" && state.zoneRunHp <= 0) {
    return true;
  }
  if (pendingEventEndRun) {
    return true;
  }
  const level = Math.max(0, Math.floor(Number(state.zoneLevel) || 0));
  return level > ZONE_RETREAT_INTERVAL && level % ZONE_RETREAT_INTERVAL === 1;
}

function refreshZoneRetreatAccess() {
  const allow = canRetreatZoneRun();
  eventRetreatButton?.classList.toggle("hidden", !allow);
  zoneRetreatButton?.classList.toggle("hidden", !allow);
}

function refreshAdventureItemAccess() {
  zoneEventItems?.classList.add("hidden");
  zoneBattleItems?.classList.add("hidden");
  const fightPending = Boolean(zonePreBattle?.active || state.eventBattleOverride);
  eventFeedButton?.classList.toggle("hidden", !fightPending);
  zoneFeedButton?.classList.add("hidden");
  refreshZoneRetreatAccess();
}

function noteAdventureItemUsed() {
  if (zonePreBattle?.active) {
    zonePreBattle.itemUsed = true;
  }
  refreshAdventureItemAccess();
  if (
    zonePreBattle?.itemUsed &&
    feedReturnContext !== "home" &&
    feedMenu &&
    !feedMenu.classList.contains("hidden")
  ) {
    closeFeedMenu();
  }
}

function showPreBattlePrep(opponent: Character, kind: "wild" | "boss") {
  pendingZoneOpponent = opponent;
  zonePreBattle = { active: true, itemUsed: false, kind };
  if (state.currentZone && opponent?.id) {
    markSeenZoneEntry(
      state.currentZone,
      kind === "boss" ? "bosses" : "encounters",
      String(opponent.id)
    );
  }
  endBattle();
  battleScreen.classList.add("hidden");
  hideZonePostBattleActions();
  state.activeEvent = { id: "pre_battle", resolved: false };
  const name = opponent?.name || (kind === "boss" ? "The boss" : "The Digimon");
  eventTitle.textContent = kind === "boss" ? "Boss Battle" : "Battle";
  updateEventZoneLabel();
  eventPanel.style.backgroundImage = getZoneBackgroundUrl();
  eventSpeakerSprite.innerHTML = "";
  if (opponent?.spriteFramesPath) {
    eventSpeakerSprite.append(
      createBattleSprite(opponent.spriteFramesPath, opponent.name, false, "event")
    );
  }
  eventSpeakerName.textContent = name;
  eventText.textContent =
    kind === "boss" ? `${name} blocks the path.` : `${name} stands in your way.`;
  eventChoices.innerHTML = "";
  eventPostActions.classList.remove("hidden");
  eventContinueButton.textContent = "Fight";
  eventContinueButton.classList.remove("hidden");
  eventContinueButton.disabled = false;
  refreshAdventureItemAccess();
  eventScreen.classList.remove("hidden");
  startEventSpeakerAnim("angry");
}

function beginFightFromPrep() {
  const kind = zonePreBattle?.kind;
  zonePreBattle = null;
  if (state.activeEvent?.id === "pre_battle") {
    state.activeEvent = null;
  }
  eventContinueButton.textContent = "Continue";
  stopEventSpeakerAnim();
  eventChoices.innerHTML = "";
  eventPostActions.classList.add("hidden");
  eventScreen.classList.add("hidden");
  startBattle();
  if (kind === "boss") {
    if (battleTitle) {
      battleTitle.textContent = "Boss Battle";
    }
    if (zoneLevelLabel) {
      renderZoneProgressLabel(zoneLevelLabel, "Boss");
      zoneLevelLabel.classList.remove("hidden");
    }
    logBattle(`${state.opponent?.name || "The boss"} blocks the path!`);
  }
}

function showZonePostBattleActions(playerWon: boolean) {
  battleDefaultActions.classList.add("hidden");
  zonePostBattleActions.classList.remove("hidden");
  const canContinue = Boolean(playerWon) && !state.zoneBossVictory;
  zoneContinueButton.classList.toggle("hidden", !canContinue);
  zoneContinueButton.disabled = !canContinue;
  refreshAdventureItemAccess();
}

function getAdventureHp(): { current: number; max: number } {
  const maxHp = getPlayerCombatStats().hp;
  if (typeof state.zoneRunHp === "number") {
    return { current: Math.max(0, state.zoneRunHp), max: maxHp };
  }
  return { current: maxHp, max: maxHp };
}

function syncAdventureHpDisplay() {
  const { current } = getAdventureHp();
  if (battlePlayerHp) {
    battlePlayerHp.textContent = `HP: ${current}`;
  }
}

function applyItemCareGains(
  gains: { discipline?: number; happiness?: number; alignment?: number } | null | undefined
): string {
  const summary = formatCareGainText(gains);
  if (!summary) {
    return "";
  }
  if (gains?.discipline) {
    state.discipline = clampCareStat(state.discipline + gains.discipline);
  }
  if (gains?.happiness) {
    state.happiness = clampCareStat(state.happiness + gains.happiness);
  }
  if (gains?.alignment) {
    state.alignment = clampCareStat(state.alignment + gains.alignment);
  }
  updateCareStats();
  return summary;
}

function useInventoryItem(
  itemKey: string,
  context: "home" | "adventure" | "event" = "adventure"
): boolean {
  const item = INVENTORY_CONFIG.find((entry) => entry.key === itemKey);
  if (!item) {
    return false;
  }
  if ((state.inventory[itemKey] || 0) <= 0) {
    return false;
  }
  if (state.currentZone && context !== "home") {
    if (!zonePreBattle?.active) {
      const msg = "You can use one item when you see your next opponent.";
      if (context === "adventure" && battleLog) {
        logBattle(msg);
      }
      if (context === "event") {
        eventText.textContent = msg;
      }
      return false;
    }
    if (zonePreBattle.itemUsed) {
      const msg = "You already used an item for this fight.";
      if (context === "adventure" && battleLog) {
        logBattle(msg);
      }
      if (context === "event") {
        eventText.textContent = msg;
      }
      return false;
    }
  }
    if (item.useEffect === "healFull") {
    const { current, max } = getAdventureHp();
    if (current >= max) {
      if (context === "adventure" && battleLog) {
        logBattle("HP is already full.");
      }
      if (context === "event") {
        eventText.textContent = "HP is already full.";
      }
      return false;
    }
    if (typeof state.zoneRunHp !== "number") {
      state.zoneRunHp = max;
    }
    state.inventory[itemKey] -= 1;
    state.zoneRunHp = max;
    updateInventory();
    syncAdventureHpDisplay();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. HP restored to ${max}.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. HP restored to ${max}.`;
    }
    return true;
  }
  if (item.useEffect === "heal") {
    const amount = Math.max(1, Number(item.healAmount) || 5);
    const { current, max } = getAdventureHp();
    if (current >= max) {
      if (context === "adventure" && battleLog) {
        logBattle("HP is already full.");
      }
      if (context === "event") {
        eventText.textContent = "HP is already full.";
      }
      return false;
    }
    if (typeof state.zoneRunHp !== "number") {
      state.zoneRunHp = max;
    }
    state.inventory[itemKey] -= 1;
    state.zoneRunHp = Math.min(max, current + amount);
    updateInventory();
    syncAdventureHpDisplay();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. Recovered ${amount} HP.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. Recovered ${amount} HP.`;
    }
    return true;
  }
  if (item.useEffect === "happiness") {
    state.inventory[itemKey] -= 1;
    state.happiness = clampCareStat(state.happiness + 1);
    updateCareStats();
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. Happiness +1.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. Happiness +1.`;
    }
    return true;
  }
  if (item.useEffect === "care") {
    const summary = applyItemCareGains(item.careGains);
    if (!summary) {
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. ${summary}.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. ${summary}.`;
    }
    return true;
  }
  if (item.useEffect === "nightmareBurrito") {
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    const playerId = String(state.player?.id || "");
    if (playerId === "monzaemon" && state.player?.stage === "Perfect") {
      if (context === "adventure" && battleLog) {
        logBattle(`Used ${item.name}. Something stirs within Monzaemon…`);
      }
      if (context === "event") {
        eventText.textContent = `Used ${item.name}. Something stirs within Monzaemon…`;
      }
      if (context === "home") {
        feedMenu.classList.add("hidden");
      }
      pendingFeedUltimateId = "shinmonzaemon";
      checkEvolution();
      return true;
    }
    state.alignment = clampCareStat(state.alignment - 2);
    updateCareStats();
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. Alignment -2.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. Alignment -2.`;
    }
    return true;
  }
  if (item.useEffect === "gainLife") {
    if (state.lives >= MAX_LIVES) {
      if (context === "adventure" && battleLog) {
        logBattle("Lives are already full.");
      }
      if (context === "event") {
        eventText.textContent = "Lives are already full.";
      }
      if (context === "home" && feedFoodSprite) {
        // Keep message subtle via count; no consume.
      }
      return false;
    }
    state.inventory[itemKey] -= 1;
    state.lives = Math.min(MAX_LIVES, state.lives + 1);
    updateInventory();
    updateLivesDisplay();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. Lives +1 (${state.lives}/${MAX_LIVES}).`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. Lives +1 (${state.lives}/${MAX_LIVES}).`;
    }
    return true;
  }
  if (item.useEffect === "gearUp") {
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "home") {
      state.gearUpPending = true;
      state.gearUpActive = false;
      updateAttributes();
      return true;
    }
    state.gearUpActive = true;
    state.gearUpPending = false;
    if (state.battle?.statMods) {
      applyGearUpBuffs();
    }
    updateAttributes();
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. All buffs active for this run!`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. All buffs active for this run!`;
    }
    return true;
  }
  if (item.useEffect === "weight") {
    const amount = Math.max(1, Number(item.weightAmount) || 1);
    state.inventory[itemKey] -= 1;
    state.weight = Math.max(1, state.weight + amount);
    updateWeight();
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. Weight +${amount}.`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. Weight +${amount}.`;
    }
    return true;
  }
  if (item.useEffect === "zoneBuff") {
    const stat = item.zoneBuffStat;
    if (!stat) {
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    if (state.currentZone) {
      state.zoneRunBuffs[stat] = true;
      if (state.battle?.statMods) {
        getBattleStatMods("player").buff[stat] = true;
        updateStatusIcons();
      }
    } else {
      state.zoneRunBuffsPending[stat] = true;
    }
    updateAttributes();
    const msg = `Used ${item.name}. ${stat} buffed for this zone run.`;
    if (context === "adventure" && battleLog) {
      logBattle(msg);
    }
    if (context === "event") {
      eventText.textContent = msg;
    }
    return true;
  }
  if (item.useEffect === "attributes") {
    const gains = item.attributeGains || {};
    const parts: string[] = [];
    if (!state.attributes) {
      state.attributes = {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        intelligence: 0,
      };
    }
    (["hp", "attack", "defense", "speed", "intelligence"] as const).forEach((stat) => {
      const delta = Number(gains[stat]) || 0;
      if (!delta) {
        return;
      }
      const next = (Number(state.attributes[stat]) || 0) + delta;
      state.attributes[stat] = stat === "hp" ? Math.max(1, next) : next;
      const label =
        stat === "hp"
          ? "HP"
          : stat === "attack"
            ? "Attack"
            : stat === "defense"
              ? "Defense"
              : stat === "speed"
                ? "Speed"
                : "Intelligence";
      parts.push(`${label} ${delta >= 0 ? "+" : ""}${delta}`);
    });
    if (parts.length === 0) {
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateAttributes();
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    const msg = `Used ${item.name}. Permanent changes: ${parts.join(", ")}.`;
    if (context === "adventure" && battleLog) {
      logBattle(msg);
    }
    if (context === "event") {
      eventText.textContent = msg;
    }
    return true;
  }
  if (item.useEffect === "cleanse") {
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    cleansePlayerDebuffs();
    const msg = `Used ${item.name}. Debuffs and stat debuffs cleared.`;
    if (context === "adventure" && battleLog) {
      logBattle(msg);
    }
    if (context === "event") {
      eventText.textContent = msg;
    }
    return true;
  }
  if (item.useEffect === "opponentDebuff") {
    const effects = [...(item.opponentDebuffs || [])];
    if (effects.length === 0) {
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    const appliedNow = applyOrQueueOpponentCombatEffects(effects);
    const list = formatOpponentCombatEffectList(effects);
    const msg = appliedNow
      ? `Used ${item.name}. The enemy is ${list}.`
      : `Used ${item.name}. The next enemy will be ${list}.`;
    if (context === "adventure" && battleLog) {
      logBattle(msg);
    }
    if (context === "event") {
      eventText.textContent = msg;
    }
    return true;
  }
  if (item.useEffect === "playerBuff") {
    const effects = [...(item.playerBuffs || [])];
    if (effects.length === 0) {
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    const appliedNow = applyOrQueuePlayerCombatEffects(effects);
    const list = formatPlayerCombatEffectList(effects);
    const msg = appliedNow
      ? `Used ${item.name}. You gain ${list}.`
      : `Used ${item.name}. You will have ${list} in the next fight.`;
    if (context === "adventure" && battleLog) {
      logBattle(msg);
    }
    if (context === "event") {
      eventText.textContent = msg;
    }
    return true;
  }
  if (item.useEffect === "xAntibody") {
    const target = findXAntibodyForm(state.player);
    if (!target) {
      const msg = alreadyXAntibodyForm(state.player)
        ? "Already an X Antibody Digimon."
        : "This Digimon has no X Antibody form.";
      if (context === "adventure" && battleLog) {
        logBattle(msg);
      }
      if (context === "event") {
        eventText.textContent = msg;
      }
      return false;
    }
    state.inventory[itemKey] -= 1;
    updateInventory();
    noteAdventureItemUsed();
    if ((context === "home" || feedReturnContext !== "home") && feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
      startFeedingPreview(true);
    }
    const previous = state.player;
    const inherited =
      Array.isArray(target.evolvesTo) && target.evolvesTo.length
        ? target.evolvesTo
        : previous?.evolvesTo;
    state.player = inherited ? { ...target, evolvesTo: inherited } : { ...target };
    markHistoryCharacterPlayed(state.player);
    updateAttributes();
    updateCaretakerInfo();
    if (context === "home") {
      feedMenu.classList.add("hidden");
    }
    if (context === "adventure" && battleLog) {
      logBattle(`Used ${item.name}. The X Antibody takes hold…`);
    }
    if (context === "event") {
      eventText.textContent = `Used ${item.name}. The X Antibody takes hold…`;
    }
    showEvolutionScreen(previous, state.player);
    return true;
  }
  if (item.activeKey) {
    state.inventory[itemKey] -= 1;
    updateInventory();
    if (feedFoodSprite) {
      feedFoodSprite.src = item.asset;
      feedFoodSprite.alt = item.alt;
    }
    state.activeConsumable = item.activeKey;
    updateEquipmentStatus();
    startFeedingPreview(true);
    return true;
  }
  return false;
}

function buildInventoryFeedCards() {
  if (!feedItemList) {
    return;
  }
  feedItemList.querySelectorAll("[data-inventory-key]").forEach((node) => node.remove());
  INVENTORY_CONFIG.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-card hidden item-card";
    button.dataset.inventoryKey = item.key;
    button.dataset.tooltip = item.label || item.name;
    const info = document.createElement("div");
    info.className = "item-info";
    const title = document.createElement("h3");
    title.className = "character-name";
    title.textContent = item.name;
    const count = document.createElement("p");
    count.className = "character-meta";
    count.textContent = "x0";
    info.append(title, count);
    const icon = document.createElement("img");
    icon.src = item.asset;
    icon.alt = item.alt;
    icon.className = "food-sprite item-icon";
    button.append(info, icon);
    feedItemList.append(button);
    inventoryUi[item.key] = { button, count };
  });
}

function closeEventScreen() {
  stopEventSpeakerAnim();
  eventChoices.innerHTML = "";
  eventPostActions.classList.add("hidden");
  eventContinueButton.classList.remove("hidden");
  eventContinueButton.disabled = false;
  eventSpeakerSprite.innerHTML = "";
  eventText.textContent = "";
  eventSpeakerName.textContent = "";
  eventTitle.textContent = "Event";
  eventPanel.style.backgroundImage = "";
  eventScreen.classList.add("hidden");
  state.activeEvent = null;
  zonePreBattle = null;
}

let eventSpeakerTickerId: number | null = null;

function stopEventSpeakerAnim() {
  if (eventSpeakerTickerId) {
    window.clearInterval(eventSpeakerTickerId);
    eventSpeakerTickerId = null;
  }
}

function getEventSpeakerImg(): HTMLImageElement | null {
  return eventSpeakerSprite?.querySelector?.(".character-sprite") || null;
}

function startEventSpeakerAnim(mood: "idle" | "happy" | "angry" = "idle") {
  stopEventSpeakerAnim();
  const sprite = getEventSpeakerImg();
  const basePath = sprite?.dataset?.basePath;
  if (!sprite || !basePath) {
    return;
  }
  let toggle = false;
  const tick = () => {
    if (mood === "happy") {
      toggle = !toggle;
      sprite.src = `${basePath}/frame_${toggle ? "03" : "07"}.png`;
    } else if (mood === "angry") {
      toggle = !toggle;
      sprite.src = `${basePath}/frame_${toggle ? "07" : "08"}.png`;
    } else {
      const roll = Math.random();
      let next: number;
      if (roll < 0.1) {
        next = 8;
      } else if (roll < 0.2) {
        next = 7;
      } else if (roll < 0.32) {
        next = 2;
      } else {
        toggle = !toggle;
        next = toggle ? 1 : 0;
      }
      sprite.src = `${basePath}/frame_0${next}.png`;
    }
  };
  tick();
  const intervalMs = mood === "angry" ? 850 : 1000;
  eventSpeakerTickerId = window.setInterval(tick, intervalMs);
}

function inferEventChoiceMood(
  outcomes: ZoneEventOutcome[]
): "idle" | "happy" | "angry" {
  let happy = false;
  let angry = false;
  (outcomes || []).forEach((outcome) => {
    if (!outcome || !outcome.type) {
      return;
    }
    if (outcome.type === "fight" || outcome.type === "damage") {
      angry = true;
      return;
    }
    if (outcome.type === "heal" || outcome.type === "healToPercent") {
      happy = true;
      return;
    }
    if (outcome.type === "meat") {
      const amount = Number(outcome.amount) || 0;
      if (amount < 0) {
        happy = true;
      } else if (amount > 0) {
        angry = true;
      }
      return;
    }
    if (outcome.type === "care") {
      const discipline = Number(outcome.discipline) || 0;
      const happiness = Number(outcome.happiness) || 0;
      const alignment = Number(outcome.alignment) || 0;
      if (discipline < 0 || happiness < 0 || alignment < 0) {
        angry = true;
      }
      if (happiness > 0 || alignment > 0) {
        happy = true;
      }
    }
  });
  if (angry) {
    return "angry";
  }
  if (happy) {
    return "happy";
  }
  return "idle";
}

function buildEventStatSnapshot(): EventStatSnapshot {
  const attrs = state.attributes || {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
  };
  const maxHp = Math.max(1, getPlayerCombatStats().hp);
  const currentHp =
    typeof state.zoneRunHp === "number" ? Math.max(0, state.zoneRunHp) : maxHp;
  const hpPercent = Math.max(0, Math.min(100, Math.floor((currentHp / maxHp) * 100)));
  return {
    discipline: Number(state.discipline) || 0,
    happiness: Number(state.happiness) || 0,
    alignment: Number(state.alignment) || 0,
    reputation: Number(state.reputation) || 0,
    meat: Number(state.meat) || 0,
    weight: Number(state.weight) || 0,
    training: Number(state.training) || 0,
    lives: Number(state.lives) || 0,
    zoneLevel: Number(state.zoneLevel) || 0,
    battlesForEvolution: Number(state.battlesForEvolution) || 0,
    wins: Number(state.stats?.wins) || 0,
    battles: Number(state.stats?.battles) || 0,
    hp: Number(attrs.hp) || 0,
    hpPercent,
    attack: Number(attrs.attack) || 0,
    defense: Number(attrs.defense) || 0,
    speed: Number(attrs.speed) || 0,
    intelligence: Number(attrs.intelligence) || 0,
    stage: state.player?.stage ? String(state.player.stage) : null,
    stageIndex: getStageIndex(state.player?.stage),
    element: state.player?.element ? String(state.player.element) : null,
    attribute: state.player?.attribute ? String(state.player.attribute) : null,
    playerId: state.player?.id != null ? String(state.player.id) : null,
    inventory: { ...state.inventory },
    equipment: { ...state.equipment },
    keyItems: { ...state.keyItems },
    timeOfDay: getZoneTimeOfDay(),
    consumedEvents: Object.fromEntries(
      (state.consumedEventIds || []).map((id) => [String(id), 1])
    ),
    bannedEvents: Object.fromEntries(readBannedEventIds().map((id) => [String(id), 1])),
    eventWins: { ...readAllEventWinCounts() },
    defeatedBossOpponents: Object.fromEntries(
      readDefeatedBossOpponentIds().map((id) => [String(id), 1])
    ),
    unlockedZones: Object.fromEntries(
      readUnlockedZoneIds().map((id) => [String(id), 1])
    ),
    hasStolenItem: state.activeEvent?.stolenItemKey ? 1 : 0,
    stolenItem: state.activeEvent?.stolenItemLabel || "",
    demonLordIngredients: countDemonLordIngredients(state.keyItems),
    demonLordIngredientNames: listOwnedDemonLordIngredientNames(state.keyItems),
  };
}

function choicePassesRequirements(
  choice: ZoneEventChoice,
  snapshot: EventStatSnapshot = buildEventStatSnapshot()
): boolean {
  const needMeat = Number(choice.requireMeat) || 0;
  if (needMeat > 0 && snapshot.meat < needMeat) {
    return false;
  }
  const needKey = String(choice.requireKeyItem || "").trim();
  if (needKey && (Number(snapshot.keyItems[needKey]) || 0) < 1) {
    return false;
  }
  if (choice.requireAnyInventoryItem) {
    const hasItem = Object.values(snapshot.inventory || {}).some((qty) => Number(qty) > 0);
    if (!hasItem) {
      return false;
    }
  }
  if (choice.requireAnyFood) {
    if (!hasWeightFood(snapshot.inventory, snapshot.meat)) {
      return false;
    }
  }
  if (choice.requireAnyHealItem && !ownedHealItemKey(snapshot.inventory)) {
    return false;
  }
  if (choice.requireAnyStatBuffItem && !ownedStatBuffItemKey(snapshot.inventory)) {
    return false;
  }
  return eventPassesRequirements(choice, snapshot);
}

function consumeZoneEvent(eventId: string | null | undefined) {
  const id = String(eventId || "");
  if (!id || id === "opponent_flee" || id === "player_flee" || id === "pre_battle" || id.startsWith("boss_")) {
    return;
  }
  if (!state.consumedEventIds.includes(id)) {
    state.consumedEventIds.push(id);
  }
}

function resolveEventEndingRepeatable(
  eventDef: ZoneEventDefinition | null,
  choice?: ZoneEventChoice | null,
  outcomeOverride?: boolean
): boolean {
  if (typeof outcomeOverride === "boolean") {
    return outcomeOverride;
  }
  if (typeof state.activeEvent?.endingRepeatable === "boolean") {
    return state.activeEvent.endingRepeatable;
  }
  if (typeof choice?.repeatable === "boolean") {
    return choice.repeatable;
  }
  if (typeof eventDef?.repeatable === "boolean") {
    return eventDef.repeatable;
  }
  return true;
}

/** Mark the active event finished and optionally block it for the rest of the run. */
function finishActiveEvent(options?: {
  choice?: ZoneEventChoice | null;
  repeatable?: boolean;
}) {
  if (
    !state.activeEvent ||
    state.activeEvent.id === "opponent_flee" ||
    state.activeEvent.id === "player_flee" ||
    state.activeEvent.id === "pre_battle"
  ) {
    if (state.activeEvent) {
      state.activeEvent.resolved = true;
    }
    return;
  }
  const eventDef = findActiveZoneEventDefinition();
  const canRepeat = resolveEventEndingRepeatable(
    eventDef,
    options?.choice,
    options?.repeatable
  );
  state.activeEvent.endingRepeatable = canRepeat;
  state.activeEvent.resolved = true;
  if (!canRepeat) {
    consumeZoneEvent(state.activeEvent.id);
  }
}

function findActiveZoneEventDefinition(): ZoneEventDefinition | null {
  if (!state.activeEvent?.id || !state.currentZone) {
    return null;
  }
  const events = ZONE_EVENTS[state.currentZone] || [];
  const fromZone = events.find((event) => event.id === state.activeEvent?.id) || null;
  if (fromZone) {
    return fromZone;
  }
  if (pendingBossEncounter && String(state.activeEvent.id).startsWith("boss_")) {
    return getZoneBossDialogue(state.currentZone, pendingBossEncounter.opponentId);
  }
  return null;
}

function setEventSpeaker(speakerId: string | null | undefined) {
  const speaker =
    state.characters.find((char) => String(char.id) === String(speakerId || "")) || null;
  eventSpeakerSprite.innerHTML = "";
  if (speaker?.spriteFramesPath) {
    eventSpeakerSprite.append(
      createBattleSprite(speaker.spriteFramesPath, speaker.name, false, "event")
    );
  }
  eventSpeakerName.textContent = speaker?.name || "Someone";
}

function renderEventChoices(choices: ZoneEventChoice[]) {
  eventChoices.innerHTML = "";
  const snapshot = buildEventStatSnapshot();
  (choices || []).forEach((choice, index) => {
    const passes = choicePassesRequirements(choice, snapshot);
    const whenFail = choice.whenFail || "hide";
    if (!passes && whenFail === "hide") {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-button";
    button.textContent =
      resolveConditionalText(choice.label || `Choice ${index + 1}`, choice.labelVariants, snapshot) ||
      `Choice ${index + 1}`;
    if (!passes) {
      button.disabled = true;
      const needMeat = Number(choice.requireMeat) || 0;
      button.title =
        choice.disabledHint ||
        (needMeat > 0 && snapshot.meat < needMeat
          ? `Need ${needMeat} meat`
          : choice.requireAnyFood
            ? "Need Meat or a Weight item"
            : "Requirements not met");
    } else {
      const needMeat = Number(choice.requireMeat) || 0;
      if (needMeat > 0 && state.meat < needMeat) {
        button.disabled = true;
        button.title = `Need ${needMeat} meat`;
      }
    }
    button.addEventListener("click", () => {
      resolveZoneEventChoice(choice);
    });
    eventChoices.append(button);
  });
}

/** Show one dialogue step of the active event (root or node). */
function applyEventSideOutcomes(outcomes: ZoneEventOutcome[] | undefined) {
  (outcomes || []).forEach((outcome) => {
    if (!outcome || !outcome.type) {
      return;
    }
    if (outcome.type === "stealRandomInventoryItem") {
      stealRandomInventoryItemForEvent();
      return;
    }
    if (outcome.type === "returnStolenItem") {
      returnStolenItemForEvent();
      return;
    }
    if (outcome.type === "damage") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const amount = Math.max(0, Number(outcome.amount) || 0);
      state.zoneRunHp = Math.max(0, current - amount);
      syncAdventureHpDisplay();
      return;
    }
    if (outcome.type === "damagePercent") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const percent = Math.max(0, Number(outcome.percent) || 0);
      const minHp = Math.max(0, Number(outcome.minHp) || 0);
      const amount =
        percent <= 0 ? 0 : Math.max(1, Math.ceil((maxHp * percent) / 100));
      state.zoneRunHp = Math.max(minHp, current - amount);
      syncAdventureHpDisplay();
    }
  });
}

function stealRandomInventoryItemForEvent(): boolean {
  if (!state.activeEvent) {
    return false;
  }
  const owned = INVENTORY_CONFIG.map((entry) => entry.key).filter(
    (key) => (Number(state.inventory[key]) || 0) > 0
  );
  if (owned.length === 0) {
    state.activeEvent.stolenItemKey = undefined;
    state.activeEvent.stolenItemLabel = undefined;
    return false;
  }
  const key = owned[Math.floor(Math.random() * owned.length)];
  const entry = INVENTORY_CONFIG.find((item) => item.key === key);
  grantInventoryItem(key, -1);
  state.activeEvent.stolenItemKey = key;
  state.activeEvent.stolenItemLabel = entry?.name || key;
  updateInventory();
  return true;
}

function returnStolenItemForEvent(): boolean {
  if (!state.activeEvent?.stolenItemKey) {
    return false;
  }
  const key = state.activeEvent.stolenItemKey;
  const label = state.activeEvent.stolenItemLabel || key;
  grantInventoryItem(key, 1, label);
  state.activeEvent.stolenItemKey = undefined;
  state.activeEvent.stolenItemLabel = undefined;
  return true;
}

function showZoneEventDialogue(eventDef: ZoneEventDefinition, nodeId = EVENT_ROOT_NODE_ID) {
  let targetNodeId = nodeId || EVENT_ROOT_NODE_ID;
  const isNewEvent = !state.activeEvent || state.activeEvent.id !== eventDef.id;
  if (isNewEvent) {
    state.activeEvent = {
      id: eventDef.id,
      resolved: false,
      nodeId: targetNodeId,
      appliedEnterNodes: [],
    };
    applyEventSideOutcomes(eventDef.startOutcomes);
  } else if (state.activeEvent) {
    state.activeEvent.resolved = false;
    state.activeEvent.nodeId = targetNodeId;
    state.activeEvent.resumeNodeId = undefined;
  }

  let snapshot = buildEventStatSnapshot();
  const targetNode = getZoneEventNode(eventDef, targetNodeId);
  if (
    targetNodeId !== EVENT_ROOT_NODE_ID &&
    !eventPassesRequirements(targetNode, snapshot)
  ) {
    // Locked node: end the event instead of soft-locking.
    finishActiveEvent({ repeatable: eventDef.repeatable });
    eventTitle.textContent = eventDef.title || "Event";
    updateEventZoneLabel();
    eventPanel.style.backgroundImage = getZoneBackgroundUrl();
    setEventSpeaker(eventDef.speakerId);
    eventText.textContent = "The moment passes. Nothing more happens here.";
    eventChoices.innerHTML = "";
    eventPostActions.classList.remove("hidden");
    eventContinueButton.textContent = "Continue";
    eventContinueButton.classList.remove("hidden");
    eventContinueButton.disabled = false;
    refreshAdventureItemAccess();
    eventScreen.classList.remove("hidden");
    battleScreen.classList.add("hidden");
    startEventSpeakerAnim("idle");
    return;
  }

  const applied = state.activeEvent?.appliedEnterNodes || [];
  const willEnter = Boolean(
    state.activeEvent && !applied.includes(targetNodeId) && (targetNode.enterOutcomes || []).length
  );
  snapshot = buildEventStatSnapshot();

  eventTitle.textContent = eventDef.title || "Event";
  updateEventZoneLabel();
  eventPanel.style.backgroundImage = getZoneBackgroundUrl();
  setEventSpeaker(targetNode.speakerId || eventDef.speakerId);
  eventText.textContent = resolveConditionalText(
    targetNode.text || "",
    targetNode.textVariants,
    snapshot
  );
  if (willEnter && state.activeEvent) {
    applyEventSideOutcomes(targetNode.enterOutcomes);
    state.activeEvent.appliedEnterNodes = [...applied, targetNodeId];
  }
  eventPostActions.classList.add("hidden");
  eventContinueButton.textContent = "Continue";
  eventContinueButton.classList.add("hidden");
  eventContinueButton.disabled = true;
  renderEventChoices(targetNode.choices || []);
  eventScreen.classList.remove("hidden");
  battleScreen.classList.add("hidden");
  refreshZoneRetreatAccess();
  startEventSpeakerAnim("idle");
}

function startZoneEvent(events: ZoneEventDefinition[]) {
  const pool = Array.isArray(events) && events.length > 0 ? events : [];
  if (pool.length === 0) {
    startZoneWildBattle();
    return;
  }
  // Reset so events never chain back-to-back as random rolls.
  state.zoneEventChance = 0;
  const snapshot = buildEventStatSnapshot();
  const eventDef = pickWeightedZoneEvent(pool, snapshot, {
    excludeIds: getZoneEncounterExcludeIds(),
  });
  if (!eventDef) {
    startZoneWildBattle();
    return;
  }
  startForcedZoneEvent(eventDef);
}

function startForcedZoneEvent(eventDef: ZoneEventDefinition) {
  state.zoneEventChance = 0;
  state.lastRolledZoneEventId = eventDef.id;
  if (state.currentZone) {
    markSeenZoneEntry(state.currentZone, "events", eventDef.id);
  }
  endBattle();
  battleScreen.classList.add("hidden");
  hideZonePostBattleActions();
  showZoneEventDialogue(eventDef, EVENT_ROOT_NODE_ID);
}

function isHealInventoryItem(item: (typeof INVENTORY_CONFIG)[number]) {
  return item.useEffect === "heal" || item.useEffect === "healFull";
}

function ownedHealItemKey(inventory: Record<string, number> = state.inventory): string | null {
  const entry = INVENTORY_CONFIG.find(
    (item) => isHealInventoryItem(item) && (Number(inventory[item.key]) || 0) > 0
  );
  return entry?.key || null;
}

function isWeightInventoryItem(item: (typeof INVENTORY_CONFIG)[number]) {
  return item.useEffect === "weight";
}

function ownedWeightItemKey(inventory: Record<string, number> = state.inventory): string | null {
  const entry = INVENTORY_CONFIG.find(
    (item) => isWeightInventoryItem(item) && (Number(inventory[item.key]) || 0) > 0
  );
  return entry?.key || null;
}

function hasWeightFood(
  inventory: Record<string, number> = state.inventory,
  meat: number = state.meat
): boolean {
  return (Number(meat) || 0) > 0 || Boolean(ownedWeightItemKey(inventory));
}

function isStatBuffInventoryItem(item: (typeof INVENTORY_CONFIG)[number]) {
  return getInventoryItemCategories(item).includes("statBuff");
}

function ownedStatBuffItemKey(inventory: Record<string, number> = state.inventory): string | null {
  const entry = INVENTORY_CONFIG.find(
    (item) => isStatBuffInventoryItem(item) && (Number(inventory[item.key]) || 0) > 0
  );
  return entry?.key || null;
}

function applyOrQueueOpponentCombatEffects(effects: readonly string[]): boolean {
  const live = Boolean(state.battle && state.battle.ended !== true);
  if (live) {
    effects.forEach((effect) => applyBattleEffect("opponent", effect, 1, true));
    return true;
  }
  if (!Array.isArray(state.pendingOpponentCombatEffects)) {
    state.pendingOpponentCombatEffects = [];
  }
  state.pendingOpponentCombatEffects.push(...effects);
  return false;
}

function formatOpponentCombatEffectList(effects: readonly string[]): string {
  const labels: Record<string, string> = {
    exposed: "exposed",
    slow: "slowed",
    weak: "weakened",
    distracted: "distracted",
    asleep: "asleep",
    poisoned: "poisoned",
    burned: "burned",
    confused: "confused",
    demoralized: "demoralized",
    silenced: "silenced",
    blinded: "blinded",
    inverted: "inverted",
    negativepole: "affected by Negative Pole",
    cursed: "cursed",
    marked: "marked",
    drained: "drained",
    bound: "bound",
    deepwound: "deep-wounded",
    infatuated: "infatuated",
  };
  const names = effects.map((effect) => labels[effect] || effect);
  if (names.length <= 1) {
    return names[0] || "affected";
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function applyPendingOpponentCombatEffects() {
  const pending = state.pendingOpponentCombatEffects || [];
  state.pendingOpponentCombatEffects = [];
  if (!pending.length || !state.battle) {
    return;
  }
  pending.forEach((effect) => applyBattleEffect("opponent", effect, 1, true));
}

function applyOrQueuePlayerCombatEffects(effects: readonly string[]): boolean {
  const live = Boolean(state.battle && state.battle.ended !== true);
  if (live) {
    effects.forEach((effect) => applyBattleEffect("player", effect, 1, true));
    return true;
  }
  if (!Array.isArray(state.pendingPlayerCombatEffects)) {
    state.pendingPlayerCombatEffects = [];
  }
  state.pendingPlayerCombatEffects.push(...effects);
  return false;
}

function formatPlayerCombatEffectList(effects: readonly string[]): string {
  const labels: Record<string, string> = {
    vampirism: "Vampirism",
    thorns: "Thorns",
    reflector: "Reflector",
    immune: "Immunity",
    reckless: "Reckless",
    positivepole: "Positive Pole",
  };
  const names = effects.map((effect) => labels[effect] || effect);
  if (names.length <= 1) {
    return names[0] || "a buff";
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function applyPendingPlayerCombatEffects() {
  const pending = state.pendingPlayerCombatEffects || [];
  state.pendingPlayerCombatEffects = [];
  if (!pending.length || !state.battle) {
    return;
  }
  pending.forEach((effect) => applyBattleEffect("player", effect, 1, true));
}

function applyEquippedStartStatuses() {
  if (!state.battle) {
    return;
  }
  const gear = getEquippedGear() as { startStatuses?: readonly string[] } | undefined;
  (gear?.startStatuses || []).forEach((effect) => {
    if (effect) {
      applyBattleEffect("player", effect, 1, true);
    }
  });
}

function grantInventoryItem(key: string, amount = 1, label?: string, silent = false) {
  if (!key) {
    return 0;
  }
  const qty = Number(amount) || 0;
  if (!qty) {
    return 0;
  }
  if (typeof state.inventory[key] !== "number") {
    state.inventory[key] = 0;
  }
  const current = Math.max(0, Number(state.inventory[key]) || 0);
  if (qty < 0) {
    state.inventory[key] = Math.max(0, current + qty);
    updateInventory();
    return qty;
  }
  const space = Math.max(0, MAX_CONSUMABLE_STACK - current);
  if (space <= 0) {
    if (label && !silent) {
      logBattle(`You already have ${MAX_CONSUMABLE_STACK} ${label}.`);
    }
    return 0;
  }
  const added = Math.min(qty, space);
  state.inventory[key] = current + added;
  updateInventory();
  if (label && !silent) {
    logBattle(`Got ${added > 1 ? `${added} ` : ""}${label}!`);
  }
  return added;
}

function grantKeyItem(key: string, amount = 1, label?: string, silent = false) {
  if (!key) {
    return 0;
  }
  const qty = Number(amount) || 0;
  if (!qty) {
    return 0;
  }
  if (typeof state.keyItems[key] !== "number") {
    state.keyItems[key] = 0;
  }
  state.keyItems[key] = Math.max(0, state.keyItems[key] + qty);
  updateKeyItems();
  const entry = KEY_ITEMS_CONFIG.find((item) => item.key === key);
  const name = label || entry?.name || key;
  if (qty > 0 && !silent) {
    logBattle(`Got ${qty > 1 ? `${qty} ` : ""}${name}!`);
  }
  return qty;
}

function grantEquipmentItem(key: string, label?: string, silent = false) {
  if (!key) {
    return false;
  }
  const item = EQUIPMENT_CONFIG.find((entry) => entry.key === key);
  if (!item) {
    return false;
  }
  if (state.equipment[key]) {
    return false;
  }
  state.equipment[key] = 1;
  updateEquipment();
  if (!silent) {
    logBattle(`Got ${label || item.name}!`);
  }
  return true;
}

/** Roll configured post-fight drops. */
function attemptEnemyDrops(
  drops:
    | ReadonlyArray<{ kind: string; key?: string; chance: number; amount?: number }>
    | undefined
) {
  if (!drops?.length) {
    return;
  }
  drops.forEach((drop) => {
    if (Math.random() >= Number(drop.chance) || Number(drop.chance) <= 0) {
      return;
    }
    if (drop.kind === "equipment" && drop.key) {
      const item = EQUIPMENT_CONFIG.find((entry) => entry.key === drop.key);
      if (grantEquipmentItem(drop.key, undefined, true)) {
        queueDropNotice(item?.name || drop.key, 1, resolveDropIcon("equipment", drop.key));
      }
      return;
    }
    if (drop.kind === "inventory" && drop.key) {
      const entry = INVENTORY_CONFIG.find((item) => item.key === drop.key);
      const added = grantInventoryItem(drop.key, drop.amount || 1, entry?.name || drop.key, true);
      if (added > 0) {
        queueDropNotice(entry?.name || drop.key, added, resolveDropIcon("inventory", drop.key));
      }
      return;
    }
    if (drop.kind === "keyItem" && drop.key) {
      const entry = KEY_ITEMS_CONFIG.find((item) => item.key === drop.key);
      const added = grantKeyItem(drop.key, drop.amount || 1, entry?.name || drop.key, true);
      if (added > 0) {
        queueDropNotice(entry?.name || drop.key, added, resolveDropIcon("keyItem", drop.key));
      }
      return;
    }
    if (drop.kind === "meat") {
      const amount = Math.max(1, Number(drop.amount) || 1);
      state.meat = Math.max(0, state.meat + amount);
      updateMeatDisplay();
      queueDropNotice("Meat", amount, MEAT_DROP_ICON);
    }
  });
}

function attemptWildWinItemDrop() {
  if (Math.random() >= WILD_WIN_ITEM_DROP_CHANCE) {
    return;
  }
  const tier = getZoneDifficultyTier(state.currentZone);
  const specialStatus = state.opponent ? getSpecialStatus(state.opponent) : "";
  const specialItemKeys = getWildSpecialDropKeys(
    state.currentZone,
    state.opponent?.id ? String(state.opponent.id) : null
  ).filter((key) => {
    if (key === "meat") {
      return true;
    }
    if (EQUIPMENT_CONFIG.some((item) => item.key === key)) {
      return !state.equipment[key];
    }
    return (Number(state.inventory[key]) || 0) < MAX_CONSUMABLE_STACK;
  });
  const key = pickWildWinDropKey(tier, specialStatus, state.inventory, specialItemKeys);
  if (!key) {
    return;
  }
  if (key === "meat") {
    state.meat = Math.max(0, (Number(state.meat) || 0) + 1);
    updateMeatDisplay();
    queueDropNotice("Meat", 1, MEAT_DROP_ICON);
    return;
  }
  const gear = EQUIPMENT_CONFIG.find((item) => item.key === key);
  if (gear) {
    if (grantEquipmentItem(key, undefined, true)) {
      queueDropNotice(gear.name, 1, resolveDropIcon("equipment", key));
    }
    return;
  }
  const entry = INVENTORY_CONFIG.find((item) => item.key === key);
  const added = grantInventoryItem(key, 1, entry?.name || key, true);
  if (added > 0) {
    queueDropNotice(entry?.name || key, added, resolveDropIcon("inventory", key));
  }
}

function resolveZoneEventChoice(choice: ZoneEventChoice) {
  if (!state.activeEvent || state.activeEvent.resolved) {
    return;
  }
  const snapshot = buildEventStatSnapshot();
  if (!choicePassesRequirements(choice, snapshot)) {
    eventText.textContent = choice.disabledHint || "You can't do that right now.";
    return;
  }
  const needMeat = Number(choice.requireMeat) || 0;
  if (needMeat > 0 && state.meat < needMeat) {
    eventText.textContent = "You have nothing to give right now.";
    return;
  }
  if (choice.requireAnyInventoryItem) {
    const hasItem = Object.values(state.inventory || {}).some((qty) => Number(qty) > 0);
    if (!hasItem) {
      eventText.textContent = "You have nothing to deposit right now.";
      return;
    }
  }
  if (choice.requireAnyFood) {
    if (!hasWeightFood()) {
      eventText.textContent = choice.disabledHint || "You have no food to give.";
      return;
    }
  }
  if (choice.requireAnyHealItem && !ownedHealItemKey()) {
    eventText.textContent = choice.disabledHint || "Need an HP recovery item.";
    return;
  }
  if (choice.requireAnyStatBuffItem && !ownedStatBuffItemKey()) {
    eventText.textContent = choice.disabledHint || "Need a Stat Buff item.";
    return;
  }
  const flavorMessages: string[] = [];
  const autoMessages: string[] = [];
  let lethal = false;
  let pendingFight: Extract<ZoneEventOutcome, { type: "fight" }> | null = null;
  let pendingBossFight = false;
  let pendingBossFightOpponentId: string | null = null;
  let pendingEndRun = false;
  let pendingStatCheck: { passed: boolean; chance: number } | null = null;
  const unlockedThisChoice: string[] = [];
  let repeatOverride: boolean | undefined;
  if (typeof choice.repeatable === "boolean" && state.activeEvent) {
    state.activeEvent.endingRepeatable = choice.repeatable;
  }
  (choice.outcomes || []).forEach((outcome: ZoneEventOutcome) => {
    if (!outcome || !outcome.type) {
      return;
    }
    if (outcome.type === "eventRepeat") {
      repeatOverride = Boolean(outcome.value);
      if (state.activeEvent) {
        state.activeEvent.endingRepeatable = repeatOverride;
      }
      return;
    }
    if (outcome.type === "banForever") {
      const targetId = String(outcome.eventId || state.activeEvent?.id || "");
      if (targetId) {
        banEventForever(targetId);
        consumeZoneEvent(targetId);
        if (!outcome.eventId || outcome.eventId === state.activeEvent?.id) {
          repeatOverride = false;
          if (state.activeEvent) {
            state.activeEvent.endingRepeatable = false;
          }
        }
      }
      return;
    }
    if (outcome.type === "endRun") {
      pendingEndRun = true;
      return;
    }
    if (outcome.type === "queueEvent") {
      const eventId = String(outcome.eventId || "").trim();
      if (eventId) {
        pendingQueuedEventId = eventId;
        autoMessages.push("A path deeper into the mansion opens…");
      }
      return;
    }
    if (outcome.type === "stealRandomInventoryItem") {
      const stole = stealRandomInventoryItemForEvent();
      if (stole) {
        autoMessages.push(
          `Koemon stole your ${state.activeEvent?.stolenItemLabel || "item"}!`
        );
      } else {
        autoMessages.push("Your bag was empty.");
      }
      return;
    }
    if (outcome.type === "returnStolenItem") {
      const label = state.activeEvent?.stolenItemLabel;
      if (returnStolenItemForEvent()) {
        autoMessages.push(`Recovered ${label}.`);
      }
      return;
    }
    if (outcome.type === "statCheck") {
      const mode = outcome.mode || "proc";
      let chance = 0.1;
      let passed = false;
      if (mode === "critical") {
        const foe =
          outcome.opponentId
            ? state.characters.find((char) => String(char.id) === String(outcome.opponentId))
            : null;
        chance = getCriticalChance(state.player, foe || undefined);
        passed = Math.random() < chance;
        pendingStatCheck = { passed, chance };
        if (passed) {
          autoMessages.push(`Catch success! (${Math.round(chance * 100)}% crit chance)`);
        } else {
          autoMessages.push(`Catch failed… (${Math.round(chance * 100)}% crit chance)`);
        }
      } else {
        const stats = getPlayerCombatStats();
        const statKey = outcome.stat || "speed";
        const statValue = Number(stats[statKey]) || 0;
        chance = getStatProcChance(statValue);
        passed = Math.random() < chance;
        pendingStatCheck = { passed, chance };
        if (passed) {
          autoMessages.push(
            `Check success! (${Math.round(chance * 100)}% — ${statKey} ${statValue})`
          );
        } else {
          autoMessages.push(
            `Check failed… (${Math.round(chance * 100)}% — ${statKey} ${statValue})`
          );
        }
      }
      return;
    }
    if (outcome.type === "grantRandomItem") {
      const keys = (outcome.keys || []).map(String).filter(Boolean);
      if (keys.length === 0) {
        autoMessages.push("Nothing to give.");
        return;
      }
      const key = keys[Math.floor(Math.random() * keys.length)];
      const entry = INVENTORY_CONFIG.find((item) => item.key === key);
      grantInventoryItem(key, 1, entry?.name || key);
      autoMessages.push(`Got ${entry?.name || key}!`);
      return;
    }
    if (outcome.type === "grantWeightedLoot") {
      const entries = (outcome.entries || []).filter((entry) => Number(entry.weight) > 0);
      if (entries.length === 0) {
        autoMessages.push("The dig turns up nothing.");
        return;
      }
      const index = pickWeightedIndex(entries.map((entry) => Number(entry.weight) || 0));
      const picked = entries[index];
      if (!picked || picked.kind === "none" || !picked.key) {
        autoMessages.push("The dig turns up nothing.");
        return;
      }
      const amount = Math.max(1, Number(picked.amount) || 1);
      if (picked.kind === "inventory") {
        const entry = INVENTORY_CONFIG.find((item) => item.key === picked.key);
        const label = picked.label || entry?.name || picked.key;
        const added = grantInventoryItem(picked.key, amount, label, true);
        if (added > 0) {
          queueDropNotice(label, added, resolveDropIcon("inventory", picked.key));
          autoMessages.push(`Dug up ${label}!`);
        } else {
          autoMessages.push(`Found ${label}, but your pack is full.`);
        }
        return;
      }
      if (picked.kind === "keyItem") {
        const entry = KEY_ITEMS_CONFIG.find((item) => item.key === picked.key);
        const label = picked.label || entry?.name || picked.key;
        grantKeyItem(picked.key, amount, label, true);
        queueDropNotice(label, amount, resolveDropIcon("keyItem", picked.key));
        autoMessages.push(`Dug up ${label}!`);
        return;
      }
      autoMessages.push("The dig turns up nothing.");
      return;
    }
    if (outcome.type === "spendAnyFood") {
      if ((Number(state.meat) || 0) > 0) {
        state.meat = Math.max(0, (Number(state.meat) || 0) - 1);
        updateMeatDisplay();
        autoMessages.push("Fed Meat.");
        return;
      }
      const spentKey = ownedWeightItemKey();
      if (!spentKey) {
        autoMessages.push("You had no food to give.");
        return;
      }
      const entry = INVENTORY_CONFIG.find((item) => item.key === spentKey);
      grantInventoryItem(spentKey, -1);
      autoMessages.push(`Fed ${entry?.name || spentKey}.`);
      return;
    }
    if (outcome.type === "spendAnyItem") {
      const spentKey = INVENTORY_CONFIG.map((entry) => entry.key).find(
        (key) => (Number(state.inventory[key]) || 0) > 0
      );
      if (!spentKey) {
        autoMessages.push("You had nothing to give.");
        return;
      }
      const entry = INVENTORY_CONFIG.find((item) => item.key === spentKey);
      grantInventoryItem(spentKey, -1);
      autoMessages.push(`Deposited ${entry?.name || spentKey}.`);
      return;
    }
    if (outcome.type === "spendHealItem") {
      const spentKey = ownedHealItemKey();
      if (!spentKey) {
        autoMessages.push("You had no HP recovery item to give.");
        return;
      }
      const entry = INVENTORY_CONFIG.find((item) => item.key === spentKey);
      grantInventoryItem(spentKey, -1);
      autoMessages.push(`Gave ${entry?.name || spentKey}.`);
      return;
    }
    if (outcome.type === "spendStatBuffItem") {
      const spentKey = ownedStatBuffItemKey();
      if (!spentKey) {
        autoMessages.push("You had no Stat Buff item to give.");
        return;
      }
      const entry = INVENTORY_CONFIG.find((item) => item.key === spentKey);
      grantInventoryItem(spentKey, -1);
      autoMessages.push(`Gave ${entry?.name || spentKey}.`);
      return;
    }
    if (outcome.type === "message" && outcome.text) {
      flavorMessages.push(outcome.text);
      return;
    }
    if (outcome.type === "heal") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const amount = Math.max(0, Number(outcome.amount) || 0);
      state.zoneRunHp = Math.min(maxHp, current + amount);
      autoMessages.push(`Recovered ${amount} HP.`);
      return;
    }
    if (outcome.type === "healToPercent") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const percent = Math.max(0, Math.min(100, Number(outcome.percent) || 0));
      const target = Math.max(1, Math.round((maxHp * percent) / 100));
      const next = Math.min(maxHp, Math.max(current, target));
      const gained = next - current;
      state.zoneRunHp = next;
      autoMessages.push(`HP restored to ${percent}% (${gained} HP).`);
      return;
    }
    if (outcome.type === "damage") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const amount = Math.max(0, Number(outcome.amount) || 0);
      state.zoneRunHp = Math.max(0, current - amount);
      autoMessages.push(`Took ${amount} damage.`);
      if (state.zoneRunHp <= 0) {
        lethal = true;
      }
      return;
    }
    if (outcome.type === "damagePercent") {
      const maxHp = getPlayerCombatStats().hp;
      const current = typeof state.zoneRunHp === "number" ? state.zoneRunHp : maxHp;
      const percent = Math.max(0, Number(outcome.percent) || 0);
      const minHp = Math.max(0, Number(outcome.minHp) || 0);
      const amount =
        percent <= 0 ? 0 : Math.max(1, Math.ceil((maxHp * percent) / 100));
      state.zoneRunHp = Math.max(minHp, current - amount);
      autoMessages.push(`Took ${amount} damage (${percent}% max HP).`);
      if (state.zoneRunHp <= 0) {
        lethal = true;
      }
      return;
    }
    if (outcome.type === "meat") {
      const amount = Number(outcome.amount) || 0;
      state.meat = Math.max(0, state.meat + amount);
      updateMeatDisplay();
      if (amount >= 0) {
        autoMessages.push(`Got ${amount} meat.`);
      } else {
        autoMessages.push(`Gave ${Math.abs(amount)} meat.`);
      }
      return;
    }
    if (outcome.type === "weight") {
      const amount = Number(outcome.amount) || 0;
      state.weight = Math.max(1, state.weight + amount);
      updateWeight();
      autoMessages.push(amount >= 0 ? `Weight +${amount}.` : `Weight ${amount}.`);
      return;
    }
    if (outcome.type === "training") {
      const amount = Number(outcome.amount) || 0;
      state.training = Math.max(0, state.training + amount);
      autoMessages.push(amount >= 0 ? `Training +${amount}.` : `Training ${amount}.`);
      return;
    }
    if (outcome.type === "attributes") {
      if (!state.attributes) {
        state.attributes = {
          hp: 0,
          attack: 0,
          defense: 0,
          speed: 0,
          intelligence: 0,
        };
      }
      const parts: string[] = [];
      (["hp", "attack", "defense", "speed", "intelligence"] as const).forEach((stat) => {
        const delta = Number(outcome[stat]) || 0;
        if (!delta) {
          return;
        }
        const next = (Number(state.attributes[stat]) || 0) + delta;
        state.attributes[stat] = stat === "hp" ? Math.max(1, next) : next;
        const label =
          stat === "hp"
            ? "HP"
            : stat === "attack"
              ? "Attack"
              : stat === "defense"
                ? "Defense"
                : stat === "speed"
                  ? "Speed"
                  : "Intelligence";
        parts.push(`${label} ${delta >= 0 ? "+" : ""}${delta}`);
      });
      updateAttributes();
      if (parts.length) {
        autoMessages.push(`Permanent changes: ${parts.join(", ")}.`);
      }
      return;
    }
    if (outcome.type === "zoneBuff") {
      const stat = outcome.stat;
      if (stat) {
        state.zoneRunBuffs[stat] = true;
        if (state.battle?.statMods) {
          getBattleStatMods("player").buff[stat] = true;
          updateStatusIcons();
        }
        autoMessages.push(`${stat} buffed for this zone run.`);
      }
      return;
    }
    if (outcome.type === "zoneDebuff") {
      const stat = outcome.stat;
      if (stat) {
        state.zoneRunDebuffs[stat] = true;
        if (state.battle?.statMods && !hasDebuffImmunity(stat)) {
          getBattleStatMods("player").debuff[stat] = true;
          updateStatusIcons();
        }
        autoMessages.push(`${stat} debuffed for this zone run.`);
      }
      return;
    }
    if (outcome.type === "zoneDebuffRandom") {
      const applied = applyRandomZoneDebuffs(Math.max(1, Number(outcome.count) || 2));
      if (applied.length === 0) {
        autoMessages.push("The curse finds nothing left to touch.");
        flavorMessages.push("The curse finds nothing left to touch.");
        return;
      }
      const labels = applied.map(formatZoneStatLabel);
      const listed =
        labels.length === 1
          ? labels[0]
          : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
      const msg = `${listed} reduced for the rest of this zone.`;
      autoMessages.push(msg);
      flavorMessages.push(msg);
      return;
    }
    if (outcome.type === "clearZoneDebuff") {
      const stat = outcome.stat;
      if (stat) {
        state.zoneRunDebuffs[stat] = false;
        if (state.battle?.statMods) {
          getBattleStatMods("player").debuff[stat] = false;
          updateStatusIcons();
        }
        autoMessages.push(`${stat} debuff cleared.`);
      }
      return;
    }
    if (outcome.type === "item") {
      if (typeof outcome.chance === "number") {
        const chance = Math.max(0, Math.min(1, Number(outcome.chance) || 0));
        if (Math.random() >= chance) {
          return;
        }
      }
      const amount = Number(outcome.amount) || 1;
      grantInventoryItem(outcome.key, amount, outcome.label || outcome.key);
      if (amount >= 0) {
        const got = `Got ${outcome.label || outcome.key}.`;
        autoMessages.push(got);
        if (typeof outcome.chance === "number") {
          flavorMessages.push(got);
        }
      } else {
        autoMessages.push(`Gave ${outcome.label || outcome.key}.`);
      }
      return;
    }
    if (outcome.type === "equipment") {
      const before = Number(state.equipment[outcome.key]) || 0;
      grantEquipmentItem(outcome.key, outcome.label);
      if (!before && (Number(state.equipment[outcome.key]) || 0) > 0) {
        autoMessages.push(`Got ${outcome.label || outcome.key}.`);
      } else if (before) {
        autoMessages.push(`Already own ${outcome.label || outcome.key}.`);
      }
      return;
    }
    if (outcome.type === "keyItem") {
      const amount = Number(outcome.amount) || 1;
      const entry = KEY_ITEMS_CONFIG.find((item) => item.key === outcome.key);
      const name = outcome.label || entry?.name || outcome.key;
      grantKeyItem(outcome.key, amount, name);
      if (amount >= 0) {
        autoMessages.push(`Got ${name}.`);
      } else {
        autoMessages.push(`Used ${name}.`);
      }
      return;
    }
    if (outcome.type === "unlockZones") {
      const requested = (outcome.zoneIds || []).map(String).filter(Boolean);
      const unlocked = unlockZones(requested);
      const namesForPopup = (unlocked.length > 0 ? unlocked : requested).map(
        (id) => ZONE_CONFIG.find((zone) => zone.id === id)?.name || id
      );
      unlockedThisChoice.push(...namesForPopup);
      if (unlocked.length > 0) {
        autoMessages.push(`New path unlocked: ${namesForPopup.join(", ")}.`);
      }
      return;
    }
    if (outcome.type === "care") {
      if (typeof outcome.discipline === "number") {
        state.discipline = clampCareStat(state.discipline + outcome.discipline);
      }
      if (typeof outcome.happiness === "number") {
        state.happiness = clampCareStat(state.happiness + outcome.happiness);
      }
      if (typeof outcome.alignment === "number") {
        state.alignment = clampCareStat(state.alignment + outcome.alignment);
      }
      updateCareStats();
      autoMessages.push("Your Digimon's mood shifted.");
      return;
    }
    if (outcome.type === "reputation") {
      const amount = Number(outcome.amount) || 0;
      state.reputation = Math.max(0, (state.reputation || 0) + amount);
      updateFinalChallengeAvailability();
      if (amount >= 0) {
        autoMessages.push(`Reputation +${amount}.`);
      } else {
        autoMessages.push(`Reputation ${amount}.`);
      }
      return;
    }
    if (outcome.type === "fight") {
      pendingFight = outcome;
      return;
    }
    if (outcome.type === "bossFight") {
      pendingBossFight = true;
      const forced = String(outcome.opponentId || "").trim();
      if (forced) {
        pendingBossFightOpponentId = forced;
      }
      return;
    }
  });
  const messages = [...flavorMessages, ...autoMessages].filter(Boolean);
  if (messages.length > 0) {
    eventText.textContent = messages.join(" ");
  }
  eventChoices.innerHTML = "";
  const mood = choice.mood || inferEventChoiceMood(choice.outcomes || []);
  startEventSpeakerAnim(mood);
  if (lethal) {
    finishActiveEvent({ choice, repeatable: repeatOverride });
    startEventSpeakerAnim("angry");
    handleEventKnockout();
    return;
  }
  if (pendingBossFight) {
    finishActiveEvent({ choice, repeatable: repeatOverride });
    const pending = pendingBossEncounter;
    closeEventScreen();
    if (pending) {
      startZoneBossFight(
        pending.boss,
        pendingBossFightOpponentId || pending.opponentId
      );
    }
    return;
  }
  if (pendingStatCheck) {
    if (pendingStatCheck.passed && choice.next) {
      const eventDef = findActiveZoneEventDefinition();
      if (eventDef) {
        showZoneEventDialogue(eventDef, choice.next);
        return;
      }
    }
    if (!pendingStatCheck.passed) {
      const failText =
        flavorMessages.length > 0
          ? flavorMessages.join(" ")
          : autoMessages.length > 0
            ? autoMessages.join(" ")
            : "They slip away before you can catch them.";
      eventText.textContent = failText.trim();
    }
    finishActiveEvent({
      choice,
      repeatable: typeof repeatOverride === "boolean" ? repeatOverride : true,
    });
    eventContinueButton.textContent = "Continue";
    eventPostActions.classList.remove("hidden");
    eventContinueButton.classList.remove("hidden");
    eventContinueButton.disabled = false;
    refreshAdventureItemAccess();
    return;
  }
  if (pendingFight) {
    if (choice.next) {
      state.activeEvent.resumeNodeId = choice.next;
      state.activeEvent.resolved = false;
    } else {
      finishActiveEvent({ choice, repeatable: repeatOverride });
    }
    const opponent = state.characters.find(
      (char) => String(char.id) === String(pendingFight?.opponentId)
    );
    if (!opponent) {
      eventText.textContent = "The fight fizzles out. Nobody is there.";
      if (choice.next) {
        const eventDef = findActiveZoneEventDefinition();
        if (eventDef) {
          showZoneEventDialogue(eventDef, choice.next);
          return;
        }
      }
      finishActiveEvent({ choice, repeatable: repeatOverride });
      eventContinueButton.textContent = "Continue";
      eventPostActions.classList.remove("hidden");
      eventContinueButton.classList.remove("hidden");
      eventContinueButton.disabled = false;
      refreshAdventureItemAccess();
      return;
    }
    const fightStats = resolveEventFightStats(pendingFight);
    if (!fightStats) {
      eventText.textContent = "The fight fizzles out. Nobody is ready.";
      finishActiveEvent({ choice, repeatable: repeatOverride });
      eventContinueButton.textContent = "Continue";
      eventPostActions.classList.remove("hidden");
      eventContinueButton.classList.remove("hidden");
      eventContinueButton.disabled = false;
      refreshAdventureItemAccess();
      return;
    }
    state.eventBattleOverride = {
      opponentId: pendingFight.opponentId,
      stats: { ...fightStats },
      rewardOnWin: pendingFight.rewardOnWin ? { ...pendingFight.rewardOnWin } : undefined,
      banForeverOnWin: Boolean(pendingFight.banForeverOnWin),
      reputationOnWin:
        typeof pendingFight.reputationOnWin === "number"
          ? pendingFight.reputationOnWin
          : undefined,
      incrementEventWinsOnWin: Boolean(pendingFight.incrementEventWinsOnWin),
      dropsOnWin: pendingFight.dropsOnWin ? [...pendingFight.dropsOnWin] : undefined,
      opponentStartBuffs: pendingFight.opponentStartBuffs
        ? pendingFight.opponentStartBuffs === true
          ? true
          : [...pendingFight.opponentStartBuffs]
        : undefined,
      playerStartDebuffs: pendingFight.playerStartDebuffs
        ? [...pendingFight.playerStartDebuffs]
        : undefined,
    };
    zonePreBattle = { active: true, itemUsed: false, kind: "event" };
    eventContinueButton.textContent = "Fight";
    eventPostActions.classList.remove("hidden");
    eventContinueButton.classList.remove("hidden");
    eventContinueButton.disabled = false;
    refreshAdventureItemAccess();
    return;
  }
  if (choice.next) {
    const eventDef = findActiveZoneEventDefinition();
    if (eventDef) {
      showZoneEventDialogue(eventDef, choice.next);
      return;
    }
  }
  finishActiveEvent({ choice, repeatable: repeatOverride });
  if (String(state.activeEvent?.id || "").startsWith("boss_")) {
    pendingBossEncounter = null;
  }
  if (pendingEndRun) {
    pendingEventEndRun = false;
    pendingEventEndRunUnlocks = unlockedThisChoice;
    eventChoices.innerHTML = "";
    eventPostActions.classList.add("hidden");
    void showEndRunPopup(unlockedThisChoice).then(() => {
      retreatZoneRun();
    });
    return;
  }
  eventContinueButton.textContent = "Continue";
  eventPostActions.classList.remove("hidden");
  eventContinueButton.classList.remove("hidden");
  eventContinueButton.disabled = false;
  refreshAdventureItemAccess();
  const lootNotices = takePendingDropNotices();
  if (lootNotices.length) {
    void showDropPopup(lootNotices, "Treasure");
  }
}

function handleEventKnockout() {
  state.lives = Math.max(0, state.lives - 1);
  updateLivesDisplay();
  state.zoneRunHp = 0;
  if (state.lives <= 0) {
    eventText.textContent = `${eventText.textContent} You collapsed...`.trim();
    eventPostActions.classList.add("hidden");
    window.setTimeout(() => {
      closeEventScreen();
      advanceBgCalendarAfterZoneRun();
      state.currentZone = null;
      state.zoneLevel = 0;
      state.zoneRunHp = null;
      state.zoneEventChance = 0;
      showEndScreen(false);
    }, 1200);
    return;
  }
  eventText.textContent = `${eventText.textContent} You lost a life.`.trim();
  eventPostActions.classList.remove("hidden");
  eventContinueButton.classList.add("hidden");
  eventContinueButton.disabled = true;
  refreshAdventureItemAccess();
}

function continueZoneRun() {
  if (!state.currentZone || state.zoneBossVictory) {
    return;
  }
  if (zoneSceneTransitioning) {
    return;
  }
  if (typeof state.zoneRunHp === "number" && state.zoneRunHp <= 0) {
    return;
  }
  const fromBattle = Boolean(state.battle?.ended);
  const fromEvent = Boolean(state.activeEvent?.resolved);
  if (!fromBattle && !fromEvent) {
    return;
  }
  const fromStoryEvent = isResolvedStoryZoneEvent();
  state.zoneLevel += 1;
  if (!fromStoryEvent) {
    state.zoneEventChance = Math.min(
      getZoneEventChanceMax(),
      state.zoneEventChance + getZoneEventChanceStep()
    );
  }
  state.opponent = null;
  playZoneBackgroundTransition(() => {
    endBattle();
    closeEventScreen();
    beginZoneEncounter();
  });
}

function advanceBgCalendarAfterZoneRun() {
  if (!state.currentZone || state.zoneLevel <= 0) {
    return;
  }
  bumpBgCalendarDay(1 + getZoneRunDayOffset(state.zoneLevel));
}

function retreatZoneRun() {
  endBattle();
  closeEventScreen();
  battleScreen.classList.add("hidden");
  pendingZoneOpponent = null;
  pendingBossEncounter = null;
  pendingEventEndRun = false;
  pendingEventEndRunUnlocks = [];
  pendingQueuedEventId = null;
  window.clearTimeout(zoneSceneFadeTimer);
  zoneSceneFade?.classList.remove("active");
  zoneSceneTransitioning = false;
  lastZoneBackgroundUrl = "";
  advanceBgCalendarAfterZoneRun();
  state.currentZone = null;
  state.zoneLevel = 0;
  state.zoneRunHp = getPlayerCombatStats().hp;
  state.zoneEventChance = 0;
  state.eventBattleOverride = null;
  state.zoneBossFight = null;
  state.zoneBossVictory = false;
  state.gearUpActive = false;
  state.homeTrainBoost = 0;
  state.zoneRunBuffs = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  state.zoneRunDebuffs = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  feedReturnContext = "home";
  hideZonePostBattleActions();
  battleDefaultActions.classList.remove("hidden");
  openActionMenu();
}

type FeedReturnContext = "home" | "event" | "battle";
let feedReturnContext: FeedReturnContext = "home";

function openFeedMenu(returnTo: FeedReturnContext = "home") {
  feedReturnContext = returnTo;
  actionMenu.classList.add("hidden");
  if (returnTo === "event") {
    eventScreen.classList.add("hidden");
  } else if (returnTo === "battle") {
    battleScreen.classList.add("hidden");
  }
  feedMenu.classList.remove("hidden");
  feedItemDesc.textContent = ITEM_HOVER_PLACEHOLDER;
  hideItemHoverTooltip();
  updateMeatDisplay();
  updateInventory();
  startFeedingPreview(false);
}

function closeFeedMenu() {
  feedMenu.classList.add("hidden");
  hideItemHoverTooltip();
  stopFeedingPreview();
  const returnTo = feedReturnContext;
  feedReturnContext = "home";
  if (
    returnTo === "event" &&
    state.currentZone &&
    (state.activeEvent?.resolved || zonePreBattle?.active || state.eventBattleOverride)
  ) {
    eventScreen.classList.remove("hidden");
    eventPostActions.classList.remove("hidden");
    refreshAdventureItemAccess();
    return;
  }
  if (returnTo === "battle" && state.currentZone) {
    battleScreen.classList.remove("hidden");
    const canContinue =
      Boolean(state.battle?.ended) &&
      (typeof state.zoneRunHp !== "number" || state.zoneRunHp > 0) &&
      !state.zoneBossVictory;
    showZonePostBattleActions(canContinue);
    return;
  }
  openActionMenu();
}

function openHubMenu() {
  characterMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  battleScreen.classList.add("hidden");
  eventScreen.classList.add("hidden");
  feedMenu.classList.add("hidden");
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  evolutionScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  congratsScreen.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  zoneInfoMenu.classList.add("hidden");
  hubMenu.classList.remove("hidden");
  stopEndScreen();
  stopSpritePreview();
  updateFinalChallengeAvailability();
  updateWeight();
  updateCareStats();
  updateAttributes();
  updateLivesDisplay();
  updateMeatDisplay();
  updateInventory();
  updateEquipment();
  updateEquipmentStatus();
  updateKeyItems();
  renderWinRate();
}

function openActionMenu() {
  characterMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  actionMenu.classList.remove("hidden");
  battleScreen.classList.add("hidden");
  eventScreen.classList.add("hidden");
  feedMenu.classList.add("hidden");
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  evolutionScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  congratsScreen.classList.add("hidden");
  feedReturnContext = "home";
  state.zoneRunHp = getPlayerCombatStats().hp;
  stopEndScreen();
  updateCaretakerInfo();
  startSpritePreview();
  updateWeight();
  updateCareStats();
  updateAttributes();
  updateLivesDisplay();
  updateMeatDisplay();
  updateInventory();
  updateEquipment();
  updateEquipmentStatus();
  updateKeyItems();
  renderWinRate();
}

function updateWeight() {
  weightCounter.textContent = `Weight: ${state.weight}`;
  updateTrainAvailability();
}

function updateLivesDisplay() {
  if (!livesRow) {
    return;
  }
  const hearts = livesRow.querySelectorAll<HTMLImageElement>(".life-heart");
  hearts.forEach((heart, index) => {
    heart.setAttribute(
      "src",
      index < state.lives ? "data/ui/heart_full.png" : "data/ui/heart_empty.png"
    );
    heart.setAttribute("alt", index < state.lives ? "Life" : "Lost life");
  });
}

function updateTrainAvailability() {
  const canTrain = canTrainNow();
  trainButton.disabled = !canTrain;
  trainButton.title = trainUnavailableReason();
  trainButton.classList.toggle("is-disabled", !canTrain);
  if (trainRetryButton) {
    trainRetryButton.disabled = !canTrain;
    trainRetryButton.classList.toggle("is-disabled", !canTrain);
  }
}

const HOME_TRAIN_BOOST_MAX = 4;

function getHomeTrainBoost(): number {
  return Math.max(
    0,
    Math.min(HOME_TRAIN_BOOST_MAX, Math.floor(Number(state.homeTrainBoost) || 0))
  );
}

function hasTrainingManual(): boolean {
  return (Number(state.keyItems.trainingManual) || 0) > 0;
}

/** Combat-stat gain from one successful training (Training Manual doubles, still capped at 4). */
function getTrainingStatGain(): number {
  const remaining = HOME_TRAIN_BOOST_MAX - getHomeTrainBoost();
  if (remaining <= 0) {
    return 0;
  }
  return Math.min(hasTrainingManual() ? 2 : 1, remaining);
}

/** Evolution training count from one successful training. */
function getTrainingCountGain(): number {
  return hasTrainingManual() ? 2 : 1;
}

function canTrainNow(): boolean {
  return state.weight > 1 && getHomeTrainBoost() < HOME_TRAIN_BOOST_MAX;
}

function trainUnavailableReason(): string {
  if (state.weight <= 1) {
    return "Need more than 1 Weight to train.";
  }
  if (getHomeTrainBoost() >= HOME_TRAIN_BOOST_MAX) {
    return "Already trained 4 times. Enter a zone first.";
  }
  return "";
}

function updateMeatDisplay() {
  if (!meatCount) {
    return;
  }
  meatCount.textContent = `x${state.meat ?? 0}`;
  const meatVisible =
    (state.meat ?? 0) > 0 && feedReturnContext === "home" && matchesFeedItemFilter("meat");
  feedMeatButton.classList.toggle("hidden", !meatVisible);
}

function updateCareStats() {
  state.discipline = clampCareStat(state.discipline);
  state.happiness = clampCareStat(state.happiness);
  state.alignment = clampCareStat(state.alignment);
  disciplineCounter.textContent = `Discipline: ${getDisciplineLabel(state.discipline)}`;
  happinessCounter.textContent = `Happiness: ${getHappinessLabel(state.happiness)}`;
  alignmentCounter.textContent = `Alignment: ${getAlignmentLabel(state.alignment)}`;
}

function updateAttributes() {
  const attrs = state.attributes || {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
  };
  const bonuses = getEquipmentBonuses();
  const train = getHomeTrainBoost();
  renderAttributeLine(attrHpCounter, "HP", attrs.hp, bonuses.hp || 0, false, 0);
  renderAttributeLine(attrAttackCounter, "Attack", attrs.attack, bonuses.attack || 0, isTemporaryStatBuffed("attack"), train);
  renderAttributeLine(attrDefenseCounter, "Defense", attrs.defense, bonuses.defense || 0, isTemporaryStatBuffed("defense"), train);
  renderAttributeLine(attrSpeedCounter, "Speed", attrs.speed, bonuses.speed || 0, isTemporaryStatBuffed("speed"), train);
  renderAttributeLine(
    attrIntelligenceCounter,
    "Intelligence",
    attrs.intelligence,
    bonuses.intelligence || 0,
    isTemporaryStatBuffed("intelligence"),
    train
  );
}

function isTemporaryStatBuffed(stat: "attack" | "defense" | "speed" | "intelligence"): boolean {
  return Boolean(
    state.gearUpActive ||
      state.gearUpPending ||
      state.zoneRunBuffs?.[stat] ||
      state.zoneRunBuffsPending?.[stat]
  );
}

function renderAttributeLine(
  el: HTMLElement | null,
  label: string,
  base: number,
  gear: number,
  tempBuffed: boolean,
  trainBoost = 0
) {
  if (!el) {
    return;
  }
  const baseValue = Number(base) || 0;
  const gearValue = Number(gear) || 0;
  const trainValue = Math.max(0, Number(trainBoost) || 0);
  const preTemp = baseValue + gearValue + trainValue;
  const tempValue = tempBuffed ? Math.max(0, Math.round(preTemp * 1.25) - preTemp) : 0;
  el.replaceChildren();
  el.append(`${label}: `, Object.assign(document.createElement("span"), {
    className: "stat-base",
    textContent: String(baseValue),
  }));
  if (gearValue) {
    const gearEl = document.createElement("span");
    gearEl.className = "stat-gear";
    gearEl.textContent = ` ${gearValue > 0 ? "+" : ""}${gearValue}`;
    el.append(gearEl);
  }
  if (trainValue) {
    const trainEl = document.createElement("span");
    trainEl.className = "stat-train";
    trainEl.textContent = ` +${trainValue}`;
    el.append(trainEl);
  }
  if (tempValue) {
    const tempEl = document.createElement("span");
    tempEl.className = "stat-temp";
    tempEl.textContent = ` +${tempValue}`;
    el.append(tempEl);
  }
}

function getEquipmentBonuses(): Partial<Record<"hp" | "attack" | "defense" | "speed" | "intelligence", number>> {
  const equipped = EQUIPMENT_CONFIG.find((item) => item.key === state.equipped);
  return equipped?.bonuses ? { ...equipped.bonuses } : {};
}

function getEquippedGear() {
  return EQUIPMENT_CONFIG.find((item) => item.key === state.equipped);
}

function applyEquippedPostCombatHeal() {
  const gear = getEquippedGear() as { healAfterCombat?: number; name?: string } | undefined;
  const heal = Math.max(0, Number(gear?.healAfterCombat) || 0);
  if (!heal || typeof state.zoneRunHp !== "number") {
    return;
  }
  const maxHp = getPlayerCombatStats().hp;
  const before = state.zoneRunHp;
  state.zoneRunHp = Math.min(maxHp, state.zoneRunHp + heal);
  const gained = state.zoneRunHp - before;
  if (gained > 0) {
    logBattle(`${gear?.name || "Equipment"} restores ${gained} HP.`);
  }
}

function applyEvolutionStatGains(previous: Character | null | undefined, evolved: Character) {
  const from = getCharacterCombatStats(previous);
  const to = getCharacterCombatStats(evolved);
  const current = state.attributes || from;
  const next = addCombatStatDelta(current, from, to);
  const minHpGain = Math.max(
    0,
    getStageBaseStats(evolved.stage).hp - getStageBaseStats(previous?.stage).hp
  );
  const hpGain = next.hp - (Number(current.hp) || 0);
  if (hpGain < minHpGain) {
    next.hp = Math.max(1, (Number(current.hp) || 0) + minHpGain);
  }
  state.attributes = next;
}

/** Mid-run evolution keeps damage taken, but current HP still gains the new max. */
function applyEvolutionZoneRunHp(previousHp: number, previousMaxHp: number) {
  const newMaxHp = getPlayerCombatStats().hp;
  if (!state.currentZone) {
    state.zoneRunHp = newMaxHp;
    syncEvolvedBattleHp(newMaxHp);
    return;
  }
  const gainedMax = Math.max(0, newMaxHp - previousMaxHp);
  const nextHp = Math.max(1, Math.min(newMaxHp, Math.max(0, previousHp) + gainedMax));
  state.zoneRunHp = nextHp;
  syncEvolvedBattleHp(nextHp);
}

function syncEvolvedBattleHp(currentHp: number) {
  if (!state.battle) {
    return;
  }
  state.battle.playerStats = { ...getPlayerCombatStats() };
  state.battle.playerHp = currentHp;
}

function updateInventory() {
  INVENTORY_CONFIG.forEach((item) => {
    const refs = inventoryUi[item.key];
    const total = Math.min(
      MAX_CONSUMABLE_STACK,
      Math.max(0, Number(state.inventory[item.key]) || 0)
    );
    state.inventory[item.key] = total;
    if (!refs?.count || !refs.button) {
      return;
    }
    refs.count.textContent = `x${total}`;
    refs.button.classList.toggle("hidden", total <= 0 || !matchesFeedItemFilter(item.key));
  });
}

function updateEquipment() {
  EQUIPMENT_CONFIG.forEach((item) => {
    const refs = equipmentUi[item.key];
    if (!refs?.button) {
    return;
  }
    const unlocked = Boolean(state.equipment[item.key]);
    const equipped = state.equipped === item.key;
    refs.button.classList.toggle("hidden", !unlocked);
    refs.button.classList.toggle("selected", equipped);
    if (refs.status) {
      refs.status.textContent = equipped ? "Equipped" : "";
    }
  });
  if (equipmentPreviewImg) {
    const equipped = EQUIPMENT_CONFIG.find((item) => item.key === state.equipped);
    if (equipped) {
      equipmentPreviewImg.src = equipped.asset;
      equipmentPreviewImg.alt = equipped.alt;
      equipmentPreviewImg.classList.remove("hidden");
    } else {
      equipmentPreviewImg.classList.add("hidden");
    }
  }
}

function updateKeyItems() {
  if (!keyItemsList) {
    return;
  }
  keyItemsList.innerHTML = "";
  const owned = KEY_ITEMS_CONFIG.filter((item) => (state.keyItems[item.key] || 0) > 0);
  // Also surface ad-hoc keys granted without a config entry.
  const known = new Set(KEY_ITEMS_CONFIG.map((item) => item.key));
  const extraKeys = Object.keys(state.keyItems).filter(
    (key) => !known.has(key) && (state.keyItems[key] || 0) > 0
  );
  if (keyItemsEmpty) {
    const hasAny = owned.length > 0 || extraKeys.length > 0;
    keyItemsEmpty.classList.toggle("hidden", hasAny);
    if (!hasAny && keyItemsEmpty.textContent !== "No key items yet.") {
      // Keep craft success text until the next empty refresh from a non-craft open.
    }
    if (hasAny) {
      keyItemsEmpty.textContent = "No key items yet.";
    }
  }
  owned.forEach((item) => {
    const qty = state.keyItems[item.key] || 0;
    const canUse = keyItemUseAvailable(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-card item-card";
    button.dataset.keyItem = item.key;
    bindItemHoverDescription(
      button,
      canUse ? `${item.label} (Tap to combine!)` : item.label
    );
    if (canUse) {
      button.addEventListener("click", () => {
        tryUseKeyItem(item.key);
      });
    } else {
      button.setAttribute("aria-disabled", "true");
    }
    button.innerHTML = `
      <div class="item-info">
        <h3 class="character-name">${item.name}</h3>
        <p class="character-meta">x${qty}${canUse ? " · Combine" : ""}</p>
      </div>
      <img src="${item.asset}" alt="${item.alt}" class="food-sprite item-icon" />
    `;
    keyItemsList.append(button);
  });
  extraKeys.forEach((key) => {
    const qty = state.keyItems[key] || 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-card item-card";
    button.dataset.keyItem = key;
    bindItemHoverDescription(button, key);
    button.setAttribute("aria-disabled", "true");
    button.innerHTML = `
      <div class="item-info">
        <h3 class="character-name">${key}</h3>
        <p class="character-meta">x${qty}</p>
      </div>
    `;
    keyItemsList.append(button);
  });
}

function keyItemUseAvailable(item: (typeof KEY_ITEMS_CONFIG)[number]): boolean {
  const action = item.onUse;
  if (!action || action.type !== "combineIntoInventory") {
    return false;
  }
  return (action.requireKeyItems || []).every(
    (key) => (Number(state.keyItems[key]) || 0) > 0
  );
}

function tryUseKeyItem(itemKey: string): boolean {
  const item = KEY_ITEMS_CONFIG.find((entry) => entry.key === itemKey);
  if (!item?.onUse || item.onUse.type !== "combineIntoInventory") {
    return false;
  }
  if (!keyItemUseAvailable(item)) {
    return false;
  }
  const action = item.onUse;
  (action.consumeKeyItems || []).forEach((key) => {
    grantKeyItem(key, -1);
  });
  const grantKey = action.grantInventoryKey;
  const grantAmount = Math.max(1, Number(action.grantAmount) || 1);
  const grantEntry = INVENTORY_CONFIG.find((entry) => entry.key === grantKey);
  grantInventoryItem(grantKey, grantAmount, grantEntry?.name || grantKey);
  updateKeyItems();
  updateInventory();
  const msg =
    action.successMessage ||
    `Crafted ${grantEntry?.name || grantKey}!`;
  if (keyItemsEmpty) {
    const stillOwned = KEY_ITEMS_CONFIG.some((entry) => (state.keyItems[entry.key] || 0) > 0);
    if (!stillOwned) {
      keyItemsEmpty.textContent = msg;
      keyItemsEmpty.classList.remove("hidden");
    }
  }
  return true;
}

function updateEquipmentStatus() {
  if (!equipmentStatus) {
    return;
  }
  const equipped = EQUIPMENT_CONFIG.find((item) => item.key === state.equipped);
  equipmentStatus.textContent = `Equipment: ${equipped ? equipped.name : "None"}`;
}

function updateCaretakerInfo() {
  if (!state.player) {
    caretakerSprite.innerHTML = "";
    caretakerName.textContent = "---";
    caretakerStage.textContent = "Stage: ---";
    updateFinalChallengeAvailability();
    return;
  }

  caretakerName.textContent = state.player.name || "---";
  caretakerStage.textContent = `Stage: ${state.player.stage || "---"}`;
  updateFinalChallengeAvailability();
  updateTypeIcon();

  caretakerSprite.innerHTML = "";

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_00.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  sprite.dataset.previewScope = "caretaker";
  caretakerSprite.append(sprite);
}

function updateFinalChallengeAvailability() {
  const ready = Boolean(state.player && state.player.stage === "Ultimate");
  hubFinalChallengeButton.classList.toggle("hidden", !ready);
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
  const file = `${element.toLowerCase()}.png`;
  caretakerTypeIcon.src = `data/ui/type_icons/${file}`;
  caretakerTypeIcon.alt = element;
}

function startEquipmentPreview() {
  if (!state.player || !equipmentSpriteSlot) {
    return;
  }
  equipmentSpriteSlot.innerHTML = "";
  const frame = document.createElement("div");
  frame.className = "character-sprite-frame";
  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${state.player.spriteFramesPath}/frame_00.png`;
  sprite.alt = state.player.name ? `${state.player.name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${state.player.spriteFramesPath}`;
  sprite.dataset.previewScope = "caretaker";
  frame.append(sprite);
  equipmentSpriteSlot.append(frame);
  updateEquipment();
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
      const roll = Math.random();
      let next: number;
      if (roll < 0.1) {
        next = 8;
      } else if (roll < 0.2) {
        next = 7;
      } else if (roll < 0.32) {
        next = 2;
      } else {
        idleToggle = !idleToggle;
        next = idleToggle ? 1 : 0;
      }
      sprite.src = `${sprite.dataset.basePath}/frame_0${next}.png`;
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
  if (!canTrainNow()) {
    trainStatus.textContent = trainUnavailableReason() || "You can't train right now.";
    trainActive = false;
    updateTrainAvailability();
    return;
  }
  stopTraining();
  const existingProjectile = trainMenu.querySelector(".train-projectile");
  if (existingProjectile) {
    existingProjectile.remove();
  }
  trainProgress = 0;
  trainDirection = 1;
  trainActive = true;
  trainFill.style.width = "0%";
  trainStatus.textContent = `Press Space when the bar is between 80% and 100%. Hit for +${getTrainingStatGain()} to all combat stats (${getHomeTrainBoost()}/${HOME_TRAIN_BOOST_MAX}).`;
  renderTrainingSprite();
  trainTickerId = window.setInterval(() => {
    if (!trainActive) {
      return;
    }
    trainProgress += trainDirection * 4;
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

function handleTrainingHit() {
  if (trainMenu.classList.contains("hidden") || !trainActive) {
    return;
  }
  
  trainActive = false;
  stopTraining();
  
  let win = trainProgress >= 80 && trainProgress <= 100;
  let usedAutoSave = false;
  
  if (!win && state.trainingAutoSuccessCharges > 0) {
    state.trainingAutoSuccessCharges -= 1;
    win = true;
    usedAutoSave = true;
    updateEquipmentStatus();
  }
  
  playTrainingResult(win);
  
  const trainGain = getTrainingStatGain();
  const trainCountGain = getTrainingCountGain();
  
  if (win) {
    state.training += trainCountGain;
    if (trainGain > 0) {
      state.homeTrainBoost = getHomeTrainBoost() + trainGain;
    }
    // Check evo before weight loss so Weight 2 + first train can still trigger.
    checkEvolution();
    state.weight = Math.max(1, state.weight - 1);
    updateWeight();
    updateAttributes();
  }
  
  if (usedAutoSave) {
    trainStatus.textContent = `Saved by Ration Pack! All combat stats +${trainGain} (${getHomeTrainBoost()}/${HOME_TRAIN_BOOST_MAX}).`;
  } else {
    trainStatus.textContent = win
      ? `Success! Attack, Defense, Speed and Intelligence +${trainGain} (${getHomeTrainBoost()}/${HOME_TRAIN_BOOST_MAX}).`
      : "Missed! Try again.";
  }
  
  updateTrainAvailability();
}

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }
  event.preventDefault();
  handleTrainingHit();
});

const trainActionBtn = document.getElementById("train-action-btn");
if (trainActionBtn) {
  trainActionBtn.addEventListener("click", (event) => {
    event.preventDefault();
    handleTrainingHit();
  });
}
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
    const roll = Math.random();
    let next: number;
    if (roll < 0.1) {
      next = 8;
    } else if (roll < 0.2) {
      next = 7;
    } else if (roll < 0.32) {
      next = 2;
    } else {
      idleToggle = !idleToggle;
      next = idleToggle ? 1 : 0;
    }
    sprite.src = `${sprite.dataset.basePath}/frame_0${next}.png`;
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
  const unlockedIds = new Set(getUnlockedEggIds());
  const babies = getBabyICharacters();
  if (babies.length === 0) {
    return [];
  }
  const assignment = getOrCreateEggBabyMap();
  return EGG_DEFINITIONS.map((egg, index) => ({
    id: egg.id,
    label: egg.label,
    spriteFramesPath: egg.spriteFramesPath,
    locked: !unlockedIds.has(egg.id),
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

  // Official egg → Baby I from EGG_DEFINITIONS (source of truth).
  EGG_DEFINITIONS.forEach((egg) => {
    if (validBabyIds.has(egg.babyId)) {
      map[egg.id] = egg.babyId;
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
  const unlocked = new Set(getUnlockedEggIds());
  return EGG_DEFINITIONS.filter((egg) => unlocked.has(egg.id));
}

function getUnlockedEggIds(): string[] {
  const unlocked = readUnlockedEggIds();
  if (unlocked.length === 0) {
    const starter = ["egg-beta"];
    writeUnlockedEggIds(starter);
    return starter;
  }
  if (!unlocked.includes("egg-beta") && EGG_DEFINITIONS.some((egg) => egg.id === "egg-beta")) {
    const withBeta = ["egg-beta", ...unlocked];
    writeUnlockedEggIds(withBeta);
    return withBeta;
  }
  return unlocked;
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
  const unlocked = getUnlockedEggIds();
  const locked = EGG_DEFINITIONS.filter((egg) => !unlocked.includes(egg.id));
  if (locked.length === 0) {
    return null;
  }
  const pick = locked[Math.floor(Math.random() * locked.length)];
  writeUnlockedEggIds([...unlocked, pick.id]);
  return pick;
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
  if (state.currentZone && state.currentZone in ZONE_ENCOUNTERS) {
    return pickZoneOpponent(state.currentZone);
  }
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

function pickZoneOpponent(zoneId: string): Character {
  const config =
    zoneId in ZONE_ENCOUNTERS
      ? ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS]
      : null;
  if (!config) {
    return state.characters[0] || {};
  }
  const stageWeights = getZoneEncounterStageWeights(zoneId);
  const candidates = ENCOUNTER_STAGES.filter((stage) => {
    const weight = Number(stageWeights?.[stage]) || 0;
    return weight > 0 && getZoneStagePool(config, stage).length > 0;
  });
  let pickedStage: EncounterStage | null = null;
  if (candidates.length > 0) {
    const index = pickWeightedIndex(candidates.map((stage) => Number(stageWeights?.[stage]) || 0));
    pickedStage = index >= 0 ? candidates[index] : candidates[0];
  }
  if (!pickedStage) {
    // Fallback: first non-empty pool in stage order.
    pickedStage =
      ENCOUNTER_STAGES.find((stage) => getZoneStagePool(config, stage).length > 0) || null;
  }
  const poolEntries = pickedStage ? getZoneStagePool(config, pickedStage) : [];
  const pickedId = pickWeightedEncounterId(poolEntries);
  if (pickedId) {
    const found = state.characters.find((char) => String(char.id) === String(pickedId));
    if (found) {
      return found;
    }
  }
  return state.characters[0] || {};
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
  role?: BattleRole | "event"
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
      window.setTimeout(resolve, combatMs(400));
    }, combatMs(1000));
  });
}

function scheduleNextTurn() {
  if (battleTickerId) {
    window.clearTimeout(battleTickerId);
  }
  battleTickerId = window.setTimeout(runBattleTurn, combatMs(800));
}

async function runBattleTurn() {
  if (!state.battle) {
    return;
  }

  const attackerRole = state.battle.turn as BattleRole;
  const defenderRole: BattleRole = state.battle.turn === "player" ? "opponent" : "player";
  const attacker = (attackerRole === "player" ? state.player : state.opponent) || {};
  const attackerStatus = state.battle.status[attackerRole];

  if (attackerStatus?.asleep) {
    const bossSleepsUntilTimer =
      attackerRole === "opponent" && isBossBattle() && Boolean(state.battle.bossTimers);
    if (!bossSleepsUntilTimer) {
      attackerStatus.sleepTurns = Math.max(0, Number(attackerStatus.sleepTurns) || 0) + 1;
    }
    const wakeChance = bossSleepsUntilTimer ? 0 : getSleepWakeChance(attackerStatus.sleepTurns);
    if (!bossSleepsUntilTimer && Math.random() < wakeChance) {
      attackerStatus.asleep = false;
      attackerStatus.sleepTurns = 0;
      logBattle(`${attacker.name} woke up!`);
      updateStatusIcons();
    } else {
      logBattle(`${attacker.name} is asleep and can't move!`);
      updateStatusIcons();
      if (applyTurnAilmentDamage(attackerRole, attacker)) {
        return;
      }
      finalizeTurn(defenderRole);
      return;
    }
  }

  if (attackerStatus?.demoralized && Math.random() < 0.5) {
    logBattle(`${attacker.name} is too demoralized to attack!`);
    updateStatusIcons();
    if (applyTurnAilmentDamage(attackerRole, attacker)) {
      return;
    }
    finalizeTurn(defenderRole);
    return;
  }

  if (attackerStatus?.burned && Math.random() < 0.25) {
    logBattle(`${attacker.name} staggers from the burn and can't act!`);
    updateStatusIcons();
    if (applyTurnAilmentDamage(attackerRole, attacker)) {
      return;
    }
    finalizeTurn(defenderRole);
    return;
  }

  if (attackerStatus?.confused && Math.random() < 0.25) {
    applySelfDamage(attackerRole, attacker);
    applyLastStandIfNeeded();
    if (applyTurnAilmentDamage(attackerRole, attacker)) {
      return;
    }
    if (resolveBattleIfFinished()) {
      return;
    }
    finalizeTurn(defenderRole);
    return;
  }

  const defenderCharacter = defenderRole === "player" ? state.player : state.opponent;
  const attack = chooseAttack(attackerRole, attacker, defenderCharacter);
  const attackerStats = getCombatStats(attackerRole);
  const defenderStats = getCombatStats(defenderRole);
  let dodgeChance = getBlindedDodgeChance(attackerRole, getStatProcChance(defenderStats.speed));
  if (
    hasBattleStatus(defenderRole, "bound") ||
    hasBattleStatus(attackerRole, "reckless") ||
    hasBattleStatus(defenderRole, "reckless")
  ) {
    dodgeChance = 0;
  }
  const dodged = Math.random() < dodgeChance;
  await animateAttack(attackerRole, defenderRole, attacker, attack, !dodged);

  if (dodged) {
    logBattle(`${defenderCharacter?.name || "Foe"} dodged the attack!`);
    if (applyDeepWoundOnDodge(defenderRole, defenderCharacter)) {
      return;
    }
  } else {
    let damage = Math.max(1, attackerStats.attack - defenderStats.defense);
    if (attack.isCritical) {
      damage *= 2;
      if (attackerRole === "player") {
        const gear = getEquippedGear() as { criticalDamageBonus?: number } | undefined;
        const critBonus = Number(gear?.criticalDamageBonus) || 0;
        if (critBonus > 0) {
          damage = Math.max(1, Math.round(damage * (1 + critBonus)));
        }
      }
    }
    if (attack.isSpecial) {
      logBattle(`${attacker.name} used ${attack.displayName || "Special Attack"}!`);
    } else if (attack.isCritical) {
      logBattle(`${attacker.name} landed a Critical Hit!`);
    }
    if (attack.oneHitKO) {
      damage = defenderRole === "opponent" ? state.battle.opponentHp : state.battle.playerHp;
    }
    const reflected =
      hasBattleStatus(defenderRole, "reflector") && Math.random() < 0.33;
    if (reflected) {
      const dealt = dealCombatDamage(attackerRole, damage, true);
      logBattle(
        `${defenderCharacter?.name || "Foe"} reflects the attack back for ${dealt} damage!`
      );
      if (attack.heal) {
        applyHeal(attackerRole, attacker, attack.heal);
      }
      if (attack.selfStatus && attack.selfStatus !== "none") {
        applyBattleEffect(attackerRole, attack.selfStatus, attack.selfStatusChance);
      }
    } else {
      const dealt = dealCombatDamage(defenderRole, damage, true);
      if (attack.heal) {
        applyHeal(attackerRole, attacker, attack.heal);
        applyLastStandIfNeeded();
        if (resolveBattleIfFinished()) {
          return;
        }
      }
      if (
        attack.name === "special attack" &&
        attackerRole === "player" &&
        state.battle.echoShellReady?.player
      ) {
        state.battle.echoShellReady.player = false;
        const echoDamage = Math.max(0, Math.ceil(damage * 0.5));
        const echoDealt = dealCombatDamage("opponent", echoDamage, true);
        logBattle(`Echo Shell repeats the attack for ${echoDealt} damage!`);
        applyVampirismHeal(attackerRole, attacker, echoDealt);
      }
      const attackLabel = attack.isSpecial
        ? attack.displayName || "Special Attack"
        : attack.isCritical
          ? "Critical Hit"
          : "Attack";
      logBattle(`${attacker.name}'s ${attackLabel} dealt ${dealt} damage!`);
      applyVampirismHeal(attackerRole, attacker, dealt);
      if (attack.status && attack.status !== "none") {
        applyBattleEffect(defenderRole, attack.status, attack.statusChance);
      }
      if (attack.selfStatus && attack.selfStatus !== "none") {
        applyBattleEffect(attackerRole, attack.selfStatus, attack.selfStatusChance);
      }
      if (attackerRole === "player") {
        const gear = getEquippedGear() as
          | {
              onHitEffect?: { status: string; chance: number; target?: "self" | "opponent" };
              onHitEffects?: ReadonlyArray<{
                status: string;
                chance: number;
                target?: "self" | "opponent";
              }>;
              name?: string;
            }
          | undefined;
        const hitEffects = [
          ...(gear?.onHitEffect ? [gear.onHitEffect] : []),
          ...(gear?.onHitEffects ?? []),
        ];
        hitEffects.forEach((effect) => {
          if (!effect?.status) {
            return;
          }
          const targetRole = effect.target === "self" ? "player" : "opponent";
          applyBattleEffect(targetRole, effect.status, effect.chance);
        });
      }
      applyUniqueThorns(defenderRole, attackerRole, dealt, defenderCharacter?.name);
      if (defenderRole === "player") {
        const gear = getEquippedGear() as { thorns?: number; name?: string } | undefined;
        const thorns = Number(gear?.thorns) || 0;
        if (thorns > 0 && state.battle.opponentHp > 0) {
          const scorched = dealCombatDamage("opponent", thorns, true);
          logBattle(`${gear?.name || "Armor"} scorches ${attacker.name} for ${scorched} damage!`);
        }
      }
      if (hasBattleStatus(attackerRole, "drained")) {
        const attackerHp = attackerRole === "player" ? state.battle.playerHp : state.battle.opponentHp;
        if (attackerHp > 0) {
          const drained = dealCombatDamage(attackerRole, 1, false);
          logBattle(`${attacker.name} is drained for ${drained} damage!`);
        }
      }
    }
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
  }

  if (attackerRole === "player") {
    const gear = getEquippedGear() as { selfDamageOnAttack?: number; name?: string } | undefined;
    const recoil = Number(gear?.selfDamageOnAttack) || 0;
    if (recoil > 0 && state.battle.playerHp > 0) {
      const selfDealt = dealCombatDamage("player", recoil, false);
      logBattle(`${gear?.name || "Arsenal"} recoils for ${selfDealt} damage!`);
    }
  }

  if (applyTurnAilmentDamage(attackerRole, attacker)) {
    return;
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
  state.battle.status.player = createEmptyBattleStatus();
  if (state.battle.statMods) {
    state.battle.statMods.player = createEmptyStatMods();
  }
  if (state.gearUpActive) {
    applyGearUpBuffs();
  }
  battlePlayerHp.textContent = "HP: 1";
  updateStatusIcons();
  updateEquipmentStatus();
  state.battle.extraTurnQueued = "player";
  logBattle(`${state.player.name} rises again with Last Stand Emblem!`);
}

function resolveBattleIfFinished(): boolean {
  if (!state.battle || (state.battle.playerHp > 0 && state.battle.opponentHp > 0)) {
    return false;
  }
  const playerWon = state.battle.playerHp > 0;
  const winner = playerWon ? state.player.name : state.opponent.name;
  const opponentId = state.opponent?.id ? String(state.opponent.id) : null;
  const isEventFight = Boolean(state.eventBattleOverride);
  logBattle(`${winner} wins!`);
  if (state.finalChallenge) {
    state.finalChallenge = false;
    endBattle();
    battleScreen.classList.add("hidden");
    showEndScreen(playerWon);
    return true;
  }
  if (state.eventBattleOverride) {
    if (playerWon && state.eventBattleOverride.rewardOnWin) {
      const reward = state.eventBattleOverride.rewardOnWin;
      const amount = reward.amount || 1;
      const isKeyItem = KEY_ITEMS_CONFIG.some((item) => item.key === reward.key);
      const name = reward.label || reward.key;
      if (isKeyItem) {
        const added = grantKeyItem(reward.key, amount, name, true);
        if (added > 0) {
          queueDropNotice(name, added, resolveDropIcon("keyItem", reward.key));
        }
      } else {
        const added = grantInventoryItem(reward.key, amount, name, true);
        if (added > 0) {
          queueDropNotice(name, added, resolveDropIcon("inventory", reward.key));
        }
      }
    }
    if (playerWon && typeof state.eventBattleOverride.reputationOnWin === "number") {
      const gain = state.eventBattleOverride.reputationOnWin;
      state.reputation = Math.max(0, (state.reputation || 0) + gain);
      logBattle(`Reputation +${gain}.`);
      updateFinalChallengeAvailability();
    }
    if (playerWon && state.eventBattleOverride.dropsOnWin?.length) {
      attemptEnemyDrops(state.eventBattleOverride.dropsOnWin);
    }
    if (playerWon && state.eventBattleOverride.incrementEventWinsOnWin && state.activeEvent?.id) {
      const wins = incrementEventWinCount(state.activeEvent.id);
      logBattle(`Sparring record: ${wins} win${wins === 1 ? "" : "s"}.`);
    }
    if (playerWon && state.eventBattleOverride.banForeverOnWin && state.activeEvent?.id) {
      banEventForever(state.activeEvent.id);
      consumeZoneEvent(state.activeEvent.id);
    }
    state.eventBattleOverride = null;
  }
  if (state.zoneBossFight) {
    if (playerWon) {
      state.zoneBossVictory = true;
      markZoneBossDefeated(state.currentZone);
      if (state.zoneBossFight?.opponentId) {
        markBossOpponentDefeated(state.zoneBossFight.opponentId);
      }
      state.reputation = Math.max(0, (state.reputation || 0) + 1);
      attemptEnemyDrops(state.zoneBossFight.drops);
      const unlocked = unlockZones(state.zoneBossFight.unlockZones || []);
      if (unlocked.length > 0) {
        const names = unlocked
          .map((id) => ZONE_CONFIG.find((zone) => zone.id === id)?.name || id)
          .join(", ");
        logBattle(`Boss defeated! New paths unlocked: ${names}. Return Home.`);
      } else {
        logBattle("Boss defeated! Return Home.");
      }
    }
    state.zoneBossFight = null;
  } else if (playerWon && state.currentZone && !isEventFight && opponentId) {
    attemptEnemyDrops(getZoneEncounterDrops(state.currentZone, opponentId));
    attemptWildWinItemDrop();
  }
  if (state.mode === "history") {
    updateWinRate(playerWon);
    state.battlesForEvolution += 1;
    if (!playerWon) {
      state.lives = Math.max(0, state.lives - 1);
      updateLivesDisplay();
      logBattle(`Lives remaining: ${state.lives}`);
      if (state.lives <= 0) {
        if (battleTickerId) {
          window.clearTimeout(battleTickerId);
          battleTickerId = null;
        }
        state.battle.ended = true;
        playBattleEnd(false);
        pendingDropNotices = [];
        window.setTimeout(() => {
          endBattle();
          battleScreen.classList.add("hidden");
          advanceBgCalendarAfterZoneRun();
          state.currentZone = null;
          state.zoneLevel = 0;
          state.zoneRunHp = null;
          state.zoneEventChance = 0;
          state.consumedEventIds = [];
          state.activeEvent = null;
          state.eventBattleOverride = null;
          state.zoneBossFight = null;
          state.zoneBossFoughtThisRun = false;
          state.zoneBossVictory = false;
          state.gearUpActive = false;
          showEndScreen(false);
        }, combatMs(1600));
        return true;
      }
    }
  }
  if (battleTickerId) {
    window.clearTimeout(battleTickerId);
    battleTickerId = null;
  }
  state.battle.ended = true;
  if (state.currentZone) {
    if (playerWon) {
      state.zoneRunHp = state.battle.playerHp;
      applyEquippedPostCombatHeal();
    } else {
      state.zoneRunHp = 0;
    }
  }
  playBattleEnd(playerWon);
  const dropSource = state.opponent?.name || "The enemy";
  const notices = takePendingDropNotices();
  const finishAfterLoot = () => {
    if (state.mode === "history" && state.lives > 0 && checkEvolution()) {
      hideZonePostBattleActions();
      return;
    }
    if (
      isEventFight &&
      playerWon &&
      state.currentZone &&
      state.activeEvent?.resumeNodeId &&
      state.activeEvent.id
    ) {
      const resumeId = state.activeEvent.resumeNodeId;
      state.activeEvent.resumeNodeId = undefined;
      hideZonePostBattleActions();
      window.setTimeout(() => {
        endBattle();
        battleScreen.classList.add("hidden");
        const eventDef = findActiveZoneEventDefinition();
        if (eventDef) {
          showZoneEventDialogue(eventDef, resumeId);
          return;
        }
        if (state.activeEvent) {
          finishActiveEvent();
        }
        showZonePostBattleActions(true);
      }, combatMs(900));
      return;
    }
    if (isEventFight && state.activeEvent && !state.activeEvent.resumeNodeId) {
      finishActiveEvent();
    }
    if (state.currentZone) {
      showZonePostBattleActions(playerWon);
    } else {
      hideZonePostBattleActions();
      battleDefaultActions.classList.remove("hidden");
    }
  };
  if (playerWon && notices.length) {
    void showDropPopup(notices, dropSource).then(finishAfterLoot);
    return true;
  }
  finishAfterLoot();
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
  tickBossRecoveries(state.battle.turn as BattleRole);
  if (state.battle.extraTurnQueued) {
    state.battle.turn = state.battle.extraTurnQueued;
    state.battle.extraTurnQueued = null;
    scheduleNextTurn();
    return;
  }
  state.battle.turn = nextRole;
  scheduleNextTurn();
}

function createEmptyBattleStatus() {
  return {
    asleep: false,
    sleepTurns: 0,
    confused: false,
    poisoned: false,
    demoralized: false,
    silenced: false,
    blinded: false,
    inverted: false,
    burned: false,
    cursed: false,
    marked: false,
    drained: false,
    bound: false,
    negativepole: false,
    deepwound: false,
    infatuated: false,
    vampirism: false,
    thorns: false,
    reflector: false,
    immune: false,
    reckless: false,
    positivepole: false,
  };
}

function isBossBattle(): boolean {
  return Boolean(state.zoneBossFight || state.finalChallenge);
}

type BossStatusTimerKey =
  | "asleep"
  | "poisoned"
  | "confused"
  | "demoralized"
  | "silenced"
  | "blinded"
  | "inverted"
  | "burned"
  | UniqueDebuffId
  | UniqueBuffId;

function ensureBossTimers() {
  if (!state.battle || !isBossBattle()) {
    return null;
  }
  if (!state.battle.bossTimers) {
    state.battle.bossTimers = { status: {}, debuff: {} };
  }
  return state.battle.bossTimers as {
    status: Partial<Record<BossStatusTimerKey, number>>;
    debuff: Partial<Record<StatModKey, number>>;
  };
}

function rollBossStatusTurns(): number {
  return Math.random() < 0.5 ? 2 : 3;
}

function rollBossDebuffTurns(): number {
  return Math.random() < 0.5 ? 3 : 4;
}

function armBossStatusTimer(role: BattleRole, key: BossStatusTimerKey) {
  if (role !== "opponent") {
    return;
  }
  const timers = ensureBossTimers();
  if (!timers) {
    return;
  }
  timers.status[key] = rollBossStatusTurns();
}

function armBossDebuffTimer(role: BattleRole, stat: StatModKey) {
  if (role !== "opponent") {
    return;
  }
  const timers = ensureBossTimers();
  if (!timers) {
    return;
  }
  timers.debuff[stat] = rollBossDebuffTurns();
}

function clearBossDebuffTimer(role: BattleRole, stat: StatModKey) {
  if (role !== "opponent" || !state.battle?.bossTimers) {
    return;
  }
  delete state.battle.bossTimers.debuff[stat];
}

function tickBossRecoveries(finishedRole: BattleRole) {
  if (finishedRole !== "opponent" || !isBossBattle() || !state.battle?.bossTimers) {
    return;
  }
  const name = state.opponent?.name || "The boss";
  const timers = state.battle.bossTimers as {
    status: Partial<Record<BossStatusTimerKey, number>>;
    debuff: Partial<Record<StatModKey, number>>;
  };
  const status = state.battle.status.opponent;
  const statusRecoveries: Record<BossStatusTimerKey, string> = {
    asleep: "woke up",
    poisoned: "recovered from poison",
    confused: "snapped out of confusion",
    demoralized: "recovered from demoralization",
    silenced: "can use special attacks again",
    blinded: "can see clearly again",
    inverted: "healing returns to normal",
    burned: "is no longer Burned",
    cursed: "is no longer Cursed",
    marked: "is no longer Marked",
    drained: "is no longer Drained",
    bound: "is no longer Bound",
    negativepole: "is no longer affected by Negative Pole",
    deepwound: "is no longer affected by Deep Wound",
    infatuated: "is no longer Infatuated",
    vampirism: "no longer has Vampirism",
    thorns: "no longer has Thorns",
    reflector: "no longer has Reflector",
    immune: "no longer has Immune",
    reckless: "no longer has Reckless",
    positivepole: "no longer has Positive Pole",
  };
  (Object.keys(timers.status) as BossStatusTimerKey[]).forEach((key) => {
    const left = Number(timers.status[key]);
    if (!Number.isFinite(left)) {
      return;
    }
    const next = left - 1;
    if (next > 0) {
      timers.status[key] = next;
      return;
    }
    delete timers.status[key];
    if (key === "asleep") {
      status.asleep = false;
      status.sleepTurns = 0;
    } else {
      status[key] = false;
    }
    logBattle(`${name} ${statusRecoveries[key]}!`);
  });
  const debuffRecoveries: Record<StatModKey, string> = {
    attack: "is no longer weakened",
    defense: "is no longer exposed",
    speed: "is no longer slowed",
    intelligence: "is no longer distracted",
  };
  (Object.keys(timers.debuff) as StatModKey[]).forEach((stat) => {
    const left = Number(timers.debuff[stat]);
    if (!Number.isFinite(left)) {
      return;
    }
    const next = left - 1;
    if (next > 0) {
      timers.debuff[stat] = next;
      return;
    }
    delete timers.debuff[stat];
    if (state.battle.statMods?.opponent) {
      state.battle.statMods.opponent.debuff[stat] = false;
    }
    logBattle(`${name} ${debuffRecoveries[stat]}!`);
  });
  updateStatusIcons();
}

function createEmptyStatMods() {
  return {
    buff: {
      attack: false,
      defense: false,
      speed: false,
      intelligence: false,
    },
    debuff: {
      attack: false,
      defense: false,
      speed: false,
      intelligence: false,
    },
  };
}

function getBattleStatMods(role: BattleRole) {
  if (!state.battle.statMods) {
    state.battle.statMods = {
      player: createEmptyStatMods(),
      opponent: createEmptyStatMods(),
    };
  }
  return state.battle.statMods[role];
}

function hasBattleStatus(
  role: BattleRole,
  key: Exclude<keyof ReturnType<typeof createEmptyBattleStatus>, "sleepTurns">
): boolean {
  return Boolean(state.battle?.status?.[role]?.[key]);
}

function formatZoneStatLabel(stat: string): string {
  if (stat === "attack") {
    return "Attack";
  }
  if (stat === "defense") {
    return "Defense";
  }
  if (stat === "speed") {
    return "Speed";
  }
  if (stat === "intelligence") {
    return "Intelligence";
  }
  return stat;
}

function applyRandomZoneDebuffs(count: number): Array<"attack" | "defense" | "speed" | "intelligence"> {
  const stats = ["attack", "defense", "speed", "intelligence"] as const;
  if (!state.zoneRunDebuffs) {
    state.zoneRunDebuffs = {
      attack: false,
      defense: false,
      speed: false,
      intelligence: false,
    };
  }
  const unused = stats.filter((stat) => !state.zoneRunDebuffs[stat]);
  if (unused.length === 0) {
    return [];
  }
  const pool = [...unused];
  const picked: Array<"attack" | "defense" | "speed" | "intelligence"> = [];
  const need = Math.max(0, Math.min(count, pool.length));
  while (picked.length < need && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  picked.forEach((stat) => {
    state.zoneRunDebuffs[stat] = true;
    if (state.battle?.statMods && !hasDebuffImmunity(stat)) {
      getBattleStatMods("player").debuff[stat] = true;
    }
  });
  if (picked.length > 0) {
    updateStatusIcons();
  }
  return picked;
}

function applyGearUpBuffs() {
  if (!state.battle?.statMods) {
    return;
  }
  const mods = getBattleStatMods("player");
  mods.buff.attack = true;
  mods.buff.defense = true;
  mods.buff.speed = true;
  mods.buff.intelligence = true;
  updateStatusIcons();
}

function applyZoneRunBuffsToBattle() {
  if (!state.battle?.statMods) {
    return;
  }
  const buffs = state.zoneRunBuffs || {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  const debuffs = state.zoneRunDebuffs || {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  const labels: string[] = [];
  (["attack", "defense", "speed", "intelligence"] as const).forEach((stat) => {
    if (buffs[stat]) {
      state.battle.statMods.player.buff[stat] = true;
      labels.push(`${stat} up`);
    }
    if (debuffs[stat]) {
      if (hasDebuffImmunity(stat)) {
        return;
      }
      state.battle.statMods.player.debuff[stat] = true;
      labels.push(`${stat} down`);
    }
  });
  if (labels.length > 0) {
    logBattle(`Zone effects active: ${labels.join(", ")}.`);
    updateStatusIcons();
  }
}

function applyPlayerStartDebuffs(
  debuffs: ReadonlyArray<"slow" | "weak" | "exposed" | "distracted" | "demoralized">
) {
  if (!state.battle) {
    return;
  }
  debuffs.forEach((debuff) => {
    applyBattleEffect("player", debuff, 1);
  });
  if (debuffs.includes("slow")) {
    logBattle("Petrification slows your body!");
  }
  updateStatusIcons();
}

function applyOpponentStartBuffs(
  buffs: true | ReadonlyArray<"fortified" | "protected" | "swift" | "focused">
) {
  if (!state.battle?.statMods) {
    return;
  }
  const list =
    buffs === true ? (["fortified", "protected", "swift", "focused"] as const) : buffs;
  list.forEach((buff) => {
    const resolved = resolveStatModEffect(buff);
    if (!resolved || resolved.value <= 0) {
      return;
    }
    state.battle.statMods.opponent.buff[resolved.stat] = true;
  });
  logBattle(`${state.opponent?.name || "The foe"} starts fully buffed!`);
  updateStatusIcons();
}

type StatModKey = "attack" | "defense" | "speed" | "intelligence";

function resolveStatModEffect(
  effect: string
): { stat: StatModKey; value: -1 | 1; label: string } | null {
  const normalized = String(effect || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const map: Record<string, { stat: StatModKey; value: -1 | 1; label: string }> = {
    fortified: { stat: "attack", value: 1, label: "fortified" },
    fortalecido: { stat: "attack", value: 1, label: "fortified" },
    protected: { stat: "defense", value: 1, label: "protected" },
    protegido: { stat: "defense", value: 1, label: "protected" },
    swift: { stat: "speed", value: 1, label: "swift" },
    veloz: { stat: "speed", value: 1, label: "swift" },
    focused: { stat: "intelligence", value: 1, label: "focused" },
    concentrado: { stat: "intelligence", value: 1, label: "focused" },
    weak: { stat: "attack", value: -1, label: "weakened" },
    debil: { stat: "attack", value: -1, label: "weakened" },
    exposed: { stat: "defense", value: -1, label: "exposed" },
    desprotegido: { stat: "defense", value: -1, label: "exposed" },
    slow: { stat: "speed", value: -1, label: "slowed" },
    lentitud: { stat: "speed", value: -1, label: "slowed" },
    lento: { stat: "speed", value: -1, label: "slowed" },
    distracted: { stat: "intelligence", value: -1, label: "distracted" },
    distraido: { stat: "intelligence", value: -1, label: "distracted" },
  };
  return map[normalized] || null;
}

function applyBattleStatMods(role: BattleRole, stats: CombatStats): CombatStats {
  const mods = getEffectiveStatMods(role);
  const scale = (value: number, buffed: boolean, debuffed: boolean) => {
    let next = value;
    if (buffed) {
      next = Math.max(0, Math.round(Number(next) * 1.25));
    }
    if (debuffed) {
      next = Math.max(0, Math.round(Number(next) * 0.75));
    }
    return next;
  };
  return {
    hp: stats.hp,
    attack: scale(stats.attack, mods.buff.attack, mods.debuff.attack),
    defense: scale(stats.defense, mods.buff.defense, mods.debuff.defense),
    speed: scale(stats.speed, mods.buff.speed, mods.debuff.speed),
    intelligence: scale(stats.intelligence, mods.buff.intelligence, mods.debuff.intelligence),
  };
}

function getEffectiveStatMods(role: BattleRole) {
  const mods = state.battle?.statMods?.[role] || createEmptyStatMods();
  const negative = hasBattleStatus(role, "negativepole");
  const positive = hasBattleStatus(role, "positivepole");
  const channel = (rawBuff: boolean, rawDebuff: boolean) => {
    if (negative && positive) {
      return { buff: rawDebuff, debuff: rawBuff };
    }
    if (negative) {
      return { buff: false, debuff: rawDebuff || rawBuff };
    }
    if (positive) {
      return { buff: rawBuff || rawDebuff, debuff: false };
    }
    return { buff: rawBuff, debuff: rawDebuff };
  };
  const attack = channel(mods.buff.attack, mods.debuff.attack);
  const defense = channel(mods.buff.defense, mods.debuff.defense);
  const speed = channel(mods.buff.speed, mods.debuff.speed);
  const intelligence = channel(mods.buff.intelligence, mods.debuff.intelligence);
  return {
    buff: {
      attack: attack.buff,
      defense: defense.buff,
      speed: speed.buff,
      intelligence: intelligence.buff,
    },
    debuff: {
      attack: attack.debuff,
      defense: defense.debuff,
      speed: speed.debuff,
      intelligence: intelligence.debuff,
    },
  };
}

function getSleepWakeChance(sleepTurns: number): number {
  if (sleepTurns <= 1) {
    return 0.1;
  }
  if (sleepTurns === 2) {
    return 0.4;
  }
  if (sleepTurns === 3) {
    return 0.7;
  }
  return 1;
}

function dealCombatDamage(role: BattleRole, amount: number, isAttackDamage: boolean) {
  if (!state.battle) {
    return 0;
  }
  let damage = Math.max(0, Math.floor(Number(amount) || 0));
  if (isAttackDamage && hasBattleStatus(role, "marked")) {
    damage = Math.max(1, Math.ceil(damage * 1.5));
  }
  if (role === "player") {
    state.battle.playerHp = Math.max(0, state.battle.playerHp - damage);
    battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  } else {
    state.battle.opponentHp = Math.max(0, state.battle.opponentHp - damage);
    battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
  }
  return damage;
}

function applyBattleEffect(
  role: BattleRole,
  effect: string,
  explicitChance?: number,
  guaranteed = false
) {
  if (!effect || effect === "none") {
    return;
  }
  if (resolveStatModEffect(effect)) {
    applyStatMod(role, effect, explicitChance);
    return;
  }
  const unique = resolveUniqueEffect(effect);
  if (unique?.kind === "buff") {
    applyUniqueEffect(role, effect, explicitChance, guaranteed);
    return;
  }
  applyStatus(role, effect, explicitChance, guaranteed);
}

function applyUniqueEffect(
  role: BattleRole,
  effect: string,
  explicitChance?: number,
  guaranteed = false
) {
  if (!state.battle) {
    return;
  }
  const resolved = resolveUniqueEffect(effect);
  if (!resolved || resolved.kind !== "buff") {
    return;
  }
  const name = role === "player" ? state.player?.name : state.opponent?.name;
  let applyChance = typeof explicitChance === "number" ? explicitChance : 1;
  if (!guaranteed && role === "opponent" && isBossBattle()) {
    applyChance *= 0.5;
  }
  if (Math.random() > Math.min(1, applyChance)) {
    return;
  }
  const target = state.battle.status[role];
  if (!target) {
    return;
  }
  target[resolved.id] = true;
  armBossStatusTimer(role, resolved.id);
  logBattle(`${name} has ${resolved.label}!`);
  if (resolved.id === "immune") {
    const hadStatus = clearNegativeStatuses(role);
    if (hadStatus) {
      logBattle(`${name}'s statuses fade!`);
    }
  }
  updateStatusIcons();
}

function clearNegativeStatuses(role: BattleRole): boolean {
  const target = state.battle?.status?.[role];
  if (!target) {
    return false;
  }
  const hadStatus = Boolean(
    target.asleep ||
      target.confused ||
      target.poisoned ||
      target.demoralized ||
      target.silenced ||
      target.blinded ||
      target.inverted ||
      target.burned ||
      target.cursed ||
      target.marked ||
      target.drained ||
      target.bound ||
      target.negativepole ||
      target.deepwound ||
      target.infatuated
  );
  target.asleep = false;
  target.sleepTurns = 0;
  target.confused = false;
  target.poisoned = false;
  target.demoralized = false;
  target.silenced = false;
  target.blinded = false;
  target.inverted = false;
  target.burned = false;
  target.cursed = false;
  target.marked = false;
  target.drained = false;
  target.bound = false;
  target.negativepole = false;
  target.deepwound = false;
  target.infatuated = false;
  return hadStatus;
}

function clearStatDebuffs(role: BattleRole): boolean {
  const mods = state.battle?.statMods?.[role];
  if (!mods?.debuff) {
    return false;
  }
  const hadDebuff = Boolean(
    mods.debuff.attack || mods.debuff.defense || mods.debuff.speed || mods.debuff.intelligence
  );
  mods.debuff.attack = false;
  mods.debuff.defense = false;
  mods.debuff.speed = false;
  mods.debuff.intelligence = false;
  return hadDebuff;
}

function cleansePlayerDebuffs() {
  if (!state.zoneRunDebuffs) {
    state.zoneRunDebuffs = {
      attack: false,
      defense: false,
      speed: false,
      intelligence: false,
    };
  } else {
    state.zoneRunDebuffs.attack = false;
    state.zoneRunDebuffs.defense = false;
    state.zoneRunDebuffs.speed = false;
    state.zoneRunDebuffs.intelligence = false;
  }
  if (state.battle && state.battle.ended !== true) {
    clearNegativeStatuses("player");
    clearStatDebuffs("player");
    updateStatusIcons();
  }
  updateAttributes();
}

function applyStatMod(role: BattleRole, effect: string, explicitChance?: number) {
  if (!state.battle) {
    return;
  }
  const resolved = resolveStatModEffect(effect);
  if (!resolved) {
    return;
  }
  if (role === "player" && resolved.value < 0 && hasDebuffImmunity(resolved.stat)) {
    const gear = getEquippedGear() as { name?: string } | undefined;
    logBattle(`${state.player?.name || "You"} resist the debuff with ${gear?.name || "equipment"}!`);
    return;
  }
  const applyChance = typeof explicitChance === "number" ? explicitChance : 1;
  if (Math.random() > Math.min(1, applyChance)) {
    return;
  }
  if (!state.battle.statMods) {
    state.battle.statMods = {
      player: createEmptyStatMods(),
      opponent: createEmptyStatMods(),
    };
  }
  state.battle.statMods[role][resolved.value > 0 ? "buff" : "debuff"][resolved.stat] = true;
  if (resolved.value < 0) {
    armBossDebuffTimer(role, resolved.stat);
  }
  const name = role === "player" ? state.player?.name : state.opponent?.name;
  logBattle(`${name} is ${resolved.label}!`);
  updateStatusIcons();
}

function hasDebuffImmunity(stat?: "attack" | "defense" | "speed" | "intelligence"): boolean {
  const gear = getEquippedGear() as {
    debuffImmune?: boolean;
    statDebuffImmunities?: readonly string[];
  } | undefined;
  if (gear?.debuffImmune) {
    return true;
  }
  if (stat && gear?.statDebuffImmunities?.includes(stat)) {
    return true;
  }
  return false;
}

/** Canonical English key for equipment status-immunity matching. */
function normalizeStatusImmunityKey(status: string): string {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (normalized === "sleep" || normalized === "asleep" || normalized === "dormido") {
    return "asleep";
  }
  if (normalized === "poison" || normalized === "poisoned") {
    return "poisoned";
  }
  if (normalized === "confuse" || normalized === "confused" || normalized === "confuso") {
    return "confused";
  }
  if (
    normalized === "demoralize" ||
    normalized === "demoralized" ||
    normalized === "desmoralizado"
  ) {
    return "demoralized";
  }
  if (normalized === "silence" || normalized === "silenced" || normalized === "silenciado") {
    return "silenced";
  }
  if (normalized === "blind" || normalized === "blinded" || normalized === "cegado") {
    return "blinded";
  }
  if (normalized === "invert" || normalized === "inverted" || normalized === "invertido") {
    return "inverted";
  }
  if (normalized === "burn" || normalized === "burned" || normalized === "quemado") {
    return "burned";
  }
  const unique = resolveUniqueEffect(status);
  if (unique?.kind === "debuff") {
    return unique.id;
  }
  return normalized;
}

function applyStatus(
  defenderRole: BattleRole,
  status: string,
  explicitChance?: number,
  guaranteed = false
) {
  if (!status || status === "none" || !state.battle) {
    return;
  }
  const defenderName =
    defenderRole === "player" ? state.player?.name : state.opponent?.name;
  if (state.battle.statusImmune?.[defenderRole]) {
    logBattle(`${defenderName} is immune to status effects!`);
    return;
  }
  if (hasBattleStatus(defenderRole, "immune")) {
    logBattle(`${defenderName} is immune to status effects!`);
    return;
  }
  const normalized = String(status).toLowerCase();
  if (defenderRole === "player" && hasDebuffImmunity()) {
    logBattle(`${defenderName} resists with Fur Coat!`);
    return;
  }
  if (defenderRole === "player") {
    const gear = getEquippedGear() as { statusImmunities?: readonly string[]; name?: string } | undefined;
    const statusKey = normalizeStatusImmunityKey(normalized);
    if (
      gear?.statusImmunities?.some(
        (entry) => normalizeStatusImmunityKey(String(entry)) === statusKey
      )
    ) {
      logBattle(`${defenderName} resists with ${gear.name || "equipment"}!`);
      return;
    }
  }
  if (state.battle.statusShield?.[defenderRole]) {
    state.battle.statusShield[defenderRole] = false;
    logBattle(`${defenderName} blocks the status with Aegis Charm!`);
    return;
  }
  let applyChance = typeof explicitChance === "number" ? explicitChance : 1;
  if (typeof explicitChance !== "number" && defenderRole === "opponent") {
    if (normalized === "sleep" || normalized === "asleep" || normalized === "dormido") {
      applyChance += state.battle.statusBonus?.sleep || 0;
    } else if (normalized === "poison" || normalized === "poisoned") {
      applyChance += state.battle.statusBonus?.poison || 0;
    } else if (normalized === "confuse" || normalized === "confused") {
      applyChance += state.battle.statusBonus?.confuse || 0;
    } else if (
      normalized === "demoralize" ||
      normalized === "demoralized" ||
      normalized === "desmoralizado"
    ) {
      applyChance += state.battle.statusBonus?.demoralize || 0;
    }
  }
  if (!guaranteed && defenderRole === "opponent" && isBossBattle()) {
    applyChance *= 0.5;
  }
  if (Math.random() > Math.min(1, applyChance)) {
    return;
  }
  const target = state.battle.status[defenderRole];
  if (!target) {
    return;
  }
  if (normalized === "sleep" || normalized === "asleep" || normalized === "dormido") {
    target.asleep = true;
    target.sleepTurns = 0;
    armBossStatusTimer(defenderRole, "asleep");
    logBattle(`${defenderName} fell asleep!`);
  } else if (normalized === "confuse" || normalized === "confused") {
    target.confused = true;
    armBossStatusTimer(defenderRole, "confused");
    logBattle(`${defenderName} is confused!`);
  } else if (normalized === "poison" || normalized === "poisoned") {
    target.poisoned = true;
    armBossStatusTimer(defenderRole, "poisoned");
    logBattle(`${defenderName} is poisoned!`);
  } else if (
    normalized === "demoralize" ||
    normalized === "demoralized" ||
    normalized === "desmoralizado"
  ) {
    target.demoralized = true;
    armBossStatusTimer(defenderRole, "demoralized");
    logBattle(`${defenderName} is demoralized!`);
  } else if (
    normalized === "silence" ||
    normalized === "silenced" ||
    normalized === "silenciado"
  ) {
    target.silenced = true;
    armBossStatusTimer(defenderRole, "silenced");
    logBattle(`${defenderName} is silenced!`);
  } else if (normalized === "blind" || normalized === "blinded" || normalized === "cegado") {
    target.blinded = true;
    armBossStatusTimer(defenderRole, "blinded");
    logBattle(`${defenderName} is blinded!`);
  } else if (
    normalized === "invert" ||
    normalized === "inverted" ||
    normalized === "invertido"
  ) {
    target.inverted = true;
    armBossStatusTimer(defenderRole, "inverted");
    logBattle(`${defenderName} is inverted!`);
  } else if (normalized === "burn" || normalized === "burned" || normalized === "quemado") {
    target.burned = true;
    armBossStatusTimer(defenderRole, "burned");
    logBattle(`${defenderName} is burned!`);
  } else {
    const unique = resolveUniqueEffect(status);
    if (unique?.kind === "debuff") {
      target[unique.id] = true;
      armBossStatusTimer(defenderRole, unique.id);
      logBattle(`${defenderName} is ${unique.label}!`);
      if (unique.id === "cursed" && defenderRole === "player") {
        logBattle("Equipment stat bonuses are inverted!");
      }
    }
  }
  updateStatusIcons();
}

function applySelfDamage(role: BattleRole, attacker: Character) {
  const stats = getCombatStats(role);
  const damage = Math.max(1, stats.attack - stats.defense);
  const dealt = dealCombatDamage(role, damage, true);
  logBattle(`${attacker.name} hurts itself in confusion for ${dealt} damage!`);
}

function applyPoison(role: BattleRole, attacker: Character) {
  const maxHp = getCombatStats(role).hp;
  const damage = Math.max(1, Math.ceil(maxHp * 0.05));
  dealCombatDamage(role, damage, false);
  logBattle(`${attacker.name} takes ${damage} poison damage!`);
}

function applyBurn(role: BattleRole, attacker: Character) {
  const damage = dealCombatDamage(role, 1, false);
  logBattle(`${attacker.name} takes ${damage} burn damage!`);
}

function applyTurnAilmentDamage(role: BattleRole, attacker: Character): boolean {
  if (!state.battle) {
    return false;
  }
  const status = state.battle.status[role];
  if (status?.poisoned) {
    applyPoison(role, attacker);
  }
  if (status?.burned) {
    applyBurn(role, attacker);
  }
  applyLastStandIfNeeded();
  return resolveBattleIfFinished();
}

function applyVampirismHeal(role: BattleRole, attacker: Character, dealt: number) {
  if (!state.battle || !hasBattleStatus(role, "vampirism") || dealt <= 0) {
    return;
  }
  const healAmount = Math.max(1, Math.ceil(dealt * 0.33));
  applyHeal(role, attacker, healAmount);
}

function applyUniqueThorns(
  defenderRole: BattleRole,
  attackerRole: BattleRole,
  dealt: number,
  defenderName: string | undefined
) {
  if (!state.battle || !hasBattleStatus(defenderRole, "thorns") || dealt <= 0) {
    return;
  }
  const attackerHp = attackerRole === "player" ? state.battle.playerHp : state.battle.opponentHp;
  if (attackerHp <= 0) {
    return;
  }
  const thorns = Math.max(1, Math.ceil(dealt * 0.5));
  const reflected = dealCombatDamage(attackerRole, thorns, false);
  logBattle(`${defenderName || "Foe"}'s thorns deal ${reflected} damage!`);
}

function applyDeepWoundOnDodge(
  role: BattleRole,
  character: Character | null | undefined
): boolean {
  if (!state.battle || !hasBattleStatus(role, "deepwound")) {
    return false;
  }
  const maxHp = Math.max(1, getCombatStats(role).hp);
  const damage = Math.max(1, Math.ceil(maxHp * 0.1));
  const dealt = dealCombatDamage(role, damage, false);
  logBattle(
    `${character?.name || "Foe"}'s deep wound tears open for ${dealt} damage!`
  );
  if (
    role === "player" &&
    state.battle.playerHp <= 0 &&
    state.battle.adrenalineReady?.player
  ) {
    state.battle.adrenalineReady.player = false;
    state.battle.playerHp = 1;
    battlePlayerHp.textContent = "HP: 1";
    state.battle.extraTurnQueued = "player";
    logBattle(`${state.player.name} endures with Adrenal Seed and fights on!`);
  }
  applyLastStandIfNeeded();
  return resolveBattleIfFinished();
}

function getBlindedDodgeChance(attackerRole: BattleRole, baseDodge: number): number {
  if (!state.battle?.status[attackerRole]?.blinded) {
    return baseDodge;
  }
  return Math.min(1, baseDodge * 1.5);
}

function applyHeal(role: BattleRole, attacker: Character, amount: number | "full") {
  if (!state.battle) {
    return;
  }
  const maxHp = getCombatStats(role).hp;
  const healAmount = amount === "full" ? maxHp : Math.max(0, Math.floor(Number(amount) || 0));
  if (state.battle.status[role]?.inverted) {
    const dealt = dealCombatDamage(role, healAmount, false);
    logBattle(`${attacker.name}'s healing inverts and deals ${dealt} damage!`);
    return;
  }
  if (role === "player") {
    state.battle.playerHp = Math.min(maxHp, state.battle.playerHp + healAmount);
    battlePlayerHp.textContent = `HP: ${state.battle.playerHp}`;
  } else {
    state.battle.opponentHp = Math.min(maxHp, state.battle.opponentHp + healAmount);
    battleOpponentHp.textContent = `HP: ${state.battle.opponentHp}`;
  }
  logBattle(`${attacker.name} heals!`);
}

function setStatusIcon(el: HTMLImageElement | null | undefined, visible: boolean) {
  if (el) {
    el.style.display = visible ? "block" : "none";
  }
}

function updateStatusIcons() {
  if (!state.battle) {
    return;
  }
  const p = state.battle.status.player;
  const o = state.battle.status.opponent;
  const pe = getEffectiveStatMods("player");
  const oe = getEffectiveStatMods("opponent");

  setStatusIcon(playerStatusAsleep, p.asleep);
  setStatusIcon(playerStatusPoisoned, p.poisoned);
  setStatusIcon(playerStatusConfused, p.confused);
  setStatusIcon(playerStatusDemoralized, p.demoralized);
  setStatusIcon(playerStatusSilenced, p.silenced);
  setStatusIcon(playerStatusBlinded, p.blinded);
  setStatusIcon(playerStatusInverted, p.inverted);
  setStatusIcon(playerStatusBurned, p.burned);
  setStatusIcon(playerStatusVampirism, p.vampirism);
  setStatusIcon(playerStatusThorns, p.thorns);
  setStatusIcon(playerStatusReflector, p.reflector);
  setStatusIcon(playerStatusImmune, p.immune);
  setStatusIcon(playerStatusReckless, p.reckless);
  setStatusIcon(playerStatusPositivePole, p.positivepole);
  setStatusIcon(playerStatusCursed, p.cursed);
  setStatusIcon(playerStatusMarked, p.marked);
  setStatusIcon(playerStatusDrained, p.drained);
  setStatusIcon(playerStatusBound, p.bound);
  setStatusIcon(playerStatusNegativePole, p.negativepole);
  setStatusIcon(playerStatusDeepWound, p.deepwound);
  setStatusIcon(playerStatusInfatuated, p.infatuated);
  setStatusIcon(playerStatusFortified, pe.buff.attack);
  setStatusIcon(playerStatusProtected, pe.buff.defense);
  setStatusIcon(playerStatusSwift, pe.buff.speed);
  setStatusIcon(playerStatusFocused, pe.buff.intelligence);
  setStatusIcon(playerStatusWeak, pe.debuff.attack);
  setStatusIcon(playerStatusExposed, pe.debuff.defense);
  setStatusIcon(playerStatusSlow, pe.debuff.speed);
  setStatusIcon(playerStatusDistracted, pe.debuff.intelligence);

  setStatusIcon(opponentStatusAsleep, o.asleep);
  setStatusIcon(opponentStatusPoisoned, o.poisoned);
  setStatusIcon(opponentStatusConfused, o.confused);
  setStatusIcon(opponentStatusDemoralized, o.demoralized);
  setStatusIcon(opponentStatusSilenced, o.silenced);
  setStatusIcon(opponentStatusBlinded, o.blinded);
  setStatusIcon(opponentStatusInverted, o.inverted);
  setStatusIcon(opponentStatusBurned, o.burned);
  setStatusIcon(opponentStatusVampirism, o.vampirism);
  setStatusIcon(opponentStatusThorns, o.thorns);
  setStatusIcon(opponentStatusReflector, o.reflector);
  setStatusIcon(opponentStatusImmune, o.immune);
  setStatusIcon(opponentStatusReckless, o.reckless);
  setStatusIcon(opponentStatusPositivePole, o.positivepole);
  setStatusIcon(opponentStatusCursed, o.cursed);
  setStatusIcon(opponentStatusMarked, o.marked);
  setStatusIcon(opponentStatusDrained, o.drained);
  setStatusIcon(opponentStatusBound, o.bound);
  setStatusIcon(opponentStatusNegativePole, o.negativepole);
  setStatusIcon(opponentStatusDeepWound, o.deepwound);
  setStatusIcon(opponentStatusInfatuated, o.infatuated);
  setStatusIcon(opponentStatusFortified, oe.buff.attack);
  setStatusIcon(opponentStatusProtected, oe.buff.defense);
  setStatusIcon(opponentStatusSwift, oe.buff.speed);
  setStatusIcon(opponentStatusFocused, oe.buff.intelligence);
  setStatusIcon(opponentStatusWeak, oe.debuff.attack);
  setStatusIcon(opponentStatusExposed, oe.debuff.defense);
  setStatusIcon(opponentStatusSlow, oe.debuff.speed);
  setStatusIcon(opponentStatusDistracted, oe.debuff.intelligence);
}

function createProjectileVisual(attacker: Character, attack: AttackAction): HTMLElement {
  const src = getAttackProjectile(attacker, attack);
  const stageKey = getStageKey(attacker.stage);
  const isPowerful =
    attack?.name === "final attack" ||
    attack?.name === "special attack" ||
    Boolean(attack?.isCritical);
  const imgClass = isPowerful
    ? "element-projectile projectile-stage-ultimate"
    : `element-projectile projectile-stage-${stageKey}`;

  if (attack?.isCritical && attack?.name !== "special attack") {
    const stack = document.createElement("div");
    stack.className = `projectile-crit-stack projectile-stage-ultimate`;
    for (let i = 0; i < 2; i += 1) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Critical Attack";
      img.className = "element-projectile projectile-crit-piece";
      stack.append(img);
    }
    return stack;
  }

  const img = document.createElement("img");
  img.src = src;
  img.alt = "Attack";
  img.className = imgClass;
  return img;
}

/** Vaccine > Virus > Data > Vaccine */
function chooseAttack(
  attackerRole: BattleRole,
  attacker: Character,
  defender: Character | null | undefined
): AttackAction {
  const stats = getCombatStats(attackerRole);
  const silenced = Boolean(state.battle.status[attackerRole]?.silenced);
  const infatuated = hasBattleStatus(attackerRole, "infatuated");
  const blockSpecial = silenced || infatuated;
  if (state.battle.forceSpecial === attackerRole && !blockSpecial) {
    state.battle.forceSpecial = null;
    state.activeConsumable = null;
    updateEquipmentStatus();
    return (
      getSpecialAttack(attacker) || {
        name: "special attack",
        displayName: attacker.specialAttackName || "Special Attack",
        isSpecial: true,
        status: getSpecialStatus(attacker),
        statusChance: 1,
      }
    );
  }
  if (
    !blockSpecial &&
    attackerRole === "opponent" &&
    state.finalChallenge &&
    attacker.stage === "Armor-Hybrid" &&
    state.battle.opponentHp === 1
  ) {
    return {
      name: "special attack",
      displayName: "Ultimate Attack",
      isSpecial: true,
      status: "none",
      oneHitKO: true,
    };
  }
  // Special: 10% + 1% per Intelligence
  const specialChance = getStatProcChance(stats.intelligence) + (state.battle.specialBonus || 0);
  if (!blockSpecial && Math.random() < specialChance) {
    const special = getSpecialAttack(attacker);
    if (special) {
      return special;
    }
  }
  // Critical: 10% base, 30% with type advantage (Vaccine>Virus>Data>Vaccine)
  if (!infatuated && Math.random() < getCriticalChance(attacker, defender)) {
    return {
      name: "standard attack",
      displayName: "Critical Hit",
      isSpecial: false,
      isCritical: true,
      status: "none",
    };
  }
  return {
    name: "standard attack",
    displayName: "Attack",
    isSpecial: false,
    isCritical: false,
    status: "none",
  };
}

function getHitChance(attacker: Character | null, defender: Character | null): number {
  const baseChance = 0.75;
  if (!attacker || !defender) {
    return baseChance;
  }
  const bonus = hasTypeAdvantage(attacker, defender) ? 0.1 : 0;
  return Math.min(1, baseChance + bonus);
}

function getSpecialStatus(attacker: Character): string {
  const fromField = String(attacker.specialStatus || "").trim();
  if (fromField && fromField !== "none") {
    return fromField;
  }
  const special = (attacker.attacks || []).find(
    (attack) => String(attack?.name || "").toLowerCase() === "special attack"
  );
  const fromAttack = String(special?.status || "").trim();
  if (fromAttack && fromAttack !== "none") {
    return fromAttack;
  }
  return "demoralized";
}

function getSpecialAttack(attacker: Character): AttackAction | null {
  if (!attacker || !canUseSpecialAttack(attacker)) {
    return null;
  }
  const displayName = attacker.specialAttackName || "Special Attack";
  const status = getSpecialStatus(attacker);
  const statusChance = 1;
  if (attacker.stage === "Armor-Hybrid") {
    return {
      name: "special attack",
      damage: 2,
      status,
      statusChance,
      displayName,
      isSpecial: true,
    };
  }
  const element = normalizeBattleType(attacker);
  if (element === "vaccine") {
    return {
      name: "special attack",
      damage: 1,
      heal: 1,
      status,
      statusChance,
      displayName,
      isSpecial: true,
    };
  }
  if (element === "data") {
    return {
      name: "special attack",
      damage: 2,
      status,
      statusChance,
      displayName,
      isSpecial: true,
    };
  }
  if (element === "virus") {
    return {
      name: "special attack",
      damage: 2,
      status,
      statusChance,
      displayName,
      isSpecial: true,
    };
  }
  return {
    name: "special attack",
    damage: 2,
    status,
    statusChance,
    displayName,
    isSpecial: true,
  };
}

function randomStatus(): string {
  const options = ["poison", "sleep", "confuse", "demoralize"] as const;
  return options[Math.floor(Math.random() * options.length)];
}

function playerMeetsEvolutionRequirements(): boolean {
  if (!state.player) {
    return false;
  }
  // Baby I -> Baby II: at least one successful training.
  if (state.player.stage === "Baby I") {
    return state.training >= 1;
  }
  // Baby II -> Child: after 5 battles.
  if (state.player.stage === "Baby II") {
    return state.battlesForEvolution >= 5;
  }
  // Child -> Adult: after 30 battles.
  if (state.player.stage === "Child") {
    return state.battlesForEvolution >= 30;
  }
  // Adult -> Perfect: from battle 50 onward, 5% + 1% per training.
  if (state.player.stage === "Adult") {
    if (state.battlesForEvolution < 50) {
      return false;
    }
    const chancePercent = 5 + Math.max(0, Number(state.training) || 0);
    return Math.random() * 100 < chancePercent;
  }
  // Perfect -> Ultimate: required equipment (or a pending feed evolution).
  if (state.player.stage === "Perfect") {
    return Boolean(getPerfectUltimateTargetId());
  }
  return false;
}

function checkEvolution(): boolean {
  if (state.mode !== "history" || !state.player) {
    return false;
  }
  if (!evolutionScreen.classList.contains("hidden")) {
    return false;
  }
  if (!state.debugEvo && !playerMeetsEvolutionRequirements()) {
    return false;
  }
  return performEvolution();
}

function pickBabyIiChildEvolution(): Character | null {
  const negativeCare = state.discipline < 0 || state.happiness < 0;
  const betamonChance = negativeCare ? 0.75 : 0.25;
  const preferBetamon = Math.random() < betamonChance;
  const primaryId = preferBetamon ? "betamon" : "agumon";
  const fallbackId = preferBetamon ? "agumon" : "betamon";
  const findChild = (id: string) =>
    state.characters.find((char) => String(char.id) === id && char.stage === "Child") || null;
  return findChild(primaryId) || findChild(fallbackId);
}

/** Child → Adult by care meters (Agumon / Betamon lines). */
function pickChildAdultEvolution(): Character | null {
  const findAdult = (id: string) =>
    state.characters.find((char) => String(char.id) === id && char.stage === "Adult") || null;

  const playerId = String(state.player?.id || "");
  const disc = Number(state.discipline) || 0;
  const happ = Number(state.happiness) || 0;
  const align = Number(state.alignment) || 0;
  const trainedEnough = (Number(state.training) || 0) >= 5;

  const candidates: string[] = [];

  if (playerId === "betamon") {
    if (trainedEnough && disc === -3) {
      candidates.push("airdramon");
    }
    if (trainedEnough && disc >= -2 && disc <= 2 && happ >= -2 && happ <= 2) {
      candidates.push("seadramon");
    }
    if (align <= -5) {
      candidates.push("devimon");
    }
    if (disc === 3) {
      candidates.push("meramon");
    }
  } else {
    // Agumon line (default Child → Adult).
    if (trainedEnough && disc > 3 && happ > 3) {
      candidates.push("greymon");
    }
    if (trainedEnough && (happ === 1 || happ === 2) && (disc === 1 || disc === 2)) {
      candidates.push("tyranomon");
    }
    if ((happ === -1 || happ === -2) && (disc === -1 || disc === -2)) {
      candidates.push("meramon");
    }
    if (align <= -5) {
      candidates.push("devimon");
    }
  }

  if (candidates.length === 0) {
    candidates.push("numemon");
  }

  const targetId = candidates[Math.floor(Math.random() * candidates.length)];
  return findAdult(targetId) || findAdult("numemon");
}

function alreadyXAntibodyForm(character: Character | null): boolean {
  const id = String(character?.id || "");
  return Boolean(id) && /_x$/i.test(id);
}

function findXAntibodyForm(character: Character | null): Character | null {
  if (!character) {
    return null;
  }
  const id = String(character.id || "");
  if (!id || alreadyXAntibodyForm(character)) {
    return null;
  }
  const stage = character.stage;
  const byId = (candidateId: string) => {
    const sameStage = state.characters.find(
      (entry) => String(entry.id) === candidateId && (!stage || entry.stage === stage)
    );
    if (sameStage) {
      return sameStage;
    }
    return state.characters.find((entry) => String(entry.id) === candidateId) || null;
  };
  const direct = byId(`${id}_x`);
  if (direct) {
    return direct;
  }
  const aliases: Record<string, string> = { tyranomon: "tyrannomon_x" };
  if (aliases[id]) {
    const aliased = byId(aliases[id]);
    if (aliased) {
      return aliased;
    }
  }
  const name = String(character.name || "").trim();
  if (!name) {
    return null;
  }
  const nameTargets = new Set([`${name} X`, `${name} (X-Antibody)`]);
  return (
    state.characters.find(
      (entry) =>
        nameTargets.has(String(entry.name || "").trim()) &&
        (!stage || entry.stage === stage)
    ) || null
  );
}

/** Feed-triggered Ultimate (e.g. Monzaemon + Nightmare Burrito). */
let pendingFeedUltimateId: string | null = null;

/**
 * Perfect → Ultimate target when the Digimon holds the right item / feed flag.
 * MetalGreymon Virus + Cyber Parts → BlitzGreymon
 * Mamemon + Baseball Bat → BanchoMamemon
 * Monzaemon + Nightmare Burrito (feed) → ShinMonzaemon
 */
function getPerfectUltimateTargetId(): string | null {
  if (pendingFeedUltimateId) {
    return pendingFeedUltimateId;
  }
  const playerId = String(state.player?.id || "");
  const equipped = state.equipped;
  if (playerId === "metalgreymon_virus" && equipped === "cyberparts") {
    return "blitzgreymon";
  }
  if (playerId === "mamemon" && equipped === "baseballBat") {
    return "banchomamemon";
  }
  return null;
}

function pickPerfectUltimateEvolution(): Character | null {
  const targetId = getPerfectUltimateTargetId();
  if (!targetId) {
    return null;
  }
  return (
    state.characters.find(
      (char) => String(char.id) === targetId && char.stage === "Ultimate"
    ) || null
  );
}

function performEvolution(): boolean {
  if (!state.player) {
    return false;
  }

  const playerStageIndex = getStageIndex(state.player.stage);
  if (playerStageIndex === -1 || playerStageIndex >= STAGE_ORDER.length - 1) {
    return false;
  }

  const nextStage = STAGE_ORDER[playerStageIndex + 1];
  let evolved: Character | null = null;
  if (state.player.stage === "Baby II" && nextStage === "Child") {
    evolved = pickBabyIiChildEvolution();
  } else if (state.player.stage === "Child" && nextStage === "Adult") {
    evolved = pickChildAdultEvolution();
  } else if (state.player.stage === "Perfect" && nextStage === "Ultimate") {
    evolved = pickPerfectUltimateEvolution();
  } else {
    const allowedIds = Array.isArray(state.player.evolvesTo)
      ? state.player.evolvesTo.map(String)
      : [];
    if (allowedIds.length === 0) {
      return false;
    }
    const allowed = new Set(allowedIds);
    const pool = state.characters.filter(
      (char) => allowed.has(String(char.id || "")) && char.stage === nextStage
    );
    if (pool.length === 0) {
      return false;
    }
    evolved = pool[Math.floor(Math.random() * pool.length)];
  }
  if (!evolved) {
    pendingFeedUltimateId = null;
    return false;
  }
  const previous = state.player;
  const previousMaxHp = getPlayerCombatStats().hp;
  const previousHp =
    state.currentZone && typeof state.zoneRunHp === "number"
      ? state.zoneRunHp
      : previousMaxHp;
  state.player = evolved;
  markHistoryCharacterPlayed(evolved);
  applyEvolutionStatGains(previous, evolved);
  updateAttributes();
  applyEvolutionZoneRunHp(previousHp, previousMaxHp);
  state.battlesForEvolution = 0;
  state.evolutionMissBonus = 0;
  pendingFeedUltimateId = null;
  if (state.debugEvo) {
    state.debugEvo = false;
  }
  showEvolutionScreen(previous, evolved);
  return true;
}

function showEvolutionScreen(previous, evolved) {
  if (!previous || !evolved) {
    return;
  }

  battleScreen.classList.add("hidden");
  actionMenu.classList.add("hidden");
  hubMenu.classList.add("hidden");
  feedMenu.classList.add("hidden");
  trainMenu.classList.add("hidden");
  equipmentMenu.classList.add("hidden");
  keyItemsMenu.classList.add("hidden");
  zoneMenu.classList.add("hidden");
  eventScreen.classList.add("hidden");
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
  state.battle.endTickerId = window.setInterval(updateFrames, combatMs(1000));
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
    }, combatMs(250));

    const timeouts: number[] = [];
    const projectile = document.createElement("div");
    projectile.className = "projectile element";
    if (attackerRole === "player") {
      projectile.classList.add("from-left");
    } else {
      projectile.classList.add("from-right");
    }
    const img = createProjectileVisual(attacker, attack);
    projectile.append(img);
    const battleEl = battleScreen.querySelector<HTMLElement>(".battle");
    const projectilePxPerSec = combatProjectileSpeed();
    const reactionMs = combatMs(1100);
    const launchDelayMs = combatMs(30);
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let flightMs = 300;
    if (battleEl) {
      const battleRect = battleEl.getBoundingClientRect();
      const attackerRect = attackerSprite.getBoundingClientRect();
      const defenderRect = defenderSprite.getBoundingClientRect();
      startX = attackerRect.left + attackerRect.width / 2 - battleRect.left;
      startY = attackerRect.top + attackerRect.height / 2 - battleRect.top;
      endX = defenderRect.left + defenderRect.width / 2 - battleRect.left;
      endY = defenderRect.top + defenderRect.height / 2 - battleRect.top;
      const distance = Math.hypot(endX - startX, endY - startY);
      flightMs = distance > 0 ? Math.max(1, Math.round((distance / projectilePxPerSec) * 1000)) : combatMs(200);
      projectile.style.setProperty("--projectile-flight", `${flightMs}ms`);
      projectile.style.left = `${startX}px`;
      projectile.style.top = `${startY}px`;
      battleEl.append(projectile);
      void projectile.offsetWidth;
    } else {
      battleScreen.querySelector<HTMLElement>(".battle")?.append(projectile);
    }

    timeouts.push(
      window.setTimeout(() => {
        projectile.classList.add("visible", "fly");
        projectile.style.left = `${endX}px`;
        projectile.style.top = `${endY}px`;
      }, launchDelayMs)
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
            }, reactionMs)
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
            }, reactionMs)
          );
        }
      }, launchDelayMs + flightMs)
    );
  });
}

function updateSelection(list, selectedId) {
  list.querySelectorAll(".character-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === String(selectedId));
  });
}

updateZoneUnlockUi();
