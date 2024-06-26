// DOM element definition
const rollDiceBtn = document.getElementById('roll-dice-button')
const gameContainer = document.getElementById('score-buttons-container');
const diceContainer = document.getElementById('dice-container');

// game parameters
const gameColors = ['red', 'yellow', 'green', 'blue'];
const whiteDiceNames = ['whiteOne', 'whiteTwo'];  // To store the names of white dice

// game state
let activeDice = {};
let currentDiceRoll = {};
let scoreTrack = {};
let scoreOptions = {};
let isInitialRoll = true;
let turnScoreCount = 0;
let scoredThisTurn = 0;
let penaltyCount = 0;

// Rolls a single dice
function rollDice() {
    return diceValue = Math.floor(Math.random()*6)+1;
}

// rolls all active dice
function turnRoll() {
    Object.keys(activeDice).forEach((diceColor) => {
        if (activeDice[diceColor]) {
            currentDiceRoll[diceColor] = rollDice();
        }
    })
};

// Updates DOM with Dice Roll Values
function showDiceRoll() {
    const colors = Object.keys(currentDiceRoll); // Get all color keys from the scoreOptions object
    
    // Map dice roll values to text strings for icon classes
    const valueMap = {
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: 'six'
    }

    colors.forEach(color => {
        // only do this for colored dice
        if (!isWhite(color)) {
            const dice = document.getElementById(`dice-${color}`); // get the dice icon for this color
            const diceValue = currentDiceRoll[color]; // get dice roll for color
            dice.className = `fa-solid fa-dice-${valueMap[diceValue]}`; // update icon class for dice value
        }
        });

    // get dice icon for white dice
    const whiteOneDice = document.getElementById('dice-white-one');
    const whiteTwoDice = document.getElementById('dice-white-two');

    whiteOneDice.className = `fa-solid fa-dice-${valueMap[currentDiceRoll.whiteOne]}`;
    whiteTwoDice.className = `fa-solid fa-dice-${valueMap[currentDiceRoll.whiteTwo]}`;

}

function checkAvailableScores() {
    const whiteDiceValues = []; // To store the values of white dice
    const coloredDice = {};     // To store the values of colored dice

    // Separate white and colored dice into different arrays/objects
    Object.keys(currentDiceRoll).forEach((diceName) => {
        if (diceName.startsWith('white')) {
            whiteDiceValues.push(currentDiceRoll[diceName]);
        } else {
            coloredDice[diceName] = currentDiceRoll[diceName];
        }
    });

    // Check the value of turnScoreCount and adjust scoreOptions accordingly
    Object.keys(coloredDice).forEach((color) => {
        scoreOptions[color] = [];

        // Initial scoring only includes sum of the white dice
        if (turnScoreCount === 0) {
            const sumOfWhites = whiteDiceValues[0] + whiteDiceValues[1];
            scoreOptions[color].push({
                [whiteDiceNames[0]]: whiteDiceValues[0],
                [whiteDiceNames[1]]: whiteDiceValues[1],
                sum: sumOfWhites
            });
        } 
        
        // Second scoring includes sum of either white dice and colored dice
        if (turnScoreCount === 1) {
            whiteDiceValues.forEach((whiteValue, index) => {
                scoreOptions[color].push({
                    [color]: coloredDice[color],
                    [whiteDiceNames[index]]: whiteValue,
                    sum: coloredDice[color] + whiteValue
                });
            });
        }
    });
}

// Updates existing score buttons
function updateScoreButtons() {
    const colors = Object.keys(scoreOptions); // Get all color keys from the scoreOptions object

    colors.forEach(color => {
        const buttonRow = document.getElementById(`${color}-score-buttons-row`); // Get the div for this color

        if (!buttonRow) {
            console.error(`No element found for ${color}-score-buttons-row`);
            return;
        }

        const buttons = buttonRow.getElementsByTagName('button'); // Get all buttons in the row
        const availableSums = scoreOptions[color].map(option => option.sum); // Get all available sums for the color

        Array.from(buttons).forEach(button => {
            const buttonValue = parseInt(button.getAttribute('value'), 10); // Get the value attribute of the button as an integer

            // if turnScoreCount >=2, reset button classes
            if (turnScoreCount >= 2) {
                button.classList.remove('button-available');
            } else if (availableSums.includes(buttonValue) && scoreTrack[color].open.includes(buttonValue)) {
                // Only do this if button isn't already closed or scored
                button.classList.add('button-available');
            } else {
                button.classList.remove('button-available');
            }

            // If button is closed, show it as closed
            if (scoreTrack[color].closed.includes(buttonValue)) {
                button.classList.add('button-closed');
            }
            
            // If button is scored, show it as scored
            if (scoreTrack[color].scored.includes(buttonValue)) {
                button.classList.add('button-scored');
            }

            // Lock Button Handling
            if (!buttonValue) { // lock buttons have no buttonValue
                button.classList.add('button-closed');
            } 
            
            // lock button is active when 5 or more buttons have been scored and there are no open buttons left
            if (!buttonValue && scoreTrack[color].scored.length >= 5 && scoreTrack[color].open.length === 0 && activeDice[color] === true) {
                button.classList.remove('button-closed');
                button.classList.add('button-available');
            }
        });
    });

    // Enables/Disables Pass Button
    if (turnScoreCount < 2) {
        passBtn.classList.remove('button-disabled');
        rollDiceBtn.classList.add('button-disabled');
    }

    if (turnScoreCount >= 2) {
        passBtn.classList.add('button-disabled');
        rollDiceBtn.classList.remove('button-disabled');
    }
}

