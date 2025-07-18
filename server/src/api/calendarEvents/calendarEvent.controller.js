const CalendarEvent = require('./calendarEvent.model');

// Get all events for the logged-in user
exports.getEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find({ userId: req.user.id });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, type, amount, date, description } = req.body;
        const event = new CalendarEvent({
            title,
            type,
            amount,
            date,
            description,
            userId: req.user.id
        });
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const { title, type, amount, date, description } = req.body;
        const event = await CalendarEvent.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, type, amount, date, description },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
