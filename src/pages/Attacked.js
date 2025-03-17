import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        // console.log('🔍 [DEBUG] Selected Year:', year);
        // console.log('📊 [DEBUG] Raw APT Data:', aptData);

        // ✅ 해당 연도의 데이터 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);
        // console.log('📅 [DEBUG] Filtered Data for Year:', yearData);

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

        // console.log('👥 [DEBUG] Victims Count Object:', victimsTimes);

        // ✅ Victims가 존재하면서 Zero-Day가 True인 경우, Victims를 개별적으로 카운트
        let zeroDayTrueCount = 0;
        yearData.forEach((item) => {
            if (
                item['Victims'] &&
                item['Victims'] !== 'N/A' &&
                item['Zero-Day'] &&
                item['Zero-Day'] !== 'N/A' &&
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
                // console.log(
                //     `🛑 [DEBUG] Zero-Day Attack Victims from ${item['Victims']} (Zero-Day: ${item['Zero-Day']}):`,
                //     victims,
                //     `Counted as: ${victims.length}`
                // );
            }
        });

        // console.log('🛑 [DEBUG] Zero-Day True Count:', zeroDayTrueCount);

        // ✅ Zero-Day True Count를 Victims Count Object를 기준으로 다시 필터링하여 정확한 값 얻기
        let verifiedZeroDayCount = 0;
        Object.keys(victimsTimes).forEach((victim) => {
            const victimData = yearData.filter(
                (item) =>
                    item['Victims'] &&
                    item['Victims']
                        .split(/[,;]/)
                        .map((v) => v.trim())
                        .includes(victim) &&
                    item['Zero-Day'] &&
                    item['Zero-Day'] !== 'N/A' &&
                    (item['Zero-Day'] === true || item['Zero-Day'] === 'TRUE' || item['Zero-Day'] === 'True')
            );
            if (victimData.length > 0) {
                //console.log(`✅ [DEBUG] Verified Zero-Day True Count for Victim ${victim}:`, victimData.length);
            }
            verifiedZeroDayCount += victimData.length;
        });

        // console.log('✅ [DEBUG] Final Verified Zero-Day True Count:', verifiedZeroDayCount);

        const totalTimes = Object.values(victimsTimes).reduce((acc, count) => acc + count, 0);
        // console.log('🔥 [DEBUG] Total Attacks Count (totalTimes):', totalTimes);

        return { totalTimes, zeroDayTrueCount: verifiedZeroDayCount };
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
