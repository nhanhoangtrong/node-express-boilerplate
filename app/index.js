const express = require('express');
const config = require('./config');
const { logger, LoggerStream } = require('./utils/logger');

// Middlewares
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const lusca = require('lusca');

// Authentication
const passport = require('./auth/passport');

// Redis and connections
const RedisStore = require('connect-redis')(session);
const redisClient = require('./redis');

// Views engine and helpers
const hbs = require('express-hbs');
const { registerHelpers } = require('./hbs/helpers');
registerHelpers(hbs);

const app = express();
const debug = config.get('debug');

/**
 * Set app host and port, views config
 */
app.set('debug', debug);
app.set('host', config.get('server:host'));
app.set('port', config.get('server:port'));

const viewsConfig = config.get('app:views');
app.engine('hbs', hbs.express4({
    partialsDir: viewsConfig.partialsDir,
    layoutsDir: viewsConfig.layoutsDir,
}));
app.set('views', viewsConfig.viewsDir);
app.set('view engine', viewsConfig.engine);

/**
 * Set some global config
 */
app.set('trust proxy', config.get('app:trust_proxy'));
app.set('uploadsDir', config.get('app:uploadsDir'));
app.set('staticDir', config.get('app:staticDir'));

/**
 * Add essential middlewares for express
 */
app.use(morgan(config.get('logger:format'), {
    stream: new LoggerStream(),
}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.get('app:cookies_secret'),
    store: new RedisStore({
        client: redisClient,
    }),
    name: config.get('app:session_name'),
}));
app.use(cookieParser(config.get('app:cookies_secret')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

/**
 * Authentication with Passport
 */
// Custom Passport initialize function
app.use(passport.init());
// Initialize Passport's middlewares in Express
app.use(passport.session());

/**
 * Security middlewares
 */
// Securing Cross Site Request Forgery (CSRF)
app.use(lusca.csrf());
// Enabling X-FRAME-OPTIONS headers to help prevent Clickjacking
app.use(lusca.xframe('SAMEORIGIN'));
// Enabling X-XSS-Protection headers to help prevent
// cross site scripting (XSS) attacks in older IE browsers (IE8)
app.use(lusca.xssProtection(true));
// keep clients from sniffing the MIME type
app.use(lusca.nosniff());
// disable x-powered-by header
app.disable('x-powered-by');

/**
 * Static middlewares config
 */
app.use(
    config.get('app:routes:static'),
    express.static(config.get('app:staticDir'))
);
app.use(
    config.get('app:routes:uploads'),
    express.static(config.get('app:uploadsDir'))
);

app.get('/', (req, res) => res.send('hello world!'));

/**
 * 404 - Not Found Handler
 */
app.use((req, res, next) => {
    // With 404 status, don't pass the error to logger, render the error template instead
    // Then render the error template
    return res.render('error', {
        title: 'Error 404',
        name: 'NotFound',
        statusCode: 404,
        message: 'Page Not Found.',
    }, (renderErr, html) => {
        if (renderErr) {
            return next(renderErr);
        }

        return res.status(404).send(html);
    });
});

/**
 * App-level Request Errors Handler
 */
app.use((err, req, res, next) => {
    // First pass the error to logger
    logger.error(`App Error Handler: ${err.stack}`);

    if (!debug) {
        delete err.stack;
    }

    // Check if headers has been sent or not
    if (res.headersSent) {
        // If response headers sent, pass to express default handler
        return next(err);
    }

    // If not, try to assign the statusCode
    if (res.statusCode < 400) {
        // Respect err
        res.statusCode = err.statusCode || 500;
    }

    // Then render the error template
    return res.render('error', {
        title: 'Error ' + res.statusCode,
        name: err.name,
        statusCode: res.statusCode,
        message: err.message,
        stack: err.stack,
    }, (renderErr, html) => {
        if (renderErr) {
            const mulErr = new Error('Multiple errors occurred.');
            mulErr.stack = err.stack + '\n' + renderErr.stack;
            if (!debug) {
                delete mulErr.stack;
            }
            return next(mulErr);
        }

        return res.send(html);
    });
});

module.exports = app;
