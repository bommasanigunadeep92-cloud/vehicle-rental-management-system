import pool from '../config/mysql.js';
import { getCache, setCache, invalidateCache } from '../config/redis.js';
import { getMongoDb } from '../config/mongodb.js';

export const getAllVehicles = async (req, res, next) => {
  try {
    const { category, location, fuel, transmission, minPrice, maxPrice, search, status } = req.query;

    // Cache key based on query filters
    const cacheKey = `cache:vehicles:list:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        source: 'Redis Cache (Cache-Aside Pattern)',
        count: cachedData.length,
        vehicles: cachedData,
      });
    }

    let query = `
      SELECT v.*, 
             c.name AS category_name, 
             l.name AS location_name, 
             l.city AS location_city,
             COALESCE(AVG(r.rating), 4.8) AS average_rating,
             COUNT(r.id) AS review_count
      FROM vehicles v
      JOIN vehicle_categories c ON v.category_id = c.id
      JOIN locations l ON v.location_id = l.id
      LEFT JOIN reviews r ON v.id = r.vehicle_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND (c.name = ? OR c.id = ?)`;
      params.push(category, category);
    }
    if (location) {
      query += ` AND (l.name = ? OR l.id = ? OR l.city = ?)`;
      params.push(location, location, location);
    }
    if (fuel) {
      query += ` AND v.fuel_type = ?`;
      params.push(fuel);
    }
    if (transmission) {
      query += ` AND v.transmission = ?`;
      params.push(transmission);
    }
    if (status) {
      query += ` AND v.availability_status = ?`;
      params.push(status);
    }
    if (minPrice) {
      query += ` AND v.rental_price_per_day >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND v.rental_price_per_day <= ?`;
      params.push(Number(maxPrice));
    }
    if (search) {
      query += ` AND (v.brand LIKE ? OR v.model LIKE ? OR v.registration_number LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` GROUP BY v.id ORDER BY v.rental_price_per_day ASC`;

    const [rows] = await pool.execute(query, params);

    // Save to Cache with 300 seconds TTL
    await setCache(cacheKey, rows, 300);

    // Log search activity in MongoDB if filters used
    if (search || category || location) {
      try {
        const mongo = getMongoDb();
        await mongo.collection('user_activity_logs').insertOne({
          user_id: req.user ? req.user.id : null,
          action: 'VEHICLE_SEARCH',
          filters: req.query,
          results_count: rows.length,
          timestamp: new Date(),
        });
      } catch (e) {}
    }

    res.json({
      success: true,
      source: 'MySQL Primary Database',
      count: rows.length,
      vehicles: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `cache:vehicle:${id}`;

    const cachedVehicle = await getCache(cacheKey);
    if (cachedVehicle) {
      return res.json({
        success: true,
        source: 'Redis Cache',
        vehicle: cachedVehicle,
      });
    }

    const [rows] = await pool.execute(
      `SELECT v.*, 
              c.name AS category_name, 
              c.description AS category_description,
              l.name AS location_name, 
              l.address AS location_address,
              l.city AS location_city,
              l.contact_number AS location_contact,
              COALESCE(AVG(r.rating), 4.9) AS average_rating,
              COUNT(r.id) AS review_count
       FROM vehicles v
       JOIN vehicle_categories c ON v.category_id = c.id
       JOIN locations l ON v.location_id = l.id
       LEFT JOIN reviews r ON v.id = r.vehicle_id
       WHERE v.id = ?
       GROUP BY v.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    const vehicle = rows[0];

    // Fetch reviews from MySQL
    const [reviews] = await pool.execute(
      `SELECT r.*, u.full_name AS customer_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.vehicle_id = ?
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );
    vehicle.reviews = reviews;

    // Fetch flexible specs & features from MongoDB NoSQL
    try {
      const mongo = getMongoDb();
      const mongoDetails = await mongo.collection('vehicle_details').findOne({ vehicle_id: Number(id) });
      if (mongoDetails) {
        vehicle.specifications = mongoDetails.specifications || {};
        vehicle.features = mongoDetails.features || [];
        vehicle.accessories_included = mongoDetails.accessories_included || [];
      } else {
        vehicle.specifications = {
          engine: 'High Performance Engine',
          safety: 'Standard ABS, EBD & Airbags',
          boot_capacity: '400+ Litres',
        };
        vehicle.features = ['Touchscreen Infotainment', 'Bluetooth Connectivity', 'Power Windows', 'Rear Parking Sensors'];
        vehicle.accessories_included = ['Fastag Pre-installed', 'First-Aid Kit'];
      }

      // Log view activity in MongoDB
      await mongo.collection('user_activity_logs').insertOne({
        user_id: req.user ? req.user.id : null,
        vehicle_id: Number(id),
        action: 'VEHICLE_VIEW',
        timestamp: new Date(),
      });
    } catch (e) {
      console.warn('[MongoDB vehicle details warn]', e.message);
    }

    // Cache the combined record for 600s
    await setCache(cacheKey, vehicle, 600);

    res.json({
      success: true,
      source: 'MySQL + MongoDB Hybrid',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const {
      category_id,
      location_id,
      registration_number,
      brand,
      model,
      manufacturing_year,
      fuel_type,
      transmission,
      seating_capacity,
      rental_price_per_day,
      image_url,
      availability_status,
      mileage,
      description,
      specifications,
      features,
      accessories_included,
    } = req.body;

    if (!category_id || !location_id || !registration_number || !brand || !model || !manufacturing_year || !rental_price_per_day) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required vehicle details.',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO vehicles (category_id, location_id, registration_number, brand, model, manufacturing_year, fuel_type, transmission, seating_capacity, rental_price_per_day, image_url, availability_status, mileage, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        location_id,
        registration_number.toUpperCase().trim(),
        brand.trim(),
        model.trim(),
        manufacturing_year,
        fuel_type || 'Petrol',
        transmission || 'Manual',
        seating_capacity || 5,
        rental_price_per_day,
        image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        availability_status || 'Available',
        mileage || null,
        description || null,
      ]
    );

    const vehicleId = result.insertId;

    // Save flexible specs into MongoDB
    try {
      const mongo = getMongoDb();
      await mongo.collection('vehicle_details').insertOne({
        vehicle_id: vehicleId,
        registration_number: registration_number.toUpperCase().trim(),
        specifications: specifications || {},
        features: features || [],
        accessories_included: accessories_included || [],
        createdAt: new Date(),
      });
    } catch (e) {}

    // Invalidate vehicle cache
    await invalidateCache('cache:vehicles:*');

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully to fleet.',
      vehicleId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      location_id,
      brand,
      model,
      manufacturing_year,
      fuel_type,
      transmission,
      seating_capacity,
      rental_price_per_day,
      image_url,
      availability_status,
      mileage,
      description,
      specifications,
      features,
      accessories_included,
    } = req.body;

    await pool.execute(
      `UPDATE vehicles
       SET category_id = COALESCE(?, category_id),
           location_id = COALESCE(?, location_id),
           brand = COALESCE(?, brand),
           model = COALESCE(?, model),
           manufacturing_year = COALESCE(?, manufacturing_year),
           fuel_type = COALESCE(?, fuel_type),
           transmission = COALESCE(?, transmission),
           seating_capacity = COALESCE(?, seating_capacity),
           rental_price_per_day = COALESCE(?, rental_price_per_day),
           image_url = COALESCE(?, image_url),
           availability_status = COALESCE(?, availability_status),
           mileage = COALESCE(?, mileage),
           description = COALESCE(?, description),
           updated_at = NOW()
       WHERE id = ?`,
      [
        category_id,
        location_id,
        brand,
        model,
        manufacturing_year,
        fuel_type,
        transmission,
        seating_capacity,
        rental_price_per_day,
        image_url,
        availability_status,
        mileage,
        description,
        id,
      ]
    );

    // Update MongoDB flexible document
    try {
      const mongo = getMongoDb();
      await mongo.collection('vehicle_details').updateOne(
        { vehicle_id: Number(id) },
        {
          $set: {
            ...(specifications && { specifications }),
            ...(features && { features }),
            ...(accessories_included && { accessories_included }),
          },
        }
      );
    } catch (e) {}

    // Invalidate Redis cache
    await invalidateCache('cache:vehicles:*');
    await invalidateCache(`cache:vehicle:${id}`);

    res.json({
      success: true,
      message: 'Vehicle updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if vehicle has active/confirmed bookings
    const [activeBookings] = await pool.execute(
      `SELECT id FROM bookings WHERE vehicle_id = ? AND booking_status IN ('Confirmed', 'Active')`,
      [id]
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active or upcoming confirmed bookings. Please reassign or complete bookings first.',
      });
    }

    await pool.execute('DELETE FROM vehicles WHERE id = ?', [id]);

    // Delete MongoDB document
    try {
      const mongo = getMongoDb();
      await mongo.collection('vehicle_details').deleteMany({ vehicle_id: Number(id) });
    } catch (e) {}

    // Invalidate Redis cache
    await invalidateCache('cache:vehicles:*');
    await invalidateCache(`cache:vehicle:${id}`);

    res.json({
      success: true,
      message: 'Vehicle deleted from fleet successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleCategories = async (req, res, next) => {
  try {
    const cacheKey = 'cache:categories:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, source: 'Redis', categories: cached });

    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(v.id) AS vehicle_count
       FROM vehicle_categories c
       LEFT JOIN vehicles v ON c.id = v.category_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    await setCache(cacheKey, rows, 600);
    res.json({ success: true, categories: rows });
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const cacheKey = 'cache:locations:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, source: 'Redis', locations: cached });

    const [rows] = await pool.execute(
      `SELECT l.*, COUNT(v.id) AS vehicle_count
       FROM locations l
       LEFT JOIN vehicles v ON l.id = v.location_id
       GROUP BY l.id
       ORDER BY l.name ASC`
    );

    await setCache(cacheKey, rows, 600);
    res.json({ success: true, locations: rows });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleCategories,
  getLocations,
};
