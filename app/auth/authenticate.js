const passport = require('passport');
const errors = require('./errors');

const authenticates = {
    asUser: (req, res, next) => {
        return passport.authenticate(
            'local',
            { failWithError: false },
            (err, user, info) => {
                if (err) {
                    // Pass to app-level error handler
                    return next(err);
                }

                if (!user) {
                    return next(new errors.UnauthorizedError('Access denied.'));
                }
                req.user = user;
                req.authInfo = info;
                return next(null);
            }
        )(req, res, next);
    },
};

module.exports = authenticates;
