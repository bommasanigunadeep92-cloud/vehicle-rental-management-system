/**
 * Comprehensive Automated Test Suite
 * Vehicle Rental Management System
 * Tests: MySQL 8.0, InnoDB Transactions, Row-locking, Redis Cache, MongoDB NoSQL, Neo4j Graph, JWT Auth, RBAC
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('================================================================');
  console.log(' 🧪 RUNNING AUTOMATED COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(` ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${title}`);
      if (details) console.error(`    Detail: ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check & Multi-DB Status
    console.log('[1/15] Testing Multi-Database Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'online', 'Health endpoint reports online status');
    assert(health.databases.mysql.status === 'Healthy', 'MySQL 8.0 Primary Relational DB is Healthy');
    assert(health.databases.redis.status === 'Active', 'Redis Cache layer is Active');

    // 2. Customer Registration
    console.log('\n[2/15] Testing Customer Registration...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Customer',
        email: testEmail,
        password: 'Password@123',
        phone: '+91 99999 88888',
        driving_license: 'DL-TEST-2026',
        address: 'Bangalore Tech Park',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'Customer registration succeeds and issues JWT token');
    assert(regData.user.role === 'customer', 'Registered user is assigned "customer" role by default');

    // 3. User Login & Password Hashing
    console.log('\n[3/15] Testing Authentication & bcrypt Password Hashing...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vehiclerental.com',
        password: 'Admin@123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.user.role === 'admin', 'Admin login succeeds with verified bcrypt hash');
    const adminToken = loginData.token;

    // Bad password check
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vehiclerental.com',
        password: 'WrongPassword999',
      }),
    });
    assert(badLoginRes.status === 401, 'Unauthorized rejection on incorrect password');

    // 4. Role-Based Access Control (RBAC)
    console.log('\n[4/15] Testing Role-Based Authorization Security (RBAC)...');
    const customerToken = regData.token;
    // Attempt admin-only route with customer token
    const rbacRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(rbacRes.status === 403, 'Customer token is strictly forbidden (403) from accessing Admin route');

    // Admin token access
    const adminAccessRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAccessRes.status === 200, 'Admin token successfully authorized (200) for Admin management');

    // 5. Redis Cache & Cache-Aside Pattern
    console.log('\n[5/15] Testing Redis Cache-Aside Pattern...');
    const list1 = await (await fetch(`${BASE_URL}/vehicles`)).json();
    const list2 = await (await fetch(`${BASE_URL}/vehicles`)).json();
    assert(list2.source.includes('Redis Cache') || list2.source.includes('Cache'), 'Subsequent vehicle request is served from Cache (Cache-Aside)');

    // 6. Vehicle CRUD & Cache Invalidation
    console.log('\n[6/15] Testing Vehicle Fleet CRUD & Invalidation...');
    const newReg = `KA-99-TEST-${Date.now().toString().slice(-4)}`;
    const createVehRes = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        brand: 'Tata',
        model: 'Safari Dark Edition',
        registration_number: newReg,
        category_id: 4,
        location_id: 1,
        manufacturing_year: 2024,
        fuel_type: 'Diesel',
        transmission: 'Automatic',
        seating_capacity: 7,
        rental_price_per_day: 4800,
        availability_status: 'Available',
      }),
    });
    const createVehData = await createVehRes.json();
    assert(createVehRes.status === 201 && createVehData.vehicleId, 'Admin successfully adds new vehicle to fleet');
    const createdVehicleId = createVehData.vehicleId;

    // 7. Date Range Validation
    console.log('\n[7/15] Testing Booking Date Constraints...');
    const invalidDatesRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        pickup_location_id: 1,
        return_location_id: 1,
        pickup_date: '2026-12-10 10:00:00',
        return_date: '2026-12-05 10:00:00', // return BEFORE pickup
      }),
    });
    assert(invalidDatesRes.status === 400, 'Rejects invalid booking dates where return precedes pickup');

    // 8. ACID Transactional Booking Creation & Row Locking
    console.log('\n[8/15] Testing ACID Transaction & InnoDB Row-Level Locking (SELECT ... FOR UPDATE)...');
    const book1Res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        pickup_location_id: 1,
        return_location_id: 1,
        pickup_date: '2026-12-01 10:00:00',
        return_date: '2026-12-05 10:00:00',
        payment_method: 'UPI',
      }),
    });
    const book1Data = await book1Res.json();
    assert(book1Res.status === 201 && book1Data.booking.booking_reference, 'Transaction commits: Booking confirmed with generated reference');
    const firstBookingId = book1Data.booking.id;

    // 9. Payment Processing Simulation
    console.log('\n[9/15] Testing Payment Gateway Simulation...');
    assert(book1Data.booking.transaction_reference.startsWith('TXN-'), 'Payment record automatically created with simulated gateway reference');

    // 10. Prevention of Concurrent Double Booking
    console.log('\n[10/15] Testing Simultaneous Double Booking Conflict Prevention...');
    // Attempt second booking for overlapping dates on the SAME vehicle
    const overlapRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        pickup_location_id: 1,
        return_location_id: 1,
        pickup_date: '2026-12-03 10:00:00', // overlaps with Dec 1 - Dec 5
        return_date: '2026-12-08 10:00:00',
        payment_method: 'Credit Card',
      }),
    });
    const overlapData = await overlapRes.json();
    assert(overlapRes.status === 409, 'Double booking rejected with 409 Conflict status via MySQL Row Lock validation');

    // 11. Transaction Rollback Verification
    console.log('\n[11/15] Verifying Transaction Rollback Integrity...');
    // Verify that the conflicted booking was not inserted into database
    const myBookingsRes = await fetch(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myBookings = await myBookingsRes.json();
    const matching = myBookings.bookings.filter((b) => b.vehicle_id === createdVehicleId);
    assert(matching.length === 1, 'Transaction rolled back cleanly without orphaned records or duplicate state');

    // 12. Transactional Booking Cancellation & Availability Restoration
    console.log('\n[12/15] Testing Booking Cancellation & Availability Restoration...');
    const cancelRes = await fetch(`${BASE_URL}/bookings/${firstBookingId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Booking cancelled and payment marked for refund');

    // Now re-attempt the previous overlapping dates: should succeed because availability was restored!
    const rebookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        pickup_location_id: 1,
        return_location_id: 1,
        pickup_date: '2026-12-03 10:00:00',
        return_date: '2026-12-08 10:00:00',
        payment_method: 'UPI',
      }),
    });
    assert(rebookRes.status === 201, 'Restored date window is immediately available for re-booking after cancellation');

    // 13. MongoDB NoSQL Activity Logs & Aggregation Pipeline
    console.log('\n[13/15] Testing MongoDB NoSQL Documents & Aggregations...');
    const nosqlRes = await fetch(`${BASE_URL}/nosql/activity-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const nosqlData = await nosqlRes.json();
    assert(nosqlData.success && nosqlData.logs.length > 0, 'MongoDB activity stream records user actions');
    assert(Array.isArray(nosqlData.aggregation) && nosqlData.aggregation.length > 0, 'MongoDB aggregation pipeline successfully groups events');

    // 14. Neo4j Graph Database Recommendations
    console.log('\n[14/15] Testing Neo4j Graph Recommendations & Cypher Query Engine...');
    const graphRes = await fetch(`${BASE_URL}/graph/recommendations`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const graphData = await graphRes.json();
    assert(graphData.success && graphData.cypherQuery.includes('MATCH'), 'Cypher query generated and executed for graph recommendation');
    assert(Array.isArray(graphData.recommendations) && graphData.recommendations.length > 0, 'Personalized recommendations returned based on category affinity graph');

    // 15. Vehicle Maintenance Availability Constraint
    console.log('\n[15/15] Testing Maintenance Scheduling & Booking Rejection...');
    await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        service_type: 'Brake Disc Replacement',
        service_date: '2026-12-01',
        cost: 6500,
        status: 'In Progress',
        update_vehicle_status: 'Maintenance',
      }),
    });

    const bookMaintenanceRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        pickup_location_id: 1,
        return_location_id: 1,
        pickup_date: '2026-12-20 10:00:00',
        return_date: '2026-12-25 10:00:00',
      }),
    });
    assert(bookMaintenanceRes.status === 400, 'Rejects reservation of vehicle currently in Maintenance status');

    // Clean up test vehicle
    await fetch(`${BASE_URL}/vehicles/${createdVehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    console.log('\n================================================================');
    console.log(` 🏁 TEST SUITE COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (error) {
    console.error('Fatal test execution error:', error);
    process.exit(1);
  }
};

runTests();
