# ViT-FPGA Research Wiki

This repository powers the ViT-FPGA team wiki. It is a static site built from versioned content and designed for Cloudflare Pages. It replaces the original Manus application after the domain is switched.

Cloudflare Pages preview: [vit-fpga-wiki.pages.dev](https://vit-fpga-wiki.pages.dev/).

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

## Team workspace

- [Dated member updates](updates/README.md)
- [Biweekly professor meetings](meetings.md)
- [ECE496 files and data](files/README.md)
- [Implementation progress](progress-2026-11-03.md)

The live editor also provides dated Updates and ECE496 Files collections.

## Implementation workspace

The Gantt tab transcribes the supplied September 2026–April 2027 plan. Current tasks include acceptance criteria; archived tasks remain versioned. Meetings are separated by type (professor/internal). Browser note drafts stay on that browser and can be downloaded; publish shared notes through the meeting’s editor link. Internal meetings have no assumed cadence. Stephanie’s integration update links the measured report; Tiffany’s update records planned responsibilities rather than unverified completion.

## Member changelog

Member Progress & Updates is one navigation page. Choose a member to see current tasks, compose a dated update with evidence URLs, and browse that member’s past entries. The old `#/updates` route opens the combined page.

Drafts save in this browser per member. On the hosted wiki, Sign in & publish update uses the same GitHub OAuth setup as the team editor. The signed-in account needs repository write access. Every publication creates a new JSON file under `content/updates/` on main, and the returned commit links appear in the timeline. Previous entries are retained. The token is held in memory only; signing out or reloading clears it. Local static preview supports drafts and history; use the hosted site for OAuth publication.

Run `npm test` for validation, Unicode publication, duplicate-retry, permissions and OAuth-origin checks.

## Meeting popup

Both Add meeting buttons open a popup on the calendar. Choose type, title, date, Toronto time, location, notes, attendees and actions. Save to shared wiki uses the existing GitHub sign-in and commits the meeting; Save in this browser keeps a clearly labeled local copy. Edit meeting / shared notes uses the same popup. Popup drafts are retained locally on failure; shared edits check for concurrent changes before writing. No meeting action opens Decap.
