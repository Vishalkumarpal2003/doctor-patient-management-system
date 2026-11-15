import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action = null,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
