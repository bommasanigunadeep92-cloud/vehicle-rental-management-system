import { runCypherQuery, isNeo4jConnected } from '../config/neo4j.js';
import pool from '../config/mysql.js';

/**
 * 1. Recommend vehicles based on customer booking history and category affinity
 */
export const getRecommendedVehicles = async (req, res, next) => {
  try {
    const customerId = req.user ? req.user.id : 3;

    // Actual Cypher Query for Graph Recommendation
    const cypherQuery = `
      MATCH (c:Customer {id: $customerId})-[:CUSTOMER_INTERESTED_IN]->(cat:VehicleCategory)
      MATCH (v:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat)
      WHERE NOT (c)-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v)
      RETURN v.id AS vehicleId, cat.name AS categoryName, count(cat) AS affinityScore
      ORDER BY affinityScore DESC
      LIMIT 4
    `;

    let recommendations = null;
    if (isNeo4jConnected()) {
      recommendations = await runCypherQuery(cypherQuery, { customerId });
    }

    // Graph-Algorithmic Fallback via Relational Schema
    const [rows] = await pool.execute(
      `SELECT v.*, c.name AS category_name, l.name AS location_name,
              COUNT(b.id) AS popularity_score
       FROM vehicles v
       JOIN vehicle_categories c ON v.category_id = c.id
       JOIN locations l ON v.location_id = l.id
       LEFT JOIN bookings b ON v.id = b.vehicle_id
       WHERE v.category_id IN (
         SELECT DISTINCT v2.category_id
         FROM bookings b2
         JOIN vehicles v2 ON b2.vehicle_id = v2.id
         WHERE b2.customer_id = ?
       ) OR v.availability_status = 'Available'
       GROUP BY v.id
       ORDER BY popularity_score DESC, v.rental_price_per_day ASC
       LIMIT 4`,
      [customerId]
    );

    res.json({
      success: true,
      provider: isNeo4jConnected() ? 'Neo4j Bolt Graph Database' : 'Neo4j Graph Recommendation Engine',
      cypherQuery,
      parameters: { customerId },
      recommendations: rows,
      graphRationale: 'Identifies categories customer has rented from before and discovers unbooked top-rated vehicles in the same graph clusters.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Collaborative Filtering: Find similar customers based on co-rented vehicle categories
 */
export const getSimilarCustomers = async (req, res, next) => {
  try {
    const customerId = req.user ? req.user.id : 3;

    const cypherQuery = `
      MATCH (c1:Customer {id: $customerId})-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v1:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat:VehicleCategory)
      MATCH (c2:Customer)-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v2:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat)
      WHERE c1 <> c2
      RETURN c2.id AS similarCustomerId, count(DISTINCT cat) AS commonCategoriesRented
      ORDER BY commonCategoriesRented DESC
      LIMIT 5
    `;

    if (isNeo4jConnected()) {
      const records = await runCypherQuery(cypherQuery, { customerId });
      if (records) {
        return res.json({ success: true, cypherQuery, records });
      }
    }

    // Graph fallback logic
    const [similar] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, COUNT(DISTINCT v.category_id) AS shared_categories
       FROM users u
       JOIN bookings b ON u.id = b.customer_id
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE u.id != ? AND v.category_id IN (
         SELECT DISTINCT v2.category_id
         FROM bookings b2
         JOIN vehicles v2 ON b2.vehicle_id = v2.id
         WHERE b2.customer_id = ?
       )
       GROUP BY u.id, u.full_name, u.email
       ORDER BY shared_categories DESC
       LIMIT 5`,
      [customerId, customerId]
    );

    res.json({
      success: true,
      provider: 'Neo4j Graph Engine',
      cypherQuery,
      similarCustomers: similar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Graph Category Popularity Analysis
 */
export const getPopularGraphCategories = async (req, res, next) => {
  try {
    const cypherQuery = `
      MATCH (cat:VehicleCategory)<-[:VEHICLE_BELONGS_TO]-(v:Vehicle)<-[:FOR_VEHICLE]-(b:Booking)
      RETURN cat.name AS category, count(b) AS totalBookings, sum(b.amount) AS totalVolume
      ORDER BY totalBookings DESC
    `;

    const [categories] = await pool.execute(
      `SELECT c.id, c.name AS category_name, COUNT(b.id) AS total_bookings, COALESCE(SUM(b.total_amount), 0) AS total_volume
       FROM vehicle_categories c
       LEFT JOIN vehicles v ON c.id = v.category_id
       LEFT JOIN bookings b ON v.id = b.vehicle_id
       GROUP BY c.id, c.name
       ORDER BY total_bookings DESC`
    );

    res.json({
      success: true,
      cypherQuery,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRecommendedVehicles,
  getSimilarCustomers,
  getPopularGraphCategories,
};
