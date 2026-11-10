import bcrypt from 'bcryptjs';
import pool from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';

export const seedDatabase = async () => {
  console.log('--- [STARTING DATABASE SEEDING] ---');

  // 1. SEED ROLES
  console.log('1. Seeding Roles...');
  const roles = [
    { id: 1, name: 'admin', description: 'System Administrator with full access' },
    { id: 2, name: 'manager', description: 'Rental Fleet Manager with operational control' },
    { id: 3, name: 'customer', description: 'Customer who books vehicles' },
  ];

  for (const r of roles) {
    await pool.execute(
      `INSERT INTO roles (id, name, description) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [r.id, r.name, r.description]
    );
  }

  // 2. SEED USERS WITH BCRYPT HASHES
  console.log('2. Seeding Users (Admin, Manager, Customers)...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const managerPasswordHash = await bcrypt.hash('Manager@123', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@123', salt);

  const users = [
    {
      role_id: 1,
      full_name: 'Rajesh Kumar (System Admin)',
      email: 'admin@vehiclerental.com',
      password_hash: adminPasswordHash,
      phone: '+91 98450 11223',
      driving_license: 'KA-01-2015-0012345',
      address: 'Prestige Tech Park, Marathahalli, Bangalore, Karnataka',
      status: 'Active',
    },
    {
      role_id: 2,
      full_name: 'Vikram Malhotra (Rental Manager)',
      email: 'manager@vehiclerental.com',
      password_hash: managerPasswordHash,
      phone: '+91 98200 44556',
      driving_license: 'KA-03-2018-0098765',
      address: 'Koramangala 4th Block, Bangalore, Karnataka',
      status: 'Active',
    },
    {
      role_id: 3,
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password_hash: customerPasswordHash,
      phone: '+91 98765 43210',
      driving_license: 'DL-04-2020-0045678',
      address: 'Indiranagar 100ft Road, Bangalore, Karnataka',
      status: 'Active',
    },
    {
      role_id: 3,
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password_hash: customerPasswordHash,
      phone: '+91 99887 76655',
      driving_license: 'MH-02-2021-0065432',
      address: 'Bandra West, Mumbai, Maharashtra',
      status: 'Active',
    },
    {
      role_id: 3,
      full_name: 'Ananya Reddy',
      email: 'ananya.reddy@example.com',
      password_hash: customerPasswordHash,
      phone: '+91 97001 23456',
      driving_license: 'TS-09-2022-0032145',
      address: 'Madhapur, Hitec City, Hyderabad, Telangana',
      status: 'Active',
    },
  ];

  for (const u of users) {
    await pool.execute(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, driving_license, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         password_hash = VALUES(password_hash),
         phone = VALUES(phone),
         driving_license = VALUES(driving_license),
         address = VALUES(address),
         status = VALUES(status)`,
      [u.role_id, u.full_name, u.email, u.password_hash, u.phone, u.driving_license, u.address, u.status]
    );
  }

  // 3. SEED VEHICLE CATEGORIES
  console.log('3. Seeding Vehicle Categories...');
  const categories = [
    { id: 1, name: 'Hatchback', description: 'Compact and fuel-efficient, ideal for bustling city commutes.', base_daily_rate: 1500.00 },
    { id: 2, name: 'Sedan', description: 'Comfortable, stylish, and perfect for family road trips and corporate travel.', base_daily_rate: 2400.00 },
    { id: 3, name: 'Compact SUV', description: 'High ground clearance, versatile performance, and commanding road presence.', base_daily_rate: 3000.00 },
    { id: 4, name: 'Full SUV & 4x4', description: 'Rugged all-terrain capability with 7-seat spaciousness and superior power.', base_daily_rate: 4200.00 },
    { id: 5, name: 'Electric Vehicle (EV)', description: 'Zero emissions, instant torque, whisper-quiet cabin, and green mobility.', base_daily_rate: 3200.00 },
    { id: 6, name: 'Luxury & Executive', description: 'World-class craftsmanship, plush leather interiors, and unmatched prestige.', base_daily_rate: 8500.00 },
  ];

  for (const c of categories) {
    await pool.execute(
      `INSERT INTO vehicle_categories (id, name, description, base_daily_rate) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE description = VALUES(description), base_daily_rate = VALUES(base_daily_rate)`,
      [c.id, c.name, c.description, c.base_daily_rate]
    );
  }

  // 4. SEED LOCATIONS
  console.log('4. Seeding Locations in India...');
  const locations = [
    { id: 1, name: 'Bangalore Kempegowda Airport Hub', address: 'Terminal 1 Arrivals, Devanahalli', city: 'Bangalore', state: 'Karnataka', contact_number: '+91 80 6678 1001' },
    { id: 2, name: 'Koramangala City Center Hub', address: '80 Feet Road, 4th Block, Koramangala', city: 'Bangalore', state: 'Karnataka', contact_number: '+91 80 4123 4567' },
    { id: 3, name: 'Indiranagar Metro Station Hub', address: 'CMH Road, Indiranagar', city: 'Bangalore', state: 'Karnataka', contact_number: '+91 80 2525 9988' },
    { id: 4, name: 'Mumbai BKC Business Hub', address: 'G Block, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', contact_number: '+91 22 2650 1122' },
    { id: 5, name: 'Hyderabad Hitec City Hub', address: 'Cyber Towers Junction, Madhapur', city: 'Hyderabad', state: 'Telangana', contact_number: '+91 40 6789 2233' },
  ];

  for (const l of locations) {
    await pool.execute(
      `INSERT INTO locations (id, name, address, city, state, contact_number) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE address = VALUES(address), contact_number = VALUES(contact_number)`,
      [l.id, l.name, l.address, l.city, l.state, l.contact_number]
    );
  }

  // 5. SEED REALISTIC VEHICLES
  console.log('5. Seeding Realistic Indian Vehicles...');
  const vehicles = [
    {
      id: 1,
      category_id: 3,
      location_id: 2,
      registration_number: 'KA-01-MJ-2024',
      brand: 'Hyundai',
      model: 'Creta SX (O) Turbo',
      manufacturing_year: 2024,
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      seating_capacity: 5,
      rental_price_per_day: 2800.00,
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '17 km/l',
      description: 'Top-spec Hyundai Creta with panoramic sunroof, Bose audio, ventilated seats, and Level 2 ADAS.',
    },
    {
      id: 2,
      category_id: 5,
      location_id: 1,
      registration_number: 'KA-04-EV-9021',
      brand: 'Tata',
      model: 'Nexon EV Empowered+',
      manufacturing_year: 2024,
      fuel_type: 'Electric',
      transmission: 'Automatic',
      seating_capacity: 5,
      rental_price_per_day: 3200.00,
      image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '465 km Range',
      description: 'Long-range electric SUV with 40.5 kWh battery, fast charging support, digital cockpit, and 5-star safety.',
    },
    {
      id: 3,
      category_id: 4,
      location_id: 2,
      registration_number: 'KA-05-TH-4444',
      brand: 'Mahindra',
      model: 'Thar LX 4x4 Hard Top',
      manufacturing_year: 2023,
      fuel_type: 'Diesel',
      transmission: 'Manual',
      seating_capacity: 4,
      rental_price_per_day: 3500.00,
      image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '15 km/l',
      description: 'Iconic lifestyle off-roader with shift-on-the-fly 4WD, mechanical locking differential, and roll cage.',
    },
    {
      id: 4,
      category_id: 4,
      location_id: 1,
      registration_number: 'KA-01-CR-8899',
      brand: 'Toyota',
      model: 'Innova Crysta ZX',
      manufacturing_year: 2023,
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      seating_capacity: 7,
      rental_price_per_day: 4500.00,
      image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '14 km/l',
      description: 'Legendary Indian MPV with captain seats, unmatched highway comfort, robust suspension, and bulletproof reliability.',
    },
    {
      id: 5,
      category_id: 1,
      location_id: 3,
      registration_number: 'KA-03-SW-5566',
      brand: 'Maruti Suzuki',
      model: 'Swift ZXi Plus',
      manufacturing_year: 2024,
      fuel_type: 'Petrol',
      transmission: 'Manual',
      seating_capacity: 5,
      rental_price_per_day: 1600.00,
      image_url: 'https://images.unsplash.com/photo-1590362891988-f77804702088?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '24.8 km/l',
      description: 'Zippy city hatchback with outstanding fuel economy, touchscreen infotainment, push button start, and cruise control.',
    },
    {
      id: 6,
      category_id: 2,
      location_id: 4,
      registration_number: 'MH-02-CT-1020',
      brand: 'Honda',
      model: 'City ZX e:HEV Hybrid',
      manufacturing_year: 2024,
      fuel_type: 'Hybrid',
      transmission: 'Automatic',
      seating_capacity: 5,
      rental_price_per_day: 2800.00,
      image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '27 km/l',
      description: 'Self-charging hybrid executive sedan with electric motor assist, lane watch camera, and ultra-plush cabin.',
    },
    {
      id: 7,
      category_id: 4,
      location_id: 5,
      registration_number: 'TS-09-XU-7777',
      brand: 'Mahindra',
      model: 'XUV700 AX7 Luxury AWD',
      manufacturing_year: 2024,
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      seating_capacity: 7,
      rental_price_per_day: 4200.00,
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '15 km/l',
      description: 'Twin 10.25-inch dual screens, Sony 12-speaker 3D sound, smart door handles, panoramic Skyroof, and AWD stability.',
    },
    {
      id: 8,
      category_id: 6,
      location_id: 1,
      registration_number: 'KA-01-BM-3300',
      brand: 'BMW',
      model: '3 Series Gran Limousine M Sport',
      manufacturing_year: 2024,
      fuel_type: 'Petrol',
      transmission: 'Automatic',
      seating_capacity: 5,
      rental_price_per_day: 8500.00,
      image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      availability_status: 'Available',
      mileage: '15.3 km/l',
      description: 'Extended wheelbase luxury saloon with Harman Kardon sound, Vernasca leather upholstery, and BMW Curved Display.',
    },
  ];

  for (const v of vehicles) {
    await pool.execute(
      `INSERT INTO vehicles (id, category_id, location_id, registration_number, brand, model, manufacturing_year, fuel_type, transmission, seating_capacity, rental_price_per_day, image_url, availability_status, mileage, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rental_price_per_day = VALUES(rental_price_per_day),
         availability_status = VALUES(availability_status),
         image_url = VALUES(image_url),
         mileage = VALUES(mileage),
         description = VALUES(description)`,
      [
        v.id,
        v.category_id,
        v.location_id,
        v.registration_number,
        v.brand,
        v.model,
        v.manufacturing_year,
        v.fuel_type,
        v.transmission,
        v.seating_capacity,
        v.rental_price_per_day,
        v.image_url,
        v.availability_status,
        v.mileage,
        v.description,
      ]
    );
  }

  // 6. SEED SAMPLE HISTORICAL & ACTIVE BOOKINGS
  console.log('6. Seeding Sample Bookings & Payments...');
  const sampleBookings = [
    {
      booking_reference: 'BK-2026-00101',
      customer_id: 3, // Rahul Sharma
      vehicle_id: 1, // Creta
      pickup_location_id: 2,
      return_location_id: 2,
      pickup_date: '2026-11-01 10:00:00',
      return_date: '2026-11-04 10:00:00',
      total_days: 3,
      total_amount: 8400.00,
      booking_status: 'Completed',
      notes: 'Weekend trip to Mysore. Smooth driving experience.',
      payment_method: 'UPI',
      payment_status: 'Successful',
      transaction_ref: 'TXN-UPI-9876543210-01',
    },
    {
      booking_reference: 'BK-2026-00102',
      customer_id: 4, // Priya Patel
      vehicle_id: 2, // Nexon EV
      pickup_location_id: 1,
      return_location_id: 1,
      pickup_date: '2026-11-05 09:00:00',
      return_date: '2026-11-07 09:00:00',
      total_days: 2,
      total_amount: 6400.00,
      booking_status: 'Completed',
      notes: 'Loved the electric silent acceleration.',
      payment_method: 'Credit Card',
      payment_status: 'Successful',
      transaction_ref: 'TXN-CC-1122334455-02',
    },
    {
      booking_reference: 'BK-2026-00103',
      customer_id: 5, // Ananya Reddy
      vehicle_id: 7, // XUV700
      pickup_location_id: 5,
      return_location_id: 5,
      pickup_date: '2026-11-12 08:00:00',
      return_date: '2026-11-15 08:00:00',
      total_days: 3,
      total_amount: 12600.00,
      booking_status: 'Confirmed',
      notes: 'Family vacation booking.',
      payment_method: 'Net Banking',
      payment_status: 'Successful',
      transaction_ref: 'TXN-NB-7788990011-03',
    },
  ];

  for (const b of sampleBookings) {
    const [exist] = await pool.execute(
      `SELECT id FROM bookings WHERE booking_reference = ?`,
      [b.booking_reference]
    );

    let bookingId;
    if (exist.length === 0) {
      const [res] = await pool.execute(
        `INSERT INTO bookings (booking_reference, customer_id, vehicle_id, pickup_location_id, return_location_id, pickup_date, return_date, total_days, total_amount, booking_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.booking_reference,
          b.customer_id,
          b.vehicle_id,
          b.pickup_location_id,
          b.return_location_id,
          b.pickup_date,
          b.return_date,
          b.total_days,
          b.total_amount,
          b.booking_status,
          b.notes,
        ]
      );
      bookingId = res.insertId;

      // Insert Payment
      await pool.execute(
        `INSERT INTO payments (booking_id, customer_id, amount, payment_method, payment_status, transaction_reference)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookingId, b.customer_id, b.total_amount, b.payment_method, b.payment_status, b.transaction_ref]
      );

      // Insert Review if Completed
      if (b.booking_status === 'Completed') {
        await pool.execute(
          `INSERT INTO reviews (booking_id, customer_id, vehicle_id, rating, comment)
           VALUES (?, ?, ?, ?, ?)`,
          [bookingId, b.customer_id, b.vehicle_id, 5, b.notes]
        );
      }
    }
  }

  // 7. SEED MAINTENANCE RECORDS
  console.log('7. Seeding Maintenance Records...');
  const maintenance = [
    {
      vehicle_id: 1,
      service_type: 'General Periodic Service',
      service_date: '2026-10-15',
      cost: 4500.00,
      description: 'Engine oil replacement, brake pad inspection, air filter change.',
      performed_by: 'Hyundai Trident Service Center, Bangalore',
      status: 'Completed',
    },
    {
      vehicle_id: 3,
      service_type: 'Wheel Alignment & Balancing',
      service_date: '2026-10-20',
      cost: 1800.00,
      description: 'Front and rear wheel 3D laser alignment and tire pressure tuning.',
      performed_by: 'Sireesh Auto Mahindra, Bangalore',
      status: 'Completed',
    },
  ];

  for (const m of maintenance) {
    const [exist] = await pool.execute(
      `SELECT id FROM maintenance_records WHERE vehicle_id = ? AND service_date = ?`,
      [m.vehicle_id, m.service_date]
    );
    if (exist.length === 0) {
      await pool.execute(
        `INSERT INTO maintenance_records (vehicle_id, service_type, service_date, cost, description, performed_by, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [m.vehicle_id, m.service_type, m.service_date, m.cost, m.description, m.performed_by, m.status]
      );
    }
  }

  // 8. SEED MONGODB NO-SQL DATA
  console.log('8. Seeding MongoDB flexible vehicle specs & activity logs...');
  const mongo = getMongoDb();
  const vehicleDetailsColl = mongo.collection('vehicle_details');
  const activityLogsColl = mongo.collection('user_activity_logs');

  const countSpecs = await vehicleDetailsColl.countDocuments();
  if (countSpecs === 0) {
    await vehicleDetailsColl.insertMany([
      {
        vehicle_id: 1,
        registration_number: 'KA-01-MJ-2024',
        specifications: {
          engine: '1.5L U2 CRDi Diesel',
          power: '115 PS @ 4000 rpm',
          torque: '250 Nm @ 1500-2750 rpm',
          boot_capacity: '433 Litres',
          infotainment: '10.25-inch Touchscreen with Android Auto & Apple CarPlay',
        },
        features: ['Voice Controlled Sunroof', 'Ventilated Front Seats', 'Wireless Phone Charger', 'Rear AC Vents'],
        accessories_included: ['Emergency First-Aid Kit', 'Fastag Pre-installed', 'Dashcam (Front)', 'Mobile Mount'],
      },
      {
        vehicle_id: 2,
        registration_number: 'KA-04-EV-9021',
        specifications: {
          battery_capacity: '40.5 kWh High Energy Density LFP',
          motor_type: 'Permanent Magnet Synchronous Motor',
          power: '142.6 bhp',
          torque: '215 Nm',
          charging_time: '56 mins (10% to 80% on 50kW DC fast charger)',
        },
        features: ['Electronic Parking Brake with Auto Hold', 'Vehicle-to-Vehicle Charging (V2V)', 'Harman Audio'],
        accessories_included: ['Portable 3.3 kW Home Charging Cable', 'Fastag Pre-installed', 'Tyre Inflator'],
      },
    ]);
  }

  const countLogs = await activityLogsColl.countDocuments();
  if (countLogs === 0) {
    await activityLogsColl.insertMany([
      {
        user_id: 3,
        user_email: 'rahul.sharma@example.com',
        action: 'USER_LOGIN',
        ip_address: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(),
        metadata: { success: true, method: 'JWT_PASSWORD' },
      },
      {
        user_id: 3,
        user_email: 'rahul.sharma@example.com',
        action: 'VEHICLE_SEARCH',
        timestamp: new Date(),
        metadata: { category: 'Compact SUV', city: 'Bangalore', fuel: 'Petrol' },
      },
    ]);
  }

  console.log('--- [DATABASE SEEDING COMPLETED SUCCESSFULLY] ---');
  return true;
};

// If run directly: node src/utils/seedAll.js
if (process.argv[1] && process.argv[1].endsWith('seedAll.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

export default seedDatabase;
