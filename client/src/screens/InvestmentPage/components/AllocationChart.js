import React from 'react';
import DonutChart from './DonutChart';

const AllocationChart = ({ recommendation }) => {
    // Format allocation data for the donut chart
    const allocationChartData = recommendation ? [
        {
            name: 'Stocks',
            value: recommendation.allocation.stocks,
            color: '#3b82f6' // Blue
        },
        {
            name: 'Bonds',
            value: recommendation.allocation.bonds,
            color: '#8b5cf6' // Purple
        },
        {
            name: 'Cash',
            value: recommendation.allocation.cash,
            color: '#10b981' // Green
        }
    ] : [];

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommended Allocation</h3>
            <div className="flex flex-col items-center">
                <DonutChart data={allocationChartData} />
                <div className="flex justify-center mt-4 gap-6">
                    {allocationChartData.map((item, i) => (
                        <div key={i} className="flex items-center">
                            <div
                                className="w-4 h-4 mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">
                                {item.name}: {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllocationChart; 