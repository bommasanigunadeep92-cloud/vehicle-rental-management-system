import pool from '../config/mysql.js';

export const getPayments = async (req, res, next) => {
  try {
    const user = req.user;
    let query = `
      SELECT p.*,
             b.booking_reference,
             u.full_name AS customer_name,
             u.email AS customer_email,
             v.brand, v.model, v.registration_number
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON p.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
    `;
    const params = [];

    if (user.role === 'customer') {
      query += ` WHERE p.customer_id = ?`;
      params.push(user.id);
    }

    query += ` ORDER BY p.payment_date DESC`;

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      count: rows.length,
      payments: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const simulatePayment = async (req, res, next) => {
  try {
    const { booking_id, amount, payment_method } = req.body;
    const customerId = req.user.id;

    if (!booking_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required.',
      });
    }

    const txnRef = `TXN-${(payment_method || 'UPI').toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.execute(
      `INSERT INTO payments (booking_id, customer_id, amount, payment_method, payment_status, transaction_reference)
       VALUES (?, ?, ?, ?, 'Successful', ?)`,
      [booking_id, customerId, amount, payment_method || 'UPI', txnRef]
    );

    res.status(201).json({
      success: true,
      message: 'Payment simulated successfully via Secure Payment Gateway.',
      payment: {
        id: result.insertId,
        booking_id,
        amount,
        payment_method: payment_method || 'UPI',
        payment_status: 'Successful',
        transaction_reference: txnRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPayments,
  simulatePayment,
};
