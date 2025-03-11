import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacking = () => {
    const calculateData = (aptData, year) => {
        console.log('🔍 [DEBUG] Selected Year:', year);
        console.log('📊 [DEBUG] Raw APT Data:', aptData);

        // ✅ 해당 연도의 데이터 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        const countryTimes = yearData.reduce((acc, item) => {
            if (item['Threat Country'] && item['Threat Country'] !== 'N/A') {
                const countries = [
                    ...new Set( // ✅ 중복 제거
                        item['Threat Country']
                            .split(/[,;]/) // ✅ 쉼표(`,`) 또는 세미콜론(`;`)으로 분리
                            .map((c) => c.trim())
                            .filter((c) => c)
                    ),
                ];

                countries.forEach((country) => {
                    if (!acc[country]) {
                        acc[country] = 0;
                    }
                    acc[country] += 1;
                });
            }
            return acc;
        }, {});

        console.log('🌍 [DEBUG] Threat Country Count:', countryTimes);

        // ✅ Threat Country가 존재하면서 Zero-Day가 True인 경우만 카운트
        const zeroDayTrueCount = yearData.filter(
            (item) =>
                item['Threat Country'] &&
                item['Threat Country'] !== 'N/A' &&
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
        ).length;

        console.log('🛑 [DEBUG] Zero-Day True Count:', zeroDayTrueCount);

        const totalTimes = Object.values(countryTimes).reduce((acc, count) => acc + count, 0);
        console.log('🔥 [DEBUG] Total Attacks Count (totalTimes):', totalTimes);

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
