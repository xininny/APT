import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacking = () => {
    const calculateData = (aptData, year) => {
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const zeroDayTrueCount = yearData.filter(
            (item) =>
                item['Threat Country'] &&
                item['Threat Country'] !== 'N/A' &&
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
        ).length;

        const totalTimes = yearData.length;

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
