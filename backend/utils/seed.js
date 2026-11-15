const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const autoSeedIfEmpty = require('./autoSeed');

dotenv.config();

const runSeed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing records for fresh seed...');
    await User.deleteMany();
    await DoctorProfile.deleteMany();
    await PatientProfile.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    console.log('Existing records cleared.');

    await autoSeedIfEmpty();
    console.log('Fresh seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed command failed:', err);
    process.exit(1);
  }
};

runSeed();