// initiates a turn
function initiateTurn() {
    turnScoreCount = 0; // reset turnScoreCount
    scoredThisTurn = 0; // reset scoredThisTurn
    turnRoll();
    showDiceRoll();
    checkAvailableScores();
    updateScoreButtons();
}

// Closes values less than all scored, unless marked as scored
function closeScores(score) {
    const color = score.attributes.color.value;
    const scoreValue = Number(score.value);
    const valuesToClose = [];

    if (scoreTrack[color].scored.length === 0) {
        console.log('No scores have been made yet for this color.');
        return;
    }

    // Get the highest scored value
    const highestScored = Math.max(...scoreTrack[color].scored);

    // If red or yellow
    if (color === 'red' || color === 'yellow') {
        // Find all open values that are less than the highest scored value
        valuesToClose.push(...scoreTrack[color].open.filter(value => value < scoreValue && !scoreTrack[color].scored.includes(value)));

        // Remove these values from 'open'
        scoreTrack[color].open = scoreTrack[color].open.filter(value => value >= scoreValue);
    }

    // If green or blue
    if (color === 'green' || color === 'blue') {
        // Find all open values that are less than the highest scored value
        valuesToClose.push(...scoreTrack[color].open.filter(value => value > scoreValue && !scoreTrack[color].scored.includes(value)));
        
        // Remove these values from 'open'
        scoreTrack[color].open = scoreTrack[color].open.filter(value => value <= scoreValue);
    }

    // Add these values to 'closed'
    scoreTrack[color].closed.push(...valuesToClose);
}

// Marks score
function markScore(score) {
    if (turnScoreCount < 2) {
        
        const color = score.attributes.color.value;
        const value = Number(score.value);
        
        // Check if the score is already scored
        if (scoreTrack[color].scored.includes(value)) {
            console.log('already scored');
            return;
        }
        
        // Check if the score is closed
        if (scoreTrack[color].closed.includes(value)) {
            console.log('cannot score this one');
            return;
        }
        
        // Check if the score is open and can be scored
        if (scoreTrack[color].open.includes(value)) {
            // console.log('scored');
            // Remove the value from 'open'
            scoreTrack[color].open = scoreTrack[color].open.filter(item => item !== value);
            // Add the value to 'scored'
            scoreTrack[color].scored.push(value);
        }
        turnScoreCount++;
        scoredThisTurn++;
        // console.log('current scoreTrack:', scoreTrack);
        closeScores(score);
        checkAvailableScores();
        updateScoreButtons();
    }
}

// Handles Passing on a Score
function handlePass() {
    turnScoreCount++; // increment score count
    checkAvailableScores();
    updateScoreButtons();

    // if no points were scored this turn, player gets a penalty
    if (turnScoreCount >= 2 && scoredThisTurn === 0) {
        penaltyCount++;
    }

    // Add a penalty mark in the DOM
    for (let i = 0; i < penaltyCount; i++ ) {
        const penaltyBox = document.getElementById(`penalty-count-box-${i+1}`);
        penaltyBox.innerHTML = '<i class="fa-solid fa-xmark">';
    }

    if (penaltyCount >= 4) {
        endGame();
    }
}

// Helper function to check if a dice name represents a white dice
function isWhite(diceName) {
    return diceName.startsWith('white');
}

// Helper function to set attributes on DOM elements
function setAttributes(element, attributes) {
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    };
};

function endGame() {
    const penaltyScoreBox = document.getElementById('score-box-penalty')
    const totalScoreBox = document.getElementById('score-box-total');

    // Game Buttons are hidden
    // New Game Button Appears
    startGameBtn.classList.remove('hidden');
    rollDiceBtn.classList.add('hidden');
    passBtn.classList.add('hidden');

    const gameScore = {
        total: 0,
    };

    // Score is calculated
    // for each color...
    Object.keys(scoreTrack).forEach((diceColor) => {
        const scoreBox = document.getElementById(`score-box-${diceColor}`);
        // Score value Map from game instructions
        const scoreValueMap = {
            1: 1,
            2: 3,
            3: 6,
            4: 10,
            5: 15,
            6: 21,
            7: 28,
            8: 36,
            9: 45,
            10: 55,
            11: 66,
            12: 78,
        };

        // number of scored is tallied
        let scoreTally = scoreTrack[diceColor].scored.length;
        // tally is mapped to a score value
        gameScore[diceColor] = scoreValueMap[scoreTally] || 0;
        gameScore.total += gameScore[diceColor];

        // Score is displayed
        scoreBox.textContent = gameScore[diceColor];
    });

    // console.log('gameScore:', JSON.stringify(gameScore, null, 2)); // Pretty print the object

    // Calculate Penalties
    const penaltyScore = penaltyCount * 5;
    penaltyScoreBox.textContent = penaltyScore;

    // Calculate Total Score
    gameScore.total -= penaltyScore;
    console.log('gameScore.total:', gameScore.total);
    totalScoreBox.textContent = gameScore.total;
}

function checkForEndGame() {
    let closedDice = 0;

    // Loop through activeDice Object
    Object.keys(activeDice).forEach((diceColor) => {
        if (!activeDice[diceColor]) {
            closedDice++;
        }
    })

    if (closedDice >=2) {
        endGame();
    }
}
    
// Removes color from activeDice object
function closeColor(e) {
    const color = e.target.attributes.color.value;
    activeDice[color] = false;

    const inactiveDice = document.getElementById(`dice-${color}`);
    setAttributes(inactiveDice, {
        style: 'color: #808080',
    });

    updateScoreButtons();

    // Check for end game conditions
    checkForEndGame();
}

// Event Listeners
rollDiceBtn.addEventListener('click', initiateTurn)
passBtn.addEventListener('click', handlePass)
