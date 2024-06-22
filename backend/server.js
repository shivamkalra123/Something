const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const rooms = {};

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('createRoom', () => {
        const roomKey = crypto.randomBytes(4).toString('hex');
        rooms[roomKey] = { users: [] };
        socket.emit('roomCreated', roomKey);
    });

    socket.on('joinRoom', (roomKey) => {
        if (rooms[roomKey]) {
            if (rooms[roomKey].users.length < 2) {
                rooms[roomKey].users.push(socket.id);
                socket.join(roomKey);
                socket.emit('joinedRoom', roomKey);
                io.to(roomKey).emit('roomUpdate', rooms[roomKey].users);

                if (rooms[roomKey].users.length === 2) {
                    io.to(roomKey).emit('roomFull');
                }
            } else {
                socket.emit('roomFull');
            }
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('disconnect', () => {
        for (const [key, room] of Object.entries(rooms)) {
            const index = room.users.indexOf(socket.id);
            if (index !== -1) {
                room.users.splice(index, 1);
                io.to(key).emit('roomUpdate', room.users);
                if (room.users.length === 0) {
                    delete rooms[key];
                }
                break;
            }
        }
        console.log('user disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
