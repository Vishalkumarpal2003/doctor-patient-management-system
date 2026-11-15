const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const seedData = require('./seedData');

let isSeeded = false;

const autoSeedIfEmpty = async () => {
  if (isSeeded) return;
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      isSeeded = true;
      console.log(`Database already populated (${userCount} users found). Skipping auto-seed.`);
      return;
    }

    console.log('Database is empty. Starting comprehensive auto-seed...');

    // 1. Create Admin
    const adminUser = await User.create(seedData.admin);
    console.log(`Admin account created: ${adminUser.email}`);

    // 2. Create Doctors & Doctor Profiles
    const doctorUsers = [];
    const doctorProfiles = [];
    for (const doc of seedData.doctors) {
      const createdUser = await User.create(doc.user);
      const createdProfile = await DoctorProfile.create({
        ...doc.profile,
        user: createdUser._id,
      });
      doctorUsers.push(createdUser);
      doctorProfiles.push(createdProfile);
    }
    console.log(`Created ${doctorUsers.length} doctors.`);

    // 3. Create Patients & Patient Profiles
    const patientUsers = [];
    for (const pat of seedData.patients) {
      const createdUser = await User.create(pat.user);
      await PatientProfile.create({
        ...pat.profile,
        user: createdUser._id,
      });
      patientUsers.push(createdUser);
    }
    console.log(`Created ${patientUsers.length} patients.`);

    // 4. Create Sample Appointments & Prescriptions
    // Today & Future dates
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    const pastDate1 = new Date(today);
    pastDate1.setDate(today.getDate() - 3);

    const pastDate2 = new Date(today);
    pastDate2.setDate(today.getDate() - 7);

    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 2);

    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 4);

    // Appointment 1: Completed with Dr. Sarah Jenkins (Cardiologist) & Alex Turner
    const app1 = await Appointment.create({
      patient: patientUsers[0]._id,
      doctor: doctorUsers[0]._id,
      appointmentDate: formatDate(pastDate1),
      timeSlot: '10:00 AM',
      status: 'Completed',
      symptoms: 'Mild chest heaviness after exertion',
      notes: 'Patient advised to bring previous ECG report.',
      fee: 90,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
    });

    await Prescription.create({
      appointment: app1._id,
      patient: patientUsers[0]._id,
      doctor: doctorUsers[0]._id,
      diagnosis: 'Sinus Tachycardia & Mild Essential Hypertension',
      medicines: [
        {
          name: 'Amlodipine Besylate',
          dosage: '5 mg',
          frequency: 'Once daily (Morning after breakfast)',
          duration: '30 days',
        },
        {
          name: 'Metoprolol Succinate',
          dosage: '25 mg',
          frequency: 'Once daily (Night)',
          duration: '30 days',
        },
      ],
      testsAdvised: ['Echocardiogram (2D Echo)', 'Lipid Profile', 'Serum Creatinine'],
      instructions: 'Limit sodium intake, avoid caffeinated beverages after 6 PM, 30 min brisk walk.',
      followUpDate: formatDate(futureDate2),
    });

    // Appointment 2: Completed with Dr. Elena Rostova (Dermatologist) & Sophia Williams
    const app2 = await Appointment.create({
      patient: patientUsers[1]._id,
      doctor: doctorUsers[2]._id,
      appointmentDate: formatDate(pastDate2),
      timeSlot: '11:00 AM',
      status: 'Completed',
      symptoms: 'Skin flare-up, dryness, and itching on forearm',
      fee: 75,
      paymentStatus: 'Paid',
      paymentMethod: 'Debit Card',
    });

    await Prescription.create({
      appointment: app2._id,
      patient: patientUsers[1]._id,
      doctor: doctorUsers[2]._id,
      diagnosis: 'Contact Dermatitis with Xerosis',
      medicines: [
        {
          name: 'Hydrocortisone Cream 1%',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '7 days',
        },
        {
          name: 'Cetirizine Hydrochloride',
          dosage: '10 mg',
          frequency: 'Once daily at bedtime',
          duration: '10 days',
        },
      ],
      testsAdvised: ['Patch allergy test'],
      instructions: 'Keep skin hydrated with fragrance-free ceramide moisturizer immediately after bathing.',
      followUpDate: formatDate(futureDate1),
    });

    // Appointment 3: Confirmed with Dr. Sarah Jenkins & Alex Turner
    await Appointment.create({
      patient: patientUsers[0]._id,
      doctor: doctorUsers[0]._id,
      appointmentDate: formatDate(futureDate1),
      timeSlot: '02:00 PM',
      status: 'Confirmed',
      symptoms: 'Follow-up consultation for blood pressure review',
      fee: 90,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
    });

    // Appointment 4: Pending with Dr. Marcus Vance & Robert Miller
    await Appointment.create({
      patient: patientUsers[2]._id,
      doctor: doctorUsers[1]._id,
      appointmentDate: formatDate(futureDate2),
      timeSlot: '11:30 AM',
      status: 'Pending',
      symptoms: 'Persistent tension headaches for 3 weeks',
      fee: 110,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI / Cash',
    });

    console.log('Comprehensive seeding completed successfully!');
  } catch (error) {
    console.error('Auto-seed error:', error);
  }
};

module.exports = autoSeedIfEmpty;
