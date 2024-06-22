import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    transports: ['websocket']
});

const Game = () => {
    const navigate = useNavigate();
    const { roomKey: paramRoomKey } = useParams();
    const [roomKey, setRoomKey] = useState(paramRoomKey || '');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (paramRoomKey) {
            socket.emit('joinRoom', paramRoomKey);
        }

        socket.on('roomCreated', (key) => {
            setStatus(`Room created with key: ${key}`);
            setRoomKey(key);
            navigate(`/room/${key}`);
        });

        socket.on('joinedRoom', (key) => {
            setStatus(`Joined room: ${key}`);
            socket.emit('getUsersCount', key); // Request users count when joined
        });

        socket.on('roomUpdate', (users) => {
            setUsers(users);
            setStatus(`Users in room: ${users.join(', ')}`);
        });

        socket.on('roomFull', () => {
            setStatus('Room is full');
        });

        socket.on('roomNotFound', () => {
            setStatus('Room not found');
        });

        socket.on('usersCount', (count) => {
            // Handle users count update
            console.log('Users count:', count);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('roomUpdate');
            socket.off('roomFull');
            socket.off('roomNotFound');
            socket.off('usersCount');
        };
    }, [paramRoomKey]);

    const createRoom = () => {
        socket.emit('createRoom');
    };

    const joinRoom = () => {
        socket.emit('joinRoom', roomKey);
    };

    return (
        <div>
            <h1>Socket.IO Room</h1>
            <button onClick={createRoom}>Create Room</button>
            <input
                type="text"
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value)}
                placeholder="Enter Room Key"
            />
            <button onClick={joinRoom}>Join Room</button>
            <p>{status}</p>
            <p>Users in room: {users.join(', ')}</p>
        </div>
    );
};

export default Game;
