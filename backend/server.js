const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, getDBState } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const autoSeedIfEmpty = require('./utils/autoSeed');
const sanitizeInput = require('./middleware/sanitizeMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  autoSeedIfEmpty();
});

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevents blocking bundled frontend assets
    crossOriginEmbedderPolicy: false,
  })
);

// Response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization against NoSQL injection
app.use(sanitizeInput);

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Health check endpoint with system metrics
app.get('/api/health', (req, res) => {
  const dbState = getDBState();
  res.json({
    status: 'OK',
    service: 'CuraHealth Doctor-Patient Management API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: dbState.isMemory ? 'In-Memory Store (Zero-Config)' : 'MongoDB Atlas / Standalone',
      connected: dbState.isConnected,
    },
    system: {
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version,
    },
  });
});

// Serverless DB connection & auto-seed middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    next();
  } catch (err) {
    next(err);
  }
});

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount Routes (Standard & V1 Versioned)
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);

// API v1 Aliases for REST standard versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

if (require.main === module && !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`CuraHealth Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully terminating application server...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
