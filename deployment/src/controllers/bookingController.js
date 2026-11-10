import pool from '../config/mysql.js';
import { invalidateCache } from '../config/redis.js';
import { getMongoDb } from '../config/mongodb.js';
import { runCypherQuery } from '../config/neo4j.js';

/**
 * ACID Transactional Booking Creation with InnoDB Row-Level Locking (SELECT ... FOR UPDATE)
 */
export const createBooking = async (req, res, next) => {
  const customerId = req.user.id;
  const {
    vehicle_id,
    pickup_location_id,
    return_location_id,
    pickup_date,
    return_date,
    payment_method,
    notes,
  } = req.body;

  // 1. Validation
  if (!vehicle_id || !pickup_location_id || !return_location_id || !pickup_date || !return_date) {
    return res.status(400).json({
      success: false,
      message: 'All booking fields (vehicle, pickup location, return location, pickup date, return date) are required.',
    });
  }

  const pDate = new Date(pickup_date);
  const rDate = new Date(return_date);
  const now = new Date();

  // Allow bookings from today onwards (subtract 10 mins buffer for clock skew)
  if (pDate.getTime() < now.getTime() - 10 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: 'Pickup date cannot be in the past.',
    });
  }

  if (rDate <= pDate) {
    return res.status(400).json({
      success: false,
      message: 'Return date must be strictly after the pickup date.',
    });
  }

  // Calculate rental duration in days
  const diffTime = Math.abs(rDate.getTime() - pDate.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Acquire dedicated connection from MySQL pool
  const conn = await pool.getConnection();

  try {
    // 2. BEGIN TRANSACTION
    await conn.beginTransaction();
    console.log(`[TRANSACTION START] Customer #${customerId} booking Vehicle #${vehicle_id}`);

    // 3. ROW-LEVEL LOCKING: Lock vehicle record using SELECT ... FOR UPDATE
    const [vehicles] = await conn.execute(
      `SELECT id, category_id, brand, model, rental_price_per_day, availability_status
       FROM vehicles
       WHERE id = ?
       FOR UPDATE`,
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    const vehicle = vehicles[0];

    if (vehicle.availability_status === 'Maintenance') {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently undergoing maintenance and is not available for rental.',
      });
    }

    // 4. OVERLAP CHECK: Prevent Double Booking using MySQL Row-Safe Conflict Query
    const [overlapping] = await conn.execute(
      `SELECT id, booking_reference, pickup_date, return_date, booking_status
       FROM bookings
       WHERE vehicle_id = ?
         AND booking_status IN ('Confirmed', 'Active')
         AND NOT (return_date <= ? OR pickup_date >= ?)
       FOR UPDATE`,
      [vehicle_id, pickup_date, return_date]
    );

    if (overlapping.length > 0) {
      await conn.rollback();
      console.warn(`[TRANSACTION ROLLBACK] Conflict detected for Vehicle #${vehicle_id} between ${pickup_date} and ${return_date}`);
      return res.status(409).json({
        success: false,
        message: `Conflict: Vehicle is already reserved between ${overlapping[0].pickup_date} and ${overlapping[0].return_date}. Please choose another vehicle or alternate dates.`,
      });
    }

    // 5. CALCULATE TOTAL AMOUNT
    const totalAmount = parseFloat(vehicle.rental_price_per_day) * totalDays;
    const bookingRef = 'BK-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

    // 6. INSERT BOOKING RECORD
    const [bookingResult] = await conn.execute(
      `INSERT INTO bookings (booking_reference, customer_id, vehicle_id, pickup_location_id, return_location_id, pickup_date, return_date, total_days, total_amount, booking_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
      [
        bookingRef,
        customerId,
        vehicle_id,
        pickup_location_id,
        return_location_id,
        pickup_date,
        return_date,
        totalDays,
        totalAmount,
        notes || 'Booked via DriveElite Portal',
      ]
    );

    const bookingId = bookingResult.insertId;

    // 7. INSERT PAYMENT RECORD (Simulated Gateway)
    const txnRef = 'TXN-' + (payment_method || 'UPI').toUpperCase().replace(/\s+/g, '') + '-' + Date.now().toString().slice(-8);
    await conn.execute(
      `INSERT INTO payments (booking_id, customer_id, amount, payment_method, payment_status, transaction_reference)
       VALUES (?, ?, ?, ?, 'Successful', ?)`,
      [bookingId, customerId, totalAmount, payment_method || 'UPI', txnRef]
    );

    // 8. COMMIT TRANSACTION
    await conn.commit();
    console.log(`[TRANSACTION COMMIT SUCCESS] Booking ID #${bookingId} confirmed.`);

    // 9. Invalidate Redis Caches
    await invalidateCache('cache:vehicles:*');
    await invalidateCache(`cache:vehicle:${vehicle_id}`);

    // 10. Record in MongoDB User Activity Logs
    try {
      const mongo = getMongoDb();
      await mongo.collection('user_activity_logs').insertOne({
        user_id: customerId,
        action: 'BOOKING_CREATED',
        booking_id: bookingId,
        booking_reference: bookingRef,
        vehicle_id,
        total_amount: totalAmount,
        timestamp: new Date(),
      });
    } catch (e) {}

    // 11. Sync with Neo4j Graph DB (Relationship Graph)
    try {
      const cypher = `
        MERGE (c:Customer {id: $customerId})
        MERGE (v:Vehicle {id: $vehicleId})
        MERGE (cat:VehicleCategory {id: $categoryId})
        MERGE (b:Booking {id: $bookingId, reference: $bookingRef, amount: $amount})
        MERGE (c)-[:CUSTOMER_BOOKED]->(b)
        MERGE (b)-[:FOR_VEHICLE]->(v)
        MERGE (v)-[:VEHICLE_BELONGS_TO]->(cat)
        MERGE (c)-[:CUSTOMER_INTERESTED_IN]->(cat)
      `;
      await runCypherQuery(cypher, {
        customerId,
        vehicleId,
        categoryId: vehicle.category_id,
        bookingId,
        bookingRef,
        amount: totalAmount,
      });
    } catch (e) {
      console.warn('[Neo4j Sync Warn]', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully with instant payment processing!',
      booking: {
        id: bookingId,
        booking_reference: bookingRef,
        vehicle: `${vehicle.brand} ${vehicle.model}`,
        total_days: totalDays,
        total_amount: totalAmount,
        booking_status: 'Confirmed',
        transaction_reference: txnRef,
        pickup_date,
        return_date,
      },
    });
  } catch (error) {
    // 12. TRANSACTION ROLLBACK ON ANY ERROR
    await conn.rollback();
    console.error('[TRANSACTION ROLLBACK ERROR]', error);
    next(error);
  } finally {
    // 13. Always release the connection back to pool
    conn.release();
  }
};

