import { describe, expect, it } from 'vitest';
import { getReviewCandidates, reviewQueueSummary } from '../lib/reviewQueueStore';
import { isPublishable, parseReviewCandidateRows, reviewCandidateToContentDraft } from '../lib/reviewQueue';

describe('review queue', () => {
  it('loads candidate rows and keeps unreviewed items out of publishable content', () => {
    const candidates = getReviewCandidates();
    const queueSummary = reviewQueueSummary(candidates);

    expect(queueSummary.total).toBe(candidates.length);
    expect(queueSummary.byStatus.candidate).toBe(candidates.filter((candidate) => candidate.status === 'candidate').length);
    expect(queueSummary.bySourceType.huggingface_model).toBe(candidates.filter((candidate) => candidate.sourceType === 'huggingface_model').length || undefined);
    expect(candidates.every((candidate) => candidate.licenseGuess.trim().length > 0)).toBe(true);
    expect(candidates.every((candidate) => candidate.relevanceReason.length >= 20)).toBe(true);
    expect(candidates.filter(isPublishable)).toHaveLength(0);
  });

  it('rejects duplicate candidate ids and publishable candidates missing review posture', () => {
    const rows = [
      {
        candidate_id: 'dup-candidate',
        source_type: 'arxiv',
        title: 'Financial NLP benchmark candidate',
        url: 'https://example.com/a',
        publisher: 'Example',
        discovered_at: '2026-06-03T00:00:00.000Z',
        relevance_reason: 'A relevant finance NLP candidate for queue validation.',
        license_guess: 'Public metadata only',
        status: 'candidate',
        reviewer_notes: 'Needs review',
      },
      {
        candidate_id: 'dup-candidate',
        source_type: 'blog',
        title: 'Duplicate candidate',
        url: 'https://example.com/b',
        publisher: 'Example',
        discovered_at: '2026-06-03T00:00:00.000Z',
        relevance_reason: 'A duplicate candidate should fail parser validation.',
        license_guess: 'Public metadata only',
        status: 'candidate',
        reviewer_notes: 'Needs review',
      },
    ];

    expect(() => parseReviewCandidateRows(rows)).toThrow(/duplicate/i);
  });

  it('accepts concise SPDX-style license guesses from ingestion candidates', () => {
    const [candidate] = parseReviewCandidateRows([
      {
        candidate_id: 'hf-mit-license-candidate',
        source_type: 'huggingface_dataset',
        title: 'MIT-licensed financial sentiment dataset',
        url: 'https://huggingface.co/datasets/example/finance-sentiment',
        publisher: 'Example',
        discovered_at: '2026-06-03T00:00:00.000Z',
        relevance_reason: 'A relevant finance sentiment dataset candidate with a concise SPDX license token.',
        license_guess: 'mit',
        status: 'candidate',
        reviewer_notes: 'Needs source provenance and leakage review.',
      },
    ]);

    expect(candidate.licenseGuess).toBe('mit');
  });

  it('summarizes candidate source types for review triage', () => {
    const candidates = parseReviewCandidateRows([
      {
        candidate_id: 'hf-model-source-summary',
        source_type: 'huggingface_model',
        title: 'Finance language model source summary candidate',
        url: 'https://huggingface.co/example/finance-model',
        publisher: 'Example',
        discovered_at: '2026-07-25T00:00:00.000Z',
        relevance_reason: 'A relevant finance model candidate for source-type review summary validation.',
        license_guess: 'apache-2.0',
        status: 'candidate',
        reviewer_notes: 'Needs model-risk review.',
      },
      {
        candidate_id: 'arxiv-source-summary',
        source_type: 'arxiv',
        title: 'Finance agent paper source summary candidate',
        url: 'https://arxiv.org/abs/2607.00001',
        publisher: 'arXiv',
        discovered_at: '2026-07-25T00:00:00.000Z',
        relevance_reason: 'A relevant finance agent paper candidate for source-type review summary validation.',
        license_guess: 'arXiv public abstract metadata only',
        status: 'candidate',
        reviewer_notes: 'Needs reproducibility review.',
      },
    ]);

    const summary = reviewQueueSummary(candidates);

    expect(summary.bySourceType.huggingface_model).toBe(1);
    expect(summary.bySourceType.arxiv).toBe(1);
    expect(summary.bySourceType.github).toBeUndefined();
  });

  it('converts reviewed queue rows into content drafts with required license and caveat fields', () => {
    const [candidate] = parseReviewCandidateRows([
      {
        candidate_id: 'reviewed-fred-nlp',
        source_type: 'dataset',
        title: 'FRED macro series for finance NLP context',
        url: 'https://fred.stlouisfed.org/',
        publisher: 'Federal Reserve Bank of St. Louis',
        discovered_at: '2026-06-03T00:00:00.000Z',
        relevance_reason: 'Macro time series can contextualize finance narrative models.',
        license_guess: 'Public source with attribution',
        status: 'reviewed',
        reviewer_notes: 'Strong public macro context source.',
      },
    ]);

    const draft = reviewCandidateToContentDraft(candidate);

    expect(isPublishable(candidate)).toBe(true);
    expect(draft.reviewStatus).toBe('reviewed');
    expect(draft.licenseNote).toContain('Public source');
    expect(draft.riskOrCaveat.length).toBeGreaterThan(10);
  });
});
