// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import ForecastChart from './ForecastChart';

// --- Main Dashboard Component ---
function App() {
  const [salesData, setSalesData] = useState([]);
  const [allSalesData, setAllSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterInputs, setFilterInputs] = useState({ dateRange: { start: '', end: '' }, selectedCategories: [], selectedRegions: [] });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);

  // --- Initial Data Fetch ---
  useEffect(() => {
    async function getInitialData() {
      // NOTE: Using your specified table name 'new_sales_data'
      const { data, error } = await supabase.from('new_sales_data').select('*').order('Date', { ascending: true });

      if (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data.');
      } else {
        setAllSalesData(data);
        setSalesData(data);
        
        const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))];
        const uniqueRegions = [...new Set(data.map(item => item.Region).filter(Boolean))];
        setCategories(uniqueCategories);
        setRegions(uniqueRegions);

        if (data && data.length > 0) {
          setFilterInputs({
            dateRange: { start: data[0].Date, end: data[data.length - 1].Date },
            selectedCategories: uniqueCategories,
            selectedRegions: uniqueRegions
          });
        }
      }
      setLoading(false);
    }
    getInitialData();
  }, []);

  // --- Data Fetching on Filter Submit ---
  const fetchDataForFilters = useCallback(async () => {
    if (!appliedFilters) return;
    setLoading(true);
    
    let query = supabase.from('new_sales_data').select('*');

    if (appliedFilters.dateRange.start) query = query.gte('Date', appliedFilters.dateRange.start);
    if (appliedFilters.dateRange.end) query = query.lte('Date', appliedFilters.dateRange.end);
    if (appliedFilters.selectedCategories.length > 0) query = query.in('Category', appliedFilters.selectedCategories);
    if (appliedFilters.selectedRegions.length > 0) query = query.in('Region', appliedFilters.selectedRegions);

    const { data, error } = await query.order('Date', { ascending: true });

    if (error) {
      console.error('Error fetching filtered data:', error);
      setError('Failed to apply filters.');
      setSalesData([]);
    } else {
      setSalesData(data);
    }
    setLoading(false);
  }, [appliedFilters]);
  useEffect(() => { fetchDataForFilters() }, [fetchDataForFilters]);

  // --- Event Handlers ---
  const handleFilterInputChange = (e) => setFilterInputs(prev => ({...prev, dateRange: { ...prev.dateRange, [e.target.name]: e.target.value }}));
  const handleCategoryChange = (category) => setFilterInputs(prev => ({ ...prev, selectedCategories: prev.selectedCategories.includes(category) ? prev.selectedCategories.filter(c => c !== category) : [...prev.selectedCategories, category] }));
  const handleRegionChange = (region) => setFilterInputs(prev => ({ ...prev, selectedRegions: prev.selectedRegions.includes(region) ? prev.selectedRegions.filter(r => r !== region) : [...prev.selectedRegions, region] }));
  const handleApplyFilters = (e) => { e.preventDefault(); setAppliedFilters(filterInputs); };

  // --- Comprehensive KPI Calculations ---
  const keyMetrics = useMemo(() => {
    if (salesData.length === 0) return {};
    
    const totals = salesData.reduce((acc, item) => {
      const revenue = parseFloat(item.Revenue) || 0;
      const units = parseInt(item['Units Sold'], 10) || 0;
      const profitMarginPercent = parseFloat(item.Profit_Margin) || 0;
      const demand = parseInt(item.Demand, 10) || 0;
      const promotion = parseInt(item.Promotion, 10) || 0;
      
      const profit = revenue * (profitMarginPercent / 100);

      acc.revenue += revenue;
      acc.profit += profit;
      acc.units += units;
      acc.demand += demand;
      if (promotion === 1) acc.promoUnits += units;
      
      return acc;
    }, { revenue: 0, profit: 0, units: 0, demand: 0, promoUnits: 0 });

    const daysInPeriod = salesData.length > 0 ? (new Date(salesData[salesData.length - 1].Date) - new Date(salesData[0].Date)) / (1000 * 60 * 60 * 24) + 1 : 1;

    return {
      totalRevenue: totals.revenue,
      totalProfit: totals.profit,
      overallProfitMargin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
      arpu: totals.units > 0 ? totals.revenue / totals.units : 0,
      totalUnitsSold: totals.units,
      totalTransactions: salesData.length,
      avgUnitsPerTransaction: salesData.length > 0 ? totals.units / salesData.length : 0,
      salesVelocity: totals.units / daysInPeriod,
      totalDemand: totals.demand,
      fulfillmentRate: totals.demand > 0 ? totals.units / totals.demand : 0,
      lostSales: totals.demand - totals.units,
      promoEffectiveness: totals.units > 0 ? totals.promoUnits / totals.units : 0,
    };
  }, [salesData]);

  // --- Inventory Specific Calculations ---
  const inventoryMetrics = useMemo(() => {
      const latestInventory = allSalesData.reduce((acc, item) => {
        acc[item['Product ID']] = item;
        return acc;
      }, {});
      const inventoryTotals = Object.values(latestInventory).reduce((acc, item) => {
          acc.units += parseInt(item['Inventory Level'], 10) || 0;
          acc.value += (parseInt(item['Inventory Level'], 10) || 0) * (parseFloat(item.Price) || 0);
          return acc;
      }, { units: 0, value: 0 });
      const salesTotals = salesData.reduce((acc, item) => {
          const units = parseInt(item['Units Sold'], 10) || 0;
          const daysOfSupply = parseFloat(item.Days_of_Supply) || 0;
          acc.units += units;
          if (units > 0) acc.weightedDaysOfSupplySum += daysOfSupply * units;
          return acc;
      }, { units: 0, weightedDaysOfSupplySum: 0 });
      return {
          totalUnits: inventoryTotals.units,
          totalValue: inventoryTotals.value,
          avgDaysOfSupply: salesTotals.units > 0 ? salesTotals.weightedDaysOfSupplySum / salesTotals.units : 0,
          stockToSalesRatio: salesTotals.units > 0 ? inventoryTotals.units / salesTotals.units : 0,
      };
  }, [allSalesData, salesData]);

  // --- Chart Data Aggregations ---
  const trendData = useMemo(() => {
    const dailyData = salesData.reduce((acc, item) => {
      const date = item.Date;
      if (!acc[date]) acc[date] = { date, Revenue: 0, Profit: 0 };
      const revenue = parseFloat(item.Revenue) || 0;
      const profitMargin = parseFloat(item.Profit_Margin) || 0;
      acc[date].Revenue += revenue;
      acc[date].Profit += revenue * (profitMargin / 100);
      return acc;
    }, {});
    return Object.values(dailyData).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [salesData]);

  const compositionData = useMemo(() => {
     const categoryData = salesData.reduce((acc, item) => {
        const category = item.Category || 'Unknown';
        if(!acc[category]) acc[category] = { name: category, value: 0 };
        acc[category].value += parseInt(item['Units Sold'], 10) || 0;
        return acc;
    }, {});
    return Object.values(categoryData);
  }, [salesData]);

  const regionalData = useMemo(() => {
     const regionData = salesData.reduce((acc, item) => {
        const region = item.Region || 'Unknown';
        if(!acc[region]) acc[region] = { name: region, Revenue: 0 };
        acc[region].Revenue += parseFloat(item.Revenue) || 0;
        return acc;
    }, {});
    return Object.values(regionData);
  }, [salesData]);
  
  const demandData = useMemo(() => {
    const dailyData = salesData.reduce((acc, item) => {
        const date = item.Date;
        if (!acc[date]) acc[date] = { date, Demand: 0, 'Units Sold': 0 };
        acc[date].Demand += parseInt(item.Demand, 10) || 0;
        acc[date]['Units Sold'] += parseInt(item['Units Sold'], 10) || 0;
        return acc;
    }, {});
    return Object.values(dailyData).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [salesData]);
  
  const inventoryTrendData = useMemo(() => {
      const dailyData = salesData.reduce((acc, item) => {
          const date = item.Date;
          if (!acc[date]) acc[date] = { date, 'Inventory Level': 0, count: 0 };
          acc[date]['Inventory Level'] += parseInt(item['Inventory Level'], 10) || 0;
          acc[date].count++;
          return acc;
      }, {});
      return Object.values(dailyData).map(d => ({...d, 'Inventory Level': d['Inventory Level'] / d.count})).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [salesData]);

  const inventoryCompositionData = useMemo(() => {
      const latestInventory = allSalesData.reduce((acc, item) => {
        acc[item['Product ID']] = item;
        return acc;
      }, {});
      const categoryData = Object.values(latestInventory).reduce((acc, item) => {
          const category = item.Category || 'Unknown';
          if (!acc[category]) acc[category] = { name: category, value: 0 };
          acc[category].value += parseInt(item['Inventory Level'], 10) || 0;
          return acc;
      }, {});
      return Object.values(categoryData);
  }, [allSalesData]);

  const daysOfSupplyByCategoryData = useMemo(() => {
      const categoryData = salesData.reduce((acc, item) => {
          const category = item.Category || 'Unknown';
          const daysOfSupply = parseFloat(item.Days_of_Supply) || 0;
          const units = parseInt(item['Units Sold'], 10) || 0;
          if (!acc[category]) acc[category] = { name: category, weightedSum: 0, totalUnits: 0 };
          if (units > 0) {
            acc[category].weightedSum += daysOfSupply * units;
            acc[category].totalUnits += units;
          }
          return acc;
      }, {});
      return Object.values(categoryData).map(cat => ({ name: cat.name, 'Days of Supply': cat.totalUnits > 0 ? cat.weightedSum / cat.totalUnits : 0 }));
  }, [salesData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  // --- Render Logic ---
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-sans">
      <header className="mb-8"><h1 className="text-4xl font-bold text-gray-800 text-center">Comprehensive Sales & Inventory Dashboard</h1></header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <FilterCard categories={categories} regions={regions} filterInputs={filterInputs} onCategoryChange={handleCategoryChange} onRegionChange={handleRegionChange} onDateChange={handleFilterInputChange} onSubmit={handleApplyFilters} loading={loading} />
          <GroupedSummaryTable title="Dashboard KPIs" groups={{
              "Financial Performance": [
                  { metric: 'Total Net Revenue', value: `$${(keyMetrics.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
                  { metric: 'Total Profit', value: `$${(keyMetrics.totalProfit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
                  { metric: 'Overall Profit Margin', value: `${(keyMetrics.overallProfitMargin || 0).toFixed(2)}%` },
                  { metric: 'Avg. Revenue per Unit', value: `$${(keyMetrics.arpu || 0).toFixed(2)}` },
              ],
              "Sales Performance": [
                  { metric: 'Total Units Sold', value: (keyMetrics.totalUnitsSold || 0).toLocaleString('en-US') },
                  { metric: 'Avg. Units per Transaction', value: (keyMetrics.avgUnitsPerTransaction || 0).toFixed(2) },
                  { metric: 'Sales Velocity (Units/Day)', value: (keyMetrics.salesVelocity || 0).toFixed(1) },
              ],
              "Demand & Fulfillment": [
                  { metric: 'Demand Fulfillment Rate', value: `${((keyMetrics.fulfillmentRate || 0) * 100).toFixed(1)}%` },
                  { metric: 'Lost Sales (Units)', value: (keyMetrics.lostSales || 0).toLocaleString('en-US') },
              ]
          }} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Financial Trend (Revenue & Profit)"><ResponsiveContainer width="100%" height={300}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={10} /><YAxis yAxisId="left" stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><Tooltip formatter={(value, name) => `$${value.toLocaleString()}`} /><Legend /><Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8884d8" dot={false} /><Line yAxisId="right" type="monotone" dataKey="Profit" stroke="#82ca9d" dot={false} /></LineChart></ResponsiveContainer></ChartContainer>
            <ChartContainer title="Sales Composition by Category"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label>{compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => value.toLocaleString()} /><Legend /></PieChart></ResponsiveContainer></ChartContainer>
            <ChartContainer title="Regional Performance (Revenue)"><ResponsiveContainer width="100%" height={300}><BarChart data={regionalData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><Tooltip formatter={(value) => `$${value.toLocaleString()}`} /><Legend /><Bar dataKey="Revenue" fill="#8884d8" /></BarChart></ResponsiveContainer></ChartContainer>
            <ChartContainer title="Demand vs. Fulfillment"><ResponsiveContainer width="100%" height={300}><AreaChart data={demandData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={10} /><YAxis /><Tooltip formatter={(value) => value.toLocaleString()} /><Legend /><Area type="monotone" dataKey="Units Sold" stackId="1" stroke="#8884d8" fill="#8884d8" /><Area type="monotone" dataKey="Demand" stackId="1" stroke="#82ca9d" fill="#82ca9d" /></AreaChart></ResponsiveContainer></ChartContainer>
            <div className="md:col-span-2"><ChartContainer title="Price Elasticity (Price vs. Units Sold)"><ResponsiveContainer width="100%" height={300}><ScatterChart><CartesianGrid /><XAxis type="number" dataKey="Price" name="Price" unit="$" /><YAxis type="number" dataKey={'Units Sold'} name="Units Sold" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Sales" data={salesData} fill="#8884d8" /></ScatterChart></ResponsiveContainer></ChartContainer></div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Inventory Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <GroupedSummaryTable title="Inventory KPIs" groups={{
                    "Current Stock": [
                        { metric: 'Total Inventory (Units)', value: (inventoryMetrics.totalUnits || 0).toLocaleString('en-US') },
                        { metric: 'Est. Inventory Value', value: `$${(inventoryMetrics.totalValue || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}` },
                    ],
                    "Performance (Filtered)": [
                         { metric: 'Avg. Days of Supply', value: (inventoryMetrics.avgDaysOfSupply || 0).toFixed(1) },
                         { metric: 'Stock-to-Sales Ratio', value: (inventoryMetrics.stockToSalesRatio || 0).toFixed(2) },
                    ]
                }} />
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartContainer title="Inventory Level Trend (Daily Avg)"><ResponsiveContainer width="100%" height={300}><LineChart data={inventoryTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={10}/><YAxis/><Tooltip formatter={(value) => Math.round(value).toLocaleString()}/><Legend/><Line type="monotone" dataKey="Inventory Level" stroke="#ff7300" dot={false}/></LineChart></ResponsiveContainer></ChartContainer>
                <ChartContainer title="Current Inventory Composition"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={inventoryCompositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ff7300" label>{inventoryCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => value.toLocaleString()}/><Legend/></PieChart></ResponsiveContainer></ChartContainer>
                <div className="md:col-span-2"><ChartContainer title="Average Days of Supply by Category"><ResponsiveContainer width="100%" height={300}><BarChart data={daysOfSupplyByCategoryData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="Days of Supply" fill="#ff7300"/></BarChart></ResponsiveContainer></ChartContainer></div>
            </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Future Forecast</h2>
    <div className="grid grid-cols-1">
      <ForecastChart />
    </div>
  </div>
    </div>
  );
}

// --- Reusable Components ---
const FilterCard = ({ categories, regions, filterInputs, onCategoryChange, onRegionChange, onDateChange, onSubmit, loading }) => (
    <form onSubmit={onSubmit} className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Filters</h3>
        <div className="flex flex-col gap-4">
            <div>
                <label className="font-semibold text-sm">Date Range</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="date" name="start" value={filterInputs.dateRange.start} onChange={onDateChange} className="p-2 border rounded-md w-full text-sm"/>
                    <span className="text-gray-500">to</span>
                    <input type="date" name="end" value={filterInputs.dateRange.end} onChange={onDateChange} className="p-2 border rounded-md w-full text-sm"/>
                </div>
            </div>
            <div>
                <label className="font-semibold text-sm">Categories</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 max-h-20 overflow-y-auto">
                  {categories.map(category => (<div key={category} className="flex items-center"><input type="checkbox" id={`cat-${category}`} value={category} checked={filterInputs.selectedCategories.includes(category)} onChange={() => onCategoryChange(category)} className="h-4 w-4 rounded" /><label htmlFor={`cat-${category}`} className="ml-2 text-sm">{category}</label></div>))}
                </div>
            </div>
            <div>
                <label className="font-semibold text-sm">Regions</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                  {regions.map(region => (<div key={region} className="flex items-center"><input type="checkbox" id={`reg-${region}`} value={region} checked={filterInputs.selectedRegions.includes(region)} onChange={() => onRegionChange(region)} className="h-4 w-4 rounded" /><label htmlFor={`reg-${region}`} className="ml-2 text-sm">{region}</label></div>))}
                </div>
            </div>
            <button type="submit" disabled={loading} className="mt-2 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Loading...' : 'Apply Filters'}</button>
        </div>
    </form>
);

const GroupedSummaryTable = ({ title, groups }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
            {Object.entries(groups).map(([groupName, data]) => (
                <div key={groupName}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupName}</h4>
                    <table className="min-w-full mt-1">
                        <tbody>
                            {data.map((item, index) => (<tr key={index} className="border-b last:border-b-0"><td className="py-1.5 pr-2 font-medium text-gray-600 text-sm">{item.metric}</td><td className="py-1.5 pl-2 text-right font-semibold text-gray-900 text-sm">{item.value}</td></tr>))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
);

const ChartContainer = ({ title, children }) => (<div className="bg-white p-4 rounded-lg shadow-md"><h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>{children}</div>);

export default App;
