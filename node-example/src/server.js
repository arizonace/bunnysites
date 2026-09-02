require('dotenv/config');

const app = require('./app');

const port = Number.parseInt(process.env.PORT || '3001', 10);
const host = '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = app.listen(port, host, () => {
  console.log(`node-example listening at http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server.`);
  server.close((error) => {
    if (error) {
      console.error('Error while shutting down:', error);
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
