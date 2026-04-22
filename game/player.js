const PLAYER_NORMAL_HEIGHT = 44;
const PLAYER_DUCK_HEIGHT = 24;

const player = {
    x: 60,
    y: GROUND_Y - PLAYER_NORMAL_HEIGHT,
    width: 34,
    height: PLAYER_NORMAL_HEIGHT,
    normalHeight: PLAYER_NORMAL_HEIGHT,
    duckHeight: PLAYER_DUCK_HEIGHT,
    vy: 0,
    jumping: false,
    ducking: false
};

function isPlayerOnGround() {
    return player.y >= GROUND_Y - player.height;
}

function setPlayerDucking(isDucking) {
    if (player.jumping) {
        player.ducking = false;
        player.height = player.normalHeight;
        return;
    }

    if (player.ducking === isDucking) return;

    const previousHeight = player.height;
    player.ducking = isDucking;
    player.height = isDucking ? player.duckHeight : player.normalHeight;
    player.y += previousHeight - player.height;
}

function resetPlayer() {
    player.height = player.normalHeight;
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.jumping = false;
    player.ducking = false;
}

const characters = {
    dino: function(x, y, w, h, isDucking) {
        ctx.fillStyle = '#535353';

        if (isDucking) {
            ctx.fillRect(x + 4, y + 8, w + 14, h - 4);
            ctx.fillRect(x + 32, y, 22, 18);
            ctx.fillStyle = '#f7f7f7';
            ctx.fillRect(x + 46, y + 5, 4, 4);
            ctx.fillStyle = '#535353';
            ctx.fillRect(x, y + 15, 8, 8);
            ctx.fillRect(x + 10, y + h, 8, 8);
            ctx.fillRect(x + 30, y + h, 8, 8);
            return;
        }

        ctx.fillRect(x + 4, y, w - 4, h);
        ctx.fillRect(x + 10, y - 18, 24, 20);
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(x + 26, y - 14, 4, 4);
        ctx.fillStyle = '#535353';
        ctx.fillRect(x, y + 14, 6, 10);
        ctx.fillRect(x + 6, y + h, 8, 10);
        ctx.fillRect(x + 20, y + h, 8, 10);
    },
    robot: function(x, y, w, h, isDucking) {
        ctx.fillStyle = '#3498db';

        if (isDucking) {
            ctx.fillRect(x + 2, y + 8, w + 16, h - 4);
            ctx.fillRect(x + 34, y, 22, 20);
            ctx.fillRect(x + 44, y - 8, 2, 8);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x + 40, y + 7, 5, 4);
            ctx.fillRect(x + 49, y + 7, 5, 4);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x + 8, y + h, 8, 8);
            ctx.fillRect(x + 30, y + h, 8, 8);
            return;
        }

        ctx.fillRect(x + 2, y, w - 2, h);
        ctx.fillRect(x + 6, y - 20, 22, 22);
        ctx.fillRect(x + 16, y - 28, 2, 10);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 10, y - 14, 5, 4);
        ctx.fillRect(x + 20, y - 14, 5, 4);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 6, y + h, 8, 10);
        ctx.fillRect(x + 20, y + h, 8, 10);
    },
    cat: function(x, y, w, h, isDucking) {
        ctx.fillStyle = '#e67e22';

        if (isDucking) {
            ctx.fillRect(x + 2, y + 9, w + 14, h - 5);
            ctx.fillRect(x + 34, y + 1, 22, 19);
            ctx.beginPath();
            ctx.moveTo(x + 36, y + 1);
            ctx.lineTo(x + 40, y - 9);
            ctx.lineTo(x + 46, y + 1);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + 48, y + 1);
            ctx.lineTo(x + 54, y - 9);
            ctx.lineTo(x + 56, y + 1);
            ctx.fill();
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(x + 40, y + 8, 4, 5);
            ctx.fillRect(x + 50, y + 8, 4, 5);
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(x + 8, y + h, 7, 7);
            ctx.fillRect(x + 30, y + h, 7, 7);
            return;
        }

        ctx.fillRect(x + 2, y + 2, w - 2, h - 2);
        ctx.fillRect(x + 6, y - 18, 22, 22);
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 18);
        ctx.lineTo(x + 10, y - 30);
        ctx.lineTo(x + 16, y - 18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 18, y - 18);
        ctx.lineTo(x + 24, y - 30);
        ctx.lineTo(x + 28, y - 18);
        ctx.fill();
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 10, y - 12, 4, 5);
        ctx.fillRect(x + 20, y - 12, 4, 5);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x + 4, y + h, 7, 8);
        ctx.fillRect(x + 20, y + h, 7, 8);
    }
};

let currentCharacter = 'dino';
