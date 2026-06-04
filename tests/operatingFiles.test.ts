import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('closed-loop operating files', () => {
  it('defines AGENTS.md learning sections without a changelog section', () => {
    const content = readFileSync(join(root, 'AGENTS.md'), 'utf8');

    expect(content).toContain('## Current Learning');
    expect(content).toContain('## Jobs Intelligence Priorities');
    expect(content).toContain('## Experiment Backlog');
    expect(content).not.toContain('## Changelog');
  });

  it('ships ingestion, metrics, reflection, and job ledgers', () => {
    const requiredPaths = [
      'scripts/ingest_hf_datasets.py',
      'scripts/ingest_hf_models.py',
      'scripts/ingest_hf_papers.py',
      'scripts/ingest_kaggle.py',
      'scripts/ingest_jobs.py',
      'scripts/summarize_metrics.py',
      'scripts/drain_review_queue.py',
      'data/review_queue.tsv',
      'data/review_archive.tsv',
      'data/jobs_ledger.tsv',
      'data/analytics_events.tsv',
      'data/daily_reflections.tsv',
      'db/analytics_events.sql',
      'DEPLOYMENT.md',
      'vercel.json',
    ];

    expect(requiredPaths.every((path) => existsSync(join(root, path)))).toBe(true);
  });
});
