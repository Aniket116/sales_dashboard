// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { supabase } from './supabaseClient';
// import {
//   LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
// } from 'recharts';
// import ForecastChart from './ForecastChart';
// import Chatbot from './Chatbot';

// // --- Main Dashboard Component ---
// function App() {
//   const [salesData, setSalesData] = useState([]);
//   const [allSalesData, setAllSalesData] = useState([]);
//   const [forecastData, setForecastData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterInputs, setFilterInputs] = useState({ dateRange: { start: '', end: '' }, selectedCategories: [], selectedRegions: [] });
//   const [appliedFilters, setAppliedFilters] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [regions, setRegions] = useState([]);

//   // --- Initial Data Fetch ---
//   useEffect(() => {
//     async function getInitialData() {
//       const { data, error } = await supabase.from('new_sales_data').select('*').order('Date', { ascending: true });
//       if (error) {
//         console.error('Error fetching initial data:', error);
//         setError('Failed to load initial data.');
//       } else {
//         setAllSalesData(data);
//         setSalesData(data);
//         const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))];
//         const uniqueRegions = [...new Set(data.map(item => item.Region).filter(Boolean))];
//         setCategories(uniqueCategories);
//         setRegions(uniqueRegions);
//         if (data && data.length > 0) {
//           setFilterInputs({
//             dateRange: { start: data[0].Date, end: data[data.length - 1].Date },
//             selectedCategories: uniqueCategories,
//             selectedRegions: uniqueRegions
//           });
//         }
//       }
//       const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv';
//       if (FORECAST_CSV_URL !== 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output.csv') {
//         Papa.parse(FORECAST_CSV_URL, {
//           download: true, header: true, dynamicTyping: true,
//           complete: (result) => setForecastData(result.data),
//           error: (err) => console.error("Error loading forecast CSV:", err)
//         });
//       }
      
//       setLoading(false);
//     }
//     getInitialData();
//   }, []);

//   // --- Data Fetching on Filter Submit ---
//   const fetchDataForFilters = useCallback(async () => {
//     if (!appliedFilters) return;
//     setLoading(true);
//     let query = supabase.from('new_sales_data').select('*');
//     if (appliedFilters.dateRange.start) query = query.gte('Date', appliedFilters.dateRange.start);
//     if (appliedFilters.dateRange.end) query = query.lte('Date', appliedFilters.dateRange.end);
//     if (appliedFilters.selectedCategories.length > 0) query = query.in('Category', appliedFilters.selectedCategories);
//     if (appliedFilters.selectedRegions.length > 0) query = query.in('Region', appliedFilters.selectedRegions);
//     const { data, error } = await query.order('Date', { ascending: true });
//     if (error) {
//       console.error('Error fetching filtered data:', error);
//       setError('Failed to apply filters.');
//       setSalesData([]);
//     } else {
//       setSalesData(data);
//     }
//     setLoading(false);
//   }, [appliedFilters]);
//   useEffect(() => { fetchDataForFilters() }, [fetchDataForFilters]);

//   // --- Event Handlers ---
//   const handleFilterInputChange = (e) => setFilterInputs(prev => ({...prev, dateRange: { ...prev.dateRange, [e.target.name]: e.target.value }}));
//   const handleCategoryChange = (category) => setFilterInputs(prev => ({ ...prev, selectedCategories: prev.selectedCategories.includes(category) ? prev.selectedCategories.filter(c => c !== category) : [...prev.selectedCategories, category] }));
//   const handleRegionChange = (region) => setFilterInputs(prev => ({ ...prev, selectedRegions: prev.selectedRegions.includes(region) ? prev.selectedRegions.filter(r => r !== region) : [...prev.selectedRegions, region] }));
//   const handleApplyFilters = (e) => { e.preventDefault(); setAppliedFilters(filterInputs); };

//  // --- Comprehensive KPI Calculations ---
//   const keyMetrics = useMemo(() => {
//     if (salesData.length === 0) return {};
//     const totals = salesData.reduce((acc, item) => {
//       const revenue = parseFloat(item.Revenue) || 0;
//       const units = parseInt(item['Units Sold'], 10) || 0;
//       const profitMarginPercent = parseFloat(item.Profit_Margin) || 0;
//       const demand = parseInt(item.Demand, 10) || 0;
//       const promotion = parseInt(item.Promotion, 10) || 0;
//       const profit = revenue * (profitMarginPercent / 100);
//       acc.revenue += revenue;
//       acc.profit += profit;
//       acc.units += units;
//       acc.demand += demand;
//       if (promotion === 1) acc.promoUnits += units;
//       return acc;
//     }, { revenue: 0, profit: 0, units: 0, demand: 0, promoUnits: 0 });
//     const daysInPeriod = salesData.length > 0 ? (new Date(salesData[salesData.length - 1].Date) - new Date(salesData[0].Date)) / (1000 * 60 * 60 * 24) + 1 : 1;
//     return {
//       totalRevenue: totals.revenue,
//       totalProfit: totals.profit,
//       overallProfitMargin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
//       arpu: totals.units > 0 ? totals.revenue / totals.units : 0,
//       totalUnitsSold: totals.units,
//       totalTransactions: salesData.length,
//       avgUnitsPerTransaction: salesData.length > 0 ? totals.units / salesData.length : 0,
//       salesVelocity: totals.units / daysInPeriod,
//       totalDemand: totals.demand,
//       fulfillmentRate: totals.demand > 0 ? totals.units / totals.demand : 0,
//       lostSales: totals.demand - totals.units,
//       promoEffectiveness: totals.units > 0 ? totals.promoUnits / totals.units : 0,
//     };
//   }, [salesData]);

//     // --- ✅ 1. NEW: Product Performance Analysis ---
//   const productPerformance = useMemo(() => {
//     if (salesData.length === 0) return { topPerformers: [], productsToWatch: [] };

//     const productAggregates = salesData.reduce((acc, item) => {
//       const productId = item['Product ID'];
//       if (!acc[productId]) {
//         acc[productId] = { id: productId, revenue: 0, profit: 0, units: 0, demand: 0 };
//       }
//       const revenue = parseFloat(item.Revenue) || 0;
//       const profitMargin = parseFloat(item.Profit_Margin) || 0;
//       acc[productId].revenue += revenue;
//       acc[productId].profit += revenue * (profitMargin / 100);
//       acc[productId].units += parseInt(item['Units Sold'], 10) || 0;
//       acc[productId].demand += parseInt(item.Demand, 10) || 0;
//       return acc;
//     }, {});
    
//     const allProducts = Object.values(productAggregates);
    
//     // Sort by a combined score of revenue and profit for top performers
//     const topPerformers = [...allProducts].sort((a, b) => (b.revenue + b.profit) - (a.revenue + a.profit)).slice(0, 5);

//     // Identify products with low units sold or high demand gap for products to watch
//     const productsToWatch = [...allProducts]
//         .map(p => ({...p, demandGap: p.demand - p.units}))
//         .sort((a, b) => a.units - b.units) // Sort by lowest units sold
//         .slice(0, 5);

//     return { topPerformers, productsToWatch };
//   }, [salesData]);

//     // --- ✅ 2. NEW: Inventory Risk and Restocking Calculation ---
//   const inventoryRiskAnalysis = useMemo(() => {
//     if (allSalesData.length === 0 || forecastData.length === 0) return [];
    
