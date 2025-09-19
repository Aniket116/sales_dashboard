import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Use dummy credentials as requested
        if (username === 'mahendra@tcs.com' && password === 'bizmitra') {
            setError('');
            onLogin();
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cyan-400">BizMitra</h1>
                    <p className="text-gray-400 mt-2">Your Business Intelligence Partner</p>
                    <p className="text-gray-500 mt-4 text-sm">
                        Welcome to BizMitra, an advanced analytics dashboard for sales and inventory data. 
                        Log in to unlock insights, track performance, and make data-driven decisions.
                    </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder=""
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder=""
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 transition-colors">
                        Login
                    </button>
                </form>
                 <div className="text-center mt-6 text-xs text-gray-500">
                    <a>Forgot Password?</a>
                    {/* <p>Use credentials: <span className="font-mono">admin</span> / <span className="font-mono">password</span></p> */}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;