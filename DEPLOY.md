# Cloudflare deployment checklist

The website source is in this repository. Cloudflare Pages builds it when `main` changes. The public site can be tested on a `pages.dev` URL before switching `vit-fpga.wiki` away from Manus.

## Current status (November 3, 2026)

- [Cloudflare Pages preview](https://vit-fpga-wiki.pages.dev/) is live and connected to `main`; a pushed commit has triggered and completed an automatic deployment.
- The GitHub OAuth app and Cloudflare production variables for `/admin/` are configured. Sign-in and loading existing editable entries were verified.
- `vit-fpga.wiki` is a **pending** Cloudflare DNS zone. The current registrar nameservers are `ns1.globaldomaingroup.com` and `ns2.globaldomaingroup.com`. The replacement nameservers assigned by Cloudflare are `adel.ns.cloudflare.com` and `leif.ns.cloudflare.com`.
- Cloudflare imported the existing root, `www`, and `_acme-challenge` records. They are set to DNS-only while the zone is pending. The original Manus site remains live because the registrar nameservers have not changed.
- After someone with registrar access saves the nameserver change and Cloudflare activates the zone, add `vit-fpga.wiki` to the Pages project's Custom domains. Check the site and editor before retiring Manus. The GitHub OAuth app must then allow `https://vit-fpga.wiki/api/callback` as a redirect URI.

## 1. Connect the repository

In the Cloudflare dashboard, open **Workers & Pages → Create application → Pages → Connect to Git**. Connect GitHub and allow Cloudflare Workers and Pages access to `PlutoPuppy/vit-fpga-wiki`. Select this repository and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

Wait for the first deployment, then open the `*.pages.dev` URL. Confirm the dashboard and all four other sections show current content. Editing a record under `content/` and pushing it to `main` should start a new Cloudflare deployment.

## 2. Enable the on-site editor

The `/admin/` page uses Decap CMS. Its GitHub backend needs a GitHub OAuth App to let collaborators edit this repository. The OAuth app requests GitHub's `public_repo` scope. Only team members with write access to this repository can save content here.

1. In GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set Homepage URL to the new `https://<project>.pages.dev/` address and Authorization callback URL to `https://<project>.pages.dev/api/callback`.
3. In Cloudflare Pages for this project, go to **Settings → Variables and Secrets**. Add `GITHUB_OAUTH_CLIENT_ID` as a variable and `GITHUB_OAUTH_CLIENT_SECRET` as an encrypted secret. Set both for Production; add them to Preview too if you want preview editors. Redeploy after adding them.
4. Open `https://<project>.pages.dev/admin/` and sign in with a GitHub account that has collaborator write access. Edit a record, save, and verify a commit appears in this repository and that Cloudflare deploys it.

Never commit the client secret to this repository. The OAuth exchange runs in the Cloudflare Pages Functions under `functions/api/`.

## 3. Switch the custom domain

Only after the preview and editor work:

1. Add `vit-fpga.wiki` to the Cloudflare account as a zone. Review and preserve any existing DNS records, especially email records.
2. At the domain registrar, change the domain's nameservers to the pair Cloudflare assigns. Cloudflare Pages requires Cloudflare nameservers for an apex domain like `vit-fpga.wiki`.
3. In the Pages project, open **Custom domains → Set up a domain** and add `vit-fpga.wiki`.
4. Once `https://vit-fpga.wiki/` serves the new site with HTTPS, change the GitHub OAuth App's Homepage URL to `https://vit-fpga.wiki/` and callback to `https://vit-fpga.wiki/api/callback`.
5. Sign in at `https://vit-fpga.wiki/admin/`, make a small edit, and verify the GitHub commit and deployment.

If you cannot change the registrar nameservers, keep the existing domain pointed at Manus until the domain owner can make that change. The `pages.dev` site remains available meanwhile.

## Maintenance

The JSON files in `content/` are the source of truth. A direct GitHub edit or an admin edit changes those files; a successful push to `main` triggers a fresh production build. The site is static, so edits become visible after Cloudflare finishes deployment. Vote counts and task statuses are editable fields in the admin; the former Manus one-click controls are not reproduced.
