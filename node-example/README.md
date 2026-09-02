# Node Example

A small Express application designed to live behind Nginx on an Ubuntu VPS. The Node process deliberately listens only on `127.0.0.1:3001`; Nginx is responsible for public HTTPS traffic.

## Local setup

Use the current Node LTS release (Node 20 or newer), then install dependencies:

```sh
npm install
cp .env.example .env
```

The `.env` file is local-only and is ignored by Git. Start a reload-on-change development server with:

```sh
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). To run without the development watcher:

```sh
npm start
```

Run the built-in endpoint checks with:

```sh
npm test
```

## Configuration

Configuration is read from environment variables (and, for local use, an optional `.env` file).

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Loopback HTTP port. Must be between 1 and 65535. |
| `NODE_ENV` | Node default | Set to `production` when run by systemd. |

The bind address is intentionally fixed at `127.0.0.1`, not configurable. Express trusts only the loopback proxy so Nginx-provided protocol details can be used safely when HTTPS redirects or secure cookies are added.

`GET /health` responds with JSON including `status`, `service`, a timestamp, and process uptime; it is intended for a future health check.

## Production handoff

The expected public address, after DNS, Nginx, and Certbot are configured, is `https://node-example.YOUR-DOMAIN/`.

The deploy user’s flow is:

1. Pull the aggregate `jonny-sites` repository into its staging checkout.
2. Copy only this `node-example` directory to `/var/www/node-example`.
3. In `/var/www/node-example`, install production dependencies with `npm ci --omit=dev` and provide production environment variables through systemd (or another secure environment source).
4. Start the app with `npm start`; it will listen at `127.0.0.1:3001`.
5. Configure systemd to supervise that process and Nginx to reverse-proxy the public HTTPS virtual host to `http://127.0.0.1:3001`.
6. Configure Certbot/TLS separately. Nginx remains the public endpoint; do not expose port 3001 directly.

Systemd, Nginx, firewall, DNS, and Certbot configuration are intentionally outside this folder and will be supplied in the later infrastructure handoff.
