import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

import NavbarDownIcon from './svg/Navbar_down.svg';
import Logo from './svg/logo.svg';

const Navbar = ({ year, setYear, yearOptions }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleYearSelect = (selectedYear) => {
        setYear(selectedYear);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

                    <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                        <button
                            onClick={handleDropdownToggle}
                            className={`dropdown-toggle-navbar ${isDropdownOpen ? 'open' : ''}`}
                        >
                            {year}
                            <img src={NavbarDownIcon} alt="dropdown icon" className="dropdown-icon-navbar" />
                        </button>
                        {isDropdownOpen && (
                            <div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                                {yearOptions.map((option, index) => (
                                    <div key={index} className="dropdown-item" onClick={() => handleYearSelect(option)}>
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
