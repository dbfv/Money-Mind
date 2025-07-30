// Custom event emitter for application-wide events
const EventEmitter = {
    // Event listeners storage
    _events: {},

    // Subscribe to an event
    on(event, callback) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);

        // Return unsubscribe function
        return () => {
            this._events[event] = this._events[event].filter(cb => cb !== callback);
        };
    },

    // Emit an event with data
    emit(event, data) {
        if (this._events[event]) {
            this._events[event].forEach(callback => {
                callback(data);
            });
        }
    }
};

// Application events
export const APP_EVENTS = {
    AVATAR_UPDATED: 'avatar_updated',
};

export default EventEmitter; 