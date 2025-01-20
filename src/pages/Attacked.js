import React from 'react';
import CommonAPTPage from './CommonAPTPage';

const Attacked = () => {
    const calculateData = (aptData, year) => {
        // 선택된 연도의 데이터를 필터링
        const yearData = aptData.filter((item) => new Date(item.Date).getFullYear() === year);

        // Victims가 있는 데이터의 총 공격 횟수와 Zero-Day True Count 계산
        const victimStats = yearData.reduce(
            (acc, item) => {
                if (item['Victims'] && item['Victims'] !== 'N/A') {
                    const victims = item['Victims']
                        .split(/[,;]/) // Victims 필드를 분리 (콤마 또는 세미콜론 기준)
                        .map((v) => v.trim()) // 공백 제거
                        .filter((v) => v); // 유효한 값만 남기기

                    // Zero-Day가 true인 경우만 합산
                    if (item['Zero-Day'] === true) {
                        acc.zeroDayTrueCount += victims.length;
                    }

                    // Victims의 개수를 총 공격 횟수에 추가
                    acc.totalTimes += victims.length;
                }
                return acc;
            },
            { totalTimes: 0, zeroDayTrueCount: 0 } // 초기값
        );

        console.log(
            'Year:',
            year,
            'Zero-Day True Count:',
            victimStats.zeroDayTrueCount,
            'Total Victim Attacks:',
            victimStats.totalTimes
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