//     const SAFE_DAYS_OF_SUPPLY = 45;
    
//     // 1. Calculate historical sales mix by category
//     const totalHistoricalSales = allSalesData.reduce((sum, item) => sum + (parseInt(item['Units Sold'], 10) || 0), 0);
//     const categorySalesMix = allSalesData.reduce((acc, item) => {
//         const category = item.Category;
//         if (!acc[category]) acc[category] = 0;
//         acc[category] += parseInt(item['Units Sold'], 10) || 0;
//         return acc;
//     }, {});
//     Object.keys(categorySalesMix).forEach(cat => {
//         categorySalesMix[cat] = categorySalesMix[cat] / totalHistoricalSales;
//     });

//     // 2. Calculate total forecasted demand for the next 30 days
//     const next30DaysForecast = forecastData.slice(0, 30);
//     const totalForecastedDemand = next30DaysForecast.reduce((sum, item) => sum + (item.Demand_Forecast || 0), 0);
    
//     // 3. Get current inventory levels by category
//     const latestInventory = allSalesData.reduce((acc, item) => {
//         acc[item['Product ID']] = item;
//         return acc;
//     }, {});
//     const inventoryByCategory = Object.values(latestInventory).reduce((acc, item) => {
//         const category = item.Category;
//         if (!acc[category]) acc[category] = 0;
//         acc[category] += parseInt(item['Inventory Level'], 10) || 0;
//         return acc;
//     }, {});

//     // 4. Combine everything to calculate risk and suggestions
//     return Object.keys(inventoryByCategory).map(category => {
//         const currentInventory = inventoryByCategory[category];
//         const forecastedDemand = totalForecastedDemand * (categorySalesMix[category] || 0);
//         const forecastedDailyDemand = forecastedDemand / 30;
        
//         const daysOfSupply = forecastedDailyDemand > 0 ? currentInventory / forecastedDailyDemand : Infinity;
        
//         let riskLevel = 'Low';
//         if (daysOfSupply < 15) riskLevel = 'High';
//         else if (daysOfSupply < 30) riskLevel = 'Medium';
        
//         const suggestedRestock = Math.max(0, Math.round((SAFE_DAYS_OF_SUPPLY * forecastedDailyDemand) - currentInventory));
        
//         return { category, currentInventory, forecastedDemand: Math.round(forecastedDemand), riskLevel, suggestedRestock };
//     });

//   }, [allSalesData, forecastData]);

// // --- Inventory Specific Calculations ---
//   const inventoryMetrics = useMemo(() => {
//       const latestInventory = allSalesData.reduce((acc, item) => {
//         acc[item['Product ID']] = item;
//         return acc;
//       }, {});
//       const inventoryTotals = Object.values(latestInventory).reduce((acc, item) => {
//           acc.units += parseInt(item['Inventory Level'], 10) || 0;
//           acc.value += (parseInt(item['Inventory Level'], 10) || 0) * (parseFloat(item.Price) || 0);
//           return acc;
//       }, { units: 0, value: 0 });

//       // Calculate totals needed for the new metrics from the filtered salesData
//       const salesTotals = salesData.reduce((acc, item) => {
//           const units = parseInt(item['Units Sold'], 10) || 0;
//           const daysOfSupply = parseFloat(item.Days_of_Supply) || 0;
//           const inventoryLevel = parseInt(item['Inventory Level'], 10) || 0;

//           acc.units += units;
//           if (units > 0) acc.weightedDaysOfSupplySum += daysOfSupply * units;
//           acc.inventorySum += inventoryLevel; // Sum of inventory levels over the period

//           return acc;
//       }, { units: 0, weightedDaysOfSupplySum: 0, inventorySum: 0 });

//       // Calculate the average inventory level for the filtered period
//       const avgInventoryLevel = salesData.length > 0 ? salesTotals.inventorySum / salesData.length : 0;

//       return {
//           totalUnits: inventoryTotals.units,
//           totalValue: inventoryTotals.value,
//           avgDaysOfSupply: salesTotals.units > 0 ? salesTotals.weightedDaysOfSupplySum / salesTotals.units : 0,
//           stockToSalesRatio: salesTotals.units > 0 ? inventoryTotals.units / salesTotals.units : 0,
//           // ✅ NEW: Average Inventory Level
//           avgInventoryLevel: avgInventoryLevel,
//           // ✅ NEW: Inventory Turnover Rate
//           inventoryTurnover: avgInventoryLevel > 0 ? salesTotals.units / avgInventoryLevel : 0,
//       };
//   }, [allSalesData, salesData]);

//   // --- Chart Data Aggregations ---
//   const trendData = useMemo(() => {
//     const dailyData = salesData.reduce((acc, item) => {
//       const date = item.Date;
//       if (!acc[date]) acc[date] = { date, Revenue: 0, Profit: 0 };
//       const revenue = parseFloat(item.Revenue) || 0;
//       const profitMargin = parseFloat(item.Profit_Margin) || 0;
//       acc[date].Revenue += revenue;
//       acc[date].Profit += revenue * (profitMargin / 100);
//       return acc;
//     }, {});
//     return Object.values(dailyData).sort((a,b) => new Date(a.date) - new Date(b.date));
//   }, [salesData]);

//   const compositionData = useMemo(() => {
//      const categoryData = salesData.reduce((acc, item) => {
//         const category = item.Category || 'Unknown';
//         if(!acc[category]) acc[category] = { name: category, value: 0 };
//         acc[category].value += parseInt(item['Units Sold'], 10) || 0;
//         return acc;
//     }, {});
//     return Object.values(categoryData);
//   }, [salesData]);

//   const regionalData = useMemo(() => {
//      const regionData = salesData.reduce((acc, item) => {
//         const region = item.Region || 'Unknown';
//         if(!acc[region]) acc[region] = { name: region, Revenue: 0 };
//         acc[region].Revenue += parseFloat(item.Revenue) || 0;
//         return acc;
//     }, {});
//     return Object.values(regionData);
//   }, [salesData]);
  
//   const demandData = useMemo(() => {
//     const dailyData = salesData.reduce((acc, item) => {
//         const date = item.Date;
//         if (!acc[date]) acc[date] = { date, Demand: 0, 'Units Sold': 0 };
//         acc[date].Demand += parseInt(item.Demand, 10) || 0;
//         acc[date]['Units Sold'] += parseInt(item['Units Sold'], 10) || 0;
//         return acc;
//     }, {});
//     return Object.values(dailyData).sort((a,b) => new Date(a.date) - new Date(b.date));
//   }, [salesData]);
  
//   const inventoryTrendData = useMemo(() => {
//       const dailyData = salesData.reduce((acc, item) => {
//           const date = item.Date;
//           if (!acc[date]) acc[date] = { date, 'Inventory Level': 0, count: 0 };
//           acc[date]['Inventory Level'] += parseInt(item['Inventory Level'], 10) || 0;
//           acc[date].count++;
//           return acc;
//       }, {});
//       return Object.values(dailyData).map(d => ({...d, 'Inventory Level': d['Inventory Level'] / d.count})).sort((a,b) => new Date(a.date) - new Date(b.date));
//   }, [salesData]);

