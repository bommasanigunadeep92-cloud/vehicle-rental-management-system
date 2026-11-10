import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let mongoClient = null;
let mongoDb = null;
let isConnected = false;

// In-Memory Document Store Fallback for resilient college project execution
class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.documents = [];
  }

  async insertOne(doc) {
    const newDoc = {
      _id: 'doc_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date(),
      ...doc,
    };
    this.documents.push(newDoc);
    return { acknowledged: true, insertedId: newDoc._id };
  }

  async insertMany(docs) {
    const insertedIds = {};
    const created = docs.map((doc, idx) => {
      const id = 'doc_' + Math.random().toString(36).substring(2, 11) + (Date.now() + idx).toString(36);
      insertedIds[idx] = id;
      return { _id: id, createdAt: new Date(), ...doc };
    });
    this.documents.push(...created);
    return { acknowledged: true, insertedCount: docs.length, insertedIds };
  }

  async find(query = {}) {
    let result = this._filter(this.documents, query);
    const self = this;
    return {
      sort: (sortObj) => ({
        limit: (limitNum) => ({
          toArray: async () => {
            let res = [...result];
            const sortKey = Object.keys(sortObj)[0];
            if (sortKey) {
              const dir = sortObj[sortKey];
              res.sort((a, b) => (a[sortKey] > b[sortKey] ? dir : -dir));
            }
            return res.slice(0, limitNum);
          },
        }),
        toArray: async () => {
          let res = [...result];
          const sortKey = Object.keys(sortObj)[0];
          if (sortKey) {
            const dir = sortObj[sortKey];
            res.sort((a, b) => (a[sortKey] > b[sortKey] ? dir : -dir));
          }
          return res;
        },
      }),
      limit: (limitNum) => ({
        toArray: async () => result.slice(0, limitNum),
      }),
      toArray: async () => result,
    };
  }

  async findOne(query = {}) {
    const result = this._filter(this.documents, query);
    return result.length > 0 ? result[0] : null;
  }

  async updateOne(filter, update) {
    const doc = await this.findOne(filter);
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    if (update.$set) {
      Object.assign(doc, update.$set, { updatedAt: new Date() });
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async countDocuments(query = {}) {
    return this._filter(this.documents, query).length;
  }

  async aggregate(pipeline = []) {
    let data = [...this.documents];
    for (const stage of pipeline) {
      if (stage.$match) {
        data = this._filter(data, stage.$match);
      }
      if (stage.$group) {
        const groupField = stage.$group._id ? stage.$group._id.replace('$', '') : null;
        const groups = {};
        for (const item of data) {
          const key = groupField ? item[groupField] : 'all';
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
        }
        data = Object.keys(groups).map((key) => {
          const groupResult = { _id: key === 'all' ? null : key };
          for (const [k, v] of Object.entries(stage.$group)) {
            if (k === '_id') continue;
            if (v.$sum === 1) groupResult[k] = groups[key].length;
            else if (typeof v.$sum === 'string' && v.$sum.startsWith('$')) {
              const f = v.$sum.substring(1);
              groupResult[k] = groups[key].reduce((acc, curr) => acc + (Number(curr[f]) || 0), 0);
            }
          }
          return groupResult;
        });
      }
      if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const dir = stage.$sort[sortKey];
        data.sort((a, b) => (a[sortKey] > b[sortKey] ? dir : -dir));
      }
      if (stage.$limit) {
        data = data.slice(0, stage.$limit);
      }
    }
    return {
      toArray: async () => data,
    };
  }

  _filter(docs, query) {
    return docs.filter((doc) => {
      for (const [k, v] of Object.entries(query)) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          if (v.$in && !v.$in.includes(doc[k])) return false;
          if (v.$regex && !new RegExp(v.$regex, 'i').test(String(doc[k]))) return false;
        } else if (doc[k] !== v) {
          return false;
        }
      }
      return true;
    });
  }
}

class MemoryDb {
  constructor() {
    this.collections = {
      vehicle_details: new MemoryCollection('vehicle_details'),
      user_activity_logs: new MemoryCollection('user_activity_logs'),
      rental_documents: new MemoryCollection('rental_documents'),
    };
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MemoryCollection(name);
    }
    return this.collections[name];
  }
}

const memoryDb = new MemoryDb();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental_nosql';

try {
  mongoClient = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
  });

  mongoClient.connect()
    .then((client) => {
      mongoDb = client.db();
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to NoSQL database at ${mongoUri}`);
    })
    .catch((err) => {
      isConnected = false;
      console.log(`[MongoDB Info] Native MongoDB server not running locally (${err.message}). Using high-performance In-Memory Document Store Fallback.`);
    });
} catch (e) {
  isConnected = false;
}

export const getMongoDb = () => {
  if (isConnected && mongoDb) {
    return mongoDb;
  }
  return memoryDb;
};

export const isMongoConnected = () => isConnected;

export default {
  getMongoDb,
  isMongoConnected,
};
