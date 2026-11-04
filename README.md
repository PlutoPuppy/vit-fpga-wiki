# ViT-FPGA Research Wiki

Team wiki for the TinyViT / DE1-SoC capstone. Every tab has an Add entry popup, and each saved entry has Edit and Remove controls. Member profiles, tasks, updates, meetings, ideas, resources, file links, Gantt entries and dashboard notes are editable directly on the page without login. Introductions can also be edited.

Content saves use /api/content. Production shared saves require the server secret WIKI_GITHUB_TOKEN; see [DEPLOY.md](DEPLOY.md). Website code is maintained separately in Git. Initial JSON records seed the text file view, and saved changes override them. Removed entries remain in revision history.

## Local preview

Run npm run preview, then open http://127.0.0.1:8767/. The preview stores edits in .local/content.json and shares them across browser sessions. Node 22.15+ supports the optional one-time migration of older preview data. Browser drafts remain distinct from saved entries.

Run npm test for automated checks and npm run build to build dist and the server seed. No external npm dependencies are required.

## Project records

- [Member progress](members.md)
- [Member log archive](updates/README.md)
- [Meeting schedule](meetings.md)
- [ECE496 files and data](files/README.md)
- [Implementation progress](progress-2026-11-03.md)
- [Research resources](resources.md)

The original Manus snapshot remains in archive/data/. Historical Markdown pages remain for reference; new edits use the live content text file once production storage is connected.

## Biweekly team overview

Project Updates is a primary navigation item immediately below Dashboard. Overview lists biweekly reports newest first. Each report is one entry with a date, title, separate Jerry/Stephanie/Tiffany/Winnie fields, team next steps and evidence links. Add biweekly update and entry Edit use the same single form. Earlier individual Result/Issue/Decision records remain in member update histories; no category filters or badges appear in Overview.

## No-database saving

The server writes wiki text to content/live-state.json in this GitHub repository. Editors save on the wiki without login. The site owner must set WIKI_GITHUB_TOKEN once; see DEPLOY.md. Local saves use a JSON text file. No D1 or other database is needed.