//   const inventoryCompositionData = useMemo(() => {
//       const latestInventory = allSalesData.reduce((acc, item) => {
//         acc[item['Product ID']] = item;
//         return acc;
//       }, {});
//       const categoryData = Object.values(latestInventory).reduce((acc, item) => {
//           const category = item.Category || 'Unknown';
//           if (!acc[category]) acc[category] = { name: category, value: 0 };
//           acc[category].value += parseInt(item['Inventory Level'], 10) || 0;
//           return acc;
//       }, {});
//       return Object.values(categoryData);
//   }, [allSalesData]);

//   const daysOfSupplyByCategoryData = useMemo(() => {
//       const categoryData = salesData.reduce((acc, item) => {
//           const category = item.Category || 'Unknown';
//           const daysOfSupply = parseFloat(item.Days_of_Supply) || 0;
//           const units = parseInt(item['Units Sold'], 10) || 0;
//           if (!acc[category]) acc[category] = { name: category, weightedSum: 0, totalUnits: 0 };
//           if (units > 0) {
//             acc[category].weightedSum += daysOfSupply * units;
//             acc[category].totalUnits += units;
//           }
//           return acc;
//       }, {});
//       return Object.values(categoryData).map(cat => ({ name: cat.name, 'Days of Supply': cat.totalUnits > 0 ? cat.weightedSum / cat.totalUnits : 0 }));
//   }, [salesData]);

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

//   // --- Render Logic ---
//   return (
//     <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-sans">
//       <header className="mb-8"><h1 className="text-4xl font-bold text-white text-center">Comprehensive Sales & Inventory Dashboard</h1></header>
      
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <div className="lg:col-span-1 flex flex-col gap-6" style={{marginBottom:"80%"}}>
     
//           <FilterCard categories={categories} regions={regions} filterInputs={filterInputs} onCategoryChange={handleCategoryChange} onRegionChange={handleRegionChange} onDateChange={handleFilterInputChange} onSubmit={handleApplyFilters} loading={loading} />
       
//           <GroupedSummaryTable title="Dashboard KPIs" groups={{
//               "Financial Performance": [
//                   { metric: 'Total Net Revenue', value: `$${(keyMetrics.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
//                   { metric: 'Total Profit', value: `$${(keyMetrics.totalProfit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
//                   { metric: 'Overall Profit Margin', value: `${(keyMetrics.overallProfitMargin || 0).toFixed(2)}%` },
//               ],
//               "Sales Performance": [
//                   { metric: 'Total Units Sold', value: (keyMetrics.totalUnitsSold || 0).toLocaleString('en-US') },
//                   { metric: 'Avg. Units per Transaction', value: (keyMetrics.avgUnitsPerTransaction || 0).toFixed(2) },
//                   { metric: 'Promotion Effectiveness', value: `${((keyMetrics.promoEffectiveness || 0) * 100).toFixed(1)}% of Sales` },
//               ],
//               "Demand & Fulfillment": [
//                   { metric: 'Demand Fulfillment Rate', value: `${((keyMetrics.fulfillmentRate || 0) * 100).toFixed(1)}%` },
                
//               ],
                            
//           }} />
        
//         </div>
//         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
//             <ChartContainer title="Financial Trend (Revenue & Profit)"><ResponsiveContainer width="100%" height={300}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis yAxisId="left" stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} /><Legend /><Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8884d8" dot={false} /><Line yAxisId="right" type="monotone" dataKey="Profit" stroke="#82ca9d" dot={false} /></LineChart></ResponsiveContainer></ChartContainer>
//             <ChartContainer title="Sales Composition by Category"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label>{compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()} /><Legend /></PieChart></ResponsiveContainer></ChartContainer>
//             <ChartContainer title="Regional Performance (Revenue)"><ResponsiveContainer width="100%" height={300}><BarChart data={regionalData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="name" stroke="#a0aec0" /><YAxis stroke="#a0aec0" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => `$${value.toLocaleString()}`} /><Legend /><Bar dataKey="Revenue" fill="#8884d8" /></BarChart></ResponsiveContainer></ChartContainer>
//             <ChartContainer title="Demand vs. Fulfillment"><ResponsiveContainer width="100%" height={300}><AreaChart data={demandData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis stroke="#a0aec0" /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()} /><Legend /><Area type="monotone" dataKey="Units Sold" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} /><Area type="monotone" dataKey="Demand" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} /></AreaChart></ResponsiveContainer></ChartContainer>
//             <div className="md:col-span-2" style={{marginLeft:"-34%"}}><ChartContainer title="Price Elasticity (Price vs. Units Sold)"><ResponsiveContainer width="100%" height={300}><ScatterChart><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis type="number" dataKey="Price" name="Price" unit="$" stroke="#a0aec0" /><YAxis type="number" dataKey={'Units Sold'} name="Units Sold" stroke="#a0aec0" /><Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} /><Scatter name="Sales" data={salesData} fill="#8884d8" /></ScatterChart></ResponsiveContainer></ChartContainer></div>
//         </div>
//       </div>

//            {/* --- ✅ 3. NEW: Product Performance Section --- */}
//       <div className="mt-8 pt-8 border-t-2 border-gray-700">
//         <h2 className="text-3xl font-bold text-white mb-6 text-center">Product Performance Insights</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <TableCard 
//                 title="High-Performance Products (Top 5)"
//                 headers={["Product ID", "Revenue", "Profit", "Units Sold"]}
//                 data={productPerformance.topPerformers.map(p => [p.id, `$${p.revenue.toLocaleString()}`, `$${p.profit.toLocaleString()}`, p.units.toLocaleString()])}
//             />
//             <TableCard 
//                 title="Products to Watch (Bottom 5 by Sales)"
//                 headers={["Product ID", "Units Sold", "Demand Gap"]}
//                 data={productPerformance.productsToWatch.map(p => [p.id, p.units.toLocaleString(), p.demandGap.toLocaleString()])}
//             />
//         </div>
//       </div>

//       <div className="mt-8 pt-8 border-t-2 border-gray-700">
//         <h2 className="text-3xl font-bold text-white mb-6 text-center">Inventory Risk & Restocking Suggestions</h2>
//         <div className="grid grid-cols-1">
//              <TableCard 
//                 title="Inventory Status by Category"
//                 headers={["Category", "Current Stock", "Forecasted Demand (30d)", "Risk Level", "Suggested Restock (Units)"]}
//                 data={inventoryRiskAnalysis.map(item => [
//                     item.category, 
//                     item.currentInventory.toLocaleString(),
//                     item.forecastedDemand.toLocaleString(),
//                     item.riskLevel,
//                     item.suggestedRestock.toLocaleString()
//                 ])}
//                 conditionalCellStyle={(row, colIndex) => {
//                     if (colIndex === 3) { // Risk Level column
//                         if (row[colIndex] === 'High') return 'text-red-400 font-bold';
//                         if (row[colIndex] === 'Medium') return 'text-yellow-400 font-bold';
//                         return 'text-green-400 font-bold';
//                     }
//                     return '';
//                 }}
//             />
//         </div>
//       </div>
      
