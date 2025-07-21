import React from 'react';

const TabNavigation = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex space-x-4 mb-6">
            <button
                onClick={() => onTabChange('categories')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'categories'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                Categories
            </button>
            <button
                onClick={() => onTabChange('sources')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'sources'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                Sources
            </button>
        </div>
    );
};

export default TabNavigation; 