import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Database configurations
import pool from './src/config/mysql.js';
import { isMongoConnected } from './src/config/mongodb.js';
import { getCacheStats } from './src/config/redis.js';
import { isNeo4jConnected } from './src/config/neo4j.js';

// Middlewares
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import nosqlRoutes from './src/routes/nosqlRoutes.js';
import graphRoutes from './src/routes/graphRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import maintenanceRoutes from './src/routes/maintenanceRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline scripts for frontend React SPA
  })
);
app.use(cors());

// Request Parsing & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Multi-Database Health Check
app.get('/api/health', async (req, res) => {
  let mysqlStatus = 'Healthy';
  try {
    await pool.execute('SELECT 1 + 1 AS result');
  } catch (err) {
    mysqlStatus = `Fallback / Standby: ${err.message}`;
  }

  const cacheInfo = await getCacheStats();

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Vehicle Rental Management System (Flat Unified Production Deployment)',
    environment: process.env.NODE_ENV || 'production',
    databases: {
      mysql: {
        status: mysqlStatus,
        role: 'Primary ACID Relational Database (Transactions, Row-locking)',
      },
      mongodb: {
        connected: isMongoConnected(),
        status: isMongoConnected() ? 'Connected' : 'In-Memory NoSQL Adapter Active',
        role: 'Document Store (Flexible specifications, telemetry logs)',
      },
      redis: {
        status: cacheInfo.connected ? 'Connected' : 'Active (Cache-Aside Engine)',
        provider: cacheInfo.type,
        role: 'In-Memory Cache (Vehicle listings, session acceleration)',
      },
      neo4j: {
        connected: isNeo4jConnected(),
        status: isNeo4jConnected() ? 'Connected' : 'Graph Engine Active with Recommendation Traversal',
        role: 'Graph Database (Knowledge graph, collaborative filtering)',
      },
    },
  });
});

// Mount All Backend API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/nosql', nosqlRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Serve Built Frontend Static Files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback: All unhandled non-API GET requests serve React's index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Centralized error handler
app.use(errorHandler);

// Start unified server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================================`);
  console.log(`🚀 DRIVEELITE UNIFIED PRODUCTION SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌐 Website Frontend: http://localhost:${PORT}`);
  console.log(`🔌 Backend Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================================`);
});

export default app;
