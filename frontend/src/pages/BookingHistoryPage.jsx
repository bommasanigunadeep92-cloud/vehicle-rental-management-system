import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  CreditCard,
  FileText,
} from 'lucide-react';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will restore vehicle availability and initiate a full refund.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setMessage('Booking successfully cancelled and refunded.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Rental Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track past journeys, upcoming trips, and live rental statuses
          </p>
        </div>

        <Link
          to="/vehicles"
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-2 self-start"
        >
          <Car size={16} />
          <span>Rent Another Vehicle</span>
        </Link>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-32 animate-pulse"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
          <Car size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">No Bookings Yet</h3>
          <p className="text-xs text-slate-500 mb-4">You have not booked any vehicles yet. Explore our fleet today!</p>
          <Link
            to="/vehicles"
            className="py-2.5 px-5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Browse Available Fleet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">{b.booking_reference}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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
                </div>

                <div className="text-xs text-slate-500">
                  Booked on {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3 md:col-span-2">
                  <img
                    src={b.image_url}
                    alt={b.model}
                    className="w-20 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {b.brand} {b.model}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">Reg: {b.registration_number}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {b.pickup_location_name} → {b.return_location_name}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>From: {new Date(b.pickup_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>To: {new Date(b.return_date).toLocaleDateString()} ({b.total_days} Days)</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div>
                    <span className="text-xs text-slate-400 block sm:text-right">Total Tariff</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {['Confirmed', 'Pending'].includes(b.booking_status) && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;
