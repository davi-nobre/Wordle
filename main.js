let grid = document.getElementById("grid");
let selected = 0;
let row = 0;

// Create all Squares
for (let i = 0; i < 5 * 6; i++) {
    let order = ["one", "two", "three", "four", "five", "six"][
        Math.floor(i / 5)
    ];
    let square = document.createElement("div");
    square.className = `square ${order} disabled`;
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
    element.addEventListener("click", () => select(element));
});

document.addEventListener("keyup", (e) => {
    let key = e.key;

    // Checks if char is a letter
    if (key.length === 1 && key.match(/[a-z]/i)) {
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

            //todo - If reached here then Disable Typing
            //todo - (Backspace removes Last Letter)
            //todo - (Right Key goes to First Letter)
            //todo - (Left Key goes to Last Letter)
            //? (selected = 6)
        }
    } else
        switch (key) {
            case "ArrowRight":
            case " ":
                // Move right
                {
                    let newSel = clamp(selected + 1, row * 5, row * 5 + 4);
                    select(getSquare(newSel));
                }
                break;
            case "ArrowLeft":
                // Move left
                {
                    let newSel = clamp(selected - 1, row * 5, row * 5 + 4);
                    select(getSquare(newSel));
                }
                break;
            case "Backspace":
                // Erase
                if (getSquare(selected).innerHTML !== "")
                    getSquare(selected).innerHTML = "";
                // Don't erase if it is in the left edge
                else if (selected > row * 5) {
                    let sqr = getSquare(selected - 1);

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
                    checkWord(word);

                    //todo Check for game over
                    enableRow(++row);
                }
                break;
        }

    // console.log(key); //! Debug log
});

function getSquare(idNum) {
    return document.getElementById("l" + idNum);
}

function select(self) {
    let idNum = self.id.match(/\d+/)[0];
    let idRow = Math.floor(idNum / 5);

    if (idRow === row) {
        getSquare(selected).classList.remove("selected");
        selected = +idNum;
        getSquare(selected).classList.add("selected");

        // console.warn(self.id, selected); //! Debug Warn
    }
}

function checkWord(word) {
    //TODO
}

//* Math Helpers

function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

function wrap(value, min, max) {
    return Math.max(min, min + ((value - min) % (max - min + 1)));
}
