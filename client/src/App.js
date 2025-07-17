import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './screens/LandingPage';
import RegisterPage from './screens/RegisterPage';
import LoginPage from './screens/LoginPage';
import DashboardPage from './screens/DashboardPage';
import JournalPage from './screens/JournalPage';
import NavigationBar from './components/NavigationBar';
import SourceManagementPage from './screens/SourceManagementPage';
// import TypeManagementPage from './screens/TypeManagementPage';

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
                <Route path="/calendar" element={<PrivateRoute><div className="pt-16 p-8">Calendar Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/investments" element={<PrivateRoute><div className="pt-16 p-8">Investments Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><div className="pt-16 p-8">Profile Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><div className="pt-16 p-8">Settings Page (Coming Soon)</div></PrivateRoute>} />
                <Route path="/sources" element={<PrivateRoute><SourceManagementPage /></PrivateRoute>} />
                {/* <Route path="/types" element={<PrivateRoute><TypeManagementPage /></PrivateRoute>} /> */}
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