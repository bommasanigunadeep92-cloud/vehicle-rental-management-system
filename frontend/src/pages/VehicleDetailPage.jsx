import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Car,
  Fuel,
  Gauge,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  ShieldCheck,
  Server,
  Database,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        if (res.data.success) {
          setVehicle(res.data.vehicle);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Vehicle not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading vehicle specifications...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'The requested vehicle does not exist.'}</p>
        <Link to="/vehicles" className="py-2.5 px-5 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          <span>Back to Fleet</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Reg: {vehicle.registration_number}</span>
          <span className="text-slate-300">|</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              vehicle.availability_status === 'Available'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {vehicle.availability_status}
          </span>
        </div>
      </div>

      {/* Main Grid: Photo Hero + Booking Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Vehicle Image & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
            <img
              src={vehicle.image_url}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <span className="px-3 py-1 rounded-lg bg-blue-600 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                {vehicle.category_name}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {vehicle.manufacturing_year} Model • {vehicle.mileage || 'Certified Efficiency'}
              </p>
            </div>
          </div>

          {/* Core Specs Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="text-slate-400 mb-1"><Fuel size={18} /></div>
              <p className="text-xs text-slate-500">Fuel Type</p>
              <p className="text-sm font-bold text-slate-900">{vehicle.fuel_type}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="text-slate-400 mb-1"><Gauge size={18} /></div>
              <p className="text-xs text-slate-500">Transmission</p>
              <p className="text-sm font-bold text-slate-900">{vehicle.transmission}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="text-slate-400 mb-1"><Users size={18} /></div>
              <p className="text-xs text-slate-500">Seating</p>
              <p className="text-sm font-bold text-slate-900">{vehicle.seating_capacity} Adults</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="text-amber-500 mb-1"><Star size={18} fill="currentColor" /></div>
              <p className="text-xs text-slate-500">Fleet Rating</p>
              <p className="text-sm font-bold text-slate-900">
                {parseFloat(vehicle.average_rating || 4.8).toFixed(1)} / 5.0
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-2">Vehicle Overview</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{vehicle.description}</p>
          </div>

          {/* MongoDB Flexible Specifications Component */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Advanced Specifications</h3>
                <p className="text-xs text-slate-500">Dynamic attributes managed in MongoDB NoSQL Document Store</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Server size={14} /> MongoDB Store
              </span>
            </div>

            {/* Specifications Map */}
            {vehicle.specifications && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(vehicle.specifications).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 capitalize block text-[11px] font-medium">{key.replace(/_/g, ' ')}</span>
                    <span className="text-slate-800 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Features Checklist */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Key Cabin Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {vehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accessories Checklist */}
            {vehicle.accessories_included && vehicle.accessories_included.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Included Travel Kit</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.accessories_included.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Booking Card & Hub Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 sticky top-24">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Daily Rental Tariff</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  ₹{Number(vehicle.rental_price_per_day).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500">/ day (incl. taxes)</span>
              </div>
            </div>

            {/* Location Hub Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{vehicle.location_name}</p>
                  <p className="text-slate-500 mt-0.5">{vehicle.location_address}</p>
                  <p className="text-blue-600 font-medium mt-1">Contact: {vehicle.location_contact}</p>
                </div>
              </div>
            </div>

            {/* Booking CTA Button */}
            {vehicle.availability_status === 'Available' ? (
              <Link
                to={`/book/${vehicle.id}`}
                className="w-full block text-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition"
              >
                Proceed to Reservation
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3.5 px-4 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed"
              >
                Currently {vehicle.availability_status}
              </button>
            )}

            {/* Trust Assurances */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Zero Security Deposit via Aadhaar & DL verification</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>ACID Row-Lock Safe (No double booking guarantee)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
