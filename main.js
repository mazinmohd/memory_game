let flippedCards = [];
let moves = 0;
let matchedPairs = 0;
let timerInterval;
let seconds = 0;
let isPaused = false;
let gameStarted = false;

// Get DOM elements
const cards = document.querySelectorAll('.card');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameBoard = document.querySelector('.game-board');
const winModal = document.getElementById('winModal');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboard = document.getElementById('closeLeaderboard');
const leaderboardBody = document.getElementById('leaderboardBody');

// Shuffle cards
function shuffleCards() {
    const cardArray = Array.from(cards);
    cardArray.forEach(card => {
        const randomPos = Math.floor(Math.random() * cardArray.length);
        card.style.order = randomPos;
    });
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Handle card click
function handleCardClick(e) {
    if (isPaused) return;
    
    const card = e.currentTarget;
    
    // Prevent clicking same card or when two cards are already flipped
    if (card.classList.contains('flipped') || flippedCards.length === 2) return;
    
    // Start timer on first move
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }
    
    // Flip card
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        
        // Check for match
        const firstCard = flippedCards[0].getAttribute('data-card');
        const secondCard = flippedCards[1].getAttribute('data-card');
        
        if (firstCard === secondCard) {
            matchedPairs++;
            flippedCards.forEach(card => {
                card.classList.add('matched');
                card.classList.add('flipped');
            });
            flippedCards = [];
            
            // Check for game completion
            if (matchedPairs === 4) {
                clearInterval(timerInterval);
                setTimeout(showWinModal, 500);
            }
        } else {
            // Keep the delay only for non-matching cards
            setTimeout(() => {
                flippedCards.forEach(card => card.classList.remove('flipped'));
                flippedCards = [];
            }, 1000);
        }
    }
}

// Add click event listeners to cards
cards.forEach(card => card.addEventListener('click', handleCardClick));

// Initialize game
shuffleCards();

// Add event listeners with the existing ones
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

function pauseGame() {
    if (!gameStarted) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerInterval);
        gameBoard.classList.add('paused');
        pauseBtn.textContent = 'Resume';
    } else {
        startTimer();
        gameBoard.classList.remove('paused');
        pauseBtn.textContent = 'Pause';
    }
}

function restartGame() {
    // Reset all variables
    flippedCards = [];
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    isPaused = false;
    gameStarted = false;
    
    // Reset displays
    movesDisplay.textContent = '0';
    timeDisplay.textContent = '0:00';
    pauseBtn.textContent = 'Pause';
    
    // Clear timer
    clearInterval(timerInterval);
    
    // Reset cards
    cards.forEach(card => {
        card.classList.remove('flipped', 'matched');
    });
    
    // Remove paused state
    gameBoard.classList.remove('paused');
    
    // Reshuffle cards
    shuffleCards();
    
    // Add this line to hide modal
    winModal.style.display = 'none';
    leaderboardModal.style.display = 'none';
}

// Add new function to show win modal
function showWinModal() {
    saveScore();
    finalMoves.textContent = moves;
    finalTime.textContent = timeDisplay.textContent;
    winModal.style.display = 'flex';
}

// Add event listener for play again button
playAgainBtn.addEventListener('click', restartGame);

// Add function to save score
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
    const newScore = {
        moves: moves,
        time: seconds,
        timeString: timeDisplay.textContent,
        date: new Date().toLocaleDateString()
    };
    
    scores.push(newScore);
    scores.sort((a, b) => {
        if (a.moves !== b.moves) {
            return a.moves - b.moves;
        }
        return a.time - b.time;
    });
    
    // Keep only top 5 scores instead of 10
    scores.splice(5);
    
    localStorage.setItem('memoryGameScores', JSON.stringify(scores));
}

// Add function to display leaderboard
function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
    leaderboardBody.innerHTML = '';
    
    scores.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.moves}</td>
            <td>${score.timeString}</td>
            <td>${score.date}</td>
        `;
        leaderboardBody.appendChild(row);
    });
    
    leaderboardModal.style.display = 'flex';
}

// Add event listeners
leaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});
