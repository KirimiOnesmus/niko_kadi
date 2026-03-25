const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');


router.get('/',                    centerController.getAllCenters);
router.get('/nearby/search',       centerController.findNearestCenters);
router.get('/meta/counties',       centerController.getAllCounties);
router.get('/county/:county',      centerController.getCentersByCounty);
router.get('/:id',                 centerController.getCenterById);
router.post('/check-proximity',    centerController.checkProximity);

// adding center
router.post('/', centerController.addCenter);

module.exports = router;