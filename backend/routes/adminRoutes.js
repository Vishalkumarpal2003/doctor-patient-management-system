const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllDoctorsAdmin,
  setDoctorApproval,
  getAllPatientsAdmin,
  toggleUserStatus,
  getAllAppointmentsAdmin,
  getPaymentsAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and restricted to admin
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/doctors', getAllDoctorsAdmin);
router.put('/doctors/:id/approval', setDoctorApproval);
router.get('/patients', getAllPatientsAdmin);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/appointments', getAllAppointmentsAdmin);
router.get('/payments', getPaymentsAdmin);

module.exports = router;
