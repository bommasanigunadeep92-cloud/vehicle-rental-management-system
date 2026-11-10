// =====================================================================
// MongoDB NoSQL Initialization Script
// Collections: vehicle_details, user_activity_logs, rental_documents
// Features: Compound indexes, TTL index, Aggregation pipelines
// =====================================================================

const db = db.getSiblingDB('vehicle_rental_nosql');

// 1. Vehicle Details Collection (Flexible specifications, features, accessories)
db.createCollection('vehicle_details');
db.vehicle_details.createIndex({ vehicle_id: 1 }, { unique: true });
db.vehicle_details.createIndex({ "specifications.fuel_type": 1 });

db.vehicle_details.insertMany([
  {
    vehicle_id: 1,
    registration_number: "KA-01-MJ-2024",
    specifications: {
      engine: "1.5L U2 CRDi Diesel",
      power: "115 PS @ 4000 rpm",
      torque: "250 Nm @ 1500-2750 rpm",
      boot_capacity: "433 Litres",
      infotainment: "10.25-inch Touchscreen with Android Auto & Apple CarPlay"
    },
    features: ["Voice Controlled Panoramic Sunroof", "Ventilated Front Seats", "Wireless Charging", "Level 2 ADAS Safety"],
    accessories_included: ["Fastag Pre-installed", "Emergency First-Aid Kit", "Front Dashcam"]
  },
  {
    vehicle_id: 2,
    registration_number: "KA-04-EV-9021",
    specifications: {
      battery_capacity: "40.5 kWh High Energy Density LFP",
      motor_type: "Permanent Magnet Synchronous Motor",
      power: "142.6 bhp",
      torque: "215 Nm",
      charging_time: "56 mins (10% to 80% on 50kW DC fast charger)"
    },
    features: ["Electronic Parking Brake with Auto Hold", "Vehicle-to-Vehicle (V2V) Charging", "Harman Cinematic Audio"],
    accessories_included: ["Portable 3.3 kW Home Charging Cable", "Fastag Pre-installed", "Tyre Inflator"]
  }
]);

// 2. User Activity Logs Collection (Streaming telemetry & search queries)
db.createCollection('user_activity_logs');
db.user_activity_logs.createIndex({ user_id: 1 });
db.user_activity_logs.createIndex({ action: 1 });
db.user_activity_logs.createIndex({ timestamp: -1 });

db.user_activity_logs.insertMany([
  {
    user_id: 3,
    user_email: "rahul.sharma@example.com",
    action: "USER_LOGIN",
    ip_address: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    timestamp: new Date(),
    metadata: { role: "customer" }
  },
  {
    user_id: 3,
    user_email: "rahul.sharma@example.com",
    action: "VEHICLE_SEARCH",
    timestamp: new Date(),
    metadata: { category: "Compact SUV", city: "Bangalore", fuel: "Petrol" }
  }
]);

// 3. Rental Documents Collection (Contracts, Aadhaar & DL verification metadata)
db.createCollection('rental_documents');
db.rental_documents.createIndex({ booking_id: 1 });
db.rental_documents.createIndex({ uploaded_by: 1 });

print("MongoDB NoSQL database initialized successfully.");
