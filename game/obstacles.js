let obstacles = [];

function spawnObstacle() {
    obstacles.push({
        x: canvas.width,
        y: GROUND_Y - 30,
        width: 16,
        height: 30
    });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= speed;
    }
    obstacles = obstacles.filter(obs => obs.x > -50);
}

function drawObstacles(colors) {
    for (let i = 0; i < obstacles.length; i++) {
        ctx.fillStyle = colors.fg;
        ctx.fillRect(
            obstacles[i].x,
            obstacles[i].y,
            obstacles[i].width,
            obstacles[i].height
        );
    }
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function checkAllCollisions() {
    for (let i = 0; i < obstacles.length; i++) {
        if (checkCollision(player, obstacles[i])) {
            return true;
        }
    }
    return false;
}