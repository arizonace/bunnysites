# Node Example

A small Express application designed to live behind Nginx on an Ubuntu VPS. The Node process deliberately listens only on `127.0.0.1:3001`; Nginx is responsible for public HTTPS traffic.

## Notes on variables and placeholders
Please see the notes on variables and placeholders in the root `README.md` file.

### Port
The fallback port of 3001 is defined in `node-example/src/server.js`. This is the value used when no `PORT` is defined in the environment as is the case in development.
A port defined in `.env` will override the fallback.
The port defined in the service file when run by systemd will override both `.env` and the code fallback.

When changing the port, remember to also change it in the following place:
- `node-example/src/app.js`.

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

## Prerequisites

As of publication time, Ubuntu 24 on a Hostinger VPS comes with Node 22. To upgrade to 24, run the following commands as root in a temporary install directory

```
curl -fsSL https://deb.nodesource.com/setup_24.x -o nodesource-setup-24.sh
bash nodesource-setup-24.sh
apt install -y nodejs essential-build
```

## VPS publish and handoff

Please also see the "Deployment" section of the root `README.md` file.

### Direct Repository Checkout

The aggregate repository can be checked out directly to `/var/www/bunnysites`.
In that case the expected paths are:
- Application folder: `/var/www/bunnysites/node-example`.

### Staged Repository Checkout

The repository can be checked out to any staged location and the node-example folder copied to any location from where you can run `npm` to serve http. For example you could copy just the `node-example` folder into `/var/www` as `/var/www/node-example`. 

For the purpose of following deployment instructions, the application folder is the folder that contains `package.json`. Instructions and pre-configured files assume this is `/var/www/bunnysites/node-example`. Adjust as needed.

### Publish steps

#### Install production dependencies.
Run the following commands as the deploy user in the application folder.
```
npm ci --omit=dev
```

#### Test the server

You should now be able to run the server in command line mode and access the http (non-ssl) version locally while the server is running.

In the application folder, as the service user run `npm start`.
The server should print the port it is listening on which should be 3001.

While the server is running, in a separate terminal on the same VPS try the following commands.

##### curl -I
```sh
curl -I http://127.0.0.1:3001
```
Response
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1847
ETag: W/"737-PgDpgXBt1keaz2TP0ZqxOfLD1r8"
Date: Thu, 10 Sep 2026 22:16:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

##### Health endpoint
```sh
curl http://127.0.0.1:3001/health
```
Response
```
{"status":"ok","service":"node-example","timestamp":"2026-09-10T22:56:05.793Z","uptimeSeconds":523462}
```
##### Homepage
```sh
curl http://127.0.0.1:3001
```
Response: You should see a stream of HTML that fills a page or two.

##### Stop the server
Type `Ctrl-C` to stop the server.


## NGINX site file
The http site file (pre-ssl setup) for the node example is in the repo at `aux/etc_nginx_sites-available/noddy.bunnysite.conf`. An edited version of this file will need to be copied to `/etc/nginx/sites-available`. 

### Edit the site file
You will need to replace `BUNNYURL` or `noddy.BUNNYURL` with the site domain name.

The following shell command will replace BUNNYURL in the prototype site files and copy it to the Nginx site configuration folder. 

- Run as `root` (or use `sudo` with multiple steps) 
- Run from the root of the repository. (Not from the application folder.)
- Replace `exɑmple.com` with your own URL.

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/noddy.bunnysite.conf >\
    /etc/nginx/sites-available/noddy.bunnysite.conf
```

This will keep `noddy` as a subdomain of your URL. Put `noddy.BUNNYURL` instead of `BUNNYURL` in the command to replace the whole thing with your URL.


### Enable the site file and reload Nginx
Create a symbolic link to the site file from `/etc/nginx/sites-enabled`. For the example filename, the command is:
```sh
sudo ln -s /etc/nginx/sites-available/noddy.bunnysite.conf /etc/nginx/sites-enabled/noddy.bunnysite.conf
```
Then reload Nginx
```sh
sudo nginx -t && sudo systemctl reload nginx
```

#### Test Nginx Public HTTP version without the service

You should now be able to run the server from the command line and access the http (non-ssl) version of the site while it is running. In the application folder as the deploy user run `npm start`.

Access your site from an external browser, making sure to keep the `http://` part of the URL. Copy the following URL into a text editor and edit it before pasting it into your browser. That way you are sure not to accidentally trigger your browser before you have corrected the URL.

```
http://noddy.exɑmple.com 
```

Append the health route. E.g.

```
http://noddy.exɑmple.com/health 
```

#### Stop the server

Type `Ctrl-C` to stop the server.

## Service file

The application needs to run as a service so it can run reliably without needing someone to login to a terminal and run the process from the command line. Services are defined by service files and are run by systemctl.

The service file for the Node example is in the repo at `aux/etc_systemd_system/noddy.service`. An edited version of this file will need to be copied to `/etc/systemd/service`. 

### Edit the service file

If you did not deploy to `/var/www/bunnysites/node-example`, then update the `WorkingDirectory` field by replacing that string with the correct folder.

Run `command -v npm` to get the actual command path to npm. If it is not `/usr/bin/npm` then replace that string in `ExecStart` with the actual path.

Replace `bunnyuser` in the `User` and `Group` fields with the actual user and group of the service runner.

The following shell command will replace `bunnyuser` and the application folder.
Copy the shell command below into an editor and edit it before pasting it into your shell.

```sh
cat aux/etc_systemd_system/noddy.service |\
	sed 's/bunnyuser/deployer/g' |\
    sed 's%/var/www/bunnysites/node-example%/your/application/folder/path%g' |\
    cat > /etc/systemd/system/noddy.service
```

Remove the second `sed` line to keep your application folder path as the default. 
**Important** Note that `/your/application/folder/path` does not end with a slash.


### Start the service
Reload systemctl and enable the service

```
sudo systemctl daemon-reload
sudo systemctl enable --now noddy
sudo systemctl status noddy --no-pager
```

To restart the service at any time run
```
sudo systemctl restart noddy
```

If `sudo systemctl status noddy` did not show that the service was active and running, try once to restart the service. Otherwise verify the above steps since the last success.


### Test the service via HTTP

Once the service is running, you should be able to access it via Nginx without having to run the process in the terminal. Follow the same instructions as before to access the http website in your browser. E.g.

```
http://noddy.exɑmple.com 
```

If the site is not accessible, first reload Nginx.

```
sudo nginx -t && sudo systemctl reload nginx
```

Then make sure:
- You are using http:// not https://
- That you can run `curl -I http://127.0.0.1:3001` and get a 200 response
  - If not check that `sudo systemctl status noddy --no-pager` shows active and running.
- The rest of the URL is the correct URL configured in the Nginx file.
- The port configured in Nginx is the same as the port in the service file.

Once all the above are true, the site should be visible via HTTP at all the names configured under `server_name` in the Nginx file.

## SSL

Once the site is fully accessible via HTTP, you are ready to enable SSL. Refer to the root `README.md` for instructions on enabling SSL.

Replace `noddy.BUNNYURL` with your actual domain.

```
sudo certbot --nginx -d noddy.BUNNYURL --redirect --hsts
```

