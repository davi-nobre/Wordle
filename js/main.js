import { correctWord, isWordValid } from "./words.js";

console.warn(isWordValid(correctWord)); //! DEBUG

let grid = document.getElementById("grid");
let selected = 0;
let row = 0;
let typing = true;
let freeze = false;

// Create all Squares
for (let i = 0; i < 5 * 6; i++) {
  let square = document.createElement("div");
  square.className = `square disabled`;
  square.id = `l${i}`;

  grid.append(square);
}

// Select first square
let squares = document.querySelectorAll(".square");
select(squares[0]);

// Remove disabled from row
function enableRow(row) {
  select(getSquare(row * 5));
  for (let i = row * 5; i <= row * 5 + 4; i++)
    getSquare(i).classList.remove("disabled");
}

enableRow(row);

// Allow to select with the mouse
squares.forEach((element) => {
  element.addEventListener("click", () => {
    if (!freeze) select(element);
  });
});

// Keyboard events
document.addEventListener("keydown", (e) => {
  if (!freeze) {
    let key = e.key;

    // Checks if char is a letter
    if (key.length === 1 && key.match(/[a-z]/i) && typing) {
      getSquare(selected).innerHTML = key.toUpperCase();

      // Select next Square
      for (let i = row * 5; i < row * 5 + 4; i++) {
        //// let k = row * 5 + ((selected + 1 + i) % 5);
        let k = wrap(selected + 1 + i, row * 5, row * 5 + 4);
        let sqr = getSquare(k);

        if (sqr.innerHTML === "") {
          select(sqr);
          break;
        }

        typing = false;
        getSquare(selected).classList.remove("selected");
      }
    } else
      switch (key) {
        case "ArrowRight":
        case " ":
          // Move right
          if (typing) {
            let newSel = clamp(selected + 1, row * 5, row * 5 + 4);
            select(getSquare(newSel));
          } else select(getSquare(row * 5));

          break;
        case "ArrowLeft":
          // Move left
          if (typing) {
            let newSel = clamp(selected - 1, row * 5, row * 5 + 4);
            select(getSquare(newSel));
          } else select(getSquare(row * 5 + 4));
          break;
        case "Backspace":
          // Erase
          if (typing) {
            if (getSquare(selected).innerHTML !== "")
              getSquare(selected).innerHTML = "";
            // Don't erase if it is in the left edge
            else if (selected > row * 5) {
              let sqr = getSquare(selected - 1);

              sqr.innerHTML = "";
              select(sqr);
            }
          } else {
            let sqr = getSquare(row * 5 + 4);

            sqr.innerHTML = "";
            select(sqr);
          }
          break;
        case "Enter":
          let word = "";
          let completed = true;

          for (let i = row * 5; i <= row * 5 + 4; i++) {
            if (getSquare(i).innerHTML === "") completed = false;
            word += getSquare(i).innerHTML;
          }

          if (completed) {
            if (checkWord(word))
              if (row !== 5) enableRow(++row);
              else {
                window.alert("Você Perdeu :((", isWordValid(correctWord));
                finish();
              }
          }
          break;
      }
  }
});

function getSquare(idNum) {
  return document.getElementById("l" + idNum);
}

function select(self) {
  typing = true;
  let idNum = self.id.match(/\d+/)[0];
  let idRow = Math.floor(idNum / 5);

  if (idRow === row) {
    getSquare(selected).classList.remove("selected");
    selected = +idNum;
    getSquare(selected).classList.add("selected");
  }
}

function checkWord(word) {
  let accentWord = isWordValid(word);
  if (accentWord === "") {
    window.alert("Word not on list"); //! Debugging
    return false;
  }

  let appeared = {};
  for (let i = 0; i < 5; i++) appeared[correctWord[i]] = 0;

  let greenPositions = [];
  //* GREEN
  for (let i = 0; i < 5; i++) {
    if (word[i] === correctWord[i]) {
      let sqr = getSquare(row * 5 + i);
      sqr.classList.add("green");
      sqr.innerHTML = accentWord[i];

      appeared[word[i]]++;
      greenPositions.push(i);
    }
  }

  //* YELLOW
  for (let i = 0; i < 5; i++) {
    if (greenPositions.indexOf(i) === -1) {
      if (correctWord.search(word[i]) !== -1) {
        if (appeared[word[i]] < letterCount(correctWord, word[i])) {
          let sqr = getSquare(row * 5 + i);
          sqr.classList.add("yellow");
          sqr.innerHTML = accentWord[i];
          appeared[word[i]]++;
        } else addBlack(i);
      } else addBlack(i);
    }
  }

  function addBlack(i) {
    let sqr = getSquare(row * 5 + i);
    sqr.classList.add("black");
    sqr.innerHTML = accentWord[i];
  }

  if (word === correctWord) {
    window.alert("Você acertou", isWordValid(correctWord));
    finish();

    return false;
  }

  return true;
}

function letterCount(word, letter) {
  let count = 0;
  for (let c of word) {
    if (c === letter) count++;
  }
  return count;
}

function finish() {
  freeze = true;
  getSquare(selected).classList.remove("selected");

  const timeout = setTimeout(() => window.location.reload(true), 2000);
}

//* Math Helpers

function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

function wrap(value, min, max) {
  return Math.max(min, min + ((value - min) % (max - min + 1)));
}
