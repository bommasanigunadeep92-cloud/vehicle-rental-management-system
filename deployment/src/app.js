import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Database configurations
import pool from './config/mysql.js';
import { isMongoConnected } from './config/mongodb.js';
import { getCacheStats } from './config/redis.js';
import { isNeo4jConnected } from './config/neo4j.js';

// Middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import nosqlRoutes from './routes/nosqlRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import userRoutes from './routes/userRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request Parsing & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Apply rate limiting
app.use('/api', apiLimiter);

// Multi-Database Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let mysqlStatus = 'Healthy';
  try {
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
  } catch (err) {
    mysqlStatus = `Error: ${err.message}`;
  }

  const cacheInfo = await getCacheStats();

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Vehicle Rental Management System (Enterprise Architecture)',
    databases: {
      mysql: {
        status: mysqlStatus,
        role: 'Primary ACID Relational Database (Transactions, Row-locking, Relational integrity)',
      },
      mongodb: {
        connected: isMongoConnected(),
        status: isMongoConnected() ? 'Connected' : 'In-Memory NoSQL Adapter Active',
        role: 'Document Store (Flexible specifications, accessories, activity logs)',
      },
      redis: {
        status: 'Active',
        provider: cacheInfo.provider || 'Redis / Cache-Aside Store',
        role: 'In-Memory Cache (Vehicle listings, search results, fast access)',
      },
      neo4j: {
        connected: isNeo4jConnected(),
        status: isNeo4jConnected() ? 'Connected' : 'Graph Engine Active with Cypher Query Inspection',
        role: 'Graph Database (Knowledge graph, category affinity, collaborative filtering)',
      },
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/nosql', nosqlRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'Vehicle Rental Management System API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/api/health',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🚗 Vehicle Rental Management System API is Running!`);
    console.log(` 🚀 Listening on: http://localhost:${PORT}`);
    console.log(` 🛡️  Security Headers & Rate Limiting: ACTIVE`);
    console.log(` 📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
