import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacking = () => {
    const calculateData = (aptData, year) => {
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const countryTimes = yearData.reduce((acc, item) => {
            if (item['Threat Country'] && item['Threat Country'] !== 'N/A') {
                const countries = item['Threat Country']
                    .split(/[,;]/)
                    .map((c) => c.trim())
                    .filter((c) => c);

                countries.forEach((country) => {
                    if (!acc[country]) {
                        acc[country] = 0;
                    }
                    acc[country] += 1;
                });
            }
            return acc;
        }, {});

        // ✅ Zero-Day True 개수를 Threat Country가 존재하는 경우에만 카운트
        const zeroDayTrueCount = yearData.filter(
            (item) =>
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE') &&
                item['Threat Country'] &&
                item['Threat Country'] !== 'N/A'
        ).length;

        const totalTimes = Object.values(countryTimes).reduce((acc, count) => acc + count, 0);

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
