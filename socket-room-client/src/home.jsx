import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    transports: ['websocket']
});

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [usersCount, setUsersCount] = useState(0);

    useEffect(() => {
        socket.on('roomCreated', (key) => {
            setRoomId(key);
        });

        socket.on('joinedRoom', () => {
            socket.emit('getUsersCount', roomId); // Request users count when someone joins
        });

        socket.on('usersCount', (count) => {
            setUsersCount(count);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('usersCount');
        };
    }, []);

    const createRoom = () => {
        socket.emit('createRoom');
    };

    const goToGame = () => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div>
            <h1>Welcome to the Game</h1>
            {roomId && (
                <div>
                    <p>Room ID: {roomId}</p>
                    <p>Users in room: {usersCount}</p>
                    <button onClick={goToGame}>Go to Game</button>
                </div>
            )}
            {!roomId && (
                <button onClick={createRoom}>Create Room</button>
            )}
        </div>
    );
};

export default Home;