//       <div className="mt-8 pt-8 border-t-2 border-gray-700">
//         <h2 className="text-3xl font-bold text-white mb-6 text-center">Inventory Analysis</h2>
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// <div className="lg:col-span-1">
//                 <GroupedSummaryTable title="Inventory KPIs" groups={{
//                     "Current Stock": [
//                         { metric: 'Total Inventory (Units)', value: (inventoryMetrics.totalUnits || 0).toLocaleString('en-US') },
//                         { metric: 'Est. Inventory Value', value: `$${(inventoryMetrics.totalValue || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}` },
//                     ],
//                     "Performance (Filtered)": [
//                          { metric: 'Avg. Days of Supply', value: (inventoryMetrics.avgDaysOfSupply || 0).toFixed(1) },
//                          { metric: 'Stock-to-Sales Ratio', value: (inventoryMetrics.stockToSalesRatio || 0).toFixed(2) },
//                          { /* ✅ NEW */ metric: 'Avg. Inventory Level', value: (inventoryMetrics.avgInventoryLevel || 0).toLocaleString('en-US', {maximumFractionDigits: 0}) },
//                          { /* ✅ NEW */ metric: 'Inventory Turnover', value: (inventoryMetrics.inventoryTurnover || 0).toFixed(2) },
//                          { /* ✅ NEW */ metric: 'Inventory Turnover Rate', value: (inventoryMetrics.inventoryTurnover/inventoryMetrics.avgInventoryLevel || 0).toFixed(2) },
//                     ]
//                 }} />
//             </div>
//             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <ChartContainer title="Inventory Level Trend (Daily Avg)"><ResponsiveContainer width="100%" height={300}><LineChart data={inventoryTrendData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis stroke="#a0aec0" /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => Math.round(value).toLocaleString()}/><Legend/><Line type="monotone" dataKey="Inventory Level" stroke="#ff7300" dot={false}/></LineChart></ResponsiveContainer></ChartContainer>
//                 <ChartContainer title="Current Inventory Composition"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={inventoryCompositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ff7300" label>{inventoryCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()}/><Legend/></PieChart></ResponsiveContainer></ChartContainer>
//                 {/* <div className="md:col-span-2" style={{marginLeft:"-34%"}}><ChartContainer title="Average Days of Supply by Category"><ResponsiveContainer width="100%" height={300}><BarChart data={daysOfSupplyByCategoryData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/><XAxis dataKey="name" stroke="#a0aec0" /><YAxis stroke="#a0aec0" /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}/><Legend/><Bar dataKey="Days of Supply" fill="#ff7300"/></BarChart></ResponsiveContainer></ChartContainer></div> */}
//             </div>
//         </div>
//       </div>
//       <div className="mt-8 pt-8 border-t-2 border-gray-700">
//         <h2 className="text-3xl font-bold text-white mb-6 text-center">Future Forecast</h2>
//         <div className="grid grid-cols-1">
//           <ForecastChart />
//         </div>
//       </div>
//       <Chatbot historicalData={salesData} /> 
//     </div>
//   );
// }

// // --- Reusable Components ---
// const FilterCard = ({ categories, regions, filterInputs, onCategoryChange, onRegionChange, onDateChange, onSubmit, loading }) => (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-md">
//         <h3 className="text-xl font-semibold mb-4 text-cyan-400">Filters</h3>
//         <form onSubmit={onSubmit} className="flex flex-col gap-4">
//             <div>
//                 <label className="font-semibold text-sm text-gray-300">Date Range</label>
//                 <div className="flex items-center gap-2 mt-1">
//                     {/* ✅ FIX: Added dark mode specific classes for date inputs */}
//                     <input type="date" name="start" value={filterInputs.dateRange.start} onChange={onDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md w-full text-sm [color-scheme:dark]"/>
//                     <span className="text-gray-500">to</span>
//                     <input type="date" name="end" value={filterInputs.dateRange.end} onChange={onDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md w-full text-sm [color-scheme:dark]"/>
//                 </div>
//             </div>
//             <div>
//                 <label className="font-semibold text-sm text-gray-300">Categories</label>
//                 <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 max-h-20 overflow-y-auto">
//                   {categories.map(category => (<div key={category} className="flex items-center"><input type="checkbox" id={`cat-${category}`} value={category} checked={filterInputs.selectedCategories.includes(category)} onChange={() => onCategoryChange(category)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600" /><label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-300">{category}</label></div>))}
//                 </div>
//             </div>
//             <div>
//                 <label className="font-semibold text-sm text-gray-300">Regions</label>
//                 <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
//                   {regions.map(region => (<div key={region} className="flex items-center"><input type="checkbox" id={`reg-${region}`} value={region} checked={filterInputs.selectedRegions.includes(region)} onChange={() => onRegionChange(region)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600" /><label htmlFor={`reg-${region}`} className="ml-2 text-sm text-gray-300">{region}</label></div>))}
//                 </div>
//             </div>
//             <button type="submit" disabled={loading} className="mt-2 w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 disabled:bg-gray-500">
//               {loading ? 'Loading...' : 'Apply Filters'}
//             </button>
//         </form>
//     </div>
// );

// const GroupedSummaryTable = ({ title, groups }) => (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-md">
//         <h3 className="text-xl font-semibold mb-4 text-cyan-400">{title}</h3>
//         <div className="space-y-3">
//             {Object.entries(groups).map(([groupName, data]) => (
//                 <div key={groupName}>
//                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{groupName}</h4>
//                     <table className="min-w-full mt-1">
//                         <tbody>
//                             {data.map((item, index) => (<tr key={index} className="border-b border-gray-700 last:border-b-0"><td className="py-1.5 pr-2 font-medium text-gray-300 text-sm">{item.metric}</td><td className="py-1.5 pl-2 text-right font-semibold text-white text-sm">{item.value}</td></tr>))}
//                         </tbody>
//                     </table>
//                 </div>
//             ))}
//         </div>
//     </div>
// );

// const ChartContainer = ({ title, children }) => (<div className="bg-gray-800 p-4 rounded-lg shadow-md"><h2 className="text-lg font-bold text-cyan-400 mb-4">{title}</h2>{children}</div>);
// // A more versatile TableCard to handle conditional styling for the risk alerts
// const TableCard = ({ title, headers, data, emptyMessage, conditionalCellStyle }) => (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-md">
//         <h3 className="text-xl font-semibold mb-4 text-cyan-400">{title}</h3>
//         <div className="overflow-auto max-h-72">
//             <table className="min-w-full">
//                 <thead className="bg-gray-700 sticky top-0">
//                     <tr>{headers.map(h => <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>)}</tr>
//                 </thead>
//                 <tbody className="bg-gray-800">
//                     {data.length > 0 ? (
//                         data.map((row, i) => <tr key={i} className="border-b border-gray-700 last:border-b-0">{row.map((cell, j) => <td key={j} className={`py-2 px-3 text-sm text-gray-200 ${conditionalCellStyle ? conditionalCellStyle(row, j) : ''}`}>{cell}</td>)}</tr>)
//                     ) : (
//                         <tr><td colSpan={headers.length} className="text-center py-4 text-gray-500">{emptyMessage || "No data available."}</td></tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     </div>
// );
// export default App;





















import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import ForecastChart from './ForecastChart';
import Chatbot from './Chatbot';
import LoginPage from './LoginPage';
import Papa from 'papaparse';
import TopBar from './TopBar';
import ManageDataPage from './ManageData'; 

// --- Helper Components ---

