import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, Award, ArrowRight } from 'lucide-react';

export const DoctorCard = memo(({ doctor, onSelectDetails }) => {
  if (!doctor) return null;

  const doctorUser = doctor.user || {};
  const doctorName = doctorUser.name || 'Specialist Doctor';
  const avatarUrl =
    doctorUser.avatar ||
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';

  return (
    <article
      className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition flex flex-col overflow-hidden"
      aria-label={`Profile card for ${doctorName}`}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Doctor Header */}
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={avatarUrl}
            alt={doctorName}
            loading="lazy"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
            }}
          />
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {doctorName}
            </h3>
            <p className="text-xs font-semibold text-sky-600">{doctor.specialization}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {doctor.qualifications?.join(', ')}
            </p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{doctor.rating ? doctor.rating.toFixed(1) : '5.0'}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({doctor.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {doctor.about || 'Dedicated healthcare physician committed to personalized clinical care.'}
        </p>

        {/* Clinical Specs */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{doctor.experience || 1}+ Years Experience</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{doctor.clinicAddress || 'Hospital Main Pavilion'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {doctor.workingHours?.start || '09:00 AM'} - {doctor.workingHours?.end || '05:00 PM'}
            </span>
          </div>
        </div>

        {/* Active Consulting Days */}
        <div className="flex flex-wrap gap-1 mb-4">
          {doctor.availableDays?.slice(0, 4).map((day) => (
            <span
              key={day}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
            >
              {day.slice(0, 3)}
            </span>
          ))}
          {(doctor.availableDays?.length || 0) > 4 && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-semibold">
              +{(doctor.availableDays?.length || 0) - 4}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Consultation Fee
            </span>
            <span className="text-lg font-black text-slate-900">${doctor.fees || 50}</span>
          </div>

          <div className="flex space-x-2">
            {onSelectDetails && (
              <button
                type="button"
                onClick={() => onSelectDetails(doctor)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                aria-label={`View full profile for ${doctorName}`}
              >
                Details
              </button>
            )}
            <Link
              to={`/book-appointment?doctorId=${doctorUser._id || doctor._id}`}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
              aria-label={`Book appointment with ${doctorName}`}
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

DoctorCard.displayName = 'DoctorCard';
export default DoctorCard;
