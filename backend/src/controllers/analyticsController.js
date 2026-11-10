import pool from '../config/mysql.js';
import { getCache, setCache } from '../config/redis.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const cacheKey = 'cache:analytics:dashboard';
    const cachedStats = await getCache(cacheKey);
    if (cachedStats) {
      return res.json({
        success: true,
        source: 'Redis Cache',
        data: cachedStats,
      });
    }

    // 1. KPI Aggregates
    const [[kpiCounts]] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE availability_status = 'Available') AS available_vehicles,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE booking_status = 'Active') AS active_rentals,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Successful') AS total_revenue
    `);

    // 2. Monthly Revenue Trend (Last 6 Months)
    const [monthlyRevenue] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%b %Y') AS month,
        DATE_FORMAT(payment_date, '%Y-%m') AS month_key,
        SUM(amount) AS revenue,
        COUNT(id) AS transaction_count
      FROM payments
      WHERE payment_status = 'Successful'
      GROUP BY month_key, month
      ORDER BY month_key ASC
      LIMIT 6
    `);

    // 3. Most Rented Vehicles (Top 5)
    const [mostRented] = await pool.execute(`
      SELECT 
        v.id, v.brand, v.model, v.registration_number, v.image_url,
        COUNT(b.id) AS rental_count,
        SUM(b.total_amount) AS revenue_generated
      FROM vehicles v
      JOIN bookings b ON v.id = b.vehicle_id
      GROUP BY v.id
      ORDER BY rental_count DESC
      LIMIT 5
    `);

    // 4. Popular Vehicle Categories
    const [popularCategories] = await pool.execute(`
      SELECT 
        c.name AS category_name,
        COUNT(b.id) AS booking_count,
        COALESCE(SUM(b.total_amount), 0) AS total_revenue
      FROM vehicle_categories c
      LEFT JOIN vehicles v ON c.id = v.category_id
      LEFT JOIN bookings b ON v.id = b.vehicle_id
      GROUP BY c.id, c.name
      ORDER BY booking_count DESC
    `);

    // 5. Booking Status Breakdown
    const [statusBreakdown] = await pool.execute(`
      SELECT booking_status AS status, COUNT(*) AS count
      FROM bookings
      GROUP BY booking_status
    `);

    // 6. Fleet Availability Distribution
    const [fleetStatus] = await pool.execute(`
      SELECT availability_status AS status, COUNT(*) AS count
      FROM vehicles
      GROUP BY availability_status
    `);

    const analyticsData = {
      kpi: kpiCounts,
      monthlyRevenue,
      mostRented,
      popularCategories,
      statusBreakdown,
      fleetStatus,
    };

    // Cache analytics for 120 seconds
    await setCache(cacheKey, analyticsData, 120);

    res.json({
      success: true,
      source: 'MySQL Primary Database (SQL Aggregation)',
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardAnalytics,
};
