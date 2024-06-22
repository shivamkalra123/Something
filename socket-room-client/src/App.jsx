import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './home';
import Game from './game';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/room/:roomKey" element={<Home />} />
        </Routes>
    );
};

export default App;
