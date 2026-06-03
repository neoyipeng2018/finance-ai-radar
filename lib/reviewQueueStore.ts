import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseReviewCandidateRows, summarizeReviewQueue, type ReviewCandidate, type ReviewCandidateRow, type ReviewQueueSummary } from './reviewQueue';
import type { ReviewStatus, SourceType } from './types';

const headers = ['candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at', 'relevance_reason', 'license_guess', 'status', 'reviewer_notes'] as const;

function parseLine(line: string): ReviewCandidateRow {
  const values = line.split('\t');
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  return {
    candidate_id: row.candidate_id,
    source_type: row.source_type as SourceType,
    title: row.title,
    url: row.url,
    publisher: row.publisher,
    discovered_at: row.discovered_at,
    relevance_reason: row.relevance_reason,
    license_guess: row.license_guess,
    status: row.status as ReviewStatus,
    reviewer_notes: row.reviewer_notes,
  };
}

export function parseReviewQueueTsv(tsv: string): ReviewCandidate[] {
  const lines = tsv.trim().split('\n').filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];
  return parseReviewCandidateRows(lines.slice(1).map(parseLine));
}

export function getReviewCandidates(path = join(process.cwd(), 'data', 'review_queue.tsv')): ReviewCandidate[] {
  if (!existsSync(path)) return [];
  return parseReviewQueueTsv(readFileSync(path, 'utf8'));
}

export function reviewQueueSummary(candidates: ReviewCandidate[], now = new Date()): ReviewQueueSummary {
  return summarizeReviewQueue(candidates, now);
}
