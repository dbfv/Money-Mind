import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import SourceForm from './components/SourceForm';
import SourceTable from './components/SourceTable';

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
        interestPeriod: 'Yearly',
        transferTime: '',
        category: '',
    });
    const [editingId, setEditingId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            setError('You must be logged in to manage sources. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        }
    }, [token, navigate]);

    const fetchSources = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/sources', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch sources');
            const data = await res.json();
            setSources(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSources(); }, [token]);

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
            const url = editingId ? `http://localhost:5000/api/sources/${editingId}` : 'http://localhost:5000/api/sources';
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
            if (!res.ok) throw new Error('Failed to save source');
            setForm({
                name: '',
                type: 'Bank Account',
                balance: '',
                status: 'Available',
                interestRate: '',
                interestPeriod: 'Yearly',
                transferTime: '',
                category: ''
            });
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
            interestPeriod: src.interestPeriod || 'Yearly',
            transferTime: src.transferTime,
            category: src.category,
        });
        setEditingId(src._id);
    };

    const handleDelete = async id => {
        if (!token) {
            setError('You must be logged in to perform this action.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this source?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/sources/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to delete source');
            }
            fetchSources();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({
            name: '',
            type: 'Bank Account',
            balance: '',
            status: 'Available',
            interestRate: '',
            interestPeriod: 'Yearly',
            transferTime: '',
            category: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16 px-4">
            <div className="max-w-3xl mx-auto py-8">
                <Header error={error} />
                <SourceForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    editingId={editingId}
                />
                <SourceTable
                    sources={sources}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default SourceManagementPage; 