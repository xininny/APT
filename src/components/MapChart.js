import React, { useEffect } from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';

const MapChart = ({ aptData, filterColumn, colorScale, selectedColor, year, onCountrySelect }) => {
    useEffect(() => {
        if (year !== null && aptData.length > 0) {
            let chart = am4core.create('chartdiv', am4maps.MapChart);
            chart.geodata = am4geodata_worldLow;
            chart.projection = new am4maps.projections.Miller();
            chart.deltaLongitude = 0;
            chart.seriesContainer.draggable = false;
            chart.seriesContainer.resizable = false;
            chart.background.fill = am4core.color('#FFFFFF');
            chart.background.fillOpacity = 1; // 이 줄을 추가

            chart.svgContainer.htmlElement.style.width = '1465px';
            chart.svgContainer.htmlElement.style.height = '850px';

            let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;

            polygonSeries.exclude = ['AQ'];

            const getCountryName = (countryCode) => {
                const feature = am4geodata_worldLow.features.find((f) => f.properties.id === countryCode);
                return feature ? feature.properties.name : countryCode; // 국가 이름 반환, 없으면 코드 표시
            };

            const parseZeroDay = (value) => {
                if (value === 'N/A' || value === '') return 'N/A';
                if (typeof value === 'boolean') return value;
                if (typeof value === 'number') return value === 1;
                if (typeof value === 'string') return value.toLowerCase() === 'true';
                return Boolean(value);
            };

            let data = aptData.reduce((acc, item) => {
                const itemYear = new Date(item.Date).getFullYear();
                if (itemYear !== year) return acc;

                const countries = item[filterColumn]?.split(/[,;]/).map((c) => c.trim());
                if (!countries) return acc;

                countries.forEach((countryCode) => {
                    let country = acc.find((d) => d.id === countryCode);
                    if (country) {
                        country.value += 1;
                    } else {
                        acc.push({
                            id: countryCode,
                            name: countryCode,
                            value: 1,
                            fill: '#e5e8eb',
                            times: `1 time`,
                        });
                    }
                });

                return acc;
            }, []);

            am4geodata_worldLow.features.forEach((feature) => {
                const countryCode = feature.properties.id;
                if (!data.find((d) => d.id === countryCode)) {
                    data.push({
                        id: countryCode,
                        customName: feature.properties.name,
                        value: 0,
                        fill: '#e5e8eb',
                        times: '0 attacks',
                    });
                }
            });

            let maxTimes = Math.max(...data.map((d) => d.value));

            // Compute the all-time peak (max attacks for any country in any single year)
            // so sparse years like 2025/2026 share the same color scale as data-rich years.
            const allTimeCounts = {};
            aptData.forEach((item) => {
                const yr = new Date(item.Date).getFullYear();
                const cs = item[filterColumn]?.split(/[,;]/).map((c) => c.trim());
                if (!cs) return;
                cs.forEach((cc) => {
                    const key = `${yr}-${cc}`;
                    allTimeCounts[key] = (allTimeCounts[key] || 0) + 1;
                });
            });
            const allTimeMax = Object.values(allTimeCounts).length
                ? Math.max(...Object.values(allTimeCounts))
                : 1;
            const normalizer = Math.max(maxTimes, allTimeMax);

            data = data.map((d) => {
                const countryData = aptData.filter((item) => {
                    const itemYear = new Date(item.Date).getFullYear();
                    const countries = item[filterColumn]?.split(/[,;]/).map((c) => c.trim());
                    return countries && countries.includes(d.id) && itemYear === year;
                });

                return {
                    ...d,
                    customName: getCountryName(d.id),
                    fill:
                        d.value > 0
                            ? am4core.color(`rgba(${colorScale}, ${Math.max(0.1, Math.min(1, d.value / normalizer))})`)
                            : '#E4E4E5',
                    times: `${countryData.length} ${countryData.length > 1 ? 'attacks' : 'attack'}`,
                };
            });

            polygonSeries.data = data;
            polygonSeries.mapPolygons.template.propertyFields.fill = 'fill';
            polygonSeries.mapPolygons.template.tooltipText = '{customName}: {times}';
            polygonSeries.mapPolygons.template.tooltipPosition = 'pointer';
            polygonSeries.tooltip.background.fill = am4core.color('#0220470d'); // 회색 배경
            polygonSeries.tooltip.getFillFromObject = false;
            polygonSeries.tooltip.label.fill = am4core.color('#000000');

            let lastSelectedPolygon = null;

            polygonSeries.mapPolygons.template.events.on('hit', (event) => {
                const countryCode = event.target.dataItem.dataContext.id;

                onCountrySelect((prevSelectedCountry) => {
                    if (prevSelectedCountry && prevSelectedCountry.code === countryCode) {
                        if (lastSelectedPolygon) {
                            // 이전 선택한 나라의 테두리 색상과 채우기 색상을 원래대로 초기화
                            lastSelectedPolygon.stroke = am4core.color('#ffffff'); // 기본 테두리 색
                            lastSelectedPolygon.strokeWidth = 1; // 기본 테두리 두께로 설정
                            lastSelectedPolygon = null;
                        }
                        return null;
                    } else {
                        const countryData = aptData.filter((item) => {
                            const itemYear = new Date(item.Date).getFullYear();
                            const countries = item[filterColumn]?.split(/[,;]/).map((c) => c.trim());
                            return countries && countries.includes(countryCode) && itemYear === year;
                        });

                        if (countryData.length > 0) {
                            const countryInfoArray = countryData.map((data) => ({
                                threatActor: data['Threat Actor'],
                                zeroDay: parseZeroDay(data['Zero-Day']),
                                isHash: data['IsHash'] && data['IsHash'].toLowerCase() === 'true' ? 'True' : 'False',
                                downloadUrl: data['Download Url'],
                                source: data['Source'],
                                CVE: data['CVE'] || 'N/A',
                                initialVector: data['AttackVector'] || data['InitialVector'] || 'N/A',
                                malware: data['Malware'] || 'N/A',
                                targetedSectors: data['Target Sectors'] || 'N/A',
                                duration: data['Duration'] ? `${data['Duration']} days` : 'N/A',
                                startDate: data['New Start Date'] || 'N/A',
                                endDate: data['New End Date'] || 'N/A',
                            }));

                            // 이전 선택한 폴리곤의 테두리 색상과 두께 초기화
                            if (lastSelectedPolygon) {
                                lastSelectedPolygon.stroke = am4core.color('#e5e8eb'); // 기본 색상
                                lastSelectedPolygon.strokeWidth = 1; // 기본 두께
                            }

                            // 현재 선택한 폴리곤의 테두리 색상과 두께 변경
                            lastSelectedPolygon = event.target;
                            event.target.stroke = am4core.color(selectedColor); // 선택된 색상
                            event.target.strokeWidth = 3; // 두께 설정

                            return {
                                name: event.target.dataItem.dataContext.name,
                                details: countryInfoArray,
                                times: countryData.length,
                                code: countryCode,
                            };
                        }
                    }
                });
            });

            return () => {
                chart.dispose();
            };
        }
    }, [year, aptData, filterColumn, selectedColor, onCountrySelect, colorScale]);

    return (
        <div
            id="chartdiv"
            style={{
                width: '1465px',
                height: '903px',
                position: 'absolute',
                left: '20px',
                top: '40px',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
        ></div>
    );
};

export default MapChart;
