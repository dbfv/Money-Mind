import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './screens/LandingPage';
import RegisterPage from './screens/RegisterPage';
import LoginPage from './screens/LoginPage';
import DashboardPage from './screens/DashboardPage';
import JournalPage from './screens/JournalPage';
import NavigationBar from './components/NavigationBar';
import SourceManagementPage from './screens/SourceManagementPage';

function AppContent() {
    const location = useLocation();
    const showNavBar = !['/', '/register', '/login'].includes(location.pathname);

    return (
        <>
            {showNavBar && <NavigationBar />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/calendar" element={<div className="pt-16 p-8">Calendar Page (Coming Soon)</div>} />
                <Route path="/investments" element={<div className="pt-16 p-8">Investments Page (Coming Soon)</div>} />
                <Route path="/profile" element={<div className="pt-16 p-8">Profile Page (Coming Soon)</div>} />
                <Route path="/settings" element={<div className="pt-16 p-8">Settings Page (Coming Soon)</div>} />
                <Route path="/sources" element={<SourceManagementPage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}

export default App; 