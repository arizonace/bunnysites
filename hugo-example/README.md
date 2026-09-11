# Hugo example site

A small, self-contained static Hugo site. It includes a responsive home page, About page, post section, and custom 404 page. It requires only Hugo to build and has no database, server process, container, or runtime dependency.

## Notes on variables and placeholders

Please see the notes on variables and placeholders in the root `README.md` file.

### Important domain placeholder

The configured production URL is `https://huggy.BUNNYURL/`. Replace `BUNNYURL` or `huggy.BUNNYURL` in `hugo.toml` with the real domain before production deployment. The trailing slash is intentional.

### Port
The default development port for `hugo server` is 1313. Nothing in this site configures any changes to the default.

## Local prerequisites

### Install Hugo

Use Homebrew (recommended if available) or download via web.

### Hugo Installation URL
- [Hugo](https://gohugo.io/installation/) extended edition (recent version recommended)

Check your installation with:

```sh
hugo version
```

## Local preview

From this folder, start Hugo's development server:

```sh
hugo server --buildDrafts
```

Open the local URL printed by Hugo (normally `http://localhost:1313/`). Hugo watches source files and refreshes the site as you edit.

## Prerequisites 

Install Hugo on VPS

```
sudo apt install hugo
```

## Production build

As the deploy user in the application folder
Build the static production files with:

```sh
hugo --minify --baseURL "https://huggy.BUNNYURL/"
```

Replace `BUNNYURL` or `huggy.BUNNYURL` with the final domain. The command generates the deployable site in `public/`.

`public/` is generated at deployment time and is intentionally **not committed**. Hugo's generated resources (`resources/_gen/`) and lock file (`.hugo_build.lock`) are also ignored by the folder-local `.gitignore`.

## VPS deployment paths

Please also see the "Deployment" section of the root `README.md` file.

### Direct Repository Checkout

The aggregate repository can be checked out directly to `/var/www/bunnysites`.
In that case the live application folder is `/var/www/bunnysites/hugo-example`.
The Nginx document root is `/var/www/bunnysites/hugo-example/public`.

### Staged Repository Checkout

The repository can be checked out to any staged location and the hugo-example folder copied to any location from where you can serve http. For example you could copy just the `hugo-example` folder into `/var/www` as `/var/www/hugo-example`. 

For the purpose of following deployment instructions, the live application folder is the folder that contains hugo.toml. Instructions and pre-configured files assume this is `/var/www/bunnysites/hugo-example`. Adjust as needed.

### Publish steps

#### Build the site

As the deploy user, from the live application folder

```sh
hugo --minify --baseURL "http://huggy.BUNNYURL/"
```

#### Test the server

You should now be able to run the server in command line mode and access the http (non-ssl) version locally while the server is running.

In the application folder, as the service user run `hugo server`.
The server should print the port it is listening on which should be 1313.

While the server is running, in a separate terminal on the same VPS try the following commands.

##### curl -I
```sh
curl -I http://127.0.0.1:1313
```
Response
```
HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 4465
Content-Type: text/html; charset=utf-8
Last-Modified: Thu, 10 Sep 2026 23:26:34 GMT
Date: Thu, 10 Sep 2026 23:26:49 GMT
```

##### Homepage
```sh
curl http://127.0.0.1:1313
```
Response: You should see a stream of HTML that fills a page or two.

##### Stop the server
Type `Ctrl-C` to stop the server.


## NGINX site file

The http site file (pre ssl setup) for the hugo example is in the repo at `/aux/etc_nginx_sites-available/huggy.bunnysite.conf`. An edited version of this file will need to be copied to `/etc/nginx/sites-available`. 

### Edit the site file
You will need to replace `BUNNYURL` or `huggy.BUNNYURL` with the site domain name. You will also need to replace the live public folder `/var/www/bunnysites/hugo-example/public` in the file  with the actual live public folder if you deployed the repo to somewhere other than `/var/www/bunnysites`.

The following shell command will replace BUNNYURL in the prototype site files and copy it to the Nginx site configuration folder.

- Run as `root` (or use `sudo` with multiple steps) 
- Run from the root of the repository. (Not from the application folder.)
- Replace `exɑmple.com` with your own URL.

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/huggy.bunnysite.conf >\
    /etc/nginx/sites-available/huggy.bunnysite.conf
```

If you also need to replace the folder, use this command instead.

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/huggy.bunnysite.conf |\
    sed 's%/var/www/bunnysites/hugo-example/%/your/path/hugo-example/%g' >\
    $ROOT/etc/nginx/sites-available/huggy.bunnysite.conf.txt
```

Replace `/your/path/hugo-example/` with the actual path to your application folder.
**IMPORTANT** Make sure the path you enter between the percent signs both begins and ends with slashes.
E.g. if you copied `hugo-example` directly into `/var/www` and your application folder is `/var/www/hugo-example`, run:

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/huggy.bunnysite.conf |\
    sed 's%/var/www/bunnysites/hugo-example/%/var/www/hugo-example/%g' >\
    $ROOT/etc/nginx/sites-available/huggy.bunnysite.conf.txt
```

These commands will keep `huggy` as a subdomain of your URL. Put `huggy.BUNNYURL` instead of `BUNNYURL` in the command to replace the whole thing with your URL.

### Enable the site file and reload Nginx
Create a symbolic link to the site file from `/etc/nginx/sites-enabled`. For the example filename, the command is:
```sh
sudo ln -s /etc/nginx/sites-available/huggy.bunnysite.conf /etc/nginx/sites-enabled/huggy.bunnysite.conf
```
Then reload Nginx
```sh
sudo nginx -t && sudo systemctl reload nginx
```

### Test Nginx HTTP version

You should now be able to access the http (non-ssl) version of the site externally.

Access your http URL from an external browser. Copy the following URL into a text editor and edit it before pasting it into your browser. That way you are sure not to accidentally trigger your browser before you have corrected the URL.

```
http://huggy.exɑmple.com 
```

You should see the site just as well as you could see it locally.


## Service

Hugo builds a static site that is served directly by Nginx. No seperate service is required. Nginx only needs to know where to find the files.

## SSL

Once the site is fully accessible via HTTP, you are ready to enable SSL. Refer to the root `README.md` for instructions on enabling SSL.

Before enabling SSL, rebuild the site using an HTTPS base URL.
Replace `huggy.BUNNYURL` with your actual domain.

```sh
hugo --minify --baseURL "https://huggy.BUNNYURL/"
```

To enable SSL on a static site served by Nginx with Certbot, run the  following:
```
sudo certbot certonly --webroot -w /path/to/index/folder -d URL [-d www.URL [-d more.URLs]] --cert-name SITENAME
```

To enable SSL on the default installation of huggy in `/var/www/bunnysites/hugo-example/` when your domain is `exɑmple.com`
```
sudo certbot certonly --webroot -w /var/www/bunnysites/hugo-example/public -d huggy.exɑmple.com --cert-name huggy.exɑmple.com
```



## Editing content

- Pages: `content/about.md`
- Journal index: `content/posts/_index.md`
- Posts: add Markdown files under `content/posts/`
- Templates: `layouts/`
- Styling: `assets/css/site.css`

Each post uses front matter for its title, date, description, and summary. Run the production build after changing content to refresh `public/`.
