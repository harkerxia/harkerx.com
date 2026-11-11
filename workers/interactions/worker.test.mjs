import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handle } from './worker.mjs';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const wrap = (sql, values = []) => ({
    bind(...args) { return wrap(sql, args); },
    async first() { return sqlite.prepare(sql).get(...values) ?? null; },
    rows() { return sqlite.prepare(sql).all(...values); },
  });
  return {
    prepare: wrap,
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const result = statements.map(s => ({ results: s.rows(), success: true }));
        sqlite.exec('COMMIT');
        return result;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
    sqlite,
  };
}

test('Worker API, signed identity, atomic SQL, deduplication and failure handling', async t => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  const originalError = console.error;
  let now = originalNow();
  Date.now = () => now;
  let manifestFails = false;
  globalThis.fetch = async url => {
    assert.equal(String(url), 'https://harkerx.com/post-identities.json');
    return Response.json(manifestFails ? {} : { version: 1, postIds: ['vpn', 'blog', 'guides/example'] }, { status: manifestFails ? 503 : 200 });
  };
  const db = database();
  const allowed = { limit: async () => ({ success: true }) };
  const env = { DB: db, COOKIE_SECRET: 'unit-test-only-secret-'.repeat(4), SITE_ORIGIN: 'https://harkerx.com', READ_LIMITER: allowed, WRITE_LIMITER: allowed };
  const req = (path = '/v1/posts/vpn', options = {}) => new Request('https://stats.harkerx.com' + path, {
    method: options.method || 'GET', headers: { Origin: env.SITE_ORIGIN, 'CF-Connecting-IP': '192.0.2.1', ...options.headers },
  });
  let cookie;
  try {
    await t.test('health verifies SQL schema and rate limit', async () => {
      const r = await handle(new Request('https://stats.harkerx.com/health'), env);
      assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true, version: 1 });
    });
    await t.test('GET initializes signed, HttpOnly host-only identity without incrementing', async () => {
      const r = await handle(req(), env);assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { postId: 'vpn', views: 0, likes: 0, liked: false });
      const set = r.headers.get('set-cookie'); assert.match(set, /^__Host-harkerx-visitor=/);
      for (const flag of ['Secure', 'HttpOnly', 'SameSite=Lax', 'Path=/']) assert.ok(set.includes(flag));
      assert.ok(!set.includes('Domain=')); cookie=set.split(';')[0];
      assert.equal(r.headers.get('access-control-allow-origin'), env.SITE_ORIGIN);
      assert.equal(r.headers.get('access-control-allow-credentials'), 'true');
      assert.match(r.headers.get('cache-control'), /private, no-store/);
    });
    const mutation = (action, visitor = cookie) => req('/v1/posts/vpn/' + action, { method: action === 'like' ? 'PUT' : 'POST', headers: { Cookie: visitor, 'X-HarkerX-Action': '1' } });
    await t.test('missing identity cannot write', async () => assert.equal((await handle(mutation('like',''),env)).status,428));
    await t.test('signed-cookie tampering cannot write', async () => {
      const forged = cookie.slice(0,-2)+(cookie.endsWith('AA')?'BB':'AA');
      assert.equal((await handle(mutation('like',forged),env)).status,428);
    });
    await t.test('one initial visit; retries and language-equivalent ID do not increment', async () => {
      for(let i=0;i<5;i++)assert.equal((await(await handle(mutation('view'),env)).json()).views,1);
    });
    await t.test('first like increments once; concurrent/retried requests remain idempotent', async () => {
      const outcomes=await Promise.all(Array.from({length:12},()=>handle(mutation('like'),env).then(r=>r.json())));
      assert.ok(outcomes.every(r=>r.likes===1&&r.liked));
      assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM post_likes').get().n,1);
    });
    await t.test('refresh recovers liked state and original identity', async () => {
      const r=await handle(req(undefined,{headers:{Cookie:cookie}}),env);
      assert.equal(r.headers.get('set-cookie'),null);
      assert.deepEqual(await r.json(),{postId:'vpn',views:1,likes:1,liked:true});
    });
    await t.test('another anonymous browser has independent liked state', async () => {
      const r=await handle(req(),env);const other=r.headers.get('set-cookie').split(';')[0];
      assert.equal((await r.json()).liked,false);
      const liked=await(await handle(mutation('like',other),env)).json();assert.equal(liked.likes,2);
    });
    await t.test('different articles and nested stable IDs work independently', async () => {
      const r=await handle(req('/v1/posts/blog/view',{method:'POST',headers:{Cookie:cookie,'X-HarkerX-Action':'1'}}),env);
      assert.deepEqual(await r.json(),{postId:'blog',views:1,likes:0,liked:false});
      assert.equal((await handle(req('/v1/posts/guides%2Fexample'),env)).status,200);
    });
    await t.test('30-minute view window is enforced at its boundary', async () => {
      now+=1799*1000;assert.equal((await(await handle(mutation('view'),env)).json()).views,1);
      now+=1000;assert.equal((await(await handle(mutation('view'),env)).json()).views,2);
    });
    await t.test('unknown or draft IDs cannot create database rows', async () => {
      assert.equal((await handle(req('/v1/posts/not-published'),env)).status,404);
      assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM post_stats WHERE post_id = ?').get('not-published').n,0);
    });
    await t.test('untrusted/missing origins get no readable CORS response', async () => {
      for(const Origin of ['https://evil.example','null','']){
        const r=await handle(req(undefined,{headers:{Origin}}),env);assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);
      }
    });
    await t.test('preflight allows explicit production origin and mutation header', async () => {
      const r=await handle(req(undefined,{method:'OPTIONS'}),env);assert.equal(r.status,204);
      assert.equal(r.headers.get('access-control-allow-headers'),'X-HarkerX-Action');
    });
    await t.test('wrong methods and action headers are rejected', async () => {
      assert.equal((await handle(req('/v1/posts/vpn/like',{method:'POST'}),env)).status,405);
      assert.equal((await handle(req('/v1/posts/vpn/like',{method:'PUT',headers:{Cookie:cookie}}),env)).status,403);
    });
    await t.test('rate limiting fails closed with 429 and Retry-After', async () => {
      const limited={limit:async()=>({success:false})};
      const r=await handle(req(),{...env,READ_LIMITER:limited});assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'60');
      assert.equal((await handle(mutation('like'),{...env,WRITE_LIMITER:limited})).status,429);
      assert.equal((await handle(req(),{...env,READ_LIMITER:undefined})).status,503);
    });
    await t.test('missing secret/DB is a controlled configuration failure',async()=>{
      for(const override of [{COOKIE_SECRET:''},{DB:null}])assert.equal((await handle(req(),{...env,...override})).status,503);
    });
    await t.test('database failure never reports a successful like',async()=>{
      console.error=()=>{};
      const broken={...db,batch:async()=>{throw Error('DB unavailable');}};
      const r=await handle(mutation('like'),{...env,DB:broken});assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'service_unavailable'});
    });
    await t.test('published manifest failure fails closed',async()=>{
      now+=61000;manifestFails=true;
      assert.equal((await handle(req(),env)).status,503);
      manifestFails=false;assert.equal((await handle(req(),env)).status,200);
    });
    await t.test('expired identity cannot mutate',async()=>{
      now+=366*86400*1000;assert.equal((await handle(mutation('like'),env)).status,428);
    });
  }finally{globalThis.fetch=originalFetch;Date.now=originalNow;console.error=originalError;db.sqlite.close();}
});
