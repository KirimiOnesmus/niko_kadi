const express = require('express');
const router = express.Router();
const topicsController = require('../controllers/topicsController');
 
// Get weekly civic topics
router.get('/weekly', topicsController.getWeeklyTopics);
 
// Force refresh topics (admin)
router.post('/refresh', topicsController.refreshTopics);
 
// Get cache status
router.get('/cache-status', topicsController.getCacheStatus);
 
module.exports = router;