const singlePlayerButton = document.getElementById("single-player");
const exitButton = document.getElementById("exit");
const mainMenu = document.getElementById("main-menu");
const characterMenu = document.getElementById("character-menu");
const playerList = document.getElementById("player-list");
const startGameButton = document.getElementById("start-game");
const backButton = document.getElementById("back");
const actionMenu = document.getElementById("action-menu");
const actionBackButton = document.getElementById("action-back");
const feedButton = document.getElementById("feed");
const trainButton = document.getElementById("train");
const battleButton = document.getElementById("battle");
const finalChallengeButton = document.getElementById("final-challenge");
const weightCounter = document.getElementById("weight-counter");
const winRateDisplay = document.getElementById("win-rate");
const caretakerSprite = document.getElementById("caretaker-sprite");
const caretakerName = document.getElementById("caretaker-name");
const caretakerStage = document.getElementById("caretaker-stage");
const caretakerHp = document.getElementById("caretaker-hp");
const caretakerTypeIcon = document.getElementById("caretaker-type-icon");
const consumableStatus = document.getElementById("consumable-status");
const trainingCounter = document.getElementById("training-counter");
const feedMenu = document.getElementById("feed-menu");
const feedBackButton = document.getElementById("feed-back");
const feedMeatButton = document.getElementById("feed-meat");
const feedSpriteSlot = document.getElementById("feed-sprite");
const feedFoodSprite = document.getElementById("feed-food-img");
const feedFoodContainer = document.querySelector(".feed-food");
const feedMushroomButton = document.getElementById("feed-mushroom");
const mushroomCount = document.getElementById("mushroom-count");
const feedPepperButton = document.getElementById("feed-pepper");
const pepperCount = document.getElementById("pepper-count");
const feedBlueAppleButton = document.getElementById("feed-blue-apple");
const blueAppleCount = document.getElementById("blue-apple-count");
const feedMedicineButton = document.getElementById("feed-medicine");
const medicineCount = document.getElementById("medicine-count");
const feedYellowPearButton = document.getElementById("feed-yellow-pear");
const yellowPearCount = document.getElementById("yellow-pear-count");
const feedStormCloudButton = document.getElementById("feed-storm-cloud");
const stormCloudCount = document.getElementById("storm-cloud-count");
const feedPoisonVialButton = document.getElementById("feed-poison-vial");
const poisonVialCount = document.getElementById("poison-vial-count");
const feedBeerBottleButton = document.getElementById("feed-beer-bottle");
const beerBottleCount = document.getElementById("beer-bottle-count");
const trainMenu = document.getElementById("train-menu");
const trainBackButton = document.getElementById("train-back");
const trainFill = document.getElementById("train-fill");
const trainStatus = document.getElementById("train-status");
const trainRetryButton = document.getElementById("train-retry");
const trainSpriteSlot = document.getElementById("train-sprite");
const trainBag = document.getElementById("train-bag");
const evolutionScreen = document.getElementById("evolution-screen");
const evolutionOld = document.getElementById("evolution-old");
const evolutionNew = document.getElementById("evolution-new");
const evolutionMessage = document.getElementById("evolution-message");
const evolutionContinue = document.getElementById("evolution-continue");
const gameoverScreen = document.getElementById("gameover-screen");
const gameoverSprite = document.getElementById("gameover-sprite");
const gameoverContinue = document.getElementById("gameover-continue");
const congratsScreen = document.getElementById("congrats-screen");
const congratsSprite = document.getElementById("congrats-sprite");
const congratsContinue = document.getElementById("congrats-continue");
const battleScreen = document.getElementById("battle-screen");
const battleBackButton = document.getElementById("battle-back");
const battlePlayerName = document.getElementById("battle-player-name");
const battleOpponentName = document.getElementById("battle-opponent-name");
const battlePlayerHp = document.getElementById("battle-player-hp");
const battleOpponentHp = document.getElementById("battle-opponent-hp");
const battleLog = document.getElementById("battle-log");
const battlePlayerSprite = document.getElementById("battle-player-sprite");
const battleOpponentSprite = document.getElementById("battle-opponent-sprite");
const battleField = document.getElementById("battle-field");
const playerStatusParalyzed = document.getElementById("player-status-paralyzed");
const playerStatusPoisoned = document.getElementById("player-status-poisoned");
const playerStatusConfused = document.getElementById("player-status-confused");
const opponentStatusParalyzed = document.getElementById("opponent-status-paralyzed");
const opponentStatusPoisoned = document.getElementById("opponent-status-poisoned");
const opponentStatusConfused = document.getElementById("opponent-status-confused");

