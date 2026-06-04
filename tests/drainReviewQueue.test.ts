import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const header = 'candidate_id\tsource_type\ttitle\turl\tpublisher\tdiscovered_at\trelevance_reason\tlicense_guess\tstatus\treviewer_notes';

function row(candidateId: string, url: string, discoveredAt: string, status: string): string {
  return [
    candidateId,
    'dataset',
    `Title for ${candidateId}`,
    url,
    'Example',
    discoveredAt,
    'This candidate is relevant enough for finance AI review.',
    'Public metadata only',
    status,
    'Needs review',
  ].join('\t');
}

function runDrain(root: string, queue: string, archive: string, ledger: string, sourceItems: string): string {
  return execFileSync('python3', [
    join(root, 'scripts', 'drain_review_queue.py'),
    '--queue', queue,
    '--archive', archive,
    '--ledger', ledger,
    '--source-items', sourceItems,
    '--stale-days', '30',
    '--run-id', 'test-run',
  ], { encoding: 'utf8' });
}

describe('review queue drain script', () => {
  it('archives published rejected duplicate and stale rows while keeping active candidates', () => {
    const projectRoot = process.cwd();
    const dir = mkdtempSync(join(tmpdir(), 'finance-ai-radar-drain-'));
    const queue = join(dir, 'review_queue.tsv');
    const archive = join(dir, 'review_archive.tsv');
    const ledger = join(dir, 'source_ledger.tsv');
    const sourceItems = join(dir, 'sourceItems.ts');

    writeFileSync(ledger, 'item_id\turl\nledger-match\thttps://example.com/already-published\n');
    writeFileSync(sourceItems, "export const sourceItems = [{ id: 'source-match', url: 'https://example.com/source-item' }];\n");
    writeFileSync(queue, [
      header,
      row('active-candidate', 'https://example.com/active', '2026-06-01T00:00:00.000Z', 'candidate'),
      row('published-status', 'https://example.com/published-status', '2026-06-01T00:00:00.000Z', 'published'),
      row('rejected-status', 'https://example.com/rejected-status', '2026-06-01T00:00:00.000Z', 'rejected'),
      row('ledger-match', 'https://example.com/already-published', '2026-06-01T00:00:00.000Z', 'candidate'),
      row('stale-candidate', 'https://example.com/stale', '2026-01-01T00:00:00.000Z', 'candidate'),
      row('dup-candidate', 'https://example.com/dup-one', '2026-06-01T00:00:00.000Z', 'candidate'),
      row('dup-candidate', 'https://example.com/dup-two', '2026-06-01T00:00:00.000Z', 'candidate'),
    ].join('\n'));

    const output = runDrain(projectRoot, queue, archive, ledger, sourceItems);
    const activeQueue = readFileSync(queue, 'utf8');
    const archivedRows = readFileSync(archive, 'utf8');

    expect(output).toContain('queue_before=7');
    expect(output).toContain('queue_after=2');
    expect(output).toContain('archived=5');
    expect(activeQueue).toContain('active-candidate');
    expect(activeQueue).toContain('dup-one');
    expect(activeQueue).not.toContain('published-status');
    expect(archivedRows).toContain('drained_at');
    expect(archivedRows).toContain('drain_reason');
    expect(archivedRows).toContain('drain_run_id');
    expect(archivedRows).toContain('status_published');
    expect(archivedRows).toContain('status_rejected');
    expect(archivedRows).toContain('already_in_source_library');
    expect(archivedRows).toContain('stale_gt_30_days');
    expect(archivedRows).toContain('duplicate_candidate_id');
  });

  it('does not duplicate archive rows on repeated runs', () => {
    const projectRoot = process.cwd();
    const dir = mkdtempSync(join(tmpdir(), 'finance-ai-radar-drain-idempotent-'));
    const queue = join(dir, 'review_queue.tsv');
    const archive = join(dir, 'review_archive.tsv');
    const ledger = join(dir, 'source_ledger.tsv');
    const sourceItems = join(dir, 'sourceItems.ts');

    writeFileSync(ledger, 'item_id\turl\n');
    writeFileSync(sourceItems, 'export const sourceItems = [];\n');
    writeFileSync(queue, [
      header,
      row('published-status', 'https://example.com/published-status', '2026-06-01T00:00:00.000Z', 'published'),
    ].join('\n'));

    runDrain(projectRoot, queue, archive, ledger, sourceItems);
    runDrain(projectRoot, queue, archive, ledger, sourceItems);
    const archivedRows = readFileSync(archive, 'utf8').trim().split('\n');

    expect(archivedRows).toHaveLength(2);
  });
});
