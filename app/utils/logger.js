const { createLogger, transports, format } = require('winston');
const config = require('../config');
const { combine, timestamp, label, prettyPrint, simple, splat } = format;

/**
 * Generate formatters base on config
 * - 'dev' for development purpose
 * - 'combined' for others
 * @param {string} config
 */
function generateFormatters(config) {
    if (config === 'combined')
        return combine(
            timestamp(),
            label({
                label: {
                    name: config.get('name'),
                    pid: process.pid,
                },
            }),
            prettyPrint()
        );
    return combine(splat(), simple());
}

/**
 * Generate transports base on config
 * @param {Array} arr
 */
function generateTransports(arr = []) {
    return arr.map(({ type, level, filename }) => {
        if (type === 'file') {
            return new transports.File({
                level,
                filename: filename.replace(
                    '[timestamp]',
                    Date.now().toString()
                ),
            });
        } else {
            return new transports.Console({
                level,
            });
        }
    });
}

const logger = createLogger({
    format: generateFormatters(config.get('logger:format')),
    level: config.get('logger:level'),
    transports: generateTransports(config.get('logger:transports')),
});

exports.logger = logger;
exports.LoggerStream = class InfoLoggerStream {
    write(data) {
        logger.info(data.replace('\n', ''));
    }
};
