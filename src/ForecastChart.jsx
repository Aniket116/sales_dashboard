// // src/ForecastChart.jsx
// import React, { useState, useEffect } from 'react';
// import Papa from 'papaparse';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const ForecastChart = () => {
//   const [forecastData, setForecastData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [timeframe, setTimeframe] = useState(30); // Default to next 30 days

//   useEffect(() => {
//     // ✅ Replace with the public URL of your CSV file from Supabase Storage
//     const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv';

//     Papa.parse(FORECAST_CSV_URL, {
//       download: true,
//       header: true,
//       dynamicTyping: true, // Automatically converts numbers
//       complete: (result) => {
//         setForecastData(result.data);
//         setFilteredData(result.data.slice(0, 30)); // Initially show 30 days
//       },
//       error: (error) => {
//         console.error("Error parsing CSV:", error);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     setFilteredData(forecastData.slice(0, timeframe));
//   }, [timeframe, forecastData]);

//   if (forecastData.length === 0) {
//     return <div className="text-center p-4">Loading forecast data...</div>;
//   }

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-bold text-gray-800">Sales & Demand Forecast</h2>
//         <select
//           value={timeframe}
//           onChange={(e) => setTimeframe(Number(e.target.value))}
//           className="p-2 border rounded-md text-sm"
//         >
//           <option value="7">Next 7 Days</option>
//           <option value="30">Next 30 Days</option>
//           <option value="90">Next 90 Days</option>
//         </select>
//       </div>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={filteredData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="Date" fontSize={10} />
//           <YAxis />
//           <Tooltip formatter={(value) => value.toLocaleString()} />
//           <Legend />
//           <Line type="monotone" dataKey="Sales_Forecast" name="Sales Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
//           <Line type="monotone" dataKey="Demand_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default ForecastChart;











// import React, { useState, useEffect } from 'react';
// import Papa from 'papaparse';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const ForecastChart = () => {
//   const [forecastData, setForecastData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [timeframe, setTimeframe] = useState(30);

//   useEffect(() => {
//     const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv'; // Replace with your CSV URL
    
//     Papa.parse(FORECAST_CSV_URL, {
//       download: true,
//       header: true,
//       dynamicTyping: true,
//       complete: (result) => {
//         setForecastData(result.data);
//         setFilteredData(result.data.slice(0, 30));
//       },
//       error: (error) => console.error("Error parsing CSV:", error)
//     });
//   }, []);

//   useEffect(() => {
//     setFilteredData(forecastData.slice(0, timeframe));
//   }, [timeframe, forecastData]);

//   return (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-md">
//         <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-400">Sales & Demand Forecast</h2>
//             <select
//               value={timeframe}
//               onChange={(e) => setTimeframe(Number(e.target.value))}
//               className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm"
//             >
//               <option value="7">Next 7 Days</option>
//               <option value="30">Next 30 Days</option>
//               <option value="90">Next 90 Days</option>
//             </select>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={filteredData}>
//                 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
//                 <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
//                 <YAxis stroke="#a0aec0" />
//                 <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
//                 <Legend />
//                 <Line type="monotone" dataKey="Sales_Forecast" name="Sales Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
//                 <Line type="monotone" dataKey="Demand_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
//             </LineChart>
//         </ResponsiveContainer>
//     </div>
//   );
// };

// export default ForecastChart;

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastChart = () => {
  const [forecastData, setForecastData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv';
    
    Papa.parse(FORECAST_CSV_URL, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setForecastData(result.data);
        setFilteredData(result.data.slice(0, 30));
      },
      error: (error) => console.error("Error parsing CSV:", error)
    });
  }, []);

  useEffect(() => {
    setFilteredData(forecastData.slice(0, timeframe));
  }, [timeframe, forecastData]);

  // Function to handle the CSV download
  const handleDownload = () => {
    // Convert the currently filtered data to a CSV string
    const csv = Papa.unparse(filteredData);
    
    // Create a Blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `forecast_data_${timeframe}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-400">Sales & Demand Forecast</h2>
            <div className="flex items-center space-x-3">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(Number(e.target.value))}
                  className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm"
                >
                  <option value="7">Next 7 Days</option>
                  <option value="30">Next 30 Days</option>
                  <option value="90">Next 90 Days</option>
                </select>
                {/* Download Button */}
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 text-sm flex items-center"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   Download
                </button>
            </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="Date" fontSize={10} stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
                <Legend />
                <Line type="monotone" dataKey="Sales_Forecast" name="Sales Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Demand_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
