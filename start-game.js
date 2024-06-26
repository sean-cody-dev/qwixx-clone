// DOM element definition
const startGameBtn = document.getElementById('start-game-button');
const passBtn = document.getElementById('pass-button');
const penaltyTitle = document.getElementById('penalty-title');
const scoreTitle = document.getElementById('score-title');
const penaltyCountContainer = document.getElementById('penalty-count-container');
const scoreRowContainer = document.getElementById('score-row-container');

function resetDOM() {
    // reset score button rows
    gameContainer.innerHTML = ''; 

    // reset dice
    diceContainer.innerHTML = 
    `
    <i class="fa-solid fa-dice-one" style="color: #000000;" id="dice-white-one"></i>
    <i class="fa-solid fa-dice-one" style="color: #000000;" id="dice-white-two"></i>
    <i class="fa-solid fa-dice-one" style="color: #ff0000;" id="dice-red"></i>
    <i class="fa-solid fa-dice-one" style="color: #008000;" id="dice-green"></i>
    <i class="fa-solid fa-dice-one" style="color: #0000ff;" id="dice-blue"></i>
    <i class="fa-solid fa-dice-one" style="color: #ffff00;" id="dice-yellow"></i>
    `

    // reset penalty section
    penaltyCountContainer.innerHTML = 
    `            
    <div class="penalty-count-box" id="penalty-count-box-1"></i></div>
    <div class="penalty-count-box" id="penalty-count-box-2"></div>
    <div class="penalty-count-box" id="penalty-count-box-3"></div>
    <div class="penalty-count-box" id="penalty-count-box-4"></div>
    `;

    // reset total score section
    scoreRowContainer.innerHTML = 
    `
    <div class="score-box border-red" id="score-box-red"></div>
    <i class="fa-solid fa-plus"></i>
    <div class="score-box border-yellow" id="score-box-yellow"></div>
    <i class="fa-solid fa-plus"></i>
    <div class="score-box border-green" id="score-box-green"></div>
    <i class="fa-solid fa-plus"></i>
    <div class="score-box border-blue" id="score-box-blue"></div>
    <i class="fa-solid fa-minus"></i>
    <div class="score-box" id="score-box-penalty"></div>
    <i class="fa-solid fa-equals"></i>
    <div class="score-box" id="score-box-total"></div>
    `

}

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

    resetDOM();
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
    penaltyTitle.classList.remove('hidden');
    penaltyCountContainer.classList.remove('hidden');
    scoreTitle.classList.remove('hidden');
    scoreRowContainer.classList.remove('hidden');

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

