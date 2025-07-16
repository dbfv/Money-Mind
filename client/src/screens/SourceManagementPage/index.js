import React, { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';

const SourceManagementPage = () => {
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        name: '',
        type: 'Bank Account',
        balance: '',
        status: 'Available',
        interestRate: '',
        transferTime: '',
        category: '',
    });
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem('token');

    const fetchSources = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/sources', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch sources');
            const data = await res.json();
            setSources(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSources(); }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `http://localhost:5000/api/sources/${editingId}` : 'http://localhost:5000/api/sources';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error('Failed to save source');
            setForm({ name: '', type: 'Bank Account', balance: '', status: 'Available', interestRate: '', transferTime: '', category: '' });
            setEditingId(null);
            fetchSources();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleEdit = src => {
        setForm({
            name: src.name,
            type: src.type,
            balance: src.balance,
            status: src.status,
            interestRate: src.interestRate,
            transferTime: src.transferTime,
            category: src.category,
        });
        setEditingId(src._id);
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this source?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/sources/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete source');
            fetchSources();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16 px-4">
            <div className="max-w-3xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Manage Money Sources</h1>
                <form className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Source Name" required className="border p-2 rounded" />
                        <Dropdown
                            label={null}
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            options={[
                                { value: 'Bank Account', label: 'Bank Account' },
                                { value: 'E-Wallet', label: 'E-Wallet' },
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Other', label: 'Other' },
                            ]}
                            placeholder="Type"
                            className=""
                            required
                        />
                        <input name="balance" value={form.balance} onChange={handleChange} placeholder="Amount" type="number" min="0" className="border p-2 rounded" />
                        <Dropdown
                            label={null}
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            options={[
                                { value: 'Available', label: 'Available' },
                                { value: 'Locked', label: 'Locked' },
                                { value: 'Not Available', label: 'Not Available' },
                            ]}
                            placeholder="Status"
                            className=""
                            required
                        />
                        <input name="interestRate" value={form.interestRate} onChange={handleChange} placeholder="Interest Rate (%)" type="number" min="0" step="0.01" className="border p-2 rounded" />
                        <input name="transferTime" value={form.transferTime} onChange={handleChange} placeholder="Transfer Wait Time (label)" className="border p-2 rounded" />
                        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border p-2 rounded" />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">{editingId ? 'Update' : 'Add'} Source</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', type: 'Bank Account', balance: '', status: 'Available', interestRate: '', transferTime: '', category: '' }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
                    </div>
                </form>
                {isLoading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
                    <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Name</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Interest</th>
                                <th className="p-2">Wait Time</th>
                                <th className="p-2">Category</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map(src => (
                                <tr key={src._id} className="border-t">
                                    <td className="p-2">{src.name}</td>
                                    <td className="p-2">{src.type}</td>
                                    <td className="p-2">${src.balance}</td>
                                    <td className="p-2">{src.status}</td>
                                    <td className="p-2">{src.interestRate}%</td>
                                    <td className="p-2">{src.transferTime}</td>
                                    <td className="p-2">{src.category}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleEdit(src)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(src._id)} className="text-red-600 hover:underline">Delete</button>
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

export default SourceManagementPage; 