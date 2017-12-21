const Nconf = require('nconf');
const { existsSync } = require('fs');
const { join } = require('path');
const validators = require('./validators');
const _private = {};

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
    const envDir = options.envDir || join(__dirname, 'env');
    const customsDir = options.customsDir || process.cwd();

    nconf.file('overrides', join(defaultsDir, 'overrides.json'));

    // Load the environment and arguments config
    nconf.env().argv();

    // Load customs config file if exists
    if (existsSync(join(customsDir, 'customs.config.json'))) {
        nconf.file('customs', join(customsDir, 'customs.config.json'));
    }

    // Load the defaults config include env config
    nconf.file('defaults-env', join(envDir, `${process.env.NODE_ENV}.json`));
    nconf.file('defaults', join(defaultsDir, 'defaults.json'));

    // Validating the loaded config, if not valid then throw the errors
    Object.keys(validators).forEach((ns) => {
        if (!validators[ns](nconf.get(ns))) {
            throw new Error(
                `Validating config "${ns}" errors: ${JSON.stringify(
                    validators[ns].errors,
                    null,
                    2
                )}`
            );
        }
    });

    return nconf;
};

module.exports = exports = _private.loadNconf();
exports.loadNconf = _private.loadNconf;
