const CalendarEvent = require('./calendarEvent.model');
const calendarEventService = require('./calendarEvent.service');

// Get all events for the logged-in user
exports.getEvents = async (req, res) => {
    try {
        // Optional date range filtering
        const { startDate, endDate } = req.query;
        const query = { userId: req.user.id };

        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const events = await CalendarEvent.find(query)
            .populate('category', 'name type')
            .populate('source', 'name');

        // Generate recurring event instances if needed
        if (startDate && endDate) {
            const allEvents = await calendarEventService.generateRecurringEvents(events, new Date(startDate), new Date(endDate));
            return res.json(allEvents);
        }

        res.json(events);
    } catch (error) {
        console.error('Error getting calendar events:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            amount,
            startDate,
            isRecurring,
            frequency,
            endDate,
            category,
            source
        } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!startDate || !Date.parse(startDate)) {
            return res.status(400).json({ message: 'Valid start date is required' });
        }

        if (isRecurring && (!frequency || frequency === 'once')) {
            return res.status(400).json({ message: 'Frequency is required for recurring events' });
        }

        const event = new CalendarEvent({
            title,
            description,
            type: type || 'expense',
            amount: parseFloat(amount || 0),
            startDate: new Date(startDate),
            isRecurring: isRecurring || false,
            frequency: isRecurring ? frequency : 'once',
            endDate: endDate ? new Date(endDate) : null,
            userId: req.user.id,
            category,
            source
        });

        const newEvent = await event.save();

        res.status(201).json(await newEvent.populate([
            { path: 'category', select: 'name type' },
            { path: 'source', select: 'name' }
        ]));
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            amount,
            startDate,
            isRecurring,
            frequency,
            endDate,
            isCompleted,
            category,
            source
        } = req.body;

        // Find the event first to check ownership
        const existingEvent = await CalendarEvent.findById(req.params.id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (existingEvent.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Build update object
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
        if (frequency !== undefined) updateData.frequency = frequency;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
        if (category !== undefined) updateData.category = category || null;
        if (source !== undefined) updateData.source = source || null;

        const event = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('category', 'name type')
            .populate('source', 'name');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        // Find the event first to check ownership
        const event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await CalendarEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ message: error.message });
    }
};
