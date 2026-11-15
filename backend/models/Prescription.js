const mongoose = require('mongoose');
const createModelProxy = require('./modelProxy');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    medicines: {
      type: [medicineSchema],
      default: [],
    },
    testsAdvised: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: 'Take medicines on time and maintain proper hydration.',
    },
    followUpDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MongoosePrescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = createModelProxy('Prescription', MongoosePrescription);
