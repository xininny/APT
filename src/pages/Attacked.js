import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        console.log('🔍 [DEBUG] Selected Year:', year);
        console.log('📊 [DEBUG] Raw APT Data:', aptData);

        // ✅ 해당 연도의 데이터 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);
        console.log('📅 [DEBUG] Filtered Data for Year:', yearData);

        const victimsTimes = yearData.reduce((acc, item) => {
            if (item['Victims'] && item['Victims'] !== 'N/A') {
                const victims = [
                    ...new Set( // ✅ 중복 제거
                        item['Victims']
                            .split(/[,;]/) // ✅ 쉼표(`,`) 또는 세미콜론(`;`) 기준으로 분리
                            .map((v) => v.trim())
                            .filter((v) => v && v !== 'NaN')
                    ),
                ];

                victims.forEach((victim) => {
                    if (!acc[victim]) {
                        acc[victim] = 0;
                    }
                    acc[victim] += 1;
                });
            }
            return acc;
        }, {});

        console.log('👥 [DEBUG] Victims Count Object:', victimsTimes);

        // ✅ Victims가 존재하면서 Zero-Day가 True인 경우, Victims를 개별적으로 카운트
        let zeroDayTrueCount = 0;
        yearData.forEach((item) => {
            if (
                item['Victims'] &&
                item['Victims'] !== 'N/A' &&
                (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
            ) {
                const victims = [
                    ...new Set(
                        item['Victims']
                            .split(/[,;]/)
                            .map((v) => v.trim())
                            .filter((v) => v && v !== 'N/A' && v !== 'NaN')
                    ),
                ];
                zeroDayTrueCount += victims.length;
                console.log(`🛑 [DEBUG] Zero-Day Attack Victims:`, victims, `Counted as: ${victims.length}`);
            }
        });

        console.log('🛑 [DEBUG] Zero-Day True Count:', zeroDayTrueCount);

        const totalTimes = Object.values(victimsTimes).reduce((acc, count) => acc + count, 0);
        console.log('🔥 [DEBUG] Total Attacks Count (totalTimes):', totalTimes);

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
