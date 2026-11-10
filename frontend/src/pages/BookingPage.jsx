import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Car,
  ChevronRight,
  ArrowLeft,
  QrCode,
} from 'lucide-react';

export const BookingPage = () => {
  const { vehicleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultPickup = tomorrow.toISOString().slice(0, 10) + 'T10:00';

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  const defaultReturn = dayAfter.toISOString().slice(0, 10) + 'T10:00';

  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [returnLocationId, setReturnLocationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  // Execution state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const [vRes, lRes] = await Promise.all([
          api.get(`/vehicles/${vehicleId}`),
          api.get('/vehicles/locations'),
        ]);

        if (vRes.data.success) {
          setVehicle(vRes.data.vehicle);
          setPickupLocationId(vRes.data.vehicle.location_id);
          setReturnLocationId(vRes.data.vehicle.location_id);
        }
        if (lRes.data.success) setLocations(lRes.data.locations);
      } catch (err) {
        setError('Failed to load vehicle details for booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [vehicleId]);

  // Duration calculation
  const pDate = new Date(pickupDate);
  const rDate = new Date(returnDate);
  const diffTime = rDate.getTime() - pDate.getTime();
  const totalDays = diffTime > 0 ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 0;
  const dailyRate = vehicle ? Number(vehicle.rental_price_per_day) : 0;
  const totalAmount = totalDays * dailyRate;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (totalDays <= 0) {
      setError('Return date must be later than the pickup date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        vehicle_id: Number(vehicleId),
        pickup_location_id: Number(pickupLocationId),
        return_location_id: Number(returnLocationId),
        pickup_date: pickupDate.replace('T', ' ') + ':00',
        return_date: returnDate.replace('T', ' ') + ':00',
        payment_method: paymentMethod,
        notes: notes || 'Booked via customer portal',
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Transaction could not be completed. Check date availability.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Securing vehicle reservation lock...</p>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            MySQL Transaction Committed
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Booking Confirmed!</h2>
          <p className="text-sm text-slate-600 mt-1">
            Your vehicle has been successfully reserved with row-level transaction safety.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl text-left space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Booking Reference</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{bookingSuccess.booking_reference}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Reserved Vehicle</span>
            <span className="font-semibold text-slate-900">{bookingSuccess.vehicle}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Duration</span>
            <span className="font-semibold text-slate-900">{bookingSuccess.total_days} Days</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Total Tariff Paid</span>
            <span className="font-black text-emerald-600 text-base">₹{Number(bookingSuccess.total_amount).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-xs">
            <span className="text-slate-500">Transaction Reference</span>
            <span className="font-mono text-slate-700">{bookingSuccess.transaction_reference}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/customer/bookings"
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-500/20"
          >
            View in My Bookings
          </Link>
          <Link
            to="/vehicles"
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          >
            Explore More Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Complete Your Reservation</h1>
          <p className="text-xs text-slate-500">
            InnoDB ACID Row-Locking prevents any date collision during checkout
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Reservation Conflict or Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form fields */}
        <div className="md:col-span-2 space-y-6">
          {/* Vehicle Summary Card */}
          {vehicle && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-4">
              <img
                src={vehicle.image_url}
                alt={vehicle.model}
                className="w-24 h-16 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {vehicle.category_name}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Reg: {vehicle.registration_number}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Tariff</span>
                <span className="text-lg font-black text-slate-900">
                  ₹{Number(vehicle.rental_price_per_day).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">/ day</span>
              </div>
            </div>
          )}

          {/* Dates & Times Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span>Rental Duration & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">
                  Pickup Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">
                  Return Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Hub Locations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span>Pickup & Drop-off Hubs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">
                  Pickup Location *
                </label>
                <select
                  required
                  value={pickupLocationId}
                  onChange={(e) => setPickupLocationId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.city} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">
                  Return Location *
                </label>
                <select
                  required
                  value={returnLocationId}
                  onChange={(e) => setReturnLocationId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.city} - {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Simulated Payment Gateway Option */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" />
              <span>Payment Method (Simulated Gateway)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-center font-medium transition ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method === 'UPI' && <QrCode size={18} className="mx-auto mb-1 text-blue-600" />}
                  {method !== 'UPI' && <CreditCard size={18} className="mx-auto mb-1 text-slate-500" />}
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Price Breakdown & Instant Checkout */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5 sticky top-24">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Rental Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span className="font-semibold text-slate-900">₹{dailyRate.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Days:</span>
                <span className="font-semibold text-slate-900">{totalDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span>CGST & SGST (18%):</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Fastag Toll Pass:</span>
                <span className="text-emerald-600 font-semibold">Complimentary</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Payable</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || totalDays <= 0}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Committing Transaction...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200/60">
              <ShieldCheck size={14} className="inline mr-1 text-blue-600" />
              Protected by MySQL InnoDB Row Locks (<code className="text-blue-700">SELECT ... FOR UPDATE</code>) to guarantee zero double bookings.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
