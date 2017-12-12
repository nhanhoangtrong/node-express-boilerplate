const http = require('http');
const app = require('./app');
const { logger } = require('./app/utils/logger');

const server = http.createServer(app);
const port = app.get('port');
const host = app.get('host');

server.listen(app.get('port'), app.get('host'));

server.on('listening', () => {
    logger.info(`Server: Listening on http://${host}:${port}/`);
});

server.on('error', (err) => {
    logger.error('Server: Errors occurred');
    logger.error(`Server: ${err.stack}`);
    server.close();
    process.exit(1);
});
