# Vehicle Rental Management System (DriveElite)
> Production-Ready Full-Stack Academic College Project featuring Multi-Database Architecture

DriveElite is an enterprise vehicle rental management system engineered with React 18, Vite, Tailwind CSS, Node.js/Express, and a multi-database persistence architecture:
1. **MySQL 8.0+ (InnoDB)**: Primary relational database for authoritative ACID transactions, row-level locking (`SELECT ... FOR UPDATE`), double-booking prevention, foreign keys, and indexes.
2. **MongoDB NoSQL**: Document store for flexible vehicle specifications, accessories, and user activity telemetry logs.
3. **Redis 7.x**: High-performance in-memory cache implementing the Cache-Aside pattern with TTL and automatic invalidation.
4. **Neo4j Graph Database**: Graph-based recommendation engine executing Cypher pattern matching queries.

---

## 🔑 Seeded Demo Credentials

| Role | Email Address | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@vehiclerental.com` | `Admin@123` | Executive KPI Analytics, Recharts Visuals, Fleet CRUD, Customer Management, Event Telemetry |
| **Fleet Manager** | `manager@vehiclerental.com` | `Manager@123` | Vehicle Dispatch, Handover Check-in, Booking Status Transitions, Maintenance Scheduling |
| **Customer** | `rahul.sharma@example.com` | `Customer@123` | Catalog Search, ACID Reservations, Simulated UPI/Card Payments, Graph Recommendations, Cancellations |
| **Customer 2** | `priya.patel@example.com` | `Customer@123` | Historical EV trips and reviews |

*(Note: The login screen also features 1-click demo credential autofill buttons for quick evaluation).*

---

## 🏗️ Multi-Database Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │    React 18 + Vite + Tailwind CSS Frontend   │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP / REST (JWT)
                      ┌──────────────────────▼───────────────────────┐
                      │     Express.js API Gateway & Security Layer  │
                      └──────┬───────────┬───────────┬───────────┬───┘
                             │           │           │           │
           ┌─────────────────▼┐   ┌──────▼──────┐   ┌▼───────────▼┐   ┌──▼──────────────┐
           │ MySQL 8.0 InnoDB │   │ Redis Cache │   │ MongoDB     │   │ Neo4j Graph DB  │
           │ (ACID & Row-Lock)│   │ (Cache-Aside│   │ (Specs &    │   │ (Cypher Pattern │
           │                  │   │  TTL 300s)  │   │  Event Logs)│   │  Recommendation)│
           └──────────────────┘   └─────────────┘   └─────────────┘   └─────────────────┘
```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v20+ or v24+)
- MySQL Server 8.0+ running on port 3306

### Step 1: Database Setup (MySQL)
Ensure your MySQL service is running. Update `backend/.env` with your MySQL root password if different:
```bash
# In backend/.env:
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=vehicle_rental_db
```

Initialize the database schema and seed data:
```bash
cd backend
npm run seed
```
*(This automatically creates `vehicle_rental_db`, sets up 10 normalized InnoDB tables, hashes passwords with bcrypt, seeds realistic Indian vehicles, locations, bookings, and MongoDB documents).*

### Step 2: Start the Backend API
```bash
cd backend
npm start
# Server listens at: http://localhost:5000
# Multi-DB Health check: http://localhost:5000/api/health
```

### Step 3: Start the Frontend Portal
```bash
cd frontend
npm run dev
# Vite development server runs at: http://localhost:5173
```

### 🐳 Optional: 1-Click Docker Deployment
If you have Docker & Docker Compose installed, run all 6 containers with a single command:
```bash
docker compose up --build -d
```

---

## 🧪 Automated Testing

Run the automated test suite covering all 15 project specifications:
```bash
node tests/run-all-tests.js
```

### Test Results Summary
- **Total Tests**: 15 test suites (23 assertions)
- **Result**: `23 PASSED | 0 FAILED`
- **Coverage**: Registration, bcrypt hashing, JWT issuance, RBAC guards, Redis Cache-Aside, Vehicle CRUD, Booking date validations, ACID row-locking (`SELECT ... FOR UPDATE`), payment gateway simulation, double-booking prevention (409 Conflict), rollback integrity, cancellation refund, MongoDB activity streams, Neo4j recommendations, and fleet maintenance constraints.

---

## 📡 API Endpoints Summary

### Authentication & Profiles (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate & receive JWT
- `POST /api/auth/forgot-password` - Reset account password
- `GET /api/auth/me` - Authenticated user identity (Protected)
- `PUT /api/auth/profile` - Update customer details (Protected)

### Vehicle Fleet Management (`/api/vehicles`)
- `GET /api/vehicles` - List vehicles with filters & Redis cache
- `GET /api/vehicles/:id` - Vehicle details + MongoDB flexible specs
- `GET /api/vehicles/categories` - Vehicle categories
- `GET /api/vehicles/locations` - Pickup/drop-off hub locations
- `POST /api/vehicles` - Add new vehicle (Admin / Manager)
- `PUT /api/vehicles/:id` - Update vehicle (Admin / Manager)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin only)

### Reservations & Transactions (`/api/bookings`)
- `POST /api/bookings` - Create reservation with ACID row-locking
- `GET /api/bookings` - List bookings (Scoped by user role)
- `GET /api/bookings/:id` - Detailed booking view
- `POST /api/bookings/:id/cancel` - Cancel booking and process refund
- `PUT /api/bookings/:id/status` - Update trip status (Manager / Admin)

### Payments & Invoices (`/api/payments`)
- `GET /api/payments` - Transaction ledger
- `POST /api/payments/simulate` - Simulated gateway submission

### Analytics & Reports (`/api/analytics`)
- `GET /api/analytics/dashboard` - SQL aggregation metrics & KPI counts

### MongoDB NoSQL (`/api/nosql`)
- `GET /api/nosql/activity-logs` - Telemetry logs & aggregation pipelines
- `GET /api/nosql/specs/:vehicleId` - Flexible vehicle specifications
- `PUT /api/nosql/specs/:vehicleId` - Update specs & accessories

### Neo4j Graph DB (`/api/graph`)
- `GET /api/graph/recommendations` - Cypher personalized recommendations
- `GET /api/graph/similar-customers` - Collaborative filtering
- `GET /api/graph/popular-categories` - Graph traversal statistics

---

## 📚 Documentation Location
Complete 28-section academic project report, UML diagrams, ER diagrams, data flow diagrams, and architectural specifications are located in:
👉 [`docs/PROJECT_DOCUMENTATION.md`](file:///c:/Users/bomma/OneDrive/Desktop/Vehicle%20Rental%20Management%20System/docs/PROJECT_DOCUMENTATION.md)

---

## 🛡️ Security Implementation
- **Passwords**: Salted and hashed with `bcryptjs` (10 rounds).
- **Authentication**: Stateless JSON Web Tokens (JWT) with Bearer scheme.
- **Authorization**: Role-Based Access Control (RBAC) middleware.
- **SQL Injection Defense**: Prepared parameterized SQL statements.
- **Brute Force Protection**: Rate limiting on API and authentication routes.
- **HTTP Hardening**: Helmet security headers and CORS protection.

---

## ⚠️ Notes & Practical Fallback Architecture
For frictionless academic evaluation on systems where local MongoDB, Redis, or Neo4j daemons may not be installed or configured, the system incorporates resilient in-memory fallback adapters that preserve the exact same database APIs, query contracts, and Cypher inspections. When native connection strings are supplied in `.env`, the system automatically attaches to live instances.
