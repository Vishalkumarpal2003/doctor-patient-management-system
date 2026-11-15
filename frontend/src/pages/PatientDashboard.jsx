import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService, authService } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  FileText,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  HeartPulse,
  Phone,
  MapPin,
  Pill,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import PrescriptionViewModal from '../components/patient/PrescriptionViewModal';

const PatientDashboard = () => {
  const { user, updateUser } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Prescription View Modal State
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Profile Edit State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'unspecified',
    address: user?.address || '',
    bloodGroup: user?.profile?.bloodGroup || 'Unknown',
    allergies: user?.profile?.allergies?.join(', ') || '',
    medicalHistory: user?.profile?.medicalHistory?.join(', ') || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ error: '', success: '' });

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getMy({
        status: filterStatus !== 'All' ? filterStatus : undefined,
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleOpenCancel = (app) => {
    setAppointmentToCancel(app);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!appointmentToCancel) return;

    setCancelling(true);
    try {
      await appointmentService.cancel(
        appointmentToCancel._id,
        cancelReason || 'Cancelled by patient'
      );
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionModalOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ error: '', success: '' });

    try {
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        address: profileData.address,
        bloodGroup: profileData.bloodGroup,
        allergies: profileData.allergies.split(',').map((a) => a.trim()).filter(Boolean),
        medicalHistory: profileData.medicalHistory.split(',').map((m) => m.trim()).filter(Boolean),
      };

      const res = await authService.updateProfile(payload);
      updateUser(res.data.user);
      setProfileMsg({ error: '', success: 'Profile updated successfully!' });
      setTimeout(() => {
        setProfileModalOpen(false);
      }, 1000);
    } catch (err) {
      setProfileMsg({
        error: err.response?.data?.message || 'Failed to update profile',
        success: '',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const upcomingCount = appointments.filter((a) =>
    ['Pending', 'Confirmed'].includes(a.status)
  ).length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const prescriptionCount = appointments.filter((a) => !!a.prescription).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 font-bold text-2xl flex items-center justify-center border-2 border-sky-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                Patient
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email} • {user?.phone || 'No phone'}</p>
            <p className="text-xs text-sky-600 font-semibold mt-1">
              Blood Group: {user?.profile?.bloodGroup || 'Not specified'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
          >
            Edit Profile
          </button>
          <Link
            to="/book-appointment"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Doctor</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Visits</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{upcomingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Visits</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Records</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{prescriptionCount}</p>
          </div>
        </div>
      </div>

      {/* Appointments List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Appointment History & Schedules</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your scheduled consultations, status, and clinical notes.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table / Cards */}
        {loading ? (
          <LoadingSpinner text="Loading appointment records..." size="md" />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-500">
              You do not have any appointments under "{filterStatus}".
            </p>
            <Link
              to="/book-appointment"
              className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => (
              <div
                key={app._id}
                className="p-6 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Doctor & Date info */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sky-600 border border-slate-200 flex-shrink-0">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-base font-bold text-slate-900">
                        {app.doctor?.name || 'Dr. Specialist'}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>

                    <p className="text-xs font-semibold text-sky-600">
                      {app.doctor?.doctorProfile?.specialization || 'Consultant Physician'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {app.appointmentDate}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {app.timeSlot}
                      </span>
                      <span>
                        Fee: <strong className="text-slate-800">${app.fee}</strong> (
                        {app.paymentStatus})
                      </span>
                    </div>

                    {app.symptoms && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong className="text-slate-700">Symptoms:</strong> {app.symptoms}
                      </p>
                    )}

                    {app.cancellationReason && (
                      <p className="text-xs text-rose-600 mt-1 italic">
                        Reason: {app.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end lg:self-center">
                  {/* View Prescription Button if exists */}
                  {app.prescription && (
                    <button
                      onClick={() => handleOpenPrescription(app.prescription)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 border border-purple-200 transition flex items-center space-x-1"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>View Prescription</span>
                    </button>
                  )}

                  {/* Cancel Button if Pending or Confirmed */}
                  {['Pending', 'Confirmed'].includes(app.status) && (
                    <button
                      onClick={() => handleOpenCancel(app)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && appointmentToCancel && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Appointment"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <strong className="text-slate-800">{appointmentToCancel.doctor?.name}</strong> on{' '}
              <strong className="text-slate-800">{appointmentToCancel.appointmentDate}</strong> at{' '}
              <strong className="text-slate-800">{appointmentToCancel.timeSlot}</strong>?
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, relocated..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Keep Appointment
              </button>
              <button
                type="submit"
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Patient Profile Edit Modal */}
      {profileModalOpen && (
        <Modal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          title="Update Patient Medical Profile"
        >
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileMsg.error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {profileMsg.error}
              </div>
            )}
            {profileMsg.success && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
                {profileMsg.success}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Known Drug / Food Allergies (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Sulfa"
                value={profileData.allergies}
                onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Past Medical History (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Asthma, Hypertension, Appendectomy"
                value={profileData.medicalHistory}
                onChange={(e) => setProfileData({ ...profileData, medicalHistory: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription View Modal */}
      {prescriptionModalOpen && selectedPrescription && (
        <PrescriptionViewModal
          isOpen={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          prescription={selectedPrescription}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
