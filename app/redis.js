const redis = require('redis');
const config = require('./config');
const { logger } = require('./utils/logger');

const redisConfig = config.get('redis');

redis.debug_mode = config.get('debug');

const redisClient = redis.createClient(redisConfig);

redisClient.on('ready', () => {
    logger.info('Redis: Connection ready.');
});
redisClient.on('error', (err) => {
    logger.error('Redis: Errors occurred');
    logger.error(`Redis: ${err.stack}`);
});

module.exports = redisClient;
