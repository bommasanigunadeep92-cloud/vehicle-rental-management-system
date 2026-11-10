import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle, Clock, RotateCcw, QrCode } from 'lucide-react';

export const PaymentStatusPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        if (res.data.success) {
          setPayments(res.data.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Payment & Transaction Receipts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authoritative records of UPI, Card, and Net Banking settlements
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Booking Reference</th>
                <th className="py-3 px-4 font-semibold">Vehicle</th>
                <th className="py-3 px-4 font-semibold">Payment Mode</th>
                <th className="py-3 px-4 font-semibold">Tariff Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.transaction_reference}</td>
                  <td className="py-3 px-4 font-mono text-blue-600">{p.booking_reference}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.brand} {p.model}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      {p.payment_method === 'UPI' ? <QrCode size={14} className="text-blue-600" /> : <CreditCard size={14} className="text-slate-500" />}
                      <span>{p.payment_method}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    ₹{Number(p.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.payment_status === 'Successful'
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.payment_status === 'Refunded'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(p.payment_date).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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

export default PaymentStatusPage;
