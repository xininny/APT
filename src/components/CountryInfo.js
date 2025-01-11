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
        if (!duration || duration === 'N/A') return 'N/A';

        const match = duration.match(/\d+/); // 숫자만 추출
        if (match) {
            return `${match[0]} days`; // 숫자에 'days' 붙여 반환
        }

        return 'N/A'; // 숫자 없으면 'N/A' 반환
    };

    const parseTimeline = (timeline) => {
        if (!timeline || timeline === 'N/A' || timeline.toLowerCase() === 'not mentioned') {
            return { startDate: 'N/A', endDate: 'N/A' };
        }

        // 1. 기존 포맷 처리: 'Start date: ... End date: ...'
        const matches = timeline.match(/Start date:\s?(.+?)\s?End date:\s?(.+)/i);
        if (matches) {
            const startDate = formatDate(matches[1].trim());
            const endDate = formatDate(matches[2].trim());
            return {
                startDate: startDate || 'N/A',
                endDate: endDate || 'N/A',
            };
        }

        // 2. 새로운 포맷 처리: 'April 2014 - May 2014'
        const rangeMatch = timeline.match(/(.+?)\s?-\s?(.+)/);
        if (rangeMatch) {
            const startDate = formatDate(rangeMatch[1].trim());
            const endDate = formatDate(rangeMatch[2].trim());
            return {
                startDate: startDate || 'N/A',
                endDate: endDate || 'N/A',
            };
        }

        // 3. 시작일만 있는 경우: 'Start date: April 2014'
        const startMatch = timeline.match(/Start date:\s?(.+)/i);
        if (startMatch) {
            const startDate = formatDate(startMatch[1].trim());
            return { startDate: startDate || 'N/A', endDate: 'N/A' };
        }

        // 4. 처리 불가한 경우
        return { startDate: 'N/A', endDate: 'N/A' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A' || dateStr.toLowerCase() === 'not mentioned') return 'N/A';

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        // 'YYYY-MM-DD' 형식 (예: '2023-12-15')
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split('-');
            return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
        }

        // 'YYYY-MM' 형식 (예: '2023-09')
        if (dateStr.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = dateStr.split('-');
            return `${months[parseInt(month) - 1]} ${year}`;
        }

        // 'Month YYYY' 형식 (예: 'September 2023')
        if (dateStr.match(/^\w+\s\d{4}$/)) {
            return dateStr;
        }

        // 'YYYY' 형식 (예: '2022')
        if (dateStr.match(/^\d{4}$/)) {
            return dateStr;
        }

        // 'Month Day, Year' 형식 (예: 'July 7, 2015')
        const matchMDY = dateStr.match(/^(\w+)\s+(\d{1,2}),\s*(\d{4})$/);
        if (matchMDY) {
            const [, month, day, year] = matchMDY;
            return `${parseInt(day)} ${month} ${year}`;
        }

        // 'Early September 2023', 'Late June 2022' 처리
        const pattern = /(early|mid|late)?[-\s]?(\w+)?\s?(\d{4})/i;
        const match = dateStr.match(pattern);
        if (match) {
            const [, prefix, month, year] = match;
            let formattedMonth = month ? `${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()}` : '';
            let formattedPrefix = prefix ? `${prefix.charAt(0).toUpperCase()}${prefix.slice(1).toLowerCase()} ` : '';
            return `${formattedPrefix}${formattedMonth} ${year}`;
        }

        return 'N/A'; // 변환할 수 없는 경우 'N/A'
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
                                {yearOptions.map((option) => (
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
                    <div className="SelectedCountry-detail-zeroday-text">Zero-Day T/F</div>
                    <div className="SelectedCountry-detail-zeroday-length">
                        {selectedCountry ? selectedCountry.details.filter((info) => info.zeroDay === true).length : 0} /
                        {selectedCountry ? selectedCountry.details.filter((info) => info.zeroDay === false).length : 0}
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
