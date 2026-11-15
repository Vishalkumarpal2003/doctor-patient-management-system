const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');

// @desc    Get all approved doctors with optional search/filter
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization, minFee, maxFee, page, limit, sortBy = 'rating', sortOrder = 'desc' } = req.query;

    const profileFilter = { isApproved: true };

    if (specialization && specialization !== 'All') {
      profileFilter.specialization = new RegExp(specialization, 'i');
    }

    if (minFee || maxFee) {
      profileFilter.fees = {};
      if (minFee) profileFilter.fees.$gte = Number(minFee);
      if (maxFee) profileFilter.fees.$lte = Number(maxFee);
    }

    let userFilter = { role: 'doctor', isActive: true };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Find users matching search
    const matchingUsers = await User.find(userFilter).select('_id name email phone gender avatar address');
    const userIds = matchingUsers.map((u) => u._id);

    profileFilter.user = { $in: userIds };

    // Sort order definition
    const sortField = ['fees', 'experience', 'rating'].includes(sortBy) ? sortBy : 'rating';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortConfig = { [sortField]: sortDirection };

    let query = DoctorProfile.find(profileFilter)
      .populate('user', 'name email phone gender avatar address isActive')
      .sort(sortConfig);

    const totalCount = await DoctorProfile.countDocuments(profileFilter);

    // Optional pagination
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;
      query = query.skip(skip).limit(limitNum);

      const doctors = await query;
      return res.json({
        success: true,
        count: doctors.length,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
        },
        data: doctors,
      });
    }

    const doctors = await query;

    // If search term was provided, also check if specialization matched directly
    if (search && doctors.length === 0) {
      const specDoctors = await DoctorProfile.find({
        isApproved: true,
        specialization: { $regex: search, $options: 'i' },
      }).populate('user', 'name email phone gender avatar address isActive');
      return res.json({ success: true, count: specDoctors.length, data: specDoctors });
    }

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate(
      'user',
      'name email phone gender avatar address isActive'
    );

    if (!doctor) {
      // Try finding by user ID
      const doctorByUser = await DoctorProfile.findOne({
        user: req.params.id,
      }).populate('user', 'name email phone gender avatar address isActive');

      if (!doctorByUser) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      return res.json({ success: true, data: doctorByUser });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to parse "09:00 AM" to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  const parts = timeStr.trim().split(' ');
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const modifier = parts[1] ? parts[1].toUpperCase() : 'AM';

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Helper function to format minutes from midnight to "09:00 AM"
const formatMinutesToTime = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const paddedHours = hours < 10 ? `0${hours}` : hours;
  return `${paddedHours}:${paddedMinutes} ${modifier}`;
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// @access  Public
const getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date query parameter (YYYY-MM-DD)',
      });
    }

    // Lookup doctor profile
    let doctorProfile = await DoctorProfile.findById(req.params.id).populate('user');
    if (!doctorProfile) {
      doctorProfile = await DoctorProfile.findOne({ user: req.params.id }).populate('user');
    }

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Determine Day of Week
    // Parsing date string safely
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = daysOfWeek[targetDate.getDay()];

    const isAvailableDay = doctorProfile.availableDays.includes(targetDayName);
    if (!isAvailableDay) {
      return res.json({
        success: true,
        date,
        dayName: targetDayName,
        isWorkingDay: false,
        message: `Doctor does not consult on ${targetDayName}s`,
        slots: [],
      });
    }

    // Generate time slots based on workingHours and slotDuration
    const startMinutes = parseTimeToMinutes(doctorProfile.workingHours?.start || '09:00 AM');
    const endMinutes = parseTimeToMinutes(doctorProfile.workingHours?.end || '05:00 PM');
    const duration = doctorProfile.slotDuration || 30;

    const generatedSlots = [];
    for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
      // Slot e.g. "09:00 AM" or "09:00 AM - 09:30 AM"
      const slotTime = formatMinutesToTime(m);
      generatedSlots.push(slotTime);
    }

    // Query booked appointments for this doctor on this date that are not cancelled or rejected
    const bookedAppointments = await Appointment.find({
      doctor: doctorProfile.user._id,
      appointmentDate: date,
      status: { $in: ['Pending', 'Confirmed', 'Completed'] },
    }).select('timeSlot status');

    const bookedSlotSet = new Set(bookedAppointments.map((app) => app.timeSlot));

    const slotsWithAvailability = generatedSlots.map((time) => ({
      time,
      isAvailable: !bookedSlotSet.has(time),
    }));

    res.json({
      success: true,
      date,
      dayName: targetDayName,
      isWorkingDay: true,
      doctor: {
        id: doctorProfile.user._id,
        name: doctorProfile.user.name,
        fees: doctorProfile.fees,
        specialization: doctorProfile.specialization,
      },
      slots: slotsWithAvailability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for the logged-in doctor
// @route   GET /api/doctors/my/appointments
// @access  Private (Doctor)
const getMyAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = { doctor: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (date) {
      filter.appointmentDate = date;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone gender dateOfBirth address avatar')
      .sort({ appointmentDate: -1, createdAt: -1 });

    // Fetch patient profile for each to include bloodGroup and medicalHistory
    const patientIds = appointments.map((a) => a.patient?._id).filter(Boolean);
    const patientProfiles = await PatientProfile.find({ user: { $in: patientIds } });
    const profileMap = {};
    patientProfiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enrichedAppointments = appointments.map((app) => {
      const appObj = app.toObject();
      if (appObj.patient && profileMap[appObj.patient._id.toString()]) {
        appObj.patient.patientProfile = profileMap[appObj.patient._id.toString()];
      }
      return appObj;
    });

    res.json({
      success: true,
      count: enrichedAppointments.length,
      data: enrichedAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Accept/Reject/Complete/Cancel)
// @route   PUT /api/doctors/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ['Confirmed', 'Completed', 'Cancelled', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this appointment',
      });
    }

    appointment.status = status;
    if (status === 'Cancelled' || status === 'Rejected') {
      appointment.cancellationReason = cancellationReason || 'Cancelled by doctor';
      appointment.cancelledBy = 'doctor';
      if (appointment.paymentStatus === 'Paid') {
        appointment.paymentStatus = 'Refunded';
      }
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor dashboard statistics
// @route   GET /api/doctors/dashboard/stats
// @access  Private (Doctor)
const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'Pending',
    });
    const confirmedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'Confirmed',
    });
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'Completed',
    });
    const cancelledAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: { $in: ['Cancelled', 'Rejected'] },
    });

    // Total unique patients
    const uniquePatients = await Appointment.distinct('patient', { doctor: doctorId });

    // Total earnings from completed & confirmed paid appointments
    const paidAppointments = await Appointment.find({
      doctor: doctorId,
      paymentStatus: 'Paid',
    }).select('fee');

    const totalEarnings = paidAppointments.reduce((acc, curr) => acc + (curr.fee || 0), 0);

    const profile = await DoctorProfile.findOne({ user: doctorId });

    res.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPatients: uniquePatients.length,
        totalEarnings,
        isApproved: profile ? profile.isApproved : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailableSlots,
  getMyAppointments,
  updateAppointmentStatus,
  getDoctorStats,
};
