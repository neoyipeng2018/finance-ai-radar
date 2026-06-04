import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { AnalyticsEventSchema, type AnalyticsEvent } from './analytics';

const fields = ['event_type', 'anonymous_id', 'session_id', 'path', 'item_id', 'source_type', 'theme', 'query', 'date_window', 'custom_days', 'rank_position', 'job_id', 'role_family', 'finance_domain', 'location', 'dwell_ms', 'scroll_depth', 'referrer', 'created_at'] as const;

type EventField = typeof fields[number];

function sanitize(value: string): string {
  return value.replace(/[\t\n\r]/g, ' ').trim();
}

function fieldValue(event: AnalyticsEvent, field: EventField): string {
  const values: Record<EventField, string> = {
    event_type: event.eventType,
    anonymous_id: event.anonymousId,
    session_id: event.sessionId,
    path: event.path,
    item_id: event.itemId ?? '',
    source_type: event.sourceType ?? '',
    theme: event.theme ?? '',
    query: event.query ?? '',
    date_window: event.dateWindow ?? '',
    custom_days: typeof event.customDays === 'number' ? String(event.customDays) : '',
    rank_position: typeof event.rankPosition === 'number' ? String(event.rankPosition) : '',
    job_id: event.jobId ?? '',
    role_family: event.roleFamily ?? '',
    finance_domain: event.financeDomain ?? '',
    location: event.location ?? '',
    dwell_ms: typeof event.dwellMs === 'number' ? String(event.dwellMs) : '',
    scroll_depth: typeof event.scrollDepth === 'number' ? String(event.scrollDepth) : '',
    referrer: event.referrer ?? '',
    created_at: event.createdAt,
  };
  return sanitize(values[field]);
}

export function analyticsEventToTsvRow(event: AnalyticsEvent): string {
  return fields.map((field) => fieldValue(event, field)).join('\t');
}

export function appendAnalyticsEvent(event: AnalyticsEvent, path = join(process.cwd(), 'data', 'analytics_events.tsv')): void {
  mkdirSync(dirname(path), { recursive: true });
  if (!existsSync(path)) {
    writeFileSync(path, `${fields.join('\t')}\n`);
  }
  appendFileSync(path, `${analyticsEventToTsvRow(event)}\n`);
}

function parseEventLine(line: string): AnalyticsEvent | null {
  const values = line.split('\t');
  const row = Object.fromEntries(fields.map((field, index) => [field, values[index] ?? '']));
  const parsed = AnalyticsEventSchema.safeParse({
    eventType: row.event_type,
    anonymousId: row.anonymous_id,
    sessionId: row.session_id,
    path: row.path,
    itemId: row.item_id || undefined,
    sourceType: row.source_type || undefined,
    theme: row.theme || undefined,
    query: row.query || undefined,
    dateWindow: row.date_window ? AnalyticsEventSchema.shape.dateWindow.parse(row.date_window) : undefined,
    customDays: row.custom_days ? Number(row.custom_days) : undefined,
    rankPosition: row.rank_position ? Number(row.rank_position) : undefined,
    jobId: row.job_id || undefined,
    roleFamily: row.role_family || undefined,
    financeDomain: row.finance_domain || undefined,
    location: row.location || undefined,
    dwellMs: row.dwell_ms ? Number(row.dwell_ms) : undefined,
    scrollDepth: row.scroll_depth ? Number(row.scroll_depth) : undefined,
    referrer: row.referrer || undefined,
    createdAt: row.created_at,
  });
  return parsed.success ? parsed.data : null;
}

export function readAnalyticsEvents(path = join(process.cwd(), 'data', 'analytics_events.tsv')): AnalyticsEvent[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .slice(1)
    .map(parseEventLine)
    .filter((event): event is AnalyticsEvent => event !== null);
}
