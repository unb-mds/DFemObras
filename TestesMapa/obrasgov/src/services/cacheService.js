const cache = new Map();

function getFromCache(idUnico) {
    return cache.get(idUnico);
}

function setToCache(idUnico, data) {
    cache.set(idUnico, data);
}

module.exports = {
    getFromCache,
    setToCache
};