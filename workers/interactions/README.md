# Article views and likes

This Worker belongs to HarkerX Harbor and is independent of Twikoo. It uses the existing article identity for both languages, a signed anonymous cookie, D1 counters, and Workers rate-limit bindings. The blog remains a static site.

## Deployment

Run commands from the blog root in PowerShell. Wrangler is pinned and run through `npx.cmd`; it is not added to the blog's dependencies. `COOKIE_SECRET` must already be set as a Worker Secret in Cloudflare; do not put its value in source files.

1. Publish the blog with `theme.interactions.enable: false`. This publishes `/post-identities.json`, a list of published source IDs. The Worker caches it for at most about a minute. Drafts and translations do not add separate IDs. This order keeps the public UI unchanged until the API is ready.
2. Log in to the Cloudflare account that owns the new Worker and D1:

```powershell
npx.cmd --yes wrangler@4.160.0 login
```

3. Initialize only the new interactions database:

```powershell
npx.cmd --yes wrangler@4.160.0 d1 execute harkerx-interactions --remote --config workers/interactions/wrangler.jsonc --file workers/interactions/schema.sql
```

The SQL is additive and repeatable. It creates three prefixed tables and four triggers; it does not drop, truncate, seed, or reset counters. Confirm the target is the new D1 database `7e7f7109-0865-449f-a503-0e6d8565ed25`.

4. Deploy to the existing interactions Worker:

```powershell
npx.cmd --yes wrangler@4.160.0 deploy --config workers/interactions/wrangler.jsonc
```

Deployment applies the configured D1 binding, custom domain and native rate-limit bindings. Existing Worker secrets are retained. `wrangler.jsonc` is the configuration source for subsequent deployments. Namespaces `751401` and `751402` are dedicated to this service; do not reuse them in unrelated Workers.

5. Check the API:

```powershell
Invoke-RestMethod 'https://stats.harkerx.com/health'
Invoke-RestMethod 'https://stats.harkerx.com/v1/posts/vpn' -Headers @{ Origin = 'https://harkerx.com' }
```

Health must return `ok: true` and `version: 2`. It also verifies that the unlike trigger was installed. The article response has `postId`, `views`, `likes`, and `liked`. The second command reads statistics and issues an anonymous cookie; it does not count a view or create a like. Until the blog's manifest is published, article requests fail closed with HTTP 503. `/` is not a health endpoint.

6. In `src/site.config.ts`, set only `theme.interactions.enable` to `true`. Build/check and publish the blog again. Test the real HTTPS site; localhost is intentionally not allowed to write to production statistics.

## Upgrade an existing deployment

Run the schema command again, then deploy the Worker, and verify health returns version 2 **before** publishing a frontend that sends DELETE. This adds the missing unlike trigger without deleting or resetting existing data. Keep the existing `COOKIE_SECRET`; no key rotation is needed for this upgrade. Both health and DELETE fail closed with `schema_update_required` if the delete trigger is missing, so an out-of-order rollout cannot remove a like without updating its counter.

## Behaviour

- `GET /v1/posts/:id` reads totals and the current visitor's liked state, issuing a signed, Secure, HttpOnly, host-only, SameSite=Lax cookie if needed.
- `POST /v1/posts/:id/view` records one view per anonymous identity and logical article per rolling 30 minutes.
- `PUT /v1/posts/:id/like` ensures one like exists for that identity/article. Retries do not increment again.
- `DELETE /v1/posts/:id/like` removes only that identity's like. The delete trigger decrements once, never below zero; repeated DELETE requests are harmless. The response includes the current count and `liked: false`. Re-liking is supported.
- Mutations require the signed cookie, the explicit site Origin, and `X-HarkerX-Action: 1`. CORS is browser access control, not proof that a caller is human.
- Native limits are 120 read/health checks and 30 mutations per 60 seconds, checked separately per IP-derived key and per anonymous visitor key. These limits are approximate and local to each Cloudflare location.
- D1 stores HMAC-derived visitor identifiers, not raw IP addresses or emails. A unique key and triggers update records and counters atomically. Losing the cookie or changing devices creates a new anonymous identity; this cannot enforce one like per real person.
- The displayed view count is deduplicated visits, not unique people or proof that someone read the full article. Automated browsers can still imitate visitors.
- Personalized responses use `private, no-store`; do not add a Cache Everything rule to this API.
- Home cards display read-only views and likes before their dates. Card loads only perform GET requests and never count an article view. Statistics and date stay aligned to the bottom of the card, independently of the number of tag lines; on very narrow cards the complete group wraps together.
- The article header shows read-only views followed by likes. The bottom action toggles like/unlike and displays localized success or error feedback. All visible counts use the logical article ID.
- Cross-tab notifications refresh counts without counting another view. Background reads are queued during local mutations, and late responses cannot restore an old liked state.
- Views and likes initially display `0` and are replaced by the API totals after loading. Failed reads retain the displayed values and show an unavailable tooltip. The frontend permits a retry, ignores detached-page responses, cancels requests on navigation, and keeps the existing article and share functionality usable.
- New published articles become available through the blog manifest without redeploying the Worker. If the manifest is unavailable or invalid, no interaction is recorded. Old count rows are preserved when an article is removed from publication.

## Validation and maintenance

```powershell
node --test workers/interactions/worker.test.mjs
pnpm check
pnpm exec tsc6 --noEmit
pnpm build
```

The Node test uses an in-memory SQLite adapter for the D1 API and stubbed rate-limit decisions. It validates signed identity, SQL insert/delete triggers, like/unlike retries, visitor isolation, mixed requests, additive upgrades, rollback, view boundaries, CORS, draft/unknown IDs and failures without touching production data. Native Workers rate-limit enforcement, real HTTPS cookies and production D1 must also be checked after deployment.

Keep D1 data separate from a source baseline ZIP. Reinstalling dependencies or restoring the source does not restore or reset Cloudflare counters. Export/backup the interactions D1 through Cloudflare when needed. Rotating `COOKIE_SECRET` invalidates existing anonymous identities and their association with old liked records.
