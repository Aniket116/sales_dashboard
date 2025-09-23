import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Papa from 'papaparse';

// --- Main Component ---
const ManageDataPage = () => {
    const [recentRecords, setRecentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRecentRecords = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('new_sales_data')
            .select('Date, Category, Region, Revenue, "Units Sold"')
            .order('Date', { ascending: false })
            .limit(25);

        if (error) {
            setError('Failed to fetch recent records.');
            console.error(error);
        } else {
            setRecentRecords(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchRecentRecords();
    }, [fetchRecentRecords]);

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white text-left">Data Management</h2>
                <p className="text-gray-400 mt-1 text-left">Add new sales records manually or upload in bulk via CSV.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Forms */}
                <div className="lg:col-span-1 space-y-6">
                    <ManualEntryForm onUploadSuccess={fetchRecentRecords} />
                    <CsvUpload onUploadSuccess={fetchRecentRecords} />
                </div>

                {/* Column 2: Recent Records Table */}
                <div className="lg:col-span-2">
                    <RecentRecordsTable records={recentRecords} loading={loading} error={error} />
                </div>
            </div>
        </div>
    );
};


// --- Sub-Component: Manual Entry Form ---
const ManualEntryForm = ({ onUploadSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [record, setRecord] = useState({
        Date: new Date().toISOString().split('T')[0],
        Category: '',
        Region: '',
        'Units Sold': 0,
        Revenue: 0.0,
    });

    // --- FIX: Add useEffect to make the message disappear after 5 seconds ---
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000); // 5 seconds
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [message.text]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setRecord(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        if (!record.Date || !record.Category || !record.Region || record['Units Sold'] <= 0 || record.Revenue < 0) {
            setMessage({ type: 'error', text: 'Please fill out all fields with valid data.' });
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase.from('new_sales_data').insert([{ ...record, "Product ID": `P${Math.floor(Math.random() * 10000)}` }]);

        if (error) {
            setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Record added successfully!' });
            onUploadSuccess(); // Trigger data refresh
            // Reset form after successful submission
            setRecord({
                Date: new Date().toISOString().split('T')[0],
                Category: '',
                Region: '',
                'Units Sold': 0,
                Revenue: 0.0,
            });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-cyan-400">Add a Single Record</h3>
            <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input type="date" name="Date" value={record.Date} onChange={handleChange} className="mt-1 block w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm [color-scheme:dark]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Category</label>
                    <select name="Category" value={record.Category} onChange={handleChange} className="mt-1 block w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm">
                        <option value="" disabled>Select a Category</option><option>Electronics</option> <option>Clothing</option> <option>Groceries</option> <option>Furniture</option> <option>Toys</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Region</label>
                     <select name="Region" value={record.Region} onChange={handleChange} className="mt-1 block w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm">
                        <option value="" disabled>Select a Region</option><option>North</option> <option>South</option> <option>East</option> <option>West</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Units Sold</label>
                    <input type="number" name="Units Sold" value={record['Units Sold']} onChange={handleChange} className="mt-1 block w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Revenue</label>
                    <input type="number" step="0.01" name="Revenue" value={record.Revenue} onChange={handleChange} className="mt-1 block w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm" />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full mt-3 bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 disabled:bg-gray-500">
                    {isSubmitting ? 'Submitting...' : 'Submit Record'}
                </button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message.text}</p>}
            </form>
        </div>
    );
};


// --- Sub-Component: CSV Upload ---
const CsvUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- FIX: Add useEffect to make the message disappear after 5 seconds ---
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000); // 5 seconds
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [message.text]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage({ type: '', text: '' });
    };

    const handleUpload = () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }
        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: async (results) => {
                const { data, errors } = results;
                if (errors.length > 0) {
                    setMessage({ type: 'error', text: 'Error parsing CSV. Please check the file format.' });
                    setIsUploading(false);
                    return;
                }
                const { error: uploadError } = await supabase.from('new_sales_data').insert(data);
                if (uploadError) {
                    setMessage({ type: 'error', text: `Upload failed: ${uploadError.message}` });
                } else {
                    setMessage({ type: 'success', text: `Successfully uploaded ${data.length} records!` });
                    onUploadSuccess();
                }
                setIsUploading(false);
                setFile(null);
            }
        });
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-cyan-400">Bulk Upload via CSV</h3>
            <div className="space-y-3">
                <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                <button onClick={handleUpload} disabled={!file || isUploading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-500">
                    {isUploading ? 'Uploading...' : 'Upload CSV'}
                </button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message.text}</p>}
            </div>
        </div>
    );
};

// --- Sub-Component: Recent Records Table ---
const RecentRecordsTable = ({ records, loading, error }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">Recently Added Records</h3>
        <div className="overflow-auto max-h-[523px]">
            <table className="min-w-full">
                <thead className="bg-gray-700 sticky top-0">
                    <tr>
                        {['Date', 'Category', 'Region', 'Units Sold', 'Revenue'].map(h => (
                            <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-800">
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-400">Loading...</td></tr>
                    ) : error ? (
                        <tr><td colSpan="5" className="text-center py-4 text-red-400">{error}</td></tr>
                    ) : (
                        records.map((row, i) => (
                            <tr key={i} className="border-b border-gray-700 last:border-b-0">
                                <td className="py-2 px-3 text-sm text-gray-200">{row.Date}</td>
                                <td className="py-2 px-3 text-sm text-gray-200">{row.Category}</td>
                                <td className="py-2 px-3 text-sm text-gray-200">{row.Region}</td>
                                <td className="py-2 px-3 text-sm text-gray-200">{row['Units Sold']}</td>
                                <td className="py-2 px-3 text-sm text-gray-200">${row.Revenue?.toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default ManageDataPage;
