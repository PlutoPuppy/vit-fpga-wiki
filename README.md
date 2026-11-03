# ViT-FPGA Research Wiki

This repository powers the ViT-FPGA team wiki. It is a static site built from versioned content and designed for Cloudflare Pages. It replaces the original Manus application after the domain is switched.

## Edit content

Each record in `content/` is a JSON file. Edit one in GitHub and commit to `main`; Cloudflare Pages rebuilds the site and publishes the change. Once GitHub OAuth is configured, team members can also use the site's `/admin/` editor. Saving there creates a GitHub commit and triggers the same deployment.

| Content | Folder |
| --- | --- |
| Members | `content/members/` |
| Tasks | `content/tasks/` |
| Brainstorm ideas | `content/ideas/` |
| Meetings | `content/meetings/` |
| Resources | `content/resources/` |

The `archive/data/` files are the October 26 snapshot and are **not** used to build the live site. External research links are referenced, not copied. The original Manus source and backend are not part of this repository.

## Build locally

Requires Node.js. No npm dependencies are needed for the public site.

```sh
npm run check
npm run build
python3 -m http.server 8765 --directory dist
```

Open `http://127.0.0.1:8765/`. The build aggregates `content/**/*.json` into `dist/data/*.json` and copies `src/` and `assets/` into `dist/`.

## Deploy

Follow [DEPLOY.md](DEPLOY.md) for Cloudflare Pages, the editor's GitHub OAuth app, and the domain cutover. Connect this repository to Cloudflare Pages with production branch `main`, build command `npm run build`, and output directory `dist`.

## Historical snapshot

The original readable archive is still available in [dashboard.md](dashboard.md), [members.md](members.md), [ideas.md](ideas.md), [meetings.md](meetings.md), and [resources.md](resources.md).
