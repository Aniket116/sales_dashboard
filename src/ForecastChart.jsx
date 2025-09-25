// import React, { useState, useEffect, useMemo } from 'react';
// import Papa from 'papaparse';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // Helper component for the multi-select dropdown
// const MultiSelectDropdown = ({ options, selectedOptions, onSelectionChange }) => {
//     const [isOpen, setIsOpen] = useState(false);

//     const handleOptionClick = (option) => {
//         const newSelection = selectedOptions.includes(option)
//             ? selectedOptions.filter(item => item !== option)
//             : [...selectedOptions, option];
//         onSelectionChange(newSelection);
//     };

//     return (
//         <div className="relative">
//             <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 onBlur={() => setIsOpen(false)} // Close dropdown when it loses focus
//                 className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm w-48 text-left"
//             >
//                 {selectedOptions.length === options.length ? 'All Categories' : `${selectedOptions.length} Selected`}
//             </button>
//             {isOpen && (
//                 <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
//                     {options.map(option => (
//                         <div key={option} onMouseDown={(e) => e.preventDefault()} onClick={() => handleOptionClick(option)} className="flex items-center p-2 hover:bg-gray-600 cursor-pointer">
//                             <input
//                                 type="checkbox"
//                                 id={`cat-forecast-${option}`}
//                                 readOnly
//                                 checked={selectedOptions.includes(option)}
//                                 className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 pointer-events-none"
//                             />
//                             <label htmlFor={`cat-forecast-${option}`} className="ml-2 text-sm text-gray-200">{option}</label>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };


// const ForecastChart = () => {
//     const [allForecastData, setAllForecastData] = useState([]);
//     const [categories, setCategories] = useState([]);
    
//     // State for filters
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [dateRange, setDateRange] = useState({ start: '', end: '' });

//     useEffect(() => {
//         const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
        
//         Papa.parse(FORECAST_CSV_URL, {
//             download: true,
//             header: true,
//             dynamicTyping: true,
//             complete: (result) => {
//                 const data = result.data.filter(row => row.Date);
//                 setAllForecastData(data);
                
//                 const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))].sort();
//                 setCategories(uniqueCategories);
//                 setSelectedCategories(uniqueCategories);

//                 const today = new Date('2025-09-01');
//                 const twoWeeksLater = new Date(today);
//                 twoWeeksLater.setDate(today.getDate() + 14);

//                 setDateRange({
//                     start: today.toISOString().split('T')[0],
//                     end: twoWeeksLater.toISOString().split('T')[0]
//                 });
//             },
//             error: (error) => console.error("Error parsing CSV:", error)
//         });
//     }, []);

//     const chartData = useMemo(() => {
//         if (allForecastData.length === 0 || selectedCategories.length === 0 || !dateRange.start || !dateRange.end) {
//             return [];
//         }

//         const filtered = allForecastData.filter(row => {
//             const rowDate = new Date(row.Date);
//             return selectedCategories.includes(row.Category) &&
//                    rowDate >= new Date(dateRange.start) &&
//                    rowDate <= new Date(dateRange.end);
//         });

//         const aggregated = filtered.reduce((acc, row) => {
//             if (!acc[row.Date]) {
//                 acc[row.Date] = {
//                     Date: row.Date,
//                     Revenue_Forecast: 0,
//                     Units_Sold_Forecast: 0
//                 };
//             }
//             acc[row.Date].Revenue_Forecast += row.Revenue_Forecast || 0;
//             acc[row.Date].Units_Sold_Forecast += row.Units_Sold_Forecast || 0;
//             return acc;
//         }, {});

//         return Object.values(aggregated).sort((a, b) => new Date(a.Date) - new Date(b.Date));
//     }, [allForecastData, selectedCategories, dateRange]);

//     const handleDateChange = (e) => {
//         setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     };

//     const handleDownload = () => {
//         if (chartData.length === 0) return;
//         const csv = Papa.unparse(chartData);
//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//         const link = document.createElement('a');
//         const url = URL.createObjectURL(blob);
//         link.setAttribute('href', url);
//         link.setAttribute('download', `forecast_data_${dateRange.start}_to_${dateRange.end}.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const forecastTotals = useMemo(() => {
//         return chartData.reduce((acc, row) => {
//             acc.totalRevenue += row.Revenue_Forecast || 0;
//             acc.totalUnits += row.Units_Sold_Forecast || 0;
//             return acc;
//         }, { totalRevenue: 0, totalUnits: 0 });
//     }, [chartData]);

