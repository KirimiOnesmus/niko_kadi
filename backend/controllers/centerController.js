const Center = require('../models/centers');
const Analytics = require('../models/analytics');

// Get all centers with optional filtering
const getAllCenters = async (req, res) => {
  try {
    const { county, search, lat, lng, radius = 10 } = req.query;
    
    // Track analytics
    await Analytics.create({
      eventType: 'center_search',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      location: county ? { county } : undefined,
      metadata: { search, hasLocation: !!(lat && lng) }
    });
    
    let query = { isActive: true };
    
    // Filter by county
    if (county && county !== 'All Kenya') {
      query.county = county;
    }
    
    // Search by name or location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { constituency: { $regex: search, $options: 'i' } }
      ];
    }
    
    // If coordinates provided, find nearby centers
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistanceKm = parseFloat(radius);
      
      const nearbyCenters = await Center.findNearby(userLat, userLng, maxDistanceKm);
      
      return res.json({
        success: true,
        count: nearbyCenters.length,
        data: nearbyCenters,
        userLocation: { lat: userLat, lng: userLng }
      });
    }
    
    const centers = await Center.find(query).lean();
    
    res.json({
      success: true,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    console.error('Error in getAllCenters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single center by ID
const getCenterById = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
      });
    }
    
    // Track analytics
    await Analytics.create({
      eventType: 'center_view',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      centerId: center._id,
      location: { county: center.county }
    });
    
    const QueueReport = require('../models/QueueReport');
    const recentReports = await QueueReport.getRecentReports(center._id, 2);
    
    res.json({
      success: true,
      data: {
        ...center.toObject(),
        recentReports: recentReports
      }
    });
  } catch (error) {
    console.error('Error in getCenterById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Check if user is within proximity of a center
const checkProximity = async (req, res) => {
  try {
    const { centerId, userLat, userLng, maxDistanceKm = 0.5 } = req.body;
    
    if (!centerId || !userLat || !userLng) {
      return res.status(400).json({
        success: false,
        error: 'centerId, userLat, and userLng are required'
      });
    }
    
    const center = await Center.findById(centerId);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
      });
    }
    
    const distance = center.calculateDistance(userLat, userLng);
    const isWithinProximity = distance <= maxDistanceKm;
    
    res.json({
      success: true,
      data: {
        centerId: center._id,
        centerName: center.name,
        distance: distance,
        distanceText: `${distance.toFixed(2)} km`,
        distanceMeters: Math.round(distance * 1000),
        isWithinProximity: isWithinProximity,
        maxDistance: maxDistanceKm,
        canSubmitReport: isWithinProximity
      }
    });
  } catch (error) {
    console.error('Error in checkProximity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get centers by county
const getCentersByCounty = async (req, res) => {
  try {
    const { county } = req.params;
    
    const centers = await Center.find({
      county: county,
      isActive: true
    }).select('name location constituency coordinates currentQueue').lean();
    
    res.json({
      success: true,
      county: county,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    console.error('Error in getCentersByCounty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all unique counties
const getAllCounties = async (req, res) => {
  try {
    const counties = await Center.distinct('county', { isActive: true });
    
    res.json({
      success: true,
      count: counties.length,
      data: counties.sort()
    });
  } catch (error) {
    console.error('Error in getAllCounties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Find nearest centers to user location
const findNearestCenters = async (req, res) => {
  try {
    const { lat, lng, limit = 5, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'lat and lng are required'
      });
    }
    
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistanceKm = parseFloat(radius);
    
    const nearbyCenters = await Center.findNearby(userLat, userLng, maxDistanceKm);
    const limitedCenters = nearbyCenters.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: limitedCenters.length,
      userLocation: { lat: userLat, lng: userLng },
      searchRadius: `${maxDistanceKm} km`,
      data: limitedCenters
    });
  } catch (error) {
    console.error('Error in findNearestCenters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  checkProximity,
  getCentersByCounty,
  getAllCounties,
  findNearestCenters
};