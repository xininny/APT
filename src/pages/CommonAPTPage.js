import React, { useContext, useState } from 'react';
import { APTDataContext } from '../contexts/APTDataContext';
import Navbar from '../components/Navbar';
import MapChart from '../components/MapChart';
import CountryInfo from '../components/CountryInfo';

const CommonAPTPage = ({ filterColumn, colorScale, selectedColor, calculateData }) => {
    const { aptData, yearOptions } = useContext(APTDataContext);
    const [year, setYear] = useState(yearOptions.length ? Math.max(...yearOptions) : 2024);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const { totalTimes, zeroDayTrueCount } = calculateData(aptData, year);

    return (
        <div>
            <Navbar />

            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ flex: 1 }}>
                        <MapChart
                            year={year}
                            aptData={aptData}
                            filterColumn={filterColumn}
                            colorScale={colorScale}
                            selectedColor={selectedColor}
                            onCountrySelect={setSelectedCountry}
                        />
                    </div>
                    <div>
                        <CountryInfo
                            selectedCountry={selectedCountry}
                            aptData={aptData}
                            year={year}
                            setYear={setYear}
                            yearOptions={yearOptions}
                            totalTimes={totalTimes}
                            zeroDayTrueCount={zeroDayTrueCount}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommonAPTPage;
