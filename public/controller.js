const socket = io();

let controllerConnected = false;
let selectedCharacter = 'dino';
let crouchIsPressed = false;

const dashboardScreen = document.getElementById('dashboard-screen');
const controlsScreen = document.getElementById('controls-screen');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const goControlsBtn = document.getElementById('go-controls-btn');
const backDashboardBtn = document.getElementById('back-dashboard-btn');
const startGameBtn = document.getElementById('start-game-btn');
const jumpBtn = document.getElementById('jump-btn');
const crouchBtn = document.getElementById('crouch-btn');
const characterButtons = document.querySelectorAll('.character-btn');
const statusDots = document.querySelectorAll('[data-status-dot]');
const statusTexts = document.querySelectorAll('[data-status-text]');

function showScreen(screenName) {
    dashboardScreen.classList.toggle('active', screenName === 'dashboard');
    controlsScreen.classList.toggle('active', screenName === 'controls');
}

function renderConnectionStatus() {
    statusDots.forEach((dot) => {
        dot.classList.toggle('connected', controllerConnected);
        dot.classList.toggle('disconnected', !controllerConnected);
    });

    statusTexts.forEach((text) => {
        text.textContent = controllerConnected ? 'Conectat' : 'Deconectat';
    });
}

function renderSelectedCharacter() {
    characterButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.character === selectedCharacter);
    });
}

function sendCommand(type) {
    if (!controllerConnected) return;
    socket.emit('controller:command', { type });
}

function connectController() {
    socket.emit('controller:connect', selectedCharacter);
}

function disconnectController() {
    crouchIsPressed = false;
    socket.emit('controller:command', { type: 'crouch-up' });
    socket.emit('controller:disconnect');
}

function selectCharacter(character) {
    selectedCharacter = character;
    renderSelectedCharacter();

    if (controllerConnected) {
        socket.emit('controller:character', character);
    }
}

function pressCrouch() {
    if (crouchIsPressed) return;
    crouchIsPressed = true;
    sendCommand('crouch-down');
}

function releaseCrouch() {
    if (!crouchIsPressed) return;
    crouchIsPressed = false;
    sendCommand('crouch-up');
}

socket.on('controller:state', (state) => {
    controllerConnected = Boolean(state && state.connected);

    if (state && state.selectedCharacter) {
        selectedCharacter = state.selectedCharacter;
    }

    renderConnectionStatus();
    renderSelectedCharacter();
});

socket.on('connect', () => {
    renderConnectionStatus();
});

socket.on('disconnect', () => {
    controllerConnected = false;
    crouchIsPressed = false;
    renderConnectionStatus();
});

connectBtn.addEventListener('click', connectController);
disconnectBtn.addEventListener('click', disconnectController);
goControlsBtn.addEventListener('click', () => showScreen('controls'));
backDashboardBtn.addEventListener('click', () => showScreen('dashboard'));
startGameBtn.addEventListener('click', () => sendCommand('start'));
jumpBtn.addEventListener('click', () => sendCommand('jump'));

characterButtons.forEach((button) => {
    button.addEventListener('click', () => selectCharacter(button.dataset.character));
});

crouchBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pressCrouch();
});

crouchBtn.addEventListener('pointerup', (event) => {
    event.preventDefault();
    releaseCrouch();
});

crouchBtn.addEventListener('pointercancel', releaseCrouch);
crouchBtn.addEventListener('pointerleave', releaseCrouch);

window.addEventListener('blur', releaseCrouch);
document.addEventListener('contextmenu', (event) => event.preventDefault());

renderConnectionStatus();
renderSelectedCharacter();
