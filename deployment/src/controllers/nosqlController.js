import { getMongoDb, isMongoConnected } from '../config/mongodb.js';

/**
 * Get MongoDB User Activity Logs with Aggregation Pipeline
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const mongo = getMongoDb();
    const collection = mongo.collection('user_activity_logs');

    // Recent activity logs
    const logs = await (await collection.find({})).sort({ timestamp: -1 }).limit(50).toArray();

    // Aggregation Pipeline: Count actions grouped by action type
    const pipeline = [
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    const aggregationResult = await (await collection.aggregate(pipeline)).toArray();

    res.json({
      success: true,
      provider: isMongoConnected() ? 'MongoDB 7.x Native' : 'Resilient In-Memory NoSQL Store',
      logs,
      aggregation: aggregationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get / Update Flexible Vehicle Specs & Accessories
 */
export const getVehicleSpecs = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const mongo = getMongoDb();
    const doc = await mongo.collection('vehicle_details').findOne({ vehicle_id: Number(vehicleId) });

    res.json({
      success: true,
      details: doc || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleSpecs = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { specifications, features, accessories_included } = req.body;
    const mongo = getMongoDb();

    await mongo.collection('vehicle_details').updateOne(
      { vehicle_id: Number(vehicleId) },
      {
        $set: {
          specifications,
          features,
          accessories_included,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: 'MongoDB flexible vehicle specifications updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload & Retrieve Flexible Rental Documents
 */
export const getRentalDocuments = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const mongo = getMongoDb();
    const docs = await (await mongo.collection('rental_documents').find({ booking_id: Number(bookingId) })).toArray();

    res.json({
      success: true,
      documents: docs,
    });
  } catch (error) {
    next(error);
  }
};

export const saveRentalDocument = async (req, res, next) => {
  try {
    const { booking_id, document_type, document_name, document_url, metadata } = req.body;
    const mongo = getMongoDb();

    const result = await mongo.collection('rental_documents').insertOne({
      booking_id: Number(booking_id),
      document_type,
      document_name,
      document_url,
      metadata: metadata || {},
      uploaded_by: req.user ? req.user.id : null,
      uploaded_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Document saved in MongoDB flexible document store.',
      documentId: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getActivityLogs,
  getVehicleSpecs,
  updateVehicleSpecs,
  getRentalDocuments,
  saveRentalDocument,
};
