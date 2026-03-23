const QueueReport = require('../models/queuereport');
const Center = require('../models/centers');
const Analytics = require('../models/analytics');

// Submit queue report with proximity verification
const submitQueueReport = async (req, res) => {
  try {
    const { centerId, status, userLat, userLng, source = 'web', whatsappData } = req.body;
    
    // Validate required fields
    if (!centerId || !status || !userLat || !userLng) {
      return res.status(400).json({
        success: false,
        error: 'centerId, status, userLat, and userLng are required',
        required: ['centerId', 'status', 'userLat', 'userLng']
      });
    }
    
    // Validate status
    const validStatuses = ['short', 'moderate', 'long', 'verylong'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: short, moderate, long, verylong',
        validStatuses
      });
    }
    
    // Check if center exists
    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
      });
    }
    
    // Check proximity (must be within 500m)
    const isWithinProximity = center.isWithinProximity(userLat, userLng, 0.5);
    
    if (!isWithinProximity) {
      const distance = center.calculateDistance(userLat, userLng);
      return res.status(400).json({
        success: false,
        error: 'You must be within 500m of the center to submit a report',
        data: {
          distance: distance,
          distanceText: `${distance.toFixed(2)} km`,
          distanceMeters: Math.round(distance * 1000),
          maxDistance: 0.5,
          maxDistanceMeters: 500,
          message: `You are ${distance.toFixed(0.5)}km away. Please get closer to the center.`,
          centerName: center.name,
          centerLocation: center.location
        }
      });
    }
    
    // Map status to wait time ranges
    const waitTimeMap = {
      'short': Math.floor(Math.random() * 15), // 0-15 minutes
      'moderate': Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      'long': Math.floor(Math.random() * 45) + 45, // 45-90 minutes
      'verylong': Math.floor(Math.random() * 60) + 90 // 90+ minutes
    };
    
    const waitTime = waitTimeMap[status] || 0;
    
    // Create queue report
    const queueReport = await QueueReport.create({
      centerId,
      waitTime,
      status,
      userLocation: {
        lat: userLat,
        lng: userLng
      },
      source,
      whatsappData: source === 'whatsapp' ? whatsappData : undefined,
      sessionId: req.headers['x-session-id'],
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    // Track analytics
    await Analytics.create({
      eventType: 'queue_report_submit',
      source: source,
      sessionId: req.headers['x-session-id'],
      centerId: centerId,
      location: {
        county: center.county,
        lat: userLat,
        lng: userLng
      },
      whatsappData: source === 'whatsapp' ? whatsappData : undefined,
      metadata: { status, waitTime, verified: queueReport.isVerified }
    });
    
    res.status(201).json({
      success: true,
      message: queueReport.isVerified 
        ? 'Queue report submitted and verified successfully'
        : 'Queue report submitted. Pending verification.',
      data: {
        reportId: queueReport._id,
        verified: queueReport.isVerified,
        waitTime: waitTime,
        status: status,
        distance: queueReport.distanceFromCenter,
        distanceText: `${(queueReport.distanceFromCenter / 1000).toFixed(2)} km`,
        centerName: center.name,
        centerLocation: center.location,
        submittedAt: queueReport.createdAt
      }
    });
  } catch (error) {
    console.error('Error in submitQueueReport:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get queue reports for a specific center
const getCenterQueueReports = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { hours = 2 } = req.query;
    
    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
      });
    }
    
    const reports = await QueueReport.getRecentReports(centerId, hours);
    const avgData = await QueueReport.getAverageWaitTime(centerId, hours);
    
    res.json({
      success: true,
      data: {
        reports,
        average: avgData,
        centerInfo: {
          id: center._id,
          name: center.name,
          location: center.location,
          currentQueue: center.currentQueue
        }
      }
    });
  } catch (error) {
    console.error('Error in getCenterQueueReports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all queue reports statistics
const getAllQueueStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalReports, todayReports, verifiedReports, sourceStats] = await Promise.all([
      QueueReport.countDocuments(),
      QueueReport.countDocuments({ createdAt: { $gte: today } }),
      QueueReport.countDocuments({ isVerified: true }),
      QueueReport.getStatsBySource(7)
    ]);
    
    res.json({
      success: true,
      data: {
        totalReports,
        todayReports,
        verifiedReports,
        unverifiedReports: totalReports - verifiedReports,
        verificationRate: totalReports > 0 ? ((verifiedReports / totalReports) * 100).toFixed(1) + '%' : '0%',
        sourceBreakdown: sourceStats
      }
    });
  } catch (error) {
    console.error('Error in getAllQueueStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Vote on report helpfulness
const voteOnReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { helpful } = req.body;
    
    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'helpful must be a boolean (true or false)'
      });
    }
    
    const report = await QueueReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    if (helpful) {
      report.votes.helpful += 1;
    } else {
      report.votes.notHelpful += 1;
    }
    
    await report.save();
    
    const totalVotes = report.votes.helpful + report.votes.notHelpful;
    const helpfulPercentage = totalVotes > 0 
      ? ((report.votes.helpful / totalVotes) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        votes: report.votes,
        totalVotes,
        helpfulPercentage: helpfulPercentage + '%'
      }
    });
  } catch (error) {
    console.error('Error in voteOnReport:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get queue report by ID
const getQueueReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await QueueReport.findById(reportId)
      .populate('centerId', 'name location county constituency');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getQueueReportById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  submitQueueReport,
  getCenterQueueReports,
  getAllQueueStats,
  voteOnReport,
  getQueueReportById
};