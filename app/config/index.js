const Nconf = require('nconf');
const { existsSync } = require('fs');
const { join } = require('path');
const Ajv = require('ajv');
const _private = {};

// Validating config schema using Ajv
_private.validator = new Ajv().compile(require('./configSchema.json'));

/**
 * Load Nconf config
 *
 * @param {object} options includes:
 * - defaultsDir: defaults config directory
 * - customsDir: customs config directory
 */
_private.loadNconf = function(options = {}) {
    const nconf = new Nconf.Provider();
    const defaultsDir = options.defaultsDir || __dirname;
    const customsDir = options.customsDir || process.cwd();

    nconf.file('overrides', join(defaultsDir, 'overrides.json'));

    // Load the environment and arguments config
    nconf.env().argv();

    // Load customs config file if exists
    if (existsSync(join(customsDir, 'customs.config.json'))) {
        nconf.file('customs', join(customsDir, 'customs.config.json'));
    }

    // Load the defaults config include env config
    nconf.file(
        'defaults-env',
        join(
            defaultsDir,
            `config.${
                process.env.NODE_ENV !== 'production' ? 'dev' : 'prod'
            }.json`
        )
    );
    nconf.file('defaults', join(defaultsDir, 'defaults.config.json'));

    // Validating the loaded config, if not valid then throw the errors
    if (!this.validator(nconf.get())) {
        throw new Error(
            `Validating config errors: ${JSON.stringify(
                this.validator.errors,
                null,
                2
            )}`
        );
    }

    return nconf;
};

exports.loadNconf = _private.loadNconf;
module.exports = _private.loadNconf();
