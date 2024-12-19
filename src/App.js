import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APTDataProvider } from './contexts/APTDataContext';
import Attacking from './pages/Attacking';
import Attacked from './pages/Attacked';
import Timeline from './pages/Timeline';

function App() {
    return (
        <APTDataProvider>
            <Router>
                <Routes>
                    <Route path="/victims" element={<Attacked />} />
                    <Route path="/attackers" element={<Attacking />} />
                    <Route path="/" element={<Attacking />} />
                    <Route path="/timeline" element={<Timeline />} />
                </Routes>
            </Router>
        </APTDataProvider>
    );
}

export default App;
