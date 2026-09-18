const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const rooms = new Map();
const LOCATIONS = [
    'Flughafen', 'Krankenhaus', 'Schule', 'Strand', 'U-Bahn',
    'Casino', 'Zirkus', 'Kreuzfahrtschiff', 'Weltraumstation', 'Bank'
];

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function generatePlayerName() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `Spieler${randomNumber}`;
}

function findRoomBySocketId(socketId) {
    for (const room of rooms.values()) {
        if (room.players.some(p => p.socketId === socketId)) {
            return room;
        }
    }
    return null;
}

function findRoomByPlayerId(playerId) {
    for (const room of rooms.values()) {
        if (room.players.some(p => p.playerId === playerId)) {
            return room;
        }
    }
    return null;
}

function publicPlayers(room) {
    return room.players.map(p => ({ id: p.playerId, name: p.name }));
}

function broadcastPlayers(room) {
    io.to(room.code).emit('players-updated', { players: publicPlayers(room), hostId: room.hostId });
}

function sendRoleTo(room, player) {
    if (!player.socketId) return;
    if (room.spyPlayerIds.includes(player.playerId)) {
        io.to(player.socketId).emit('role-assigned', { isSpy: true });
    } else {
        io.to(player.socketId).emit('role-assigned', { isSpy: false, location: room.location });
    }
}

