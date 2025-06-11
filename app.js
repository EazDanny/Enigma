// Game data and state
const puzzlesData = [
    {
        id: 1,
        title: "El Espejo del Tiempo",
        question: "David encuentra un viejo reloj de arena en el ático. Al girarlo, ve grabado en la base: 691. Junto a él hay un papel con una pista: 'Lo que fue, será; lo que es, volverá. Resta lo que ves tras el cristal.'",
        answer: "495",
        hint: "El cristal del reloj muestra las cosas al revés...",
        showVisual: false,  // Cambiar a false para quitar el ancla
        showImage: true
    },
    {
        id: 2,
        title: "Donde todo empezó",
        question: "🖐️",
        answer: "Avenida el Ancla 2",
        hint: "Nombre de aquel lugar",
        showVisual: true  // El ancla se mantiene aquí
    },
    {
        id: 3,
        title: "El Código de las Estrellas",
        question: "En la habitación secreta, David encuentra un mapa estelar con constelaciones marcadas. Cada estrella brillante tiene un número: Osa Mayor (7), Orión (3), Casiopea (5). La inscripción dice: 'Suma las luces del cielo y multiplica por los hermanos que comparten destino.'",
        answer: "45",
        hint: "Tres hermanos comparten el mismo destino... (7+3+5) × 3",
        showVisual: false
    },
    {
        id: 4,
        title: "Lo que más amas",
        question: "",
        answer: "Delia",
        hint: "🥥",
        showVisual: false
    }
];

let currentPuzzleIndex = 0;
let gameState = 'intro';
let hintVisible = false;

// Audio variables
let backgroundMusic;
let musicInitialized = false;

// DOM elements
const introScreen = document.getElementById('intro');
const puzzleScreen = document.getElementById('puzzleScreen');
const finalScreen = document.getElementById('finalScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const currentPuzzleSpan = document.getElementById('currentPuzzle');
const puzzleTitle = document.getElementById('puzzleTitle');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleImage = document.getElementById('puzzleImage');
const puzzleVisual = document.getElementById('puzzleVisual');
const puzzleHint = document.getElementById('puzzleHint');
const hintText = document.getElementById('hintText');
const hintButton = document.getElementById('hintButton');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitAnswer');
const puzzleFeedback = document.getElementById('puzzleFeedback');
const confettiContainer = document.getElementById('confetti');

// Audio controls
const musicControls = document.getElementById('musicControls');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeSlider = document.getElementById('volumeSlider');

// Initialize the game
function initGame() {
    setupEventListeners();
    initializeAudio();
    showScreen('intro');
}

// Initialize audio
function initializeAudio() {
    backgroundMusic = new Audio('puzzle-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // Update volume slider
    volumeSlider.value = 30;
    
    // Auto-play attempt (may be blocked by browser)
    backgroundMusic.play().then(() => {
        playPauseBtn.textContent = '⏸️';
        musicInitialized = true;
    }).catch(() => {
        playPauseBtn.textContent = '▶️';
        musicInitialized = false;
    });
}

// Event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);
    submitBtn.addEventListener('click', submitAnswer);
    hintButton.addEventListener('click', toggleHint);
    
    // Music controls
    playPauseBtn.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', updateVolume);
    
    // Allow Enter key to submit answers
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    // Clear feedback when typing
    answerInput.addEventListener('input', () => {
        clearFeedback();
    });
}

// Music controls
function toggleMusic() {
    if (!backgroundMusic) return;
    
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            playPauseBtn.textContent = '⏸️';
        }).catch(console.error);
    } else {
        backgroundMusic.pause();
        playPauseBtn.textContent = '▶️';
    }
}

function updateVolume() {
    if (backgroundMusic) {
        backgroundMusic.volume = volumeSlider.value / 100;
    }
}

