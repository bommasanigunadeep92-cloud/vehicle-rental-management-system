import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Shield, CheckCircle, Ban, Phone, Mail, FileBadge } from 'lucide-react';

export const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customerId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await api.put(`/users/${customerId}/status`, { status: nextStatus });
      if (res.data.success) {
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Customer Accounts Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer registrations, driving license documentation, and account security controls
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Contact & License</th>
                <th className="py-3 px-4 font-semibold">City & Address</th>
                <th className="py-3 px-4 font-semibold">Rentals</th>
                <th className="py-3 px-4 font-semibold">Total Spent</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <p>{c.full_name}</p>
                    <p className="text-[11px] text-slate-500 font-normal">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <p>{c.phone || 'N/A'}</p>
                    <p className="text-[11px] font-mono text-slate-500">DL: {c.driving_license || 'Not submitted'}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {c.address || 'Karnataka, India'}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {c.total_rentals} Bookings
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    ₹{Number(c.total_spent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        c.status === 'Active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {c.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagementPage;
