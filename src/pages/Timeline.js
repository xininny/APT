import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './Timeline.css';
import Navbar from '../components/Navbar';
import DownloadIcon from '../components/svg/Download.svg';
import Info from '../components/svg/info.svg';
const Timeline = () => {
    const [data, setData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/APT News Article Data.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const processedData = jsonData.reduce((acc, row) => {
                const year = row.Year;
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(row);
                return acc;
            }, {});

            const formattedData = Object.entries(processedData)
                .map(([year, articles]) => ({
                    year,
                    count: articles.length,
                    articles,
                }))
                .sort((a, b) => b.year - a.year);

            setData(formattedData);
        };

        fetchData();
    }, []);

    const handleYearClick = (year, articles) => {
        setSelectedYear(year);
        setArticles(articles);
    };

    return (
        <div>
            <Navbar />
            <img src={Info} alt="Info icon" className="Info-icon" style={{ marginTop: '14px', marginLeft: '1840px' }} />
            <div className="timeline-big-container">
                <div className="timeline-container">
                    <div className="timeline">
                        {data.map((item, index) => (
                            <div key={item.year} className="timeline-item">
                                {index !== data.length - 1 && <div className="timeline-line"></div>}
                                <div className="timeline-content">
                                    <div
                                        className={`timeline-year ${selectedYear === item.year ? 'selected-year' : ''}`}
                                    >
                                        {item.year}
                                    </div>
                                    <div
                                        className={`timeline-circle ${selectedYear === item.year ? 'selected' : ''}`}
                                        onClick={() => handleYearClick(item.year, item.articles)}
                                    >
                                        {item.count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="articles-container">
                        {selectedYear && (
                            <div>
                                <div className="articles-year">{selectedYear}</div>
                                <div>
                                    {articles.map((article, index) => (
                                        <div key={index}>
                                            {article.Title}{' '}
                                            <a
                                                href={article.URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="articles-img"
                                            >
                                                <img src={DownloadIcon} alt="Link" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
