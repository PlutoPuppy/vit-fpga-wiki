# File-based content saving

Wiki content is saved as ordinary JSON in the existing GitHub repository. No D1 database or database binding is required. Website visitors use the same on-page Add/Edit/Remove controls without login.

## One-time owner setup

The owner of PlutoPuppy/vit-fpga-wiki creates a fine-grained GitHub token limited to that repository with Contents read/write permission. Add it as an encrypted Production secret named WIKI_GITHUB_TOKEN in the existing Cloudflare Pages project vit-fpga-wiki, then redeploy. Do not put the token in chat, frontend code, Git, or a normal public variable. Use an appropriate expiration date and renew the secret when necessary. A preview environment can use a separate repository/token if desired; otherwise leave its saving disabled.

The site owner still needs to complete this one-time secret setup. The existing OAuth client ID/secret do not replace a GitHub write token. There is no D1 setup to perform, and editors do not need GitHub or Cloudflare accounts.

The server writes only content/live-state.json on main. Changes remain in Git history; removed records are marked hidden in the file. The API never accepts a destination path or repository from a browser. It validates content fields, checks revisions, and uses the current GitHub file SHA to avoid overwriting concurrent saves. Updates to different entries are retried against the latest document. Each save creates a commit and triggers the existing Pages deployment, while the API reads the latest saved file immediately.

Anyone who can reach this no-login wiki can edit content. The GitHub token stays server-side; it is not returned to browsers. Website source cannot be edited through the content API.

## Verify

Open /api/content and confirm shared is true. Add a temporary entry, edit it, open another browser to confirm the same content, and remove it. Check GitHub history for changes to content/live-state.json. Do not call setup complete until a real live save succeeds. If the secret is missing or invalid, the form keeps the draft and displays a save failure.

## Local preview

Run npm run preview, then open http://127.0.0.1:8767/. Local saves use .local/content.json and a JSON-lines history file; both are excluded from Git. The first start exports any existing local SQLite-preview edits into the JSON file without changing or deleting the old file. SQLite is not used for normal saving. npm test covers file persistence, Unicode, revision conflicts, concurrent writes and the GitHub adapter without publishing test entries.

## Hosting

Pages project: vit-fpga-wiki. Branch: main. Build: npm run build. Output: dist. URL: https://vit-fpga-wiki.pages.dev/. The old /admin/ route redirects to the wiki.
