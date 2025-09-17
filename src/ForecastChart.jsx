// src/ForecastChart.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastChart = () => {
  const [forecastData, setForecastData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeframe, setTimeframe] = useState(30); // Default to next 30 days

  useEffect(() => {
    // ✅ Replace with the public URL of your CSV file from Supabase Storage
    const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv';

    Papa.parse(FORECAST_CSV_URL, {
      download: true,
      header: true,
      dynamicTyping: true, // Automatically converts numbers
      complete: (result) => {
        setForecastData(result.data);
        setFilteredData(result.data.slice(0, 30)); // Initially show 30 days
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      }
    });
  }, []);

  useEffect(() => {
    setFilteredData(forecastData.slice(0, timeframe));
  }, [timeframe, forecastData]);

  if (forecastData.length === 0) {
    return <div className="text-center p-4">Loading forecast data...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Sales & Demand Forecast</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
          className="p-2 border rounded-md text-sm"
        >
          <option value="7">Next 7 Days</option>
          <option value="30">Next 30 Days</option>
          <option value="90">Next 90 Days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" fontSize={10} />
          <YAxis />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
          <Line type="monotone" dataKey="Sales_Forecast" name="Sales Forecast" stroke="#8884d8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Demand_Forecast" name="Demand Forecast" stroke="#82ca9d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;