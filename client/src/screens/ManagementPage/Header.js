import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ error }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
                <button
                    onClick={() => navigate('/journal')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    ← Back to Journal
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
        </>
    );
};

export default Header; 