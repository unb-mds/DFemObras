function extractLatLong(geometriaWkt) {
    const match = geometriaWkt.match(/^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/);
    if (match) {
        return {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2]),
        };
    }
    return null;
}

module.exports = {
    extractLatLong,
};