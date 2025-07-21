import React from 'react';

const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    return (
        <div className="relative w-64 h-64 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {data.map((item, i) => {
                    const percentage = item.value / total;
                    const angle = percentage * 360;

                    // Calculate the path for the slice
                    const x1 = 50 + 40 * Math.cos(Math.PI * 2 * startAngle / 360);
                    const y1 = 50 + 40 * Math.sin(Math.PI * 2 * startAngle / 360);
                    const x2 = 50 + 40 * Math.cos(Math.PI * 2 * (startAngle + angle) / 360);
                    const y2 = 50 + 40 * Math.sin(Math.PI * 2 * (startAngle + angle) / 360);

                    // Determine if the angle is more than 180 degrees
                    const largeArcFlag = angle > 180 ? 1 : 0;

                    // Create the path
                    const pathData = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    const path = <path
                        key={i}
                        d={pathData}
                        fill={item.color}
                        stroke="#fff"
                        strokeWidth="0.5"
                    />;

                    startAngle += angle;
                    return path;
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-700 font-medium text-lg">Allocation</div>
            </div>
        </div>
    );
};

export default DonutChart; 