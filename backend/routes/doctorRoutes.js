const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailableSlots,
  getMyAppointments,
  updateAppointmentStatus,
  getDoctorStats,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllDoctors);
router.get('/:id/available-slots', getDoctorAvailableSlots);
router.get('/:id', getDoctorById);

// Doctor protected routes
router.get('/my/appointments', protect, authorize('doctor'), getMyAppointments);
router.get('/dashboard/stats', protect, authorize('doctor'), getDoctorStats);
router.put('/appointments/:id/status', protect, authorize('doctor'), updateAppointmentStatus);

module.exports = router;
