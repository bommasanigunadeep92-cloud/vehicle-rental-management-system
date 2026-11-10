import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Car,
  CalendarCheck,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, vRes] = await Promise.all([api.get('/bookings'), api.get('/vehicles')]);
      if (bRes.data.success) setBookings(bRes.data.bookings);
      if (vRes.data.success) setVehicles(vRes.data.vehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Fleet Operations Hub
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Rental Fleet Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, vehicle return inspection, active handover control, and maintenance monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/vehicles"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Manage Fleet Inventory
          </Link>
        </div>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Upcoming Handover Pickups</p>
            <p className="text-2xl font-black text-slate-900">
              {bookings.filter((b) => b.booking_status === 'Confirmed').length}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Car size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Vehicles Currently on Road</p>
            <p className="text-2xl font-black text-emerald-600">
              {bookings.filter((b) => b.booking_status === 'Active').length}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Fleet Under Maintenance</p>
            <p className="text-2xl font-black text-amber-600">
              {vehicles.filter((v) => v.availability_status === 'Maintenance').length}
            </p>
          </div>
        </div>
      </div>

      {/* Active Dispatch & Handover Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Booking Approvals, Handover & Return Actions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Booking Ref</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Vehicle</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Current Status</th>
                <th className="pb-3 font-semibold text-right">Action Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.slice(0, 10).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono font-bold text-slate-900">{b.booking_reference}</td>
                  <td className="py-3">
                    <p className="font-semibold text-slate-800">{b.customer_name}</p>
                    <p className="text-[11px] text-slate-500">{b.customer_phone}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-semibold text-slate-800">{b.brand} {b.model}</p>
                    <p className="text-[11px] font-mono text-slate-500">{b.registration_number}</p>
                  </td>
                  <td className="py-3 text-slate-600">
                    {new Date(b.pickup_date).toLocaleDateString()} → {new Date(b.return_date).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.booking_status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : b.booking_status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : b.booking_status === 'Completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-1.5">
                    {b.booking_status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'Active')}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition"
                      >
                        Handover (Mark Active)
                      </button>
                    )}
                    {b.booking_status === 'Active' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'Completed')}
                        className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] transition"
                      >
                        Return (Complete)
                      </button>
                    )}
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

export default ManagerDashboard;
