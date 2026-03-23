const express = require('express');
const router = express.Router();
const iebcController = require('../controllers/iebcController');

router.post('/verify', iebcController.verifyVoter);

router.get('/api-status', iebcController.getIEBCApiStatus);

router.get('/stats', iebcController.getVerificationStats); 

module.exports = router;