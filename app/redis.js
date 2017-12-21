const redis = require('redis');
const config = require('./config');
const { logger } = require('./utils/logger');

const dbConfig = config.get('db');
const meta = {
    from: 'redis_connection',
};
redis.debug_mode = dbConfig.debug;

const redisClient = redis.createClient(dbConfig.redis);
redisClient.on('ready', () => {
    logger.info('Connection ready.', meta);
});
redisClient.on('error', (err) => {
    logger.error(err.stack, meta);
});

module.exports = redisClient;
