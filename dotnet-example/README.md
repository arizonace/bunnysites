# Dotnet Example

A self-contained ASP.NET Core Razor Pages example targeting .NET 8. It has no database, credentials, container requirement, or external service dependency.

## Notes on variables and placeholders

Please see the notes on variables and placeholders in the root `README.md` file.

### Port
The fallback port of 5271 is defined in `dotnet-example/Properties/launchSettings.json`. This value is used when no port is defined in the environment as may be the case during development.

## Local development

Install the .NET 8 SDK, then work from this folder:

```bash
dotnet restore
dotnet run
```

The development profile listens on `http://localhost:5271`. 

Open the displayed local URL, or check `http://localhost:5271/health` for JSON.

Useful validation commands:

```bash
dotnet build
dotnet test
```

There is no separate test project, so `dotnet test` is a successful discovery check. The health endpoint is also a useful runtime smoke test.

For IDEs or solution-level commands, use `solution/DotnetExample.sln`. It lives below the project root so the exact root-level publish command selects the application project rather than a solution.

## Prerequisites

Install the .NET 8 SDK

```
sudo apt install -y dotnet-runtime-8.0
```

### Verify DotNet Installation

```
dotnet --version
```
As of publication time this reports 8.0.130

```
dotnet --list-runtimes
```
As of publication time, this reports
```
Microsoft.AspNetCore.App 8.0.30 [/usr/lib/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 8.0.30 [/usr/lib/dotnet/shared/Microsoft.NETCore.App]
```

## VPS publish and handoff

Please also see the "Deployment" section of the root `README.md` file.

### Direct Repository Checkout

The aggregate repository can be checked out directly to `/var/www/bunnysites`.
In that case the expected paths are:
- Application destination: `/var/www/bunnysites/dotnet-example`.
- Generated deployment output: `/var/www/bunnysites/dotnet-example/publish`.

### Staged Repository Checkout

The repository can be checked out to any staged location and the dotnet-example folder copied to any location from where you can run dotnet to serve http. For example you could copy just the `dotnet-example` folder into `/var/www` as `/var/www/dotnet-example`. 

For the purpose of following deployment instructions, the application destination is the folder that contains `appsettings.json`. Instructions and pre-configured files assume this is `/var/www/bunnysites/dotnet-example`. Adjust as needed.

### Publish steps

Publish as the deploy user from the application destination.

```bash
dotnet publish -c Release -o publish
```


#### Test the server

You should now be able to run the server in command line mode and access the http (non-ssl) version locally while the server is running.

In the application folder, as the service user run `dotnet run`.
The server should print the port it is listening on which should be 5271.

While the server is running, in a separate terminal on the same VPS try the following commands.

##### curl -I
```sh
curl -I http://127.0.0.1:5271
```
Response
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Thu, 10 Sep 2026 23:00:36 GMT
Server: Kestrel
```

##### Health endpoint
```sh
curl http://127.0.0.1:5271/health
```
Response
```
{"status":"Healthy","checkedAtUtc":"2026-09-10T23:00:58.1907514+00:00"}
```
##### Homepage
```sh
curl http://127.0.0.1:5271
```
Response: You should see a stream of HTML that fills a page or two.

##### Stop the server
Type `Ctrl-C` to stop the server.


## NGINX site file

The http site file (pre ssl setup) for the dotnet example is in the repo at `/aux/etc_nginx_sites-available/donny.bunnysite.conf`. An edited version of this file will need to be copied to `/etc/nginx/sites-available`. 

### Edit the site file
You will need to replace `BUNNYURL` or `donny.BUNNYURL` with the site domain name.

The following shell command will replace BUNNYURL in the prototype site files and copy it to the Nginx site configuration folder. 

- Run as `root` (or use `sudo` with multiple steps) 
- Run from the root of the repository. (Not from the application folder.)
- Replace `exɑmple.com` with your own URL.

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/donny.bunnysite.conf >\
    /etc/nginx/sites-available/donny.bunnysite.conf
```

This will keep `donny` as a subdomain of your URL. Put `donny.BUNNYURL` instead of `BUNNYURL` in the command to replace the whole thing with your URL.

