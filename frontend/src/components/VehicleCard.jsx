import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Users, Gauge, Star, ShieldCheck } from 'lucide-react';

export const VehicleCard = ({ vehicle }) => {
  const isAvailable = vehicle.availability_status === 'Available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          {vehicle.category_name || 'Premium'}
        </span>

        {/* Status Pill */}
        <span
          className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${
            vehicle.availability_status === 'Available'
              ? 'bg-emerald-500 text-white'
              : vehicle.availability_status === 'Booked'
              ? 'bg-blue-600 text-white'
              : vehicle.availability_status === 'Maintenance'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-white'
          }`}
        >
          {vehicle.availability_status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
              {vehicle.brand} {vehicle.model}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
              <Star size={13} fill="currentColor" />
              <span>{parseFloat(vehicle.average_rating || 4.8).toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-3 font-mono">
            Reg: {vehicle.registration_number} • {vehicle.manufacturing_year}
          </p>

          {/* Quick Specifications */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <Fuel size={14} className="text-slate-400" />
              <span className="truncate">{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={14} className="text-slate-400" />
              <span className="truncate">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              <span>{vehicle.seating_capacity} Seats</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Daily Tariff</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{Number(vehicle.rental_price_per_day).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">/ day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              Details
            </Link>
            {isAvailable ? (
              <Link
                to={`/book/${vehicle.id}`}
                className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition"
              >
                Rent Now
              </Link>
            ) : (
              <button
                disabled
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
