import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapChart from '../components/MapChart';
import CountryInfo from '../components/CountryInfo';

const CommonAPTPage = ({ filterColumn, colorScale, selectedColor, calculateData }) => {
    const [year, setYear] = useState(2014);
    const [aptData, setAptData] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://agreed-rebecca-xininny-c5532ae1.koyeb.app/get-apt-data');
                const jsonData = await response.json();
                if (response.ok) {
                    setAptData(jsonData);

                    const years = jsonData.map((item) => new Date(item.Date).getFullYear());
                    const uniqueYears = [...new Set(years)];
                    setYearOptions(uniqueYears.sort((a, b) => a - b));
                    setYear(Math.min(...uniqueYears));
                } else {
                    console.error('Failed to fetch APT data:', jsonData.error);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const { totalTimes, zeroDayTrueCount } = calculateData(aptData, year);

    return (
        <div>
            <Navbar />
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
    );
};

export default CommonAPTPage;
