import React from 'react';

const Header = ({ error }) => {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Manage Money Sources</h1>
            {error && <div className="text-red-600">{error}</div>}
        </>
    );
};

export default Header; 