const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

const controllerState = {
    connected: false,
    selectedCharacter: 'dino'
};

let activeControllerSocketId = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'game')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/desktop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/mobile', (req, res) => {
    res.redirect('/controller');
});

app.get('/controller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'controller.html'));
});

function broadcastControllerState() {
    io.emit('controller:state', controllerState);
}

io.on('connection', (socket) => {
    socket.emit('controller:state', controllerState);

    socket.on('controller:connect', (character) => {
        activeControllerSocketId = socket.id;
        controllerState.connected = true;
        if (['dino', 'robot', 'cat'].includes(character)) {
            controllerState.selectedCharacter = character;
            io.emit('remote-character', character);
        }
        broadcastControllerState();
    });

    socket.on('controller:disconnect', () => {
        if (activeControllerSocketId === socket.id) {
            activeControllerSocketId = null;
        }
        controllerState.connected = false;
        broadcastControllerState();
        io.emit('remote-command', { type: 'crouch-up' });
    });

    socket.on('controller:command', (command) => {
        if (!controllerState.connected || activeControllerSocketId !== socket.id) return;
        io.emit('remote-command', command);
    });

    socket.on('controller:character', (character) => {
        if (!controllerState.connected || activeControllerSocketId !== socket.id) return;
        if (!['dino', 'robot', 'cat'].includes(character)) return;

        controllerState.selectedCharacter = character;
        broadcastControllerState();
        io.emit('remote-character', character);
    });

    socket.on('disconnect', () => {
        if (activeControllerSocketId === socket.id) {
            activeControllerSocketId = null;
            controllerState.connected = false;
            broadcastControllerState();
            io.emit('remote-command', { type: 'crouch-up' });
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Pentru telefon: foloseste IP-ul MacBook-ului, de exemplu http://192.168.x.x:3000/controller');
});
