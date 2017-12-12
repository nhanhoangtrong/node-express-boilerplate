const { createLogger, transports, format } = require('winston');
const config = require('../config');
const { combine, timestamp, label, prettyPrint, printf, splat } = format;

const loggerTransports = config.get('logger:transports').map(({ type, level, filename }) => {
    if (type === 'file') {
        return new transports.File({
            level,
            filename: filename.replace('[timestamp]', Date.now().toString()),
        });
    } else {
        return new transports.Console({
            level,
        });
    }
});

const loggerFormats = {
    combined: combine(
        timestamp(),
        label({
            label: {
                name: config.get('name'),
                pid: process.pid
            },
        }),
        prettyPrint()
    ),
    dev: combine(
        splat(),
        printf((info) => `[${info.level}] - ${info.message}`)
    )
};

const logger = createLogger({
    format: loggerFormats[config.get('logger:format')],
    level: config.get('logger:level'),
    transports: loggerTransports,
});


exports.logger = logger;
exports.LoggerStream = class LoggerStream {
    write(data) {
        logger.info(data.replace('\n', ''));
    }
};
