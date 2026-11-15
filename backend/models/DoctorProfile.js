const mongoose = require('mongoose');
const createModelProxy = require('./modelProxy');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experience: {
      type: Number,
      default: 3,
      min: [0, 'Experience cannot be negative'],
    },
    fees: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      default: 50,
      min: [0, 'Fee cannot be negative'],
    },
    about: {
      type: String,
      default: 'Experienced healthcare professional dedicated to comprehensive patient care.',
    },
    clinicAddress: {
      type: String,
      default: 'Main Medical Center, Suite 101',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 15,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00 AM',
      },
      end: {
        type: String,
        default: '05:00 PM',
      },
    },
    slotDuration: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseDoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
module.exports = createModelProxy('DoctorProfile', MongooseDoctorProfile);
