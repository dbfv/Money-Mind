// Base URL for API calls
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// API Endpoints
export const ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/api/users`,
    LOGIN: `${API_BASE_URL}/api/users/login`,
    CATEGORIES: `${API_BASE_URL}/api/categories`,
    SOURCES: `${API_BASE_URL}/api/sources`,
    TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
    DASHBOARD: `${API_BASE_URL}/api/transactions/dashboard`,
}; 