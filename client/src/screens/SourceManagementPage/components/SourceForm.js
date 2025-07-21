import React from 'react';
import Dropdown from '../../../components/Dropdown';

const SourceForm = ({ form, onChange, onSubmit, onCancel, editingId }) => {
    return (
        <form className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 gap-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Source Name"
                    required
                    className="border p-2 rounded"
                />
                <Dropdown
                    label={null}
                    name="type"
                    value={form.type}
                    onChange={onChange}
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
                <input
                    name="balance"
                    value={form.balance}
                    onChange={onChange}
                    placeholder="Amount"
                    type="number"
                    min="0"
                    className="border p-2 rounded"
                />
                <Dropdown
                    label={null}
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    options={[
                        { value: 'Available', label: 'Available' },
                        { value: 'Locked', label: 'Locked' },
                        { value: 'Not Available', label: 'Not Available' },
                    ]}
                    placeholder="Status"
                    className=""
                    required
                />
                <div className="flex gap-2">
                    <input
                        name="interestRate"
                        value={form.interestRate}
                        onChange={onChange}
                        placeholder="Interest Rate (%)"
                        type="number"
                        min="0"
                        step="0.01"
                        className="border p-2 rounded flex-1"
                    />
                    <Dropdown
                        label={null}
                        name="interestPeriod"
                        value={form.interestPeriod}
                        onChange={onChange}
                        options={[
                            { value: 'Daily', label: 'Daily' },
                            { value: 'Weekly', label: 'Weekly' },
                            { value: 'Monthly', label: 'Monthly' },
                            { value: 'Yearly', label: 'Yearly' },
                        ]}
                        placeholder="Period"
                        className="w-28"
                        required
                    />
                </div>
                <input
                    name="transferTime"
                    value={form.transferTime}
                    onChange={onChange}
                    placeholder="Transfer Wait Time (label)"
                    className="border p-2 rounded"
                />
                <input
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    placeholder="Category"
                    className="border p-2 rounded"
                />
            </div>
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    {editingId ? 'Update' : 'Add'} Source
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default SourceForm; 