const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  county: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  constituency: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  ward: {
    type: String,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  address: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  workingHours: {
    type: String,
    default: '8:00 AM - 5:00 PM'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  currentQueue: {
    waitTime: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['FAST MOVING', 'MODERATE', 'LONG WAIT', 'VERY LONG'],
      default: 'FAST MOVING'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    reportCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Geospatial index for proximity searches
centerSchema.index({ coordinates: '2dsphere' });

// Method to calculate distance from user location
centerSchema.methods.calculateDistance = function(userLat, userLng) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(userLat - this.coordinates.lat);
  const dLon = toRad(userLng - this.coordinates.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(this.coordinates.lat)) * Math.cos(toRad(userLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // in kilometers
};

// Method to check if user is within proximity (default 500m)
centerSchema.methods.isWithinProximity = function(userLat, userLng, maxDistanceKm = 0.5) {
  const distance = this.calculateDistance(userLat, userLng);
  return distance <= maxDistanceKm;
};

// Method to update queue status from reports
centerSchema.methods.updateQueueFromReports = async function() {
  const QueueReport = mongoose.model('QueueReport');
  
  // Get reports from last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  const reports = await QueueReport.find({
    centerId: this._id,
    createdAt: { $gte: twoHoursAgo },
    isVerified: true
  });
  
  if (reports.length === 0) return;
  
  // Calculate average wait time
  const avgWaitTime = reports.reduce((sum, r) => sum + r.waitTime, 0) / reports.length;
  
  // Determine status
  let status;
  if (avgWaitTime < 15) status = 'FAST MOVING';
  else if (avgWaitTime < 45) status = 'MODERATE';
  else if (avgWaitTime < 90) status = 'LONG WAIT';
  else status = 'VERY LONG';
  
  this.currentQueue = {
    waitTime: Math.round(avgWaitTime),
    status: status,
    lastUpdated: new Date(),
    reportCount: reports.length
  };
  
  await this.save();
};

// Static method to find nearby centers
centerSchema.statics.findNearby = async function(lat, lng, maxDistanceKm = 10) {
  const centers = await this.find({ isActive: true });
  
  const centersWithDistance = centers.map(center => {
    const distance = center.calculateDistance(lat, lng);
    return {
      ...center.toObject(),
      distance: distance,
      distanceText: `${distance.toFixed(1)} km`
    };
  });
  
  return centersWithDistance
    .filter(c => c.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
};

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

const Center = mongoose.model('Center', centerSchema);

module.exports = Center;