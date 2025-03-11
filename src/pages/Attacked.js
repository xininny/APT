import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        // ✅ 해당 연도의 데이터 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const victimStats = yearData.reduce(
            (acc, item) => {
                if (item['Victims'] && item['Victims'] !== 'N/A') {
                    const victims = item['Victims']
                        .split(/[,;]/)
                        .map((v) => v.trim())
                        .filter((v) => v);

                    // ✅ Victims이 존재하고 Zero-Day가 True인 경우만 카운트
                    if (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True') {
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