io.on('connection', (socket) => {
    console.log('Ein Client hat sich verbunden: ', socket.id);

    socket.on('create-room', ({ playerName, playerId }) => {
        const finalName = (playerName && playerName.trim()) ? playerName.trim() : generatePlayerName();
        const roomCode = generateRoomCode();

        const room = {
            code: roomCode,
            hostId: playerId,
            players: [
                { playerId, socketId: socket.id, name: finalName }
            ],
            location: null,
            spyPlayerIds: [],
            roundDurationSeconds: null,
            readyPlayerIds: new Set(),
            endTime: null,
            roundEnded: false,
            allDisconnectedSince: null,
            isPaused: false,
            pausedRemainingMs: null,
            votes: new Map(),
            votingStarted: false,
            finalResults: null,
            playersBackInLobby: new Set([playerId]),
        };
        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.emit('room-created', { roomCode, players: publicPlayers(room), hostId: room.hostId });
    });

    socket.on('join-room', ({ roomCode, playerName, playerId }) => {
        const finalName = (playerName && playerName.trim()) ? playerName.trim() : generatePlayerName();
        const normalizedCode = roomCode.toUpperCase();
        const room = rooms.get(normalizedCode);

        if (!room) {
            return socket.emit('join-error', 'Raum nicht gefunden');
        }

        room.players.push({ playerId, socketId: socket.id, name: finalName });
        room.playersBackInLobby.add(playerId);
        socket.join(normalizedCode);

        socket.emit('room-joined', { roomCode: normalizedCode, players: publicPlayers(room), hostId: room.hostId });
        broadcastPlayers(room);
    });

    socket.on('rejoin', ({ playerId, roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) return socket.emit('rejoin-failed');

        const player = room.players.find(p => p.playerId === playerId);
        if (!player) return socket.emit('rejoin-failed');

        player.socketId = socket.id;
        room.allDisconnectedSince = null;

        socket.join(room.code);

        socket.emit('room-joined', { roomCode: room.code, players: publicPlayers(room), hostId: room.hostId });

        if (room.location) {
            sendRoleTo(room, player);
            socket.emit('ready-status', { readyCount: room.readyPlayerIds.size, totalCount: room.players.length });
        }
        if (room.locationPool) {
            socket.emit('location-pool', { locations: room.locationPool });
        }
        if (room.endTime) {
            socket.emit('round-started', { endTime: room.endTime, durationSeconds: room.roundDurationSeconds });
        }
        if (room.votingStarted && !room.roundEnded) {
            socket.emit('voting-started', { players: publicPlayers(room) });
        }
        if (room.roundEnded) {
            socket.emit('round-ended', room.finalResults);
        }
        if (room.isPaused) {
            socket.emit('round-paused');
        }
    });

    socket.on('leave-room', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;

        socket.leave(room.code);
        const index = room.players.findIndex(p => p.socketId === socket.id);
        if (index === -1) return;

        const leavingPlayerId = room.players[index].playerId;
        room.players.splice(index, 1);
        room.playersBackInLobby.delete(leavingPlayerId);

        if (room.players.length === 0) {
            rooms.delete(room.code);
        } else {
            if (room.hostId === leavingPlayerId) {
                room.hostId = room.players[0].playerId;
            }
            broadcastPlayers(room);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client hat die Verbindung getrennt: ', socket.id);
        const room = findRoomBySocketId(socket.id);
        if (!room) return;

        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
            player.socketId = null;
        }

        const allDisconnected = room.players.every(p => p.socketId === null);
        if (allDisconnected) {
            room.allDisconnectedSince = Date.now();
        }
    });

    socket.on('start-game', ({ spyCount, roundMinutes, locations }) => {
        const room = findRoomBySocketId(socket.id);
        console.log('start-game empfangen, room:', room?.code, 'spyCount:', spyCount, 'roundMinutes:', roundMinutes);
        if (!room) return;
        if (room.playersBackInLobby.size < room.players.length) return;
        if (room.hostId !== room.players.find(p => p.socketId === socket.id)?.playerId) return;
        if (room.players.length < 3) return;
        if (spyCount < 1 || spyCount > room.players.length - 1) return;

        const locationPool = (Array.isArray(locations) && locations.length > 0) ? locations : LOCATIONS;
        room.location = locationPool[Math.floor(Math.random() * locationPool.length)];
        room.locationPool = locationPool;
        room.roundDurationSeconds = roundMinutes * 60;
        room.readyPlayerIds = new Set();
        room.endTime = null;
        room.roundEnded = false;
        room.votes = new Map();
        room.votingStarted = false;
        room.finalResults = null;
        room.playersBackInLobby = new Set();

        const spyIndexSet = new Set();
        while (spyIndexSet.size < spyCount) {
            spyIndexSet.add(Math.floor(Math.random() * room.players.length));
        }
        room.spyPlayerIds = room.players
            .filter((p, index) => spyIndexSet.has(index))
            .map(p => p.playerId);

        room.players.forEach(player => sendRoleTo(room, player));
        io.to(room.code).emit('location-pool', { locations: locationPool });
    });

    socket.on('player-ready', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        room.readyPlayerIds.add(player.playerId);

        io.to(room.code).emit('ready-status', { readyCount: room.readyPlayerIds.size, totalCount: room.players.length });

        if (room.readyPlayerIds.size === room.players.length) {
            room.endTime = Date.now() + room.roundDurationSeconds * 1000;
            io.to(room.code).emit('round-started', { endTime: room.endTime, durationSeconds: room.roundDurationSeconds });
        }
    });

    socket.on('pause-round', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || room.hostId !== player.playerId) return;
        if (room.isPaused || !room.endTime) return;

        room.isPaused = true;
        room.pausedRemainingMs = Math.max(0, room.endTime - Date.now());
        io.to(room.code).emit('round-paused');
    });

    socket.on('resume-round', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || room.hostId !== player.playerId) return;
        if (!room.isPaused) return;

        room.isPaused = false;
        room.endTime = Date.now() + room.pausedRemainingMs;
        io.to(room.code).emit('round-resumed', { endTime: room.endTime });
    })

    socket.on('end-round', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || room.hostId !== player.playerId) return;
        if (room.votingStarted) return;

        room.votingStarted = true;
        io.to(room.code).emit('voting-started', { players: publicPlayers(room) });
    });

    socket.on('cast-vote', ({ votedForPlayerId }) => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || !room.votingStarted || room.roundEnded) return;

        room.votes.set(player.playerId, votedForPlayerId);

        if (room.votes.size === room.players.length) {
            room.roundEnded = true;

            const nameById = new Map(room.players.map(p => [p.playerId, p.name]));

            const tallyMap = new Map();
            for (const votedForId of room.votes.values()) {
                const name = nameById.get(votedForId) || 'Unbekannt';
                tallyMap.set(name, (tallyMap.get(name) || 0) + 1);
            }
            const voteTally = Array.from(tallyMap.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            const spyNames = room.spyPlayerIds.map(id => nameById.get(id) || 'Unbekannt');

            room.finalResults = { location: room.location, spyNames, voteTally };
            io.to(room.code).emit('round-ended', room.finalResults);
        }
    });

    socket.on('return-to-lobby', () => {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        room.playersBackInLobby.add(player.playerId);
        io.to(room.code).emit('lobby-return-status', {
            count: room.playersBackInLobby.size,
            total: room.players.length,
        });
    });
});

app.get('/debug/rooms', (req, res) => {
    const roomArray = Array.from(rooms.values());
    res.json(roomArray);
});

const PORT = process.env.PORT || 3000;

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 //alle 5min prüfen
const ROOM_TIMEOUT_MS = 20 * 60 * 1000; // alle 20min komplett leere Räume löschen 

setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
        if (room.allDisconnectedSince && (now - room.allDisconnectedSince) > ROOM_TIMEOUT_MS) {
            console.log(`Raum ${code} wird wegen Inaktivität gelöscht`);
            rooms.delete(code);
        }
    }
}, CLEANUP_INTERVAL_MS);

httpServer.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
})

