import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import Logo from './svg/logo.svg';

const Navbar = () => {
    return (
        <div className="Navbar">
            <div className="Navbar-container">
                <Link to="/" className="Navbar-title">
                    <img src={Logo} alt="logo" className="logo-navbar" />
                    <div className="Navbar-title-text">APT Map</div>
                </Link>
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
