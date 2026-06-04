import { z } from 'zod';

export const AnalyticsEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'source_click',
    'filter_change',
    'scroll_depth',
    'session_end',
    'newsletter_focus',
    'newsletter_submit',
    'sponsor_click',
    'job_click',
  ]),
  anonymousId: z.string().min(8),
  sessionId: z.string().min(8),
  path: z.string(),
  itemId: z.string().optional(),
  sourceType: z.string().optional(),
  theme: z.string().optional(),
  query: z.string().optional(),
  dateWindow: z.enum(['7d', 'week', 'month', 'year', 'all', 'custom']).optional(),
  customDays: z.number().int().min(1).max(3650).optional(),
  rankPosition: z.number().int().optional(),
  jobId: z.string().optional(),
  roleFamily: z.string().optional(),
  financeDomain: z.string().optional(),
  location: z.string().optional(),
  dwellMs: z.number().int().nonnegative().optional(),
  scrollDepth: z.number().int().min(0).max(100).optional(),
  referrer: z.string().optional(),
  createdAt: z.string(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export type CountPair = { key: string; count: number };
export type HighIntentPath = { path: string; avgDwellMs: number; sessions: number };

export type AnalyticsSummary = {
  sessions: number;
  totalSourceClicks: number;
  topItems: CountPair[];
  topSourceTypes: CountPair[];
  topThemes: CountPair[];
  topDateWindows: CountPair[];
  topJobs: CountPair[];
  averageScrollDepth: number;
  highIntentPaths: HighIntentPath[];
};

function increment(counts: Map<string, number>, key: string | undefined): void {
  if (!key) return;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function topPairs(counts: Map<string, number>): CountPair[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, 10);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function summarizeAnalyticsEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const sessions = new Set<string>();
  const itemClicks = new Map<string, number>();
  const sourceClicks = new Map<string, number>();
  const themeClicks = new Map<string, number>();
  const dateWindows = new Map<string, number>();
  const jobClicks = new Map<string, number>();
  const dwellByPath = new Map<string, number[]>();
  const scrollDepths: number[] = [];

  events.forEach((event) => {
    sessions.add(event.sessionId);
    if (event.eventType === 'source_click') {
      increment(itemClicks, event.itemId);
      increment(sourceClicks, event.sourceType);
      increment(themeClicks, event.theme);
    }
    if (event.eventType === 'filter_change') {
      increment(dateWindows, event.dateWindow);
    }
    if (event.eventType === 'job_click') {
      increment(jobClicks, event.jobId);
    }
    if (event.eventType === 'session_end') {
      const dwellValues = dwellByPath.get(event.path) ?? [];
      dwellValues.push(event.dwellMs ?? 0);
      dwellByPath.set(event.path, dwellValues);
      if (typeof event.scrollDepth === 'number') {
        scrollDepths.push(event.scrollDepth);
      }
    }
  });

  const highIntentPaths = [...dwellByPath.entries()]
    .map(([path, values]) => ({ path, avgDwellMs: average(values), sessions: values.length }))
    .filter((path) => path.avgDwellMs >= 15000)
    .sort((a, b) => b.avgDwellMs - a.avgDwellMs || a.path.localeCompare(b.path));

  return {
    sessions: sessions.size,
    totalSourceClicks: [...itemClicks.values()].reduce((total, count) => total + count, 0),
    topItems: topPairs(itemClicks),
    topSourceTypes: topPairs(sourceClicks),
    topThemes: topPairs(themeClicks),
    topDateWindows: topPairs(dateWindows),
    topJobs: topPairs(jobClicks),
    averageScrollDepth: average(scrollDepths),
    highIntentPaths,
  };
}
