import pool from '../config/mysql.js';

export const getAllCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, u.phone, u.driving_license, u.address, u.status, u.created_at,
              COUNT(b.id) AS total_rentals,
              COALESCE(SUM(b.total_amount), 0) AS total_spent
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN bookings b ON u.id = b.customer_id
       WHERE r.name = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      count: rows.length,
      customers: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Suspended', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await pool.execute('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Customer account status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCustomers,
  updateCustomerStatus,
};
