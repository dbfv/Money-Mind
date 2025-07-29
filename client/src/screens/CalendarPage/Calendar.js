import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Calendar = ({
    currentMonth,
    selectedDate,
    events,
    eventColors,
    onDateClick,
    onEventClick,
    onNextMonth,
    onPrevMonth
}) => {
    const [hoveredDate, setHoveredDate] = useState(null);

    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

        return (
            <div className="flex items-center justify-between mb-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onPrevMonth}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Previous month"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.button>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {dateFormat.format(currentMonth)}
                </h2>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onNextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
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

    const isSameDay = (day1, day2) => {
        return (
            day1.getDate() === day2.getDate() &&
            day1.getMonth() === day2.getMonth() &&
            day1.getFullYear() === day2.getFullYear()
        );
    };

    const isToday = (day) => {
        const today = new Date();
        return isSameDay(day, today);
    };

    // Helper to calculate transaction totals for a specific day
    const calculateDayTotals = (dayEvents) => {
        let income = 0;
        let expenses = 0;

        dayEvents.forEach(event => {
            if (!event.amount) return;

            const amount = parseFloat(event.amount);
            if (isNaN(amount)) return;

            if (event.type === 'income') {
                income += amount;
            } else if (event.type === 'expense') {
                expenses += amount;
            }
        });

        const totalAmount = income - expenses;

        return {
            totalAmount,
            hasTransactions: income > 0 || expenses > 0
        };
    };

    // Helper to render event markers
    const renderEventMarkers = (dayEvents) => {
        // Filter out transaction events from visual display
        const eventsToShow = dayEvents.filter(event => !event.isTransaction);

        // For events, determine styling based on type
        const getEventStyle = (event) => {
            const eventType = event.type || 'reminder';
            const borderColor = eventColors[eventType] || '#9CA3AF';
            const bgColor = `bg-${eventType === 'expense' ? 'red' : eventType === 'income' ? 'green' : eventType === 'reminder' ? 'blue' : 'purple'}-50`;

            return { borderColor, bgColor };
        };

        if (eventsToShow.length === 0) return null;

        return (
            <div className="space-y-1 max-h-[55px] overflow-y-auto hide-scrollbar">
                {eventsToShow.slice(0, 2).map(event => {
                    const eventStyle = getEventStyle(event);
                    return (
                        <div
                            key={event._id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                            }}
                            className={`text-xs rounded-sm px-1 truncate cursor-pointer ${eventStyle.bgColor}`}
                            style={{ borderLeft: `3px solid ${eventStyle.borderColor}` }}
                        >
                            {event.title}
                        </div>
                    );
                })}
                {eventsToShow.length > 2 && (
                    <div className="text-xs text-center text-gray-500">
                        +{eventsToShow.length - 2} more
                    </div>
                )}
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

        // Create 6 rows to ensure we capture all days
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                const cloneDay = new Date(day);
                const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                const dateKey = day.toISOString().split('T')[0];

                // Get events for this day
                const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.startDate || event.date);
                    return isSameDay(eventDate, day);
                });

                // Calculate transaction totals
                const totals = calculateDayTotals(dayEvents);

                days.push(
                    <motion.div
                        key={dateKey}
                        className={`relative min-h-[100px] md:min-h-[120px] p-1 border rounded-lg flex flex-col ${isCurrentMonth
                            ? 'bg-white border-gray-200'
                            : 'bg-gray-50 border-gray-100 text-gray-400'
                            } ${isToday(day) ? 'border-blue-300 ring-1 ring-blue-300' : ''}
                        ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}
                        ${hoveredDate === dateKey ? 'shadow-md' : ''}`}
                        onClick={() => onDateClick(cloneDay)}
                        onMouseEnter={() => setHoveredDate(dateKey)}
                        onMouseLeave={() => setHoveredDate(null)}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="flex justify-between items-center mb-1 p-1">
                            <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                                } ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                                {day.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded-md">
                                    {dayEvents.length}
                                </span>
                            )}
                        </div>

                        {/* Event markers for this day */}
                        {renderEventMarkers(dayEvents)}

                        {/* Transaction summary - positioned at bottom of card */}
                        {totals.hasTransactions && (
                            <div className="mt-auto pt-1 border-t border-gray-200 w-full">
                                <div className="text-center text-sm font-medium">
                                    {totals.totalAmount < 0 ?
                                        <span className="text-red-600">-${Math.abs(totals.totalAmount).toFixed(2)}</span> :
                                        <span className="text-green-600">+${totals.totalAmount.toFixed(2)}</span>
                                    }
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

                day = new Date(day);
                day.setDate(day.getDate() + 1);
            }

            rows.push(
                <div key={`row-${i}`} className="grid grid-cols-7 gap-1 mb-1">
                    {days}
                </div>
            );

            days = [];
        }

        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {/* Add CSS to hide scrollbars but keep functionality */}
            <style jsx="true">{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    overflow-x: hidden;
                }
            `}</style>
        </div>
    );
};

export default Calendar; 