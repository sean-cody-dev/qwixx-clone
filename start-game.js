// DOM element definition
const startGameBtn = document.getElementById('start-game-button');
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
}

// initializes scoreTrack
function initializeScoreTrack() {
    const minRoll = 2;
    const maxRoll = 12;
    for (let color of gameColors) {
        scoreTrack[color] = {
            open: [],
            closed: [],
            scored: []
        };
        for (let roll = minRoll; roll <= maxRoll; roll++ ) {
            scoreTrack[color].open.push(roll);        }
    }
};
// displays game elements
function revealGame() {
    startGameBtn.classList.add('hidden');
    rollDiceBtn.classList.remove('hidden');
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

// creates a scoretrack to display below the score button options
function displayScoreTrack() {
    // initial load
    // create a separate row for each color
    const colors = Object.keys(scoreTrack);
    colors.forEach(color => {
        const scoreRow = document.createElement('div');
        setAttributes(scoreRow, {
            class: 'score-row',
            id: `score-row-${color}`
        });
        
        // TODO: create icon for each score value in the open array
        scoreTrack[color].open.forEach(scoreOption => {
            const scoreIcon = document.createElement('i');
            setAttributes(scoreIcon, {
                class: `fa-solid fa-${scoreOption}`
            });
            scoreRow.appendChild(scoreIcon);
        })
        scoreRowContainer.appendChild(scoreRow);
    });
}


// Event Listeners
startGameBtn.addEventListener('click', initializeGame);

