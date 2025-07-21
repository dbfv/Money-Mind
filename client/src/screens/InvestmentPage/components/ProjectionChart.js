import React from 'react';
import LineChart from './LineChart';

const ProjectionChart = ({ data }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Growth Projection</h3>
            <div className="h-80">
                <LineChart data={data} />
            </div>
        </div>
    );
};

export default ProjectionChart; 