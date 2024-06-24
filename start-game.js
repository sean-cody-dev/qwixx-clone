// DOM element definition
const startGameBtn = document.getElementById('start-game-button');
const passBtn = document.getElementById('pass-button');
const scoreRowContainer = document.getElementById('score-row-container');

// Resets global variables for new game
function initializeGame() {
    // sets all dice to active
    activeDice = {
        green: true,
        red: true,
        blue: true,
        yellow: true,
        whiteOne: true,
        whiteTwo: true,
    }

    initializeScoreTrack();
    revealGame();
    displayScoreTrack();
}

// initializes scoreTrack
function initializeScoreTrack() {
    const minRoll = 2;
    const maxRoll = 12;
    // resets the scoreTrack to empty
    gameColors.forEach((color) => 
        {
            scoreTrack[color] = {
                open: [],
                closed: [],
                scored: []
            };
            if (color === 'red' || color === 'yellow'){
                // fills the open array with all possible roll values, ascending
                for (let roll = minRoll; roll <= maxRoll; roll++ ) {
                    scoreTrack[color].open.push(roll);        
                }
            }
    
            if (color === 'green' || color === 'blue'){
                // fills the open array with all possible roll values, descending
                for (let roll = maxRoll; roll >= minRoll; roll-- ) {
                    scoreTrack[color].open.push(roll);        
                }
            }
    
        }
    )
};

// displays game elements
function revealGame() {
    startGameBtn.classList.add('hidden');
    rollDiceBtn.classList.remove('hidden');
    passBtn.classList.remove('hidden');
    diceContainer.classList.remove('hidden');
    // populates DOM with buttons for choosing score
    gameColors.forEach(color => {
        const gameRow = document.createElement('div')
        setAttributes(gameRow, {
            class: `score-buttons-row ${color}`,
            id: `${color}-score-buttons-row`
        });
        gameContainer.appendChild(gameRow);
    })
}

// Update the DOM with a scoretrack
function displayScoreTrack() {
    gameColors.forEach((color) => {
        const buttonRow = document.getElementById(`${color}-score-buttons-row`); // Get the div for this color

        // Create buttons for sorted and unique options
        scoreTrack[color].open.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'circle-button';
            button.classList.add('score-button');
            setAttributes(button, {
                value: option,
                color: color,
            });
            button.addEventListener('click', (e) => markScore(e.target));
        buttonRow.appendChild(button); // Append the button to the corresponding div
    });
    // Close Button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = `<i class="fa-solid fa-lock" color=${color}></i>`;
    closeButton.classList.add('circle-button', 'score-button', 'button-closed');
    setAttributes(closeButton, {
        color: color,
    });

    closeButton.addEventListener('click', (e) => closeColor(e));
    buttonRow.appendChild(closeButton); // Append the button to the corresponding div

});
}

// Event Listeners
startGameBtn.addEventListener('click', initializeGame);

