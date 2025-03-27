import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import Logo from './svg/logo.svg';
import InfoIcon from '../components/svg/info.svg';
const Navbar = () => {
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
                        <div className="Info-text">1. Select the menu: victims, attackers, or timeline on top.</div>
                        <div className="Info-text">
                            2. Choose a year to display the list of news articles for the year.
                        </div>
                        <div className="Info-text">3. Choose a news link for a full article.</div>
                    </div>
                </div>
                <div className="Navbar-links">
                    <Link to="/victims">Victims</Link>
                    <Link to="/attackers">Attackers</Link>
                    <Link to="/timeline">Timeline</Link>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
