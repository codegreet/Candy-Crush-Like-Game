let board = [];
let rows = 6;
let cols = 6;
let score = 0;
let movesLeft = 10;
let level = 1;
let selectedCandy = null;
const maxLevels = 10;

// Load candies from JSON and build the board
async function initGame() {
  const res = await fetch("data/candies.json");
  const candies = await res.json();

  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  board = [];

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      const candy = candies[Math.floor(Math.random() * candies.length)];
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.backgroundColor = candy.color;
      cell.id = `cell-${r}-${c}`;
      cell.addEventListener("click", handleCandyClick);
      boardEl.appendChild(cell);
      row.push(candy.color);
    }
    board.push(row);
  }

  updateStatus();
}

function handleCandyClick(e) {
  const cell = e.target;
  if (!selectedCandy) {
    selectedCandy = cell;
    cell.style.outline = "2px solid white";
  } else {
    const prev = selectedCandy;
    selectedCandy.style.outline = "none";

    if (cell.id !== prev.id) {
      swapCandies(prev, cell);
      movesLeft--;
      checkMatches();
      updateStatus();

      if (movesLeft <= 0) {
        nextLevel();
      }
    }
    selectedCandy = null;
  }
}

function swapCandies(cell1, cell2) {
  const tempColor = cell1.style.backgroundColor;
  cell1.style.backgroundColor = cell2.style.backgroundColor;
  cell2.style.backgroundColor = tempColor;
}

function checkMatches() {
  let matchFound = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const cell1 = document.getElementById(`cell-${r}-${c}`);
      const cell2 = document.getElementById(`cell-${r}-${c + 1}`);
      const cell3 = document.getElementById(`cell-${r}-${c + 2}`);

      if (
        cell1.style.backgroundColor === cell2.style.backgroundColor &&
        cell2.style.backgroundColor === cell3.style.backgroundColor
      ) {
        score += 10;
        matchFound = true;
      }
    }
  }

  if (matchFound) updateStatus();
}

function updateStatus() {
  document.getElementById("level").textContent = level;
  document.getElementById("score").textContent = score;
  document.getElementById("moves").textContent = movesLeft;
}

function nextLevel() {
  if (level < maxLevels) {
    level++;
    movesLeft = 10;
    alert(`Level ${level - 1} complete! Starting Level ${level}...`);
    initGame();
  } else {
    alert(`🎉 Congratulations! You finished all ${maxLevels} levels!`);
    resetGame();
  }
}

function resetGame() {
  level = 1;
  score = 0;
  movesLeft = 10;
  initGame();
}

// ----------- AI Hint via Groq ------------
async function getAIHint() {
  const hintDiv = document.getElementById("hint");
  hintDiv.textContent = "Fetching AI hint...";

  const boardColors = [];
  for (let r = 0; r < rows; r++) {
    const rowColors = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      rowColors.push(cell.style.backgroundColor);
    }
    boardColors.push(rowColors);
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: boardColors }),
    });

    const data = await res.json();

    if (data.hint) {
      hintDiv.textContent = `Hint: ${data.hint}`;
    } else {
      hintDiv.textContent = "Hint: No suggestion from AI.";
    }
  } catch (err) {
    hintDiv.textContent = "Hint: Error fetching AI hint.";
  }
}

window.onload = initGame;
