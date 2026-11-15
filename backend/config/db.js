const mongoose = require('mongoose');

let dbState = {
  isMemory: false,
  isConnected: false,
};

let cachedPromise = null;

const connectDB = async () => {
  if (dbState.isConnected) {
    return;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (process.env.USE_MEMORY === 'true' || (!mongoUri && process.env.STRICT_DB !== 'true')) {
    console.log(process.env.USE_MEMORY === 'true' 
      ? 'Using in-memory database store (USE_MEMORY=true)...'
      : 'No MONGO_URI provided, initializing zero-config In-Memory store...');
    dbState.isMemory = true;
    dbState.isConnected = true;
    return;
  }

  cachedPromise = (async () => {
    try {
      console.log(`Connecting to MongoDB...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      dbState.isConnected = true;
      dbState.isMemory = false;
    } catch (err) {
      if (process.env.STRICT_DB === 'true') {
        console.error(`Fatal: MongoDB Atlas connection failed in strict mode: ${err.message}`);
        throw err;
      }
      console.warn(`MongoDB connection failed (${err.message}). Falling back to In-Memory store...`);
      dbState.isMemory = true;
      dbState.isConnected = true;
    }
  })();

  return cachedPromise;
};

const getDBState = () => dbState;

module.exports = { connectDB, getDBState };
