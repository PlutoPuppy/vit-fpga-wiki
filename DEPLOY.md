# Content editing deployment

The content editor uses Add, Edit and Remove popups on every tab. Public content edits do not require login. Website source remains in Git and cannot be edited through the content API.

## Production setup required

Create a Cloudflare D1 database for this wiki, bind it to the existing Pages project as WIKI_DB in Production, then redeploy. Use a separate binding for Preview if desired. The API creates its two tables on first use. The build generates server/seed.js from existing JSON content; database changes override this seed and persist across deployments.

This production setup has not been performed. Automatic approval review blocked inspecting the Cloudflare account pending explicit account-access authorization. When the binding is absent, the API returns a clear 503 instead of claiming a shared save.

Anyone who can reach the wiki can edit its content. The API accepts only known content collections and fields; site code, deployment settings and credentials remain outside its scope. Saves include revision checks. Removed entries remain in stored revision history.

## Verification after setup

Open /api/content and confirm shared is true. Add a temporary dashboard entry, edit it, verify it in another browser, and remove it. Confirm all eight tabs have Add plus entry Edit/Remove controls. Stale edits must report a conflict rather than overwrite newer changes.

## Local review

Run npm run preview with Node 22.15 or later. Open http://127.0.0.1:8767/. The same API handler runs against a persistent SQLite database in .local/content.sqlite, excluded from Git. The older Python static preview on port 8766 cannot perform shared saves. Run npm test for CRUD, revision conflicts, request validation and missing-storage behavior.

## Hosting

Existing Pages project: vit-fpga-wiki. Production branch: main. Build: npm run build. Output: dist. URL: https://vit-fpga-wiki.pages.dev/. Public content controls no longer use GitHub OAuth. The old /admin/ route sends visitors back to the wiki.
