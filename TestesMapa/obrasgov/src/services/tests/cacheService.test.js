const { getFromCache, setToCache } = require('../cacheService');

describe('CacheService', () => {
    test('deve armazenar e recuperar um valor do cache', () => {
        const idUnico = '123';
        const data = { geometria: 'POINT (-47.1234 -15.5678)' };

        setToCache(idUnico, data);
        const cachedData = getFromCache(idUnico);

        expect(cachedData).toEqual(data);
    });

    test('deve retornar undefined para um ID não existente no cache', () => {
        const idUnico = '456';
        const cachedData = getFromCache(idUnico);

        expect(cachedData).toBeUndefined();
    });
});