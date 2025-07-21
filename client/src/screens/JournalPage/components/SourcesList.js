import React from 'react';

const SourcesList = ({ sources }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> All Sources
            </div>
            {sources.length === 0 ? (
                <div className="text-gray-400">No sources found.</div>
            ) : (
                <ul className="space-y-4">
                    {sources.map((src) => (
                        <li key={src._id} className="border rounded-lg p-4 flex flex-col gap-1 bg-gray-50 hover:bg-gray-100 transition">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">{src.name}</span>
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{src.type}</span>
                            </div>
                            <div className="text-gray-600 text-sm">Balance: <span className="font-bold">${parseFloat(src.balance).toLocaleString()}</span></div>
                            <div className="text-gray-500 text-xs">Status: {src.status}</div>
                            {src.interestRate && (
                                <div className="text-gray-500 text-xs">Interest: {src.interestRate}% {src.interestPeriod ? `(${src.interestPeriod})` : ''}</div>
                            )}
                            {src.transferTime && (
                                <div className="text-gray-500 text-xs">Wait: {src.transferTime}</div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SourcesList; 