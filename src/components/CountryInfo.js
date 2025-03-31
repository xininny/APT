import React, { useState, useEffect } from 'react';
import './CountryInfo.css';
import DownIcon from './svg/CountryInfo-down.svg';
import DownloadIcon from './svg/Download.svg';
import CalendarIcon from './svg/Calendar.svg';
import WorldIcon from './svg/world-map.svg';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';

const CountryInfo = ({ selectedCountry, totalTimes, zeroDayTrueCount, year, setYear, yearOptions, aptData }) => {
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

    const parseTimeline = (detail) => {
        if (!detail) {
            return { startDate: 'N/A', endDate: 'N/A' };
        }
        const startDate = detail.startDate || 'N/A';
        const endDate = detail.endDate || 'N/A';

        return { startDate, endDate };
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
    const [yearlyZeroDayTrueCount, setYearlyZeroDayTrueCount] = useState(0);

    useEffect(() => {
        if (aptData && aptData.length > 0) {
            const yearlyData = aptData.filter((item) => {
                const itemYear = new Date(item.Date).getFullYear();
                return itemYear === year;
            });

            const zeroDayTrueCount = yearlyData.filter((item) => {
                const zeroDayValue = item['Zero-Day'];
                return zeroDayValue && (zeroDayValue === true || zeroDayValue === 'TRUE') && zeroDayValue !== 'N/A';
            }).length;

            setYearlyZeroDayTrueCount(zeroDayTrueCount);
        }
    }, [aptData, year]);

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
                        {selectedCountry
                            ? selectedCountry.details.filter((info) => info.zeroDay !== 'N/A' && info.zeroDay === true)
                                  .length
                            : 0}
                        /{selectedCountry ? selectedCountry.details.length : 0}
                    </div>
                </div>
            </div>
            <div className="detail-container">
                <div className="divider"></div>
                <div className="detail-section">
                    <div className="detail-title-sub">
                        🔎
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
                                {selectedDetail
                                    ? selectedDetail.zeroDay === 'N/A'
                                        ? 'N/A'
                                        : selectedDetail.zeroDay === true
                                        ? 'True'
                                        : 'False'
                                    : ' '}
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
                            <div className="detail-threat-initial-title">Initial Attack Vector</div>
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
                            <div className="detail-threat-timeline-title">Estimated Attack Duration</div>
                            {selectedDetail ? (
                                <div className="detail-threat-timeline-name">
                                    {(() => {
                                        const { startDate, endDate } = parseTimeline(selectedDetail);

                                        if (startDate === 'N/A' && endDate === 'N/A') return 'N/A';
                                        if (startDate === 'N/A') return `~ ${endDate}`;
                                        if (endDate === 'N/A') return `${startDate} ~`;

                                        return `${startDate} ~ ${endDate}`;
                                    })()}{' '}
                                    {selectedDetail.duration ? `(${selectedDetail.duration})` : ''}
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
