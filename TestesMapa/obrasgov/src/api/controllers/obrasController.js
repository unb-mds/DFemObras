const fs = require('fs');
const path = require('path');
const RAService = require('../services/raService');

class ObrasController {
    constructor() {
        this.raService = new RAService();
        this.obrasPath = path.join(__dirname, '../../obrasgov/obras_com_lat_long.json');
    }

    getAllObras(req, res) {
        try {
            if (!fs.existsSync(this.obrasPath)) {
                return res.status(404).json({
                    error: 'Arquivo de obras não encontrado',
                    path: this.obrasPath
                });
            }

            const obras = JSON.parse(fs.readFileSync(this.obrasPath, 'utf8'));
            res.json({
                total: obras.length,
                obras: obras
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    getObrasWithRA(req, res) {
        try {
            if (!fs.existsSync(this.obrasPath)) {
                return res.status(404).json({
                    error: 'Arquivo de obras não encontrado'
                });
            }

            const obras = JSON.parse(fs.readFileSync(this.obrasPath, 'utf8'));
            
            const obrasComRA = obras.map((obra, index) => {
                let ra = 'RA não identificada';
                
                if (obra.latitude && obra.longitude) {
                    try {
                        ra = this.raService.determineRA(obra.latitude, obra.longitude);
                    } catch (error) {
                        console.warn(`Erro ao determinar RA para obra ${index}:`, error.message);
                    }
                }
                
                return {
                    ...obra,
                    regiao_administrativa: ra,
                    indice: index
                };
            });

            res.json({
                total: obrasComRA.length,
                obras: obrasComRA
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}

module.exports = ObrasController;