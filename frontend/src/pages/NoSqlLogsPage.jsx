import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Server, Activity, ShieldCheck, Clock } from 'lucide-react';

export const NoSqlLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [aggregation, setAggregation] = useState([]);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/nosql/activity-logs');
        if (res.data.success) {
          setLogs(res.data.logs);
          setAggregation(res.data.aggregation);
          setProvider(res.data.provider);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            NoSQL Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">MongoDB User Activity & Event Stream</h1>
          <p className="text-xs text-slate-500 mt-1">
            Polymorphic event telemetry, vehicle searches, and aggregation pipeline analytics
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2 self-start">
          <Server size={14} />
          <span>Active Provider: {provider}</span>
        </span>
      </div>

      {/* Aggregation Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {aggregation.map((agg) => (
          <div key={agg._id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Event: {agg._id}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{agg.count}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Aggregated Count</span>
          </div>
        ))}
      </div>

      {/* Raw Event Stream Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-emerald-600" />
            <span>Recent Streaming Event Documents</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Collection: user_activity_logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Document _id</th>
                <th className="py-2.5 px-4 font-semibold">Action</th>
                <th className="py-2.5 px-4 font-semibold">User Email / ID</th>
                <th className="py-2.5 px-4 font-semibold">IP Address</th>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 font-sans">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">{String(log._id).slice(0, 16)}...</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800">{log.user_email || `User #${log.user_id}` || 'Anonymous'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
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

export default NoSqlLogsPage;
