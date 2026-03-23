const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');


router.get('/', centerController.getAllCenters);

router.get('/:id', centerController.getCenterById);

router.post('/check-proximity', centerController.checkProximity);

router.get('/nearby/search', centerController.findNearestCenters); 

router.get('/county/:county', centerController.getCentersByCounty);

router.get('/meta/counties', centerController.getAllCounties);

module.exports = router;