// Hint functionality
function toggleHint() {
    hintVisible = !hintVisible;
    
    if (hintVisible) {
        hintText.classList.remove('hint-blurred');
        hintButton.textContent = 'Ocultar Pista';
    } else {
        hintText.classList.add('hint-blurred');
        hintButton.textContent = 'Ver Pista';
    }
}

// Game flow functions
function startGame() {
    gameState = 'playing';
    currentPuzzleIndex = 0;
    
    // Iniciar música automáticamente al comenzar
    if (backgroundMusic && backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            playPauseBtn.textContent = '⏸️';
            musicInitialized = true;
        }).catch(() => {
            console.log('No se pudo reproducir la música automáticamente');
        });
    }
    
    showScreen('puzzle');
    loadCurrentPuzzle();
}

function restartGame() {
    gameState = 'intro';
    currentPuzzleIndex = 0;
    hintVisible = false;
    clearFeedback();
    answerInput.value = '';
    stopConfetti();
    
    // Reset hint state
    hintText.classList.add('hint-blurred');
    hintButton.textContent = 'Ver Pista';
    
    showScreen('intro');
}

function showScreen(screen) {
    // Hide all screens with fade effect
    introScreen.classList.remove('active');
    puzzleScreen.classList.remove('active');
    finalScreen.classList.remove('active');
    
    // Add fade out class
    document.querySelectorAll('.screen').forEach(s => s.classList.add('fade-out'));
    
    setTimeout(() => {
        // Remove fade out and show target screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('fade-out'));
        
        switch(screen) {
            case 'intro':
                introScreen.classList.add('active');
                break;
            case 'puzzle':
                puzzleScreen.classList.add('active');
                break;
            case 'final':
                finalScreen.classList.add('active');
                break;
        }
        
        // Add fade in effect
        setTimeout(() => {
            document.querySelector('.screen.active').classList.add('fade-in');
        }, 50);
    }, 300);
}

function loadCurrentPuzzle() {
    const puzzle = puzzlesData[currentPuzzleIndex];
    
    // Update puzzle info
    currentPuzzleSpan.textContent = currentPuzzleIndex + 1;
    puzzleTitle.textContent = puzzle.title;
    
    // Handle question display (empty for puzzle 4)
    if (puzzle.question) {
        puzzleQuestion.textContent = puzzle.question;
        puzzleQuestion.style.display = 'block';
    } else {
        puzzleQuestion.style.display = 'none';
    }
    
    hintText.textContent = puzzle.hint;
    
    // Reset hint state
    hintVisible = false;
    hintText.classList.add('hint-blurred');
    hintButton.textContent = 'Ver Pista';
    
    // Show/hide image for puzzle 1
    if (puzzle.showImage && currentPuzzleIndex === 0) {
        puzzleImage.style.display = 'block';
    } else {
        puzzleImage.style.display = 'none';
    }
    
    // Show/hide visual elements
    if (puzzle.showVisual) {
        puzzleVisual.classList.add('active');
    } else {
        puzzleVisual.classList.remove('active');
    }
    
    // Clear input and feedback
    answerInput.value = '';
    answerInput.focus();
    clearFeedback();
    
    // Add smooth solving animation
    document.querySelector('.puzzle-card').classList.add('solving');
    setTimeout(() => {
        document.querySelector('.puzzle-card').classList.remove('solving');
    }, 800);
}

function submitAnswer() {
    const userAnswer = answerInput.value.trim();
    const correctAnswer = puzzlesData[currentPuzzleIndex].answer;
    
    if (!userAnswer) {
        showFeedback('Por favor, introduce una respuesta', 'error');
        return;
    }
    
    // Case-insensitive comparison
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    showFeedback('¡Correcto! Excelente deducción, detective.', 'success');
    playSuccessSound();
    
    // Wait before advancing with smoother transition
    setTimeout(() => {
        if (currentPuzzleIndex < puzzlesData.length - 1) {
            // Add fade effect before changing puzzle
            document.querySelector('.puzzle-card').classList.add('fade-out');
            setTimeout(() => {
                currentPuzzleIndex++;
                document.querySelector('.puzzle-card').classList.remove('fade-out');
                loadCurrentPuzzle();
            }, 400);
        } else {
            completePuzzles();
        }
    }, 1500);
}

