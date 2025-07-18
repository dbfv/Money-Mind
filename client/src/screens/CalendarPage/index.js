import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../../components/Dropdown';

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

    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
        
        return (
            <div className="flex items-center justify-between mb-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <span className="text-xl">←</span>
                </motion.button>
                <h2 className="text-xl font-semibold text-gray-800">
                    {dateFormat.format(currentMonth)}
                </h2>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <span className="text-xl">→</span>
                </motion.button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day, i) => (
                    <div key={i} className="py-2 text-center text-sm font-medium text-gray-600">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        const startDay = startDate.getDay();
        
        // Adjust to start from the first day of week (Sunday)
        startDate.setDate(startDate.getDate() - startDay);
        
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';
        
        // Create 6 rows to ensure we capture all days
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                formattedDate = day.getDate();
                
                const cloneDay = new Date(day);
                const dayEvents = events.filter(event => 
                    event.date.getDate() === day.getDate() &&
                    event.date.getMonth() === day.getMonth() &&
                    event.date.getFullYear() === day.getFullYear()
                );
                
                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[90px] p-1 border border-gray-200 ${
                            day.getMonth() !== monthStart.getMonth()
                                ? 'bg-gray-100 text-gray-400' // Dates from other months
                                : isSameDay(day, new Date())
                                ? 'bg-blue-50 border-blue-300' // Today
                                : 'bg-white'
                        }`}
                        onClick={() => handleDateClick(cloneDay)}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm ${isSameDay(day, selectedDate) ? 'font-bold bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {dayEvents.map((event, idx) => (
                                <div 
                                    key={idx} 
                                    className="text-xs truncate p-1 rounded cursor-pointer"
                                    style={{ backgroundColor: `${eventColors[event.type]}20`, color: eventColors[event.type] }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventClick(event);
                                    }}
                                >
                                    {event.title} {event.amount ? `($${event.amount})` : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                
                day = new Date(day);
                day.setDate(day.getDate() + 1);
            }
            
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            
            days = [];
        }
        
        return <div className="space-y-1">{rows}</div>;
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const isSameDay = (day1, day2) => {
        return (
            day1.getDate() === day2.getDate() &&
            day1.getMonth() === day2.getMonth() &&
            day1.getFullYear() === day2.getFullYear()
        );
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

    const handleDelete = () => {
        if (!selectedEvent) {
            closeModal();
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this event?')) {
            // API call would go here

            // For now, update UI
            setEvents(events.filter(event => event.id !== selectedEvent.id));
            closeModal();
        }
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

    const modalVariants = {
        hidden: {
            y: -50,
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        exit: {
            y: 50,
            opacity: 0,
            transition: {
                duration: 0.3
            }
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
                    <motion.div 
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                        variants={itemVariants}
                    >
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </motion.div>
                </motion.div>
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {selectedEvent ? 'Edit Event' : 'Add New Event'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={selectedEvent ? selectedEvent.title : newEvent.title}
                                    onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                    placeholder="e.g. Rent Payment, Salary, etc."
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Dropdown
                                        label="Type"
                                        name="type"
                                        value={selectedEvent ? selectedEvent.type : newEvent.type}
                                        onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                        options={typeOptions}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={selectedEvent ? selectedEvent.amount : newEvent.amount}
                                        onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={selectedEvent ? selectedEvent.date : newEvent.date}
                                    onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                    required
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    name="recurring"
                                    checked={selectedEvent ? selectedEvent.recurring : newEvent.recurring}
                                    onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                                    Recurring Event
                                </label>
                            </div>
                            
                            {(selectedEvent?.recurring || newEvent.recurring) && (
                                <div>
                                    <Dropdown
                                        label="Frequency"
                                        name="frequency"
                                        value={selectedEvent ? selectedEvent.frequency : newEvent.frequency}
                                        onChange={selectedEvent ? handleSelectedEventChange : handleInputChange}
                                        options={frequencyOptions}
                                    />
                                </div>
                            )}
                            
                            <div className="flex justify-between pt-4">
                                <div>
                                    {selectedEvent && (
                                        <motion.button
                                            type="button"
                                            onClick={handleDelete}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            Delete
                                        </motion.button>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <motion.button
                                        type="button"
                                        onClick={closeModal}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                    >
                                        Save
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage; 