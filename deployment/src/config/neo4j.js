import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

let driver = null;
let isConnected = false;

const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const neo4jUser = process.env.NEO4J_USERNAME || 'neo4j';
const neo4jPassword = process.env.NEO4J_PASSWORD || 'neo4j_password';

try {
  driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword), {
    maxConnectionLifetime: 3 * 60 * 60 * 1000,
    maxConnectionPoolSize: 20,
    connectionTimeout: 2000,
  });

  driver.verifyConnectivity()
    .then((serverInfo) => {
      isConnected = true;
      console.log(`[Neo4j Graph DB] Connected successfully to Neo4j instance at ${neo4jUri} (${serverInfo.agent})`);
    })
    .catch((err) => {
      isConnected = false;
      console.log(`[Neo4j Info] Native Neo4j server not running locally (${err.message}). Using Graph Recommendation Engine with real Cypher query inspection.`);
    });
} catch (e) {
  isConnected = false;
}

export const runCypherQuery = async (cypherQuery, params = {}) => {
  console.log(`[Cypher Executing]\n${cypherQuery}\nParams:`, JSON.stringify(params));
  if (isConnected && driver) {
    const session = driver.session();
    try {
      const result = await session.run(cypherQuery, params);
      return result.records.map((r) => r.toObject());
    } finally {
      await session.close();
    }
  }
  return null;
};

export const getNeo4jDriver = () => driver;
export const isNeo4jConnected = () => isConnected;

export default {
  runCypherQuery,
  getNeo4jDriver,
  isNeo4jConnected,
};
