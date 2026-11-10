import pool from '../config/mysql.js';
import { invalidateCache } from '../config/redis.js';

export const getMaintenanceRecords = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT m.*, v.brand, v.model, v.registration_number
       FROM maintenance_records m
       JOIN vehicles v ON m.vehicle_id = v.id
       ORDER BY m.service_date DESC`
    );

    res.json({
      success: true,
      count: rows.length,
      records: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceRecord = async (req, res, next) => {
  try {
    const { vehicle_id, service_type, service_date, cost, description, performed_by, status, update_vehicle_status } = req.body;

    if (!vehicle_id || !service_type || !service_date) {
      return res.status(400).json({ success: false, message: 'Vehicle, service type, and date are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO maintenance_records (vehicle_id, service_type, service_date, cost, description, performed_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_id, service_type, service_date, cost || 0, description || null, performed_by || null, status || 'Scheduled']
    );

    if (update_vehicle_status) {
      await pool.execute('UPDATE vehicles SET availability_status = ? WHERE id = ?', [update_vehicle_status, vehicle_id]);
      await invalidateCache('cache:vehicles:*');
      await invalidateCache(`cache:vehicle:${vehicle_id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully.',
      recordId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMaintenanceRecords,
  createMaintenanceRecord,
};
