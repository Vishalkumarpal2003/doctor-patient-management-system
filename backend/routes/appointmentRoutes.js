const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { validateAppointment } = require('../middleware/validationMiddleware');

router.post('/', protect, authorize('patient'), bookingLimiter, validateAppointment, bookAppointment);
router.get('/my', protect, authorize('patient'), getPatientAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
