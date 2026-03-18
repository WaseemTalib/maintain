const WIN_SCORE = 5;
const FACE_MAP = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const playerDie = document.querySelector("#player-die");
const computerDie = document.querySelector("#computer-die");
const playerCard = document.querySelector("#player-card");
const computerCard = document.querySelector("#computer-card");
const playerScore = document.querySelector("#player-score");
const computerScore = document.querySelector("#computer-score");
const roundCount = document.querySelector("#round-count");
const playerValue = document.querySelector("#player-value");
const computerValue = document.querySelector("#computer-value");
const status = document.querySelector("#status");
const historyList = document.querySelector("#history-list");
const rollButton = document.querySelector("#roll-button");
const resetButton = document.querySelector("#reset-button");

const state = {
  round: 0,
  player: 0,
  computer: 0,
  history: [],
  locked: false,
};

function randomDieValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function updateDieFace(dieElement, value) {
  const pips = dieElement.querySelectorAll(".pip");
  const activePips = FACE_MAP[value];

  pips.forEach((pip, index) => {
    pip.classList.toggle("is-on", activePips.includes(index));
  });
}

function setStatus(message, tone = "") {
  status.textContent = message;
  status.className = "status";

  if (tone) {
    status.classList.add(tone);
  }
}

function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML =
      '<li class="empty-state">Your latest rolls will appear here.</li>';
    return;
  }

  historyList.innerHTML = "";

  state.history.slice(0, 8).forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    historyList.append(item);
  });
}

function renderScores() {
  playerScore.textContent = String(state.player);
  computerScore.textContent = String(state.computer);
  roundCount.textContent = String(state.round);
}

function matchWinner() {
  if (state.player >= WIN_SCORE) {
    return "player";
  }

  if (state.computer >= WIN_SCORE) {
    return "computer";
  }

  return "";
}

function resetMatch() {
  state.round = 0;
  state.player = 0;
  state.computer = 0;
  state.history = [];
  state.locked = false;

  updateDieFace(playerDie, 1);
  updateDieFace(computerDie, 1);
  playerValue.textContent = "1";
  computerValue.textContent = "1";
  renderScores();
  renderHistory();
  setStatus("Ready when you are. First to five points wins the match.");
  rollButton.disabled = false;
}

function roundSummary(round, playerRoll, computerRoll, outcome) {
  if (outcome === "win") {
    return "Round " + round + ": player wins " + playerRoll + " to " + computerRoll + ".";
  }

  if (outcome === "loss") {
    return "Round " + round + ": house wins " + computerRoll + " to " + playerRoll + ".";
  }

  return "Round " + round + ": both sides rolled " + playerRoll + ".";
}

async function handleRoll() {
  if (state.locked) {
    return;
  }

  state.locked = true;
  rollButton.disabled = true;
  playerCard.classList.add("rolling");
  computerCard.classList.add("rolling");
  setStatus("Rolling the dice...", "tie");

  await wait(520);

  const playerRoll = randomDieValue();
  const computerRoll = randomDieValue();
  let tone = "tie";
  let message = "A draw keeps the pressure on.";
  let summaryType = "tie";

  state.round += 1;
  updateDieFace(playerDie, playerRoll);
  updateDieFace(computerDie, computerRoll);
  playerValue.textContent = String(playerRoll);
  computerValue.textContent = String(computerRoll);

  if (playerRoll > computerRoll) {
    state.player += 1;
    tone = "win";
    summaryType = "win";
    message =
      "You take round " +
      state.round +
      " with a " +
      playerRoll +
      " against " +
      computerRoll +
      ".";
  } else if (computerRoll > playerRoll) {
    state.computer += 1;
    tone = "loss";
    summaryType = "loss";
    message =
      "The house takes round " +
      state.round +
      " with a " +
      computerRoll +
      " against " +
      playerRoll +
      ".";
  } else {
    message = "Round " + state.round + " is a stalemate at " + playerRoll + ".";
  }

  state.history.unshift(
    roundSummary(state.round, playerRoll, computerRoll, summaryType)
  );

  renderScores();
  renderHistory();

  const winner = matchWinner();
  if (winner === "player") {
    setStatus(
      "Match won. You reached " +
        WIN_SCORE +
        " points first with a score of " +
        state.player +
        "-" +
        state.computer +
        ".",
      "win"
    );
  } else if (winner === "computer") {
    setStatus(
      "Match over. The house got to " +
        WIN_SCORE +
        " first and wins " +
        state.computer +
        "-" +
        state.player +
        ".",
      "loss"
    );
  } else {
    setStatus(message, tone);
    rollButton.disabled = false;
  }

  playerCard.classList.remove("rolling");
  computerCard.classList.remove("rolling");
  state.locked = false;
}

rollButton.addEventListener("click", handleRoll);
resetButton.addEventListener("click", resetMatch);

resetMatch();
