import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import {
  Car,
  Search,
  Calendar,
  MapPin,
  ShieldCheck,
  Zap,
  Database,
  Network,
  Server,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, cRes, lRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/vehicles/categories'),
          api.get('/vehicles/locations'),
        ]);

        if (vRes.data.success) setVehicles(vRes.data.vehicles.slice(0, 6));
        if (cRes.data.success) setCategories(cRes.data.categories);
        if (lRes.data.success) setLocations(lRes.data.locations);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedLocation) params.append('location', selectedLocation);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles size={14} />
            <span>Next-Generation Fleet Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Premium Indian Car Rentals,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Engineered with Multi-DB Power
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Experience seamless vehicle bookings powered by MySQL 8.0 transactions, MongoDB flexible specs, Redis cache-aside speed, and Neo4j graph recommendations.
          </p>

          {/* Quick Search Floating Box */}
          <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl text-slate-800 border border-white/20">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Search Model or Brand</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Creta, Thar, EV"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Vehicle Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pickup City</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.city} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <Search size={15} />
                  <span>Find Available Cars</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Fleet Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Car size={16} />
              <span>Elite Fleet Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Vehicles Ready for Instant Booking
            </h2>
          </div>
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Fleet ({vehicles.length}+)</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-100 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      {/* Database Architecture Showcase Section */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
              Engineering Excellence
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">
              Why 4 Specialized Databases Power This System
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Each database engine is selected for its distinct computational characteristics, providing high transaction safety, schema flexibility, low latency, and graph insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* MySQL */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">1. MySQL 8.0+</h3>
              <p className="text-xs text-blue-400 font-mono mb-2">InnoDB Engine</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Manages strict ACID transactions, foreign keys, row-level locking (<code className="text-blue-300">FOR UPDATE</code>), preventing double bookings, and maintaining normalized relational records.
              </p>
            </div>

            {/* MongoDB */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Server size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">2. MongoDB</h3>
              <p className="text-xs text-emerald-400 font-mono mb-2">Flexible Document Model</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stores polymorphic vehicle specifications, battery chemistry, accessory packages, rental contracts, and streams real-time user activity logs.
              </p>
            </div>

            {/* Redis */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-red-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">3. Redis 7.x</h3>
              <p className="text-xs text-red-400 font-mono mb-2">In-Memory Cache-Aside</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accelerates vehicle search queries and detail views with TTL expiration and automatic invalidation whenever bookings or vehicles update.
              </p>
            </div>

            {/* Neo4j */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Network size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">4. Neo4j Graph</h3>
              <p className="text-xs text-amber-400 font-mono mb-2">Cypher Query Engine</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traverses multi-hop customer rental relationships (<code className="text-amber-300">CUSTOMER_BOOKED</code>, <code className="text-amber-300">BELONGS_TO</code>) to compute personalized category recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Effortless Rental in 4 Simple Steps</h2>
          <p className="text-slate-600 text-sm mt-2">Transparent pricing, zero hidden charges, and instant verification.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Choose Vehicle</h3>
            <p className="text-xs text-slate-500">Pick from our sanitized hatchbacks, sedans, SUVs, or luxury fleet.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Select Dates & Hub</h3>
            <p className="text-xs text-slate-500">Choose pickup & drop-off locations across Bangalore, Mumbai, or Hyderabad.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Instant Payment</h3>
            <p className="text-xs text-slate-500">Simulate UPI, Card, or Net Banking with automated transaction locking.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Drive Away</h3>
            <p className="text-xs text-slate-500">Contactless handover with pre-installed Fastag and 24/7 roadside assistance.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
