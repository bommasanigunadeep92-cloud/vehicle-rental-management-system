-- =====================================================================
-- Vehicle Rental Management System
-- Relational Database Schema (MySQL 8.0+ / InnoDB)
-- Features: Foreign keys, Constraints, Indexes, Engine=InnoDB
-- =====================================================================

CREATE DATABASE IF NOT EXISTS vehicle_rental_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vehicle_rental_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  driving_license VARCHAR(50) NULL,
  address TEXT NULL,
  status ENUM('Active', 'Suspended', 'Pending') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id)
) ENGINE=InnoDB;

-- 3. VEHICLE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  base_daily_rate DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  contact_number VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_locations_city (city)
) ENGINE=InnoDB;

-- 5. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  location_id INT NOT NULL,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  manufacturing_year INT NOT NULL,
  fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL DEFAULT 'Petrol',
  transmission ENUM('Manual', 'Automatic') NOT NULL DEFAULT 'Manual',
  seating_capacity INT NOT NULL DEFAULT 5,
  rental_price_per_day DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500) NULL,
  availability_status ENUM('Available', 'Booked', 'Rented', 'Maintenance') NOT NULL DEFAULT 'Available',
  mileage VARCHAR(50) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicles_category FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicles_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  INDEX idx_vehicles_status (availability_status),
  INDEX idx_vehicles_cat_loc (category_id, location_id),
  INDEX idx_vehicles_price (rental_price_per_day)
) ENGINE=InnoDB;

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  pickup_location_id INT NOT NULL,
  return_location_id INT NOT NULL,
  pickup_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  total_days INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_pickup_loc FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_return_loc FOREIGN KEY (return_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  CONSTRAINT chk_booking_dates CHECK (return_date > pickup_date),
  INDEX idx_bookings_dates (pickup_date, return_date),
  INDEX idx_bookings_vehicle_dates (vehicle_id, pickup_date, return_date),
  INDEX idx_bookings_status (booking_status),
  INDEX idx_bookings_customer (customer_id)
) ENGINE=InnoDB;

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('UPI', 'Credit Card', 'Debit Card', 'Net Banking') NOT NULL DEFAULT 'UPI',
  payment_status ENUM('Pending', 'Successful', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  transaction_reference VARCHAR(100) NOT NULL UNIQUE,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_payments_status (payment_status),
  INDEX idx_payments_booking (booking_id)
) ENGINE=InnoDB;

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  customer_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_reviews_vehicle (vehicle_id)
) ENGINE=InnoDB;

-- 9. MAINTENANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  service_date DATE NOT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT NULL,
  performed_by VARCHAR(150) NULL,
  status ENUM('Scheduled', 'In Progress', 'Completed') NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_maintenance_vehicle (vehicle_id),
  INDEX idx_maintenance_status (status)
) ENGINE=InnoDB;

-- 10. RENTAL DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS rental_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_documents_booking (booking_id)
) ENGINE=InnoDB;
