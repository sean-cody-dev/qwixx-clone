// DOM element definition
const rollDiceBtn = document.getElementById('roll-dice-button')
const gameContainer = document.getElementById('score-buttons-container');
const diceContainer = document.getElementById('dice-container');

// game parameters
const gameColors = ['red', 'yellow', 'green', 'blue'];

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
// shows dice roll
function showDiceRoll() {
    const colors = Object.keys(currentDiceRoll); // Get all color keys from the scoreOptions object
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

    // TODO: make this code DRYer
    // get dice icon for white dice
    const whiteOneDice = document.getElementById('dice-white-one');
    const whiteTwoDice = document.getElementById('dice-white-two');

    whiteOneDice.className = `fa-solid fa-dice-${valueMap[currentDiceRoll.whiteOne]}`;
    whiteTwoDice.className = `fa-solid fa-dice-${valueMap[currentDiceRoll.whiteTwo]}`;

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

            // FIXME: REFACTOR Make the following conditional segments dryer
            // if turnScoreCount >=2, reset button classes
            if (turnScoreCount >= 2) {
                button.classList.remove('button-available');
            } else if (availableSums.includes(buttonValue) && !scoreTrack[color].closed.includes(buttonValue) && !scoreTrack[color].scored.includes(buttonValue)) {
            // Only do this if button isn't already closed or scored
                button.classList.add('button-available');
            } else {
                button.classList.remove('button-available');
            }

            // If button is closed, show it as closed
            if (scoreTrack[color].closed.includes(buttonValue)) {
                button.classList.add('button-closed');
            } else {
                button.classList.remove('button-closed');
            }
            
            // If button is scored, show it as scored
            if (scoreTrack[color].scored.includes(buttonValue)) {
                button.classList.add('button-scored');
            } else {
                button.classList.remove('button-scored');            
            }

            // Lock Button Handling
            if (!buttonValue) {
                button.classList.add('button-closed');
            } 
            
            if (!buttonValue && scoreTrack[color].scored.length >= 5 && scoreTrack[color].open.length === 0) {
                button.classList.remove('button-closed');
            }

        });
    });

    // Enables/Disables Pass Button
    if (turnScoreCount < 2) {
        passBtn.classList.remove('button-disabled');
        passBtn.disabled = false;
    }

    if (turnScoreCount >= 2) {
        passBtn.classList.add('button-disabled');
        passBtn.disabled = true;
    }
}

// initiates a turn
function initiateTurn() {
    turnScoreCount = 0; // reset turnScoreCount
    scoredThisTurn = 0; // reset scoredThisTurn
    turnRoll();
    showDiceRoll();
    checkAvailableScores();
    // populates buttons with score options
    updateScoreButtons();
}

// rolls all active dice
function turnRoll() {
    for (diceColor in activeDice) {
        if (activeDice[diceColor]) {
            currentDiceRoll[diceColor] = rollDice();
        }
    };
};

// Marks score
function markScore(score) {
    if (turnScoreCount >= 2) {
        // alert to roll dice again
        alert('roll the dice again!');
    } else {
        
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

    // console.log(`Closed values left of ${scoreValue} for ${color}`);

}

function checkAvailableScores() {
    const whiteDiceNames = [];  // To store the names of white dice
    const whiteDiceValues = []; // To store the values of white dice
    const coloredDice = {};     // To store the values of colored dice

    // Separate white and colored dice into different arrays/objects
    Object.keys(currentDiceRoll).forEach((diceName) => {
        if (diceName.startsWith('white')) {
            whiteDiceNames.push(diceName);
            whiteDiceValues.push(currentDiceRoll[diceName]);
        } else {
            coloredDice[diceName] = currentDiceRoll[diceName];
        }
    });

    // Check the value of turnScoreCount and adjust scoreOptions accordingly
    Object.keys(coloredDice).forEach((color) => {
        scoreOptions[color] = [];

        if (turnScoreCount === 0) {
            // Only include the sum of the white dice
            if (whiteDiceValues.length === 2) {
                const sumOfWhites = whiteDiceValues[0] + whiteDiceValues[1];
                scoreOptions[color].push({
                    [whiteDiceNames[0]]: whiteDiceValues[0],
                    [whiteDiceNames[1]]: whiteDiceValues[1],
                    sum: sumOfWhites
                });
            } else if (whiteDiceValues.length === 1) {
                scoreOptions[color].push({
                    [whiteDiceNames[0]]: whiteDiceValues[0],
                    sum: whiteDiceValues[0]
                });
            }
        } else if (turnScoreCount === 1) {
            // Exclude the sum of the white dice
            whiteDiceValues.forEach((whiteValue, index) => {
                scoreOptions[color].push({
                    [color]: coloredDice[color],
                    [whiteDiceNames[index]]: whiteValue,
                    sum: coloredDice[color] + whiteValue
                });
            });
        } else {
            // console.error('Error: turnScoreCount is greater than one');
        }
    });

    // console.log('scoreOptions:', scoreOptions);
    return scoreOptions;

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

function chooseScore(chosenColor, chosenIndex) {
    // Get the chosen score object from the color and index
    const chosenScore = scoreOptions[chosenColor][chosenIndex];

    // Extract the dice used in the chosen score, excluding the 'sum' key
    const usedDice = Object.keys(chosenScore).filter(key => key !== 'sum');

    // Iterate over each color in scoreOptions
    for (let color in scoreOptions) {
        // Filter out objects that use any of the dice in the chosen score
        scoreOptions[color] = scoreOptions[color].filter(scoreObj => {
            // Check if this score object uses any of the same dice
            return !usedDice.some(dice => scoreObj.hasOwnProperty(dice));
        });
    }

    console.log(`Score of ${chosenScore.sum} chosen with dice ${usedDice.join(', ')}.`);
    return chosenScore.sum;  // Return the sum of the chosen score
}

// Removes color from activeDice object
function closeColor(e) {
    const color = e.target.attributes.color.value;
    activeDice[color] = false;

    const inactiveDice = document.getElementById(`dice-${color}`);
    setAttributes(inactiveDice, {
        style: 'color: #808080',
    });
}

// Event Listeners
rollDiceBtn.addEventListener('click', initiateTurn)
passBtn.addEventListener('click', handlePass)
