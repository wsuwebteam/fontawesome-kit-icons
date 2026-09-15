# Font Awesome Kit Icons

A public reference page showing every icon in the shared WSU Font Awesome Pro kit,
so anyone at WSU can see what is available and copy the tag they need without
having the kit login.

**Live page:** https://wsuwebteam.github.io/fontawesome-kit-icons/

## How it works

A GitHub Actions workflow runs once a day. It installs the Font Awesome kit
package from Font Awesome's private npm registry, extracts the list of icons in
the kit, and writes that list to `site/icons.json`. It then publishes `site/` to
GitHub Pages.

The page itself loads the WSU kit script from the Font Awesome CDN and renders
each icon as an ordinary `<i>` tag, exactly the way a WSU site would.

Nobody needs credentials to view the page. The Font Awesome package token only
exists inside the GitHub Actions build.

## What is deliberately not in this repo

`icons.json` contains icon **names**, style prefixes, search aliases, and unicode
codepoints. It does **not** contain SVG path data.

This is on purpose. This repo and the published page are public. Writing the path
data into `icons.json` would place the full artwork for licensed Font Awesome Pro
icons in a public repository as downloadable SVGs, which our Pro license does not
permit. The icons on the page are drawn by the domain-locked kit script instead.

Please do not add path data back. If the page needs to work without the CDN, talk
to whoever owns the Font Awesome account first.

## Files

| Path | What it does |
| --- | --- |
| `site/index.html` | The whole page. Plain HTML, CSS, and JavaScript. No build step. Edit directly. |
| `scripts/build-icons.mjs` | Reads the kit package, writes `site/icons.json`. |
| `.github/workflows/pages.yml` | Daily build and deploy to GitHub Pages. |
| `.npmrc` | Points the `@awesome.me` scope at Font Awesome's registry. Contains no secret. |

`site/icons.json` is generated during every build and is intentionally gitignored.
Do not commit it.

## Configuration

Set in **Settings → Secrets and variables → Actions**:

| Name | Tab | Value |
| --- | --- | --- |
| `FONTAWESOME_PACKAGE_TOKEN` | Secrets | The Package Token from the Font Awesome account |
| `FA_KIT_CODE` | Variables | The kit code, the string in the kit's script URL |

The Font Awesome kit also needs two settings, both in the kit's page on
fontawesome.com:

- **Enable Package Installation** turned on, or the npm package will not exist.
- `wsuwebteam.github.io` on the **Allowed Domains** list, or the icons will not
  render on the published page.

## Adding an icon to the page

You do not edit this repo. Add the icon to the kit on fontawesome.com and it
appears here after the next daily build.

To publish it immediately, go to the **Actions** tab, select **Publish icon
page**, and click **Run workflow**.

## Changing how the page looks

Edit `site/index.html`. It is a single self-contained file with the styles and
script inline. Push to `main` and the workflow redeploys it.

The page follows WSU brand colors (crimson `#A60F2D`, gray `#4D4D4D`, Montserrat)
and is built to WCAG 2.1 AA. If you change colors, check contrast before you
push. The relevant thresholds are 4.5:1 for body text and 3:1 for control borders
and meaningful icons. The current ratios are documented in a comment at the top of
the file.

## Troubleshooting

**Page shows the icon names but every icon is blank.**
The host is missing from the kit's Allowed Domains list. The page detects this and
tells you the exact hostname to add.

**Build fails with a 404 on `@awesome.me/kit-...`.**
Either the package token is wrong or expired, or Enable Package Installation is
off in the kit settings. Check the kit setting first, it is the more common cause.

**Build fails with "FA_KIT_CODE is not set".**
The value was added on the Secrets tab instead of the Variables tab.

**Build says the kit package returned no icons.**
The package installed but is empty, which again points at Enable Package
Installation.

**Deploy step fails with a permissions error.**
Under **Settings → Pages**, the source is still set to "Deploy from a branch". It
needs to be "GitHub Actions".

**The page says the icon list failed to load.**
The daily build broke. Check the most recent run under the Actions tab.