const STAGE_ORDER = ["Baby I", "Baby II", "Child", "Adult", "Perfect", "Ultimate"];

const state = {
  characters: [],
  player: null,
  opponent: null,
  randomBabies: [],
  weight: 0,
  training: 0,
  inventory: {
    mushroom: 0,
    pepper: 0,
    blueApple: 0,
    medicine: 0,
    yellowPear: 0,
    stormCloud: 0,
    poisonVial: 0,
    beerBottle: 0,
  },
  activeConsumable: null,
  stats: {
    wins: 0,
    battles: 0,
  },
  battle: null,
  finalChallenge: false,
  debugEvo: false,
};

singlePlayerButton.addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  characterMenu.classList.remove("hidden");
  if (state.characters.length === 0) {
    loadCharacters();
  }
  resetSession();
  state.player = null;
  state.opponent = null;
  state.weight = 0;
  state.training = 0;
  state.inventory.mushroom = 0;
  state.inventory.pepper = 0;
  state.inventory.blueApple = 0;
  state.inventory.medicine = 0;
  state.inventory.yellowPear = 0;
  state.inventory.stormCloud = 0;
  state.inventory.poisonVial = 0;
  state.inventory.beerBottle = 0;
  state.activeConsumable = null;
  state.finalChallenge = false;
  state.debugEvo = false;
  state.finalChallenge = false;
  state.debugEvo = false;
  updateWeight();
  updateTraining();
  updateInventory();
  updateConsumableStatus();
  startGameButton.disabled = true;
  renderCharacterLists();
  startSpritePreview();
});

exitButton.addEventListener("click", () => {
  console.log("Exit selected");
});

backButton.addEventListener("click", () => {
  characterMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  stopSpritePreview();
});

startGameButton.addEventListener("click", () => {
  if (!state.player) {
    return;
  }
  stopSpritePreview();
  openActionMenu();
});

