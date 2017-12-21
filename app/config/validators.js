const Ajv = require('ajv');
const validators = {};

const _schemas = {
    server: require('./schemas/server.schema.json'),
    logger: require('./schemas/logger.schema.json'),
    db: require('./schemas/db.schema.json'),
};

// Validating config schema using Ajv
validators.compileValidators = function compileValidators(schemas = _schemas) {
    const ajv = new Ajv /* add options */();

    // Compile the validator with ajv instance
    return {
        server: ajv.compile(schemas.server),
        logger: ajv.compile(schemas.logger),
        db: ajv.compile(schemas.db),
    };
};

module.exports = exports = validators.compileValidators();
exports.compileValidators = validators.compileValidators;
