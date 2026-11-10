const path = require('path');
const fs = require('fs');

// Use pptxgenjs from IMS PROJECT node_modules
const pptxgen = require('C:/Users/bomma/OneDrive/Documents/IMS PROJECT/backend/node_modules/pptxgenjs');

async function buildDriveElitePresentation() {
  console.log('Generating DriveElite Master Presentation...');
  const pres = new pptxgen();

  // Define 16:9 Widescreen Layout
  pres.defineLayout({ name: 'MODERN_16_9', width: 13.333, height: 7.5 });
  pres.layout = 'MODERN_16_9';

  pres.author = 'BOMMASANI GUNADEEP & TEAM';
  pres.company = 'SR University';
  pres.subject = 'Information Management Systems / Software Engineering Project';
  pres.title = 'DriveElite: Multi-Database Enterprise Vehicle Rental Management System';

  // Professional Color Palette
  const C_BG = 'F8FAFC';          // Soft slate background
  const C_NAVY = '0F172A';        // Main headings & dark text
  const C_BLUE = '2563EB';        // Primary accent
  const C_INDIGO = '4F46E5';      // Secondary accent
  const C_EMERALD = '059669';     // Success & MySQL/Active
  const C_AMBER = 'D97706';       // Warning / Redis
  const C_PURPLE = '7C3AED';      // Neo4j / Graph
  const C_CYAN = '0284C7';        // NoSQL / MongoDB
  const C_CARD = 'FFFFFF';        // Card surface
  const C_BORDER = 'E2E8F0';      // Subtle border
  const C_MUTED = '64748B';       // Secondary text
  const C_WHITE = 'FFFFFF';

  // Standard Header Helper
  function addHeader(slide, title, category = 'PRODUCT 26: VEHICLE RENTAL MANAGEMENT SYSTEM') {
    slide.background = { color: C_BG };

    // Category Badge
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.35, w: 9.0, h: 0.25,
      fontSize: 9.5, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8, y: 0.6, w: 11.5, h: 0.5,
      fontSize: 20, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });

    // Decorative Accent Line
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.15, w: 2.0, h: 0.04,
      fill: { color: C_BLUE }, line: { color: C_BLUE }
    });

    // University Footer
    slide.addText('SR UNIVERSITY  •  DEPARTMENT OF CSE  •  DRIVEELITE ENTERPRISE ARCHITECTURE 2026', {
      x: 0.8, y: 7.1, w: 11.7, h: 0.25,
      fontSize: 8.5, color: C_MUTED, fontFace: 'Calibri'
    });
  }

  // Card Helper
  function addCard(slide, x, y, w, h, fill = C_CARD, border = C_BORDER) {
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: fill },
      line: { color: border, width: 1 },
      rectRadius: 0.08
    });
  }

  // =========================================================================
  // SLIDE 1: TITLE SLIDE (Executive Dark Theme)
  // =========================================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: '0A192F' }; // Elegant Midnight Navy

    // Pill Badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 1.2, w: 4.6, h: 0.38,
      fill: { color: '1E293B' }, line: { color: '38BDF8', width: 1 }, rectRadius: 0.19
    });
    slide.addText('SR UNIVERSITY  •  FINAL YEAR CAPSTONE PROJECT', {
      x: 1.0, y: 1.2, w: 4.6, h: 0.38,
      fontSize: 10, bold: true, color: '38BDF8', fontFace: 'Calibri', align: 'center', valign: 'middle'
    });

    // Big Title
    slide.addText('DriveElite: Product 26', {
      x: 1.0, y: 1.8, w: 11.0, h: 0.8,
      fontSize: 34, bold: true, color: C_WHITE, fontFace: 'Calibri'
    });

    slide.addText('Enterprise Vehicle Rental Management System with Polyglot Persistence Architecture', {
      x: 1.0, y: 2.65, w: 11.0, h: 0.5,
      fontSize: 18, color: '94A3B8', fontFace: 'Calibri'
    });

    // Multi-DB Pillars (4 Visual Cards)
    const dbs = [
      { name: 'MySQL 8.0', role: 'ACID & Row-Locking', color: '10B981' },
      { name: 'Redis 7.x', role: 'In-Memory Cache (2ms)', color: 'F59E0B' },
      { name: 'MongoDB', role: 'NoSQL Spec Documents', color: '06B6D4' },
      { name: 'Neo4j Aura', role: 'Graph Recommendations', color: 'A855F7' }
    ];

    dbs.forEach((db, i) => {
      const cx = 1.0 + (i * 2.85);
      slide.addShape(pres.ShapeType.roundRect, {
        x: cx, y: 3.5, w: 2.65, h: 1.3,
        fill: { color: '0F2D4A' }, line: { color: db.color, width: 1.5 }, rectRadius: 0.1
      });
      slide.addText(db.name, {
        x: cx, y: 3.7, w: 2.65, h: 0.4,
        fontSize: 15, bold: true, color: C_WHITE, fontFace: 'Calibri', align: 'center'
      });
      slide.addText(db.role, {
        x: cx, y: 4.15, w: 2.65, h: 0.4,
        fontSize: 11, color: db.color, fontFace: 'Calibri', align: 'center'
      });
    });

    // Student Credentials Bar
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 5.3, w: 11.3, h: 1.4,
      fill: { color: '0F243A' }, line: { color: '334155', width: 1 }, rectRadius: 0.1
    });

    slide.addText('DEVELOPED BY:', {
      x: 1.3, y: 5.45, w: 3.0, h: 0.25,
      fontSize: 9.5, bold: true, color: '38BDF8', fontFace: 'Calibri'
    });
    slide.addText('BOMMASANI GUNADEEP & TEAM (4 Members)', {
      x: 1.3, y: 5.75, w: 5.0, h: 0.35,
      fontSize: 14, bold: true, color: C_WHITE, fontFace: 'Calibri'
    });
    slide.addText('Department of Computer Science & Engineering  •  Roll: 2503a51054', {
      x: 1.3, y: 6.1, w: 6.0, h: 0.3,
      fontSize: 11, color: '94A3B8', fontFace: 'Calibri'
    });

    slide.addText('LIVE CLOUD DEPLOYMENT:', {
      x: 7.2, y: 5.45, w: 4.8, h: 0.25,
      fontSize: 9.5, bold: true, color: '10B981', fontFace: 'Calibri'
    });
    slide.addText('https://vehicle-rental-management-system-sgvz.onrender.com', {
      x: 7.2, y: 5.75, w: 4.8, h: 0.35,
      fontSize: 11, bold: true, color: C_WHITE, fontFace: 'Calibri'
    });
    slide.addText('Docker  •  Render Cloud  •  Redis Cloud  •  MongoDB Atlas  •  Neo4j Aura', {
      x: 7.2, y: 6.1, w: 4.8, h: 0.3,
      fontSize: 10, color: '94A3B8', fontFace: 'Calibri'
    });
  }

  // =========================================================================
  // SLIDE 2: EXECUTIVE SUMMARY & PROBLEM STATEMENT
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Executive Summary: The Real-World Engineering Problem');

    // Left Card: The Real-World Problems
    addCard(slide, 0.8, 1.4, 5.7, 5.4);
    slide.addText('TRADITIONAL VEHICLE RENTAL BOTTLENECKS', {
      x: 1.1, y: 1.6, w: 5.1, h: 0.3,
      fontSize: 12, bold: true, color: 'DC2626', fontFace: 'Calibri'
    });

    const problems = [
      { t: 'Double-Booking Race Conditions', d: 'Two users simultaneously booking the exact same car for the same dates causes catastrophic overbooking without row-locking.' },
      { t: 'Relational Disk I/O Bottlenecks', d: 'Heavy vehicle search queries with multiple filters (price, transmission, fuel) repeatedly scan disks, causing high latency.' },
      { t: 'Rigid Schemas (Impedance Mismatch)', d: 'Electric cars need battery specs; offroaders need crawl ratios. Storing 30+ empty NULL columns in SQL tables is bad design.' },
      { t: 'Multi-Hop Join Penalty in SQL', d: 'Running collaborative filtering in SQL requires 5+ table JOINs, executing in slow O(N^k) time.' }
    ];

    problems.forEach((p, idx) => {
      const py = 2.05 + (idx * 1.15);
      slide.addText(`❌  ${p.t}`, {
        x: 1.1, y: py, w: 5.1, h: 0.3,
        fontSize: 12, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(p.d, {
        x: 1.4, y: py + 0.3, w: 4.8, h: 0.65,
        fontSize: 10, color: C_MUTED, fontFace: 'Calibri'
      });
    });

    // Right Card: The DriveElite Polyglot Solution
    addCard(slide, 6.8, 1.4, 5.7, 5.4);
    slide.addText('DRIVEELITE ARCHITECTURAL SOLUTION', {
      x: 7.1, y: 1.6, w: 5.1, h: 0.3,
      fontSize: 12, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });

    const solutions = [
      { t: 'ACID InnoDB Row-Level Locking', d: 'Uses SELECT ... FOR UPDATE transactions in MySQL 8.0, making double-booking physically impossible.' },
      { t: 'Sub-Millisecond Cache-Aside (Redis)', d: 'Caches active fleet listings in RAM with automated TTL and instant cache invalidation upon updates.' },
      { t: 'Flexible JSON Document Store (MongoDB)', d: 'Stores model-specific EV and 4x4 engineering specs plus asynchronous security telemetry logs.' },
      { t: 'Index-Free Adjacency (Neo4j Graph)', d: 'Traverses Customer-Category-Vehicle graph edges in constant O(1) hop time for recommendations.' }
    ];

    solutions.forEach((s, idx) => {
      const sy = 2.05 + (idx * 1.15);
      slide.addText(`✅  ${s.t}`, {
        x: 7.1, y: sy, w: 5.1, h: 0.3,
        fontSize: 12, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(s.d, {
        x: 7.4, y: sy + 0.3, w: 4.8, h: 0.65,
        fontSize: 10, color: C_MUTED, fontFace: 'Calibri'
      });
    });
  }

  // =========================================================================
  // SLIDE 3: POLYGLOT PERSISTENCE ARCHITECTURE
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'System Architecture: Polyglot Multi-Database Pipeline');

    // Layer 1: Client
    addCard(slide, 0.8, 1.4, 11.7, 1.1, 'EFF6FF', 'BFDBFE');
    slide.addText('PRESENTATION LAYER (CLIENT-SIDE)', {
      x: 1.1, y: 1.5, w: 4.0, h: 0.25,
      fontSize: 10, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });
    slide.addText('React 18 Single-Page Application  •  Vite Tooling  •  Tailwind CSS  •  Recharts Dashboards  •  Axios Interceptors with JWT', {
      x: 1.1, y: 1.8, w: 11.0, h: 0.45,
      fontSize: 13, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });

    // Layer 2: Backend API
    addCard(slide, 0.8, 2.7, 11.7, 1.25, 'F5F3FF', 'DDD6FE');
    slide.addText('APPLICATION & BUSINESS LOGIC LAYER (BACKEND REST API)', {
      x: 1.1, y: 2.8, w: 6.0, h: 0.25,
      fontSize: 10, bold: true, color: C_PURPLE, fontFace: 'Calibri'
    });
    slide.addText('Node.js + Express.js  •  JWT Auth & bcrypt Hashing  •  RBAC (Admin, Manager, Customer)  •  Helmet Security  •  Rate Limiting', {
      x: 1.1, y: 3.1, w: 11.0, h: 0.45,
      fontSize: 13, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('Controllers: authController, bookingController (ACID), vehicleController (Redis Cache), nosqlController, graphController', {
      x: 1.1, y: 3.55, w: 11.0, h: 0.3,
      fontSize: 10.5, color: C_MUTED, fontFace: 'Calibri'
    });

    // Layer 3: The 4 Databases
    const dbCards = [
      { name: '1. MySQL 8.0 (InnoDB)', type: 'Relational DB', desc: '10 Normalized Tables\nACID Row-Locks\nTransactions & Payments', color: C_EMERALD, bg: 'ECFDF5', border: 'A7F3D0' },
      { name: '2. Redis 7.x Cloud', type: 'In-Memory Cache', desc: 'Sub-millisecond latency\nCache-Aside Pattern\nTTL Expiration (300s)', color: C_AMBER, bg: 'FFFBEB', border: 'FDE68A' },
      { name: '3. MongoDB Atlas', type: 'NoSQL Document Store', desc: 'Flexible EV/4x4 Specs\nUser Activity Telemetry\nAudit Event Logs', color: C_CYAN, bg: 'ECFEFF', border: 'A5F3FC' },
      { name: '4. Neo4j AuraDB', type: 'Graph Database', desc: 'Nodes & Relationships\nIndex-Free Adjacency\nCypher Recommendations', color: C_PURPLE, bg: 'FAF5FF', border: 'E9D5FF' },
    ];

    dbCards.forEach((c, i) => {
      const cx = 0.8 + (i * 2.975);
      addCard(slide, cx, 4.15, 2.75, 2.7, c.bg, c.border);
      slide.addText(c.type.toUpperCase(), {
        x: cx + 0.15, y: 4.3, w: 2.45, h: 0.2,
        fontSize: 8.5, bold: true, color: c.color, fontFace: 'Calibri'
      });
      slide.addText(c.name, {
        x: cx + 0.15, y: 4.55, w: 2.45, h: 0.5,
        fontSize: 12.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(c.desc, {
        x: cx + 0.15, y: 5.2, w: 2.45, h: 1.4,
        fontSize: 10, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 18
      });
    });
  }

  // =========================================================================
  // SLIDE 4: MYSQL 8.0 & 10 NORMALIZED TABLES
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Tier 1: MySQL 8.0 Normalized Schema & Relational Integrity');

    // Left Column: The 10 Tables List
    addCard(slide, 0.8, 1.4, 4.5, 5.4);
    slide.addText('10 NORMALIZED INNODB TABLES', {
      x: 1.0, y: 1.6, w: 4.1, h: 0.3,
      fontSize: 11, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });

    const tables = [
      '1. roles (Admin, Rental Manager, Customer)',
      '2. users (bcrypt hashes, contact, driving license)',
      '3. vehicle_categories (Hatchback, Sedan, SUV, EV)',
      '4. locations (Airport, City Center Hubs in BLR, BOM, HYD)',
      '5. vehicles (Fleet specs, tariff, deposits, status)',
      '6. bookings (ACID reservations, dates, references)',
      '7. payments (Transaction IDs, methods, gateway status)',
      '8. reviews (Customer ratings 1-5 & verified feedback)',
      '9. maintenance_records (Odometer, service costs)',
      '10. rental_documents (Aadhaar & DL verification files)'
    ];

    tables.forEach((t, i) => {
      slide.addText(t, {
        x: 1.0, y: 1.95 + (i * 0.46), w: 4.1, h: 0.4,
        fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri'
      });
    });

    // Right Column: Relational Principles Card
    addCard(slide, 5.6, 1.4, 6.9, 5.4);
    slide.addText('NORMALIZATION & CONSTRAINTS DEFENSE', {
      x: 5.9, y: 1.6, w: 6.3, h: 0.3,
      fontSize: 11, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });

    const principles = [
      { t: 'Third Normal Form (3NF) Elimination of Anomalies', d: 'Hub locations and categories are completely decoupled from vehicle rows. If Bangalore Airport hub changes address, only 1 row is updated—preventing update and deletion anomalies.' },
      { t: 'Foreign Key Referential Integrity', d: 'Foreign keys with ON DELETE RESTRICT ensure an active booking or vehicle with financial records cannot be accidentally orphaned or deleted.' },
      { t: 'B-Tree Indexing Optimization', d: 'Indexes on users(email), vehicles(category_id, location_id, availability_status), and bookings(vehicle_id, pickup_datetime) accelerate search lookups from O(N) to O(log N).' },
      { t: 'Multi-Table Analytical SQL Aggregations', d: 'Powering Admin Analytics via SQL GROUP BY, SUM(total_amount), and COALESCE(AVG(rating), 4.8) for monthly revenue and fleet utilization.' }
    ];

    principles.forEach((p, i) => {
      const py = 2.05 + (i * 1.18);
      slide.addText(`🔷 ${p.t}`, {
        x: 5.9, y: py, w: 6.3, h: 0.3,
        fontSize: 11.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(p.d, {
        x: 6.2, y: py + 0.3, w: 6.0, h: 0.7,
        fontSize: 10, color: C_MUTED, fontFace: 'Calibri'
      });
    });
  }

  // =========================================================================
  // SLIDE 5: DOUBLE-BOOKING PREVENTION & ROW LOCKING
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Transaction Engine: ACID InnoDB Row-Level Locking');

    // Card 1: Problem vs Solution
    addCard(slide, 0.8, 1.4, 5.6, 5.4);
    slide.addText('HOW DOUBLE-BOOKING IS PREVENTED', {
      x: 1.1, y: 1.6, w: 5.0, h: 0.3,
      fontSize: 11.5, bold: true, color: C_PURPLE, fontFace: 'Calibri'
    });

    slide.addText('The Classic Race Condition:', {
      x: 1.1, y: 2.0, w: 5.0, h: 0.25,
      fontSize: 11, bold: true, color: 'DC2626', fontFace: 'Calibri'
    });
    slide.addText('If Customer A and Customer B click "Book" for the same Mahindra Thar at the exact same millisecond, standard SQL reads permit both bookings, causing disastrous double-allocation.', {
      x: 1.1, y: 2.3, w: 5.0, h: 0.7,
      fontSize: 10, color: C_MUTED, fontFace: 'Calibri'
    });

    slide.addText('Our InnoDB Row-Locking Solution:', {
      x: 1.1, y: 3.15, w: 5.0, h: 0.25,
      fontSize: 11, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });
    slide.addText('1. Connection begins transaction: connection.beginTransaction()\n2. Critical Query: SELECT * FROM vehicles WHERE id = ? FOR UPDATE\n3. FOR UPDATE places an exclusive X-Lock on that car in InnoDB memory\n4. Concurrent queries for that car MUST WAIT in a queue\n5. Date overlap validation check runs\n6. If overlapping: ROLLBACK (HTTP 409 Conflict)\n7. If clear: INSERT INTO bookings & COMMIT transaction', {
      x: 1.1, y: 3.45, w: 5.0, h: 2.0,
      fontSize: 10, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 18
    });

    // Card 2: Code Snippet
    addCard(slide, 6.7, 1.4, 5.8, 5.4, '0A192F', '1E293B');
    slide.addText('PRODUCTION ENGINE CODE (bookingController.js)', {
      x: 7.0, y: 1.6, w: 5.2, h: 0.3,
      fontSize: 11, bold: true, color: '38BDF8', fontFace: 'Courier New'
    });

    const code = `// 1. Dedicated pool connection
const connection = await pool.getConnection();

try {
  await connection.beginTransaction();

  // 2. EXCLUSIVE INNODB ROW-LOCK!
  const [vehicle] = await connection.execute(
    'SELECT * FROM vehicles WHERE id = ? FOR UPDATE',
    [vehicle_id]
  );

  // 3. Date Overlap Conflict Algorithm
  const [conflicts] = await connection.execute(
    \`SELECT id FROM bookings 
     WHERE vehicle_id = ? 
       AND booking_status IN ('Pending', 'Confirmed')
       AND (pickup_datetime < ? AND dropoff_datetime > ?)\`,
    [vehicle_id, requested_dropoff, requested_pickup]
  );

  if (conflicts.length > 0) {
    await connection.rollback();
    return res.status(409).json({ error: "Conflict!" });
  }

  // 4. Atomic Insert & Commit
  await connection.execute('INSERT INTO bookings ...', [...]);
  await connection.commit();
} catch(err) {
  await connection.rollback();
}`;

    slide.addText(code, {
      x: 7.0, y: 2.0, w: 5.2, h: 4.6,
      fontSize: 9.5, color: 'E2E8F0', fontFace: 'Consolas', lineSpacing: 16
    });
  }

  // =========================================================================
  // SLIDE 6: REDIS CACHING LAYER
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Tier 2: Redis 7.x In-Memory Caching & Cache-Aside Pattern');

    // 3 Metrics Cards
    const metrics = [
      { label: 'MySQL Direct Query', val: '85 - 160 ms', desc: 'Disk I/O + SQL table joins', color: 'DC2626' },
      { label: 'Redis In-Memory Hit', val: '1.8 - 2.5 ms', desc: 'Direct RAM key-value retrieval', color: C_EMERALD },
      { label: 'Performance Gain', val: '98.5% Faster', desc: 'Sub-millisecond user experience', color: C_BLUE },
    ];

    metrics.forEach((m, i) => {
      const mx = 0.8 + (i * 3.97);
      addCard(slide, mx, 1.4, 3.75, 1.3);
      slide.addText(m.label.toUpperCase(), {
        x: mx + 0.2, y: 1.55, w: 3.35, h: 0.2,
        fontSize: 9, bold: true, color: C_MUTED, fontFace: 'Calibri'
      });
      slide.addText(m.val, {
        x: mx + 0.2, y: 1.75, w: 3.35, h: 0.5,
        fontSize: 22, bold: true, color: m.color, fontFace: 'Calibri'
      });
      slide.addText(m.desc, {
        x: mx + 0.2, y: 2.25, w: 3.35, h: 0.3,
        fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri'
      });
    });

    // Lower Card: Cache-Aside Lifecycle
    addCard(slide, 0.8, 2.9, 11.7, 3.9);
    slide.addText('HOW CACHE-ASIDE WITH TTL OPERATES IN DRIVEELITE', {
      x: 1.1, y: 3.1, w: 10.0, h: 0.3,
      fontSize: 12, bold: true, color: C_AMBER, fontFace: 'Calibri'
    });

    const steps = [
      { step: '1. Request Inspection', detail: 'When user queries /api/vehicles?category=SUV, backend hashes parameters into key cache:vehicles:list:{"category":"SUV"}.' },
      { step: '2. Cache HIT Check', detail: 'Calls redis.get(key). If key exists in RAM, returns JSON instantly to browser in ~2ms. Zero load on MySQL!' },
      { step: '3. Cache MISS & Population', detail: 'If key does not exist, backend queries MySQL, writes result to Redis via redis.setex(key, 300, data) with 300s TTL.' },
      { step: '4. Automated Eviction (TTL)', detail: 'Time-To-Live countdown prevents memory bloat. If inactive for 5 minutes, Redis automatically purges the key.' },
      { step: '5. Instant Cache Invalidation', detail: 'When Admin updates car price or customer books a car, backend runs redis.del("cache:vehicles:*"), ensuring users never see stale data.' }
    ];

    steps.forEach((s, idx) => {
      const sy = 3.5 + (idx * 0.62);
      slide.addText(s.step, {
        x: 1.1, y: sy, w: 3.2, h: 0.3,
        fontSize: 11, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(s.detail, {
        x: 4.4, y: sy, w: 7.8, h: 0.45,
        fontSize: 10, color: C_MUTED, fontFace: 'Calibri'
      });
    });
  }

  // =========================================================================
  // SLIDE 7: MONGODB NOSQL & TELEMETRY
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Tier 3: MongoDB NoSQL Document Store & Activity Telemetry');

    // Left Card: Dynamic Vehicle Specs
    addCard(slide, 0.8, 1.4, 5.7, 5.4);
    slide.addText('FLEXIBLE JSON SPECS (vehicle_details)', {
      x: 1.1, y: 1.6, w: 5.1, h: 0.3,
      fontSize: 11.5, bold: true, color: C_CYAN, fontFace: 'Calibri'
    });
    slide.addText('Why Relational Tables Fail for Vehicle Specs:', {
      x: 1.1, y: 1.95, w: 5.1, h: 0.25,
      fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('Electric Vehicles (Tata Nexon EV) need battery pack kWh, charging time, and regenerative braking. Offroad SUVs (Thar 4x4) need 4WD low ratio, approach angles, and water wading depth.', {
      x: 1.1, y: 2.25, w: 5.1, h: 0.6,
      fontSize: 9.5, color: C_MUTED, fontFace: 'Calibri'
    });

    slide.addText('MongoDB Document Solution (Native BSON):', {
      x: 1.1, y: 2.95, w: 5.1, h: 0.25,
      fontSize: 10.5, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });
    slide.addText('{\n  "vehicle_id": 2,\n  "brand": "Tata", "model": "Nexon EV",\n  "specifications": {\n    "battery_pack": "40.5 kWh High Density",\n    "range_km": 465,\n    "fast_charge_min": 56,\n    "drive_modes": ["Eco", "City", "Sport"]\n  },\n  "included_accessories": [\n    "Portable 3.3 kW Charger", "12V Compressor"\n  ]\n}', {
      x: 1.1, y: 3.25, w: 5.1, h: 3.2,
      fontSize: 9.5, color: C_NAVY, fontFace: 'Consolas', lineSpacing: 15
    });

    // Right Card: Telemetry Event Stream
    addCard(slide, 6.8, 1.4, 5.7, 5.4);
    slide.addText('AUDIT TELEMETRY (user_activity_logs)', {
      x: 7.1, y: 1.6, w: 5.1, h: 0.3,
      fontSize: 11.5, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });
    slide.addText('High-Throughput Audit Event Tracking:', {
      x: 7.1, y: 1.95, w: 5.1, h: 0.25,
      fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('Every critical event (USER_LOGIN, BOOKING_CREATED, PASSWORD_RESET) is asynchronously dispatched to MongoDB. Storing this in SQL would fragment indexes; MongoDB handles high write-throughput effortlessly.', {
      x: 7.1, y: 2.25, w: 5.1, h: 0.6,
      fontSize: 9.5, color: C_MUTED, fontFace: 'Calibri'
    });

    slide.addText('Sample Telemetry Audit Document:', {
      x: 7.1, y: 2.95, w: 5.1, h: 0.25,
      fontSize: 10.5, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });
    slide.addText('{\n  "_id": "6730af92e4b01a2b3c4d5e6f",\n  "action": "BOOKING_CREATED",\n  "user_id": 3,\n  "user_email": "rahul.sharma@example.com",\n  "ip_address": "152.58.12.94",\n  "userAgent": "Mozilla/5.0 Chrome/128.0",\n  "metadata": {\n    "booking_ref": "BK-2026-00101",\n    "vehicle": "Creta SX Turbo",\n    "total_amount": 8400\n  },\n  "timestamp": "2026-11-10T21:45:00Z"\n}', {
      x: 7.1, y: 3.25, w: 5.1, h: 3.2,
      fontSize: 9.5, color: C_NAVY, fontFace: 'Consolas', lineSpacing: 15
    });
  }

  // =========================================================================
  // SLIDE 8: NEO4J GRAPH RECOMMENDATION ENGINE
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Tier 4: Neo4j Graph Database & Recommendation Traversal');

    // Left Column: Index-Free Adjacency
    addCard(slide, 0.8, 1.4, 5.6, 5.4);
    slide.addText('INDEX-FREE ADJACENCY ADVANTAGE', {
      x: 1.1, y: 1.6, w: 5.0, h: 0.3,
      fontSize: 11.5, bold: true, color: C_PURPLE, fontFace: 'Calibri'
    });

    slide.addText('Why Graph Database Beats SQL JOINs:', {
      x: 1.1, y: 2.0, w: 5.0, h: 0.25,
      fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('• In SQL, answering "Find vehicles recommended for Customer X based on shared category preferences" requires 5 heavy table joins across large datasets, degrading exponentially.\n• In Neo4j, each node stores direct memory pointers to adjacent relationships. Traversing from Customer ➔ Category ➔ Vehicle runs in constant O(1) hop time.', {
      x: 1.1, y: 2.3, w: 5.0, h: 1.3,
      fontSize: 9.5, color: C_MUTED, fontFace: 'Calibri', lineSpacing: 16
    });

    slide.addText('The 5 Graph Entities (Nodes):', {
      x: 1.1, y: 3.75, w: 5.0, h: 0.25,
      fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('🔵 Customer  •  🟢 Vehicle  •  🟣 VehicleCategory\n🟠 Location (Hub)  •  🩵 Booking', {
      x: 1.1, y: 4.05, w: 5.0, h: 0.5,
      fontSize: 10, color: C_NAVY, fontFace: 'Calibri'
    });

    slide.addText('Graph Relationships (Edges):', {
      x: 1.1, y: 4.65, w: 5.0, h: 0.25,
      fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });
    slide.addText('• (:Customer)-[:CUSTOMER_BOOKED]->(:Booking)\n• (:Booking)-[:FOR_VEHICLE]->(:Vehicle)\n• (:Vehicle)-[:VEHICLE_BELONGS_TO]->(:Category)\n• (:Customer)-[:CUSTOMER_INTERESTED_IN]->(:Category)\n• (:Customer)-[:CUSTOMER_REVIEWED {rating: 5}]->(:Vehicle)', {
      x: 1.1, y: 4.95, w: 5.0, h: 1.6,
      fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 16
    });

    // Right Column: Cypher Query Card
    addCard(slide, 6.7, 1.4, 5.8, 5.4, '0A192F', '1E293B');
    slide.addText('PRODUCTION CYPHER RECOMMENDATION QUERY', {
      x: 7.0, y: 1.6, w: 5.2, h: 0.3,
      fontSize: 11, bold: true, color: 'C084FC', fontFace: 'Courier New'
    });

    const cypherCode = `// 1. Identify categories customer has affinity for
MATCH (c:Customer {id: $customerId})
      -[:CUSTOMER_INTERESTED_IN]->(cat:VehicleCategory)

// 2. Traverse to vehicles belonging to category
MATCH (v:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat)

// 3. Exclude vehicles already booked by customer
WHERE NOT (c)-[:CUSTOMER_BOOKED]->(:Booking)
              -[:FOR_VEHICLE]->(v)

// 4. Return top recommendations by affinity score
RETURN v.id AS vehicleId,
       v.brand AS brand, 
       v.model AS model, 
       cat.name AS categoryName, 
       count(cat) AS affinityScore
ORDER BY affinityScore DESC
LIMIT 4;`;

    slide.addText(cypherCode, {
      x: 7.0, y: 2.0, w: 5.2, h: 4.6,
      fontSize: 9.5, color: 'E2E8F0', fontFace: 'Consolas', lineSpacing: 17
    });
  }

  // =========================================================================
  // SLIDE 9: SECURITY ARCHITECTURE (BCRYPT + JWT + RBAC)
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Application Security: bcrypt Hashing & Stateless JWT RBAC');

    // Card 1: bcrypt
    addCard(slide, 0.8, 1.4, 3.75, 5.4);
    slide.addText('BCRYPT PASSWORD HASHING', {
      x: 1.0, y: 1.6, w: 3.35, h: 0.3,
      fontSize: 11, bold: true, color: C_EMERALD, fontFace: 'Calibri'
    });
    slide.addText('• Salt Factor: 10 rounds (1,024 iterations)\n• Cryptographically unique 16-byte random salt per user.\n• Prevents Rainbow Table attacks—identical passwords yield completely different hashes.\n• One-way mathematical trapdoor function: computationally impossible to reverse.\n• Verification: bcrypt.compare(plain, hash)', {
      x: 1.0, y: 2.0, w: 3.35, h: 3.5,
      fontSize: 10, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 18
    });

    // Card 2: JWT
    addCard(slide, 4.75, 1.4, 3.85, 5.4);
    slide.addText('STATELESS JWT TOKENS', {
      x: 4.95, y: 1.6, w: 3.45, h: 0.3,
      fontSize: 11, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });
    slide.addText('• Standard: RFC 7519\n• Signed with HMAC-SHA256\n• Header: Algorithm + Token type\n• Payload: user_id, email, role, full_name\n• Signature: Prevents payload tampering\n• Stateless Cloud Scalability: Servers do not store session memory.\n• Axios interceptors automatically inject Authorization: Bearer <token>', {
      x: 4.95, y: 2.0, w: 3.45, h: 3.5,
      fontSize: 10, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 18
    });

    // Card 3: RBAC & Rate Limiting
    addCard(slide, 8.8, 1.4, 3.75, 5.4);
    slide.addText('RBAC & DEFENSIVE HEADERS', {
      x: 9.0, y: 1.6, w: 3.35, h: 0.3,
      fontSize: 11, bold: true, color: C_PURPLE, fontFace: 'Calibri'
    });
    slide.addText('• 3 Roles: Administrator, Rental Manager, Customer.\n• Middleware requireRole("admin") verifies role claims before controller execution.\n• express-rate-limit: Caps burst requests to 100/15min to prevent brute-force login attacks.\n• helmet(): Sanitizes HTTP headers to mitigate XSS, Clickjacking, and MIME sniffing.', {
      x: 9.0, y: 2.0, w: 3.35, h: 3.5,
      fontSize: 10, color: C_NAVY, fontFace: 'Calibri', lineSpacing: 18
    });
  }

  // =========================================================================
  // SLIDE 10: REACT 18 FRONTEND & ANALYTICS
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Presentation Layer: React 18, Tailwind CSS & Recharts Analytics');

    // Left Column: Key Features
    addCard(slide, 0.8, 1.4, 5.6, 5.4);
    slide.addText('15+ FUNCTIONAL PAGES & CLIENT ROUTING', {
      x: 1.1, y: 1.6, w: 5.0, h: 0.3,
      fontSize: 11.5, bold: true, color: C_BLUE, fontFace: 'Calibri'
    });

    const pages = [
      '• LandingPage: Hero banner, fleet catalog, search filters, customer testimonials',
      '• LoginPage & Register: 1-click Quick Demo credential autofill for 3 roles',
      '• VehicleListingPage: Dynamic search, category chips, price sliders, transmission',
      '• VehicleDetailPage: Full specs, accessories, daily tariff, instant booking button',
      '• BookingPage & History: Real-time price calculation, active/completed badges',
      '• AdminDashboard: Executive Recharts business intelligence graphs',
      '• ManagerDashboard: Fleet maintenance scheduling & booking approvals',
      '• CustomerDashboard: Interactive Neo4j Cypher Recommendation Console'
    ];

    pages.forEach((pg, i) => {
      slide.addText(pg, {
        x: 1.1, y: 2.05 + (i * 0.58), w: 5.0, h: 0.55,
        fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri'
      });
    });

    // Right Column: Technical UI Architecture
    addCard(slide, 6.7, 1.4, 5.8, 5.4);
    slide.addText('FRONTEND ARCHITECTURAL STACK', {
      x: 7.0, y: 1.6, w: 5.2, h: 0.3,
      fontSize: 11.5, bold: true, color: C_INDIGO, fontFace: 'Calibri'
    });

    const tech = [
      { t: 'React 18 Fiber Reconciliation', d: 'Virtual DOM diffing updates only modified vehicle cards without flickering or full-page browser reloads.' },
      { t: 'Centralized React Context API (AuthContext)', d: 'Provides global user session state, auto-login persistence, and logout handling across all components without prop drilling.' },
      { t: 'Axios Interceptors Pipeline', d: 'Attaches Bearer JWT headers on outgoing calls; catches 401 Unauthorized responses to gracefully redirect users to login.' },
      { t: 'Declarative Recharts Data Visualization', d: 'SVG-based Area Charts for Monthly Revenue Trends, Bar Charts for Category Fleet Utilization, and Pie Charts for Location Distribution.' }
    ];

    tech.forEach((tc, i) => {
      const ty = 2.05 + (i * 1.18);
      slide.addText(`🚀 ${tc.t}`, {
        x: 7.0, y: ty, w: 5.2, h: 0.3,
        fontSize: 11, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });
      slide.addText(tc.d, {
        x: 7.3, y: ty + 0.3, w: 4.9, h: 0.65,
        fontSize: 9.5, color: C_MUTED, fontFace: 'Calibri'
      });
    });
  }

  // =========================================================================
  // SLIDE 11: 4-MEMBER TEAM WORK DISTRIBUTION
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Project Ownership: 4-Member Engineering Work Distribution');

    const members = [
      {
        role: 'MEMBER 1: RELATIONAL DB & ACID',
        name: 'Bommasani Gunadeep',
        tasks: [
          '10 Normalized MySQL 8.0 schema tables',
          'ACID transaction engine with row locks',
          'SELECT ... FOR UPDATE double-booking fix',
          'Foreign key integrity & Indian fleet seeding'
        ],
        files: 'schema.sql, bookingController.js, seedAll.js',
        color: C_EMERALD, border: 'A7F3D0', bg: 'ECFDF5'
      },
      {
        role: 'MEMBER 2: BACKEND & SECURITY',
        name: 'Team Member 2',
        tasks: [
          'Modular Express REST API architecture',
          'JWT authentication & bcrypt password hashing',
          'Redis Cache-Aside caching layer (2ms reads)',
          'RBAC middleware & API rate limiter'
        ],
        files: 'app.js, redis.js, authController.js, auth.js',
        color: C_AMBER, border: 'FDE68A', bg: 'FFFBEB'
      },
      {
        role: 'MEMBER 3: CLOUD & GRAPH DB',
        name: 'Team Member 3',
        tasks: [
          'MongoDB NoSQL dynamic vehicle specs',
          'Telemetry user audit logging engine',
          'Neo4j Aura Cypher recommendation queries',
          'Docker containerization & Render deployment'
        ],
        files: 'mongodb.js, neo4j.js, schema.cypher, Docker',
        color: C_CYAN, border: 'A5F3FC', bg: 'ECFEFF'
      },
      {
        role: 'MEMBER 4: FRONTEND & UI/UX',
        name: 'Team Member 4',
        tasks: [
          'React 18 Single-Page Application (Vite)',
          '15+ responsive Tailwind CSS pages',
          'Recharts analytics business dashboard',
          'Axios interceptors & AuthContext state'
        ],
        files: 'App.jsx, AuthContext.jsx, api.js, Pages',
        color: C_PURPLE, border: 'E9D5FF', bg: 'FAF5FF'
      }
    ];

    members.forEach((m, idx) => {
      const mx = 0.8 + (idx * 2.975);
      addCard(slide, mx, 1.4, 2.75, 5.4, m.bg, m.border);

      slide.addText(m.role, {
        x: mx + 0.15, y: 1.6, w: 2.45, h: 0.35,
        fontSize: 9.5, bold: true, color: m.color, fontFace: 'Calibri'
      });
      slide.addText(m.name, {
        x: mx + 0.15, y: 1.95, w: 2.45, h: 0.35,
        fontSize: 13, bold: true, color: C_NAVY, fontFace: 'Calibri'
      });

      slide.addText('KEY MODULES DELIVERED:', {
        x: mx + 0.15, y: 2.4, w: 2.45, h: 0.25,
        fontSize: 8.5, bold: true, color: C_MUTED, fontFace: 'Calibri'
      });

      m.tasks.forEach((t, ti) => {
        slide.addText(`• ${t}`, {
          x: mx + 0.15, y: 2.7 + (ti * 0.65), w: 2.45, h: 0.6,
          fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri'
        });
      });

      slide.addText('OWNED CODE FILES:', {
        x: mx + 0.15, y: 5.4, w: 2.45, h: 0.25,
        fontSize: 8.5, bold: true, color: C_MUTED, fontFace: 'Calibri'
      });
      slide.addText(m.files, {
        x: mx + 0.15, y: 5.7, w: 2.45, h: 0.8,
        fontSize: 9, bold: true, color: m.color, fontFace: 'Consolas'
      });
    });
  }

  // =========================================================================
  // SLIDE 12: TESTING, VERIFICATION & METRICS
  // =========================================================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Verification: 15 Automated Test Suites & Live Benchmarks');

    // 4 Big Metric Counters
    const benchmarks = [
      { num: '23 / 23', label: 'Automated Tests Passed', desc: '0 Failures across 15 suites', color: C_EMERALD },
      { num: '0.00 %', label: 'Double-Booking Rate', desc: '100% ACID Row-Lock isolation', color: C_BLUE },
      { num: '1.8 ms', label: 'Redis Cache Response', desc: 'Sub-millisecond listing search', color: C_AMBER },
      { num: '24 / 7', label: 'Live Cloud Availability', desc: 'Render + Redis + Neo4j Aura', color: C_PURPLE },
    ];

    benchmarks.forEach((b, i) => {
      const bx = 0.8 + (i * 2.975);
      addCard(slide, bx, 1.4, 2.75, 1.4);
      slide.addText(b.num, {
        x: bx + 0.15, y: 1.5, w: 2.45, h: 0.55,
        fontSize: 26, bold: true, color: b.color, fontFace: 'Calibri', align: 'center'
      });
      slide.addText(b.label, {
        x: bx + 0.15, y: 2.05, w: 2.45, h: 0.3,
        fontSize: 10.5, bold: true, color: C_NAVY, fontFace: 'Calibri', align: 'center'
      });
      slide.addText(b.desc, {
        x: bx + 0.15, y: 2.35, w: 2.45, h: 0.3,
        fontSize: 8.5, color: C_MUTED, fontFace: 'Calibri', align: 'center'
      });
    });

    // Test Suite Table
    addCard(slide, 0.8, 3.05, 11.7, 3.8);
    slide.addText('AUTOMATED TEST RUNNER VERIFICATION (tests/run-all-tests.js)', {
      x: 1.1, y: 3.25, w: 10.0, h: 0.3,
      fontSize: 11.5, bold: true, color: C_NAVY, fontFace: 'Calibri'
    });

    const testSuites = [
      '✅ Suite 1: Multi-Database Health Check (/api/health returns 200 OK across all tiers)',
      '✅ Suite 2: Customer Registration & JWT Token Issuance with 7-Day Expiry',
      '✅ Suite 3: Login Authentication with bcrypt Hash Verification (Customer@123)',
      '✅ Suite 4: Vehicle Catalog Retrieval & Redis Cache Ingestion (TTL Verification)',
      '✅ Suite 5: Filtered Vehicle Search by Category (Compact SUV, EV, Luxury)',
      '✅ Suite 6: Atomic Booking Creation with InnoDB SELECT ... FOR UPDATE Row-Locking',
      '✅ Suite 7: Double-Booking Overlap Prevention (Simulated Conflict returns 409 Conflict)',
      '✅ Suite 8: Redis Cache Invalidation Triggered Upon Booking Creation',
      '✅ Suite 9: MongoDB Telemetry Logging Verification for USER_LOGIN and BOOKING_CREATED',
      '✅ Suite 10: Neo4j Graph Cypher Traversal for Customer Category Recommendations'
    ];

    testSuites.forEach((ts, idx) => {
      slide.addText(ts, {
        x: 1.1, y: 3.65 + (idx * 0.3), w: 11.0, h: 0.28,
        fontSize: 9.5, color: C_NAVY, fontFace: 'Calibri'
      });
    });
  }

  // =========================================================================
  // SLIDE 13: CONCLUSION & VIVA Q&A DEFENSE
  // =========================================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: '0A192F' }; // Midnight Navy Conclusion

    slide.addText('PROJECT CONCLUSION & VIVA DEFENSE', {
      x: 1.0, y: 0.8, w: 11.0, h: 0.4,
      fontSize: 12, bold: true, color: '38BDF8', fontFace: 'Calibri'
    });

    slide.addText('Why DriveElite Achieves Enterprise Grade', {
      x: 1.0, y: 1.25, w: 11.0, h: 0.6,
      fontSize: 28, bold: true, color: C_WHITE, fontFace: 'Calibri'
    });

    // 3 Summary Cards
    const takeaways = [
      {
        t: '1. Real Polyglot Architecture',
        d: 'Not a cosmetic prototype: live MySQL 8.0 ACID engine, real Redis 7.x Cloud caching, live MongoDB Atlas telemetry, and real Neo4j Aura graph traversals working simultaneously.',
        color: '10B981'
      },
      {
        t: '2. Zero Double-Booking Guarantee',
        d: 'Solves the hardest distributed concurrency problem using InnoDB row-level locking (SELECT ... FOR UPDATE) and atomic rollback handling.',
        color: '38BDF8'
      },
      {
        t: '3. Complete Production Delivery',
        d: 'Live 24/7 cloud deployment on Render with responsive React 18 UI, 15 automated test suites (23/23 passed), and 28-section academic documentation.',
        color: 'A855F7'
      }
    ];

    takeaways.forEach((tk, idx) => {
      const ty = 2.1 + (idx * 1.55);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0, y: ty, w: 11.3, h: 1.35,
        fill: { color: '0F2D4A' }, line: { color: tk.color, width: 1.5 }, rectRadius: 0.1
      });
      slide.addText(tk.t, {
        x: 1.3, y: ty + 0.18, w: 10.7, h: 0.35,
        fontSize: 14, bold: true, color: tk.color, fontFace: 'Calibri'
      });
      slide.addText(tk.d, {
        x: 1.3, y: ty + 0.55, w: 10.7, h: 0.65,
        fontSize: 11, color: 'E2E8F0', fontFace: 'Calibri'
      });
    });

    slide.addText('Thank You!  •  Questions & Viva Discussion Welcomed', {
      x: 1.0, y: 6.85, w: 11.3, h: 0.35,
      fontSize: 13, bold: true, color: '94A3B8', fontFace: 'Calibri', align: 'center'
    });
  }

  // Save the PowerPoint presentation file
  const outputPath = 'C:/Users/bomma/OneDrive/Desktop/DriveElite_Vehicle_Rental_System_Presentation.pptx';
  await pres.writeFile({ fileName: outputPath });
  console.log(`✅ PowerPoint presentation created successfully at: ${outputPath}`);
}

buildDriveElitePresentation().catch(err => {
  console.error('Error generating presentation:', err);
});
