const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Add or update diagnosis and prescription for an appointment
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createOrUpdatePrescription = async (req, res, next) => {
  try {
    const {
      appointmentId,
      diagnosis,
      medicines,
      testsAdvised,
      instructions,
      followUpDate,
    } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentId and diagnosis',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You are not the assigned doctor for this appointment',
      });
    }

    let prescription = await Prescription.findOne({ appointment: appointmentId });

    if (prescription) {
      prescription.diagnosis = diagnosis;
      prescription.medicines = medicines || prescription.medicines;
      prescription.testsAdvised = testsAdvised || prescription.testsAdvised;
      prescription.instructions = instructions || prescription.instructions;
      prescription.followUpDate = followUpDate || prescription.followUpDate;
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: req.user._id,
        diagnosis,
        medicines: medicines || [],
        testsAdvised: testsAdvised || [],
        instructions: instructions || 'Take medicines as directed.',
        followUpDate: followUpDate || null,
      });
    }

    // Automatically mark the appointment as 'Completed'
    if (appointment.status !== 'Completed') {
      appointment.status = 'Completed';
      await appointment.save();
    }

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phone gender dateOfBirth')
      .populate('doctor', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Prescription and medical record saved successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions for the logged-in patient
// @route   GET /api/prescriptions/my
// @access  Private (Patient)
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name email phone avatar')
      .populate('appointment', 'appointmentDate timeSlot status fee')
      .sort({ createdAt: -1 });

    // Fetch doctor profiles to add specialization
    const doctorIds = prescriptions.map((p) => p.doctor?._id).filter(Boolean);
    const doctorProfiles = await DoctorProfile.find({ user: { $in: doctorIds } });
    const profileMap = {};
    doctorProfiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enriched = prescriptions.map((p) => {
      const pObj = p.toObject();
      if (pObj.doctor && profileMap[pObj.doctor._id.toString()]) {
        pObj.doctor.doctorProfile = profileMap[pObj.doctor._id.toString()];
      }
      return pObj;
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions for a specific patient (Doctor or Admin)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor / Admin)
const getPatientPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name email phone')
      .populate('appointment', 'appointmentDate timeSlot status fee')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by appointment ID
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private
const getPrescriptionByAppointment = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      appointment: req.params.appointmentId,
    })
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email phone gender dateOfBirth')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found for this appointment',
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdatePrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
  getPrescriptionByAppointment,
};
