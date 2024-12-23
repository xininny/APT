import React, { createContext, useState, useEffect } from 'react';

export const APTDataContext = createContext();

export const APTDataProvider = ({ children }) => {
    const [aptData, setAptData] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://apt-backend-cb60223ac599.herokuapp.com/get-apt-data');
                const jsonData = await response.json();
                if (response.ok) {
                    setAptData(jsonData);

                    const years = jsonData.map((item) => new Date(item.Date).getFullYear());
                    const uniqueYears = [...new Set(years)];
                    setYearOptions(uniqueYears.sort((a, b) => a - b));
                } else {
                    console.error('Failed to fetch APT data:', jsonData.error);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return <APTDataContext.Provider value={{ aptData, yearOptions, isLoading }}>{children}</APTDataContext.Provider>;
};
