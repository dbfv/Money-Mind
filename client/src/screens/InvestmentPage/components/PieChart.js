import React, { useState } from 'react';

const PieChart = ({ data }) => {
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const size = 300;
    const center = size / 2;
    const radius = 120;

    // Color palette for assets
    const getAssetColor = (index) => {
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow/Gold
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16'  // Lime
        ];
        return colors[index % colors.length];
    };

    // Calculate angles for each slice
    let cumulativePercentage = 0;
    const slices = data.map((asset, index) => {
        const startAngle = (cumulativePercentage / 100) * 360;
        const endAngle = ((cumulativePercentage + asset.percentage) / 100) * 360;
        cumulativePercentage += asset.percentage;

        // Convert to radians
        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (endAngle - 90) * (Math.PI / 180);

        // Calculate path coordinates
        const largeArcFlag = asset.percentage > 50 ? 1 : 0;
        
        const x1 = center + radius * Math.cos(startAngleRad);
        const y1 = center + radius * Math.sin(startAngleRad);
        const x2 = center + radius * Math.cos(endAngleRad);
        const y2 = center + radius * Math.sin(endAngleRad);

        const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        return {
            pathData,
            color: getAssetColor(index),
            percentage: asset.percentage,
            assetType: asset.assetType,
            amount: asset.amount
        };
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
                {slices.map((slice, index) => (
                    <path
                        key={index}
                        d={slice.pathData}
                        fill={slice.color}
                        stroke="white"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all duration-200 cursor-pointer hover:stroke-4"
                        onMouseEnter={() => setHoveredSlice(slice)}
                        onMouseLeave={() => setHoveredSlice(null)}
                    />
                ))}
            </svg>
            
            {/* Hover tooltip */}
            {hoveredSlice && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-10 pointer-events-none">
                    <div className="text-center">
                        <div className="font-semibold text-sm">{hoveredSlice.assetType}</div>
                        <div className="text-lg font-bold">{hoveredSlice.percentage}%</div>
                        <div className="text-sm opacity-90">{formatCurrency(hoveredSlice.amount)}/month</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PieChart;