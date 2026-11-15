const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const bookAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      symptoms,
      notes,
      paymentMethod = 'Credit Card',
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate, and timeSlot',
      });
    }

    // Verify doctor exists and is approved (supports both Doctor user ID and DoctorProfile ID)
    let resolvedDoctorUserId = doctorId;
    let doctorUser = await User.findById(doctorId);
    let doctorProfile = null;

    if (!doctorUser) {
      doctorProfile = await DoctorProfile.findById(doctorId);
      if (doctorProfile) {
        resolvedDoctorUserId = doctorProfile.user;
        doctorUser = await User.findById(resolvedDoctorUserId);
      }
    } else {
      doctorProfile = await DoctorProfile.findOne({ user: resolvedDoctorUserId });
    }

    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (!doctorProfile || !doctorProfile.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is currently not accepting appointments or is awaiting approval',
      });
    }

    // Verify doctor consults on the chosen day
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = daysOfWeek[targetDate.getDay()];

    if (!doctorProfile.availableDays.includes(targetDayName)) {
      return res.status(400).json({
        success: false,
        message: `Doctor does not consult on ${targetDayName}s`,
      });
    }

    // Check if slot is already booked for this doctor (PREVENT DUPLICATE APPOINTMENTS)
    const existingSlotBooking = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed', 'Completed'] },
    });

    if (existingSlotBooking) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot is already booked. Please select another time slot.',
      });
    }

    // Check if patient already booked a slot with the same doctor on the same date and time
    const patientExistingBooking = await Appointment.findOne({
      patient: req.user._id,
      appointmentDate,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed', 'Completed'] },
    });

    if (patientExistingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active appointment scheduled at this time slot.',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: resolvedDoctorUserId,
      appointmentDate,
      timeSlot,
      symptoms: symptoms || 'General consultation',
      notes: notes || '',
      fee: doctorProfile.fees || 50,
      paymentStatus: 'Paid',
      paymentMethod,
      status: 'Pending', // Doctor can confirm
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email phone avatar')
      .populate('patient', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Awaiting doctor confirmation.',
      data: populatedAppointment,
    });
  } catch (error) {
    // Catch Mongo duplicate key error in case of simultaneous requests
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot was just booked by another patient. Please choose a different slot.',
      });
    }
    next(error);
  }
};

// @desc    Get logged in patient's appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getPatientAppointments = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = { patient: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name email phone avatar')
      .sort({ appointmentDate: -1, createdAt: -1 });

    // Fetch doctor profiles to get specialization and clinic address
    const doctorIds = appointments.map((a) => a.doctor?._id).filter(Boolean);
    const doctorProfiles = await DoctorProfile.find({ user: { $in: doctorIds } });
    const profileMap = {};
    doctorProfiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    // Check for prescriptions linked to these appointments
    const appointmentIds = appointments.map((a) => a._id);
    const prescriptions = await Prescription.find({ appointment: { $in: appointmentIds } });
    const prescriptionMap = {};
    prescriptions.forEach((p) => {
      prescriptionMap[p.appointment.toString()] = p;
    });

    const enrichedAppointments = appointments.map((app) => {
      const appObj = app.toObject();
      if (appObj.doctor && profileMap[appObj.doctor._id.toString()]) {
        appObj.doctor.doctorProfile = profileMap[appObj.doctor._id.toString()];
      }
      appObj.prescription = prescriptionMap[appObj._id.toString()] || null;
      return appObj;
    });

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;
      const paginated = enrichedAppointments.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(enrichedAppointments.length / limitNum),
          totalCount: enrichedAppointments.length,
        },
        data: paginated,
      });
    }

    res.json({
      success: true,
      count: enrichedAppointments.length,
      data: enrichedAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email phone avatar')
      .populate('patient', 'name email phone avatar');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the patient, doctor, or admin can access
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: appointment.doctor._id });
    const prescription = await Prescription.findOne({ appointment: appointment._id });

    const appObj = appointment.toObject();
    if (appObj.doctor) {
      appObj.doctor.doctorProfile = doctorProfile;
    }
    appObj.prescription = prescription;

    res.json({
      success: true,
      data: appObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already been completed',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = cancellationReason || `Cancelled by ${req.user.role}`;
    appointment.cancelledBy = req.user.role;
    if (appointment.paymentStatus === 'Paid') {
      appointment.paymentStatus = 'Refunded';
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully. Any fee paid will be refunded.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
};
