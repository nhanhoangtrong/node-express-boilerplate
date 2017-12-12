const _private = {};

_private.helpers = {};
_private.registerHelpers = function (hbs) {
    for (let k in this.helpers) {
        hbs.registerHelper(k, this.helpers[k]);
    }
};

module.exports = _private;
