# Dotnet Example

A self-contained ASP.NET Core Razor Pages example targeting .NET 8. It has no database, credentials, container requirement, or external service dependency.

## Local development

Install the .NET 8 SDK, then work from this folder:

```bash
dotnet restore
dotnet run
```

The development profile listens on `http://localhost:5271`. Open the displayed local URL, or check `http://localhost:5271/health` for JSON.

Useful validation commands:

```bash
dotnet build
dotnet test
```

There is no separate test project yet, so `dotnet test` is a successful discovery check. The health endpoint is also a useful runtime smoke test.

For IDEs or solution-level commands, use `solution/DotnetExample.sln`. It lives below the project root so the exact root-level publish command selects the application project rather than a solution.

## VPS publish and handoff

The aggregate repository is staged by the deploy user. The expected paths are:

- Source checkout folder: `/path/to/jonny-sites/dotnet-example`
- Application destination: `/var/www/dotnet-example`
- Generated deployment output: `/var/www/dotnet-example/publish`

After copying this source folder to `/var/www/dotnet-example`, publish from that destination:

```bash
dotnet publish -c Release -o publish
```

`publish/` is generated deployment output. It is ignored by the folder-local `.gitignore` and must not be committed.

The published application DLL is `DotnetExample.dll`. The future service should run it with:

```bash
ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS=http://127.0.0.1:5001 dotnet DotnetExample.dll
```

Use a systemd unit for process supervision, automatic restart, and these production environment variables. Nginx should proxy to `http://127.0.0.1:5001`, send `X-Forwarded-For` and `X-Forwarded-Proto`, and own TLS termination. Certbot/Nginx configuration is intentionally outside this app folder.

The app trusts `X-Forwarded-For` and `X-Forwarded-Proto` only when the direct peer is `IPAddress.Loopback` (`127.0.0.1`), with one forwarded hop. Its forwarded-header middleware runs before HTTPS redirection and before the reserved location for future authentication middleware.

For production, replace the documentation-only domain placeholder `https://dotnet-example.YOUR-DOMAIN/` in any Nginx, Certbot, and systemd handoff material. Do not place certificates, credentials, or connection strings in this repository. If SQL Server is added later, load its connection string from deployment-managed configuration or a secret store.

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
