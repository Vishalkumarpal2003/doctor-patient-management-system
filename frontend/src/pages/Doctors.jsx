import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  RotateCcw,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import DoctorCard from '../components/doctor/DoctorCard';
import { DoctorCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';
import useDocTitle from '../hooks/useDocTitle';

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
  useDocTitle('Find A Medical Specialist');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpec = searchParams.get('specialization') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);

  // Debounce search query to prevent unnecessary network waterfalls
  const debouncedSearch = useDebounce(search, 350);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedSpecialty !== 'All') params.specialization = selectedSpecialty;

      const res = await doctorService.getAll(params);
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedSpecialty]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSelectDoctorModal = useCallback((doctor) => {
    setSelectedDoctorForModal(doctor);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setSelectedSpecialty('All');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find A Medical Specialist
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Browse verified doctors, check consultation fees, and schedule an appointment in real-time.
        </p>
      </header>

      {/* Search & Filter Bar */}
      <section
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        aria-label="Doctor search and filters"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search doctors by name or specialty"
              placeholder="Search doctor by name or specialty (type to search)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              aria-label="Filter by medical specialty"
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
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Specialty:
          </span>
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedSpecialty === spec
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-pressed={selectedSpecialty === spec}
            >
              {spec}
            </button>
          ))}
          {(search || selectedSpecialty !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* Doctor Cards Grid */}
      <section aria-label="Available doctors directory">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors match your criteria"
            description="Try modifying your search query or reset the specialty filter to view all available practitioners."
            action={
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onSelectDetails={handleSelectDoctorModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Doctor Details Modal */}
      {selectedDoctorForModal && (
        <Modal
          isOpen={!!selectedDoctorForModal}
          onClose={() => setSelectedDoctorForModal(null)}
          title={`Doctor Profile • ${selectedDoctorForModal.user?.name || 'Physician'}`}
        >
          <div className="space-y-5">
            <div className="flex items-center space-x-4">
              <img
                src={
                  selectedDoctorForModal.user?.avatar ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                }
                alt={selectedDoctorForModal.user?.name || 'Doctor avatar'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-100 flex-shrink-0"
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
                type="button"
                onClick={() => setSelectedDoctorForModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
              <Link
                to={`/book-appointment?doctorId=${selectedDoctorForModal.user?._id || selectedDoctorForModal._id}`}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
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
