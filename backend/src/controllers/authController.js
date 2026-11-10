import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'drive_elite_jwt_secure_key_2026_xyz987';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, driving_license, address } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Default to 'customer' role (id: 3)
    const [roleRows] = await pool.execute('SELECT id, name FROM roles WHERE name = ?', ['customer']);
    const roleId = roleRows.length > 0 ? roleRows[0].id : 3;

    const [result] = await pool.execute(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, driving_license, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [roleId, full_name.trim(), email.toLowerCase().trim(), password_hash, phone || null, driving_license || null, address || null]
    );

    const userId = result.insertId;

    // Log activity in MongoDB NoSQL
    try {
      const mongo = getMongoDb();
      await mongo.collection('user_activity_logs').insertOne({
        user_id: userId,
        user_email: email.toLowerCase().trim(),
        action: 'USER_REGISTER',
        ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
        metadata: { role: 'customer' },
      });
    } catch (logErr) {
      console.warn('[NoSQL Log Warning]', logErr.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: 'customer', full_name: full_name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DriveElite.',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        role: 'customer',
        phone: phone || null,
        driving_license: driving_license || null,
        address: address || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const [users] = await pool.execute(
      `SELECT u.id, u.role_id, u.full_name, u.email, u.password_hash, u.phone, u.driving_license, u.address, u.status, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact administrator support.`,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Record login activity in MongoDB
    try {
      const mongo = getMongoDb();
      await mongo.collection('user_activity_logs').insertOne({
        user_id: user.id,
        user_email: user.email,
        action: 'USER_LOGIN',
        ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
        metadata: { role: user.role },
      });
    } catch (logErr) {
      console.warn('[NoSQL Log Warning]', logErr.message);
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        driving_license: user.driving_license,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, new_password, security_key } = req.body;

    if (!email || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const [users] = await pool.execute('SELECT id, email, full_name FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email address.',
      });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await pool.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, user.id]);

    // Log activity
    try {
      const mongo = getMongoDb();
      await mongo.collection('user_activity_logs').insertOne({
        user_id: user.id,
        user_email: user.email,
        action: 'PASSWORD_RESET',
        timestamp: new Date(),
        ip_address: req.ip || '127.0.0.1',
      });
    } catch (e) {}

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, driving_license, address } = req.body;
    const userId = req.user.id;

    await pool.execute(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           driving_license = COALESCE(?, driving_license),
           address = COALESCE(?, address),
           updated_at = NOW()
       WHERE id = ?`,
      [full_name, phone, driving_license, address, userId]
    );

    const [updated] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, u.phone, u.driving_license, u.address, u.status, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  forgotPassword,
  getCurrentUser,
  updateProfile,
};
