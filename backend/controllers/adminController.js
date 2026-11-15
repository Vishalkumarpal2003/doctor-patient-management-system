const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Get admin dashboard metrics and statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    // Parallelized query execution for high throughput & low latency
    const [
      totalPatients,
      totalDoctors,
      pendingDoctorApprovals,
      approvedDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      paidAppointments,
      refundedAppointments,
      recentAppointments,
      pendingDoctors,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      DoctorProfile.countDocuments({ isApproved: false }),
      DoctorProfile.countDocuments({ isApproved: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Confirmed' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: { $in: ['Cancelled', 'Rejected'] } }),
      Appointment.find({ paymentStatus: 'Paid' }).select('fee').lean(),
      Appointment.find({ paymentStatus: 'Refunded' }).select('fee').lean(),
      Appointment.find()
        .populate('doctor', 'name email')
        .populate('patient', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      DoctorProfile.find({ isApproved: false })
        .populate('user', 'name email phone createdAt')
        .limit(5),
    ]);

    // Calculate revenue metrics
    const totalRevenue = paidAppointments.reduce((sum, item) => sum + (item.fee || 0), 0);
    const totalRefunded = refundedAppointments.reduce((sum, item) => sum + (item.fee || 0), 0);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        approvedDoctors,
        pendingDoctorApprovals,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        totalRefunded,
        netRevenue: totalRevenue - totalRefunded,
      },
      recentAppointments,
      pendingDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors (Admin view, with filter by approval status)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
const getAllDoctorsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query; // status: 'approved', 'pending', 'all'
    const profileFilter = {};

    if (status === 'approved') {
      profileFilter.isApproved = true;
    } else if (status === 'pending') {
      profileFilter.isApproved = false;
    }

    let userFilter = { role: 'doctor' };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const matchingUsers = await User.find(userFilter).select('_id');
    const userIds = matchingUsers.map((u) => u._id);
    profileFilter.user = { $in: userIds };

    const doctors = await DoctorProfile.find(profileFilter)
      .populate('user', 'name email phone gender avatar address isActive createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject doctor registration
// @route   PUT /api/admin/doctors/:id/approval
// @access  Private (Admin)
const setDoctorApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    let doctor = await DoctorProfile.findById(req.params.id);

    if (!doctor) {
      // Try by user id
      doctor = await DoctorProfile.findOne({ user: req.params.id });
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.isApproved = Boolean(isApproved);
    await doctor.save();

    const populated = await DoctorProfile.findById(doctor._id).populate('user', 'name email phone isActive');

    res.json({
      success: true,
      message: `Doctor ${doctor.isApproved ? 'approved' : 'rejected / suspended'} successfully`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients (Admin view)
// @route   GET /api/admin/patients
// @access  Private (Admin)
const getAllPatientsAdmin = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'patient' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(filter).select('-password').sort({ createdAt: -1 });

    const patientIds = patients.map((p) => p._id);
    const profiles = await PatientProfile.find({ user: { $in: patientIds } });
    const profileMap = {};
    profiles.forEach((pr) => {
      profileMap[pr.user.toString()] = pr;
    });

    const enriched = patients.map((patient) => ({
      ...patient.toObject(),
      patientProfile: profileMap[patient._id.toString()] || null,
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (deactivate or activate)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own admin account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    const { status, doctorId, patientId, date } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (doctorId) {
      filter.doctor = doctorId;
    }
    if (patientId) {
      filter.patient = patientId;
    }
    if (date) {
      filter.appointmentDate = date;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name email phone avatar')
      .populate('patient', 'name email phone avatar')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments and financial records
// @route   GET /api/admin/payments
// @access  Private (Admin)
const getPaymentsAdmin = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    const payments = appointments.map((app) => ({
      _id: app._id,
      transactionId: app.transactionId,
      appointmentId: app._id,
      patientName: app.patient ? app.patient.name : 'Unknown',
      patientEmail: app.patient ? app.patient.email : '',
      doctorName: app.doctor ? app.doctor.name : 'Unknown',
      date: app.appointmentDate,
      time: app.timeSlot,
      amount: app.fee,
      paymentMethod: app.paymentMethod,
      paymentStatus: app.paymentStatus,
      appointmentStatus: app.status,
      createdAt: app.createdAt,
    }));

    const totalCollected = payments
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .filter((p) => p.paymentStatus === 'Refunded')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      summary: {
        totalTransactions: payments.length,
        totalCollected,
        totalRefunded,
        netRevenue: totalCollected - totalRefunded,
      },
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllDoctorsAdmin,
  setDoctorApproval,
  getAllPatientsAdmin,
  toggleUserStatus,
  getAllAppointmentsAdmin,
  getPaymentsAdmin,
};