### Enable the site file and reload Nginx
Create a symbolic link to the site file from `/etc/nginx/sites-enabled`. For the example filename, the command is:
```sh
sudo ln -s /etc/nginx/sites-available/donny.bunnysite.conf /etc/nginx/sites-enabled/donny.bunnysite.conf
```
Then reload Nginx
```sh
sudo nginx -t && sudo systemctl reload nginx
```

#### Test Nginx HTTP version without the service

You should now be able to run the server from the command line and access the http (non-ssl) version of the site while it is running. In the application folder as the deploy user run `dotnet run`.

Access your site from an external browser, making sure to keep the `http://` part of the URL. Copy the following URL into a text editor and edit it before pasting it into your browser. That way you are sure not to accidentally trigger your browser before you have corrected the URL.

```
http://donny.exɑmple.com 
```

Append the health route. E.g.

```
http://donny.exɑmple.com/health 
```

#### Stop the server

Type `Ctrl-C` to stop the server.

## Service file

The application needs to run as a service so it can run reliably without needing someone to login to a terminal and run the process from the command line. Services are defined by service files and are run by systemctl.

The service file for the DotNet example is in the repo at `aux/etc_systemd_system/donny.service`. An edited version of this file will need to be copied to `/etc/systemd/service`. 

### Edit the service file

If you did not deploy to `/var/www/bunnysites/dotnet-example`, then update the `WorkingDirectory` and `ExecStart` fields by replacing that string with the correct folder.

Run `command -v dotnet` to get the actual command path to dotnet. If it is not `/usr/bin/dotnet` then replace that string in `ExecStart` with the actual path.

Replace `bunnyuser` in the `User` and `Group` fields with the actual user and group of the service runner.

Optionally, edit the line `SyslogIdentifier=donny` with the name you are using for the service.

The following shell command will replace `bunnyuser` and the application folder.
Copy the shell command below into an editor and edit it before pasting it into your shell.

```sh
cat aux/etc_systemd_system/donny.service |\
	sed 's/bunnyuser/deployer/g' |\
    sed 's%/var/www/bunnysites/dotnet-example%/your/application/folder/path%g' |\
    cat > /etc/systemd/system/donny.service
```

Remove the second `sed` line to keep your application folder path as the default. 
**Important** Note that `/your/application/folder/path` does not end with a slash.

### Start the service
Reload systemctl and enable the service

```
sudo systemctl daemon-reload
sudo systemctl enable --now donny
sudo systemctl status donny --no-pager
```

To restart the service at any time run
```
sudo systemctl restart donny
```

If `sudo systemctl status donny` did not show that the service was active and running, try once to restart the service. Otherwise verify the above steps since the last success.


### Test the service via HTTP

Once the service is running, you should be able to access it via Nginx without having to run the process in the terminal. Follow the same instructions as before to access the http website in your browser. E.g.

```
http://donny.exɑmple.com 
```

If the site is not accessible, first reload Nginx.

```
sudo nginx -t && sudo systemctl reload nginx
```

Then make sure:
- You are using http:// not https://
- That you can run `curl -I http://127.0.0.1:5271` and get a 200 response
  - If not check that `sudo systemctl status donny --no-pager` shows active and running.
- The rest of the URL is the correct URL configured in the Nginx file.
- The port configured in Nginx is the same as the port in the service file.

Once all the above are true, the site should be visible via HTTP at all the names configured under `server_name` in the Nginx file.

## SSL

Once the site is fully accessible via HTTP, you are ready to enable SSL. Refer to the root `README.md` for instructions on enabling SSL.

Replace `donny.BUNNYURL` with your actual domain.

```
sudo certbot --nginx -d donny.BUNNYURL --redirect --hsts
```


## Health endpoint

`GET /health` returns JSON such as:

```json
{
  "status": "Healthy",
  "checkedAtUtc": "2026-09-02T00:00:00+00:00"
}
```

## Project layout

- `Pages/` — Razor Pages and shared layout
- `Infrastructure/` — cross-cutting hosting configuration, including trusted proxy setup
- `Models/` — response and application models
- `wwwroot/` — static assets

No `.env` file is required for the example. `.env` and local settings paths are ignored so they can be used later without entering source control.
