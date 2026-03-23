const Analytics = require('../models/analytics');
// const axios = require('axios'); // Uncomment when integrating real IEBC API

// Verify voter registration status via IEBC API
const verifyVoter = async (req, res) => {
  try {
    const { idNumber, source = 'web', whatsappData } = req.body;
    
    // Validate ID number
    if (!idNumber) {
      return res.status(400).json({
        success: false,
        error: 'ID number is required'
      });
    }
    
    // Clean and validate ID number
    const cleanedId = idNumber.trim();
    
    if (cleanedId.length < 6 || cleanedId.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'ID number must be between 6 and 10 digits'
      });
    }
    
    if (!/^\d+$/.test(cleanedId)) {
      return res.status(400).json({
        success: false,
        error: 'ID number must contain only numbers'
      });
    }
    
    // Track analytics
    await Analytics.create({
      eventType: 'status_check',
      source: source,
      sessionId: req.headers['x-session-id'],
      whatsappData: source === 'whatsapp' ? whatsappData : undefined,
      metadata: { idNumberProvided: true, idLength: cleanedId.length }
    });
    
    // ============================================================
    // INTEGRATE WITH IEBC API HERE
    // ============================================================
    // TODO: Replace this section with actual IEBC API integration
    
    /* EXAMPLE INTEGRATION (uncomment when ready):
    
    try {
      const response = await axios.post(
        `${process.env.IEBC_API_URL}/verify`,
        {
          idNumber: cleanedId,
          apiKey: process.env.IEBC_API_KEY
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.IEBC_API_KEY}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (response.data.registered) {
        return res.json({
          success: true,
          registered: true,
          source: 'IEBC Database',
          data: {
            name: response.data.name,
            idNumber: response.data.idNumber,
            county: response.data.county,
            constituency: response.data.constituency,
            ward: response.data.ward,
            pollingStation: response.data.pollingStation,
            registeredDate: response.data.registeredDate
          },
          message: 'Voter registration found'
        });
      } else {
        return res.json({
          success: true,
          registered: false,
          message: 'No registration found for this ID number',
          suggestion: 'Please register at your nearest IEBC office'
        });
      }
      
    } catch (apiError) {
      console.error('IEBC API Error:', apiError);
      
      // Check if it's a timeout
      if (apiError.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          error: 'IEBC API timeout. Please try again.',
          code: 'TIMEOUT'
        });
      }
      
      // Check if it's a network error
      if (apiError.code === 'ENOTFOUND' || apiError.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          error: 'IEBC API is currently unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE'
        });
      }
      
      // Other API errors
      return res.status(502).json({
        success: false,
        error: 'Error communicating with IEBC API',
        code: 'API_ERROR'
      });
    }
    
    */
    
    // ============================================================
    // MOCK RESPONSE (Remove when IEBC API is integrated)
    // ============================================================
    
    const mockRegistered = Math.random() > 0.3; // 70% chance of being registered
    
    if (mockRegistered) {
      const mockCounties = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 
        'Machakos', 'Meru', 'Kakamega', 'Uasin Gishu', 'Kilifi'
      ];
      
      const mockNames = [
        'JOHN KAMAU NJOROGE',
        'JANE WANJIRU MWANGI',
        'PETER OCHIENG OTIENO',
        'MARY ACHIENG WAMBUI',
        'JAMES MWANGI KIMANI',
        'GRACE NJERI GITAU',
        'DAVID KIPCHOGE ROTICH',
        'SARAH WAIRIMU KARANJA',
        'MICHAEL ONYANGO OUMA',
        'ESTHER WANJIKU NDUNGU'
      ];
      
      const mockConstituencies = {
        'Nairobi': ['Starehe', 'Westlands', 'Dagoretti North', 'Langata', 'Embakasi East'],
        'Mombasa': ['Mvita', 'Nyali', 'Kisauni', 'Likoni'],
        'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West'],
        'Nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Gilgil'],
        'Kiambu': ['Juja', 'Thika Town', 'Ruiru', 'Kiambu']
      };
      
      const selectedCounty = mockCounties[Math.floor(Math.random() * mockCounties.length)];
      const constituencies = mockConstituencies[selectedCounty] || ['Central'];
      
      return res.json({
        success: true,
        registered: true,
        source: 'IEBC Database (Mock)',
        data: {
          name: mockNames[Math.floor(Math.random() * mockNames.length)],
          idNumber: cleanedId,
          county: selectedCounty,
          constituency: constituencies[Math.floor(Math.random() * constituencies.length)],
          ward: 'WARD ' + (Math.floor(Math.random() * 5) + 1),
          pollingStation: ['CITY PRIMARY SCHOOL', 'CHIEF\'S CAMP', 'COMMUNITY HALL', 'PUBLIC LIBRARY'][Math.floor(Math.random() * 4)],
          registeredDate: new Date(2026, 2, Math.floor(Math.random() * 15) + 1).toISOString()
        },
        message: 'Voter registration found',
        note: 'This is mock data. Replace with real IEBC API integration.'
      });
    } else {
      return res.json({
        success: true,
        registered: false,
        message: 'No registration found for this ID number',
        suggestion: 'Please register at your nearest IEBC office',
        helpline: '020 2877000',
        note: 'This is mock data. Replace with real IEBC API integration.'
      });
    }
    
  } catch (error) {
    console.error('Error in verifyVoter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get IEBC API status
const getIEBCApiStatus = async (req, res) => {
  try {
    // TODO: Ping IEBC API to check status
    
    /* EXAMPLE (uncomment when ready):
    
    try {
      const response = await axios.get(
        `${process.env.IEBC_API_URL}/health`,
        {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${process.env.IEBC_API_KEY}`
          }
        }
      );
      
      return res.json({
        success: true,
        iebcApiStatus: 'online',
        responseTime: response.headers['x-response-time'] || 'N/A',
        lastChecked: new Date().toISOString()
      });
      
    } catch (error) {
      return res.json({
        success: true,
        iebcApiStatus: 'offline',
        error: error.message,
        lastChecked: new Date().toISOString()
      });
    }
    
    */
    
    // MOCK RESPONSE
    res.json({
      success: true,
      iebcApiStatus: 'pending_integration',
      message: 'IEBC API integration not yet configured',
      mockDataActive: true,
      lastChecked: new Date().toISOString(),
      instructions: 'Set IEBC_API_URL and IEBC_API_KEY in environment variables'
    });
    
  } catch (error) {
    console.error('Error in getIEBCApiStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      iebcApiStatus: 'error'
    });
  }
};

// Get verification statistics
const getVerificationStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await Analytics.aggregate([
      {
        $match: {
          eventType: 'status_check',
          timestamp: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: '$source',
          totalChecks: { $sum: 1 }
        }
      }
    ]);
    
    const totalChecks = stats.reduce((sum, stat) => sum + stat.totalChecks, 0);
    
    res.json({
      success: true,
      period: `Last ${days} days`,
      data: {
        totalChecks,
        bySource: stats,
        avgPerDay: Math.round(totalChecks / days)
      }
    });
  } catch (error) {
    console.error('Error in getVerificationStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  verifyVoter,
  getIEBCApiStatus,
  getVerificationStats
};