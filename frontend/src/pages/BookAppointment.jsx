import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService, appointmentService } from '../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Star,
  MapPin,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Set default appointment date to tomorrow or +2 days
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [appointmentDate, setAppointmentDate] = useState(getTomorrowString());
  const [slotsData, setSlotsData] = useState({ slots: [], isWorkingDay: true, message: '' });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch approved doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getAll();
        const docs = res.data.data || [];
        setDoctors(docs);
        if (initialDoctorId) {
          const match = docs.find((d) => d.user?._id === initialDoctorId || d._id === initialDoctorId);
          if (match) {
            setSelectedDoctorId(match.user?._id);
            setSelectedDoctor(match);
          } else if (docs.length > 0) {
            setSelectedDoctorId(docs[0].user?._id);
            setSelectedDoctor(docs[0]);
          }
        } else if (docs.length > 0) {
          setSelectedDoctorId(docs[0].user?._id);
          setSelectedDoctor(docs[0]);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [initialDoctorId]);

  // When selected doctor changes, update selectedDoctor object
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const match = doctors.find(
        (d) => d.user?._id === selectedDoctorId || d._id === selectedDoctorId
      );
      setSelectedDoctor(match || null);
    }
  }, [selectedDoctorId, doctors]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !appointmentDate) return;
      setLoadingSlots(true);
      setSelectedSlot('');
      setError('');
      try {
        const res = await doctorService.getAvailableSlots(selectedDoctorId, appointmentDate);
        setSlotsData(res.data);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setSlotsData({ slots: [], isWorkingDay: false, message: 'Could not load slots.' });
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=book-appointment');
      return;
    }

    if (user.role !== 'patient') {
      setError('Only registered patients can book appointments. Please log in with a patient account.');
      return;
    }

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available appointment time slot.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot: selectedSlot,
        symptoms: symptoms || 'General Medical Consultation',
        paymentMethod,
      };

      const res = await appointmentService.book(payload);
      setSuccess('Appointment successfully booked and confirmed!');
      setTimeout(() => {
        navigate('/patient-dashboard?booking=success');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to book appointment. This slot may have just been reserved.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book Doctor Appointment
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select your specialist, choose an open time slot, and secure your consultation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Selections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Doctor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center mr-2 font-bold">
                1
              </span>
              Select Healthcare Practitioner
            </h2>

            {loadingDoctors ? (
              <LoadingSpinner text="Loading doctors..." size="sm" />
            ) : (
              <div>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white font-medium text-slate-800"
                >
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc.user?._id}>
                      {doc.user?.name} — {doc.specialization} (${doc.fees})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Step 2: Choose Date & View Available Slots */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center mr-2 font-bold">
                2
              </span>
              Select Date & Live Available Time Slot
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-800"
              />
            </div>

            {/* Slots Matrix */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Available Time Slots for {appointmentDate}
              </label>

              {loadingSlots ? (
                <LoadingSpinner text="Checking live slot availability..." size="sm" />
              ) : !slotsData.isWorkingDay ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  {slotsData.message || 'The doctor does not consult on this day of the week.'}
                </div>
              ) : slotsData.slots && slotsData.slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {slotsData.slots.map((slot, index) => (
                    <button
                      type="button"
                      key={index}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center ${
                        !slot.isAvailable
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : selectedSlot === slot.time
                          ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mb-1" />
                      <span>{slot.time}</span>
                      <span className="text-[10px] mt-0.5 font-normal">
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No available slots for this date.</p>
              )}
            </div>
          </div>

          {/* Step 3: Symptoms & Reason for Visit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center mr-2 font-bold">
                3
              </span>
              Medical Reason / Symptoms
            </h2>

            <div>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for visit (e.g. chest discomfort, fever for 3 days, routine blood pressure check)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Right Summary Card & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 sticky top-28">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Consultation Summary
            </h2>

            {selectedDoctor && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={
                      selectedDoctor.user?.avatar ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={selectedDoctor.user?.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedDoctor.user?.name}
                    </h3>
                    <p className="text-xs font-semibold text-sky-600">
                      {selectedDoctor.specialization}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {selectedDoctor.clinicAddress || 'CuraHealth Hospital'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-800">{appointmentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time Slot</span>
                    <span className="font-bold text-sky-700">
                      {selectedSlot || 'Select a time slot'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium text-slate-700">30 minutes</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-sky-500 outline-none bg-white text-slate-800"
                  >
                    <option value="Credit Card">Credit Card (Simulated)</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI / Cash">UPI / Hospital Cash Desk</option>
                    <option value="Insurance">Health Insurance Coverage</option>
                  </select>
                </div>

                {/* Total Fee */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs uppercase font-bold text-slate-500">
                    Total Consultation Fee
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ${selectedDoctor.fees || 50}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Immediate confirmation. Cancellation allowed up to 2 hours before.</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{bookingLoading ? 'Reserving Slot...' : 'Confirm Appointment'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
