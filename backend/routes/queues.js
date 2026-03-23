const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');


router.post('/report', queueController.submitQueueReport);

router.get('/center/:centerId', queueController.getCenterQueueReports);

router.get('/stats/all', queueController.getAllQueueStats); 

router.post('/:reportId/vote', queueController.voteOnReport);

router.get('/:reportId', queueController.getQueueReportById);

module.exports = router;