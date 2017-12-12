const passport = require('passport');
const strategies = require('./strategies');

passport.init = () => {
    passport.serializeUser(strategies.serializeUser);

    passport.deserializeUser(strategies.deserializeUser);

    // Configure passport strategies
    passport.use(strategies.localStrategy);

    return passport.initialize();
};

module.exports = passport;
