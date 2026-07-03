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
                    <a
                        href="https://github.com/SecAI-Lab/APTMap-backend"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-github-link"
                        title="View on GitHub"
                    >
                        <svg height="22" viewBox="0 0 16 16" width="22" aria-hidden="true" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                    </a>
                    <Link to="/victims" className={location.pathname === '/victims' ? 'active' : ''}>
                        Victims
                    </Link>
                    <Link to="/attackers" className={['/', '/attackers'].includes(location.pathname) ? 'active' : ''}>
                        Attackers
                    </Link>

                    <Link to="/timeline" className={location.pathname === '/timeline' ? 'active' : ''}>
                        Timeline
                    </Link>
                    <Link to="/manage" className={location.pathname === '/manage' ? 'active' : ''}>
                        Update
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
