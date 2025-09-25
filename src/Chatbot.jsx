

// import React, { useState, useEffect, useRef } from 'react';
// import Papa from 'papaparse';
// import { supabase } from './supabaseClient'; // Import your existing Supabase client

// const Chatbot = () => {
//     const [forecastData, setForecastData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [timeframe, setTimeframe] = useState(30);
//     const [filteredData, setFilteredData] = useState([]);
  
//   const messagesEndRef = useRef(null);

//   // --- Gemini API Configuration ---
//     const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAezt_I6fOFQXrw2bq8wG_E9Ia3UtHwtXc";
//   const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//    useEffect(() => {
//       const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
      
//       Papa.parse(FORECAST_CSV_URL, {
//         download: true,
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           setForecastData(result.data);
//           setFilteredData(result.data.slice(0, 30));
//         },
//         error: (error) => console.error("Error parsing CSV:", error)
//       });
//     }, []);
  
//     useEffect(() => {
//       setFilteredData(forecastData.slice(0, timeframe));
//     }, [timeframe, forecastData]);

//   const callGemini = async (prompt) => {
//     const payload = { contents: [{ parts: [{ text: prompt }] }] };
//     const response = await fetch(geminiApiUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });
//     if (!response.ok) {
//       const errorBody = await response.json();
//       throw new Error(`Gemini API Error: ${errorBody.error?.message}`);
//     }
//     const result = await response.json();
//     return result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim() || isLoading) return;

//     const userMessage = { role: 'user', text: inputValue };
//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setIsLoading(true);

//     try {
//       // Step 1: LLM classifies the query and generates a plan
//       const queryPlanningPrompt = `
//         You are a data analysis planner. First, determine the user's intent based on their question and classify it into one of three types: "historical", "forecast", or "general". Then, generate a JSON plan.

//         1.  **If the question is about past or current data** (e.g., "total sales", "average inventory"), the type is "historical".
//             -   The plan should be for querying a Supabase table named "new_sales_data".
//             -   Available historical columns: "Date", "Store ID", "Product ID", "Category", "Region", "Inventory Level", "Units Sold", "Price", "Discount", "Demand", "Revenue", "Profit_Margin".
//             -   JSON must have: "queryType": "historical", "select", "filters", and "operation".

//         2.  **If the question is about future data** (e.g., "what is the forecast", "predict sales"), the type is "forecast".
//             -   The plan should be for processing a local array of forecast data.
//             -   Available forecast columns: "Date", "Sales_Forecast", "Demand_Forecast".
//             -   JSON must have: "queryType": "forecast", "operation", and "timeframeInDays".

//         3.  **If the question is general conversation**, the type is "general".
//             -   JSON must have: "queryType": "general".

//         --- EXAMPLES ---
//         User Question: "total sales for toys in the north region"
//         Result: {"queryType": "historical", "select": "\\"Units Sold\\"", "filters": [{"column": "Category", "operator": "eq", "value": "Toys"}, {"column": "Region", "operator": "eq", "value": "North"}], "operation": {"method": "SUM", "column": "Units Sold"}}

//         User Question: "what is the total sales forecast for the next 30 days?"
//         Result: {"queryType": "forecast", "operation": {"method": "SUM", "column": "Sales_Forecast"}, "timeframeInDays": 30}

//         User Question: "predict the average demand for the next week"
//         Result: {"queryType": "forecast", "operation": {"method": "AVG", "column": "Demand_Forecast"}, "timeframeInDays": 7}

//         User Question: "hello how are you"
//         Result: {"queryType": "general"}
//         ---

//         User Question: "${inputValue}"

//         Return only the JSON object.
//       `;

//       const jsonResponse = await callGemini(queryPlanningPrompt);
//       const plan = JSON.parse(jsonResponse.replace(/```json|```/g, '').trim());

//       let finalAnswer = "";
//       let calculatedResult;

//       switch (plan.queryType) {
//         case 'historical':
//           let query = supabase.from('new_sales_data').select(plan.select);
//           if (plan.filters && plan.filters.length > 0) {
//             plan.filters.forEach(filter => {
//               query = query[filter.operator](filter.column, filter.value);
//             });
//           }
//           const { data, error } = await query;
//           if (error) throw new Error(`Database Error: ${error.message}`);
//           if (!data || data.length === 0) throw new Error("No historical data found for your query.");
          
