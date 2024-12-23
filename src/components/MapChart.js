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
            chart.deltaLongitude = -10;
            chart.seriesContainer.draggable = false;
            chart.seriesContainer.resizable = false;
            chart.background.fill = am4core.color('#FFFFFF');
            chart.background.fillOpacity = 1;

            chart.svgContainer.htmlElement.style.width = '1465px';
            chart.svgContainer.htmlElement.style.height = '903px';

            let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;

            // 데이터 변환 작업 (필터링 및 매핑) 최적화
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
                            name: countryCode, // 초기값, 지도 데이터를 통해 이름 추가 예정
                            value: 1,
                            fill: '#e5e8eb',
                            times: `1 time`,
                        });
                    }
                });

                return acc;
            }, []);

            let maxTimes = Math.max(...data.map((d) => d.value));

            data = data.map((d) => ({
                ...d,
                fill:
                    d.value > 0 ? am4core.color(`rgba(${colorScale}, ${Math.min(1, d.value / maxTimes)})`) : '#e5e8eb',
                times: `${d.value} ${d.value > 1 ? 'times' : 'time'}`,
            }));

            polygonSeries.data = data;
            polygonSeries.mapPolygons.template.propertyFields.fill = 'fill';
            polygonSeries.mapPolygons.template.tooltipText = '{name}: {times}';

            let lastSelectedPolygon = null;

            polygonSeries.mapPolygons.template.events.on('hit', (event) => {
                const countryCode = event.target.dataItem.dataContext.id;

                onCountrySelect((prevSelectedCountry) => {
                    if (prevSelectedCountry && prevSelectedCountry.code === countryCode) {
                        if (lastSelectedPolygon) {
                            lastSelectedPolygon.stroke = am4core.color('#ffffff');
                            lastSelectedPolygon.strokeWidth = 1;
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
                                zeroDay: data['Zero-Day'],
                                isHash: data['IsHash'] && data['IsHash'].toLowerCase() === 'true' ? 'True' : 'False',
                                downloadUrl: data['Download Url'],
                                source: data['Source'],
                                CVE: data['CVE'] || 'N/A',
                                initialVector: data['InitialVector'] || 'N/A',
                                malware: data['Malware'] || 'N/A',
                                timeline: data['Timeline'] || 'N/A',
                                targetedSectors: data['Targeted Sectors'] || 'N/A',
                                duration: data['Duration'] || 'N/A',
                            }));

                            if (lastSelectedPolygon) {
                                lastSelectedPolygon.stroke = am4core.color('#ffffff');
                                lastSelectedPolygon.strokeWidth = 1;
                            }

                            lastSelectedPolygon = event.target;
                            event.target.stroke = am4core.color(selectedColor);
                            event.target.strokeWidth = 3;

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
                top: '107px',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
        ></div>
    );
};

export default MapChart;
