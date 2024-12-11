import React, { useState, useEffect } from 'react';
import './CountryInfo.css';
import DownIcon from './svg/CountryInfo-down.svg';
import DownloadIcon from './svg/Download.svg';
import CalendarIcon from './svg/Calendar.svg';
import WorldIcon from './svg/World.svg';
import DetailIcon from './svg/Detail.svg';

const CountryInfo = ({ selectedCountry, totalTimes, zeroDayTrueCount, year }) => {
    const [isThreatActorOpen, setIsThreatActorOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [currentCountry, setCurrentCountry] = useState('Country');
    const [currentFlag, setCurrentFlag] = useState(WorldIcon);

    const handleCountrySelect = (country) => {
        const countryCode = country?.code || 'World';
        setCurrentCountry(country.name || 'Country');
        setCurrentFlag(`/Country/${countryCode}.svg`);
        setSelectedDetail(null); // Detail 초기화
        setIsThreatActorOpen(false);
    };

    useEffect(() => {
        if (selectedCountry) {
            const countryCode = selectedCountry.code || 'World';
            const flagPath = `/Country/${countryCode}.svg`;
            fetch(flagPath)
                .then((response) => {
                    if (response.ok) {
                        setCurrentFlag(flagPath);
                    } else {
                        throw new Error(`Flag not found for country code: ${countryCode}`);
                    }
                })
                .catch((error) => {
                    console.error(error.message);
                    setCurrentFlag(WorldIcon);
                });
        } else {
            setCurrentFlag(WorldIcon);
        }

        // Detail 정보 초기화 (다른 나라를 클릭하거나, `selectedCountry`가 바뀌면 실행)
        setSelectedDetail(null);
    }, [selectedCountry]);

    return (
        <div className="country-info">
            <div className="year-overview-container">
                <div className="year-overview-title">
                    <div className="year-overview-sub">
                        <img src={CalendarIcon} alt="Calendar icon" className="Calendar-icon" />
                        <div className="Year-Overview">Year Overview</div>
                    </div>
                    <div className="CountryInfo-year">{year}</div>
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
                        <div className="Selected-Country-name">
                            {selectedCountry ? selectedCountry.name : currentCountry}
                        </div>
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
                                .map((info, index) => (
                                    <span
                                        key={index}
                                        onClick={() => setSelectedDetail(info)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {info.threatActor}
                                        {index <
                                        selectedCountry.details.filter(
                                            (info) => info.threatActor && info.threatActor.trim() !== ''
                                        ).length -
                                            1
                                            ? ', '
                                            : ''}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}

                <div className="SelectedCountry-detail-zeroday-row">
                    <div className="SelectedCountry-detail-zeroday-text">Zero-Day T/F</div>
                    <div className="SelectedCountry-detail-zeroday-length">
                        {selectedCountry
                            ? selectedCountry.details.filter((info) => info.zeroDay === 'True').length
                            : ''}{' '}
                        /{' '}
                        {selectedCountry
                            ? selectedCountry.details.filter((info) => info.zeroDay === 'False').length
                            : ''}
                    </div>
                </div>

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
                            <div className="detail-zeroday-count">{selectedDetail ? selectedDetail.zeroDay : ' '}</div>
                        </div>

                        <div className="detail-threat-cve-row">
                            <div className="detail-threat-cve-title">CVE</div>
                            <div className="detail-threat-cve-count">
                                {selectedDetail ? selectedDetail.CVE || ' ' : ' '}
                            </div>
                        </div>

                        <div className="detail-threat-download-row">
                            <div className="detail-threat-download-title">Download URL</div>
                            <div>
                                {selectedDetail ? (
                                    <a href={selectedDetail.downloadUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={DownloadIcon} alt="Download icon" className="download-icon" />
                                    </a>
                                ) : (
                                    <img src={DownloadIcon} alt="Download icon" className="download-icon-disabled" />
                                )}
                            </div>
                        </div>

                        <div className="detail-threat-source-row">
                            <div className="detail-threat-source-title">Source</div>
                            <div className="detail-threat-source-count">
                                {selectedDetail ? selectedDetail.source : ' '}
                            </div>
                        </div>

                        <div className="detail-threat-initial-row">
                            <div className="detail-threat-initial-title">Initial Vector</div>
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

                        <div className="detail-threat-timeline-row">
                            <div className="detail-threat-timeline-title">Timeline</div>
                            <div className="detail-threat-timeline-name">
                                {selectedDetail ? selectedDetail.timeline : ' '}
                            </div>
                        </div>

                        <div className="detail-threat-targeted-row">
                            <div className="detail-threat-targeted-title">Targeted Sectors</div>
                            <div className="detail-threat-targeted-name">
                                {selectedDetail ? selectedDetail.targetedSectors : ' '}
                            </div>
                        </div>

                        <div className="detail-threat-duration-row">
                            <div className="detail-threat-duration-title">Duration</div>
                            <div className="detail-threat-duration-name">
                                {selectedDetail ? selectedDetail.duration : ' '}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryInfo;
