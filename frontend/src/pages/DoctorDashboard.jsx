import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService, authService } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Pill,
  DollarSign,
  AlertCircle,
  Users,
  Settings,
  ShieldAlert,
  FileText,
  Activity,
  Edit,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import PrescriptionModal from '../components/doctor/PrescriptionModal';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDashboard = () => {
  const { user, updateUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected appointment for prescription
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [appointmentForRx, setAppointmentForRx] = useState(null);

  // Selected patient details modal
  const [patientDetailModalOpen, setPatientDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Profile and Slot settings modal
  const [profileSettingsModalOpen, setProfileSettingsModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.profile?.specialization || 'General Physician',
    qualifications: user?.profile?.qualifications?.join(', ') || 'MBBS',
    experience: user?.profile?.experience || 3,
    fees: user?.profile?.fees || 50,
    about: user?.profile?.about || '',
    clinicAddress: user?.profile?.clinicAddress || '',
    availableDays: user?.profile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHoursStart: user?.profile?.workingHours?.start || '09:00 AM',
    workingHoursEnd: user?.profile?.workingHours?.end || '05:00 PM',
    slotDuration: user?.profile?.slotDuration || 30,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ error: '', success: '' });

  const fetchDoctorData = async () => {
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        doctorService.getStats(),
        doctorService.getMyAppointments({
          status: filterStatus !== 'All' ? filterStatus : undefined,
        }),
      ]);
      setStats(statsRes.data.stats);
      setAppointments(appointmentsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [filterStatus]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    let cancellationReason = '';
    if (newStatus === 'Rejected' || newStatus === 'Cancelled') {
      cancellationReason = prompt('Enter reason for cancellation/rejection:') || 'Unavailable';
    }

    try {
      await doctorService.updateAppointmentStatus(appointmentId, {
        status: newStatus,
        cancellationReason,
      });
      fetchDoctorData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleOpenRxModal = (app) => {
    setAppointmentForRx(app);
    setPrescriptionModalOpen(true);
  };

  const handleOpenPatientDetail = (patient) => {
    setSelectedPatient(patient);
    setPatientDetailModalOpen(true);
  };

  const handleToggleDay = (day) => {
    const current = [...profileForm.availableDays];
    if (current.includes(day)) {
      setProfileForm({ ...profileForm, availableDays: current.filter((d) => d !== day) });
    } else {
      setProfileForm({ ...profileForm, availableDays: [...current, day] });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg({ error: '', success: '' });

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        specialization: profileForm.specialization,
        qualifications: profileForm.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        experience: Number(profileForm.experience),
        fees: Number(profileForm.fees),
        about: profileForm.about,
        clinicAddress: profileForm.clinicAddress,
        availableDays: profileForm.availableDays,
        workingHours: {
          start: profileForm.workingHoursStart,
          end: profileForm.workingHoursEnd,
        },
        slotDuration: Number(profileForm.slotDuration),
      };

      const res = await authService.updateProfile(payload);
      updateUser(res.data.user);
      setSettingsMsg({ error: '', success: 'Practice details and availability saved!' });
      setTimeout(() => {
        setProfileSettingsModalOpen(false);
      }, 1000);
    } catch (err) {
      setSettingsMsg({
        error: err.response?.data?.message || 'Failed to update settings',
        success: '',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const isApproved = user?.profile?.isApproved ?? stats?.isApproved;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Approval Status Banner if Pending */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Credential Verification Pending</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Your doctor registration has been received and is awaiting administrative verification.
              Once approved by the hospital admin, your profile will be published to patients.
            </p>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-2 border-blue-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Doctor
              </span>
              {isApproved ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Approved
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Pending Admin Approval
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-sky-600 mt-0.5">
              {user?.profile?.specialization || 'General Physician'} • {user?.profile?.experience || 3} Yrs Exp.
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultation Fee: <strong className="text-slate-800">${user?.profile?.fees || 50}</strong> •{' '}
              {user?.profile?.clinicAddress || 'Hospital Main Clinic'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setProfileSettingsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start md:self-center"
        >
          <Settings className="w-4 h-4" />
          <span>Practice & Availability Settings</span>
        </button>
      </div>

      {/* Doctor Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Visits
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalAppointments || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">All time consultations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.pendingAppointments || 0}
          </p>
          <p className="text-[11px] text-amber-600 mt-1">Needs confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalPatients || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Unique individuals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ${stats?.totalEarnings || 0}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">Completed & paid consults</p>
        </div>
      </div>

      {/* Appointments Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header with filter */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Patient Appointments & Consultations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accept requests, manage schedules, and prescribe clinical treatments.
            </p>
          </div>

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

        {loading ? (
          <LoadingSpinner text="Loading patient queue..." size="md" />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-500">No appointments matching "{filterStatus}".</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => (
              <div
                key={app._id}
                className="p-6 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Patient Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-bold text-slate-900">
                      {app.patient?.name || 'Patient'}
                    </h3>
                    <StatusBadge status={app.status} />
                    <button
                      onClick={() => handleOpenPatientDetail(app.patient)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-0.5 rounded transition"
                    >
                      View Medical Profile
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {app.appointmentDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {app.timeSlot}
                    </span>
                    <span>
                      Fee: <strong className="text-slate-800">${app.fee}</strong> ({app.paymentStatus})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                    <strong className="text-slate-700">Patient Note:</strong>{' '}
                    {app.symptoms || 'General Checkup'}
                  </p>

                  {app.cancellationReason && (
                    <p className="text-xs text-rose-600 italic">
                      Cancelled: {app.cancellationReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                  {/* If Pending: Doctor can Confirm or Reject */}
                  {app.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* If Confirmed: Doctor can Add Diagnosis & Prescription */}
                  {app.status === 'Confirmed' && (
                    <button
                      onClick={() => handleOpenRxModal(app)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Add Prescription & Complete</span>
                    </button>
                  )}

                  {/* If Completed: Doctor can View/Update Prescription */}
                  {app.status === 'Completed' && (
                    <button
                      onClick={() => handleOpenRxModal(app)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs transition flex items-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Edit Prescription</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Detail Profile Modal */}
      {patientDetailModalOpen && selectedPatient && (
        <Modal
          isOpen={patientDetailModalOpen}
          onClose={() => setPatientDetailModalOpen(false)}
          title={`Patient Medical Chart • ${selectedPatient.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-bold text-slate-800">{selectedPatient.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone</span>
                <span className="font-bold text-slate-800">{selectedPatient.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-bold text-sky-700">
                  {selectedPatient.patientProfile?.bloodGroup || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedPatient.gender || 'unspecified'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-600 mb-1">
                Allergies & Contraindications
              </h4>
              <p className="text-slate-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                {selectedPatient.patientProfile?.allergies?.length > 0
                  ? selectedPatient.patientProfile.allergies.join(', ')
                  : 'No known drug or environmental allergies recorded.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-600 mb-1">
                Medical History
              </h4>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedPatient.patientProfile?.medicalHistory?.length > 0
                  ? selectedPatient.patientProfile.medicalHistory.join(', ')
                  : 'No chronic conditions reported.'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPatientDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Practice & Availability Settings Modal */}
      {profileSettingsModalOpen && (
        <Modal
          isOpen={profileSettingsModalOpen}
          onClose={() => setProfileSettingsModalOpen(false)}
          title="Doctor Practice Profile & Slot Availability Settings"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4">
            {settingsMsg.error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {settingsMsg.error}
              </div>
            )}
            {settingsMsg.success && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
                {settingsMsg.success}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Physician Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.specialization}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, specialization: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Qualifications (Comma-separated)
                </label>
                <input
                  type="text"
                  value={profileForm.qualifications}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, qualifications: e.target.value })
                  }
                  placeholder="e.g. MBBS, MD, FACC"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Consultation Fee ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={profileForm.fees}
                  onChange={(e) => setProfileForm({ ...profileForm, fees: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinic / Consultation Room Address
              </label>
              <input
                type="text"
                value={profileForm.clinicAddress}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, clinicAddress: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            {/* Consulting Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Active Consulting Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isChecked = profileForm.availableDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Hours & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={profileForm.workingHoursStart}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, workingHoursStart: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  placeholder="05:00 PM"
                  value={profileForm.workingHoursEnd}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, workingHoursEnd: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Slot Duration (Min)
                </label>
                <input
                  type="number"
                  min="15"
                  step="5"
                  value={profileForm.slotDuration}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, slotDuration: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProfileSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription / Clinical Diagnosis Modal */}
      {prescriptionModalOpen && appointmentForRx && (
        <PrescriptionModal
          isOpen={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          appointment={appointmentForRx}
          onPrescriptionSaved={() => fetchDoctorData()}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
