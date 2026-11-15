const mongoose = require('mongoose');
const { getMemoryStore } = require('./memoryStore');

let dbState = {
  isMemory: false,
  isConnected: false,
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';

  if (process.env.USE_MEMORY === 'true') {
    console.log('Using in-memory database store (USE_MEMORY=true)...');
    dbState.isMemory = true;
    dbState.isConnected = true;
    return;
  }

  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    dbState.isConnected = true;
    dbState.isMemory = false;
  } catch (err) {
    if (process.env.NODE_ENV === 'production' || process.env.STRICT_DB === 'true') {
      console.error(`Fatal: MongoDB Atlas connection failed in production mode: ${err.message}`);
      throw err;
    }
    console.warn(`Local MongoDB connection failed (${err.message}).`);
    console.log('Switching to local In-Memory Database store for development testing...');
    dbState.isMemory = true;
    dbState.isConnected = true;
  }
};

const getDBState = () => dbState;

module.exports = { connectDB, getDBState };
