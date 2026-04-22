let frame = 0;
let gameOver = false;
let score = 0;

const HIGHSCORE_STORAGE_KEY = 'dinoGameHighscore';
const HIGHSCORE_ANIMATION_DURATION = 90;

let highscore = loadHighscore();
let highscoreAnimationFrames = 0;
let highscoreBeatenThisRun = false;

const difficulties = {
    easy:   { speed: 3, spawnRate: 120, speedUp: 0.0003 },
    normal: { speed: 5, spawnRate: 100, speedUp: 0.001 },
    hard:   { speed: 7, spawnRate: 70,  speedUp: 0.002 }
};
let currentDifficulty = 'normal';
let speed = difficulties[currentDifficulty].speed;
let currentTheme = 'day';
let socket = null;
let remoteControllerConnected = false;

function loadHighscore() {
    try {
        const savedHighscore = localStorage.getItem(HIGHSCORE_STORAGE_KEY);
        return savedHighscore ? Number(savedHighscore) : 0;
    } catch (error) {
        return 0;
    }
}

function saveHighscore(value) {
    try {
        localStorage.setItem(HIGHSCORE_STORAGE_KEY, String(value));
    } catch (error) {
        // Daca localStorage nu este disponibil, jocul continua fara salvare permanenta.
    }
}

function updateHighscore() {
    if (score <= highscore) return;

    highscore = score;
    saveHighscore(highscore);

    if (!highscoreBeatenThisRun) {
        highscoreBeatenThisRun = true;
        highscoreAnimationFrames = HIGHSCORE_ANIMATION_DURATION;
        playSound('score');
    }
}

function getColors() {
    if (currentTheme === 'night') {
        return { bg: '#1a1a2e', fg: '#e0e0e0' };
    }
    if (currentTheme === 'sunset') {
        return { bg: '#2d1b3d', fg: '#f0a050' };
    }
    return { bg: '#f7f7f7', fg: '#535353' };
}

function drawHighscoreAnimation(colors) {
    if (highscoreAnimationFrames <= 0) return;

    const progress = highscoreAnimationFrames / HIGHSCORE_ANIMATION_DURATION;
    const scale = 1 + Math.sin(progress * Math.PI * 8) * 0.08;
    const alpha = Math.min(1, progress * 2);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(canvas.width / 2, 72);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = colors.fg;
    ctx.fillText('NOU HIGHSCORE!', 0, 0);
    ctx.font = '14px monospace';
    ctx.fillText('Record: ' + String(highscore).padStart(5, '0'), 0, 24);
    ctx.restore();

    highscoreAnimationFrames--;
}

function drawScore(colors) {
    ctx.save();
    ctx.fillStyle = colors.fg;
    ctx.font = highscoreAnimationFrames > 0 ? 'bold 16px monospace' : '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('HI ' + String(highscore).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 20, 30);
    ctx.restore();
}

function drawControllerStatus(colors) {
    if (!socket || !remoteControllerConnected) return;

    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    ctx.fillStyle = colors.fg;
    ctx.fillText('Controller: conectat', 20, 30);
    ctx.restore();
}

function draw() {
    const colors = getColors();
    canvas.style.background = colors.bg;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScore(colors);
    drawControllerStatus(colors);

    ctx.strokeStyle = colors.fg;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    characters[currentCharacter](player.x, player.y, player.width, player.height, player.ducking);

    drawObstacles(colors);
    drawHighscoreAnimation(colors);

    if (gameOver) {
        ctx.fillStyle = colors.fg;
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, 100);
        ctx.font = '14px monospace';
        ctx.fillText('Apasa SPACE sau Start Game pentru restart', canvas.width / 2, 130);
    }
}

function gameLoop() {
    player.vy += 0.6;
    player.y += player.vy;

    if (player.y >= GROUND_Y - player.height) {
        player.y = GROUND_Y - player.height;
        player.vy = 0;
        player.jumping = false;
        if (player.ducking) {
            player.height = player.duckHeight;
            player.y = GROUND_Y - player.height;
        }
    }

    frame++;
    score = Math.floor(frame / 6);
    updateHighscore();
    speed += difficulties[currentDifficulty].speedUp;

    if (frame % difficulties[currentDifficulty].spawnRate === 0) {
        spawnObstacle();
    }

    updateObstacles();

    if (checkAllCollisions()) {
        gameOver = true;
        playSound('gameover');
    }

    if (gameOver) {
        draw();
        return;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOver = false;
    resetPlayer();
    obstacles = [];
    frame = 0;
    score = 0;
    speed = difficulties[currentDifficulty].speed;
    highscoreAnimationFrames = 0;
    highscoreBeatenThisRun = false;
    gameLoop();
}

function handleJump() {
    if (gameOver) {
        restartGame();
        return;
    }

    if (!player.jumping && !player.ducking) {
        player.vy = -12;
        player.jumping = true;
        playSound('jump');
    }
}

function handleCrouchDown() {
    if (gameOver) return;

    if (player.jumping) {
        player.vy = Math.max(player.vy, 8);
        return;
    }

    setPlayerDucking(true);
}

function handleCrouchUp() {
    setPlayerDucking(false);
}

function handleStartGame() {
    if (gameOver) {
        restartGame();
    }
}

function setCharacterFromController(character) {
    if (!characters[character]) return;

    currentCharacter = character;

    const characterSelect = document.getElementById('character');
    if (characterSelect) {
        characterSelect.value = character;
    }
}

function setupRemoteController() {
    if (typeof io === 'undefined') return;

    socket = io();

    socket.on('remote-command', function(command) {
        if (!command || !command.type) return;

        if (command.type === 'jump') {
            handleJump();
        }

        if (command.type === 'crouch-down') {
            handleCrouchDown();
        }

        if (command.type === 'crouch-up') {
            handleCrouchUp();
        }

        if (command.type === 'start') {
            handleStartGame();
        }
    });

    socket.on('remote-character', function(character) {
        setCharacterFromController(character);
    });

    socket.on('controller:state', function(state) {
        remoteControllerConnected = Boolean(state && state.connected);

        if (state && state.selectedCharacter) {
            setCharacterFromController(state.selectedCharacter);
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
    }

    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleCrouchDown();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleCrouchUp();
    }
});

setupRemoteController();
gameLoop();
