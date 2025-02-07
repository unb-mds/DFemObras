const { extractLatLong } = require('../geometryUtils');

describe('extractLatLong', () => {
    test('deve extrair latitude e longitude de uma geometria WKT válida', () => {
        const geometriaWkt = 'POINT (-47.1234 -15.5678)';
        const result = extractLatLong(geometriaWkt);
        expect(result).toEqual({
            longitude: -47.1234,
            latitude: -15.5678,
        });
    });

    test('deve retornar null para uma geometria WKT inválida', () => {
        const geometriaWkt = 'INVALID_POINT (1 2)';
        const result = extractLatLong(geometriaWkt);
        expect(result).toBeNull();
    });

    test('deve retornar null para uma string vazia', () => {
        const geometriaWkt = '';
        const result = extractLatLong(geometriaWkt);
        expect(result).toBeNull();
    });

    test('deve retornar null para uma string sem o formato POINT', () => {
        const geometriaWkt = 'LINESTRING (1 2, 3 4)';
        const result = extractLatLong(geometriaWkt);
        expect(result).toBeNull();
    });

    test('deve retornar null para uma string com formato POINT inválido', () => {
        const geometriaWkt = 'POINT (1)'; // Faltando a latitude
        const result = extractLatLong(geometriaWkt);
        expect(result).toBeNull();
    });

    test('deve retornar null para uma string com formato POINT inválido (parênteses extras)', () => {
        const geometriaWkt = 'POINT ((1 2))'; // Parênteses extras
        const result = extractLatLong(geometriaWkt);
        expect(result).toBeNull();
    });
});