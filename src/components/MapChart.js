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
            chart.background.fillOpacity = 1;

            chart.svgContainer.htmlElement.style.width = '1465px';
            chart.svgContainer.htmlElement.style.height = '903px';

            let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            const getCountryName = (countryCode) => {
                const feature = am4geodata_worldLow.features.find((f) => f.properties.id === countryCode);
                return feature ? feature.properties.name : countryCode; // 국가 이름 반환, 없으면 코드 표시
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
                        times: '0 times',
                    });
                }
            });
            let maxTimes = Math.max(...data.map((d) => d.value));

            data = data.map((d) => ({
                ...d,
                customName: getCountryName(d.id),
                fill:
                    d.value > 0 ? am4core.color(`rgba(${colorScale}, ${Math.min(1, d.value / maxTimes)})`) : '#e5e8eb',
                times: `${d.value} ${d.value > 1 ? 'times' : 'time'}`,
            }));

            polygonSeries.data = data;
            polygonSeries.mapPolygons.template.propertyFields.fill = 'fill';
            polygonSeries.mapPolygons.template.tooltipText = '{customName}: {times}';
            polygonSeries.tooltip.background.fill = am4core.color('#f0f0f0'); // 회색 배경
            polygonSeries.tooltip.background.stroke = am4core.color('#cccccc'); // 테두리 색상
            polygonSeries.tooltip.getFillFromObject = false; // 맵 색상에서 배경색 가져오지 않도록 설정
            polygonSeries.tooltip.getStrokeFromObject = false; // 테두리 색상 상속 방지
            polygonSeries.tooltip.label.fill = am4core.color('#000000'); // 글자 색 검정

            let lastSelectedPolygon = null;

            polygonSeries.mapPolygons.template.events.on('hit', (event) => {
                const countryCode = event.target.dataItem.dataContext.id;

                onCountrySelect((prevSelectedCountry) => {
                    if (prevSelectedCountry && prevSelectedCountry.code === countryCode) {
                        if (lastSelectedPolygon) {
                            lastSelectedPolygon.stroke = am4core.color('none');
                            lastSelectedPolygon.strokeWidth = 0;
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
                                lastSelectedPolygon.stroke = am4core.color('none');
                                lastSelectedPolygon.strokeWidth = 0;
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
