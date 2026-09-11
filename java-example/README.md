# Java Example

A self-contained Java 21 / Spring Boot 4.1 site with Thymeleaf pages. It has no database, no external-service dependency, and builds to one executable JAR.

It is configured to listen only on `127.0.0.1:8081` by default which is only visible internally to the VPS. The Nginx instance on the VPS proxies requests for the chosen domain name. 

## Notes on variables and placeholders

Please see the notes on variables and placeholders in the root `README.md` file.

### Port
The fallback value for `SERVER_PORT` of 8081 is defined in `java-example/src/main/resources/application.yml`. 
The port number 8081 is mentioned in the source in `java-example/src/main/resources/templates/about.html` and of course in this `README.md` file.
It is produced in the target at `java-example/target/classes/application.yml` and `java-example/target/classes/templates/about.html`.

## Local development
Install a Java 21 JDK. It is not sufficient to have a JRE installed.
Instructions vary per development environment. I use SDKMan on MacOS.

From this directory:

```bash
./mvnw spring-boot:run
```

Visit [http://127.0.0.1:8081](http://127.0.0.1:8081). The monitor-friendly endpoint is [http://127.0.0.1:8081/health](http://127.0.0.1:8081/health).

Run tests:

```bash
./mvnw test
```

Create the production JAR:

```bash
./mvnw clean package
```

The executable JAR will be exactly:

```text
target/java-example-0.0.1-SNAPSHOT.jar
```

Run the packaged application:

```bash
java -jar target/java-example-0.0.1-SNAPSHOT.jar
```

## Configuration

No `.env` file is required. The app has no secrets or service credentials. Set process environment variables only when you need to change its bind address or port:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SERVER_ADDRESS` | `127.0.0.1` | Address used by the embedded server. Keep the production value on loopback. |
| `SERVER_PORT` | `8081` | Port used by the embedded server. |

Spring forwarded-header support is enabled. Once Nginx passes the standard forwarded headers, Spring can correctly recognize the original HTTPS scheme for links and redirects. Graceful shutdown is also enabled, allowing a process manager to drain requests when it stops the JAR.

## Prerequisites

### Java 21 JDK
Install a Java 21 JDK. It is not sufficient to have a JRE installed.

```sh
sudo apt install openjdk-21-jdk-headless
```

#### Verify java version

```sh
java -version
javac -version
```

At publication time these are `openjdk version "21.0.12" 2026-07-21` and `javac 21.0.12`.

### Maven

Install Maven.

The included Maven Wrapper downloads and uses its configured Maven version, so a separate Maven installation should not be required but I found it helpful to pre-install Maven.

Maven will install for the available Java version.

```sh
sudo apt install maven
```

#### Verify Maven version

```sh
mvn -version
```
The Java major version should be 21. 
At publication time, the installed Maven version is 3.8.7. and Maven reports Java version `21.0.12`.

## VPS deployment handoff

Please also see the "Deployment" section of the root `README.md` file.

### Direct Repository Checkout

The aggregate repository can be checked out directly to `/var/www/bunnysites`.
In that case the expected paths are:
- Application folder: `/var/www/bunnysites/java-example`.
- Generated deployment output: `/var/www/bunnysites/java-example/target`.
- Jar: `/var/www/java-example/target/java-example-0.0.1-SNAPSHOT.jar`.

### Staged Repository Checkout

The repository can be checked out to any staged location and the java-example folder copied to any location from where you can run java to serve http. For example you could copy just the `java-example` folder into `/var/www` as `/var/www/java-example`. 

For the purpose of following deployment instructions, the application destination is the folder that contains `mvnw.cmd`. Instructions and pre-configured files assume this is `/var/www/bunnysites/java-example`. Adjust as needed.

The following is a deployment flow to use after the aggregate repository has been cloned into a staging checkout. Adapt the checkout path and account names to the server, but retain the folder boundary: only `java-example` is copied to `/var/www/java-example`.

### Publish steps

Run as the deploy user in the application folder

```bash
./mvnw clean package
```

#### Test the server

You should now be able to run the server in command line mode and access the http (non-ssl) version locally while the server is running.

In the application folder, as the service user run `./mvnw spring-boot:run`.
The server should print the port it is listening on which should be 8081.

While the server is running, in a separate terminal on the same VPS try the following commands.

##### curl -I
```sh
curl -I http://127.0.0.1:8081
```
Response
```
HTTP/1.1 200
Content-Type: text/html;charset=UTF-8
Content-Language: en
Date: Thu, 10 Sep 2026 22:54:49 GMT
```

##### Health endpoint
```sh
curl http://127.0.0.1:8081/health
```
Response
```
{"status":"UP","service":"java-example"}
```

##### Homepage
```sh
curl http://127.0.0.1:8081
```
Response: You should see a stream of HTML that fills a page or two.

##### Stop the server
Type `Ctrl-C` to stop the server.

## NGINX site file

The http site file (pre ssl setup) for the Java example is in the repo at `/aux/etc_nginx_sites-available/springy.bunnysite.conf`. An edited version of this file will need to be copied to `/etc/nginx/sites-available`. 

### Edit the site file
You will need to replace `BUNNYURL` or `springy.BUNNYURL` with the site domain name.

The following shell command will replace BUNNYURL in the prototype site files and copy it to the Nginx site configuration folder. 

- Run as `root` (or use `sudo` with multiple steps) 
- Run from the root of the repository. (Not from the application folder.)
- Replace `exɑmple.com` with your own URL.

```
sed 's/BUNNYURL/exɑmple.com/g' \
	aux/etc_nginx_sites-available/springy.bunnysite.conf >\
    /etc/nginx/sites-available/springy.bunnysite.conf
```

This will keep `springy` as a subdomain of your URL. Put `springy.BUNNYURL` instead of `BUNNYURL` in the command to replace the whole thing with your URL.

### Enable the site file and reload Nginx
Create a symbolic link to the site file from `/etc/nginx/sites-enabled`. For the example filename, the command is:
```sh
sudo ln -s /etc/nginx/sites-available/springy.bunnysite.conf /etc/nginx/sites-enabled/springy.bunnysite.conf
```
Then reload Nginx
```sh
sudo nginx -t && sudo systemctl reload nginx
```

#### Test Nginx HTTP version without the service

You should now be able to run the server from the command line and access the http (non-ssl) version of the site while it is running. In the application folder as the deploy user run `./mvnw spring-boot:run`.

Access your site from an external browser, making sure to keep the `http://` part of the URL. Copy the following URLs into a text editor and edit it before pasting it into your browser. That way you are sure not to accidentally trigger your browser before you have corrected the URL.

```
http://springy.exɑmple.com 
```

Append the health route. E.g.

```
http://spring.exɑmple.com/health 
```

#### Stop the server

Type `Ctrl-C` to stop the server.


## Service file

The application needs to run as a service so it can run reliably without needing someone to login to a terminal and run the process from the command line. Services are defined by service files and are run by systemctl.

The service file for the Java example is in the repo at `aux/etc_systemd_system/springy.service`. An edited version of this file will need to be copied to `/etc/systemd/service`. 

### Edit the service file

If you did not deploy to `/var/www/bunnysites/java-example`, then update the `WorkingDirectory` and `ExecStart` fields by replacing that string with the correct folder.

Run `command -v java` to get the actual command path to java. If it is not `/usr/bin/java` then replace that string in `ExecStart` with the actual path.

Replace `bunnyuser` in the `User` and `Group` fields with the actual user and group of the service runner.

The following shell command will replace `bunnyuser` and the application folder.
Copy the shell command below into an editor and edit it before pasting it into your shell.

```sh
cat aux/etc_systemd_system/springy.service |\
	sed 's/bunnyuser/deployer/g' |\
    sed 's%/var/www/bunnysites/java-example%/your/application/folder/path%g' |\
    cat > /etc/systemd/system/springy.service
```

Remove the second `sed` line to keep your application folder path as the default. 
**Important** Note that `/your/application/folder/path` does not end with a slash.

If you renamed the JAR file then you will have to update that as well in the service file.

### Start the service
Reload systemctl and enable the service

```
sudo systemctl daemon-reload
sudo systemctl enable --now springy
sudo systemctl status springy --no-pager
```

To restart the service at any time run
```
sudo systemctl restart springy
```

If `sudo systemctl status springy` did not show that the service was active and running, try once to restart the service. Otherwise verify the above steps since the last success.


### Test the service via HTTP

Once the service is running, you should be able to access it via Nginx without having to run the process in the terminal. Follow the same instructions as before to access the http website in your browser. E.g.

```
http://springy.exɑmple.com 
```

If the site is not accessible, first reload Nginx.

```
sudo nginx -t && sudo systemctl reload nginx
```

Then make sure:
- You are using http:// not https://
- That you can run `curl -I http://127.0.0.1:8081` and get a 200 response
  - If not check that `sudo systemctl status springy --no-pager` shows active and running.
- The rest of the URL is the correct URL configured in the Nginx file.
- The port configured in Nginx is the same as the port in the service file.

Once all the above are true, the site should be visible via HTTP at all the names configured under `server_name` in the Nginx file.

## SSL

Once the site is fully accessible via HTTP, you are ready to enable SSL. Refer to the root `README.md` for instructions on enabling SSL.

Replace `springy.BUNNYURL` with your actual domain.

```
sudo certbot --nginx -d springy.BUNNYURL --redirect --hsts
```


## Routes

| Path | Purpose |
| --- | --- |
| `/` | Responsive home page |
| `/about` | Deployment-oriented about page |
| `/health` | JSON `{"status":"UP","service":"java-example"}` health signal |

Unknown browser routes receive a custom, friendly 404 page. Other errors return a generic page without exception messages or stack traces.

