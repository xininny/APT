import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapChart from '../components/MapChart';
import CountryInfo from '../components/CountryInfo';
import * as XLSX from 'xlsx';

const CommonAPTPage = ({ filterColumn, colorScale, selectedColor, calculateData }) => {
    const [year, setYear] = useState(2014);
    const [aptData, setAptData] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/APT.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            setAptData(jsonData);

            const years = jsonData.map((item) => new Date(item.Date).getFullYear());
            const uniqueYears = [...new Set(years)];
            setYearOptions(uniqueYears.sort((a, b) => a - b));
            setYear(Math.min(...uniqueYears));
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
