import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const victimStats = yearData.reduce(
            (acc, item) => {
                if (item['Victims'] && item['Victims'] !== 'N/A') {
                    const victims = item['Victims']
                        .split(/[,;]/)
                        .map((v) => v.trim())
                        .filter((v) => v);

                    if (item['Zero-Day'] === true) {
                        acc.zeroDayTrueCount += victims.length;
                    }

                    acc.totalTimes += victims.length;
                }
                return acc;
            },
            { totalTimes: 0, zeroDayTrueCount: 0 }
        );

        return victimStats;
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
