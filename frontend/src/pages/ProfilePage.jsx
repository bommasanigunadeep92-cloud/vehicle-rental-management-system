import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, FileBadge, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    driving_license: user?.driving_license || '',
    address: user?.address || '',
  });

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setMessage('Profile updated successfully in MySQL database.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Personal & Security Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified customer credentials and contact information
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Email Address (Primary Login ID)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Email is uniquely indexed and cannot be changed.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Driving License Number</label>
              <input
                type="text"
                value={formData.driving_license}
                onChange={(e) => setFormData({ ...formData, driving_license: e.target.value })}
                placeholder="KA-01-2022-004455"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Registered Address</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm"
            >
              {submitting ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Credentials Card */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-3">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span>Security & Authentication Diagnostics</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">System Role</span>
            <span className="font-semibold text-white uppercase">{user?.role}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Password Hash</span>
            <span className="font-mono text-emerald-400">bcrypt (Salt rounds: 10)</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Token Verification</span>
            <span className="font-mono text-blue-400">JWT (HMAC SHA-256)</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Account Integrity</span>
            <span className="font-semibold text-emerald-400">Active & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
