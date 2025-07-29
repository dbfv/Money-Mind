import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ENDPOINTS } from '../../config/api';
import Calendar from './Calendar';
import EventForm from './EventForm';
import DayDetailsForm from './DayDetailsForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [dayTransactions, setDayTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Create a new event object
    const createNewEvent = (date) => ({
        title: '',
        description: '',
        amount: '',
        type: 'expense',
        startDate: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
    });

    const [newEvent, setNewEvent] = useState(createNewEvent(selectedDate));

    // Event colors based on type
    const eventColors = {
        expense: '#ef4444',
        income: '#10b981',
        reminder: '#3b82f6',
        prediction: '#8b5cf6'
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchCalendarData();
        fetchTransactions();
    }, [currentMonth]);

    // Refresh the events when transactions change
    useEffect(() => {
        if (transactions.length > 0) {
            updateEventsWithTransactions([]);
        }
    }, [transactions]);

    // Fetch categories and sources once
    useEffect(() => {
        fetchCategories();
        fetchSources();
    }, []);

    // Helper function to get month range
    const getMonthDateRange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month - 1, 1); // Previous month for padding
        const lastDay = new Date(year, month + 2, 0);  // Next month for padding
        return { startDate: firstDay, endDate: lastDay };
    };

    // Fetch calendar events
    const fetchCalendarData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            const { startDate, endDate } = getMonthDateRange(currentMonth);
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];

            const url = `${ENDPOINTS.CALENDAR_EVENTS}?startDate=${start}&endDate=${end}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch calendar events');
            }

            const data = await response.json();

            // Combine calendar events with transactions
            updateEventsWithTransactions(data);
        } catch (err) {
            console.error('Error fetching calendar data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.TRANSACTIONS, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch transactions');
            }

            const data = await response.json();
            setTransactions(data);

            // Update events with the new transactions
            updateEventsWithTransactions(events);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    };

    // Combine calendar events with transactions
    const updateEventsWithTransactions = (calendarEvents) => {
        // Convert transactions to calendar event format
        const transactionEvents = transactions.map(transaction => ({
            _id: `transaction-${transaction._id}`,
            title: transaction.description,
            type: transaction.type,
            amount: transaction.amount,
            startDate: transaction.date,
            category: transaction.category,
            source: transaction.source,
            isTransaction: true
        }));

        // Make sure calendarEvents is an array (handle empty case)
        const eventsArray = Array.isArray(calendarEvents) ? calendarEvents : [];

        // Combine and set events
        setEvents([...eventsArray, ...transactionEvents]);
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(ENDPOINTS.CATEGORIES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Fetch sources
    const fetchSources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(ENDPOINTS.SOURCES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sources');
            }

            const data = await response.json();
            setSources(data);
        } catch (err) {
            console.error('Error fetching sources:', err);
        }
    };

    // Helper function to check if two dates are the same day
    const isSameDay = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    const handleDateClick = (day) => {
        setSelectedDate(day);
        const formattedDate = formatDate(day);
        setNewEvent(createNewEvent(formattedDate));
        setSelectedEvent(null);

        // Get transactions for the selected day
        const dayTransactions = transactions.filter(transaction =>
            isSameDay(new Date(transaction.date), day)
        );
        setDayTransactions(dayTransactions);

        // Open the day details modal instead of just the event form
        setShowDayDetailsModal(true);
    };

    const handleEventClick = (event) => {
        // If it's a transaction, don't allow editing
        if (event.isTransaction) {
            // Maybe show a toast or notification
            console.log('Transactions can only be edited in the Journal tab');
            return;
        }

        // Clone the event to avoid direct state mutation
        setSelectedEvent({
            ...event,
            startDate: event.startDate ? formatDate(new Date(event.startDate)) : formatDate(new Date(event.date))
        });
        setNewEvent(null);
        setShowEventModal(true);
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;

        if (selectedEvent) {
            setSelectedEvent({ ...selectedEvent, [name]: inputValue });
        } else {
            setNewEvent({ ...newEvent, [name]: inputValue });
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const eventData = { ...formData };

            // Handle the API call
            let response;
            if (selectedEvent && selectedEvent._id) {
                // Update existing event
                response = await fetch(`${ENDPOINTS.CALENDAR_EVENTS}/${selectedEvent._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
            } else {
                // Create new event
                response = await fetch(ENDPOINTS.CALENDAR_EVENTS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save event');
            }

            // Refresh calendar data
            await fetchCalendarData();
            closeModal();
        } catch (err) {
            console.error('Error saving event:', err);
            setError(err.message);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedEvent || !selectedEvent._id) {
            closeModal();
            return;
        }
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!selectedEvent || !selectedEvent._id) {
            closeModal();
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(`${ENDPOINTS.CALENDAR_EVENTS}/${selectedEvent._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete event');
            }

            // Refresh calendar data
            await fetchCalendarData();
            closeModal();
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error('Error deleting event:', err);
            setError(err.message);
            setShowDeleteConfirm(false);
        }
    };

    const closeModal = () => {
        setShowEventModal(false);
        setShowDayDetailsModal(false);
        setSelectedEvent(null);
        setNewEvent(createNewEvent(selectedDate));
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (isLoading && events.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading calendar...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4" variants={itemVariants}>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Calendar</h1>
                            <p className="text-gray-600">Plan and visualize your financial events</p>
                        </div>
                        <motion.button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedDate(new Date());
                                setSelectedEvent(null);
                                setNewEvent(createNewEvent(new Date()));
                                setShowEventModal(true);
                            }}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Event
                        </motion.button>
                    </motion.div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </motion.div>
                    )}

                    {/* Calendar Legend */}
                    <motion.div className="mb-6 flex flex-wrap gap-4" variants={itemVariants}>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: eventColors.expense }}></div>
                            <span className="text-sm text-gray-600">Expenses</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: eventColors.income }}></div>
                            <span className="text-sm text-gray-600">Income</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: eventColors.reminder }}></div>
                            <span className="text-sm text-gray-600">Reminders</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: eventColors.prediction }}></div>
                            <span className="text-sm text-gray-600">Predictions</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 rounded border border-gray-400"></div>
                            <span className="text-sm text-gray-600">Transactions</span>
                        </div>
                    </motion.div>

                    {/* Calendar */}
                    <motion.div variants={itemVariants} className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-xl">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        <Calendar
                            currentMonth={currentMonth}
                            selectedDate={selectedDate}
                            events={events}
                            eventColors={eventColors}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                            onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Event Form Modal */}
            {showEventModal && (
                <EventForm
                    onClose={closeModal}
                    event={selectedEvent || newEvent}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onDelete={handleDeleteClick}
                    isNew={!selectedEvent}
                    error={error}
                    categories={categories}
                    sources={sources}
                />
            )}

            {/* Day Details Modal with Transactions and Event Form */}
            {showDayDetailsModal && (
                <DayDetailsForm
                    onClose={closeModal}
                    date={selectedDate}
                    transactions={dayTransactions}
                    event={newEvent}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    error={error}
                    categories={categories}
                    sources={sources}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Event"
                message="Are you sure you want to delete this financial event? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default CalendarPage; 