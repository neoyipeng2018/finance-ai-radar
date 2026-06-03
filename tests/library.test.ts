import { describe, expect, it } from 'vitest';
import { getEditorialMetrics, getFeaturedItems, getSourceCounts, getThemeBriefs, searchItems } from '../lib/library';
import { sourceItems } from '../data/sourceItems';

describe('curated library', () => {
  it('prioritizes reviewed finance AI items by score and impact', () => {
    const featured = getFeaturedItems(sourceItems, 4);

    expect(featured).toHaveLength(4);
    expect(featured.every((item) => item.reviewStatus === 'reviewed')).toBe(true);
    expect(featured[0].score).toBeGreaterThanOrEqual(featured[1].score);
    expect(featured.map((item) => item.id)).toContain('github-openbb-platform');
  });

  it('searches across title, source, theme, use case, and rationale', () => {
    const secResults = searchItems(sourceItems, { query: 'SEC filings', sourceType: 'all', theme: 'all' });
    const githubResults = searchItems(sourceItems, { query: '', sourceType: 'github', theme: 'all' });
    const agentResults = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'AI agents for analysts' });

    expect(secResults.map((item) => item.id)).toContain('github-sec-parser-agent');
    expect(githubResults).toHaveLength(4);
    expect(agentResults.length).toBeGreaterThan(2);
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
});
