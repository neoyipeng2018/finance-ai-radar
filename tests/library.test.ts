import { describe, expect, it } from 'vitest';
import { daysForWindow, getEditorialMetrics, getFeaturedItems, getSourceCounts, getThemeBriefs, isWithinDateWindow, searchItems } from '../lib/library';
import { sourceItems } from '../data/sourceItems';

describe('curated library', () => {
  it('prioritizes reviewed finance AI items by score, impact, and current freshness', () => {
    const now = new Date('2026-06-04T00:00:00.000Z');
    const featured = getFeaturedItems(sourceItems, 4, now);

    expect(featured).toHaveLength(4);
    expect(featured.every((item) => item.reviewStatus === 'reviewed')).toBe(true);
    expect(featured.every((item) => isWithinDateWindow(item.publishedAt, 'custom', 30, now))).toBe(true);
    expect(featured[0].score).toBeGreaterThanOrEqual(featured[1].score);
    expect(featured.map((item) => item.id)).toContain('arxiv-ktd-fin-memory-controlled-trading-agents');
    expect(featured.map((item) => item.id)).toContain('github-openbb-platform');
    expect(featured.map((item) => item.id)).not.toContain('arxiv-fingpt');
  });

  it('searches across title, source, theme, use case, and rationale', () => {
    const secResults = searchItems(sourceItems, { query: 'SEC filings', sourceType: 'all', theme: 'all', dateWindow: 'all' });
    const githubResults = searchItems(sourceItems, { query: '', sourceType: 'github', theme: 'all', dateWindow: 'all' });
    const agentResults = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'AI agents for analysts', dateWindow: 'all' });
    const memoryTradingResults = searchItems(sourceItems, { query: 'memory-controlled benchmark', sourceType: 'arxiv', theme: 'all', dateWindow: 'month' }, new Date('2026-06-04T00:00:00.000Z'));

    expect(secResults.map((item) => item.id)).toContain('github-sec-parser-agent');
    expect(githubResults).toHaveLength(4);
    expect(agentResults.length).toBeGreaterThan(2);
    expect(memoryTradingResults.map((item) => item.id)).toContain('arxiv-ktd-fin-memory-controlled-trading-agents');
  });

  it('computes source counts and theme briefs for navigation', () => {
    const counts = getSourceCounts(sourceItems);
    const themes = getThemeBriefs(sourceItems);

    expect(counts.github).toBe(4);
    expect(counts.arxiv).toBeGreaterThan(0);
    expect(themes[0].items).toBeGreaterThanOrEqual(themes[1].items);
    expect(themes.map((theme) => theme.name)).toContain('LLMs for equity research');
  });

  it('summarizes editorial quality, rights posture, and coverage gaps', () => {
    const metrics = getEditorialMetrics(sourceItems);

    expect(metrics.reviewedCoverage).toBe(100);
    expect(metrics.rightsSafeItems).toBe(sourceItems.length);
    expect(metrics.highEvidenceItems).toBeGreaterThan(4);
    expect(metrics.sourceDiversity).toBeGreaterThanOrEqual(9);
    expect(metrics.coverageGaps).not.toContain('Credit underwriting');
    expect(metrics.nextBestSource).toBe('More primary-source expert calls with publication rights');
  });

  it('has enough reviewed credit underwriting coverage to remove it from gap status', () => {
    const creditItems = sourceItems.filter((item) => item.themes.includes('Credit underwriting'));
    const metrics = getEditorialMetrics(sourceItems);

    expect(creditItems.length).toBeGreaterThanOrEqual(3);
    expect(creditItems.every((item) => item.reviewStatus === 'reviewed')).toBe(true);
    expect(creditItems.some((item) => item.sourceType === 'news')).toBe(true);
    expect(creditItems.some((item) => item.sourceType === 'blog')).toBe(true);
    expect(metrics.coverageGaps).not.toContain('Credit underwriting');
  });

  it('filters library results by freshness windows and custom days', () => {
    const now = new Date('2026-06-30T00:00:00.000Z');
    const monthResults = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'all', dateWindow: 'month' }, now);
    const allResults = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'all', dateWindow: 'all' }, now);
    const customResults = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'all', dateWindow: 'custom', customDays: 3650 }, now);

    expect(daysForWindow('7d')).toBe(7);
    expect(daysForWindow('week')).toBe(7);
    expect(daysForWindow('month')).toBe(30);
    expect(daysForWindow('year')).toBe(365);
    expect(daysForWindow('all')).toBeNull();
    expect(daysForWindow('custom', 0)).toBe(1);
    expect(daysForWindow('custom', 4000)).toBe(3650);
    expect(monthResults.every((item) => isWithinDateWindow(item.publishedAt, 'month', undefined, now))).toBe(true);
    expect(allResults.length).toBeGreaterThanOrEqual(monthResults.length);
    expect(customResults).toHaveLength(allResults.length);
  });
});
