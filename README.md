# ViT-FPGA Research Wiki

Team wiki for the TinyViT / DE1-SoC capstone. Every tab has an Add entry popup, and each saved entry has Edit and Remove controls. Member profiles, tasks, updates, meetings, ideas, resources, file links, Gantt entries and dashboard notes are editable directly on the page without login. Introductions can also be edited.

Content saves use /api/content. Production shared saves require the Cloudflare D1 binding WIKI_DB; see [DEPLOY.md](DEPLOY.md). Website code is maintained separately in Git. Initial JSON records seed the database view, and saved changes override them. Removed entries remain in revision history.

## Local preview

Run npm run preview, then open http://127.0.0.1:8767/. The preview stores edits in .local/content.sqlite and shares them across browser sessions. Node 22.15+ is required for the local SQLite runtime. Browser drafts remain distinct from saved entries.

Run npm test for automated checks and npm run build to build dist and the server seed. No external npm dependencies are required.

## Project records

- [Member progress](members.md)
- [Member log archive](updates/README.md)
- [Meeting schedule](meetings.md)
- [ECE496 files and data](files/README.md)
- [Implementation progress](progress-2026-11-03.md)
- [Research resources](resources.md)

The original Manus snapshot remains in archive/data/. Historical Markdown pages remain for reference; new edits use the live content database once production storage is connected.
