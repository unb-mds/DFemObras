const express = require('express');
const ObrasController = require('../controllers/obrasController');

const router = express.Router();
const obrasController = new ObrasController();

router.get('/', (req, res) => {
    obrasController.getAllObras(req, res);
});

router.get('/with-ra', (req, res) => {
    obrasController.getObrasWithRA(req, res);
});

module.exports = router;