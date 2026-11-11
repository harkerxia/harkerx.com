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
  let cookie, otherCookie;
  try {
    await t.test('health verifies SQL schema and rate limit', async () => {
      const r = await handle(new Request('https://stats.harkerx.com/health'), env);
      assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true, version: 2 });
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
    const mutation = (action, visitor = cookie, method = action === 'like' ? 'PUT' : 'POST') => req('/v1/posts/vpn/' + action, { method, headers: { Cookie: visitor, 'X-HarkerX-Action': '1' } });
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
      otherCookie=other;
      assert.equal((await r.json()).liked,false);
      const liked=await(await handle(mutation('like',other),env)).json();assert.equal(liked.likes,2);
    });
    await t.test('unlike removes only this visitor and leaves views unchanged', async () => {
      const r=await handle(mutation('like',cookie,'DELETE'),env);
      assert.deepEqual(await r.json(),{postId:'vpn',views:1,likes:1,liked:false});
      const other=await handle(req(undefined,{headers:{Cookie:otherCookie}}),env);
      assert.deepEqual(await other.json(),{postId:'vpn',views:1,likes:1,liked:true});
    });
    await t.test('concurrent unlike retries decrement once and never remove another visitor', async () => {
      const outcomes=await Promise.all(Array.from({length:12},()=>handle(mutation('like',cookie,'DELETE'),env).then(r=>r.json())));
      assert.ok(outcomes.every(r=>r.likes===1&&!r.liked&&r.views===1));
      assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM post_likes').get().n,1);
      const fresh=await handle(req(),env);
      const freshCookie=fresh.headers.get('set-cookie').split(';')[0];
      const noLike=await handle(mutation('like',freshCookie,'DELETE'),env);
      assert.equal((await noLike.json()).likes,1);
    });
    await t.test('refresh after unlike stays unliked and re-like increments only once', async () => {
      assert.equal((await(await handle(req(undefined,{headers:{Cookie:cookie}}),env)).json()).liked,false);
      for(let i=0;i<3;i++){
        const liked=await(await handle(mutation('like'),env)).json();
        assert.equal(liked.likes,2);assert.equal(liked.liked,true);
      }
    });
    await t.test('mixed like/unlike requests keep aggregate equal to actual unique records', async () => {
      await Promise.all(Array.from({length:24},(_,i)=>handle(mutation('like',cookie,i%2?'PUT':'DELETE'),env)));
      const total=db.sqlite.prepare('SELECT likes FROM post_stats WHERE post_id = ?').get('vpn').likes;
      const records=db.sqlite.prepare('SELECT COUNT(*) n FROM post_likes WHERE post_id = ?').get('vpn').n;
      assert.equal(total,records);assert.ok(total>=1&&total<=2);
      assert.equal((await(await handle(mutation('like'),env)).json()).likes,2);
    });
    await t.test('failed unlike rolls back its trigger and preserves the existing like', async () => {
      const previousError=console.error;console.error=()=>{};
      db.sqlite.exec("CREATE TRIGGER fail_unlike BEFORE DELETE ON post_likes BEGIN SELECT RAISE(ABORT, 'test failure'); END;");
      try{
        const r=await handle(mutation('like',cookie,'DELETE'),env);assert.equal(r.status,503);
        const current=await(await handle(req(undefined,{headers:{Cookie:cookie}}),env)).json();
        assert.equal(current.likes,2);assert.equal(current.liked,true);
      }finally{db.sqlite.exec('DROP TRIGGER fail_unlike');console.error=previousError;}
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
      assert.ok(r.headers.get('access-control-allow-methods').split(', ').includes('DELETE'));
    });
    await t.test('wrong methods and action headers are rejected', async () => {
      const wrong=await handle(req('/v1/posts/vpn/like',{method:'POST'}),env);
      assert.equal(wrong.status,405);assert.equal(wrong.headers.get('allow'),'PUT, DELETE');
      assert.equal((await handle(req('/v1/posts/vpn/like',{method:'PUT',headers:{Cookie:cookie}}),env)).status,403);
      assert.equal((await handle(req('/v1/posts/vpn/like',{method:'DELETE',headers:{Cookie:cookie}}),env)).status,403);
      assert.equal((await handle(mutation('like','','DELETE'),env)).status,428);
      assert.equal((await handle(mutation('like',cookie+'invalid','DELETE'),env)).status,428);
      const wrongView=await handle(req('/v1/posts/vpn/view',{method:'DELETE'}),env);
      assert.equal(wrongView.status,405);assert.equal(wrongView.headers.get('allow'),'POST');
    });
    await t.test('rate limiting fails closed with 429 and Retry-After', async () => {
      const limited={limit:async()=>({success:false})};
      const r=await handle(req(),{...env,READ_LIMITER:limited});assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'60');
      assert.equal((await handle(mutation('like'),{...env,WRITE_LIMITER:limited})).status,429);
      assert.equal((await handle(mutation('like',cookie,'DELETE'),{...env,WRITE_LIMITER:limited})).status,429);
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
    await t.test('missing unlike migration fails health and DELETE closed without losing records',async()=>{
      const before=await(await handle(req(undefined,{headers:{Cookie:cookie}}),env)).json();
      db.sqlite.exec('DROP TRIGGER post_like_delete');
      try{
        const r=await handle(new Request('https://stats.harkerx.com/health'),env);
        assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'schema_update_required'});
        const deletion=await handle(mutation('like',cookie,'DELETE'),env);
        assert.equal(deletion.status,503);assert.deepEqual(await deletion.json(),{error:'schema_update_required'});
        const after=await(await handle(req(undefined,{headers:{Cookie:cookie}}),env)).json();
        assert.deepEqual(after,before);
        assert.equal(after.liked,true);
        assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM post_likes WHERE post_id = ?').get('vpn').n,2);
      }finally{db.sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));}
      assert.equal(db.sqlite.prepare('SELECT likes FROM post_stats WHERE post_id = ?').get('vpn').likes,2);
    });
    await t.test('published manifest failure fails closed',async()=>{
      now+=61000;manifestFails=true;
      assert.equal((await handle(req(),env)).status,503);
      manifestFails=false;assert.equal((await handle(req(),env)).status,200);
    });
    await t.test('expired identity cannot mutate',async()=>{
      now+=366*86400*1000;assert.equal((await handle(mutation('like'),env)).status,428);
      assert.equal((await handle(mutation('like',cookie,'DELETE'),env)).status,428);
    });
  }finally{globalThis.fetch=originalFetch;Date.now=originalNow;console.error=originalError;db.sqlite.close();}
});

