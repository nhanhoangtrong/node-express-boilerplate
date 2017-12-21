const express = require('express');
const config = require('./config');
const { logger, LoggerStream } = require('./utils/logger');
const Boom = require('boom');

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
const serverConfig = config.get('server');

/**
 * Set app host and port, views config
 */
app.set('debug', serverConfig.debug);
app.set('host', serverConfig.host);
app.set('port', serverConfig.port);

app.engine(
    'hbs',
    hbs.express4({
        partialsDir: serverConfig.views.partialsDir,
        layoutsDir: serverConfig.views.layoutsDir,
    })
);
app.set('views', serverConfig.views.viewsDir);
app.set('view engine', serverConfig.views.engine);

/**
 * Set some global config
 */
app.set('trust proxy', serverConfig.trust_proxy);
app.set('uploadsDir', serverConfig.uploadsDir);
app.set('staticDir', serverConfig.staticDir);

/**
 * Add essential middlewares for express
 */
app.use(
    morgan(config.get('logger:format'), {
        stream: new LoggerStream('info', {
            from: 'express_morgan',
        }),
    })
);
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: serverConfig.cookies_secret,
        store: new RedisStore({
            client: redisClient,
        }),
        name: serverConfig.session_name,
    })
);
app.use(cookieParser(serverConfig.cookies_secret));
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
app.use(serverConfig.routes.static, express.static(serverConfig.staticDir));
app.use(serverConfig.routes.uploads, express.static(serverConfig.uploadsDir));

app.get('/', (req, res) => res.send('hello world!'));

/**
 * 404 - Not Found Handler
 */
app.use((req, res, next) => {
    // Boomify 404 status and send to errors handler
    next(Boom.notFound('Page not found.'));
});

/**
 * App-level Request Errors Handler
 */
app.use((err, req, res, next) => {
    // Check if an error is bomified or not,
    // if not, throw an bad implementation to next handler
    if (!err.isBoom) {
        return next(Boom.badImplementation(err));
    }

    return next(err);
});
app.use((err, req, res, next) => {
    // Check if current mode is debug, or error is come from server
    //  then logging the error stacktraces
    if (serverConfig.debug || err.isServer) {
        logger.error(err.stack, {
            from: 'app_error_handler',
        });
    }
    if (!serverConfig.debug) {
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
        res.statusCode = err.output.statusCode;
    }

    // Then render the error template and send back to client
    return res.render(
        'error',
        {
            ...err,
            stack: err.stack,
        },
        (renderErr, html) => {
            if (renderErr) {
                const mulErr = new Error('Multiple errors occurred.');
                mulErr.stack = err.stack + '\n' + renderErr.stack;
                if (!serverConfig.debug) {
                    delete mulErr.stack;
                }
                return next(mulErr);
            }

            return res.send(html);
        }
    );
});

module.exports = app;
