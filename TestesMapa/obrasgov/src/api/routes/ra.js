const express = require('express');
const RAController = require('../controllers/raController');

const router = express.Router();
const raController = new RAController();

router.get('/:latitude/:longitude', (req, res) => {
    raController.getRAByCoordinates(req, res);
});

router.get('/', (req, res) => {
    raController.getAllRAs(req, res);
});

module.exports = router;