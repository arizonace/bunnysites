# Hugo example site

A small, self-contained static Hugo site. It includes a responsive home page, About page, post section, and custom 404 page. It requires only Hugo to build and has no database, server process, container, or runtime dependency.

## Important domain placeholder

The configured production URL is `https://hugo-example.YOUR-DOMAIN/`. Replace `YOUR-DOMAIN` in `hugo.toml` with the real domain before production deployment. The trailing slash is intentional.

## Local prerequisites

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

## Production build

Build the static production files with:

```sh
hugo --minify --baseURL "https://hugo-example.YOUR-DOMAIN/"
```

Replace `YOUR-DOMAIN` with the final domain. The command generates the deployable site in `public/`.

`public/` is generated at deployment time and is intentionally **not committed**. Hugo's generated resources (`resources/_gen/`) and lock file (`.hugo_build.lock`) are also ignored by the folder-local `.gitignore`.

## VPS deployment paths

The aggregate repository is first pulled into a pre-deployment staging checkout on the Ubuntu 24 VPS. From there, copy this application folder:

| Purpose | Path |
| --- | --- |
| Staged source folder | `<staging-checkout>/hugo-example` |
| Live application folder | `/var/www/hugo-example` |
| Future Nginx document root | `/var/www/hugo-example/public` |

Run the production build from the live application folder (or before copying, if your deployment process copies generated output):

```sh
cd /var/www/hugo-example
hugo --minify --baseURL "https://hugo-example.YOUR-DOMAIN/"
```

Nginx and Certbot are already managed separately. When the server block is added later, configure its `root` to `/var/www/hugo-example/public` and replace the placeholder domain in both Nginx and the Hugo build command.

## Editing content

- Pages: `content/about.md`
- Journal index: `content/posts/_index.md`
- Posts: add Markdown files under `content/posts/`
- Templates: `layouts/`
- Styling: `assets/css/site.css`

Each post uses front matter for its title, date, description, and summary. Run the production build after changing content to refresh `public/`.
