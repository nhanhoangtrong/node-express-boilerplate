const redis = require('redis');
const config = require('./config');
const { logger } = require('./utils/logger');

const dbConfig = config.get('db');
const loggerParam = {
    from: 'redis_connection',
};

redis.debug_mode = dbConfig.debug;

const redisClient = redis.createClient(dbConfig.redis);

redisClient.on('ready', () => {
    logger.info('Connection ready.', loggerParam);
});
redisClient.on('error', (err) => {
    logger.error(err.stack, loggerParam);
});

module.exports = redisClient;
