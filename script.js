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

// creates score buttons
// function createScoreButtons() {
//     const colors = Object.keys(scoreOptions); // Get all color keys from the scoreOptions object

//     colors.forEach(color => {
//         const buttonRow = document.getElementById(`${color}-score-buttons-row`); // Get the div for this color

//         if (!buttonRow) {
//             console.error(`No element found for ${color}-score-buttons-row`);
//             return;
//         }

//         buttonRow.innerHTML = ''; // Clear previous buttons

//         let seenSums = new Set(); // Set to track seen sums and ensure uniqueness

//         // Iterate over each option and create a button only for unique sum values
//         scoreOptions[color].forEach((option, index) => {
//             if (!seenSums.has(option.sum)) { // Check if the sum has not been seen
//                 seenSums.add(option.sum); // Mark this sum as seen

//                 const button = document.createElement('button'); // Create a new button
//                 button.textContent = option.sum; // Set button text to the sum
//                 button.className = 'circle-button'; // Assuming you have CSS styling for 'circle-button'
//                 button.classList.add('score-button'); // Add additional class if needed
//                 button.addEventListener('click', () => {
//                     console.log(`Button for ${color} with sum ${option.sum} clicked`);
//                     // Additional functionality upon clicking the button can be added here
//                 });

//                 buttonRow.appendChild(button); // Append the button to the corresponding div
//             }
//         });
//     });
// }

function createScoreButtons() {
    const colors = Object.keys(scoreOptions); // Get all color keys from the scoreOptions object

    colors.forEach(color => {
        const buttonRow = document.getElementById(`${color}-score-buttons-row`); // Get the div for this color

        if (!buttonRow) {
            console.error(`No element found for ${color}-score-buttons-row`);
            return;
        }

        buttonRow.innerHTML = ''; // Clear previous buttons

        let uniqueSums = new Set(); // Set to track unique sums
        let sortedOptions = []; // Array to hold sorted and unique options

        // First, filter out unique sums
        scoreOptions[color].forEach(option => {
            if (!uniqueSums.has(option.sum)) {
                uniqueSums.add(option.sum);
                sortedOptions.push(option);
            }
        });

        // Sort the options based on the color
        if (color === 'red' || color === 'yellow') {
            sortedOptions.sort((a, b) => a.sum - b.sum); // Ascending sort
        } else if (color === 'green' || color === 'blue') {
            sortedOptions.sort((a, b) => b.sum - a.sum); // Descending sort
        }

        // Create buttons for sorted and unique options
        sortedOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.sum;
            button.className = 'circle-button';
            button.classList.add('score-button');
            button.addEventListener('click', () => {
                console.log(`Button for ${color} with sum ${option.sum} clicked`);
                // Additional functionality upon clicking the button can be added here
            });

            buttonRow.appendChild(button); // Append the button to the corresponding div
        });
    });
}


// initiates a turn
function initiateTurn() {
    turnRoll();
    showDiceRoll();
    checkAvailableScores();
    // populates buttons with score options
    createScoreButtons();
}

// rolls all active dice
function turnRoll() {
    for (diceColor in activeDice) {
        currentDiceRoll[diceColor] = rollDice();
    };
    console.log('currentDiceRoll:', currentDiceRoll);
};

// Marks score
function markScore(score) {
    const color = score.color;
    const value = score.value;
    const colorTrack = scoreTrack[color];

    // Check if the score is already scored
    if (colorTrack.scored.includes(value)) {
        console.log('already scored');
        return;
    }

    // Check if the score is closed
    if (colorTrack.closed.includes(value)) {
        console.log('cannot score this one');
        return;
    }

    // Check if the score is open and can be scored
    if (colorTrack.open.includes(value)) {
        console.log('scored');
        // Remove the value from 'open'
        colorTrack.open = colorTrack.open.filter(item => item !== value);
        // Add the value to 'scored'
        colorTrack.scored.push(value);
    }
    console.log('current scoreTrack:', scoreTrack);
    closeScores(score);
}

// Closes values less than all scored, unless marked as scored
function closeScores(score) {
    const color = score.color;
    const colorTrack = scoreTrack[color];

    if (colorTrack.scored.length === 0) {
        console.log('No scores have been made yet for this color.');
        return;
    }

    // Get the highest scored value
    const highestScored = Math.max(...colorTrack.scored);

    // Find all open values that are less than the highest scored value
    const valuesToClose = colorTrack.open.filter(value => value < highestScored);

    // Remove these values from 'open'
    colorTrack.open = colorTrack.open.filter(value => value >= highestScored);

    // Add these values to 'closed'
    colorTrack.closed = colorTrack.closed.concat(valuesToClose);

    console.log(`Closed values less than ${highestScored} for ${color}`);
}

function checkAvailableScores() {
    const whiteDiceNames = [];  // To store the names of white dice
    const whiteDiceValues = []; // To store the values of white dice
    const coloredDice = {};     // To store the values of colored dice

    // Separate white and colored dice into different arrays/objects
    for (const diceName in currentDiceRoll) {
        if (diceName.startsWith('white')) {
            whiteDiceNames.push(diceName);
            whiteDiceValues.push(currentDiceRoll[diceName]);
        } else {
            coloredDice[diceName] = currentDiceRoll[diceName];
        }
    }

    // Calculate possible score values for each colored dice
    for (const color in coloredDice) {
        scoreOptions[color] = [];

        // Calculate scores with each white dice
        whiteDiceValues.forEach((whiteValue, index) => {
            scoreOptions[color].push({
                [color]: coloredDice[color],
                [whiteDiceNames[index]]: whiteValue,
                sum: coloredDice[color] + whiteValue
            });
        });

        // If there are two white dice, include their combined sum
        if (whiteDiceValues.length === 2) {
            const sumOfWhites = whiteDiceValues[0] + whiteDiceValues[1];
            // Also consider the sum of both white dice alone
            scoreOptions[color].push({
                [whiteDiceNames[0]]: whiteDiceValues[0],
                [whiteDiceNames[1]]: whiteDiceValues[1],
                sum: sumOfWhites
            });
        }
    }

    console.log('scoreOptions:', scoreOptions);
    return scoreOptions;
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

// Event Listeners
rollDiceBtn.addEventListener('click', initiateTurn)
