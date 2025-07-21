import React from 'react';

const SourceTable = ({ sources, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Interest</th>
                    <th className="p-2">Wait Time</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {sources.map(src => (
                    <tr key={src._id} className="border-t">
                        <td className="p-2">{src.name}</td>
                        <td className="p-2">{src.type}</td>
                        <td className="p-2">${src.balance}</td>
                        <td className="p-2">{src.status}</td>
                        <td className="p-2">{src.interestRate}% {src.interestPeriod ? `(${src.interestPeriod})` : ''}</td>
                        <td className="p-2">{src.transferTime}</td>
                        <td className="p-2">{src.category}</td>
                        <td className="p-2 flex gap-2">
                            <button
                                onClick={() => onEdit(src)}
                                className="text-blue-600 hover:underline"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(src._id)}
                                className="text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SourceTable; 