import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorService } from '../services/api';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Award,
  Stethoscope,
  Clock,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const specialtiesList = [
  'All',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'General Physician',
];

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpec = searchParams.get('specialization') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [maxFee, setMaxFee] = useState(150);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSpecialty !== 'All') params.specialization = selectedSpecialty;
      if (maxFee) params.maxFee = maxFee;

      const res = await doctorService.getAll(params);
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find A Medical Specialist
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Browse verified doctors, check consultation fees, and schedule an appointment in real-time.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white font-medium text-slate-700"
            >
              {specialtiesList.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'All' ? 'All Specialties' : spec}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
            Filter:
          </span>
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedSpecialty === spec
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Searching doctor registry..." size="lg" />
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or select "All Specialties" to view all available practitioners.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSpecialty('All');
            }}
            className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={
                      doc.user?.avatar ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={doc.user?.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {doc.user?.name}
                    </h3>
                    <p className="text-xs font-semibold text-sky-600">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {doc.qualifications?.join(', ')}
                    </p>

                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-amber-500 font-bold">
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{doc.rating || 4.8}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal">
                        {doc.experience} yrs exp.
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {doc.about}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doc.clinicAddress || 'Main Medical Center'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {doc.workingHours?.start || '09:00 AM'} - {doc.workingHours?.end || '05:00 PM'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Consultation Fee
                    </span>
                    <span className="text-lg font-black text-slate-900">${doc.fees}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedDoctorForModal(doc)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Details
                    </button>
                    <Link
                      to={`/book-appointment?doctorId=${doc.user?._id}`}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>Book Slot</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Details Modal */}
      {selectedDoctorForModal && (
        <Modal
          isOpen={!!selectedDoctorForModal}
          onClose={() => setSelectedDoctorForModal(null)}
          title={`Doctor Profile • ${selectedDoctorForModal.user?.name}`}
        >
          <div className="space-y-5">
            <div className="flex items-center space-x-4">
              <img
                src={
                  selectedDoctorForModal.user?.avatar ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                }
                alt={selectedDoctorForModal.user?.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-100"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDoctorForModal.user?.name}
                </h3>
                <p className="text-sm font-semibold text-sky-600">
                  {selectedDoctorForModal.specialization}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedDoctorForModal.qualifications?.join(', ')} •{' '}
                  {selectedDoctorForModal.experience} Years Clinical Experience
                </p>
                <div className="flex items-center space-x-1 mt-1 text-xs text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{selectedDoctorForModal.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">
                    ({selectedDoctorForModal.totalReviews || 24} verified patient reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                About the Physician
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedDoctorForModal.about}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Clinic & Location</span>
                <span className="font-bold text-slate-800">
                  {selectedDoctorForModal.clinicAddress}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Consultation Fee</span>
                <span className="text-base font-black text-slate-900">
                  ${selectedDoctorForModal.fees}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium mb-1">Consulting Days</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctorForModal.availableDays?.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[11px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDoctorForModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                to={`/book-appointment?doctorId=${selectedDoctorForModal.user?._id}`}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm"
              >
                Book An Appointment
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Doctors;
