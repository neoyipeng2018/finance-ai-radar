# Finance AI Radar runtime deployment

Canonical production should run as a Next.js runtime deployment so `/api/events` can persist analytics. GitHub Pages remains a static mirror only.

## Required environment

- `DATABASE_URL`: Neon or Vercel Postgres connection string for `analytics_events`.
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/events`: enables browser analytics posts on the runtime host.
- Do not set `NEXT_PUBLIC_STATIC_EXPORT` on Vercel.
- Set `NEXT_PUBLIC_STATIC_EXPORT=1` only for the GitHub Pages mirror build.
- Set `NEXT_PUBLIC_BASE_PATH=/finance-ai-radar` only for the GitHub Pages mirror build.

## Database bootstrap

Run the SQL in `db/analytics_events.sql` against the production database before enabling analytics traffic.

```bash
psql "$DATABASE_URL" -f db/analytics_events.sql
```

## Runtime verification

```bash
npm install --include=dev
npm test
npm run typecheck
npm run lint
NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/events npm run build
```

After deploy, post a synthetic event to the canonical runtime URL and verify a row appears in `analytics_events`.

```bash
curl -X POST "$CANONICAL_URL/api/events" \
  -H 'content-type: application/json' \
  -d '{"eventType":"page_view","anonymousId":"verify-anon-123","sessionId":"verify-session-123","path":"/","createdAt":"2026-06-04T00:00:00.000Z"}'
```

## Static mirror verification

```bash
NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/finance-ai-radar npm run build
```

The static mirror does not own analytics persistence. It can still publish readable content to GitHub Pages while Vercel owns the self-learning loop.
