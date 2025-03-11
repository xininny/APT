import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        // ✅ 해당 연도의 데이터 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const victimsTimes = yearData.reduce((acc, item) => {
            if (item['Victims'] && item['Victims'] !== 'N/A') {
                const victims = item['Victims']
                    // .split(/[,;]/)
                    .map((v) => v.trim())
                    .filter((v) => v);

                victims.forEach((victim) => {
                    if (!acc[victim]) {
                        acc[victim] = 0;
                    }
                    acc[victim] += 1;
                });
            }
            return acc;
        }, {});

        // ✅ Victims가 존재하면서 Zero-Day가 True인 경우만 카운트
        const zeroDayTrueCount = yearData.filter(
            (item) =>
                item['Victims'] &&
                item['Victims'] !== 'N/A' &&
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
        ).length;

        const totalTimes = Object.values(victimsTimes).reduce((acc, count) => acc + count, 0);

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
