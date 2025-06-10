// API service to determine RA based on coordinates
class RAService {
    constructor() {
        this.raBoundaries = {
            "RA I - Brasília": {
                latMin: -15.85, latMax: -15.75,
                lonMin: -47.95, lonMax: -47.85
            },
            "RA II - Gama": {
                latMin: -16.05, latMax: -15.95,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA III - Taguatinga": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA IV - Brazlândia": {
                latMin: -15.75, latMax: -15.65,
                lonMin: -48.25, lonMax: -48.15
            },
            "RA V - Sobradinho": {
                latMin: -15.70, latMax: -15.60,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA VI - Planaltina": {
                latMin: -15.65, latMax: -15.55,
                lonMin: -47.70, lonMax: -47.60
            },
            "RA VII - Paranoá": {
                latMin: -15.80, latMax: -15.70,
                lonMin: -47.75, lonMax: -47.65
            },
            "RA VIII - Núcleo Bandeirante": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA IX - Ceilândia": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -48.15, lonMax: -48.05
            },
            "RA X - Guará": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -47.98, lonMax: -47.90
            },
            "RA XI - Cruzeiro": {
                latMin: -15.80, latMax: -15.75,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA XII - Samambaia": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -48.15, lonMax: -48.05
            },
            "RA XIII - Santa Maria": {
                latMin: -16.05, latMax: -15.95,
                lonMin: -48.05, lonMax: -47.95
            },
            "RA XIV - São Sebastião": {
                latMin: -15.95, latMax: -15.85,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XV - Recanto das Emas": {
                latMin: -16.00, latMax: -15.90,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA XVI - Lago Sul": {
                latMin: -15.90, latMax: -15.82,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XVII - Riacho Fundo": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -48.05, lonMax: -47.95
            },
            "RA XVIII - Lago Norte": {
                latMin: -15.75, latMax: -15.70,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XIX - Candangolândia": {
                latMin: -15.87, latMax: -15.82,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA XX - Águas Claras": {
                latMin: -15.85, latMax: -15.82,
                lonMin: -48.02, lonMax: -47.98
            }
        };
    }

    determineRA(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            throw new Error('Invalid coordinates');
        }

        for (const [ra, bounds] of Object.entries(this.raBoundaries)) {
            if (lat >= bounds.latMin && lat <= bounds.latMax &&
                lon >= bounds.lonMin && lon <= bounds.lonMax) {
                return ra;
            }
        }

        if (lat >= -15.85 && lat <= -15.75 && lon >= -47.95 && lon <= -47.85) {
            return "RA I - Brasília";
        }

        return "RA não identificada";
    }

    getAllRAs() {
        return Object.keys(this.raBoundaries);
    }
}

module.exports = RAService;