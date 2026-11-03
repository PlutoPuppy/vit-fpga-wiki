export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('provider') !== 'github') return new Response('Invalid provider', { status: 400 });
  const cookie = request.headers.get('Cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith('wiki_oauth_state='))?.slice('wiki_oauth_state='.length);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  if (!cookie || !state || cookie !== state || !code) return new Response('Invalid login state. Try signing in again.', { status: 400 });
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) return new Response('Editor login is not configured.', { status: 503 });
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code, redirect_uri: `${url.origin}/api/callback?provider=github` })
  });
  if (!tokenResponse.ok) return new Response('GitHub sign-in failed.', { status: 502 });
  const result = await tokenResponse.json();
  if (!result.access_token) return new Response('GitHub sign-in failed.', { status: 403 });
  const message = `authorization:github:success:${JSON.stringify({ token: result.access_token })}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Authorizing editor</title></head><body><p>Completing sign-in…</p><script>
  const target = ${JSON.stringify(url.origin)};
  const message = ${JSON.stringify(message)};
  function receive(event) {
    if (event.origin !== target || event.source !== window.opener) return;
    window.opener.postMessage(message, target);
    window.removeEventListener('message', receive);
    window.close();
  }
  window.addEventListener('message', receive);
  if (window.opener) window.opener.postMessage('authorizing:github', target);
  </script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Set-Cookie': 'wiki_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/callback; Max-Age=0'
    }
  });
}
