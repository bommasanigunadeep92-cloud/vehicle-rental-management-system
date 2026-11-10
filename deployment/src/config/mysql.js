import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Create connection pool using mysql2/promise
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'vehicle_rental_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30', // Indian Standard Time
  dateStrings: true,
});

// Test connection on module load
pool.getConnection()
  .then((conn) => {
    console.log(`[MySQL 8.0] Connected successfully to database: ${process.env.MYSQL_DATABASE || 'vehicle_rental_db'}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`[MySQL Error] Failed to connect to MySQL database:`, err.message);
  });

export default pool;
