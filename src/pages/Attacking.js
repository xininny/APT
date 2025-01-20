import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacking = () => {
    const calculateData = (aptData, year) => {
        // 선택된 연도의 데이터를 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        // 나라별 횟수 계산
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

        // Threat Country가 있고 Zero-Day가 true인 경우만 필터링
        const zeroDayTrueCount = yearData.filter(
            (item) =>
                item['Zero-Day'] === true && // Zero-Day가 true
                item['Threat Country'] && // Threat Country가 존재
                item['Threat Country'] !== 'N/A' // Threat Country가 유효
        ).length;

        // 모든 나라에서 발생한 총 공격 횟수 계산
        const totalTimes = Object.values(countryTimes).reduce((acc, count) => acc + count, 0);

        console.log('Year:', year, 'Zero-Day True Count:', zeroDayTrueCount);
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
