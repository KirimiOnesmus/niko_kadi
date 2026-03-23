const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get overall statistics
router.get('/overview', statsController.getOverviewStats);

router.get('/counties/leaderboard', statsController.getCountyLeaderboard);

router.get('/trends/weekly', statsController.getWeeklyTrends); 

router.get('/live/count', statsController.getLiveCount);

router.get('/analytics/platform-comparison', statsController.getPlatformComparison);

router.get('/analytics/whatsapp', statsController.getWhatsAppAnalytics);

router.get('/analytics/events', statsController.getEventBreakdown);

router.get('/centers/top', statsController.getTopCenters);

module.exports = router;