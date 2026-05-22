const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const config = require('config');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');

const { logger } = require('./server/log.js');

function getRuntimeNumber(name, fallback) {
    const value = process.env[name];

    if (typeof value === 'undefined' || value === '') {
        return fallback;
    }

    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function getRuntimeEnvironment() {
    return process.env.NODE_ENV || config.get('environment');
}

morgan.token('username', function getUsername (req) {
    return req.lighterpackusername
});


morgan.token('requestid', function getUsername (req) {
    return req.uuid
});

const app = express();
app.enable('trust proxy');

app.use(function (req, res, next) {
    req.uuid = uuid.v4();
    next();
});

app.use(morgan(function (tokens, req, res) {
    return JSON.stringify({
        'timestamp': tokens.date(req, res, 'iso'),
        'requestid': tokens.requestid(req, res),
        "remote-addr": tokens['remote-addr'](req, res),
        'method': tokens.method(req, res),
        'http-version': tokens['http-version'](req, res),
        'user-agent': tokens['user-agent'](req, res),
        'url': tokens.url(req, res),
        'status': tokens.status(req, res),
        'referrer': tokens.referrer(req, res),
        'content-length': tokens.res(req, res, 'content-length'),
        'response-time': tokens['response-time'](req, res),
        'username': tokens.username(req, res),
    })
}, { stream: logger.stream.write }));

const oneDay = 86400000;

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb',
}));

app.use(express.static(`${__dirname}/public/`, { maxAge: oneDay }));
const endpoints = require('./server/endpoints.js');
const moderationEndpoints = require('./server/moderation-endpoints.js');
const views = require('./server/views.js');

app.use('/', endpoints);
app.use('/', moderationEndpoints);
app.use('/', views);

logger.info("Starting up Lighterpack...");

const appPort = getRuntimeNumber('PORT', config.get('port'));
const devServerPort = getRuntimeNumber('DEV_SERVER_PORT', config.get('devServerPort'));
const runtimeEnvironment = getRuntimeEnvironment();

let webpackConfig;

if (runtimeEnvironment === 'production') {
    webpackConfig = require('./webpack.config');
} else {
    webpackConfig = require('./webpack.development.config');
}

const webpackCompiler = webpack(webpackConfig);

// Default port is 3000; we can have multiple bindings
config.get('bindings').map(
    (bind) => {
        app.listen(appPort, bind);
        logger.info(`Listening on [${bind}]:${appPort}`);
    },
);

if (runtimeEnvironment !== 'production') {
    const devServerOptions = {
        ...(webpackConfig.devServer || {}),
        port: devServerPort,
        proxy: {
            '*': {
                target: `http://127.0.0.1:${appPort}`,
                secure: false,
                changeOrigin: true,
            },
        },
    };
    const devServer = new WebpackDevServer(devServerOptions, webpackCompiler);

    devServer.startCallback((err) => {
        if (err) {
            return logger.info(err);
        }

        logger.info(`Webpack dev server listening on port ${devServerPort}`);
    });
}
