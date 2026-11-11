const COOKIE = '__Host-harkerx-visitor';
const COOKIE_AGE = 365 * 24 * 60 * 60;
const VISIT_WINDOW = 30 * 60;
const encoder = new TextEncoder();
let signingSecret, signingKey;
let manifestOrigin, manifestPromise, manifestExpires = 0;

const base64url = bytes => btoa(String.fromCharCode(...bytes))
  .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

async function key(secret) {
  if (signingSecret !== secret) {
    signingSecret = secret;
    signingKey = crypto.subtle.importKey('raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  }
  return signingKey;
}

async function hash(secret, value) {
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(value))));
}

async function readVisitor(request, secret, now) {
  const value = (request.headers.get('Cookie') || '').split(';')
    .map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3 || !/^[0-9a-f-]{36}$/.test(parts[0]) || !/^\d{10}$/.test(parts[1]) || !/^[\w-]{43}$/.test(parts[2])) return null;
  const issued = Number(parts[1]);
  if (issued > now + 60 || now - issued >= COOKIE_AGE) return null;
  const signature = Uint8Array.from(atob(parts[2].replaceAll('-', '+').replaceAll('_', '/') + '='), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', await key(secret), signature, encoder.encode(`visitor:${parts[0]}.${parts[1]}`));
  return valid ? parts[0] : null;
}

async function newVisitor(secret, now) {
  const id = crypto.randomUUID();
  const payload = `${id}.${now}`;
  const signature = await hash(secret, `visitor:${payload}`);
  return { id, cookie: `${COOKIE}=${payload}.${signature}; Path=/; Max-Age=${COOKIE_AGE}; Secure; HttpOnly; SameSite=Lax` };
}

async function publishedPosts(origin) {
  if (manifestOrigin !== origin || !manifestPromise || Date.now() >= manifestExpires) {
    manifestOrigin = origin;
    manifestExpires = Date.now() + 60000;
    manifestPromise = (async () => {
      const response = await fetch(`${origin}/post-identities.json`, {
        signal: AbortSignal.timeout(5000), cf: { cacheTtl: 60 },
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Published article manifest unavailable');
      const data = await response.json();
      if (data.version !== 1 || !Array.isArray(data.postIds) || data.postIds.some(id => typeof id !== 'string' || !id || id.length > 512)) {
        throw new Error('Invalid published article manifest');
      }
      return new Set(data.postIds);
    })().catch(error => { manifestPromise = undefined; throw error; });
  }
  return manifestPromise;
}

const statsQuery = (db, post, visitor) => db.prepare(`SELECT
  COALESCE((SELECT views FROM post_stats WHERE post_id = ?), 0) AS views,
  COALESCE((SELECT likes FROM post_stats WHERE post_id = ?), 0) AS likes,
  EXISTS(SELECT 1 FROM post_likes WHERE post_id = ? AND visitor_hash = ?) AS liked`)
  .bind(post, post, post, visitor);

export async function handle(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const site = env.SITE_ORIGIN;
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  });
  if (origin === site) {
    headers.set('Access-Control-Allow-Origin', site);
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  try {
    if (!site || new URL(site).origin !== site || !site.startsWith('https://') || !env.DB || typeof env.COOKIE_SECRET !== 'string' || env.COOKIE_SECRET.length < 32) {
      return reply({ error: 'not_configured' }, 503);
    }
    if (url.pathname === '/health' && request.method === 'GET') {
      if (!env.READ_LIMITER?.limit) return reply({ error: 'rate_limit_not_configured' }, 503);
      const ip = await hash(env.COOKIE_SECRET, 'ip:' + (request.headers.get('CF-Connecting-IP') || 'unknown'));
      if (!(await env.READ_LIMITER.limit({ key: `ip:${ip}` })).success) {
        headers.set('Retry-After', '60');
        return reply({ error: 'rate_limited' }, 429);
      }
      await env.DB.prepare('SELECT post_id FROM post_stats LIMIT 1').first();
      return reply({ ok: true, version: 1 });
    }
    if (origin !== site) return reply({ error: 'origin_not_allowed' }, 403);
    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'X-HarkerX-Action');
      headers.set('Access-Control-Max-Age', '600');
      return new Response(null, { status: 204, headers });
    }
    const match = /^\/v1\/posts\/([^/]+)(?:\/(view|like))?\/?$/.exec(url.pathname);
    if (!match) return reply({ error: 'not_found' }, 404);
    let post;
    try { post = decodeURIComponent(match[1]); } catch { return reply({ error: 'invalid_post' }, 400); }
    if (!post || post.length > 512 || /[\u0000-\u001f\u007f]/.test(post)) return reply({ error: 'invalid_post' }, 400);
    const action = match[2];
    const method = action === 'like' ? 'PUT' : action === 'view' ? 'POST' : 'GET';
    if (request.method !== method) {
      headers.set('Allow', method);
      return reply({ error: 'method_not_allowed' }, 405);
    }
    if (action && request.headers.get('X-HarkerX-Action') !== '1') return reply({ error: 'invalid_action' }, 403);
    const limiter = action ? env.WRITE_LIMITER : env.READ_LIMITER;
    if (!limiter?.limit) return reply({ error: 'rate_limit_not_configured' }, 503);
    const ip = await hash(env.COOKIE_SECRET, 'ip:' + (request.headers.get('CF-Connecting-IP') || 'unknown'));
    if (!(await limiter.limit({ key: `ip:${ip}` })).success) {
      headers.set('Retry-After', '60');
      return reply({ error: 'rate_limited' }, 429);
    }
    if (!(await publishedPosts(site)).has(post)) return reply({ error: 'post_not_found' }, 404);
    const now = Math.floor(Date.now() / 1000);
    let visitor = await readVisitor(request, env.COOKIE_SECRET, now);
    if (!visitor && action) return reply({ error: 'visitor_required' }, 428);
    if (!visitor) {
      const issued = await newVisitor(env.COOKIE_SECRET, now);
      visitor = issued.id;
      headers.set('Set-Cookie', issued.cookie);
    }
    const visitorHash = await hash(env.COOKIE_SECRET, `visitor-db:${visitor}`);
    if (!(await limiter.limit({ key: `visitor:${visitorHash}` })).success) {
      headers.set('Retry-After', '60');
      return reply({ error: 'rate_limited' }, 429);
    }
    let stats;
    if (!action) stats = await statsQuery(env.DB, post, visitorHash).first();
    else {
      const insert = env.DB.prepare('INSERT INTO post_stats (post_id) VALUES (?) ON CONFLICT DO NOTHING').bind(post);
      const mutation = action === 'like'
        ? env.DB.prepare('INSERT INTO post_likes (post_id, visitor_hash, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').bind(post, visitorHash, now)
        : env.DB.prepare(`INSERT INTO post_visits (post_id, visitor_hash, last_counted_at) VALUES (?, ?, ?)
            ON CONFLICT(post_id, visitor_hash) DO UPDATE SET last_counted_at = excluded.last_counted_at
            WHERE post_visits.last_counted_at <= excluded.last_counted_at - ?`).bind(post, visitorHash, now, VISIT_WINDOW);
      const outcome = await env.DB.batch([insert, mutation, statsQuery(env.DB, post, visitorHash)]);
      stats = outcome[2].results[0];
    }
    return reply({ postId: post, views: stats.views, likes: stats.likes, liked: Boolean(stats.liked) });
  } catch (error) {
    console.error('Interaction service failed:', error instanceof Error ? error.message : 'unknown error');
    return reply({ error: 'service_unavailable' }, 503);
  }
}

export default { fetch: handle };
