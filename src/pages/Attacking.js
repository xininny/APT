import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacking = () => {
    const calculateData = (aptData, year) => {
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);
        const countryData = {};

        yearData.forEach((item) => {
            const countries = item['Threat Country']?.split(/[,;]/).map((c) => c.trim());
            if (countries) {
                countries.forEach((country) => {
                    if (!countryData[country]) {
                        countryData[country] = 0;
                    }
                    countryData[country] += 1;
                });
            }
        });

        const totalTimes = Object.values(countryData).reduce((acc, curr) => acc + curr, 0);
        const zeroDayTrueCount = yearData.filter((item) => item['Zero-Day'] === 'True').length;

        return { totalTimes, zeroDayTrueCount };
    };

    return (
        <CommonAPTPage
            filterColumn="Threat Country"
            colorScale="240, 68, 82"
            selectedColor="#f0445273"
            calculateData={calculateData}
        />
    );
};

export default Attacking;
