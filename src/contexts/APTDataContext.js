import React, { createContext, useState, useEffect, useCallback } from 'react';
import { requestJson } from '../config/api';

export const APTDataContext = createContext();

export const APTDataProvider = ({ children }) => {
    const [aptData, setAptData] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const jsonData = await requestJson('/get-apt-data');
            setAptData(jsonData);

            const years = jsonData
                .map((item) => new Date(item.Date).getFullYear())
                .filter((year) => !Number.isNaN(year));
            const uniqueYears = [...new Set(years)];
            setYearOptions(uniqueYears.sort((a, b) => a - b));
        } catch (error) {
            setError(error.message);
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <APTDataContext.Provider value={{ aptData, yearOptions, isLoading, error, refreshData }}>
            {children}
        </APTDataContext.Provider>
    );
};
