import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Attacking from './pages/Attacking';
import Attacked from './pages/Attacked';
import Timeline from './pages/Timeline';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/victims" element={<Attacked />} />
                <Route path="/attackers" element={<Attacking />} />
                <Route path="/" element={<Attacking />} />
                <Route path="/timeline" element={<Timeline />} />
            </Routes>
        </Router>
    );
}

export default App;
