const Center = require('../models/centers');
const Analytics = require('../models/analytics');


const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isSimilarName(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return levenshtein(na, nb) / Math.max(na.length, nb.length) < 0.3;
}



const getAllCenters = async (req, res) => {
  try {
    const { county, search, lat, lng, radius = 10 } = req.query;

    await Analytics.create({
      eventType: 'center_search',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      location: county ? { county } : undefined,
      metadata: { search, hasLocation: !!(lat && lng) }
    });

    let query = { isActive: true };
    if (county && county !== 'All Kenya') query.county = county;
    if (search) {
      query.$or = [
        { name:         { $regex: search, $options: 'i' } },
        { location:     { $regex: search, $options: 'i' } },
        { constituency: { $regex: search, $options: 'i' } }
      ];
    }

    if (lat && lng) {
      const nearbyCenters = await Center.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      return res.json({ success: true, count: nearbyCenters.length, data: nearbyCenters, userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } });
    }

    const centers = await Center.find(query).lean();
    res.json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    console.error('Error in getAllCenters:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCenterById = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    await Analytics.create({
      eventType: 'center_view',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      centerId: center._id,
      location: { county: center.county }
    });

    const QueueReport = require('../models/QueueReport');
    const recentReports = await QueueReport.getRecentReports(center._id, 2);
    res.json({ success: true, data: { ...center.toObject(), recentReports } });
  } catch (error) {
    console.error('Error in getCenterById:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const checkProximity = async (req, res) => {
  try {
    const { centerId, userLat, userLng, maxDistanceKm = 0.5 } = req.body;
    if (!centerId || !userLat || !userLng)
      return res.status(400).json({ success: false, error: 'centerId, userLat, and userLng are required' });

    const center = await Center.findById(centerId);
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    const distance = center.calculateDistance(userLat, userLng);
    res.json({
      success: true,
      data: {
        centerId: center._id,
        centerName: center.name,
        distance,
        distanceText: `${distance.toFixed(2)} km`,
        distanceMeters: Math.round(distance * 1000),
        isWithinProximity: distance <= maxDistanceKm,
        maxDistance: maxDistanceKm,
        canSubmitReport: distance <= maxDistanceKm
      }
    });
  } catch (error) {
    console.error('Error in checkProximity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCentersByCounty = async (req, res) => {
  try {
    const centers = await Center.find({ county: req.params.county, isActive: true })
      .select('name location constituency coordinates currentQueue').lean();
    res.json({ success: true, county: req.params.county, count: centers.length, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllCounties = async (req, res) => {
  try {
    const counties = await Center.distinct('county', { isActive: true });
    res.json({ success: true, count: counties.length, data: counties.sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const findNearestCenters = async (req, res) => {
  try {
    const { lat, lng, limit = 5, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng are required' });

    const nearbyCenters = await Center.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    res.json({
      success: true,
      count: nearbyCenters.slice(0, parseInt(limit)).length,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      searchRadius: `${radius} km`,
      data: nearbyCenters.slice(0, parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



const addCenter = async (req, res) => {
  try {
    const { name, county, constituency, ward, type, address, landmark, latitude, longitude } = req.body;

    if (!name || !county || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        error: 'name, county, latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

 // geofence — any active center within 50 metres?

    const nearbyCenters = await Center.find({
      geoLocation: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 50 // metres
        }
      },
      isActive: true
    });

    if (nearbyCenters.length > 0) {
    
      const duplicate = nearbyCenters.find(c => isSimilarName(c.name, name));
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'duplicate',
          message: `"${duplicate.name}" already exists at this location.`,
          existing: {
            id: duplicate._id,
            name: duplicate.name,
            county: duplicate.county,
            lat: duplicate.coordinates.lat,
            lng: duplicate.coordinates.lng
          }
        });
      }
    }

    const center = await Center.create({
      name: name.trim(),
      location: address || `${constituency || county}`,
      county: county.trim(),
      constituency: constituency?.trim() || '',
      ward: ward?.trim() || '',
      type: type || 'other',
      address: address?.trim() || '',
      landmark: landmark?.trim() || '',
      coordinates: { lat, lng },
      submittedBy: 'public',
      isActive: true
    });

    // Track analytics
    await Analytics.create({
      eventType: 'center_added',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      centerId: center._id,
      location: { county },
      metadata: { submittedBy: 'public', type }
    }).catch(() => {}); // non-blocking

    res.status(201).json({
      success: true,
      message: 'Center added successfully',
      data: {
        id: center._id,
        name: center.name,
        county: center.county,
        lat: center.coordinates.lat,
        lng: center.coordinates.lng,
        type: center.type
      }
    });
  } catch (error) {
    console.error('Error in addCenter:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  checkProximity,
  getCentersByCounty,
  getAllCounties,
  findNearestCenters,
  addCenter  
};