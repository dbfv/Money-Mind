const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} = require('./calendarEvent.controller');

// Define calendar event routes
const calendarEventRoutes = (app) => {
    // Base route
    app.route('/api/calendar-events')
        .get(auth, getEvents)
        .post(auth, createEvent);

    // Routes with parameters
    app.route('/api/calendar-events/:id')
        .put(auth, updateEvent)
        .delete(auth, deleteEvent);
};

module.exports = calendarEventRoutes;
