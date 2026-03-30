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
    trim: true,
    index: true
  },
  ward: {
    type: String,
    trim: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      default: undefined
    }
  },
  address: { type: String, trim: true },
  landmark: { type: String, trim: true },
  workingHours: { type: String, default: '8:00 AM - 5:00 PM' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false, index: true },
  verifiers: [{ type: String }],
  verificationCount: { type: Number, default: 0 },
  verificationThreshold: { type: Number, default: 3 },
  
  expireAt: {
    type: Date,
    index: true 
  },
  
  submittedBy: { type: String, default: 'public' },
  type: {
    type: String,
    enum: ['county_office', 'mobile_unit', 'school', 'community_hall', 'other'],
    default: 'other'
  },
  currentQueue: {
    waitTime:    { type: Number, default: 0 },
    status:      { type: String, enum: ['FAST MOVING', 'MODERATE', 'LONG WAIT', 'VERY LONG'], default: 'FAST MOVING' },
    lastUpdated: { type: Date, default: Date.now },
    reportCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

centerSchema.index({ geoLocation: '2dsphere' });
centerSchema.index({ coordinates: '2dsphere' });
centerSchema.index({ isVerified: 1, isActive: 1 });




centerSchema.pre('save', function () {
  if (this.coordinates && this.coordinates.lat != null && this.coordinates.lng != null) {
    this.geoLocation = {
      type: 'Point',
      coordinates: [this.coordinates.lng, this.coordinates.lat]
    };
  }
  

  if (!this.isVerified) {
    
    if (!this.expireAt || this.isNew) {
      this.expireAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    }
  } else {
   
    this.expireAt = undefined;
  }
});

centerSchema.methods.calculateDistance = function (userLat, userLng) {
  const R = 6371;
  const dLat = toRad(userLat - this.coordinates.lat);
  const dLon = toRad(userLng - this.coordinates.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(this.coordinates.lat)) * Math.cos(toRad(userLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

centerSchema.methods.isWithinProximity = function (userLat, userLng, maxDistanceKm = 0.5) {
  return this.calculateDistance(userLat, userLng) <= maxDistanceKm;
};

centerSchema.methods.updateQueueFromReports = async function () {
  const QueueReport = mongoose.model('QueueReport');
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const reports = await QueueReport.find({
    centerId: this._id,
    createdAt: { $gte: twoHoursAgo },
    isVerified: true
  });
  if (reports.length === 0) return;
  const avgWaitTime = reports.reduce((sum, r) => sum + r.waitTime, 0) / reports.length;
  let status;
  if (avgWaitTime < 15)      status = 'FAST MOVING';
  else if (avgWaitTime < 45) status = 'MODERATE';
  else if (avgWaitTime < 90) status = 'LONG WAIT';
  else                       status = 'VERY LONG';
  this.currentQueue = { waitTime: Math.round(avgWaitTime), status, lastUpdated: new Date(), reportCount: reports.length };
  await this.save();
};

centerSchema.statics.findNearby = async function (lat, lng, maxDistanceKm = 10) {
  const centers = await this.find({ isActive: true, isVerified: true });
  return centers
    .map(center => ({ ...center.toObject(), distance: center.calculateDistance(lat, lng), distanceText: `${center.calculateDistance(lat, lng).toFixed(1)} km` }))
    .filter(c => c.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
};

function toRad(degrees) { return degrees * (Math.PI / 180); }

const Center = mongoose.model('Center', centerSchema);
module.exports = Center;