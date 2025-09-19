import React from 'react';

// A professional, fixed top navigation bar for the dashboard.
const TopBar = ({ onLogout }) => {

 
  const reloadPage = () => {
    window.location.reload();
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md p-4 flex justify-between items-center z-50">
      {/* Left side: Branding */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-cyan-400">BizMitra</h1>
      </div>

      {/* Right side: User info and Logout */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">Mahendra</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
        <button 
          onClick={reloadPage} 
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Logout"
        >
          {/* Logout Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default TopBar;