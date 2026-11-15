/**
 * Centralized Request Validation Middleware
 * Enforces schema integrity, input sanitization, and prevents invalid payloads.
 */

const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(String(email).trim());
};

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters.');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (role && !['patient', 'doctor'].includes(role)) {
    errors.push('Role must be either "patient" or "doctor".');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  // Trim string inputs
  req.body.name = req.body.name.trim();
  req.body.email = req.body.email.trim().toLowerCase();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  req.body.email = req.body.email.trim().toLowerCase();
  next();
};

const validateAppointment = (req, res, next) => {
  const { doctorId, appointmentDate, timeSlot } = req.body;
  const errors = [];

  if (!doctorId || String(doctorId).trim().length === 0) {
    errors.push('Valid doctorId is required.');
  }

  // Date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!appointmentDate || !dateRegex.test(appointmentDate)) {
    errors.push('Appointment date is required in YYYY-MM-DD format.');
  }

  if (!timeSlot || typeof timeSlot !== 'string') {
    errors.push('Appointment time slot is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
};

const validatePrescription = (req, res, next) => {
  const { appointmentId, diagnosis, medicines } = req.body;
  const errors = [];

  if (!appointmentId) {
    errors.push('Appointment ID is required.');
  }

  if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length === 0) {
    errors.push('Clinical diagnosis is required.');
  }

  if (medicines && !Array.isArray(medicines)) {
    errors.push('Medicines must be an array.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointment,
  validatePrescription,
};
