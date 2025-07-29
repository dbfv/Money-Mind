/**
 * Calendar Event Service
 * Handles recurring event generation and other calendar-related business logic
 */

/**
 * Generate all recurring event instances for a given date range
 * @param {Array} events - Array of calendar events
 * @param {Date} startDate - Start date of the range
 * @param {Date} endDate - End date of the range
 * @returns {Array} - Array of all events including recurring instances
 */
exports.generateRecurringEvents = async (events, startDate, endDate) => {
    let allEvents = [];

    for (const event of events) {
        // Add the original event if it falls within the range
        if (event.startDate >= startDate && event.startDate <= endDate) {
            allEvents.push(event);
        }

        // Generate instances for recurring events
        if (event.isRecurring) {
            const instances = generateRecurringInstances(event, startDate, endDate);
            allEvents = [...allEvents, ...instances];
        }
    }

    return allEvents;
};

/**
 * Generate instances of a recurring event within a date range
 * @param {Object} event - Calendar event
 * @param {Date} rangeStart - Start date of the range
 * @param {Date} rangeEnd - End date of the range
 * @returns {Array} - Array of event instances
 */
function generateRecurringInstances(event, rangeStart, rangeEnd) {
    const instances = [];
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : null;

    // Don't generate instances if the event starts after the range end
    if (eventStart > rangeEnd) {
        return instances;
    }

    // Don't generate instances if the event ends before the range start
    if (eventEnd && eventEnd < rangeStart) {
        return instances;
    }

    let currentDate = new Date(eventStart);

    // Adjust start date to be within range if needed
    if (currentDate < rangeStart) {
        currentDate = advanceToRangeStart(currentDate, rangeStart, event.frequency);
    }

    // Generate instances until we reach range end or event end
    while (currentDate <= rangeEnd && (!eventEnd || currentDate <= eventEnd)) {
        // Skip the original event instance
        if (currentDate.getTime() !== eventStart.getTime()) {
            const instance = {
                ...event.toObject(),
                id: `${event._id}_${currentDate.getTime()}`,
                startDate: new Date(currentDate),
                isRecurringInstance: true
            };
            instances.push(instance);
        }

        // Advance to next occurrence
        currentDate = getNextOccurrence(currentDate, event.frequency);
    }

    return instances;
}

/**
 * Advance a date to the next occurrence based on frequency
 * @param {Date} date - Current date
 * @param {String} frequency - Frequency type
 * @returns {Date} - Next occurrence date
 */
function getNextOccurrence(date, frequency) {
    const nextDate = new Date(date);

    switch (frequency) {
        case 'daily':
            nextDate.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            nextDate.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            nextDate.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            nextDate.setMonth(date.getMonth() + 3);
            break;
        case 'annually':
            nextDate.setFullYear(date.getFullYear() + 1);
            break;
        default:
            break;
    }

    return nextDate;
}

/**
 * Advance a date to be within the range start based on frequency
 * @param {Date} eventStart - Event start date
 * @param {Date} rangeStart - Range start date
 * @param {String} frequency - Frequency type
 * @returns {Date} - Adjusted date within range
 */
function advanceToRangeStart(eventStart, rangeStart, frequency) {
    let currentDate = new Date(eventStart);

    // Find the first occurrence that falls within or after the range start
    while (currentDate < rangeStart) {
        currentDate = getNextOccurrence(currentDate, frequency);
    }

    return currentDate;
} 