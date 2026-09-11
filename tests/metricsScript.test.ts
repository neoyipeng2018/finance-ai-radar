import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const python = '/usr/bin/python3';
const script = join(process.cwd(), 'scripts/summarize_metrics.py');

function runMetrics(env: Record<string, string>): string {
  return execFileSync(python, [script], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

describe('metrics summarizer script', () => {
  it('keeps no-events snapshots distinct from database analytics failures', () => {
    const dir = mkdtempSync(join(tmpdir(), 'finance-ai-radar-metrics-'));
    try {
      const emptyEvents = join(dir, 'empty-events.tsv');
      const noEventsOutput = join(dir, 'no-events.json');
      writeFileSync(emptyEvents, 'event_type\tsession_id\tpath\titem_id\tsource_type\ttheme\tdate_window\tjob_id\tdwell_ms\tscroll_depth\n');

      const noEventsStdout = runMetrics({
        ANALYTICS_EVENTS_TSV: emptyEvents,
        DAILY_METRICS_OUTPUT: noEventsOutput,
        DATABASE_URL: '',
      });
      const noEventsFile = readFileSync(noEventsOutput, 'utf8');

      expect(noEventsStdout).toContain('"status": "no_events"');
      expect(noEventsFile).toContain('"source": "tsv"');
      expect(noEventsFile).toContain('"sessions": 0');
      expect(noEventsFile).toContain('"top_items": []');

      const dbFailureOutput = join(dir, 'db-failure.json');
      const dbFailureStdout = runMetrics({
        DAILY_METRICS_OUTPUT: dbFailureOutput,
        DATABASE_URL: 'postgres://example.invalid/finance_ai_radar',
        PATH: '',
      });
      const dbFailureFile = readFileSync(dbFailureOutput, 'utf8');

      expect(dbFailureStdout).toContain('"status": "analytics_error"');
      expect(dbFailureFile).toContain('"source": "database"');
      expect(dbFailureFile).toContain('"error": "psql not found"');
      expect(dbFailureFile).toContain('"sessions": 0');
      expect(dbFailureFile).toContain('"high_intent_paths": []');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ignores malformed local dwell and scroll values without dropping valid events', () => {
    const dir = mkdtempSync(join(tmpdir(), 'finance-ai-radar-metrics-'));
    try {
      const events = join(dir, 'events.tsv');
      const output = join(dir, 'metrics.json');
      writeFileSync(
        events,
        [
          'event_type\tsession_id\tpath\titem_id\tsource_type\ttheme\tdate_window\tjob_id\tdwell_ms\tscroll_depth',
          'source_click\tsession-1\t/datasets\tdataset-sec-edgar\tdataset\tPublic-domain finance text\t\t\t\t',
          'session_end\tsession-1\t/datasets\t\t\t\t\t\tbad\t-10',
          'session_end\tsession-2\t/jobs\t\t\t\t\t\t1000\t250',
        ].join('\n'),
      );

      const stdout = runMetrics({
        ANALYTICS_EVENTS_TSV: events,
        DAILY_METRICS_OUTPUT: output,
        DATABASE_URL: '',
      });
      const metrics = readFileSync(output, 'utf8');

      expect(stdout).toContain('"status": "ok"');
      expect(stdout).toContain('"source": "tsv"');
      expect(stdout).toContain('"sessions": 2');
      expect(metrics).toContain('"dataset-sec-edgar"');
      expect(metrics).toContain('"average_scroll_depth": 50');
      expect(metrics).toContain('"high_intent_paths": []');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