//           switch (plan.operation.method) {
//             case 'SUM': calculatedResult = data.reduce((sum, row) => sum + (parseFloat(row[plan.operation.column]) || 0), 0); break;
//             case 'AVG': const sum = data.reduce((s, row) => s + (parseFloat(row[plan.operation.column]) || 0), 0); calculatedResult = sum / data.length; break;
//             case 'COUNT': calculatedResult = data.length; break;
//             default: calculatedResult = data;
//           }
//           break;

//         case 'forecast':
//           if (!forecastData || forecastData.length === 0) throw new Error("Forecast data is not available yet.");
//           const timeframeData = forecastData.slice(0, plan.timeframeInDays || 30);
//           if (timeframeData.length === 0) throw new Error(`No forecast data available for the next ${plan.timeframeInDays} days.`);

//           switch (plan.operation.method) {
//             case 'SUM': calculatedResult = timeframeData.reduce((sum, row) => sum + (parseFloat(row[plan.operation.column]) || 0), 0); break;
//             case 'AVG': const forecastSum = timeframeData.reduce((s, row) => s + (parseFloat(row[plan.operation.column]) || 0), 0); calculatedResult = forecastSum / timeframeData.length; break;
//             default: calculatedResult = timeframeData;
//           }
//           break;

//         case 'general':
//         default:
//           finalAnswer = await callGemini(`The user said: "${inputValue}". Respond conversationally.`);
//           break;
//       }
      
//       if (plan.queryType === 'historical' || plan.queryType === 'forecast') {
//         const summarizationPrompt = `
//           You are a helpful data analyst. Present the following calculated answer in a concise, friendly, and natural language sentence.
//           Original Question: "${inputValue}"
//           Calculated Answer: ${JSON.stringify(calculatedResult)}
//           Format numbers clearly (e.g., with commas or as currency if appropriate).
//         `;
//         finalAnswer = await callGemini(summarizationPrompt);
//       }
      
//       setMessages(prev => [...prev, { role: 'model', text: finalAnswer }]);
//     } catch (error) {
//       console.error("Error in handleSendMessage:", error);
//       setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${error.message}.` }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className={`fixed bottom-24 right-4 w-80 md:w-96 h-[calc(100vh-120px)] max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
//         <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg shadow-md">
//           <div className="flex items-center">
//             <div className="bg-cyan-200 w-8 h-8 rounded-full flex items-center justify-center mr-2"><span className="text-cyan-800 text-lg font-bold">🤖</span></div>
//             <div><p className="font-semibold text-lg leading-tight">BizBot</p><p className="text-xs text-cyan-100">Your Data Assistant</p></div>
//           </div>
//           <button onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-200 text-2xl leading-none">&times;</button>
//         </div>
//         <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
//           {messages.map((msg, index) => (
//             <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//               <div className={`px-4 py-2 rounded-xl max-w-[75%] break-words ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>{msg.text}</div>
//             </div>
//           ))}
//           {isLoading && <div className="flex justify-start"><div className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none"><span className="animate-pulse">Thinking...</span></div></div>}
//           <div ref={messagesEndRef} />
//         </div>
//         <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center">
//           <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask about sales or forecasts..." className="flex-grow p-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900" disabled={isLoading}/>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm" disabled={isLoading}>Send</button>
//         </form>
//       </div>
//       <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out z-50 focus:outline-none focus:ring-4 focus:ring-blue-300" aria-label={isOpen ? "Close chat" : "Open chat"}>{isOpen ? '✕' : '💬'}</button>
//     </>
//   );
// };

// export default Chatbot;


import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient'; // Import your existing Supabase client
import Papa from 'papaparse';

