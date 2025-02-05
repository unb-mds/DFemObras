const cacheService = require('../services/cacheService');
const apiService = require('../services/apiService');
const geometryUtils = require('../utils/geometryUtils');

async function processObra(obra) {
    try {
        let geometriaData = cacheService.getFromCache(obra.idUnico);

        if (!geometriaData) {
            geometriaData = await apiService.fetchGeometria(obra.idUnico);
            if (geometriaData && geometriaData[0]) {
                cacheService.setToCache(obra.idUnico, geometriaData);
            }
        }

        if (geometriaData && geometriaData[0] && geometriaData[0].geometriaWkt) {
            const coords = geometryUtils.extractLatLong(geometriaData[0].geometriaWkt);
            if (coords) {
                obra.latitude = coords.latitude;
                obra.longitude = coords.longitude;
            }
        }
        return obra;
    } catch (error) {
        console.error(`Erro ao processar geometria para ID ${obra.idUnico}:`, error.message);
        obra.latitude = null;
        obra.longitude = null;
        return obra;
    }
}

module.exports = {
    processObra
};