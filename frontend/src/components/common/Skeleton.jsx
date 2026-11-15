import React from 'react';

/**
 * Standardized skeleton placeholder for components during initial load
 */
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
      {...props}
    />
  );
};

export const DoctorCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col space-y-4">
      <div className="flex items-start space-x-4">
        <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-3">
      <div className="flex space-x-4 pb-3 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex space-x-4 py-2 border-b border-slate-50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DashboardStatSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-2xl" />
    </div>
  );
};

export default Skeleton;
