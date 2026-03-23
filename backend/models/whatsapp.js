const mongoose = require('mongoose');

const whatsappSessionSchema = new mongoose.Schema({
  // User identification
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  
  // Session state
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Current conversation state
  state: {
    type: String,
    enum: [
      'initial',
      'main_menu',
      'finding_centers',
      'center_selected',
      'submitting_report',
      'checking_status',
      'awaiting_location',
      'awaiting_id_number',
      'awaiting_queue_status'
    ],
    default: 'initial'
  },
  
  // Context data (what the user is currently doing)
  context: {
    selectedCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center'
    },
    userLocation: {
      lat: Number,
      lng: Number
    },
    nearbyCenters: [{
      centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center'
      },
      distance: Number
    }],
    lastCommand: String,
    tempData: mongoose.Schema.Types.Mixed
  },
  
  // Session metadata
  language: {
    type: String,
    enum: ['en', 'sw'], // English, Swahili
    default: 'en'
  },
  
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  messageCount: {
    type: Number,
    default: 0
  },
  
  // Session start and end
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  endedAt: {
    type: Date
  },
  
  // Quick stats
  actionsPerformed: {
    centersViewed: { type: Number, default: 0 },
    reportsSubmitted: { type: Number, default: 0 },
    statusChecked: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for finding active sessions
whatsappSessionSchema.index({ phoneNumber: 1, isActive: 1 });
whatsappSessionSchema.index({ lastActivity: -1 });

// Method to update session activity
whatsappSessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  this.messageCount += 1;
  return this.save();
};

// Method to change state
whatsappSessionSchema.methods.setState = function(newState, contextUpdate = {}) {
  this.state = newState;
  this.context = { ...this.context, ...contextUpdate };
  this.lastActivity = new Date();
  return this.save();
};

// Method to end session
whatsappSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.endedAt = new Date();
  return this.save();
};

// Static method to get or create session
whatsappSessionSchema.statics.getOrCreate = async function(phoneNumber) {
  // Check for active session
  let session = await this.findOne({
    phoneNumber: phoneNumber,
    isActive: true
  });
  
  // If no active session or last activity was more than 30 minutes ago, create new
  if (!session || (Date.now() - session.lastActivity.getTime() > 30 * 60 * 1000)) {
    // End old session if exists
    if (session) {
      await session.endSession();
    }
    
    // Create new session
    session = await this.create({
      phoneNumber: phoneNumber,
      isActive: true,
      state: 'initial'
    });
  }
  
  return session;
};

// Static method to cleanup old sessions
whatsappSessionSchema.statics.cleanupOldSessions = async function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await this.updateMany(
    {
      isActive: true,
      lastActivity: { $lt: oneDayAgo }
    },
    {
      $set: {
        isActive: false,
        endedAt: new Date()
      }
    }
  );
  
  return result;
};

// Static method to get session stats
whatsappSessionSchema.statics.getSessionStats = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    {
      $match: {
        startedAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        avgMessageCount: { $avg: '$messageCount' },
        totalReportsSubmitted: { $sum: '$actionsPerformed.reportsSubmitted' },
        totalStatusChecked: { $sum: '$actionsPerformed.statusChecked' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalSessions: 0,
    activeSessions: 0,
    avgMessageCount: 0,
    totalReportsSubmitted: 0,
    totalStatusChecked: 0
  };
};

const WhatsAppSession = mongoose.model('WhatsAppSession', whatsappSessionSchema);

module.exports = WhatsAppSession;