'use client';

import { useMemo, useState } from 'react';
import { ContentCard } from './ContentCard';
import { sendAnalyticsEvent } from './AnalyticsTracker';
import { getAllThemes, searchItems, sourceLabel } from '../lib/library';
import type { ContentItem, DateWindow, SourceType } from '../lib/types';

const sourceTypes: Array<SourceType | 'all'> = ['all', 'github', 'arxiv', 'ssrn', 'reddit', 'news', 'blog', 'broker', 'expert_call', 'dataset', 'kaggle', 'huggingface_dataset', 'huggingface_model', 'huggingface_paper', 'regulator', 'job', 'tool'];

const dateWindows: Array<{ value: DateWindow; label: string }> = [
  { value: 'month', label: 'Past month' },
  { value: '7d', label: 'Past 7 days' },
  { value: 'week', label: 'Past week' },
  { value: 'year', label: 'Past year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Past X days' },
];

function labelSource(value: SourceType | 'all') {
  return value === 'all' ? 'All sources' : sourceLabel(value);
}

function labelDateWindow(value: DateWindow, customDays: number): string {
  if (value === 'custom') return `Past ${customDays} days`;
  return dateWindows.find((window) => window.value === value)?.label ?? 'All time';
}

export function LibraryExplorer({ items }: { items: ContentItem[] }) {
  const [query, setQuery] = useState('');
  const [sourceType, setSourceType] = useState<SourceType | 'all'>('all');
  const [theme, setTheme] = useState<string | 'all'>('all');
  const [dateWindow, setDateWindow] = useState<DateWindow>('month');
  const [customDays, setCustomDays] = useState(30);
  const themes = useMemo(() => getAllThemes(items), [items]);
  const results = useMemo(() => searchItems(items, { query, sourceType, theme, dateWindow, customDays }), [items, query, sourceType, theme, dateWindow, customDays]);

  return (
    <section className="section" id="library">
      <div className="section-head">
        <div>
          <div className="eyebrow">Searchable signal library</div>
          <h2>Find the useful needle faster.</h2>
        </div>
        <p>{results.length} curated items after filters · {labelDateWindow(dateWindow, customDays)}. Each card includes source, use case, why-it-matters, caveat, score, and license posture.</p>
      </div>
      <div className="filters">
        <input
          className="input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            sendAnalyticsEvent({ eventType: 'filter_change', query: event.target.value, sourceType, theme, dateWindow, customDays });
          }}
          placeholder="Search SEC filings, jobs, datasets, compliance, sentiment…"
        />
        <select
          className="select"
          value={sourceType}
          onChange={(event) => {
            const next = event.target.value as SourceType | 'all';
            setSourceType(next);
            sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType: next, theme, dateWindow, customDays });
          }}
        >
          {sourceTypes.map((value) => <option key={value} value={value}>{labelSource(value)}</option>)}
        </select>
        <select
          className="select"
          value={theme}
          onChange={(event) => {
            setTheme(event.target.value);
            sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType, theme: event.target.value, dateWindow, customDays });
          }}
        >
          <option value="all">All themes</option>
          {themes.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select
          className="select"
          value={dateWindow}
          onChange={(event) => {
            const next = event.target.value as DateWindow;
            setDateWindow(next);
            sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType, theme, dateWindow: next, customDays });
          }}
        >
          {dateWindows.map((window) => <option key={window.value} value={window.value}>{window.label}</option>)}
        </select>
        {dateWindow === 'custom' ? (
          <input
            className="input compact-input"
            type="number"
            min={1}
            max={3650}
            value={customDays}
            onChange={(event) => {
              const next = Math.min(3650, Math.max(1, Number(event.target.value) || 30));
              setCustomDays(next);
              sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType, theme, dateWindow, customDays: next });
            }}
            aria-label="Custom freshness window in days"
          />
        ) : null}
      </div>
      <div className="library-list">
        {results.length > 0 ? results.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />) : (
          <div className="empty-state">
            <strong>No recent matches for this filter set.</strong>
            <span>Switch the freshness window to all time or broaden the source/theme filters to inspect evergreen items.</span>
          </div>
        )}
      </div>
    </section>
  );
}