actionBackButton.addEventListener("click", () => {
  actionMenu.classList.add("hidden");
  feedMenu.classList.add("hidden");
  battleScreen.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  stopSpritePreview();
  stopFeedingPreview();
  resetSession();
  state.player = null;
  state.opponent = null;
  state.weight = 0;
  state.training = 0;
  state.inventory.mushroom = 0;
  state.inventory.pepper = 0;
  state.inventory.blueApple = 0;
  state.inventory.medicine = 0;
  state.inventory.yellowPear = 0;
  state.inventory.stormCloud = 0;
  state.inventory.poisonVial = 0;
  state.inventory.beerBottle = 0;
  state.activeConsumable = null;
  updateWeight();
  updateTraining();
  updateInventory();
  updateConsumableStatus();
  updateCaretakerInfo();
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

finalChallengeButton.addEventListener("click", () => {
  const proceed = window.confirm(
    "Final Challenge: the game ends here. Win to beat the game; lose to get Game Over. Continue?"
  );
  if (!proceed) {
    return;
  }
  state.finalChallenge = true;
  actionMenu.classList.add("hidden");
  startBattle();
});

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

feedMushroomButton.addEventListener("click", () => {
  if (state.inventory.mushroom <= 0) {
    return;
  }
  state.inventory.mushroom -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_mushroom.svg";
    feedFoodSprite.alt = "Mushroom";
  }
  state.activeConsumable = "mushroom";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedPepperButton.addEventListener("click", () => {
  if (state.inventory.pepper <= 0) {
    return;
  }
  state.inventory.pepper -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_pepper.svg";
    feedFoodSprite.alt = "Pepper";
  }
  state.activeConsumable = "pepper";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedBlueAppleButton.addEventListener("click", () => {
  if (state.inventory.blueApple <= 0) {
    return;
  }
  state.inventory.blueApple -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_blue_apple.svg";
    feedFoodSprite.alt = "Blue Apple";
  }
  state.activeConsumable = "blue_apple";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedMedicineButton.addEventListener("click", () => {
  if (state.inventory.medicine <= 0) {
    return;
  }
  state.inventory.medicine -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_medicine.svg";
    feedFoodSprite.alt = "Medicine";
  }
  state.activeConsumable = "medicine";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedYellowPearButton.addEventListener("click", () => {
  if (state.inventory.yellowPear <= 0) {
    return;
  }
  state.inventory.yellowPear -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/food_yellow_pear.svg";
    feedFoodSprite.alt = "Yellow Pear";
  }
  state.activeConsumable = "yellow_pear";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedStormCloudButton.addEventListener("click", () => {
  if (state.inventory.stormCloud <= 0) {
    return;
  }
  state.inventory.stormCloud -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/item_storm_cloud.svg";
    feedFoodSprite.alt = "Storm Cloud";
  }
  state.activeConsumable = "storm_cloud";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedPoisonVialButton.addEventListener("click", () => {
  if (state.inventory.poisonVial <= 0) {
    return;
  }
  state.inventory.poisonVial -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/item_poison_vial.svg";
    feedFoodSprite.alt = "Poison Vial";
  }
  state.activeConsumable = "poison_vial";
  updateConsumableStatus();
  startFeedingPreview(true);
});

feedBeerBottleButton.addEventListener("click", () => {
  if (state.inventory.beerBottle <= 0) {
    return;
  }
  state.inventory.beerBottle -= 1;
  updateInventory();
  if (feedFoodSprite) {
    feedFoodSprite.src = "data/ui/item_beer_bottle.svg";
    feedFoodSprite.alt = "Beer Bottle";
  }
  state.activeConsumable = "beer_bottle";
  updateConsumableStatus();
  startFeedingPreview(true);
});

battleBackButton.addEventListener("click", () => {
  endBattle();
  battleScreen.classList.add("hidden");
  openActionMenu();
});

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
  } catch (error) {
    console.error(error);
  }
}

function normalizeCharacter(character) {
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
  state.randomBabies = getRandomBabies(4);
  state.randomBabies.forEach((character) => {
    const playerCard = createCharacterCard(character, "player");
    playerList.append(playerCard);
  });
}

function createCharacterCard(character, type) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "character-card";
  card.dataset.id = character.id;

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
    if (type === "player") {
      state.player = character;
      updateSelection(playerList, character.id);
      startGameButton.disabled = !state.player;
    }
  });

  return card;
}

let spriteTickerId = null;
let feedTickerId = null;
let trainTickerId = null;
let trainProgress = 0;
let trainDirection = 1;
let trainActive = false;
let trainIdleTickerId = null;
let trainResultTickerId = null;
let debugSequence = [];
let endScreenTickerId = null;

function startSpritePreview() {
  if (spriteTickerId) {
    return;
  }

  spriteTickerId = window.setInterval(() => {
    const sprites = document.querySelectorAll(
      '#character-menu .character-sprite, #action-menu .character-sprite[data-preview-scope="caretaker"]'
    );
    if (sprites.length === 0) {
      return;
    }
    sprites.forEach((sprite) => {
      const basePath = sprite.dataset.basePath;
      if (!basePath) {
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

let battleTickerId = null;
let attackCleanupId = null;

function startBattle() {
  characterMenu.classList.add("hidden");
  actionMenu.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  state.opponent = pickRandomOpponent();
  updateBattleBackground();

  state.battle = {
    playerHp: getBattleHp(state.player),
    opponentHp: typeof state.opponent.hp === "number" ? state.opponent.hp : 3,
    turn: "player",
    forceSpecial: state.activeConsumable === "pepper" ? "player" : null,
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
      player: state.activeConsumable === "medicine",
      opponent: false,
    },
    specialBonus: state.activeConsumable === "yellow_pear" ? 0.2 : 0,
    statusBonus: {
      paralyze: state.activeConsumable === "storm_cloud" ? 0.1 : 0,
      poison: state.activeConsumable === "poison_vial" ? 0.1 : 0,
      confuse: state.activeConsumable === "beer_bottle" ? 0.1 : 0,
    },
  };
  if (state.activeConsumable === "medicine") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (state.activeConsumable === "yellow_pear") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (
    state.activeConsumable === "storm_cloud" ||
    state.activeConsumable === "poison_vial" ||
    state.activeConsumable === "beer_bottle"
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
  let stage = state.player.stage || "Child";
  if (state.finalChallenge && state.opponent?.stage) {
    stage = state.opponent.stage;
  }
  const mapping = {
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

function getBattleHp(character) {
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
  if (
    !mushroomCount ||
    !feedMushroomButton ||
    !pepperCount ||
    !feedPepperButton ||
    !blueAppleCount ||
    !feedBlueAppleButton ||
    !medicineCount ||
    !feedMedicineButton ||
    !yellowPearCount ||
    !feedYellowPearButton ||
    !stormCloudCount ||
    !feedStormCloudButton ||
    !poisonVialCount ||
    !feedPoisonVialButton ||
    !beerBottleCount ||
    !feedBeerBottleButton
  ) {
    return;
  }
  mushroomCount.textContent = `x${state.inventory.mushroom}`;
  if (state.inventory.mushroom > 0) {
    feedMushroomButton.classList.remove("hidden");
  } else {
    feedMushroomButton.classList.add("hidden");
  }
  pepperCount.textContent = `x${state.inventory.pepper}`;
  if (state.inventory.pepper > 0) {
    feedPepperButton.classList.remove("hidden");
  } else {
    feedPepperButton.classList.add("hidden");
  }
  blueAppleCount.textContent = `x${state.inventory.blueApple}`;
  if (state.inventory.blueApple > 0) {
    feedBlueAppleButton.classList.remove("hidden");
  } else {
    feedBlueAppleButton.classList.add("hidden");
  }
  medicineCount.textContent = `x${state.inventory.medicine}`;
  if (state.inventory.medicine > 0) {
    feedMedicineButton.classList.remove("hidden");
  } else {
    feedMedicineButton.classList.add("hidden");
  }
  yellowPearCount.textContent = `x${state.inventory.yellowPear}`;
  if (state.inventory.yellowPear > 0) {
    feedYellowPearButton.classList.remove("hidden");
  } else {
    feedYellowPearButton.classList.add("hidden");
  }
  stormCloudCount.textContent = `x${state.inventory.stormCloud}`;
  if (state.inventory.stormCloud > 0) {
    feedStormCloudButton.classList.remove("hidden");
  } else {
    feedStormCloudButton.classList.add("hidden");
  }
  poisonVialCount.textContent = `x${state.inventory.poisonVial}`;
  if (state.inventory.poisonVial > 0) {
    feedPoisonVialButton.classList.remove("hidden");
  } else {
    feedPoisonVialButton.classList.add("hidden");
  }
  beerBottleCount.textContent = `x${state.inventory.beerBottle}`;
  if (state.inventory.beerBottle > 0) {
    feedBeerBottleButton.classList.remove("hidden");
  } else {
    feedBeerBottleButton.classList.add("hidden");
  }
  updateConsumableStatus();
}

function updateConsumableStatus() {
  if (!consumableStatus) {
    return;
  }
  let label = "None";
  if (state.activeConsumable === "mushroom") {
    label = "Mushroom (+1 HP)";
  } else if (state.activeConsumable === "pepper") {
    label = "Pepper (Final Attack)";
  } else if (state.activeConsumable === "blue_apple") {
    label = "Blue Apple (Guaranteed Evolution)";
  } else if (state.activeConsumable === "medicine") {
    label = "Medicine (Status Immunity)";
  } else if (state.activeConsumable === "yellow_pear") {
    label = "Yellow Pear (+20% Special)";
  } else if (state.activeConsumable === "storm_cloud") {
    label = "Storm Cloud (+10% Paralyze)";
  } else if (state.activeConsumable === "poison_vial") {
    label = "Poison Vial (+10% Poison)";
  } else if (state.activeConsumable === "beer_bottle") {
    label = "Beer Bottle (+10% Confuse)";
  }
  consumableStatus.textContent = `Consumable: ${label}`;
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
}

window.addEventListener("keydown", (event) => {
  trackDebugSequence(event);
  if (event.code !== "Space") {
    return;
  }
  if (trainMenu.classList.contains("hidden") || !trainActive) {
    return;
  }
  event.preventDefault();
  trainActive = false;
  stopTraining();
  const win = trainProgress >= 80 && trainProgress <= 100;
  playTrainingResult(win);
  if (win) {
    state.training = Math.min(4, state.training + 1);
    updateTraining();
  }
  trainStatus.textContent = win
    ? "Success! Training complete."
    : "Missed! Try again.";
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
  const sprite = trainSpriteSlot?.querySelector(".character-sprite");
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
    trainMenu.querySelector(".train-visual").append(projectile);
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

function getRandomBabies(count) {
  const babies = state.characters.filter((char) => char.stage === "Baby I");
  const shuffled = babies.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickRandomOpponent() {
  if (!state.player) {
    return state.characters[0];
  }

  const armorPool = state.characters.filter((char) => char.stage === "Armor-Hybrid");
  if (state.finalChallenge && armorPool.length > 0) {
    return armorPool[Math.floor(Math.random() * armorPool.length)];
  }

  const playerStageIndex = STAGE_ORDER.indexOf(state.player.stage);
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

function createBattleSprite(spriteFramesPath, name, mirrored, role) {
  const frame = document.createElement("div");
  frame.className = "character-sprite-frame battle-sprite-frame";
  if (mirrored) {
    frame.classList.add("mirrored");
  }

  const sprite = document.createElement("img");
  sprite.className = "character-sprite";
  sprite.src = `data/${spriteFramesPath}/frame_00.png`;
  sprite.alt = name ? `${name} sprite` : "Character sprite";
  sprite.dataset.basePath = `data/${spriteFramesPath}`;
  if (role) {
    sprite.dataset.role = role;
  }
  frame.append(sprite);
  return frame;
}

function playBattleIntro() {
  return new Promise((resolve) => {
    const battleSprites = document.querySelectorAll(
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

  const attackerRole = state.battle.turn;
  const defenderRole = state.battle.turn === "player" ? "opponent" : "player";
  const attacker = attackerRole === "player" ? state.player : state.opponent;

  if (state.battle.status[attackerRole]?.confused) {
    if (Math.random() < 0.2) {
      applySelfDamage(attackerRole, attacker, "confused");
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

  const defenderCharacter =
    defenderRole === "player" ? state.player : state.opponent;
  const attack = chooseAttack(attackerRole, attacker);
  const hitChance =
    attack.name === "final attack" ? 0.8 : getHitChance(attacker, defenderCharacter);
  const hit = Math.random() < hitChance;
  await animateAttack(attackerRole, defenderRole, attacker, attack, hit);

  if (hit) {
    const critical = Math.random() < 0.1;
    let damage = attack.damage + (critical ? 1 : 0);
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
    logBattle(
      `${attacker.name} hits with ${
        attack.name === "final attack"
          ? "Final Attack"
          : attack.name === "special attack"
            ? "Special Attack"
            : "Standard Attack"
      }${critical ? " (Critical)" : ""}!`
    );
    applyStatus(defenderRole, attack.status);
  } else {
    logBattle(
      `${attacker.name} misses ${
        attack.name === "final attack"
          ? "Final Attack"
          : attack.name === "special attack"
            ? "Special Attack"
            : "Standard Attack"
      }!`
    );
  }

  if (state.battle.status[attackerRole]?.poisoned) {
    applyPoison(attackerRole, attacker);
  }

  if (state.battle.playerHp <= 0 || state.battle.opponentHp <= 0) {
    const playerWon = state.battle.playerHp > 0;
    const winner = playerWon ? state.player.name : state.opponent.name;
    logBattle(`${winner} wins!`);
    if (state.finalChallenge) {
      state.finalChallenge = false;
      endBattle();
      battleScreen.classList.add("hidden");
      showEndScreen(playerWon);
      return;
    }
    if (playerWon) {
      attemptItemDrop();
      attemptEvolution(state.opponent);
    }
    updateWinRate(playerWon);
    if (battleTickerId) {
      window.clearTimeout(battleTickerId);
      battleTickerId = null;
    }
    state.battle.ended = true;
    playBattleEnd(playerWon);
    return;
  }

  finalizeTurn(defenderRole);
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
  state.battle.turn = nextRole;
  scheduleNextTurn();
}

function applyStatus(defenderRole, status) {
  if (!status || status === "none") {
    return;
  }
  if (state.battle.statusImmune?.[defenderRole]) {
    logBattle(`${defenderRole === "player" ? state.player.name : state.opponent.name} is immune to status effects!`);
    return;
  }
  const normalized = String(status).toLowerCase();
  let applyChance = 1;
  if (defenderRole === "opponent") {
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

function getStageKey(stage) {
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

function getElementProjectile(element, stageKey) {
  const normalized = (element || "").toLowerCase();
  const safeElement =
    normalized === "vaccine" || normalized === "virus" || normalized === "data"
      ? normalized
      : "vaccine";
  const safeStage = stageKey || "child";
  return `data/ui/projectiles/${safeStage}_${safeElement}.svg`;
}

function getSpecialProjectile(attack) {
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

function chooseAttack(attackerRole, attacker) {
  const hp = attackerRole === "player" ? state.battle.playerHp : state.battle.opponentHp;
  if (state.battle.forceSpecial === attackerRole) {
    state.battle.forceSpecial = null;
    state.activeConsumable = null;
    updateConsumableStatus();
    return { name: "final attack", damage: 2 };
  }
  if (hp === 1 && Math.random() < 0.1) {
    return { name: "final attack", damage: 2 };
  }
  const specialChance = Math.min(1, 0.2 + (state.battle.specialBonus || 0));
  if (Math.random() < specialChance) {
    const special = getSpecialAttack(attacker);
    if (special) {
      return special;
    }
  }
  return { name: "standard attack", damage: 1 };
}

function getHitChance(attacker, defender) {
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

function getSpecialAttack(attacker) {
  if (!attacker || !Array.isArray(attacker.attacks)) {
    return null;
  }
  const entry = attacker.attacks.find((a) => a.name === "special attack");
  if (!entry) {
    return null;
  }
  const attack = {
    name: "special attack",
    damage: typeof entry.power === "number" ? entry.power : 2,
    status: entry.status || "none",
  };
  if (entry.status === "crit_kill") {
    attack.critKill = true;
    attack.status = randomStatus();
  }
  if (attack.status === "heal1") {
    attack.heal = 1;
    attack.status = "none";
  } else if (attack.status === "heal2") {
    attack.heal = 2;
    attack.status = "none";
  } else if (attack.status === "heal_full") {
    attack.heal = "full";
    attack.status = "none";
  } else if (attack.status === "crit_kill") {
    attack.critKill = true;
    attack.status = "none";
  }
  return attack;
}

function randomStatus() {
  const options = ["poison", "paralyze", "confuse"];
  return options[Math.floor(Math.random() * options.length)];
}

function attemptEvolution(opponent) {
  if (!state.player || !opponent) {
    return;
  }

  const playerStageIndex = STAGE_ORDER.indexOf(state.player.stage);
  const opponentStageIndex = STAGE_ORDER.indexOf(opponent.stage);
  if (playerStageIndex === -1 || opponentStageIndex === -1) {
    return;
  }
  if (playerStageIndex >= STAGE_ORDER.length - 1) {
    return;
  }

  if (!state.debugEvo && state.activeConsumable !== "blue_apple") {
    const baseChance = 0.5 * Math.pow(0.5, playerStageIndex);
    const trainingBonus = Math.min(state.training, 4) * 0.02;
    let stageBonus = 0;
    const diff = opponentStageIndex - playerStageIndex;
    if (diff === 1) {
      stageBonus = 0.05;
    } else if (diff >= 2) {
      stageBonus = 0.15;
    }
    const chance = baseChance + trainingBonus + stageBonus;
    const roll = Math.random();
    if (roll > chance) {
      logBattle("Evolution failed.");
      return;
    }
  }

  const nextStage = STAGE_ORDER[playerStageIndex + 1];
  const pool = state.characters.filter((char) => char.stage === nextStage);
  if (pool.length === 0) {
    return;
  }
  const evolved = pool[Math.floor(Math.random() * pool.length)];
  const previous = state.player;
  state.player = evolved;
  state.training = 0;
  updateTraining();
  if (state.activeConsumable === "blue_apple") {
    state.activeConsumable = null;
    updateConsumableStatus();
  }
  if (state.debugEvo) {
    state.debugEvo = false;
  }
  showEvolutionScreen(previous, evolved);
}

function attemptItemDrop() {
  const roll = Math.random();
  if (roll < 0.05) {
    state.inventory.blueApple += 1;
    updateInventory();
    logBattle("Found a Blue Apple!");
    return;
  }
  if (roll < 0.25) {
    state.inventory.pepper += 1;
    updateInventory();
    logBattle("Found a Pepper!");
    return;
  }
  if (roll < 0.35) {
    state.inventory.stormCloud += 1;
    updateInventory();
    logBattle("Found a Storm Cloud!");
    return;
  }
  if (roll < 0.45) {
    state.inventory.poisonVial += 1;
    updateInventory();
    logBattle("Found a Poison Vial!");
    return;
  }
  if (roll < 0.55) {
    state.inventory.beerBottle += 1;
    updateInventory();
    logBattle("Found a Beer Bottle!");
    return;
  }
  if (roll < 0.70) {
    state.inventory.medicine += 1;
    updateInventory();
    logBattle("Found Medicine!");
    return;
  }
  if (roll < 0.85) {
    state.inventory.yellowPear += 1;
    updateInventory();
    logBattle("Found a Yellow Pear!");
    return;
  }
  if (roll < 1.0) {
    state.inventory.mushroom += 1;
    updateInventory();
    logBattle("Found a Mushroom!");
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

  evolutionMessage.textContent = `Congratulations, your ${previous.name} has become ${evolved.name}.`;

  evolutionOld.classList.add("fade-out");
  evolutionNew.classList.add("reveal");

  if (evolutionContinue) {
    evolutionContinue.focus();
  }
}

function showEndScreen(playerWon) {
  stopEndScreen();
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

function trackDebugSequence(event) {
  const key = event.code === "Space" ? "space" : event.key.toLowerCase();
  debugSequence.push(key);
  if (debugSequence.length > 3) {
    debugSequence.shift();
  }
  if (debugSequence.join("-") === "space-d-space") {
    debugSequence = [];
    if (!actionMenu.classList.contains("hidden")) {
      const pool = state.characters.filter((char) => char.stage === "Ultimate");
      if (pool.length > 0) {
        state.player = pool[Math.floor(Math.random() * pool.length)];
        updateCaretakerInfo();
        startSpritePreview();
        finalChallengeButton.classList.remove("hidden");
      }
      return;
    }
    state.debugEvo = true;
    logBattle("Debug: Evolution chance set to 100% for next win.");
  }
}

function playBattleEnd(playerWon) {
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

function getBattleSprites() {
  const playerSprite = battleScreen.querySelector(
    '.character-sprite[data-role="player"]'
  );
  const opponentSprite = battleScreen.querySelector(
    '.character-sprite[data-role="opponent"]'
  );
  return { playerSprite, opponentSprite };
}

function animateAttack(attackerRole, defenderRole, attacker, attack, hit) {
  return new Promise((resolve) => {
    const { playerSprite, opponentSprite } = getBattleSprites();
    const attackerSprite =
      attackerRole === "player" ? playerSprite : opponentSprite;
    const defenderSprite =
      defenderRole === "player" ? playerSprite : opponentSprite;
    const defenderFrame = defenderSprite?.closest(".battle-sprite-frame");

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

    const timeouts = [];
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
      img.src = getSpecialProjectile(attack);
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
    battleScreen.querySelector(".battle").append(projectile);

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