//     return (
//         <div className="bg-gray-800 p-4 rounded-lg shadow-md">
//             <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
//                 <h2 className="text-lg font-bold text-cyan-400">Sales & Demand Forecast</h2>
//                 <div className="flex items-center space-x-3">
//                     <MultiSelectDropdown 
//                         options={categories}
//                         selectedOptions={selectedCategories}
//                         onSelectionChange={setSelectedCategories}
//                     />
//                     <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm [color-scheme:dark]"/>
//                     <span className="text-gray-500">to</span>
//                     <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm [color-scheme:dark]"/>
//                     <button onClick={handleDownload} className="p-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 text-sm flex items-center">
//                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                        </svg>
//                        Download
//                     </button>
//                 </div>
//             </div>

//             {/* --- FIX: Create a grid to hold the two charts side-by-side --- */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
//                 {/* Chart 1: Revenue Forecast */}
//                 <div className="bg-gray-900 p-4 rounded-lg">
//                     <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Revenue Forecast</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
//                             <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
//                             <YAxis stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} />
//                             <Tooltip 
//                                 contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
//                                 formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
//                             />
//                             <Legend />
//                             <Line type="monotone" dataKey="Revenue_Forecast" name="Revenue Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                     <div className="text-center mt-3">
//                         <p className="text-gray-400 text-sm">Total Forecasted Revenue:</p>
//                         <p className="text-white text-2xl font-bold">
//                             ${forecastTotals.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Chart 2: Demand Forecast */}
//                 <div className="bg-gray-900 p-4 rounded-lg">
//                     <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Demand Forecast (Units)</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
//                             <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
//                             <YAxis stroke="#82ca9d" tickFormatter={(val) => val.toLocaleString()} />
//                             <Tooltip 
//                                 contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
//                                 formatter={(value) => `${value.toLocaleString()} Units`}
//                             />
//                             <Legend />
//                             <Line type="monotone" dataKey="Units_Sold_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                     <div className="text-center mt-3">
//                         <p className="text-gray-400 text-sm">Total Forecasted Demand:</p>
//                         <p className="text-white text-2xl font-bold">
//                             {forecastTotals.totalUnits.toLocaleString()} Units
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ForecastChart;

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { supabase } from './supabaseClient'; // Import supabase client to fetch historical data
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Helper component for the multi-select dropdown (no changes needed)
const MultiSelectDropdown = ({ options, selectedOptions, onSelectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleOptionClick = (option) => {
        const newSelection = selectedOptions.includes(option)
            ? selectedOptions.filter(item => item !== option)
            : [...selectedOptions, option];
        onSelectionChange(newSelection);
    };
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setIsOpen(false)}
                className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm w-48 text-left"
            >
                {selectedOptions.length === options.length ? 'All Categories' : `${selectedOptions.length} Selected`}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                    {options.map(option => (
                        <div key={option} onMouseDown={(e) => e.preventDefault()} onClick={() => handleOptionClick(option)} className="flex items-center p-2 hover:bg-gray-600 cursor-pointer">
                            <input type="checkbox" id={`cat-forecast-${option}`} readOnly checked={selectedOptions.includes(option)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 pointer-events-none" />
                            <label htmlFor={`cat-forecast-${option}`} className="ml-2 text-sm text-gray-200">{option}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ForecastChart = () => {
    const [allForecastData, setAllForecastData] = useState([]);
    const [historicalData, setHistoricalData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        async function fetchData() {
            try {
                // Step 1: Fetch the forecast data
                const forecastPromise = new Promise((resolve, reject) => {
                    const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
                    Papa.parse(FORECAST_CSV_URL, {
                        download: true, header: true, dynamicTyping: true,
                        complete: (result) => resolve(result.data.filter(row => row.Date)),
                        error: (error) => reject(error)
                    });
                });

                const forecastData = await forecastPromise;
                if (!forecastData || forecastData.length === 0) {
                    console.error("Forecast data is empty or failed to load.");
                    return;
                }
                setAllForecastData(forecastData);

                const uniqueCategories = [...new Set(forecastData.map(item => item.Category).filter(Boolean))].sort();
                setCategories(uniqueCategories);
                setSelectedCategories(uniqueCategories);
                
                // Step 2: Determine date ranges
                const firstForecastDate = new Date(forecastData[0].Date);
                const historicalStartDate = new Date(firstForecastDate);
                historicalStartDate.setDate(firstForecastDate.getDate() - 60);

                const twoWeeksLater = new Date(firstForecastDate);
                twoWeeksLater.setDate(firstForecastDate.getDate() + 14);

                setDateRange({
                    start: firstForecastDate.toISOString().split('T')[0],
                    end: twoWeeksLater.toISOString().split('T')[0]
                });
                
                // --- FIX: Implement pagination to fetch ALL historical data for the comparison window ---
                let allHistoricalData = [];
                let page = 0;
                const pageSize = 1000;
                let hasMore = true;

                while(hasMore) {
                    const { data, error } = await supabase
                        .from('new_sales_data')
                        .select('Date, Category, Revenue, "Units Sold"')
                        .gte('Date', historicalStartDate.toISOString().split('T')[0])
                        .lt('Date', firstForecastDate.toISOString().split('T')[0])
                        .range(page * pageSize, (page + 1) * pageSize - 1);

                    if (error) {
                        console.error("Error fetching historical data:", error);
                        hasMore = false; // Stop on error
                    } else if (data && data.length > 0) {
                        allHistoricalData = allHistoricalData.concat(data);
                        page++;
                    } else {
                        hasMore = false; // No more data
                    }
                }
                setHistoricalData(allHistoricalData);

            } catch (error) {
                console.error("Error processing forecast data:", error);
            }
        }
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        if (selectedCategories.length === 0) return [];

        // Aggregate historical data
        const historicalAggregated = historicalData
            .filter(row => selectedCategories.includes(row.Category))
            .reduce((acc, row) => {
                if (!acc[row.Date]) {
                    acc[row.Date] = { Date: row.Date, Actual_Revenue: 0, Actual_Units: 0 };
                }
                acc[row.Date].Actual_Revenue += row.Revenue || 0;
                acc[row.Date].Actual_Units += row['Units Sold'] || 0;
                return acc;
            }, {});

        // Aggregate forecast data
        const forecastAggregated = allForecastData
            .filter(row => {
                const rowDate = new Date(row.Date);
                return selectedCategories.includes(row.Category) &&
                       rowDate >= new Date(dateRange.start) &&
                       rowDate <= new Date(dateRange.end);
            })
            .reduce((acc, row) => {
                if (!acc[row.Date]) {
                    acc[row.Date] = { Date: row.Date, Revenue_Forecast: 0, Units_Sold_Forecast: 0 };
                }
                acc[row.Date].Revenue_Forecast += row.Revenue_Forecast || 0;
                acc[row.Date].Units_Sold_Forecast += row.Units_Sold_Forecast || 0;
                return acc;
            }, {});

        // Merge historical and forecast data
        const combinedData = { ...historicalAggregated };
        Object.keys(forecastAggregated).forEach(date => {
            if (combinedData[date]) {
                combinedData[date] = { ...combinedData[date], ...forecastAggregated[date] };
            } else {
                combinedData[date] = forecastAggregated[date];
            }
        });

        return Object.values(combinedData).sort((a, b) => new Date(a.Date) - new Date(b.Date));
    }, [historicalData, allForecastData, selectedCategories, dateRange]);

    const handleDateChange = (e) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDownload = () => {
        if (chartData.length === 0) return;
        const csv = Papa.unparse(chartData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `forecast_data_${dateRange.start}_to_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const forecastTotals = useMemo(() => {
        return chartData.reduce((acc, row) => {
            acc.totalRevenue += row.Revenue_Forecast || 0;
            acc.totalUnits += row.Units_Sold_Forecast || 0;
            return acc;
        }, { totalRevenue: 0, totalUnits: 0 });
    }, [chartData]);

    const firstForecastDate = allForecastData.length > 0 ? allForecastData[0].Date : '';

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-lg font-bold text-cyan-400">Historical & Forecasted Performance</h2>
                <div className="flex items-center space-x-3">
                    <MultiSelectDropdown options={categories} selectedOptions={selectedCategories} onSelectionChange={setSelectedCategories} />
                    <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm [color-scheme:dark]"/>
                    <span className="text-gray-500">to</span>
                    <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm [color-scheme:dark]"/>
                    <button onClick={handleDownload} className="p-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 text-sm flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                       Download
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Revenue vs. Forecast</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
                            <YAxis stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} />
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value, name) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                            <Legend />
                            <ReferenceLine x={firstForecastDate} stroke="red" strokeDasharray="3 3" label={{ value: 'Forecast Starts', position: 'insideTopLeft', fill: 'red', fontSize: 10 }} />
                            <Line type="monotone" dataKey="Actual_Revenue" name="Actual Revenue" stroke="#55ddff" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Revenue_Forecast" name="Revenue Forecast" stroke="#8884d8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-3"><p className="text-gray-400 text-sm">Total Forecasted Revenue:</p><p className="text-white text-2xl font-bold">${forecastTotals.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p></div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Demand vs. Forecast (Units)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
                            <YAxis stroke="#82ca9d" tickFormatter={(val) => val.toLocaleString()} />
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => `${value.toLocaleString()} Units`} />
                            <Legend />
                            <ReferenceLine x={firstForecastDate} stroke="red" strokeDasharray="3 3" label={{ value: 'Forecast Starts', position: 'insideTopLeft', fill: 'red', fontSize: 10 }} />
                            <Line type="monotone" dataKey="Actual_Units" name="Actual Demand" stroke="#52de97" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Units_Sold_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-3"><p className="text-gray-400 text-sm">Total Forecasted Demand:</p><p className="text-white text-2xl font-bold">{forecastTotals.totalUnits.toLocaleString()} Units</p></div>
                </div>
            </div>
        </div>
    );
};

export default ForecastChart;

