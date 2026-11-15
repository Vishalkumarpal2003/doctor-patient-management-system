import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The healthcare resource or portal page you requested does not exist or may have moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
