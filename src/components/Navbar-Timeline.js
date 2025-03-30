import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar-Timeline.css';
import Logo from './svg/logo.svg';
import InfoIcon from '../components/svg/info.svg';
const Navbar = () => {
    const location = useLocation(); // 현재 경로 확인
    return (
        <div className="Navbar">
            <div className="Navbar-container">
                <Link to="/" className="Navbar-title">
                    <img src={Logo} alt="logo" className="logo-navbar" />
                    <div className="Navbar-title-text">APT Map</div>
                </Link>
                <div
                    className="Info-container"
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        left: '200px',
                        zIndex: 10,
                    }}
                >
                    <div className="Info-title">
                        <div className="Info-sub" style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={InfoIcon} alt="Info icon" className="Info-icon" />
                            <div className="Info-Overview">Instruction</div>
                        </div>
                    </div>
                    <div className="Info-overview">
                        <div className="Info-text">
                            1. Select a year to view the list of news articles for that year.
                        </div>
                        <div className="Info-text">2. Click on a link icon to read the full article.</div>
                    </div>
                </div>
                <div className="Navbar-links-timeline">
                    <Link to="/victims" className={location.pathname === '/victims' ? 'active' : ''}>
                        Victims
                    </Link>
                    <Link to="/attackers" className={['/', '/attackers'].includes(location.pathname) ? 'active' : ''}>
                        Attackers
                    </Link>

                    <Link to="/timeline" className={location.pathname === '/timeline' ? 'active' : ''}>
                        Timeline
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
