import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { APTDataProvider } from './contexts/APTDataContext';
import Attacking from './pages/Attacking';
import Attacked from './pages/Attacked';
import Timeline from './pages/Timeline';
import ManageEntries from './pages/ManageEntries';

// 고정 픽셀 레이아웃의 기준 캔버스 크기 (지도/타임라인 화면이 이 크기에 맞춰 디자인됨)
const DESIGN_WIDTH = 1902;
const DESIGN_HEIGHT = 1000;

// 스크롤 페이지(Update)는 가로 기준으로만 배율 적용
const SCROLL_PAGES = ['/manage'];

const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
};

const ScaledLayout = ({ children }) => {
    const location = useLocation();
    const { width, height } = useWindowSize();

    if (SCROLL_PAGES.includes(location.pathname)) {
        return (
            <div
                style={{
                    transform: `scale(${width / 1920})`,
                    transformOrigin: 'top left',
                    width: '100%',
                    display: 'flow-root',
                }}
            >
                {children}
            </div>
        );
    }

    // 화면 전체가 한 번에 보이도록 가로/세로 중 더 작은 비율로 맞추고 가운데 정렬
    const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

    return (
        <div
            style={{
                width: DESIGN_WIDTH * scale,
                height: DESIGN_HEIGHT * scale,
                margin: '0 auto',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: DESIGN_WIDTH,
                    height: DESIGN_HEIGHT,
                    position: 'relative',
                    display: 'flow-root', // 자식의 margin이 배율 밖으로 새지 않도록 (margin collapse 방지)
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            >
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <APTDataProvider>
            <Router>
                <ScaledLayout>
                    <Routes>
                        <Route path="/victims" element={<Attacked />} />
                        <Route path="/attackers" element={<Attacking />} />
                        <Route path="/" element={<Attacking />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/manage" element={<ManageEntries />} />
                    </Routes>
                </ScaledLayout>
            </Router>
        </APTDataProvider>
    );
}

export default App;
