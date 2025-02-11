function extractLatLong(geometriaWkt) {
    // Verifica se a string é um POINT válido
    const match = geometriaWkt.match(/^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/);
    if (match) {
        return {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2]),
        };
    }
    return null; // Retorna null para geometrias inválidas
}

module.exports = {
    extractLatLong,
};