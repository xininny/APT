import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
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
                        <div className="Info-row-1">
                            <div className="Info-text">1. Select a victim or an attacker from the top.</div>
                            <div className="Info-text">2. Choose a year.</div>
                            <div className="Info-text">3. Select a country on the map.</div>
                        </div>
                        <div
                            className="Info-row-2"
                            style={{
                                position: 'absolute',
                                top: '37px',
                                left: '350px',
                                width: '100%',
                            }}
                        >
                            <div className="Info-text">4. Choose a threat actor under an APT.</div>
                            <div className="Info-text">5. View the details of the APT campaign.</div>{' '}
                        </div>
                    </div>
                </div>
                <div className="Navbar-links">
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
