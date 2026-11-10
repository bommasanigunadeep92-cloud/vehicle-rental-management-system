import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const newUrl = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80';

async function update() {
  console.log('--- Updating Maruti Suzuki Swift Image ---');

  // 1. Update MySQL
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'gunadeep@9999',
      database: process.env.MYSQL_DATABASE || 'vehicle_rental_db',
    });
    const [res] = await conn.execute(
      'UPDATE vehicles SET image_url = ? WHERE id = 5 OR registration_number = ?',
      [newUrl, 'KA-03-SW-5566']
    );
    console.log('✓ MySQL rows updated:', res.affectedRows);
    await conn.end();
  } catch (err) {
    console.warn('MySQL update skipped:', err.message);
  }

  // 2. Clear Redis cache for vehicles
  try {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const redis = new Redis(redisUrl);
      const keys = await redis.keys('cache:vehicles*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✓ Cleared ${keys.length} Redis vehicle cache keys`);
      } else {
        console.log('✓ Redis vehicle cache was already clear.');
      }
      redis.disconnect();
    }
  } catch (err) {
    console.warn('Redis clear skipped:', err.message);
  }

  console.log('--- Done! ---');
}

update();
