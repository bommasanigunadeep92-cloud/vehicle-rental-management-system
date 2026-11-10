import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isConnected = false;

// In-Memory Cache Fallback with TTL
class MemoryCache {
  constructor() {
    this.store = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return item.value;
  }

  async set(key, value, ...args) {
    this.stats.sets++;
    let expiry = null;
    // Check if EX / PX was passed: set(key, value, 'EX', 300)
    if (args.length >= 2 && String(args[0]).toUpperCase() === 'EX') {
      expiry = Date.now() + parseInt(args[1], 10) * 1000;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.stats.sets++;
    const expiry = Date.now() + parseInt(seconds, 10) * 1000;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    this.stats.deletes += count;
    return count;
  }

  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matched = [];
    for (const [key, item] of this.store.entries()) {
      if (item.expiry && item.expiry < Date.now()) {
        this.store.delete(key);
        continue;
      }
      if (regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }

  async flushall() {
    this.store.clear();
    return 'OK';
  }

  getStats() {
    return {
      provider: 'MemoryCache (Redis-Compatible Fallback)',
      activeKeys: this.store.size,
      ...this.stats,
    };
  }
}

const memoryCache = new MemoryCache();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) return null; // stop retrying quickly
      return 1000;
    },
    lazyConnect: true,
  });

  redisClient.connect()
    .then(() => {
      isConnected = true;
      console.log(`[Redis] Connected successfully to Redis server at ${redisUrl}`);
    })
    .catch((err) => {
      isConnected = false;
      console.log(`[Redis Info] Native Redis server not running locally (${err.message}). Using high-performance In-Memory Cache-Aside Fallback.`);
    });

  redisClient.on('error', (err) => {
    isConnected = false;
  });
} catch (e) {
  isConnected = false;
}

export const getCache = async (key) => {
  try {
    if (isConnected && redisClient) {
      const data = await redisClient.get(key);
      if (data) console.log(`[Cache HIT] Key: ${key} (Redis)`);
      else console.log(`[Cache MISS] Key: ${key} (Redis)`);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    console.warn(`[Redis Read Error] Falling back to memory:`, err.message);
  }

  const data = await memoryCache.get(key);
  if (data) console.log(`[Cache HIT] Key: ${key} (In-Memory)`);
  else console.log(`[Cache MISS] Key: ${key} (In-Memory)`);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  const serialized = JSON.stringify(value);
  try {
    if (isConnected && redisClient) {
      await redisClient.setex(key, ttlSeconds, serialized);
      console.log(`[Cache SET] Key: ${key} TTL: ${ttlSeconds}s (Redis)`);
      return;
    }
  } catch (err) {
    console.warn(`[Redis Write Error] Falling back to memory:`, err.message);
  }

  await memoryCache.setex(key, ttlSeconds, serialized);
  console.log(`[Cache SET] Key: ${key} TTL: ${ttlSeconds}s (In-Memory)`);
};

export const invalidateCache = async (pattern) => {
  try {
    if (isConnected && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`[Cache INVALIDATE] Removed ${keys.length} keys matching "${pattern}" (Redis)`);
      }
      return;
    }
  } catch (err) {
    console.warn(`[Redis Invalidate Error]:`, err.message);
  }

  const keys = await memoryCache.keys(pattern);
  if (keys.length > 0) {
    await memoryCache.del(...keys);
    console.log(`[Cache INVALIDATE] Removed ${keys.length} keys matching "${pattern}" (In-Memory)`);
  }
};

export const getCacheStats = async () => {
  if (isConnected && redisClient) {
    const info = await redisClient.info('stats');
    return { provider: 'Redis 7.x (Cloud/Local)', raw: info };
  }
  return memoryCache.getStats();
};

export default {
  getCache,
  setCache,
  invalidateCache,
  getCacheStats,
};
