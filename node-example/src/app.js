const express = require('express');
const path = require('node:path');

const app = express();

// Nginx will connect from localhost. Trusting only loopback preserves the
// correct protocol information without trusting arbitrary public clients.
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

app.get('/', (req, res) => {
  res.type('html').send(renderPage({
    title: 'Node Example',
    activePage: 'home',
    content: `
      <section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">Express · Nginx-ready</p>
        <h1 id="hero-title">A small Node app with a solid deployment shape.</h1>
        <p class="lede">This example runs privately on the server loopback interface and is designed for Nginx to expose over HTTPS.</p>
        <div class="actions">
          <a class="button" href="/about">About this app</a>
          <a class="text-link" href="/health">View health status <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <section class="features" aria-label="Highlights">
        <article><h2>Private by default</h2><p>The Node process listens on <code>127.0.0.1:3001</code>, leaving public TLS and routing to Nginx.</p></article>
        <article><h2>Proxy-aware</h2><p>Express trusts only loopback proxy headers, ready for secure redirects and cookies later.</p></article>
        <article><h2>Easy to check</h2><p>A compact JSON health endpoint provides a clear future target for monitoring.</p></article>
      </section>`
  }));
});

app.get('/about', (req, res) => {
  res.type('html').send(renderPage({
    title: 'About · Node Example',
    activePage: 'about',
    content: `
      <section class="page-intro" aria-labelledby="about-title">
        <p class="eyebrow">About</p>
        <h1 id="about-title">A deliberately uncomplicated starting point.</h1>
        <p class="lede">It has two server-rendered pages, thoughtful error handling, and no database or outside service to provision.</p>
      </section>
      <section class="details" aria-label="Application details">
        <div><h2>Run locally</h2><p>Install dependencies and run <code>npm run dev</code>. Then visit <code>http://127.0.0.1:3001</code>.</p></div>
        <div><h2>Deploy later</h2><p>Copy this directory into <code>/var/www/node-example</code>, run it with systemd, and put Nginx in front of it.</p></div>
      </section>`
  }));
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'node-example',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.use((req, res) => {
  res.status(404).type('html').send(renderPage({
    title: 'Page not found · Node Example',
    content: `
      <section class="not-found" aria-labelledby="not-found-title">
        <p class="eyebrow">404</p>
        <h1 id="not-found-title">That page isn’t here.</h1>
        <p class="lede">The address may be outdated, or it may never have existed.</p>
        <a class="button" href="/">Back home</a>
      </section>`
  }));
});

app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  if (res.headersSent) return next(error);

  res.status(500).type('html').send(renderPage({
    title: 'Something went wrong · Node Example',
    content: `
      <section class="not-found" aria-labelledby="error-title">
        <p class="eyebrow">500</p>
        <h1 id="error-title">Something went wrong.</h1>
        <p class="lede">Please try again in a moment.</p>
        <a class="button" href="/">Back home</a>
      </section>`
  }));
});

function renderPage({ title, activePage, content }) {
  const nav = (href, label, page) => `<a href="${href}"${activePage === page ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A small Express application ready for a loopback Nginx deployment.">
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Node Example home">node<span>•</span>example</a>
      <nav aria-label="Main navigation">${nav('/', 'Home', 'home')}${nav('/about', 'About', 'about')}</nav>
    </header>
    <main>${content}</main>
    <footer><span>Node Example</span><span>Built with Express</span></footer>
  </body>
</html>`;
}

module.exports = app;
