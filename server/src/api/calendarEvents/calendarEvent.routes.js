const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} = require('./calendarEvent.controller');

// All routes require authentication
router.use(auth);

// Get all events for the logged-in user
router.get('/', getEvents);

// Create a new event
router.post('/', createEvent);

// Update an event
router.put('/:id', updateEvent);

// Delete an event
router.delete('/:id', deleteEvent);

module.exports = router;
