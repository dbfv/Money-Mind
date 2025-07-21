import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './screens/LandingPage/LandingPage';
import RegisterPage from './screens/RegisterPage/RegisterPage';
import LoginPage from './screens/LoginPage/LoginPage';
import DashboardPage from './screens/DashboardPage/DashboardPage';
import JournalPage from './screens/JournalPage/JournalPage';
import CalendarPage from './screens/CalendarPage/CalendarPage';
import InvestmentPage from './screens/InvestmentPage/InvestmentPage';
import NavigationBar from './components/NavigationBar';
import SourceManagementPage from './screens/SourceManagementPage/SourceManagementPage';
import ManagementPage from './screens/ManagementPage/ManagementPage';

// PrivateRoute component
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

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
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/journal" element={<PrivateRoute><JournalPage /></PrivateRoute>} />
                <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                <Route path="/investments" element={<PrivateRoute><InvestmentPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><div className="pt-16 p-8">Profile Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><div className="pt-16 p-8">Settings Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/manage" element={<PrivateRoute><ManagementPage /></PrivateRoute>} />
                <Route path="/sources" element={<PrivateRoute><SourceManagementPage /></PrivateRoute>} />
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