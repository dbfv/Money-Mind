import React, { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';
import { useNavigate } from 'react-router-dom';

const TypeManagementPage = () => {
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        name: '',
        type: 'expense',
    });
    const [editingId, setEditingId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            setError('You must be logged in to manage types. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        }
    }, [token, navigate]);

    const fetchTypes = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch types');
            const data = await res.json();
            setTypes(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTypes(); }, [token]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!token) {
            setError('You must be logged in to perform this action.');
            return;
        }
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `http://localhost:5000/api/types/${editingId}` : 'http://localhost:5000/api/types';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (res.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            if (!res.ok) throw new Error('Failed to save type');
            setForm({ name: '', type: 'expense' });
            setEditingId(null);
            fetchTypes();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleEdit = t => {
        setForm({
            name: t.name,
            type: t.type,
        });
        setEditingId(t._id);
    };

    const handleDelete = async (id) => {
        if (!token) {
            setError('You must be logged in to perform this action.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this type?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/types/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            if (!res.ok) throw new Error('Failed to delete type');
            fetchTypes();
        } catch (e) {
            setError(e.message);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 px-4">
                <div className="max-w-3xl mx-auto py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16 px-4">
            <div className="max-w-3xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Manage Types</h1>
                <form className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Type Name"
                            required
                            className="border p-2 rounded"
                        />
                        <Dropdown
                            label={null}
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            options={[
                                { value: 'expense', label: 'Expense' },
                                { value: 'income', label: 'Income' },
                            ]}
                            placeholder="Type"
                            className=""
                            required
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            {editingId ? 'Update' : 'Add'} Type
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setForm({ name: '', type: 'expense' });
                                }}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Name</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map(t => (
                                <tr key={t._id} className="border-t">
                                    <td className="p-2">{t.name}</td>
                                    <td className="p-2">{t.type}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TypeManagementPage; 