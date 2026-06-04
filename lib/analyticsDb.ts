import { neon } from '@neondatabase/serverless';
import { appendAnalyticsEvent } from './analyticsStore';
import type { AnalyticsEvent } from './analytics';

const databaseUrl = process.env.DATABASE_URL;

export async function insertAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (!databaseUrl) {
    appendAnalyticsEvent(event);
    return;
  }
  const sql = neon(databaseUrl);
  await sql`
    insert into analytics_events (
      event_type, anonymous_id, session_id, path, item_id, source_type, theme, query,
      date_window, custom_days, rank_position, job_id, role_family, finance_domain,
      location, dwell_ms, scroll_depth, referrer, created_at
    ) values (
      ${event.eventType}, ${event.anonymousId}, ${event.sessionId}, ${event.path},
      ${event.itemId ?? null}, ${event.sourceType ?? null}, ${event.theme ?? null}, ${event.query ?? null},
      ${event.dateWindow ?? null}, ${event.customDays ?? null}, ${event.rankPosition ?? null},
      ${event.jobId ?? null}, ${event.roleFamily ?? null}, ${event.financeDomain ?? null},
      ${event.location ?? null}, ${event.dwellMs ?? null}, ${event.scrollDepth ?? null},
      ${event.referrer ?? null}, ${event.createdAt}
    )`;
}
