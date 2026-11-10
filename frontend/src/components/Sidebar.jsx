import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarCheck,
  Wrench,
  FileText,
  CreditCard,
  Sparkles,
  UserCheck,
  Database,
  BarChart3,
  Settings,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Analytics & KPIs', icon: BarChart3, end: true },
    { to: '/admin/vehicles', label: 'Fleet Management', icon: Car },
    { to: '/admin/customers', label: 'Customer Accounts', icon: Users },
    { to: '/admin/bookings', label: 'Bookings & Orders', icon: CalendarCheck },
    { to: '/admin/maintenance', label: 'Fleet Maintenance', icon: Wrench },
    { to: '/admin/logs', label: 'NoSQL Activity Logs', icon: Database },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Operations Overview', icon: LayoutDashboard, end: true },
    { to: '/manager/bookings', label: 'Manage Bookings', icon: CalendarCheck },
    { to: '/manager/vehicles', label: 'Vehicle Inventory', icon: Car },
    { to: '/manager/maintenance', label: 'Maintenance Schedule', icon: Wrench },
  ];

  const customerLinks = [
    { to: '/customer', label: 'My Dashboard', icon: LayoutDashboard, end: true },
    { to: '/vehicles', label: 'Rent a Vehicle', icon: Car },
    { to: '/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/customer/payments', label: 'Payment Receipts', icon: CreditCard },
    { to: '/customer/recommendations', label: 'Graph Recommendations', icon: Sparkles },
    { to: '/customer/profile', label: 'Personal Profile', icon: UserCheck },
  ];

  let links = customerLinks;
  if (user.role === 'admin') links = adminLinks;
  else if (user.role === 'manager') links = managerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col shrink-0">
      {/* User Info Capsule */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-sm">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-900 truncate">{user.full_name}</h4>
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : user.role === 'manager'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {user.role} Portal
            </span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Tech Architecture Pill */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-900 text-slate-300 text-xs">
          <p className="font-semibold text-white mb-1">Architecture Status</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>MySQL 8.0</span>
            <span className="text-emerald-400 font-medium">● InnoDB</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Cache / Graph</span>
            <span className="text-blue-400 font-medium">Redis + Neo4j</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
