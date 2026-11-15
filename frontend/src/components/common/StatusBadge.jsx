import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'rejected':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'paid':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'paid'
            ? 'bg-emerald-500'
            : status?.toLowerCase() === 'confirmed'
            ? 'bg-blue-500'
            : status?.toLowerCase() === 'pending'
            ? 'bg-amber-500'
            : status?.toLowerCase() === 'cancelled' || status?.toLowerCase() === 'rejected'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