/**
 * Retrieve Bookings with Role-Based Scoping
 */
export const getBookings = async (req, res, next) => {
  try {
    const user = req.user;
    let query = `
      SELECT b.*,
             v.brand, v.model, v.registration_number, v.image_url, v.rental_price_per_day,
             u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             pl.name AS pickup_location_name,
             rl.name AS return_location_name,
             p.payment_status, p.payment_method, p.transaction_reference
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users u ON b.customer_id = u.id
      JOIN locations pl ON b.pickup_location_id = pl.id
      JOIN locations rl ON b.return_location_id = rl.id
      LEFT JOIN payments p ON b.id = p.booking_id
    `;
    const params = [];

    // Customers see ONLY their own bookings; Admins & Managers see all bookings
    if (user.role === 'customer') {
      query += ` WHERE b.customer_id = ?`;
      params.push(user.id);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      count: rows.length,
      bookings: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.execute(
      `SELECT b.*,
              v.brand, v.model, v.registration_number, v.image_url, v.fuel_type, v.transmission,
              u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              pl.name AS pickup_location_name, pl.address AS pickup_address,
              rl.name AS return_location_name, rl.address AS return_address,
              p.payment_status, p.payment_method, p.transaction_reference, p.amount AS paid_amount
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.customer_id = u.id
       JOIN locations pl ON b.pickup_location_id = pl.id
       JOIN locations rl ON b.return_location_id = rl.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = rows[0];

    // Authorization check: customer cannot view another customer's booking
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking record.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Transactional Booking Cancellation & Availability Restoration
 */
export const cancelBooking = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [bookings] = await conn.execute(
      `SELECT * FROM bookings WHERE id = ? FOR UPDATE`,
      [id]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    // Check ownership or admin/manager role
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.booking_status === 'Cancelled') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.booking_status === 'Completed') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Completed trips cannot be cancelled.' });
    }

    // 1. Update Booking Status
    await conn.execute(
      `UPDATE bookings SET booking_status = 'Cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // 2. Update Payment Status to Refunded
    await conn.execute(
      `UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ?`,
      [id]
    );

    await conn.commit();
    console.log(`[TRANSACTION CANCEL COMMIT] Booking #${id} successfully cancelled & refunded.`);

    // Invalidate Redis cache
    await invalidateCache('cache:vehicles:*');
    await invalidateCache(`cache:vehicle:${booking.vehicle_id}`);

    // Log in MongoDB
    try {
      const mongo = getMongoDb();
      await mongo.collection('user_activity_logs').insertOne({
        user_id: user.id,
        booking_id: Number(id),
        action: 'BOOKING_CANCELLED',
        timestamp: new Date(),
      });
    } catch (e) {}

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Payment has been queued for full refund.',
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

/**
 * Update Booking Lifecycle Status (Manager / Admin: e.g. Active, Completed)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await pool.execute(
      `UPDATE bookings SET booking_status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    // Invalidate vehicle cache
    await invalidateCache('cache:vehicles:*');

    res.json({
      success: true,
      message: `Booking status updated to "${status}".`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
