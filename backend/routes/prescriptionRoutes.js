const express = require('express');
const router = express.Router();
const {
  createOrUpdatePrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
  getPrescriptionByAppointment,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor'), createOrUpdatePrescription);
router.get('/my', protect, authorize('patient'), getMyPrescriptions);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientPrescriptions);
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);

module.exports = router;
