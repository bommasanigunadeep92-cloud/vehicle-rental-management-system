// =====================================================================
// Neo4j Graph Database Schema & Cypher Queries
// Vehicle Rental Management System
// Nodes: Customer, Vehicle, VehicleCategory, Location, Booking
// Relationships: CUSTOMER_BOOKED, VEHICLE_BELONGS_TO, VEHICLE_LOCATED_AT, 
//               CUSTOMER_INTERESTED_IN, CUSTOMER_REVIEWED, FOR_VEHICLE
// =====================================================================

// 1. UNIQUE CONSTRAINTS & INDEXES
CREATE CONSTRAINT customer_id_unique IF NOT EXISTS FOR (c:Customer) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (cat:VehicleCategory) REQUIRE cat.id IS UNIQUE;
CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT booking_id_unique IF NOT EXISTS FOR (b:Booking) REQUIRE b.id IS UNIQUE;

// 2. SEED SAMPLE GRAPH NODES
MERGE (c1:Customer {id: 3, name: "Rahul Sharma", email: "rahul.sharma@example.com", city: "Bangalore"});
MERGE (c2:Customer {id: 4, name: "Priya Patel", email: "priya.patel@example.com", city: "Mumbai"});
MERGE (c3:Customer {id: 5, name: "Ananya Reddy", email: "ananya.reddy@example.com", city: "Hyderabad"});

MERGE (cat1:VehicleCategory {id: 1, name: "Hatchback"});
MERGE (cat2:VehicleCategory {id: 2, name: "Sedan"});
MERGE (cat3:VehicleCategory {id: 3, name: "Compact SUV"});
MERGE (cat4:VehicleCategory {id: 4, name: "Full SUV & 4x4"});
MERGE (cat5:VehicleCategory {id: 5, name: "Electric Vehicle (EV)"});
MERGE (cat6:VehicleCategory {id: 6, name: "Luxury & Executive"});

MERGE (l1:Location {id: 1, name: "Bangalore Kempegowda Airport Hub", city: "Bangalore"});
MERGE (l2:Location {id: 2, name: "Koramangala City Center Hub", city: "Bangalore"});
MERGE (l4:Location {id: 4, name: "Mumbai BKC Business Hub", city: "Mumbai"});
MERGE (l5:Location {id: 5, name: "Hyderabad Hitec City Hub", city: "Hyderabad"});

MERGE (v1:Vehicle {id: 1, brand: "Hyundai", model: "Creta SX Turbo", price: 2800});
MERGE (v2:Vehicle {id: 2, brand: "Tata", model: "Nexon EV", price: 3200});
MERGE (v3:Vehicle {id: 3, brand: "Mahindra", model: "Thar LX 4x4", price: 3500});
MERGE (v4:Vehicle {id: 4, brand: "Toyota", model: "Innova Crysta", price: 4500});
MERGE (v7:Vehicle {id: 7, brand: "Mahindra", model: "XUV700 AX7", price: 4200});
MERGE (v8:Vehicle {id: 8, brand: "BMW", model: "3 Series Gran Limousine", price: 8500});

// 3. GRAPH RELATIONSHIPS
MERGE (v1)-[:VEHICLE_BELONGS_TO]->(cat3);
MERGE (v1)-[:VEHICLE_LOCATED_AT]->(l2);

MERGE (v2)-[:VEHICLE_BELONGS_TO]->(cat5);
MERGE (v2)-[:VEHICLE_LOCATED_AT]->(l1);

MERGE (v3)-[:VEHICLE_BELONGS_TO]->(cat4);
MERGE (v3)-[:VEHICLE_LOCATED_AT]->(l2);

MERGE (v4)-[:VEHICLE_BELONGS_TO]->(cat4);
MERGE (v4)-[:VEHICLE_LOCATED_AT]->(l1);

MERGE (v7)-[:VEHICLE_BELONGS_TO]->(cat4);
MERGE (v7)-[:VEHICLE_LOCATED_AT]->(l5);

MERGE (v8)-[:VEHICLE_BELONGS_TO]->(cat6);
MERGE (v8)-[:VEHICLE_LOCATED_AT]->(l1);

// Historical Bookings
MERGE (b1:Booking {id: 1, reference: "BK-2026-00101", amount: 8400, days: 3});
MERGE (c1)-[:CUSTOMER_BOOKED]->(b1);
MERGE (b1)-[:FOR_VEHICLE]->(v1);
MERGE (c1)-[:CUSTOMER_INTERESTED_IN]->(cat3);
MERGE (c1)-[:CUSTOMER_REVIEWED {rating: 5}]->(v1);

MERGE (b2:Booking {id: 2, reference: "BK-2026-00102", amount: 6400, days: 2});
MERGE (c2)-[:CUSTOMER_BOOKED]->(b2);
MERGE (b2)-[:FOR_VEHICLE]->(v2);
MERGE (c2)-[:CUSTOMER_INTERESTED_IN]->(cat5);
MERGE (c2)-[:CUSTOMER_REVIEWED {rating: 5}]->(v2);

MERGE (b3:Booking {id: 3, reference: "BK-2026-00103", amount: 12600, days: 3});
MERGE (c3)-[:CUSTOMER_BOOKED]->(b3);
MERGE (b3)-[:FOR_VEHICLE]->(v7);
MERGE (c3)-[:CUSTOMER_INTERESTED_IN]->(cat4);

// =====================================================================
// OPERATIONAL CYPHER QUERIES
// =====================================================================

// Query 1: Personalized recommendations based on customer category affinity
MATCH (c:Customer {id: $customerId})-[:CUSTOMER_INTERESTED_IN]->(cat:VehicleCategory)
MATCH (v:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat)
WHERE NOT (c)-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v)
RETURN v.id AS vehicleId, v.brand AS brand, v.model AS model, cat.name AS categoryName, count(cat) AS affinityScore
ORDER BY affinityScore DESC
LIMIT 4;

// Query 2: Collaborative Filtering - Find similar customers with shared rental preferences
MATCH (c1:Customer {id: $customerId})-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v1:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat:VehicleCategory)
MATCH (c2:Customer)-[:CUSTOMER_BOOKED]->(:Booking)-[:FOR_VEHICLE]->(v2:Vehicle)-[:VEHICLE_BELONGS_TO]->(cat)
WHERE c1 <> c2
RETURN c2.id AS similarCustomerId, c2.name AS customerName, count(DISTINCT cat) AS sharedCategoriesCount
ORDER BY sharedCategoriesCount DESC
LIMIT 5;

// Query 3: Popular Vehicle Categories by Multi-Hop Graph Traversal
MATCH (cat:VehicleCategory)<-[:VEHICLE_BELONGS_TO]-(v:Vehicle)<-[:FOR_VEHICLE]-(b:Booking)
RETURN cat.name AS category, count(b) AS totalBookings, sum(b.amount) AS totalVolume
ORDER BY totalBookings DESC;

// Query 4: Customer Booking Relationship Graph Analysis
MATCH (c:Customer)-[:CUSTOMER_BOOKED]->(b:Booking)-[:FOR_VEHICLE]->(v:Vehicle)-[:VEHICLE_LOCATED_AT]->(l:Location)
RETURN c.name AS customer, b.reference AS bookingRef, v.model AS vehicle, l.name AS pickupHub;
