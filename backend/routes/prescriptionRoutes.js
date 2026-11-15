const express = require('express');
const router = express.Router();
const {
  createOrUpdatePrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
  getPrescriptionByAppointment,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validatePrescription } = require('../middleware/validationMiddleware');

router.post('/', protect, authorize('doctor'), validatePrescription, createOrUpdatePrescription);
router.get('/my', protect, authorize('patient'), getMyPrescriptions);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientPrescriptions);
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);

module.exports = router;
