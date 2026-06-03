import { describe, expect, it } from 'vitest';
import { sourceItems } from '../data/sourceItems';
import { getDatasetCoverage, getHuggingFaceCoverage, getJobsCoverage, getSourceCounts, searchItems, sourceLabel } from '../lib/library';

describe('datasets and jobs intelligence', () => {
  it('publishes reviewed public finance NLP datasets with license and leakage posture', () => {
    const datasets = getDatasetCoverage(sourceItems);
    const counts = getSourceCounts(sourceItems);

    expect(counts.kaggle).toBeGreaterThanOrEqual(1);
    expect(counts.huggingface_dataset).toBeGreaterThanOrEqual(2);
    expect(counts.regulator).toBeGreaterThanOrEqual(1);
    expect(datasets.reviewed).toBeGreaterThanOrEqual(5);
    expect(datasets.withLeakageRisks).toBe(datasets.reviewed);
    expect(sourceLabel('huggingface_dataset')).toBe('Hugging Face dataset');
  });

  it('tracks AI plus finance jobs as demand-side intelligence', () => {
    const jobs = getJobsCoverage(sourceItems);
    const jobResults = searchItems(sourceItems, { query: 'financial NLP engineer', sourceType: 'job', theme: 'all' });

    expect(jobs.reviewed).toBeGreaterThanOrEqual(3);
    expect(jobs.roleFamilies).toContain('quant');
    expect(jobs.roleFamilies).toContain('risk');
    expect(jobResults.length).toBeGreaterThan(0);
    expect(jobResults.every((item) => item.jobFields)).toBe(true);
  });

  it('adds Hugging Face models and papers as first-class finance AI sources', () => {
    const counts = getSourceCounts(sourceItems);
    const coverage = getHuggingFaceCoverage(sourceItems);
    const modelResults = searchItems(sourceItems, { query: 'FinBERT', sourceType: 'huggingface_model', theme: 'all' });
    const paperResults = searchItems(sourceItems, { query: 'FinGPT', sourceType: 'huggingface_paper', theme: 'all' });

    expect(counts.huggingface_model).toBeGreaterThanOrEqual(2);
    expect(counts.huggingface_paper).toBeGreaterThanOrEqual(2);
    expect(coverage.reviewedModels).toBeGreaterThanOrEqual(2);
    expect(coverage.reviewedPapers).toBeGreaterThanOrEqual(2);
    expect(coverage.modelFamilies).toContain('FinBERT');
    expect(sourceLabel('huggingface_model')).toBe('Hugging Face model');
    expect(sourceLabel('huggingface_paper')).toBe('Hugging Face paper');
    expect(modelResults.length).toBeGreaterThan(0);
    expect(paperResults.length).toBeGreaterThan(0);
  });
});
