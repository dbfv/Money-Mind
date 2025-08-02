import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';

// Pages
import LandingPage from './screens/LandingPage/LandingPage';
import LoginPage from './screens/LoginPage/LoginPage';
import RegisterPage from './screens/RegisterPage/RegisterPage';
import DashboardPage from './screens/DashboardPage/DashboardPage';
import JournalPage from './screens/JournalPage/JournalPage';
import CalendarPage from './screens/CalendarPage/CalendarPage';
import ManagementPage from './screens/ManagementPage/ManagementPage';
import CategoryManagementPage from './screens/CategoryManagementPage';
import InvestmentPage from './screens/InvestmentPage/InvestmentPage';
import ProfilePage from './screens/ProfilePage/ProfilePage';
import SettingsPage from './screens/SettingsPage/SettingsPage';
import AdminPage from './screens/AdminPage/AdminPage';
import ForgotPasswordPage from './screens/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './screens/ResetPasswordPage/ResetPasswordPage';

// Components
import NavigationBar from './components/NavigationBar';

// Private Route wrapper component
const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <NavigationBar />
            {children}
        </>
    );
};

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Private routes */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    } />

                    <Route path="/journal" element={
                        <PrivateRoute>
                            <JournalPage />
                        </PrivateRoute>
                    } />

                    <Route path="/calendar" element={
                        <PrivateRoute>
                            <CalendarPage />
                        </PrivateRoute>
                    } />

                    <Route path="/management" element={
                        <PrivateRoute>
                            <ManagementPage />
                        </PrivateRoute>
                    } />

                    <Route path="/category-management" element={
                        <PrivateRoute>
                            <CategoryManagementPage />
                        </PrivateRoute>
                    } />

                    <Route path="/investments" element={
                        <PrivateRoute>
                            <InvestmentPage />
                        </PrivateRoute>
                    } />

                    <Route path="/profile" element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    } />

                    <Route path="/settings" element={
                        <PrivateRoute>
                            <SettingsPage />
                        </PrivateRoute>
                    } />

                    <Route path="/admin" element={
                        <PrivateRoute>
                            <AdminPage />
                        </PrivateRoute>
                    } />

                    {/* Add a redirect for the old /manage path to point to the new CategoryManagementPage */}
                    <Route path="/manage" element={
                        <Navigate to="/category-management" replace />
                    } />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App; 