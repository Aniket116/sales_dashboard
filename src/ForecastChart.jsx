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
//                 className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm w-48 text-left"
//             >
//                 {selectedOptions.length === options.length ? 'All Categories' : `${selectedOptions.length} Selected`}
//             </button>
//             {isOpen && (
//                 <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
//                     {options.map(option => (
//                         <div key={option} className="flex items-center p-2 hover:bg-gray-600">
//                             <input
//                                 type="checkbox"
//                                 id={`cat-${option}`}
//                                 checked={selectedOptions.includes(option)}
//                                 onChange={() => handleOptionClick(option)}
//                                 className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600"
//                             />
//                             <label htmlFor={`cat-${option}`} className="ml-2 text-sm text-gray-200">{option}</label>
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
    
//     // --- State for new filters ---
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [dateRange, setDateRange] = useState({ start: '', end: '' });

//     useEffect(() => {
//         // --- FIX: Point to the new, corrected forecast CSV file ---
//         const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
        
//         Papa.parse(FORECAST_CSV_URL, {
//             download: true,
//             header: true,
//             dynamicTyping: true,
//             complete: (result) => {
//                 const data = result.data.filter(row => row.Date); // Filter out any empty rows
//                 setAllForecastData(data);
                
//                 // Extract unique categories from the data
//                 const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))].sort();
//                 setCategories(uniqueCategories);
//                 setSelectedCategories(uniqueCategories); // Select all by default

//                 // Set the initial date range to the next 2 weeks from today
//                 const today = new Date('2025-09-01'); // Using the first day of forecast as the base
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

//     // --- Memoized calculation for filtered and aggregated data ---
//     const chartData = useMemo(() => {
//         if (allForecastData.length === 0 || selectedCategories.length === 0 || !dateRange.start || !dateRange.end) {
//             return [];
//         }

//         // Filter data based on selected categories and date range
//         const filtered = allForecastData.filter(row => {
//             const rowDate = new Date(row.Date);
//             return selectedCategories.includes(row.Category) &&
//                    rowDate >= new Date(dateRange.start) &&
//                    rowDate <= new Date(dateRange.end);
//         });

//         // Aggregate the filtered data by date
//         const aggregated = filtered.reduce((acc, row) => {
//             if (!acc[row.Date]) {
//                 acc[row.Date] = {
//                     Date: row.Date,
//                     // --- FIX: Use the new column names ---
//                     Revenue_Forecast: 0,
//                     Units_Sold_Forecast: 0
//                 };
//             }
//             // --- FIX: Sum the new column names ---
//             acc[row.Date].Revenue_Forecast += row.Revenue_Forecast || 0;
//             acc[row.Date].Units_Sold_Forecast += row.Units_Sold_Forecast || 0;
//             return acc;
//         }, {});

//         return Object.values(aggregated).sort((a, b) => new Date(a.Date) - new Date(b.Date));
//     }, [allForecastData, selectedCategories, dateRange]);

//     // --- Event Handlers ---
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

//                     <button 
//                         onClick={handleDownload}
//                         className="p-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 text-sm flex items-center"
//                     >
//                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                        </svg>
//                        Download
//                     </button>
//                 </div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData}>
//                     <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
//                     <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
//                     {/* --- FIX: Add a second Y-axis for Revenue --- */}
//                     <YAxis yAxisId="left" stroke="#82ca9d" tickFormatter={(val) => val.toLocaleString()} />
//                     <YAxis yAxisId="right" orientation="right" stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} />
//                     <Tooltip 
//                         contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
//                         formatter={(value, name) => {
//                             if (name === 'Revenue Forecast') {
//                                 return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
//                             }
//                             return value.toLocaleString();
//                         }}
//                     />
//                     <Legend />
//                     {/* --- FIX: Update dataKeys and names for the lines --- */}
//                     <Line yAxisId="right" type="monotone" dataKey="Revenue_Forecast" name="Revenue Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
//                     <Line yAxisId="left" type="monotone" dataKey="Units_Sold_Forecast" name="Demand Forecast (Units)" stroke="#82ca9d" strokeWidth={2} dot={false} />
//                 </LineChart>
//             </ResponsiveContainer>
//         </div>
//     );
// };

// export default ForecastChart;

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper component for the multi-select dropdown
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
                onBlur={() => setIsOpen(false)} // Close dropdown when it loses focus
                className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm w-48 text-left"
            >
                {selectedOptions.length === options.length ? 'All Categories' : `${selectedOptions.length} Selected`}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                    {options.map(option => (
                        <div key={option} onMouseDown={(e) => e.preventDefault()} onClick={() => handleOptionClick(option)} className="flex items-center p-2 hover:bg-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                id={`cat-forecast-${option}`}
                                readOnly
                                checked={selectedOptions.includes(option)}
                                className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 pointer-events-none"
                            />
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
    const [categories, setCategories] = useState([]);
    
    // State for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
        
        Papa.parse(FORECAST_CSV_URL, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (result) => {
                const data = result.data.filter(row => row.Date);
                setAllForecastData(data);
                
                const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))].sort();
                setCategories(uniqueCategories);
                setSelectedCategories(uniqueCategories);

                const today = new Date('2025-09-01');
                const twoWeeksLater = new Date(today);
                twoWeeksLater.setDate(today.getDate() + 14);

                setDateRange({
                    start: today.toISOString().split('T')[0],
                    end: twoWeeksLater.toISOString().split('T')[0]
                });
            },
            error: (error) => console.error("Error parsing CSV:", error)
        });
    }, []);

    const chartData = useMemo(() => {
        if (allForecastData.length === 0 || selectedCategories.length === 0 || !dateRange.start || !dateRange.end) {
            return [];
        }

        const filtered = allForecastData.filter(row => {
            const rowDate = new Date(row.Date);
            return selectedCategories.includes(row.Category) &&
                   rowDate >= new Date(dateRange.start) &&
                   rowDate <= new Date(dateRange.end);
        });

        const aggregated = filtered.reduce((acc, row) => {
            if (!acc[row.Date]) {
                acc[row.Date] = {
                    Date: row.Date,
                    Revenue_Forecast: 0,
                    Units_Sold_Forecast: 0
                };
            }
            acc[row.Date].Revenue_Forecast += row.Revenue_Forecast || 0;
            acc[row.Date].Units_Sold_Forecast += row.Units_Sold_Forecast || 0;
            return acc;
        }, {});

        return Object.values(aggregated).sort((a, b) => new Date(a.Date) - new Date(b.Date));
    }, [allForecastData, selectedCategories, dateRange]);

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

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-lg font-bold text-cyan-400">Sales & Demand Forecast</h2>
                <div className="flex items-center space-x-3">
                    <MultiSelectDropdown 
                        options={categories}
                        selectedOptions={selectedCategories}
                        onSelectionChange={setSelectedCategories}
                    />
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

            {/* --- FIX: Create a grid to hold the two charts side-by-side --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
                {/* Chart 1: Revenue Forecast */}
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Revenue Forecast</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
                            <YAxis stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
                                formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Revenue_Forecast" name="Revenue Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Demand Forecast */}
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-300 mb-4 text-center">Demand Forecast (Units)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
                            <YAxis stroke="#82ca9d" tickFormatter={(val) => val.toLocaleString()} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
                                formatter={(value) => `${value.toLocaleString()} Units`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Units_Sold_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ForecastChart;

