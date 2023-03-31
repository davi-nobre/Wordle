import { correctWord, isWordValid } from "./words.js";

console.warn(isWordValid(correctWord)); //! DEBUG

let grid = document.getElementById("grid");
let keyboard = document.getElementById("keyboard");

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

    let sqr2 = document.createElement("div");
    sqr2.className = "sqr2";
    sqr2.id = `s${i}`;
    sqr2.style.left = square.getBoundingClientRect().left + "px";
    sqr2.style.top = square.getBoundingClientRect().top + "px";

    console.log(square.getBoundingClientRect());

    grid.append(sqr2);
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
            typed();
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
                    erase();
                    break;
                case "Enter":
                    enter();
                    break;
            }
    }
});

// Add Virtual Keyboard
for (let i = 0; i < 28; i++) {
    let key = document.createElement("div");
    let letter = [
        "q",
        "w",
        "e",
        "r",
        "t",
        "y",
        "u",
        "i",
        "o",
        "p",
        "a",
        "s",
        "d",
        "f",
        "g",
        "h",
        "j",
        "k",
        "l",
        "delete",
        "z",
        "x",
        "c",
        "v",
        "b",
        "n",
        "m",
        "enter",
    ][i].toUpperCase();

    key.id = letter;
    key.innerHTML =
        letter !== "DELETE" ? letter : `<img src="backspace.svg" />`;

    key.className = "key";

    keyboard.append(key);
    key.addEventListener("click", () => clickedLetter(letter));
}

function typed() {
    getSquare(selected).animate(
        [
            { transform: "scale(1)" },
            { transform: "scale(1.15)", offset: 0.3 },
            { transform: "scale(1)" },
        ],
        { duration: 150, iterations: 1 }
    );

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
}

function erase() {
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
}

function enter() {
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
                window.alert("Você Perdeu :((\n\n" + isWordValid(correctWord));
                finish();
            }
    }
}

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
            let sqr2 = document.getElementById(`s${row * 5 + i}`);

            sqr.innerHTML = accentWord[i];
            sqr2.innerHTML = accentWord[i];
            sqr2.classList.add("green");

            // Keyboard
            document.getElementById(word[i]).classList.add("green");
            document.getElementById(word[i]).classList.remove("yellow");
            document.getElementById(word[i]).classList.remove("keyBlack");

            animateSqr(sqr, sqr2); // Spin Letter

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
                    let sqr2 = document.getElementById(`s${row * 5 + i}`);
                    sqr.innerHTML = accentWord[i];
                    sqr2.innerHTML = accentWord[i];
                    sqr2.classList.add("yellow");

                    // Keyboard
                    let key = document.getElementById(word[i]);
                    if (!key.classList.contains("green")) {
                        key.classList.add("yellow");
                        key.classList.remove("keyBlack");
                    }

                    animateSqr(sqr, sqr2); // Spin Letter

                    appeared[word[i]]++;
                } else addBlack(i);
            } else addBlack(i);
        }
    }

    function addBlack(i) {
        let sqr = getSquare(row * 5 + i);
        let sqr2 = document.getElementById(`s${row * 5 + i}`);
        sqr.innerHTML = accentWord[i];
        sqr2.innerHTML = accentWord[i];
        sqr2.classList.add("black");

        // Keyboard
        let key = document.getElementById(word[i]);
        if (
            !key.classList.contains("green") &&
            !key.classList.contains("yellow")
        )
            key.classList.add("keyBlack");

        animateSqr(sqr, sqr2); // Spin Letter
    }

    if (word === correctWord) {
        window.alert("Você acertou\n\n" + isWordValid(correctWord));
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

function animateSqr(sqr, sqr2) {
    sqr.animate(
        [
            { transform: "rotateY(0deg)" },
            { transform: "rotateY(-90deg)", offset: 0.3 },
            { transform: "rotateY(-90deg)" },
        ],
        { duration: 1000, iterations: 1, fill: "forwards" }
    );

    sqr2.animate(
        [
            { transform: "rotateY(0deg)" },
            { transform: "rotateY(-90deg)", offset: 0.3 },
            { transform: "rotateY(0deg)" },
        ],
        { duration: 1000, iterations: 1, fill: "forwards" }
    );
}

function finish() {
    freeze = true;
    getSquare(selected).classList.remove("selected");

    const timeout = setTimeout(() => window.location.reload(true), 2000);
}

function clickedLetter(letter) {
    if (letter == "ENTER") enter();
    else if (letter == "DELETE") erase();
    else if (!freeze && typing) {
        getSquare(selected).innerHTML = letter;
        typed();
    }
}

//* Math Helpers

function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

function wrap(value, min, max) {
    return Math.max(min, min + ((value - min) % (max - min + 1)));
}
