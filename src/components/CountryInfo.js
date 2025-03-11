import React, { useState, useEffect } from 'react';
import './CountryInfo.css';
import DownIcon from './svg/CountryInfo-down.svg';
import DownloadIcon from './svg/Download.svg';
import CalendarIcon from './svg/Calendar.svg';
import WorldIcon from './svg/World.svg';
import DetailIcon from './svg/Detail.svg';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';

const CountryInfo = ({ selectedCountry, totalTimes, zeroDayTrueCount, year, setYear, yearOptions }) => {
    const [isThreatActorOpen, setIsThreatActorOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [currentCountry, setCurrentCountry] = useState('Country');
    const [currentFlag, setCurrentFlag] = useState(WorldIcon);
    const [activeActor, setActiveActor] = useState(null);

    const getFlagPath = (countryCode) => {
        return `/Country/${countryCode}.svg`;
    };
    const handleActorClick = (actor) => {
        setActiveActor(actor);
        setSelectedDetail(actor);
    };
    const clearActiveActor = () => {
        setActiveActor(null);
    };

    const formatDuration = (duration) => {
        if (typeof duration !== 'string' || duration === 'N/A') return 'N/A';

        const match = duration.match(/\d+/);
        return match ? `${match[0]} days` : 'N/A';
    };

    const parseTimeline = (timeline) => {
        if (!timeline) {
            return { startDate: 'N/A', endDate: 'N/A' };
        }

        // ✅ Case 1: 객체 타입 {"Start Date": "YYYY-MM-DD", "End Date": "YYYY-MM-DD"}
        if (typeof timeline === 'object') {
            const { 'Start Date': startDate, 'End Date': endDate } = timeline;
            const isValidDate = (date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);

            return {
                startDate: isValidDate(startDate) ? startDate : 'N/A',
                endDate: isValidDate(endDate) ? endDate : 'N/A',
            };
        }

        // ✅ Case 2: 문자열 타입 "YYYY-MM-DD - YYYY-MM-DD"
        if (typeof timeline === 'string') {
            const rangeMatch = timeline.match(/^(\d{4}-\d{2}-\d{2})\s?-\s?(\d{4}-\d{2}-\d{2})$/);
            if (rangeMatch) {
                return { startDate: rangeMatch[1], endDate: rangeMatch[2] };
            }

            // ✅ Case 3: "Start date: YYYY-MM-DD, End date: YYYY-MM-DD" 형태의 문자열 처리
            const startMatch = timeline.match(/Start date:\s?(\d{4}-\d{2}-\d{2})/i);
            const endMatch = timeline.match(/End date:\s?(\d{4}-\d{2}-\d{2})/i);

            return {
                startDate: startMatch ? startMatch[1] : 'N/A',
                endDate: endMatch ? endMatch[1] : 'N/A',
            };
        }

        // ✅ 예상하지 못한 데이터 형식은 기본값 반환
        return { startDate: 'N/A', endDate: 'N/A' };
    };

    const handleCountrySelect = (country) => {
        const countryCode = country?.code || 'World';
        const countryName = getCountryName(countryCode);
        const flagPath = getFlagPath(countryCode);

        setCurrentCountry(countryName);
        setCurrentFlag(flagPath);
        setSelectedDetail(null);
        setIsThreatActorOpen(false);
        setIsDropdownOpen(false);
    };

    const handleYearSelect = (selectedYear) => {
        setYear(selectedYear);
        setIsDropdownOpen(false);
    };
    const getCountryName = (countryCode) => {
        const feature = am4geodata_worldLow.features.find((f) => f.properties.id === countryCode);
        return feature ? feature.properties.name : 'Country';
    };

    useEffect(() => {
        if (selectedCountry) {
            const countryCode = selectedCountry.code || 'World';
            const countryName = getCountryName(countryCode);
            const flagPath = getFlagPath(countryCode);
            setCurrentFlag(flagPath);
            setCurrentCountry(countryName);
            setSelectedDetail(null);
        } else {
            setCurrentFlag(WorldIcon);
            setCurrentCountry('Country');
        }
    }, [selectedCountry]);

    return (
        <div className="country-info">
            <div className="year-overview-container">
                <div className="year-overview-title">
                    <div className="year-overview-sub">
                        <img src={CalendarIcon} alt="Calendar icon" className="Calendar-icon" />
                        <div className="Year-Overview">Year Overview</div>
                    </div>
                    <div className="dropdown">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`dropdown-toggle-navbar ${isDropdownOpen ? 'open' : ''}`}
                        >
                            {year}
                            <img src={DownIcon} alt="dropdown icon" className="dropdown-icon-navbar" />
                        </button>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {[...yearOptions]
                                    .sort((a, b) => b - a)
                                    .map((option) => (
                                        <div
                                            key={option}
                                            className="dropdown-item"
                                            onClick={() => handleYearSelect(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="year-overview">
                    <div className="Total-Attacks-row">
                        <div className="Total-Attacks">Total Attacks</div>
                        <div className="Total-times">{totalTimes} times</div>
                    </div>

                    <div className="Zero-Day-row">
                        <div className="Zero-Day">Zero-Day</div>
                        <div className="Zero-Day-Count">{zeroDayTrueCount} times</div>
                    </div>
                </div>
            </div>

            <div className="Selected-Country-container">
                <div className="Selected-Country-row">
                    <div className="Selected-Country-sub">
                        <img src={currentFlag} alt={`${currentCountry} flag`} className="Country-flag" />
                        <div className="Selected-Country-name">{currentCountry}</div>
                    </div>

                    <div className="Selected-Country-times">
                        {selectedCountry ? selectedCountry.times + ' times' : ''}
                    </div>
                </div>

                <div className="SelectedCountry-detail-threat-row">
                    <div className="SelectedCountry-detail-text">Threat Actors</div>
                    <div className="SelectedCountry-detail-sub">
                        <div className="SelectedCountry-detail-length">
                            {selectedCountry ? selectedCountry.details.length : ''}
                        </div>
                        <button
                            onClick={() => selectedCountry && setIsThreatActorOpen(!isThreatActorOpen)}
                            className={`dropdown-toggle ${isThreatActorOpen ? 'open' : ''}`}
                            disabled={!selectedCountry}
                        >
                            <img
                                src={DownIcon}
                                alt="dropdown icon"
                                className={`dropdown-icon ${isThreatActorOpen ? 'rotate' : ''}`}
                            />
                        </button>
                    </div>
                </div>
                {isThreatActorOpen && selectedCountry && (
                    <div className="dropdown-content">
                        <div className="inline-content">
                            {selectedCountry.details
                                .filter((info) => info.threatActor && info.threatActor.trim() !== '')
                                .map((info, index, array) => (
                                    <span
                                        key={index}
                                        onClick={() => handleActorClick(info)}
                                        className={activeActor === info ? 'active' : ''}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {info.threatActor}
                                    </span>
                                ))
                                .reduce(
                                    (prev, curr, index, array) =>
                                        index < array.length - 1 ? [...prev, curr, ', '] : [...prev, curr],
                                    []
                                )}
                        </div>
                    </div>
                )}

                <div className="SelectedCountry-detail-zeroday-row">
                    <div className="SelectedCountry-detail-zeroday-text">Zero-Day True/Total</div>
                    <div className="SelectedCountry-detail-zeroday-length">
                        {selectedCountry ? selectedCountry.details.filter((info) => info.zeroDay === true).length : 0} /{' '}
                        {selectedCountry ? selectedCountry.details.filter((info) => info.zeroDay).length : 0}
                    </div>
                </div>
            </div>
            <div className="detail-container">
                <div className="divider"></div>
                <div className="detail-section">
                    <div className="detail-title-sub">
                        <img src={DetailIcon} alt="Detail icon" className="Detail-icon" />
                        <div className="detail-name">Detail</div>
                    </div>
                    <div className={`detail-sub-container ${selectedDetail ? 'detail-sub-active' : ''}`}>
                        <div className="detail-threat-row">
                            <div className="detail-threat-title">Threat Actor</div>
                            <div className="detail-threat-name">
                                {selectedDetail ? selectedDetail.threatActor : 'Select a threat actor'}
                            </div>
                        </div>
                        <div className="detail-threat-zeroday-row">
                            <div className="detail-zeroday-title">Zero-Day</div>
                            <div className="detail-zeroday-count">
                                {selectedDetail ? (selectedDetail.zeroDay === true ? 'True' : 'False') : ' '}
                            </div>
                        </div>

                        <div className="detail-threat-cve-row">
                            <div className="detail-threat-cve-title">CVE</div>
                            <div className="detail-threat-cve-count">
                                {selectedDetail ? selectedDetail.CVE || ' ' : ' '}
                            </div>
                        </div>
                        <div className="detail-threat-download-row">
                            <div className="detail-threat-download-title">Source</div>
                            <div className="detail-threat-download-sub-row">
                                <div className="detail-threat-source-count">
                                    {selectedDetail ? selectedDetail.source : ' '}
                                </div>
                                <div
                                    className={
                                        selectedDetail && selectedDetail.downloadUrl
                                            ? 'download-icon'
                                            : 'download-icon-disabled'
                                    }
                                    onClick={() => {
                                        if (selectedDetail && selectedDetail.downloadUrl) {
                                            window.open(selectedDetail.downloadUrl, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <img src={DownloadIcon} alt="Download icon" className="download-icon-img" />
                                </div>
                            </div>
                        </div>

                        <div className="detail-threat-initial-row">
                            <div className="detail-threat-initial-title">Attack Vector</div>
                            <div className="detail-threat-initial-name">
                                {selectedDetail ? selectedDetail.initialVector : ' '}
                            </div>
                        </div>
                        <div className="detail-threat-malware-row">
                            <div className="detail-threat-malware-title">Malware</div>
                            <div className="detail-threat-malware-name">
                                {selectedDetail ? selectedDetail.malware : ' '}
                            </div>
                        </div>
                        <div className="detail-threat-targeted-row">
                            <div className="detail-threat-targeted-title">Targeted Sectors</div>
                            <div className="detail-threat-targeted-name">
                                {selectedDetail ? selectedDetail.targetedSectors : ' '}
                            </div>
                        </div>
                        <div className="detail-threat-timeline-row">
                            <div className="detail-threat-timeline-title">Timeline (Duration)</div>
                            {selectedDetail && selectedDetail.timeline ? (
                                <div className="detail-threat-timeline-name">
                                    {(() => {
                                        const { startDate, endDate } = parseTimeline(selectedDetail.timeline);
                                        if (!startDate && !endDate) return '';
                                        if (!startDate) return `~ ${endDate}`;
                                        if (!endDate) return `${startDate} ~`;
                                        return `${startDate} ~ ${endDate}`;
                                    })()}{' '}
                                    {selectedDetail.duration ? `(${formatDuration(selectedDetail.duration)})` : ''}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryInfo;
