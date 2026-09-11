# Bunny Sites

Getting started with multi-domain hosting on a Hostinger VPS with Nginx.
Uses Nginx, certbot, Hugo, NodeJs, DotNet, and Java. (Python coming soon)

## The Sites

This is a starter project with four complete websites in one repository that can be deployed together to one VPS.

| Stack            | Sub-Folder     | Demo URL               | Nginx file             | Service file    |
| ---------------- | -------------- | ---------------------- | ---------------------- | --------------- |
| Hugo             | hugo-example   | huggy.azonelayer.com   | huggy.bunnysite.conf   |                 |
| NodeJS/Express   | node-example   | noddy.azonelayer.com   | noddy.bunnysite.conf   | noddy.service   |
| DotNet/Razor     | dotnet-example | donny.azonelayer.com   | donny.bunnysite.conf   | donny.service   |
| Java/Spring Boot | java-example   | springy.azonelayer.com | springy.bunnysite.conf | springy.service |

The sites serve as examples and starter points for building and maintaining websites on different popular stacks. They don't all have to be setup and activated. Or built on.

## Variables and Placeholders

### Port
The ports used for each of the sites in production is determined by the service files. The Nginx proxy for each site is configured to match the port used by its service. The sites are pre-configured with ports that you should not need to change. If the ports appear in other files for a site besides the service file and Nginx file, it will be called out in the README\.md for that site.

Each service serves an internal port which is only visible internally on the VPS. Nginx proxies the traffic for each domain name from the web to the internal port for the matching service. Nginx handles the SSL.

The ports configured for development in each site are noted in the settings and instructions in the README\.md for each site.

### User
The configured service user in the service files is `bunnyuser`. You can create a Linux user named `bunnyuser` or you can replace this with your deploy user. This user will:
- own the folder in which the repository and applications live
- run the services.
Of course each service can have its own service user and you can apply more limited permissions to the application folders. Each service user must be able to operate in its application folder enough to run the service.

### URL
`BUNNYURL` is configured in all the Nginx files. It may also be mentioned in other files for some sites as stated in the `README.md` for each site.

Please replace `BUNNYURL` with a domain for which you control the DNS. It shouldn't need to be said but please use a domain other than `azonelayer.com` on your own sites. You may also wish to discard the sub-domains for the sites you wish to publish. For example, if you own `exɑmple.com`, you can publish the Hugo site as `huggy.exɑmple.com`, or just `exɑmple.com` or any other subdomain such as `nothuggy.exɑmple.com`. 

I didn't add `www` subdomains but you can optionally include it in alternative domain names such as `www.huggy.exɑmple.com`, `www.exɑmple.com`, or `www.nothuggy.exɑmple.com`. If you control the DNS you can do any of those things that you want.
You can list multiple domains and subdomains as the server name for each site. E.g.

```
    server_name nothuggy.exɑmple.corn www.nothuggy.exɑmple.corn iɑmɑhuggysite.corn www.iɑmɑhuggysite.corn ;
```

Please don't simply cut and paste these example configuration names into your server files. They won't work.


## Deployment
For simplicity, the entire repository can be cloned into `/var/www/bunnysites` and the sites served directly from each sub-folder. E.g. `/var/www/bunnysites/hugo-example`, `/var/www/bunnysites/node-example` etc.

Temporarily allow writes to `/var/www`

As the deploy usr in `/var/www`, temporarily allow writes to the `/var/www` folder, clone `bunnysites` into `/var/www/bunnysites`, re-restrict write permissions to `/var/www`.

```
sudo chmod 777 /var/www
git clone https://github.com/arizonace/bunnysites.git
sudo chmod 755 /var/www
```
In this case the deploy user will own `/var/www/bunnysites`.

_Or_ checkout somewhere else and the individual subfolders can be copied directly to `/var/www` e.g. `/var/www/hugo-example`, `/var/www/node-example` etc.

In any case, ensure that the sub-folder for each site ends up in a location from which its service can be run to serve a website. If the service user does not own the subfolder then it needs at least enough permission in that folder to fully operate the service.

### Nginx
Each website needs a site configuration file under `/etc/nginx/sites-available`. A prototype file for each site is provided in the repository under `/aux/etc_nginx_sites-available`. Replace `BUNNYURL` in each of these files and if necessary update the live application folder for the Hugo site.

#### Copy Site Config Command

The following shell commands will replace BUNNYURL in the prototype site files and copy them to the Nginx site configuration folder. Replace `exɑmple.com` with your own URL.

Run as `root` (or use `sudo`) from the root of the repository. 

For Donny, the DotNet site
```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/donny.bunnysite.conf >\
    /etc/nginx/sites-available/donny.bunnysite.conf
```

#### Enable Nginx site

Nginx serves the files it finds under `/etc/nginx/sites-enabled`. By convention, to enable a site, one places a symbolic link in the sites-enabled folder to the sites-available folder. For a site configured in `bunny.conf`:

```
sudo ln -s /etc/nginx/sites-available/bunny.conf /etc/nginx/sites-enabled/bunny.conf
```

After the link is in place, reload the Nginx service.

```
sudo nginx -t && sudo systemctl reload nginx
```

Note that `nginx -t` verifies that Nginx is properly configured. If the verification fails, the `&&` causes the reload step to be aborted.


### Services
Most of the websites need to run as a service because they are each served by a running process. Hugo builds a static website which is served by Nginx itself.

| Example          | Sub-Folder     | Service File    | Process command | Port |
| ---------------- | -------------- | --------------- | --------------- | ---- |
| Hugo             | hugo-example   |                 | /usr/sbin/nginx |      |
| NodeJS/npm       | node-example   | noddy.service   | /usr/bin/npm    | 3001 |
| DotNet           | dotnet-example | donny.service   | /usr/bin/dotnet | 5271 |
| Java/Spring Boot | java-example   | springy.service | /usr/bin/java   | 8081 |

Run `command -v <executable>` to verify the command path of each of the above executables you use, e.g. `npm`, `dotnet` etc. 

The service for each site is configured in a service file that lives in `/etc/systemd/service`. E.g. `/etc/systemd/service/bunny.service`. A prototype service file for each site is provided in the repository under `/aux/etc_systemd_system`. Replace `bunnyuser` if necessary in each of these files with your actual service user. Also update any other configuration changes you made such as the port or application location.

Once the service files are in place, you can enable it in systemctl.
E.g. For a service named `bunny` defined in `bunny.service`:

```
sudo systemctl daemon-reload
sudo systemctl enable --now bunny
sudo systemctl status bunny --no-pager
```

To restart the service after configuration changes:

```
sudo systemctl restart bunny
```

## SSL

Once each site is running as a service, being proxied by Nginx, and accessible via web over HTTP, it is time to enable SSL. We will use certbot to create the SSL certificates with the Let's Encrypt root.