// FIX: The component now accepts `forecastData` as a prop from the main App
const Chatbot = () => {
  const [forecastData, setForecastData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref for the textarea


  // --- Gemini API Configuration ---
 const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAezt_I6fOFQXrw2bq8wG_E9Ia3UtHwtXc";
 const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [inputValue]);

    useEffect(() => {
    const FORECAST_CSV_URL = 'https://feqnxbahwsomdociezti.supabase.co/storage/v1/object/public/forecast/forecast_output_revenue_and_units.csv';
    
    Papa.parse(FORECAST_CSV_URL, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setForecastData(result.data.filter(row => row.Date)); // Filter out any empty rows
      },
      error: (error) => console.error("Error parsing forecast CSV for chatbot:", error)
    });
  }, []);

  const callGemini = async (prompt) => {
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Gemini API Error: ${errorBody.error?.message}`);
    }
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // --- FIX: Updated the entire prompt to handle the new forecast data structure ---
      const queryPlanningPrompt = `
        You are a data analysis planner. Your job is to understand a user's question and create a JSON plan to answer it.
        First, classify the question into "historical", "forecast", or "general" based on the following rules.

        --- IMPORTANT CONTEXT ---
        - The current date is August 31, 2025. All historical data ends on this date.
        - Any user query about dates ON OR BEFORE August 31, 2025, MUST be classified as "historical".
        - Any user query about dates AFTER August 31, 2025, MUST be classified as "forecast".
        - For relative dates: "last 3 months" means June, July, and August 2025. "Next 2 months" means September and October 2025.
        - The date context is the most important factor for deciding between historical and forecast.
        ---

        1.  **If the question is "historical"**:
            -   The plan queries a Supabase table named "new_sales_data".
            -   JSON must have: "queryType": "historical", "select", "filters", and "operation".

        2.  **If the question is "forecast"**:
            -   The plan processes a local array of forecast data.
            -   Available forecast columns: "Date", "Category", "Revenue_Forecast", "Units_Sold_Forecast".
            -   Valid Categories are: "Clothing", "Electronics", "Furniture", "Groceries", "Toys".
            -   JSON must have: "queryType": "forecast", "operation" (with method and column), "timeframeInDays", and "categories" (an array of strings).
            -   The "categories" value MUST be an array. If the user asks for "all categories" or does not specify any, the value should be null.
            -   If the user asks for "demand forecast", the target column is "Units_Sold_Forecast".
            -   If the user asks for "sales forecast" or "revenue forecast", the target column is "Revenue_Forecast".

        3.  **If the question is "general" conversation**, the type is "general".
            -   JSON must have: "queryType": "general".

        --- EXAMPLES ---
        User Question: "total revenue for toys in august 2025"
        Result: {"queryType": "historical", "select": "Revenue", "filters": [{"column": "Category", "operator": "eq", "value": "Toys"}, {"column": "Date", "operator": "gte", "value": "2025-08-01"}, {"column": "Date", "operator": "lte", "value": "2025-08-31"}], "operation": {"method": "SUM", "column": "Revenue"}}

        User Question: "what is the total sales forecast for the next 30 days for furniture?"
        Result: {"queryType": "forecast", "operation": {"method": "SUM", "column": "Revenue_Forecast"}, "timeframeInDays": 30, "categories": ["Furniture"]}

        User Question: "predict the average demand for next week for toys and clothing"
        Result: {"queryType": "forecast", "operation": {"method": "AVG", "column": "Units_Sold_Forecast"}, "timeframeInDays": 7, "categories": ["Toys", "Clothing"]}

        User Question: "what is the demand forecast for all categories next month?"
        Result: {"queryType": "forecast", "operation": {"method": "SUM", "column": "Units_Sold_Forecast"}, "timeframeInDays": 30, "categories": null}
        
        User Question: "hello"
        Result: {"queryType": "general"}
        ---

        User Question: "${inputValue}"

        Return only the JSON object.
      `;

      const jsonResponse = await callGemini(queryPlanningPrompt);
      const plan = JSON.parse(jsonResponse.replace(/```json|```/g, '').trim());

      let finalAnswer = "";
      let calculatedResult;

      switch (plan.queryType) {
        case 'historical':
          let query = supabase.from('new_sales_data').select(plan.select);
          if (plan.filters && plan.filters.length > 0) {
            plan.filters.forEach(filter => {
              query = query[filter.operator](filter.column, filter.value);
            });
          }
          const { data, error } = await query;
          if (error) throw new Error(`Database Error: ${error.message}`);
          if (!data || data.length === 0) throw new Error("No historical data found for your query.");
          
          switch (plan.operation.method) {
            case 'SUM': calculatedResult = data.reduce((sum, row) => sum + (parseFloat(row[plan.operation.column]) || 0), 0); break;
            case 'AVG': const sum = data.reduce((s, row) => s + (parseFloat(row[plan.operation.column]) || 0), 0); calculatedResult = sum / data.length; break;
            case 'COUNT': calculatedResult = data.length; break;
            default: calculatedResult = data;
          }
          break;

        case 'forecast':
          if (!forecastData || forecastData.length === 0) throw new Error("Forecast data is not available yet.");
          
          // --- FIX: Added logic to filter by category first ---
          let categoryFilteredData = forecastData;
          if (plan.categories && Array.isArray(plan.categories) && plan.categories.length > 0) {
              const lowerCaseCategories = plan.categories.map(c => c.toLowerCase());
              categoryFilteredData = forecastData.filter(row => 
                  row.Category && lowerCaseCategories.includes(row.Category.toLowerCase())
              );
              if (categoryFilteredData.length === 0) throw new Error(`No forecast data found for the specified categories.`);
          }

          const timeframeData = categoryFilteredData.slice(0, plan.timeframeInDays || 30);
          if (timeframeData.length === 0) throw new Error(`No forecast data available for the next ${plan.timeframeInDays} days.`);

          switch (plan.operation.method) {
            case 'SUM': calculatedResult = timeframeData.reduce((sum, row) => sum + (parseFloat(row[plan.operation.column]) || 0), 0); break;
            case 'AVG': const forecastSum = timeframeData.reduce((s, row) => s + (parseFloat(row[plan.operation.column]) || 0), 0); calculatedResult = forecastSum / timeframeData.length; break;
            default: calculatedResult = timeframeData;
          }
          break;

        case 'general':
        default:
          finalAnswer = await callGemini(`The user said: "${inputValue}". Respond conversationally.`);
          break;
      }
      
      if (plan.queryType === 'historical' || plan.queryType === 'forecast') {
        const summarizationPrompt = `
          You are a helpful data analyst. Present the following calculated answer in a concise, friendly, and natural language sentence.
          Original Question: "${inputValue}"
          Calculated Answer: ${JSON.stringify(calculatedResult)}
          Format numbers clearly (e.g., with commas or as currency if appropriate). If the result is for a revenue forecast, format it as currency.
        `;
        finalAnswer = await callGemini(summarizationPrompt);
      }
      
      setMessages(prev => [...prev, { role: 'model', text: finalAnswer }]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${error.message}.` }]);
    } finally {
      setIsLoading(false);
    }
 };
      const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        handleSendMessage();
    }
  };

  return (
    <>
      <div className={`fixed bottom-24 right-4 w-80 md:w-96 h-[calc(100vh-120px)] max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-cyan-200 w-8 h-8 rounded-full flex items-center justify-center mr-2"><span className="text-cyan-800 text-lg font-bold">🤖</span></div>
            <div><p className="font-semibold text-lg leading-tight">BizBot</p><p className="text-xs text-cyan-100">Your Data Assistant</p></div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-200 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[75%] break-words ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && <div className="flex justify-start"><div className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none"><span className="animate-pulse">Thinking...</span></div></div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center">
           <textarea
            ref={textareaRef}
            rows="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sales or forecasts..."
            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 resize-none overflow-y-auto max-h-24 custom-scrollbar"
            disabled={isLoading}
            
          />
          {/* --- FIX: Changed rounded-r-full to rounded-r-lg for consistency --- */}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm self-end" disabled={isLoading}>Send</button>
        </form>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out z-50 focus:outline-none focus:ring-4 focus:ring-blue-300" aria-label={isOpen ? "Close chat" : "Open chat"}>{isOpen ? '✕' : '💬'}</button>
    </>
  );
};

export default Chatbot;


