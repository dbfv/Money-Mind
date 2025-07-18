import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import NavigationBar from '../../components/NavigationBar';
import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';

const FinancialCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense',
        description: ''
    });
    const [newEvent, setNewEvent] = useState({
        title: '',
        amount: '',
        type: 'expense', // or 'income'
        date: '',
        description: ''
    });

    useEffect(() => {
        fetchEvents();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/types', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/calendarEvents');
            const data = await response.json();

            // Transform events for FullCalendar
            const formattedEvents = data.map(event => ({
                id: event._id,
                title: `${event.title}: $${event.amount}`,
                start: event.date,
                backgroundColor: event.type === 'income' ? '#34D399' : '#EF4444',
                borderColor: event.type === 'predicted' ? '#6B7280' : undefined,
                textColor: '#ffffff',
                extendedProps: {
                    description: event.description,
                    type: event.type,
                    amount: event.amount
                }
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleDateClick = (arg) => {
        setSelectedDate(arg.date);
        setNewEvent(prev => ({ ...prev, date: arg.dateStr }));
        setIsModalOpen(true);
    };

    const handleEventClick = (arg) => {
        setSelectedEvent(arg.event);
        setIsModalOpen(true);
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/calendarEvents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent)
            });

            if (response.ok) {
                fetchEvents(); // Refresh events
                setIsModalOpen(false);
                setNewEvent({
                    title: '',
                    amount: '',
                    type: 'expense',
                    date: '',
                    description: ''
                });
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <NavigationBar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Financial Calendar
                    </h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                        >
                            <TagIcon className="h-5 w-5 mr-2" />
                            Manage Categories
                        </button>
                        <button
                            onClick={() => {
                                setSelectedEvent(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Event
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 backdrop-blur-sm bg-white/90">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth'
                        }}
                        buttonClassNames="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded px-3 py-1 hover:from-blue-700 hover:to-indigo-700"
                        dayCellClassNames="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                        eventClassNames="rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                        titleFormat={{ month: 'long', year: 'numeric' }}
                        dayHeaderClassNames="text-gray-600 uppercase text-sm font-semibold"
                    />
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    className="fixed inset-0 flex items-center justify-center"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                >
                    <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100 opacity-100">
                        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {selectedEvent ? 'Event Details' : 'Add New Event'}
                        </h2>

                        {selectedEvent ? (
                            <div>
                                <p className="mb-2"><strong>Title:</strong> {selectedEvent.title}</p>
                                <p className="mb-2"><strong>Type:</strong> {selectedEvent.extendedProps.type}</p>
                                <p className="mb-2"><strong>Amount:</strong> ${selectedEvent.extendedProps.amount}</p>
                                <p className="mb-2"><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</p>
                                {selectedEvent.extendedProps.description && (
                                    <p className="mb-4"><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAddEvent}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Type</label>
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                        <option value="predicted">Predicted</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={newEvent.amount}
                                        onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                        rows="3"
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </Modal>

                {/* Category Management Modal */}
                <Modal
                    isOpen={isCategoryModalOpen}
                    onRequestClose={() => setIsCategoryModalOpen(false)}
                    className="fixed inset-0 flex items-center justify-center"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                >
                    <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-xl transform transition-all duration-300 scale-100 opacity-100">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Manage Categories
                        </h2>

                        {/* Add Category Form */}
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const token = localStorage.getItem('token');
                                const response = await fetch('http://localhost:5000/api/types', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify(newCategory)
                                });

                                if (!response.ok) throw new Error('Failed to add category');

                                fetchCategories();
                                setNewCategory({
                                    name: '',
                                    type: 'expense',
                                    description: ''
                                });
                            } catch (err) {
                                console.error('Error adding category:', err);
                            }
                        }} className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Type</label>
                                    <select
                                        value={newCategory.type}
                                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                                >
                                    Add Category
                                </button>
                            </div>
                        </form>

                        {/* Categories List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {categories.map(category => (
                                <div
                                    key={category._id}
                                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Type: {category.type}
                                            </p>
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    const response = await fetch(`http://localhost:5000/api/types/${category._id}`, {
                                                        method: 'DELETE',
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`
                                                        }
                                                    });

                                                    if (!response.ok) throw new Error('Failed to delete category');

                                                    fetchCategories();
                                                } catch (err) {
                                                    console.error('Error deleting category:', err);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default FinancialCalendarPage;
