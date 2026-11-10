import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import {
  Car,
  CalendarCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  Network,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cypherQuery, setCypherQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [bRes, gRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/graph/recommendations'),
        ]);

        if (bRes.data.success) {
          setRecentBookings(bRes.data.bookings.slice(0, 2));
        }
        if (gRes.data.success) {
          setRecommendations(gRes.data.recommendations);
          setCypherQuery(gRes.data.cypherQuery);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-3 inline-block">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Namaste, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Ready for your next journey? Browse our sanitized Indian fleet with zero security deposit and instant row-level booking confirmation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/vehicles"
              className="py-2.5 px-5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition"
            >
              Browse Available Cars
            </Link>
            <Link
              to="/customer/bookings"
              className="py-2.5 px-5 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Active & Recent Bookings Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck size={20} className="text-blue-600" />
            <span>Active & Recent Reservations</span>
          </h2>
          <Link
            to="/customer/bookings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Bookings</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500">No active bookings. Rent your first car now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                <img src={b.image_url} alt={b.model} className="w-20 h-16 object-cover rounded-xl shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{b.brand} {b.model}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {b.booking_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{b.pickup_location_name}</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">₹{Number(b.total_amount).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Neo4j Graph Recommendations Widget */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-6 sm:p-8 rounded-3xl border border-amber-200/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/40">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Network size={16} />
              <span>Neo4j Graph Database Recommendation Engine</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Personalized Vehicles for You
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Traversing multi-hop graph nodes: <code className="text-amber-700 font-mono">(:Customer)-[:CUSTOMER_INTERESTED_IN]-&gt;(:VehicleCategory)</code>
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shrink-0 self-start">
            Cypher Match Active
          </span>
        </div>

        {/* Live Cypher Query Code Snippet */}
        {cypherQuery && (
          <div className="bg-slate-900 p-3.5 rounded-2xl text-slate-300 text-xs font-mono overflow-x-auto shadow-inner">
            <p className="text-[10px] text-amber-400 font-bold uppercase mb-1">Executed Cypher Query:</p>
            <pre className="text-[11px] leading-relaxed">{cypherQuery.trim()}</pre>
          </div>
        )}

        {/* Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map((rec) => (
            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <img src={rec.image_url} alt={rec.model} className="w-full h-32 object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {rec.category_name}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{rec.brand} {rec.model}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">₹{Number(rec.rental_price_per_day).toLocaleString('en-IN')}/day</p>
                </div>
                <Link
                  to={`/vehicles/${rec.id}`}
                  className="mt-3 block text-center py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition"
                >
                  View Vehicle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
