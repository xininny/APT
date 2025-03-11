import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const zeroDayTrueCount = yearData.filter(
            (item) =>
                item['Victims'] &&
                item['Victims'] !== 'N/A' &&
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
        ).length;

        const totalTimes = yearData.length;

        return { totalTimes, zeroDayTrueCount };
    };

    return (
        <CommonAPTPage
            filterColumn="Victims"
            colorScale="27, 100, 218"
            selectedColor="#64a8ff"
            calculateData={calculateData}
        />
    );
};

export default Attacked;