const InfoIcon = ({ text }) => (
    <div className="relative inline-block ml-2 group cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-600 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {text}
        </div>
    </div>
);

const kpiDescriptions = {
    totalRevenue: "Total revenue generated from all sales within the selected period, after discounts.",
    totalProfit: "Total profit calculated from revenue and profit margin for all sales in the selected period.",
    overallProfitMargin: "The average profit margin across all sales, calculated as (Total Profit / Total Revenue) * 100.",
    totalUnitsSold: "The total number of individual units sold in the selected period.",
    avgUnitsPerTransaction: "The average number of units sold per single transaction.",
    promoEffectiveness: "The percentage of total units sold that were part of a promotion.",
    fulfillmentRate: "The percentage of customer demand that was successfully met with sales (Units Sold / Demand).",
    financialTrend: "Shows the daily trend of total revenue and profit over the selected period.",
    salesComposition: "A breakdown of total units sold by product category.",
    regionalPerformance: "Compares the total revenue generated across different sales regions.",
    demandVsFulfillment: "Visualizes the daily total customer demand versus the actual units sold.",
    priceElasticity: "Each dot represents a sale, showing the relationship between the price of an item and the number of units sold.",
    currentInventoryUnits: "The total number of units currently in stock across all products, based on the latest data available in the entire dataset. This metric is independent of date filters.",
    currentInventoryValue: "The estimated total monetary value of all units currently in stock, based on the latest data. This metric is independent of date filters.",
    avgDaysOfSupply: "For the filtered period, this is the average number of days an item is expected to remain in stock based on sales velocity.",
    stockToSalesRatio: "Compares the amount of current inventory to the number of units sold in the filtered period. A high ratio may indicate overstocking.",
    avgInventoryLevel: "The average number of units in inventory on any given day within the filtered period.",
    inventoryTurnover: "Measures how many times the average inventory is sold during the period. A higher number indicates efficient inventory management.",
    inventoryTrend: "Shows the trend of the average daily inventory level over the selected period.",
    inventoryComposition: "A breakdown of the current total inventory by product category. This chart is independent of date filters.",
};


// --- Main Dashboard Component ---
function Dashboard(onLogout) {
    const [salesData, setSalesData] = useState([]);
    const [allSalesData, setAllSalesData] = useState([]); // This will hold only the latest full data for inventory
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterInputs, setFilterInputs] = useState({ dateRange: { start: '', end: '' }, selectedCategories: [], selectedRegions: [] });
    const [appliedFilters, setAppliedFilters] = useState(null); // This state triggers the data fetch
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);

    useEffect(() => {
        // Helper function to efficiently fetch all unique values for a specific column
        async function fetchDistinct(column) {
            let distinctValues = new Set();
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from('new_sales_data')
                    .select(column)
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) {
                    console.error(`Error fetching distinct ${column}:`, error);
                    return Array.from(distinctValues); // Return what we have so far
                }
                if (data && data.length > 0) {
                    data.forEach(item => {
                        if (item && item[column]) {
                            distinctValues.add(item[column]);
                        }
                    });
                    page++;
                } else {
                    hasMore = false;
                }
            }
            return Array.from(distinctValues);
        }

        async function getInitialData() {
            setLoading(true);

            // Step 1: Fetch all unique categories and regions for filters
            const [uniqueCategories, uniqueRegions] = await Promise.all([
                fetchDistinct('Category'),
                fetchDistinct('Region')
            ]);
            
            setCategories(uniqueCategories.sort());
            setRegions(uniqueRegions.sort());

            // Step 2: Fetch the latest data for stable "Current Inventory" metrics
            const { data: latestDateData, error: latestDateError } = await supabase.from('new_sales_data').select('Date').order('Date', { ascending: false }).limit(1);
            if (latestDateError || !latestDateData.length) {
                setError('Could not determine the latest date for inventory.');
                setLoading(false);
                return;
            }
            const latestDate = latestDateData[0].Date;

            // FIX: Implement pagination to fetch ALL records for the latest date
            let latestInventoryData = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;
            while(hasMore) {
                const { data, error } = await supabase
                    .from('new_sales_data')
                    .select('*')
                    .eq('Date', latestDate)
                    .range(page * pageSize, (page + 1) * pageSize - 1);
                
                if (error) {
                    setError('Could not fetch latest inventory data.');
                    hasMore = false;
                } else if (data && data.length > 0) {
                    latestInventoryData = latestInventoryData.concat(data);
                    page++;
                } else {
                    hasMore = false;
                }
            }
            
            setAllSalesData(latestInventoryData);

            // Step 3: Set initial date range to the last week of August 2025
            const initialStartDate = '2025-08-25';
            const initialEndDate = '2025-08-31';
            
            setFilterInputs({
                dateRange: { start: initialStartDate, end: initialEndDate },
                selectedCategories: uniqueCategories,
                selectedRegions: uniqueRegions,
            });
            
            setAppliedFilters({
                dateRange: { start: initialStartDate, end: initialEndDate },
                selectedCategories: uniqueCategories,
                selectedRegions: uniqueRegions,
            });

            // Step 4: Fetch forecast data
            const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
            Papa.parse(FORECAST_CSV_URL, {
                download: true, header: true, dynamicTyping: true,
                complete: (result) => setForecastData(result.data),
                error: (err) => console.error("Error loading forecast CSV:", err)
            });
        }
        getInitialData();
    }, []);

    const fetchDataForFilters = useCallback(async () => {
        if (!appliedFilters) return;
        setLoading(true);

        let allFilteredData = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            let query = supabase.from('new_sales_data').select('*');
            if (appliedFilters.dateRange.start) query = query.gte('Date', appliedFilters.dateRange.start);
            if (appliedFilters.dateRange.end) query = query.lte('Date', appliedFilters.dateRange.end);
            if (appliedFilters.selectedCategories.length > 0) query = query.in('Category', appliedFilters.selectedCategories);
            if (appliedFilters.selectedRegions.length > 0) query = query.in('Region', appliedFilters.selectedRegions);
            
            const { data, error } = await query
                .order('Date', { ascending: true })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error('Error fetching filtered data:', error);
                setError('Failed to apply filters.');
                setSalesData([]);
                hasMore = false; // Stop the loop on error
            } else if (data && data.length > 0) {
                allFilteredData = allFilteredData.concat(data);
                page++;
            } else {
                hasMore = false; // No more data to fetch
            }
        }
        
        setSalesData(allFilteredData);
        setLoading(false);
    }, [appliedFilters]);


    useEffect(() => {
        fetchDataForFilters();
    }, [fetchDataForFilters]);

    const handleFilterInputChange = (e) => setFilterInputs(prev => ({...prev, dateRange: { ...prev.dateRange, [e.target.name]: e.target.value }}));
    const handleCategoryChange = (category) => setFilterInputs(prev => ({ ...prev, selectedCategories: prev.selectedCategories.includes(category) ? prev.selectedCategories.filter(c => c !== category) : [...prev.selectedCategories, category] }));
    const handleRegionChange = (region) => setFilterInputs(prev => ({ ...prev, selectedRegions: prev.selectedRegions.includes(region) ? prev.selectedRegions.filter(r => r !== region) : [...prev.selectedRegions, region] }));
    
    const handleApplyFilters = (e) => {
        e.preventDefault();
        setAppliedFilters(filterInputs);
    };

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

        return {
            totalRevenue: totals.revenue,
            totalProfit: totals.profit,
            overallProfitMargin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
            totalUnitsSold: totals.units,
            avgUnitsPerTransaction: salesData.length > 0 ? totals.units / salesData.length : 0,
            fulfillmentRate: totals.demand > 0 ? (totals.units / totals.demand) * 100 : 0,
            promoEffectiveness: totals.units > 0 ? (totals.promoUnits / totals.units) * 100 : 0,
        };
    }, [salesData]);

