import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  Power,
  CreditCard,
  Building,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'patients' | 'appointments' | 'payments'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctors management
  const [doctors, setDoctors] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [doctorSearch, setDoctorSearch] = useState('');

  // Patients management
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');

  // Appointments management
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('All');

  // Payments
  const [paymentsData, setPaymentsData] = useState({ summary: {}, data: [] });

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await adminService.getDoctors({
        status: doctorFilter,
        search: doctorSearch || undefined,
      });
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Error fetching doctors for admin:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await adminService.getPatients({
        search: patientSearch || undefined,
      });
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Error fetching patients for admin:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await adminService.getAppointments({
        status: appointmentFilter !== 'All' ? appointmentFilter : undefined,
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments for admin:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await adminService.getPayments();
      setPaymentsData(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchDoctors(), fetchPatients(), fetchAppointments(), fetchPayments()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'doctors') fetchDoctors();
  }, [doctorFilter, doctorSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'patients') fetchPatients();
  }, [patientSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
  }, [appointmentFilter, activeTab]);

  const handleDoctorApproval = async (docId, isApproved) => {
    try {
      await adminService.setApproval(docId, isApproved);
      fetchDoctors();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update doctor approval');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      fetchDoctors();
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl border border-purple-200">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Hospital Administration</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CuraHealth Central Control • Monitor Doctors, Patients, Appointments & Financials
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchDoctors();
            fetchPatients();
            fetchAppointments();
            fetchPayments();
          }}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center space-x-1.5 self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Building },
          { id: 'doctors', label: `Manage Doctors (${stats?.totalDoctors || 0})`, icon: Stethoscope },
          { id: 'patients', label: `Manage Patients (${stats?.totalPatients || 0})`, icon: Users },
          { id: 'appointments', label: `Appointments (${stats?.totalAppointments || 0})`, icon: Calendar },
          { id: 'payments', label: `Payment Records ($${stats?.totalRevenue || 0})`, icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 text-sky-600" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving administrative data..." size="lg" />
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Patients
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalPatients || 0}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Registered users</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Doctors
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalDoctors || 0}</p>
                  <p className="text-[11px] text-amber-600 mt-1">
                    {stats?.pendingDoctorApprovals || 0} Pending approval
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Appointments
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {stats?.totalAppointments || 0}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {stats?.completedAppointments || 0} Completed • {stats?.pendingAppointments || 0} Pending
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Revenue Collected
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">${stats?.totalRevenue || 0}</p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Net: ${stats?.netRevenue || 0} (${stats?.totalRefunded || 0} refunded)
                  </p>
                </div>
              </div>

              {/* Pending Doctor Approvals Callout */}
              {stats?.pendingDoctorApprovals > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h3 className="text-base font-bold text-amber-900">
                        {stats.pendingDoctorApprovals} Doctor(s) Awaiting Registration Approval
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setDoctorFilter('pending');
                        setActiveTab('doctors');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Review Doctors Now
                    </button>
                  </div>
                  <p className="text-xs text-amber-700">
                    Doctors registered on the portal cannot accept patient appointments until their
                    medical qualifications and license are verified and approved by the hospital admin.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Registered Medical Doctors</h2>
                  <p className="text-xs text-slate-500">
                    Approve doctor credentials, update permissions, or toggle account access.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search doctor..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['all', 'pending', 'approved'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setDoctorFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                          doctorFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Consultation Fee</th>
                      <th className="py-3 px-4">Credential Status</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map((doc) => (
                      <tr key={doc._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{doc.user?.name}</div>
                          <span className="text-[11px] font-normal text-slate-400">
                            {doc.user?.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-sky-700">
                          {doc.specialization}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{doc.experience} Years</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">${doc.fees}</td>
                        <td className="py-3.5 px-4">
                          {doc.isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={doc.user?.isActive ? 'Active' : 'Inactive'} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {!doc.isApproved ? (
                            <button
                              onClick={() => handleDoctorApproval(doc._id, true)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDoctorApproval(doc._id, false)}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 font-bold text-[11px]"
                            >
                              Revoke
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleUser(doc.user?._id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                              doc.user?.isActive
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {doc.user?.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE PATIENTS */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Registered Patients</h2>
                  <p className="text-xs text-slate-500">
                    Patient accounts, contact profiles, and medical status.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patient..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((pat) => (
                      <tr key={pat._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{pat.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{pat.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{pat.phone || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-bold text-sky-700">
                          {pat.patientProfile?.bloodGroup || 'Unknown'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={pat.isActive ? 'Active' : 'Inactive'} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleUser(pat._id)}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] border ${
                              pat.isActive
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {pat.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: APPOINTMENTS MONITOR */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Hospital Appointments Log</h2>
                  <p className="text-xs text-slate-500">
                    Live schedule tracking across all clinical departments.
                  </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setAppointmentFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        appointmentFilter === st
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {app.appointmentDate}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {app.timeSlot}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900">{app.patient?.name}</span>
                          <span className="block text-[11px] text-slate-400">
                            {app.patient?.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {app.doctor?.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">${app.fee}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT RECORDS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Transactions
                  </span>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {paymentsData.summary?.totalTransactions || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Gross Fees Collected
                  </span>
                  <p className="text-3xl font-black text-emerald-600 mt-2">
                    ${paymentsData.summary?.totalCollected || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Refunded
                  </span>
                  <p className="text-3xl font-black text-amber-600 mt-2">
                    ${paymentsData.summary?.totalRefunded || 0}
                  </p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">Consultation Payment Records</h2>
                  <p className="text-xs text-slate-500">
                    Audit trail of patient consultation payments, transaction IDs, and methods.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Doctor</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentsData.data?.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {p.transactionId}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {p.patientName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{p.doctorName}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {p.date} • {p.time}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {p.paymentMethod}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">${p.amount}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
