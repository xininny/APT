import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APTDataProvider } from './contexts/APTDataContext';
import Attacking from './pages/Attacking';
import Attacked from './pages/Attacked';
import Timeline from './pages/Timeline';
import ManageEntries from './pages/ManageEntries';

function App() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [scale, setScale] = useState(1); // 배율을 설정

    // 화면 크기 변경 시 배율 계산
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // 화면 크기 기반으로 배율 계산 (예시: 화면 크기 비례 배율 적용)
        const calculatedScale = windowWidth / 1920; // 1920px을 기준으로 배율 계산
        setScale(calculatedScale);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [windowWidth, windowHeight]);

    return (
        <APTDataProvider>
            <Router>
                <div
                    style={{
                        transform: `scale(${scale})`, // 배율 적용
                        transformOrigin: 'top left', // 배율이 왼쪽 상단을 기준으로 적용되도록
                        width: '100%', // 페이지 레이아웃 깨지지 않도록 설정
                    }}
                >
                    <Routes>
                        <Route path="/victims" element={<Attacked />} />
                        <Route path="/attackers" element={<Attacking />} />
                        <Route path="/" element={<Attacking />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/manage" element={<ManageEntries />} />
                    </Routes>
                </div>
            </Router>
        </APTDataProvider>
    );
}

export default App;
