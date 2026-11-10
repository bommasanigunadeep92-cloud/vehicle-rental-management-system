import React from 'react';
import { Database, ShieldCheck, Zap, Network, Server } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Database Highlights Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-4">
            Demonstrating Multi-Database Enterprise Architecture
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Database size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">MySQL 8.0</p>
                <p className="text-[11px] text-slate-400">ACID & Row Locks</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Server size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">MongoDB NoSQL</p>
                <p className="text-[11px] text-slate-400">Flexible Specs & Logs</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Redis 7.x</p>
                <p className="text-[11px] text-slate-400">Cache-Aside & TTL</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Network size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Neo4j Graph</p>
                <p className="text-[11px] text-slate-400">Cypher Recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 DriveElite Vehicle Rental Management System. Academic & Enterprise Engineering Demonstration.</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={14} /> JWT Secured & bcrypt Hashed
          </span>
          <span className="text-slate-600">|</span>
          <span>INR (₹) Pricing</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