test('additive schema upgrade preserves counters and unlike cannot go negative',()=>{
  const db=database();
  try{
    db.sqlite.exec("DROP TRIGGER post_like_delete; INSERT INTO post_stats VALUES ('existing',7,0); INSERT INTO post_likes VALUES ('existing','a',1); INSERT INTO post_likes VALUES ('existing','b',2);");
    db.sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
    db.sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
    assert.equal(db.sqlite.prepare("SELECT views FROM post_stats WHERE post_id='existing'").get().views,7);
    assert.equal(db.sqlite.prepare("SELECT likes FROM post_stats WHERE post_id='existing'").get().likes,2);
    db.sqlite.exec("DELETE FROM post_likes WHERE post_id='existing' AND visitor_hash='a'; DELETE FROM post_likes WHERE post_id='existing' AND visitor_hash='a';");
    assert.equal(db.sqlite.prepare("SELECT likes FROM post_stats WHERE post_id='existing'").get().likes,1);
    // Defend against a manually inconsistent historical counter too.
    db.sqlite.exec("UPDATE post_stats SET likes=0 WHERE post_id='existing'; DELETE FROM post_likes WHERE post_id='existing' AND visitor_hash='b';");
    assert.equal(db.sqlite.prepare("SELECT likes FROM post_stats WHERE post_id='existing'").get().likes,0);
  }finally{db.sqlite.close();}
});
