# Java Example

A self-contained Java 21 / Spring Boot 4.1 site with Thymeleaf pages. It has no database, no external-service dependency, and builds to one executable JAR.

It is configured to listen only on `127.0.0.1:8081` by default. That is deliberate: in production, Nginx should be the public HTTPS edge and proxy requests to this application.

## Prerequisite

Install a Java 21 JDK. The included Maven Wrapper downloads and uses its configured Maven version, so a separate Maven installation is not required.

Check Java:

```bash
java -version
```

## Local development

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

## VPS deployment handoff

The following is a deployment flow to use after the aggregate repository has been cloned into a staging checkout. Adapt the checkout path and account names to the server, but retain the folder boundary: only `java-example` is copied to `/var/www/java-example`.

```bash
cd /srv/staging/jonny-sites
git pull --ff-only

sudo rsync -a --delete --exclude='.env' \
  repos/jonny-sites/java-example/ /var/www/java-example/

cd /var/www/java-example
./mvnw clean package
```

The future systemd unit should run this JAR:

```text
/var/www/java-example/target/java-example-0.0.1-SNAPSHOT.jar
```

Set its environment to `SERVER_ADDRESS=127.0.0.1` and normally leave `SERVER_PORT=8081`. Nginx can later reverse proxy to `http://127.0.0.1:8081`; it should own public HTTP/HTTPS, forwarded headers, and certificate renewal. Certbot/SSL, Nginx, systemd, firewall, DNS, and any future SQL Server setup are intentionally outside this project and are not changed here.

When those pieces are ready, replace this documentation-only placeholder with the real production host: [https://java-example.YOUR-DOMAIN/](https://java-example.YOUR-DOMAIN/).

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Responsive home page |
| `/about` | Deployment-oriented about page |
| `/health` | JSON `{"status":"UP","service":"java-example"}` health signal |

Unknown browser routes receive a custom, friendly 404 page. Other errors return a generic page without exception messages or stack traces.