const { productPerformance, inventoryRiskAnalysis, inventoryMetrics } = useMemo(() => {
        if (allSalesData.length === 0) {
            return { productPerformance: { topPerformers: [], productsToWatch: [] }, inventoryRiskAnalysis: [], inventoryMetrics: {} };
        }

        // --- Product Performance (based on filtered salesData) ---
        const productAggregates = salesData.reduce((acc, item) => {
            const productId = item['Product ID'];
            if (!acc[productId]) acc[productId] = { id: productId, revenue: 0, profit: 0, units: 0, demand: 0 };
            const revenue = parseFloat(item.Revenue) || 0;
            const profitMargin = parseFloat(item.Profit_Margin) || 0;
            acc[productId].revenue += revenue;
            acc[productId].profit += revenue * (profitMargin / 100);
            acc[productId].units += parseInt(item['Units Sold'], 10) || 0;
            acc[productId].demand += parseInt(item.Demand, 10) || 0;
            return acc;
        }, {});
        const allProducts = Object.values(productAggregates);
        const topPerformers = [...allProducts].sort((a, b) => (b.revenue + b.profit) - (a.revenue + a.profit)).slice(0, 5);
        const productsToWatch = [...allProducts].map(p => ({...p, demandGap: p.demand - p.units })).sort((a, b) => a.units - b.units).slice(0, 5);
        const productPerformanceData = { topPerformers, productsToWatch };
        
        // --- Inventory Metrics ---
        // FIX: The logic now directly sums all records from the latest day's data (`allSalesData`),
        // which correctly accounts for the same product in multiple stores.
        const currentInventoryTotals = allSalesData.reduce((acc, item) => {
            const level = parseInt(item['Inventory Level'], 10) || 0;
            acc.units += level;
            acc.value += level * (parseFloat(item.Price) || 0);
            return acc;
        }, { units: 0, value: 0 });

        const salesTotals = salesData.reduce((acc, item) => {
            const units = parseInt(item['Units Sold'], 10) || 0;
            const daysOfSupply = parseFloat(item.Days_of_Supply) || 0;
            const inventoryLevel = parseInt(item['Inventory Level'], 10) || 0;
            acc.units += units;
            if (units > 0) acc.weightedDaysOfSupplySum += daysOfSupply * units;
            acc.inventorySum += inventoryLevel;
            return acc;
        }, { units: 0, weightedDaysOfSupplySum: 0, inventorySum: 0 });

        const avgInventoryLevel = salesData.length > 0 ? salesTotals.inventorySum / salesData.length : 0;
        const inventoryMetricsData = {
            totalUnits: currentInventoryTotals.units,
            totalValue: currentInventoryTotals.value,
            avgDaysOfSupply: salesTotals.units > 0 ? salesTotals.weightedDaysOfSupplySum / salesTotals.units : 0,
            stockToSalesRatio: salesTotals.units > 0 ? currentInventoryTotals.units / salesTotals.units : 0,
            avgInventoryLevel: avgInventoryLevel,
            inventoryTurnover: avgInventoryLevel > 0 ? salesTotals.units / avgInventoryLevel : 0,
        };

        let inventoryRiskData = [];
    if (forecastData.length > 0 && allSalesData.length > 0) {
        const SAFE_DAYS_OF_SUPPLY = 45;

        // 1. Get current inventory levels for each category from the latest day's data.
        const inventoryByCategory = allSalesData.reduce((acc, item) => {
            const category = item.Category;
            if (!acc[category]) acc[category] = 0;
            acc[category] += parseInt(item['Inventory Level'], 10) || 0;
            return acc;
        }, {});

        // 2. Pre-calculate the total 30-day forecast for each category.
        const categoryForecastTotals = forecastData.reduce((acc, row) => {
            const category = row.Category;
            if (!acc[category]) {
                acc[category] = { totalDemand: 0, count: 0 };
            }
            // Only consider the first 30 days of forecast for each category
            if (acc[category].count < 30) {
                acc[category].totalDemand += row.Units_Sold_Forecast || 0;
                acc[category].count++;
            }
            return acc;
        }, {});

        // 3. Calculate risk for each category using its specific forecast.
        inventoryRiskData = Object.keys(inventoryByCategory).map(category => {
            const currentInventory = inventoryByCategory[category];
            
            // Get the specific forecast total for this category
            const forecastedDemand = categoryForecastTotals[category]?.totalDemand || 0;
            
            const forecastedDailyDemand = forecastedDemand / 30;
            
            const daysOfSupply = forecastedDailyDemand > 0 ? currentInventory / forecastedDailyDemand : Infinity;
            
            let riskLevel = 'Low';
            if (daysOfSupply < 15) riskLevel = 'High';
            else if (daysOfSupply < 30) riskLevel = 'Medium';
            
            const suggestedRestock = Math.max(0, Math.round((SAFE_DAYS_OF_SUPPLY * forecastedDailyDemand) - currentInventory));
            
            return { 
                category, 
                currentInventory, 
                forecastedDemand: Math.round(forecastedDemand), 
                riskLevel, 
                suggestedRestock 
            };
        });
    }
    
    return { productPerformance: productPerformanceData, inventoryRiskAnalysis: inventoryRiskData, inventoryMetrics: inventoryMetricsData };
}, [allSalesData, salesData, forecastData]);

