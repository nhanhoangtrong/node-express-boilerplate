exports.UnauthorizedError = class extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'Unauthorized';
        this.statusCode = 401;
    }
};

exports.DeserializeError = class extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'DeserializeUser';
        this.statusCode = 400;
    }
};
