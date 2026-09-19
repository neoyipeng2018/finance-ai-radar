import { z } from 'zod';
import type { ContentItem, ReviewStatus, SourceType } from './types';

export const ReviewCandidateSchema = z.object({
  candidateId: z.string().min(4),
  sourceType: z.enum(['arxiv', 'ssrn', 'reddit', 'news', 'blog', 'github', 'broker', 'expert_call', 'dataset', 'kaggle', 'huggingface_dataset', 'huggingface_model', 'huggingface_paper', 'regulator', 'job', 'tool']),
  title: z.string().min(8),
  url: z.string().url(),
  publisher: z.string().min(2),
  discoveredAt: z.string().min(10),
  relevanceReason: z.string().min(20),
  licenseGuess: z.string().min(3),
  status: z.enum(['candidate', 'triaged', 'reviewed', 'published', 'rejected']),
  reviewerNotes: z.string(),
});

export type ReviewCandidate = z.infer<typeof ReviewCandidateSchema>;

export type ReviewCandidateRow = {
  candidate_id: string;
  source_type: string;
  title: string;
  url: string;
  publisher: string;
  discovered_at: string;
  relevance_reason: string;
  license_guess: string;
  status: string;
  reviewer_notes: string;
};

export type ReviewQueueSummary = {
  total: number;
  byStatus: Record<ReviewStatus, number>;
  bySourceType: Partial<Record<SourceType, number>>;
  staleBySourceType: Partial<Record<SourceType, number>>;
  staleCandidates: number;
  staleCandidateShare: number;
  nearArchiveCandidates: number;
  oldestCandidateAgeDays: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const statusPriority: Record<ReviewStatus, number> = {
  candidate: 0,
  triaged: 1,
  reviewed: 2,
  published: 3,
  rejected: 4,
};

export function candidateAgeDays(candidate: ReviewCandidate, now: Date): number {
  const discoveredAt = new Date(candidate.discoveredAt).getTime();
  if (Number.isNaN(discoveredAt)) return 0;
  return Math.max(0, Math.floor((now.getTime() - discoveredAt) / MS_PER_DAY));
}

export function sortReviewCandidatesForTriage(candidates: ReviewCandidate[], now: Date): ReviewCandidate[] {
  return [...candidates].sort((first, second) => {
    const statusDelta = statusPriority[first.status] - statusPriority[second.status];
    if (statusDelta !== 0) return statusDelta;
    const ageDelta = candidateAgeDays(second, now) - candidateAgeDays(first, now);
    if (ageDelta !== 0) return ageDelta;
    return first.title.localeCompare(second.title);
  });
}

export function rowToReviewCandidate(row: ReviewCandidateRow): ReviewCandidate {
  return ReviewCandidateSchema.parse({
    candidateId: row.candidate_id,
    sourceType: row.source_type,
    title: row.title,
    url: row.url,
    publisher: row.publisher,
    discoveredAt: row.discovered_at,
    relevanceReason: row.relevance_reason,
    licenseGuess: row.license_guess,
    status: row.status,
    reviewerNotes: row.reviewer_notes,
  });
}

export function parseReviewCandidateRows(rows: ReviewCandidateRow[]): ReviewCandidate[] {
  const ids = new Set<string>();
  return rows.map((row) => {
    if (ids.has(row.candidate_id)) {
      throw new Error(`Duplicate candidate id: ${row.candidate_id}`);
    }
    ids.add(row.candidate_id);
    return rowToReviewCandidate(row);
  });
}

export function isPublishable(candidate: ReviewCandidate): boolean {
  return candidate.status === 'reviewed' || candidate.status === 'published';
}

export function reviewCandidateToContentDraft(candidate: ReviewCandidate): ContentItem {
  if (!isPublishable(candidate)) {
    throw new Error(`Candidate ${candidate.candidateId} is not publishable`);
  }
  return {
    id: candidate.candidateId,
    sourceType: candidate.sourceType,
    title: candidate.title,
    url: candidate.url,
    publisher: candidate.publisher,
    publishedAt: candidate.discoveredAt.slice(0, 10),
    summary: candidate.relevanceReason,
    whyItMatters: candidate.relevanceReason,
    financeUseCase: 'Review-derived finance AI candidate',
    aiTechnique: 'To be classified during publication review',
    themes: ['AI agents for analysts'],
    audience: ['analyst'],
    maturity: candidate.sourceType === 'job' ? 'hiring_signal' : 'research',
    score: 60,
    evidenceQuality: 'medium',
    licenseNote: candidate.licenseGuess,
    riskOrCaveat: candidate.reviewerNotes || 'Requires final editorial review before homepage promotion.',
    reviewStatus: candidate.status,
    readingTimeMinutes: 5,
  };
}

export function summarizeReviewQueue(candidates: ReviewCandidate[], now: Date): ReviewQueueSummary {
  const byStatus: Record<ReviewStatus, number> = {
    candidate: 0,
    triaged: 0,
    reviewed: 0,
    published: 0,
    rejected: 0,
  };
  const bySourceType: Partial<Record<SourceType, number>> = {};
  const staleBySourceType: Partial<Record<SourceType, number>> = {};
  const staleThresholdMs = 7 * MS_PER_DAY;
  let staleCandidates = 0;
  let nearArchiveCandidates = 0;
  let oldestCandidateAgeDays = 0;
  candidates.forEach((candidate) => {
    byStatus[candidate.status] += 1;
    bySourceType[candidate.sourceType] = (bySourceType[candidate.sourceType] ?? 0) + 1;
    const ageMs = now.getTime() - new Date(candidate.discoveredAt).getTime();
    const ageDays = candidateAgeDays(candidate, now);
    oldestCandidateAgeDays = Math.max(oldestCandidateAgeDays, ageDays);
    if ((candidate.status === 'candidate' || candidate.status === 'triaged') && ageDays >= 21) {
      nearArchiveCandidates += 1;
    }
    if ((candidate.status === 'candidate' || candidate.status === 'triaged') && ageMs > staleThresholdMs) {
      staleCandidates += 1;
      staleBySourceType[candidate.sourceType] = (staleBySourceType[candidate.sourceType] ?? 0) + 1;
    }
  });
  const staleCandidateShare = candidates.length === 0 ? 0 : Math.round((staleCandidates / candidates.length) * 100);
  return { total: candidates.length, byStatus, bySourceType, staleBySourceType, staleCandidates, staleCandidateShare, nearArchiveCandidates, oldestCandidateAgeDays };
}
