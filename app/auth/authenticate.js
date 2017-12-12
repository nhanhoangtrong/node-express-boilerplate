const passport = require('passport');
const Boom = require('boom');

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
                    return next(Boom.unauthorized('Access denied.'));
                }
                req.user = user;
                req.authInfo = info;
                return next(null);
            }
        )(req, res, next);
    },
};

module.exports = authenticates;
