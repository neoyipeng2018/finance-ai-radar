import { describe, expect, it } from 'vitest';
import { AnalyticsEventSchema, summarizeAnalyticsEvents } from '../lib/analytics';

describe('analytics loop', () => {
  it('accepts useful first-party learning events and rejects invalid scroll values', () => {
    const event = AnalyticsEventSchema.parse({
      eventType: 'job_click',
      anonymousId: 'anon-123456',
      sessionId: 'session-123456',
      path: '/jobs',
      jobId: 'job-openai-finance',
      roleFamily: 'research',
      financeDomain: 'banking',
      location: 'Singapore',
      createdAt: '2026-06-03T00:00:00.000Z',
    });

    expect(event.eventType).toBe('job_click');
    expect(AnalyticsEventSchema.safeParse({ ...event, scrollDepth: 120 }).success).toBe(false);
  });

  it('accepts freshness filter analytics and summarizes selected windows', () => {
    const event = AnalyticsEventSchema.parse({
      eventType: 'filter_change',
      anonymousId: 'anon-123456',
      sessionId: 'session-123456',
      path: '/',
      query: 'sentiment',
      sourceType: 'all',
      theme: 'all',
      dateWindow: 'custom',
      customDays: 45,
      createdAt: '2026-06-03T00:00:00.000Z',
    });
    const summary = summarizeAnalyticsEvents([event]);

    expect(event.dateWindow).toBe('custom');
    expect(summary.topDateWindows[0]).toEqual({ key: 'custom', count: 1 });
    expect(AnalyticsEventSchema.safeParse({ ...event, customDays: 4000 }).success).toBe(false);
  });

  it('summarizes clicks, themes, dwell time, scroll depth, and jobs from event rows', () => {
    const summary = summarizeAnalyticsEvents([
      {
        eventType: 'source_click',
        anonymousId: 'anon-1',
        sessionId: 'session-1',
        path: '/',
        itemId: 'dataset-sec-edgar',
        sourceType: 'dataset',
        theme: 'Public-domain finance text',
        createdAt: '2026-06-03T00:00:00.000Z',
      },
      {
        eventType: 'job_click',
        anonymousId: 'anon-1',
        sessionId: 'session-1',
        path: '/jobs',
        jobId: 'job-financial-nlp-engineer',
        roleFamily: 'engineering',
        financeDomain: 'research automation',
        location: 'Singapore',
        createdAt: '2026-06-03T00:01:00.000Z',
      },
      {
        eventType: 'session_end',
        anonymousId: 'anon-1',
        sessionId: 'session-1',
        path: '/',
        dwellMs: 21000,
        scrollDepth: 82,
        createdAt: '2026-06-03T00:02:00.000Z',
      },
    ]);

    expect(summary.sessions).toBe(1);
    expect(summary.totalSourceClicks).toBe(1);
    expect(summary.topThemes[0]?.key).toBe('Public-domain finance text');
    expect(summary.topJobs[0]?.key).toBe('job-financial-nlp-engineer');
    expect(summary.averageScrollDepth).toBe(82);
    expect(summary.highIntentPaths[0]?.path).toBe('/');
  });
});
