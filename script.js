const singlePlayerButton = document.getElementById("single-player");
const exitButton = document.getElementById("exit");
const mainMenu = document.getElementById("main-menu");
const characterMenu = document.getElementById("character-menu");
const playerList = document.getElementById("player-list");
const opponentList = document.getElementById("opponent-list");
const startGameButton = document.getElementById("start-game");
const backButton = document.getElementById("back");

const state = {
  characters: [],
  player: null,
  opponent: null,
};

singlePlayerButton.addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  characterMenu.classList.remove("hidden");
  if (state.characters.length === 0) {
    loadCharacters();
  }
});

exitButton.addEventListener("click", () => {
  console.log("Exit selected");
});

backButton.addEventListener("click", () => {
  characterMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

startGameButton.addEventListener("click", () => {
  if (!state.player || !state.opponent) {
    return;
  }
  console.log("Starting game with", state.player, state.opponent);
});

async function loadCharacters() {
  try {
    const response = await fetch("data/characters.json");
    if (!response.ok) {
      throw new Error("Failed to load character data");
    }
    const data = await response.json();
    state.characters = Array.isArray(data) ? data : data.characters || [];
    renderCharacterLists();
  } catch (error) {
    console.error(error);
  }
}

function renderCharacterLists() {
  playerList.innerHTML = "";
  opponentList.innerHTML = "";

  state.characters.forEach((character) => {
    const playerCard = createCharacterCard(character, "player");
    const opponentCard = createCharacterCard(character, "opponent");
    playerList.append(playerCard);
    opponentList.append(opponentCard);
  });
}

function createCharacterCard(character, type) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "character-card";
  card.dataset.id = character.id;

  const name = document.createElement("h3");
  name.className = "character-name";
  name.textContent = character.name || "Unknown";

  const meta = document.createElement("p");
  meta.className = "character-meta";
  meta.textContent = character.description || "No description yet.";

  card.append(name, meta);

  card.addEventListener("click", () => {
    if (type === "player") {
      state.player = character;
      updateSelection(playerList, character.id);
    } else {
      state.opponent = character;
      updateSelection(opponentList, character.id);
    }
    startGameButton.disabled = !(state.player && state.opponent);
  });

  return card;
}

function updateSelection(list, selectedId) {
  list.querySelectorAll(".character-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === String(selectedId));
  });
}