function handleIncorrectAnswer() {
    showFeedback('No es correcto. Piensa de nuevo, detective...', 'error');
    playErrorSound();
    
    // Shake the input
    answerInput.style.animation = 'errorShake 0.6s ease-out';
    setTimeout(() => {
        answerInput.style.animation = '';
    }, 600);
}

function showFeedback(message, type) {
    puzzleFeedback.textContent = message;
    puzzleFeedback.className = `puzzle-feedback ${type}`;
}

function clearFeedback() {
    puzzleFeedback.textContent = '';
    puzzleFeedback.className = 'puzzle-feedback';
}

function completePuzzles() {
    gameState = 'completed';
    
    // Add fade out effect to puzzle screen
    puzzleScreen.classList.add('fade-out');
    setTimeout(() => {
        showScreen('final');
        finalScreen.classList.add('fade-in');
        startConfetti();
        playVictorySound();
    }, 1000);
}

// Sound effects (simple Web Audio API beeps)
function createBeep(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio not available');
    }
}

function playSuccessSound() {
    createBeep(800, 0.2);
    setTimeout(() => createBeep(1000, 0.3), 100);
}

function playErrorSound() {
    createBeep(300, 0.5, 'sawtooth');
}

function playVictorySound() {
    const notes = [523, 659, 783, 1047]; // C, E, G, C
    notes.forEach((note, index) => {
        setTimeout(() => createBeep(note, 0.4), index * 200);
    });
}

// Confetti animation
function startConfetti() {
    const colors = ['#d4af37', '#f4d367', '#cc3333', '#2ecc71'];
    for (let i = 0; i < 100; i++) {
        setTimeout(() => createConfettiPiece(colors), i * 100);
    }
    
    // Continue confetti for 5 seconds
    setTimeout(() => {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => createConfettiPiece(colors), i * 150);
        }
    }, 2000);
}

function createConfettiPiece(colors) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random properties
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const animationDuration = 2 + Math.random() * 3;
    const size = 6 + Math.random() * 8;
    
    confetti.style.backgroundColor = color;
    confetti.style.left = left + '%';
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.animationDuration = animationDuration + 's';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    
    confettiContainer.appendChild(confetti);
    
    // Remove confetti piece after animation
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, (animationDuration + 2) * 1000);
}

function stopConfetti() {
    confettiContainer.innerHTML = '';
}

// Keyboard shortcuts for testing (remove in production)
document.addEventListener('keydown', (e) => {
    // Skip puzzle with Ctrl+S (for testing)
    if (e.ctrlKey && e.key === 's' && gameState === 'playing') {
        e.preventDefault();
        handleCorrectAnswer();
    }
});

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Additional visual effects
function addSparkleEffect(element) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.fontSize = '20px';
    sparkle.style.color = '#d4af37';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
    sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 1000);
}

// Add sparkle animation to CSS via JavaScript
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
@keyframes sparkle {
    0% {
        opacity: 0;
        transform: scale(0) rotate(0deg);
    }
    50% {
        opacity: 1;
        transform: scale(1.2) rotate(180deg);
    }
    100% {
        opacity: 0;
        transform: scale(0) rotate(360deg);
    }
}
`;
document.head.appendChild(sparkleStyle);

// Add sparkles on correct answers
const originalHandleCorrectAnswer = handleCorrectAnswer;
handleCorrectAnswer = function() {
    // Add sparkles around the puzzle card
    const puzzleCard = document.querySelector('.puzzle-card');
    for (let i = 0; i < 5; i++) {
        setTimeout(() => addSparkleEffect(puzzleCard), i * 200);
    }
    originalHandleCorrectAnswer();
};
