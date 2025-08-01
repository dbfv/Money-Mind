// Base URL for API calls
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// API Endpoints
export const ENDPOINTS = {
    // User authentication
    REGISTER: `${API_BASE_URL}/api/users`,
    LOGIN: `${API_BASE_URL}/api/users/login`,

    // User profile and settings
    USERS: `${API_BASE_URL}/api/users`,
    USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
    USER_AVATAR: `${API_BASE_URL}/api/users/avatar`,
    INVESTMENT_PROFILE: `${API_BASE_URL}/api/users/investment-profile`,
    SUGGEST_INVESTABLE_INCOME: `${API_BASE_URL}/api/users/suggest-investable-income`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/users/change-password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/users/account`,

    // Financial data
    CATEGORIES: `${API_BASE_URL}/api/categories`,
    SOURCES: `${API_BASE_URL}/api/sources`,
    TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
    TRANSACTIONS_BULK_DELETE: `${API_BASE_URL}/api/transactions/bulk`,
    DASHBOARD: `${API_BASE_URL}/api/transactions/dashboard`,
    CALENDAR_EVENTS: `${API_BASE_URL}/api/calendar-events`,
}; 