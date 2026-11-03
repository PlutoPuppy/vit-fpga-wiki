export const repository = 'PlutoPuppy/vit-fpga-wiki';

export function validateUpdate(input, memberIds) {
  if (!memberIds.includes(input.memberId)) throw new Error('Choose a team member.');
  const parsedDate = new Date(`${input.date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== input.date) throw new Error('Enter a valid update date.');
  if (!input.title?.trim() || !input.update?.trim()) throw new Error('Add an update title and description.');
  if (input.title.length > 160 || input.update.length > 20000) throw new Error('Keep the title under 160 characters and the update under 20,000 characters.');
  for (const item of input.links || []) {
    const url = new URL(item.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Evidence links must use http or https.');
  }
  return { memberId: input.memberId, date: input.date, title: input.title.trim(), update: input.update.trim(), links: input.links || [] };
}

export function encodeRecord(record) {
  const bytes = new TextEncoder().encode(JSON.stringify(record, null, 2) + '\n');
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
}

// Each publication creates a new file. Omitting sha prevents replacement of old entries.
export async function publishUpdate(token, record, request = fetch) {
  if (!/^update-[a-z0-9-]+$/.test(record.id)) throw new Error('Invalid update identifier.');
  const endpoint = `https://api.github.com/repos/${repository}/contents/content/updates/${record.id}.json`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' };
  const content = encodeRecord(record);
  const response = await request(endpoint, { method: 'PUT', headers, body: JSON.stringify({ branch: 'main', message: `${record.memberId}: ${record.date} ${record.title}`, content }) });
  if (!response.ok) {
    // A retry after a lost response must not overwrite an entry or create a duplicate.
    if ([409, 422].includes(response.status)) {
      const existing = await request(`${endpoint}?ref=main`, { headers });
      if (existing.ok) {
        const file = await existing.json();
        if ((file.content || '').replace(/\s/g, '') === content) return { url: file.html_url, existing: true };
      }
    }
    if (response.status === 401) throw new Error('Your GitHub sign-in expired. Sign in again; your draft is kept.');
    if ([403, 404].includes(response.status)) throw new Error('GitHub could not publish. Your account needs write access to this repository and main must allow commits. Your draft is kept.');
    throw new Error('GitHub did not confirm publication. Your draft is kept; check the repository history before retrying.');
  }
  const result = await response.json();
  return { url: result.commit.html_url, sha: result.commit.sha };
}

// Uses the same OAuth endpoint and scope as the existing team editor.
// The token stays in memory; it is never written into browser draft storage.
export function signInWithGitHub() {
  if (['127.0.0.1', 'localhost', '::1'].includes(location.hostname)) throw new Error('Local preview supports drafts. Open the hosted wiki to sign in and publish.');
  const popup = window.open('/api/auth?provider=github', 'wiki-member-login', 'width=650,height=750');
  if (!popup) throw new Error('Allow the GitHub sign-in popup and try again.');
  return new Promise((resolve, reject) => {
    let timer;
    const finish = (error, token) => {
      window.removeEventListener('message', receive);
      clearInterval(timer);
      popup.close();
      error ? reject(error) : resolve(token);
    };
    const receive = event => {
      if (event.origin !== location.origin || event.source !== popup) return;
      if (event.data === 'authorizing:github') popup.postMessage('authorizing:github', location.origin);
      if (typeof event.data === 'string' && event.data.startsWith('authorization:github:success:')) {
        try {
          const result = JSON.parse(event.data.slice('authorization:github:success:'.length));
          if (!result.token) throw new Error();
          finish(null, result.token);
        } catch { finish(new Error('GitHub sign-in was not completed.')); }
      }
    };
    window.addEventListener('message', receive);
    const started = Date.now();
    timer = setInterval(() => {
      if (popup.closed || Date.now() - started > 180000) finish(new Error('GitHub sign-in was closed or timed out. Your draft is kept.'));
    }, 500);
  });
}
