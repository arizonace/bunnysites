const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

test.before(() => new Promise((resolve, reject) => {
  server = app.listen(0, '127.0.0.1', (error) => {
    if (error) return reject(error);
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    resolve();
  });
}));

test.after(() => {
  if (!server?.listening) return;
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint returns an operational JSON response', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, 'ok');
  assert.equal(payload.service, 'node-example');
  assert.deepEqual(Object.keys(payload).sort(), ['service', 'status', 'timestamp', 'uptimeSeconds']);
});

test('home and about pages render', async () => {
  for (const pathname of ['/', '/about']) {
    const response = await fetch(`${baseUrl}${pathname}`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /node.*example/i);
  }
});

test('unknown route returns the custom 404 page', async () => {
  const response = await fetch(`${baseUrl}/missing`);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /That page isn’t here/);
});
