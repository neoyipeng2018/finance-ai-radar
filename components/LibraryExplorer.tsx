'use client';

import { useMemo, useState } from 'react';
import { ContentCard } from './ContentCard';
import { sendAnalyticsEvent } from './AnalyticsTracker';
import { getAllThemes, searchItems, sourceLabel } from '../lib/library';
import type { ContentItem, SourceType } from '../lib/types';

const sourceTypes: Array<SourceType | 'all'> = ['all', 'github', 'arxiv', 'ssrn', 'reddit', 'news', 'blog', 'broker', 'expert_call', 'dataset', 'kaggle', 'huggingface_dataset', 'huggingface_model', 'huggingface_paper', 'regulator', 'job', 'tool'];

function labelSource(value: SourceType | 'all') {
  return value === 'all' ? 'All sources' : sourceLabel(value);
}

export function LibraryExplorer({ items }: { items: ContentItem[] }) {
  const [query, setQuery] = useState('');
  const [sourceType, setSourceType] = useState<SourceType | 'all'>('all');
  const [theme, setTheme] = useState<string | 'all'>('all');
  const themes = useMemo(() => getAllThemes(items), [items]);
  const results = useMemo(() => searchItems(items, { query, sourceType, theme }), [items, query, sourceType, theme]);

  return (
    <section className="section" id="library">
      <div className="section-head">
        <div>
          <div className="eyebrow">Searchable signal library</div>
          <h2>Find the useful needle faster.</h2>
        </div>
        <p>{results.length} curated items after filters. Each card includes source, use case, why-it-matters, caveat, score, and license posture.</p>
      </div>
      <div className="filters">
        <input
          className="input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            sendAnalyticsEvent({ eventType: 'filter_change', query: event.target.value, sourceType, theme });
          }}
          placeholder="Search SEC filings, jobs, datasets, compliance, sentiment…"
        />
        <select
          className="select"
          value={sourceType}
          onChange={(event) => {
            const next = event.target.value as SourceType | 'all';
            setSourceType(next);
            sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType: next, theme });
          }}
        >
          {sourceTypes.map((value) => <option key={value} value={value}>{labelSource(value)}</option>)}
        </select>
        <select
          className="select"
          value={theme}
          onChange={(event) => {
            setTheme(event.target.value);
            sendAnalyticsEvent({ eventType: 'filter_change', query, sourceType, theme: event.target.value });
          }}
        >
          <option value="all">All themes</option>
          {themes.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="library-list">
        {results.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}
      </div>
    </section>
  );
}
