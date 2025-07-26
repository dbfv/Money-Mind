import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from './Calendar';
import EventForm from './EventForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        amount: '',
        type: 'expense',
        date: '',
        recurring: false,
        frequency: 'monthly',
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Event colors based on type
    const eventColors = {
        expense: '#ef4444',
        income: '#10b981',
        reminder: '#3b82f6',
        prediction: '#8b5cf6'
    };

    // Options for dropdowns
    const typeOptions = [
        { value: 'expense', label: 'Expense' },
        { value: 'income', label: 'Income' },
        { value: 'reminder', label: 'Reminder' },
    ];

    const frequencyOptions = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            // API integration would go here
            // For now, just initialize with empty data
            setEvents([]);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching calendar data:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleDateClick = (day) => {
        setSelectedDate(day);
        const formattedDate = formatDate(day);
        setNewEvent({
            ...newEvent,
            date: formattedDate
        });
        setShowEventModal(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent({
            ...event,
            date: formatDate(event.date)
        });
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
        setNewEvent({
            ...newEvent,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSelectedEventChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSelectedEvent({
            ...selectedEvent,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventData = selectedEvent || newEvent;
            const parsedDate = new Date(eventData.date);

            if (selectedEvent) {
                // Update existing event
                // API call would go here

                // For now, update UI
                const updatedEvents = events.map(event =>
                    event.id === selectedEvent.id
                        ? {
                            ...eventData,
                            date: parsedDate,
                            amount: parseFloat(eventData.amount) || 0
                        }
                        : event
                );
                setEvents(updatedEvents);
            } else {
                // Create new event
                // API call would go here

                // For now, update UI
                const newId = events.length > 0 ? Math.max(...events.map(e => e.id), 0) + 1 : 1;
                setEvents([
                    ...events,
                    {
                        ...eventData,
                        id: newId,
                        date: parsedDate,
                        amount: parseFloat(eventData.amount) || 0
                    }
                ]);
            }

            closeModal();
        } catch (err) {
            console.error('Error saving event:', err);
            setError(err.message);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedEvent) {
            closeModal();
            return;
        }
        setShowDeleteConfirm(true);
    };

    const handleDelete = () => {
        if (!selectedEvent) {
            closeModal();
            return;
        }

        // API call would go here

        // For now, update UI
        setEvents(events.filter(event => event.id !== selectedEvent.id));
        closeModal();
        setShowDeleteConfirm(false);
    };

    const closeModal = () => {
        setShowEventModal(false);
        setSelectedEvent(null);
        setNewEvent({
            title: '',
            amount: '',
            type: 'expense',
            date: selectedDate ? formatDate(selectedDate) : '',
            recurring: false,
            frequency: 'monthly'
        });
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

    if (isLoading) {
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
                    <motion.div className="mb-8 flex justify-between items-center" variants={itemVariants}>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Calendar</h1>
                            <p className="text-gray-600">Visualize and plan your cash flow over time</p>
                        </div>
                        <motion.button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedDate(new Date());
                                setShowEventModal(true);
                            }}
                        >
                            <span className="mr-2">➕</span>
                            Add Event
                        </motion.button>
                    </motion.div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                        >
                            {error}
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
                    </motion.div>

                    {/* Calendar */}
                    <motion.div variants={itemVariants}>
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
                    onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                    onSubmit={handleSubmit}
                    onDelete={handleDeleteClick}
                    isNew={!selectedEvent}
                    error={error}
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