const { trendData, compositionData, regionalData, demandData, inventoryTrendData, inventoryCompositionData } = useMemo(() => {
        const trendData = Object.values(salesData.reduce((acc, item) => {
            const date = item.Date;
            if (!acc[date]) acc[date] = { date, Revenue: 0, Profit: 0 };
            const revenue = parseFloat(item.Revenue) || 0;
            acc[date].Revenue += revenue;
            acc[date].Profit += revenue * ((parseFloat(item.Profit_Margin) || 0) / 100);
            return acc;
        }, {})).sort((a,b) => new Date(a.date) - new Date(b.date));

        const compositionData = Object.values(salesData.reduce((acc, item) => {
            const category = item.Category || 'Unknown';
            if(!acc[category]) acc[category] = { name: category, value: 0 };
            acc[category].value += parseInt(item['Units Sold'], 10) || 0;
            return acc;
        }, {}));

        const regionalData = Object.values(salesData.reduce((acc, item) => {
            const region = item.Region || 'Unknown';
            if(!acc[region]) acc[region] = { name: region, Revenue: 0 };
            acc[region].Revenue += parseFloat(item.Revenue) || 0;
            return acc;
        }, {}));

        const demandData = Object.values(salesData.reduce((acc, item) => {
            const date = item.Date;
            if (!acc[date]) acc[date] = { date, Demand: 0, 'Units Sold': 0 };
            acc[date].Demand += parseInt(item.Demand, 10) || 0;
            acc[date]['Units Sold'] += parseInt(item['Units Sold'], 10) || 0;
            return acc;
        }, {})).sort((a,b) => new Date(a.date) - new Date(b.date));

        const inventoryTrendDaily = salesData.reduce((acc, item) => {
            const date = item.Date;
            if (!acc[date]) { acc[date] = { date, 'Inventory Level': 0, count: 0 }; }
            acc[date]['Inventory Level'] += parseInt(item['Inventory Level'], 10) || 0;
            acc[date].count++;
            return acc;
        }, {});
        const inventoryTrendData = Object.values(inventoryTrendDaily).map(d => ({...d, 'Inventory Level': d['Inventory Level'] / d.count})).sort((a,b) => new Date(a.date) - new Date(b.date));

        // FIX: This calculation now correctly sums all inventory records for the latest day,
        // matching the logic used by the 'Inventory Status' table.
        const inventoryCompositionData = Object.values(allSalesData.reduce((acc, item) => {
            const category = item.Category || 'Unknown';
            if (!acc[category]) {
                acc[category] = { name: category, value: 0 };
            }
            acc[category].value += parseInt(item['Inventory Level'], 10) || 0;
            return acc;
        }, {}));

        return { trendData, compositionData, regionalData, demandData, inventoryTrendData, inventoryCompositionData };
    }, [salesData, allSalesData]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    
    if (loading && salesData.length === 0) return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><div className="text-xl">Loading Dashboard Data...</div></div>
    if (error) return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><div className="text-xl text-red-400">{error}</div></div>

    return (
        <div >
          <TopBar onLogout={onLogout} />
          {/* <div className="pt-20 p-4 md:p-8" >  */}
          <div>
            <header className="mb-8"><h2 className="text-3xl font-bold text-white text-left">Comprehensive Sales & Inventory Dashboard</h2></header>
            <main className="space-y-8">
                <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <FilterCard categories={categories} regions={regions} filterInputs={filterInputs} onCategoryChange={handleCategoryChange} onRegionChange={handleRegionChange} onDateChange={handleFilterInputChange} onSubmit={handleApplyFilters} loading={loading} />
                        <GroupedSummaryTable title="Dashboard KPIs" groups={{
                            "Financial Performance": [
                                { metric: 'Total Net Revenue', value: `$${(keyMetrics.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, desc: kpiDescriptions.totalRevenue },
                                { metric: 'Total Profit', value: `$${(keyMetrics.totalProfit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, desc: kpiDescriptions.totalProfit },
                                { metric: 'Overall Profit Margin', value: `${(keyMetrics.overallProfitMargin || 0).toFixed(2)}%`, desc: kpiDescriptions.overallProfitMargin },
                            ],
                            "Sales Performance": [
                                { metric: 'Total Units Sold', value: (keyMetrics.totalUnitsSold || 0).toLocaleString('en-US'), desc: kpiDescriptions.totalUnitsSold },
                                { metric: 'Avg. Units per Transaction', value: (keyMetrics.avgUnitsPerTransaction || 0).toFixed(2), desc: kpiDescriptions.avgUnitsPerTransaction },
                                { metric: 'Promotion Effectiveness', value: `${(keyMetrics.promoEffectiveness || 0).toFixed(1)}%`, desc: kpiDescriptions.promoEffectiveness },
                            ],
                            "Demand & Fulfillment": [
                                { metric: 'Demand Fulfillment Rate', value: `${(keyMetrics.fulfillmentRate || 0).toFixed(1)}%`, desc: kpiDescriptions.fulfillmentRate },
                            ],
                        }} />
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer title="Financial Trend (Revenue & Profit)" desc={kpiDescriptions.financialTrend}><ResponsiveContainer width="100%" height={300}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis yAxisId="left" stroke="#8884d8" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} />  <Tooltip 
                contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} 
                formatter={(value) => `$${parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            /><Legend /><Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8884d8" dot={false} /><Line yAxisId="right" type="monotone" dataKey="Profit" stroke="#82ca9d" dot={false} /></LineChart></ResponsiveContainer></ChartContainer>
                        <ChartContainer title="Sales Composition by Category" desc={kpiDescriptions.salesComposition}><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label>{compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()} /><Legend /></PieChart></ResponsiveContainer></ChartContainer>
                        <ChartContainer title="Regional Performance (Revenue)" desc={kpiDescriptions.regionalPerformance}><ResponsiveContainer width="100%" height={300}><BarChart data={regionalData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="name" stroke="#a0aec0" /><YAxis stroke="#a0aec0" tickFormatter={(val) => `$${(val/1000).toLocaleString()}K`} /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => `$${value.toLocaleString()}`} /><Legend /><Bar dataKey="Revenue" fill="#8884d8" /></BarChart></ResponsiveContainer></ChartContainer>
                        <ChartContainer title="Demand vs. Fulfillment" desc={kpiDescriptions.demandVsFulfillment}><ResponsiveContainer width="100%" height={300}><AreaChart data={demandData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis stroke="#a0aec0" /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()} /><Legend /><Area type="monotone" dataKey="Units Sold" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} /><Area type="monotone" dataKey="Demand" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} /></AreaChart></ResponsiveContainer></ChartContainer>
                        <div className="md:col-span-2" style={{marginLeft:"-34%"}}><ChartContainer title="Price Elasticity (Price vs. Units Sold)" desc={kpiDescriptions.priceElasticity}><ResponsiveContainer width="100%" height={300}><ScatterChart><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis type="number" dataKey="Price" name="Price" unit="$" stroke="#a0aec0" /><YAxis type="number" dataKey={'Units Sold'} name="Units Sold" stroke="#a0aec0" /><Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} /><Scatter name="Sales" data={salesData} fill="#8884d8" /></ScatterChart></ResponsiveContainer></ChartContainer></div>
                    </div>
                </section>
                <section className="pt-8 border-t-2 border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-6 text-left">Product Performance Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TableCard title="High-Performance Products (Top 5)" headers={["Product ID", "Revenue", "Profit", "Units Sold"]} data={productPerformance.topPerformers.map(p => [p.id, `$${p.revenue.toLocaleString()}`, `$${p.profit.toLocaleString()}`, p.units.toLocaleString()])} />
                        <TableCard title="Products to Watch (Bottom 5 by Sales)" headers={["Product ID", "Units Sold", "Demand Gap"]} data={productPerformance.productsToWatch.map(p => [p.id, p.units.toLocaleString(), p.demandGap.toLocaleString()])} />
                    </div>
                </section>
                <section className="pt-8 border-t-2 border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-6 text-left">Inventory Risk & Restocking Suggestions</h2>
                    <TableCard title="Inventory Status by Category" headers={["Category", "Current Stock", "Forecasted Demand (30d)", "Risk Level", "Suggested Restock (Units)"]} data={inventoryRiskAnalysis.map(item => [item.category, item.currentInventory.toLocaleString(), item.forecastedDemand.toLocaleString(), item.riskLevel, item.suggestedRestock.toLocaleString()])} conditionalCellStyle={(row, colIndex) => { if (colIndex === 3) { if (row[colIndex] === 'High') return 'text-red-400 font-bold'; if (row[colIndex] === 'Medium') return 'text-yellow-400 font-bold'; return 'text-green-400 font-bold'; } return ''; }} />
                </section>
                <section className="pt-8 border-t-2 border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-6 text-left">Inventory Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <GroupedSummaryTable title="Inventory KPIs" groups={{
                                "Current Stock": [
                                    { metric: 'Total Inventory (Units)', value: (inventoryMetrics.totalUnits || 0).toLocaleString('en-US'), desc: kpiDescriptions.currentInventoryUnits },
                                    { metric: 'Est. Inventory Value', value: `$${(inventoryMetrics.totalValue || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}`, desc: kpiDescriptions.currentInventoryValue },
                                ],
                                "Performance (Filtered)": [
                                    { metric: 'Avg. Days of Supply', value: (inventoryMetrics.avgDaysOfSupply || 0).toFixed(1), desc: kpiDescriptions.avgDaysOfSupply },
                                    { metric: 'Stock-to-Sales Ratio', value: (inventoryMetrics.stockToSalesRatio || 0).toFixed(2), desc: kpiDescriptions.stockToSalesRatio },
                                    { metric: 'Avg. Inventory Level', value: (inventoryMetrics.avgInventoryLevel || 0).toLocaleString('en-US', {maximumFractionDigits: 0}), desc: kpiDescriptions.avgInventoryLevel },
                                    { metric: 'Inventory Turnover', value: (inventoryMetrics.inventoryTurnover || 0).toFixed(2), desc: kpiDescriptions.inventoryTurnover },
                                    { metric: 'Inventory Turnover Rate', value: (inventoryMetrics.inventoryTurnover/inventoryMetrics.avgInventoryLevel || 0).toFixed(2) },
                                ]
                            }} />
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartContainer title="Inventory Level Trend (Daily Avg)" desc={kpiDescriptions.inventoryTrend}><ResponsiveContainer width="100%" height={300}><LineChart data={inventoryTrendData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="date" fontSize={10} stroke="#a0aec0" /><YAxis stroke="#a0aec0" /><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => Math.round(value).toLocaleString()}/><Legend/><Line type="monotone" dataKey="Inventory Level" stroke="#ff7300" dot={false}/></LineChart></ResponsiveContainer></ChartContainer>
                            <ChartContainer title="Current Inventory Composition" desc={kpiDescriptions.inventoryComposition}><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={inventoryCompositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ff7300" label>{inventoryCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} formatter={(value) => value.toLocaleString()}/><Legend/></PieChart></ResponsiveContainer></ChartContainer>
                        </div>
                    </div>
                </section>
                 <section className="pt-8 border-t-2 border-gray-700">
                     <h2 className="text-3xl font-bold text-white mb-6 text-left">Future Forecast</h2>
                     <ForecastChart />
                     <br></br>
                </section>
            </main>
            <Chatbot historicalData={salesData} forecastData={forecastData} /> 
            </div>
        </div>
    );
}

// --- App Wrapper for Authentication ---
// function App() {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const handleLogin = () => setIsAuthenticated(true);
//     const handleLogout = () => setIsAuthenticated(false);

//     // Pass the handleLogout function as a prop to the Dashboard
//     return isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
// }
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        const loggedIn = localStorage.getItem('isAuthenticated');
        if (loggedIn === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                {/* --- FIX: If authenticated, redirect from /login to /dashboard --- */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
                
                {/* --- FIX: The main catch-all now has a nested route for the root path --- */}
                <Route path="/*" element={isAuthenticated ? <AppLayout onLogout={handleLogout} /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
const AppLayout = ({ onLogout }) => (
    <div className="bg-gray-900 text-white min-h-screen">
        <TopBar onLogout={onLogout} />
        <div className="pt-24 px-4 md:px-8">
            <Routes>
                {/* --- FIX: Define the root path to redirect to /dashboard --- */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                {/* --- FIX: The dashboard is now explicitly at /dashboard --- */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/manage-data" element={<ManageDataPage />} />
                
                {/* --- FIX: The final catch-all now redirects to /dashboard as well --- */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </div>
    </div>
);

// --- Reusable Components (Modified with InfoIcons) ---
const FilterCard = ({ categories, regions, filterInputs, onCategoryChange, onRegionChange, onDateChange, onSubmit, loading }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">Filters</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
                <label className="font-semibold text-sm text-gray-300">Date Range</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="date" name="start" value={filterInputs.dateRange.start} onChange={onDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md w-full text-sm [color-scheme:dark]"/>
                    <span className="text-gray-500">to</span>
                    <input type="date" name="end" value={filterInputs.dateRange.end} onChange={onDateChange} className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md w-full text-sm [color-scheme:dark]"/>
                </div>
            </div>
            <div>
                <label className="font-semibold text-sm text-gray-300">Categories</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 max-h-20 overflow-y-auto">
                    {categories.map(category => (<div key={category} className="flex items-center"><input type="checkbox" id={`cat-${category}`} value={category} checked={filterInputs.selectedCategories.includes(category)} onChange={() => onCategoryChange(category)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600" /><label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-300">{category}</label></div>))}
                </div>
            </div>
            <div>
                <label className="font-semibold text-sm text-gray-300">Regions</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                    {regions.map(region => (<div key={region} className="flex items-center"><input type="checkbox" id={`reg-${region}`} value={region} checked={filterInputs.selectedRegions.includes(region)} onChange={() => onRegionChange(region)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600" /><label htmlFor={`reg-${region}`} className="ml-2 text-sm text-gray-300">{region}</label></div>))}
                </div>
            </div>
            <button type="submit" disabled={loading} className="mt-2 w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 disabled:bg-gray-500">
                {loading ? 'Applying...' : 'Apply Filters'}
            </button>
        </form>
    </div>
);

const GroupedSummaryTable = ({ title, groups }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">{title}</h3>
        <div className="space-y-3">
            {Object.entries(groups).map(([groupName, data]) => (
                <div key={groupName}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{groupName}</h4>
                    <table className="min-w-full mt-1">
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                                    <td className="py-1.5 pr-2 font-medium text-gray-300 text-sm flex items-center">
                                        {item.metric}
                                        {/* FIX: Conditionally render the InfoIcon only if a description exists */}
                                        {item.desc && <InfoIcon text={item.desc} />}
                                    </td>
                                    <td className="py-1.5 pl-2 text-right font-semibold text-white text-sm">{item.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
);

const ChartContainer = ({ title, desc, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
            {title}
            <InfoIcon text={desc} />
        </h2>
        {children}
    </div>
);

const TableCard = ({ title, headers, data, emptyMessage, conditionalCellStyle }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">{title}</h3>
        <div className="overflow-auto max-h-72">
            <table className="min-w-full">
                <thead className="bg-gray-700 sticky top-0">
                    <tr>{headers.map(h => <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="bg-gray-800">
                    {data && data.length > 0 ? (
                        data.map((row, i) => <tr key={i} className="border-b border-gray-700 last:border-b-0">{row.map((cell, j) => <td key={j} className={`py-2 px-3 text-sm text-gray-200 ${conditionalCellStyle ? conditionalCellStyle(row, j) : ''}`}>{cell}</td>)}</tr>)
                    ) : (
                        <tr><td colSpan={headers.length} className="text-center py-4 text-gray-500">{emptyMessage || "No data available."}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default App;
