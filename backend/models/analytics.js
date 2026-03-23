const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  
  eventType: {
    type: String,
    enum: [
      'center_view',
      'center_search', 
      'queue_report_submit',
      'status_check',
      'map_view',
      'whatsapp_session_start',
      'whatsapp_session_end',
      'whatsapp_command'
    ],
    required: true,
    index: true
  },
  
  
  source: {
    type: String,
    enum: ['web', 'whatsapp', 'mobile'],
    required: true,
    index: true
  },
  

  sessionId: {
    type: String,
    index: true
  },
  
 
  whatsappData: {
    phoneNumber: String,
    messageId: String,
    command: String
  },
  
    // User location (for proximity analysis)
  location: {
    county: String,
    lat: Number,
    lng: Number
  },
  
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  },
  

  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});


analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ source: 1, timestamp: -1 });
analyticsSchema.index({ 'location.county': 1, timestamp: -1 });


analyticsSchema.statics.getDailyStats = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          source: '$source'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': -1 }
    }
  ]);
};

// Static method to get event breakdown
analyticsSchema.statics.getEventBreakdown = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          source: '$source'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get WhatsApp usage stats
analyticsSchema.statics.getWhatsAppStats = async function(days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        source: 'whatsapp',
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$whatsappData.command',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$whatsappData.phoneNumber' }
      }
    },
    {
      $project: {
        command: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        _id: 0
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get top counties
analyticsSchema.statics.getTopCounties = async function(limit = 10, days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate },
        'location.county': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$location.county',
        count: { $sum: 1 },
        sources: { $addToSet: '$source' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        county: '$_id',
        count: 1,
        sources: 1,
        _id: 0
      }
    }
  ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;