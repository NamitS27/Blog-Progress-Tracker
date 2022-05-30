const path = require('path');
const fs = require('fs');

let cacheFile = './cache.json';
let cacheFilePath = path.join(__dirname, cacheFile);

function cacheSimulator() {
    let cache = {};
    let cacheFileExists = fs.existsSync(cacheFilePath);
    if (cacheFileExists) {
        cache = JSON.parse(fs.readFileSync(cacheFilePath));
    }
    return cache;
}

function addToCache(key, value) {
    let cache = cacheSimulator();
    cache[key] = {
        value: value,
        timeToLive: Date.now() +  1000 * 60 // 1 minute
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache));
}

function getCache(key) {
    let cache = cacheSimulator();
    let value = cache[key];
    if (value && value.timeToLive > Date.now()) {
        return value.value;
    }
    return null;
}

module.exports = {
    cacheSimulator,
    addToCache,
    getCache,
};
