document.getElementById('difficulty').addEventListener('change', function() {
    currentDifficulty = this.value;
    speed = difficulties[currentDifficulty].speed;
});

document.getElementById('character').addEventListener('change', function() {
    currentCharacter = this.value;
});

document.getElementById('theme').addEventListener('change', function() {
    currentTheme = this.value;
    document.body.style.background = getColors().bg;
});

document.getElementById('sound').addEventListener('change', function() {
    soundEnabled = this.checked;
});

document.getElementById('volume').addEventListener('input', function() {
    volume = this.value / 100;
    document.getElementById('volume-label').textContent = this.value + '%';
});