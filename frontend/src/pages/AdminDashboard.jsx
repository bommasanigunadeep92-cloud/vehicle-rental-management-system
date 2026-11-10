import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Car,
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Database,
  Zap,
  BarChart2,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Computing SQL Aggregations & Analytics...</p>
      </div>
    );
  }

  const kpi = analytics?.kpi || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            System Administration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MySQL aggregation metrics, fleet capacity, and financial revenue streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/vehicles"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Manage Fleet
          </Link>
          <Link
            to="/admin/customers"
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Manage Customers
          </Link>
        </div>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <CreditCard size={18} />
          </div>
          <p className="text-xs text-slate-500">Total Revenue</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            ₹{Number(kpi.total_revenue || 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Car size={18} />
          </div>
          <p className="text-xs text-slate-500">Fleet Size</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{kpi.total_vehicles || 0} Cars</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-xs text-slate-500">Available Cars</p>
          <p className="text-lg font-black text-emerald-600 mt-0.5">{kpi.available_vehicles || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users size={18} />
          </div>
          <p className="text-xs text-slate-500">Customers</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{kpi.total_customers || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <CalendarCheck size={18} />
          </div>
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{kpi.total_bookings || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Activity size={18} />
          </div>
          <p className="text-xs text-slate-500">Active Rentals</p>
          <p className="text-lg font-black text-indigo-600 mt-0.5">{kpi.active_rentals || 0}</p>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Revenue Volume Trend</h3>
              <p className="text-xs text-slate-500">Monthly gross collection from bookings (₹ INR)</p>
            </div>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><BarChart2 size={18} /></span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Category Demand Share</h3>
              <p className="text-xs text-slate-500">Booking frequency by vehicle classification</p>
            </div>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><PieIcon size={18} /></span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.popularCategories || []}
                  dataKey="booking_count"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(analytics?.popularCategories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Bookings`, name]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Most Rented Vehicles Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Highest Earning Fleet Vehicles</h3>
            <p className="text-xs text-slate-500">SQL aggregated ranking by completed rental journeys</p>
          </div>
          <Link to="/admin/vehicles" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All Fleet →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Vehicle</th>
                <th className="pb-3 font-semibold">Registration</th>
                <th className="pb-3 font-semibold">Rental Count</th>
                <th className="pb-3 font-semibold text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.mostRented || []).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-3">
                    <img src={v.image_url} alt={v.model} className="w-12 h-8 object-cover rounded-lg" />
                    <span>{v.brand} {v.model}</span>
                  </td>
                  <td className="py-3 font-mono text-slate-600">{v.registration_number}</td>
                  <td className="py-3 font-semibold text-blue-600">{v.rental_count} Trips</td>
                  <td className="py-3 font-black text-slate-900 text-right">
                    ₹{Number(v.revenue_generated || 0).toLocaleString('en-IN')}
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

export default AdminDashboard;
