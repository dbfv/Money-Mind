import React from 'react';
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
    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

        return (
            <div className="flex items-center justify-between mb-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onPrevMonth}
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
                    onClick={onNextMonth}
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

    const isSameDay = (day1, day2) => {
        return (
            day1.getDate() === day2.getDate() &&
            day1.getMonth() === day2.getMonth() &&
            day1.getFullYear() === day2.getFullYear()
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
                        className={`min-h-[90px] p-1 border border-gray-200 ${day.getMonth() !== monthStart.getMonth()
                            ? 'bg-gray-100 text-gray-400' // Dates from other months
                            : isSameDay(day, new Date())
                                ? 'bg-blue-50 border-blue-300' // Today
                                : 'bg-white'
                            }`}
                        onClick={() => onDateClick(cloneDay)}
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
                                        onEventClick(event);
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

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default Calendar; 