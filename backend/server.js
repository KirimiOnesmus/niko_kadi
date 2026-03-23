const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


const connectDB = require('./config/db');
const { initializeCronJobs } = require('./config/cron');

connectDB();
initializeCronJobs();

// Middleware

const allowedOrigins = [
  "http://localhost:5173",
  "https://tuko-kadi.netlify.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-session-id","x-source"],
  credentials: false 
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Cleanup old WhatsApp sessions every hour
const WhatsAppSession = require('./models/whatsapp');
setInterval(async () => {
  try {
    const result = await WhatsAppSession.cleanupOldSessions();
    if (result.modifiedCount > 0) {
      console.log(`Cleaned up ${result.modifiedCount} old WhatsApp sessions`);
    }
  } catch (error) {
    console.error('Error cleaning sessions:', error);
  }
}, 60 * 60 * 1000); 


const centersRouter = require('./routes/centers');
const queuesRouter = require('./routes/queues');
const statsRouter = require('./routes/stats');
const iebcRouter = require('./routes/iebc');
const whatsappRouter = require('./routes/whatsapp');
const topicsRoutes = require('./routes/topics');

// API Routes
app.use('/api/centers', centersRouter);
app.use('/api/queues', queuesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/iebc', iebcRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/topics', topicsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Niko Kadi API',
    version: '2.0.0',
    description: 'Civic tech platform for Kenyan voter registration',
    status: 'running',
    endpoints: {
      centers: '/api/centers',
      queues: '/api/queues',
      stats: '/api/stats',
      iebc: '/api/iebc',
      whatsapp: '/api/whatsapp'
    },
    features: [
      'Find IEBC centers by location (all 47 counties)',
      'Proximity-verified queue reports (<500m)',
      'IEBC voter verification',
      'WhatsApp bot integration',
      'Real-time analytics (Web vs WhatsApp)'
    ],
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Niko Kadi API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      proximityVerification: true,
      whatsappBot: true,
      iebcIntegration: true,
      analytics: true,
      allCounties: true
    },
    database: 'connected'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(port, () => {
console.log(` Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

module.exports = app;