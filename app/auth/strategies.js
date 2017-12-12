const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const errors = require('./errors');

const tester = (function () {
    const obj = Object.create(null);
    obj.id = 0;
    obj.salt = bcrypt.genSaltSync();
    obj.email = 'tester@email.com';
    obj.password = bcrypt.hashSync('password', obj.salt);
    return obj;
})();

const strategies = {
    localStrategy: new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, (req, email, candidatePwd, done) => {
        try {
            const user = tester;
            if (bcrypt.compareSync(candidatePwd, user.password)) {
                return done(null, user);
            }

            return done(null, false);
        } catch (err) {
            return done(err);
        }
    }),
    serializeUser(user, done) {
        done(null, user.id);
    },
    deserializeUser(userId, done) {
        if (userId === tester.id) {
            done(null, tester);
        } else {
            done(new errors.DeserializeError('User not found.'));
        }
    },
};

module.exports = strategies;
