import React from 'react';

const LineChart = ({ data }) => {
    if (!data || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0) {
        return <div className="text-center py-8 text-gray-500">No projection data available</div>;
    }

    // Find min and max values for scaling
    const allValues = data.datasets.flatMap(dataset => dataset.data);
    const maxValue = Math.max(...allValues);

    // Chart dimensions
    const height = 300;
    const width = 600;
    const padding = 40;

    // Calculate points for each dataset
    const getPoints = (dataset) => {
        return dataset.data.map((value, index) => {
            const x = padding + (index * (width - padding * 2) / (dataset.data.length - 1));
            const y = height - padding - ((value / maxValue) * (height - padding * 2));
            return `${x},${y}`;
        }).join(' ');
    };

    // Generate horizontal guide lines
    const guideLines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const y = height - padding - (i * (height - padding * 2) / steps);
        guideLines.push(
            <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
            />
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Guide lines */}
                {guideLines}

                {/* X and Y axes */}
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="#9ca3af"
                    strokeWidth="2"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke="#9ca3af"
                    strokeWidth="2"
                />

                {/* X-axis labels (years) */}
                {data.labels.map((label, i) => {
                    const x = padding + (i * (width - padding * 2) / (data.labels.length - 1));
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 15}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Y-axis labels */}
                {Array.from({ length: steps + 1 }).map((_, i) => {
                    const value = Math.round(maxValue * i / steps);
                    const y = height - padding - (i * (height - padding * 2) / steps);
                    return (
                        <text
                            key={i}
                            x={padding - 10}
                            y={y + 5}
                            textAnchor="end"
                            className="text-xs fill-gray-600"
                        >
                            ${value.toLocaleString()}
                        </text>
                    );
                })}

                {/* Dataset lines */}
                {data.datasets.map((dataset, i) => (
                    <g key={i}>
                        <polyline
                            points={getPoints(dataset)}
                            fill="none"
                            stroke={dataset.color}
                            strokeWidth="3"
                        />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex justify-center mt-4 gap-6">
                {data.datasets.map((dataset, i) => (
                    <div key={i} className="flex items-center">
                        <div
                            className="w-4 h-4 mr-2"
                            style={{ backgroundColor: dataset.color }}
                        />
                        <span className="text-sm text-gray-600">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LineChart; 