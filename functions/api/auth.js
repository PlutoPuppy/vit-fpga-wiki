export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    return new Response('GitHub editor login is not configured yet.', { status: 503 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get('provider') !== 'github') return new Response('Invalid provider', { status: 400 });
  const state = [...crypto.getRandomValues(new Uint8Array(24))].map(x => x.toString(16).padStart(2, '0')).join('');
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  github.searchParams.set('scope', 'public_repo');
  github.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `wiki_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/callback; Max-Age=600`,
      'Cache-Control': 'no-store'
    }
  });
}
