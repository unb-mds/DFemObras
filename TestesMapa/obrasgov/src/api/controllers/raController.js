const RAService = require('../services/raService');

class RAController {
    constructor() {
        this.raService = new RAService();
    }

    getRAByCoordinates(req, res) {
        try {
            const { latitude, longitude } = req.params;
            const ra = this.raService.determineRA(latitude, longitude);
            
            res.json({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                regiao_administrativa: ra,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(400).json({
                error: error.message,
                latitude: req.params.latitude,
                longitude: req.params.longitude
            });
        }
    }

    getAllRAs(req, res) {
        try {
            const ras = this.raService.getAllRAs();
            res.json({
                total: ras.length,
                regioes_administrativas: ras
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}

module.exports = RAController;