const mongoose = require('mongoose');

const queueReportSchema = new mongoose.Schema({
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true,
    index: true
  },
  
  waitTime: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['short', 'moderate', 'long', 'verylong'],
    required: true
  },
  
  // User location (for proximity verification)
  userLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  

  distanceFromCenter: {
    type: Number, 
    required: true
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  
  // Source tracking (web or WhatsApp bot)
  source: {
    type: String,
    enum: ['web', 'whatsapp', 'mobile'],
    default: 'web',
    required: true
  },
  
  // WhatsApp specific data (if source is whatsapp)
  whatsappData: {
    phoneNumber: {
      type: String,
      sparse: true
    },
    messageId: {
      type: String,
      sparse: true
    }
  },

  sessionId: {
    type: String,
    index: true
  },
  
  // IP address (for web reports)
  ipAddress: {
    type: String
  },
 
  votes: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    }
  },
  

  reportedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for finding recent reports
queueReportSchema.index({ createdAt: -1 });
queueReportSchema.index({ centerId: 1, createdAt: -1 });
queueReportSchema.index({ isVerified: 1, createdAt: -1 });

// Pre-save hook to verify proximity and calculate distance
queueReportSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Center = mongoose.model('Center');
      const center = await Center.findById(this.centerId);
      
      if (!center) {
        throw new Error('Center not found');
      }
      
      // Calculate distance from center
      const distance = calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        center.coordinates.lat,
        center.coordinates.lng
      );
      
      this.distanceFromCenter = Math.round(distance * 1000);
      
      // Auto-verify if within 500m (0.5km)
      if (distance <= 0.5) {
        this.isVerified = true;
        this.verifiedAt = new Date();
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save hook to update center's queue status
queueReportSchema.post('save', async function(doc) {
  if (doc.isVerified) {
    const Center = mongoose.model('Center');
    const center = await Center.findById(doc.centerId);
    if (center) {
      await center.updateQueueFromReports();
    }
  }
});

// Static method to get recent verified reports for a center
queueReportSchema.statics.getRecentReports = async function(centerId, hours = 2) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return await this.find({
    centerId: centerId,
    createdAt: { $gte: cutoffTime },
    isVerified: true
  })
  .sort({ createdAt: -1 })
  .limit(20);
};

// Static method to get average wait time
queueReportSchema.statics.getAverageWaitTime = async function(centerId, hours = 2) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        centerId: mongoose.Types.ObjectId(centerId),
        createdAt: { $gte: cutoffTime },
        isVerified: true
      }
    },
    {
      $group: {
        _id: null,
        averageWaitTime: { $avg: '$waitTime' },
        totalReports: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageWaitTime: 0, totalReports: 0 };
};

// Static method to get stats by source
queueReportSchema.statics.getStatsBySource = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$source',
        totalReports: { $sum: 1 },
        verifiedReports: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

const QueueReport = mongoose.model('QueueReport', queueReportSchema);

module.exports = QueueReport;