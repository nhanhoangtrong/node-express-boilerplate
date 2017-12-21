const http = require('http');
const app = require('./app');
const { logger } = require('./app/utils/logger');
const meta = {
    from: 'http_server',
};

const server = http.createServer(app);
const port = app.get('port');
const host = app.get('host');

server.listen(app.get('port'), app.get('host'));

server.on('listening', () => {
    logger.info(`Listening on http://${host}:${port}/`, meta);
});
server.on('error', (err) => {
    logger.error(err.stack, meta);
    server.close();
    process.exit(1);
});
