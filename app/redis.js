const redis = require('redis');
const config = require('./config');
const { logger } = require('./utils/logger');

const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    logger.error('Redis: Errors occurred');
    logger.error(`Redis: ${err.stack}`);
});
if (config.get('redis:database') !== undefined) {
    redisClient.select(config.get('redis:database'), (err, reply) => {
        if (err) {
            logger.error('Redis: Select Database Error');
            logger.error(`Redis: ${err.stack}`);
        } else {
            logger.info('Redis: Database selected reply: ' + reply);
        }
    });
}

module.exports = redisClient;
