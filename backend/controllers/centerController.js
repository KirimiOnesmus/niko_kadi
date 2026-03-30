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

const getUserIdentifier = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  return require('crypto').createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
};

const getAllCenters = async (req, res) => {
  try {
    const { county, search, lat, lng, radius = 10 } = req.query;

    await Analytics.create({
      eventType: 'center_search',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      location: county ? { county } : undefined,
      metadata: { search, hasLocation: !!(lat && lng) }
    }).catch(() => {});


    let query = { isActive: true, isVerified: true };
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
      return res.json({ 
        success: true, 
        count: nearbyCenters.length, 
        data: nearbyCenters, 
        userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } 
      });
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
    }).catch(() => {});

    const QueueReport = require('../models/QueueReport');
    const recentReports = await QueueReport.getRecentReports(center._id, 2);
    
    
    const response = { ...center.toObject(), recentReports };
    if (!center.isVerified && center.expireAt) {
      const now = new Date();
      const daysRemaining = Math.ceil((center.expireAt - now) / (1000 * 60 * 60 * 24));
      response.verificationStatus = {
        isVerified: false,
        verificationCount: center.verificationCount,
        remainingVerifications: Math.max(0, 3 - center.verificationCount),
        expiresAt: center.expireAt,
        daysUntilExpiration: Math.max(0, daysRemaining),
        isExpiringSoon: daysRemaining <= 2
      };
    }
    
    res.json({ success: true, data: response });
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
    const centers = await Center.find({ 
      county: req.params.county, 
      isActive: true, 
      isVerified: true 
    }).select('name location constituency coordinates currentQueue').lean();
    
    res.json({ 
      success: true, 
      county: req.params.county, 
      count: centers.length, 
      data: centers 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllCounties = async (req, res) => {
  try {
    const counties = await Center.distinct('county', { isActive: true, isVerified: true });
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

    const userIdentifier = getUserIdentifier(req);

    
    const nearbyCenters = await Center.find({
      geoLocation: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 50
        }
      },
      isActive: true
    });

    if (nearbyCenters.length > 0) {
      const matching = nearbyCenters.find(c => isSimilarName(c.name, name));
      
      if (matching) {
        
        if (matching.isVerified) {
          return res.status(409).json({
            success: false,
            error: 'duplicate',
            message: `"${matching.name}" already exists at this location.`,
            existing: {
              id: matching._id,
              name: matching.name,
              county: matching.county,
              lat: matching.coordinates.lat,
              lng: matching.coordinates.lng
            }
          });
        }

        
        if (matching.verifiers.includes(userIdentifier)) {
          const now = new Date();
          const daysRemaining = matching.expireAt 
            ? Math.ceil((matching.expireAt - now) / (1000 * 60 * 60 * 24))
            : null;
            
          return res.status(409).json({
            success: false,
            error: 'already_voted',
            message: 'You have already verified this center',
            data: {
              id: matching._id,
              name: matching.name,
              verificationCount: matching.verificationCount,
              remainingVerifications: Math.max(0, 3 - matching.verificationCount),
              expiresAt: matching.expireAt,
              daysUntilExpiration: Math.max(0, daysRemaining)
            }
          });
        }

        
        matching.verifiers.push(userIdentifier);
        matching.verificationCount = matching.verifiers.length;

        
        if (matching.verificationCount >= matching.verificationThreshold) {
          matching.isVerified = true;
          matching.submittedBy = 'community_verified';
      
          await matching.save();

          await Analytics.create({
            eventType: 'center_published',
            source: req.headers['x-source'] || 'web',
            sessionId: req.headers['x-session-id'],
            centerId: matching._id,
            location: { county },
            metadata: { verificationCount: matching.verificationCount }
          }).catch(() => {});

          return res.status(201).json({
            success: true,
            message: 'Center verified and published successfully! ',
            published: true,
            data: {
              id: matching._id,
              name: matching.name,
              county: matching.county,
              lat: matching.coordinates.lat,
              lng: matching.coordinates.lng,
              type: matching.type,
              verificationCount: matching.verificationCount
            }
          });
        }

        
        await matching.save();

        const now = new Date();
        const daysRemaining = matching.expireAt 
          ? Math.ceil((matching.expireAt - now) / (1000 * 60 * 60 * 24))
          : null;

        return res.status(200).json({
          success: true,
          message: `Verification recorded. ${3 - matching.verificationCount} more needed.`,
          published: false,
          data: {
            id: matching._id,
            name: matching.name,
            county: matching.county,
            verificationCount: matching.verificationCount,
            remainingVerifications: 3 - matching.verificationCount,
            expiresAt: matching.expireAt,
            daysUntilExpiration: Math.max(0, daysRemaining),
            isExpiringSoon: daysRemaining <= 2
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
      isActive: true,
      isVerified: false,
      verifiers: [userIdentifier],
      verificationCount: 1,
      verificationThreshold: 3
    });

    await Analytics.create({
      eventType: 'center_submitted',
      source: req.headers['x-source'] || 'web',
      sessionId: req.headers['x-session-id'],
      centerId: center._id,
      location: { county },
      metadata: { type, status: 'pending' }
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Center submitted for verification. 2 more verifications needed.',
      published: false,
      data: {
        id: center._id,
        name: center.name,
        county: center.county,
        verificationCount: 1,
        remainingVerifications: 2,
        expiresAt: center.expireAt,
        daysUntilExpiration: 14
      }
    });
  } catch (error) {
    console.error('Error in addCenter:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const getPendingCenters = async (req, res) => {
  try {
    const { county, minVerifications = 0 } = req.query;
    
    let query = { isActive: true, isVerified: false };
    if (county && county !== 'All Kenya') query.county = county;
    if (minVerifications) query.verificationCount = { $gte: parseInt(minVerifications) };

    const pending = await Center.find(query)
      .sort({ verificationCount: -1, updatedAt: -1 })
      .lean();

    const now = new Date();
    
    res.json({
      success: true,
      count: pending.length,
      data: pending.map(p => {
        const daysRemaining = p.expireAt 
          ? Math.ceil((p.expireAt - now) / (1000 * 60 * 60 * 24))
          : null;
        
        return {
          id: p._id,
          name: p.name,
          county: p.county,
          constituency: p.constituency,
          type: p.type,
          address: p.address,
          landmark: p.landmark,
          coordinates: p.coordinates,
          verificationCount: p.verificationCount,
          remainingVerifications: Math.max(0, 3 - p.verificationCount),
          submittedAt: p.createdAt,
          lastUpdated: p.updatedAt,
          expiresAt: p.expireAt,
          daysUntilExpiration: Math.max(0, daysRemaining),
          isExpiringSoon: daysRemaining <= 2
        };
      })
    });
  } catch (error) {
    console.error('Error in getPendingCenters:', error);
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
  addCenter,
  getPendingCenters
};