import { describe, expect, it } from 'vitest';
import { sourceItems } from '../data/sourceItems';
import { getDatasetCoverage, getHuggingFaceCoverage, getJobsCoverage, getSourceCounts, getTopClickedDataset, getTopClickedJob, getTopClickedSourceType, searchItems, sourceLabel } from '../lib/library';

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

  it('selects a reviewed dataset when source-click metrics point to one', () => {
    const dataset = getTopClickedDataset(sourceItems, [['dataset-sec-edgar', 1], ['job-financial-nlp-engineer-reviewed', 1]]);

    expect(dataset?.id).toBe('dataset-sec-edgar');
    expect(dataset?.licenseNote).toContain('Public government source');
    expect(getTopClickedDataset(sourceItems, [['job-financial-nlp-engineer-reviewed', 1]])).toBeUndefined();
  });

  it('tracks AI plus finance jobs as demand-side intelligence', () => {
    const jobs = getJobsCoverage(sourceItems);
    const jobResults = searchItems(sourceItems, { query: 'financial NLP engineer', sourceType: 'job', theme: 'all', dateWindow: 'all' });

    expect(jobs.reviewed).toBeGreaterThanOrEqual(3);
    expect(jobs.roleFamilies).toContain('quant');
    expect(jobs.roleFamilies).toContain('risk');
    expect(jobResults.length).toBeGreaterThan(0);
    expect(jobResults.every((item) => item.jobFields)).toBe(true);
  });

  it('selects a reviewed job when hiring metrics point to one', () => {
    const job = getTopClickedJob(sourceItems, [['job-financial-nlp-engineer-reviewed', 1], ['dataset-sec-edgar', 1]]);

    expect(job?.id).toBe('job-financial-nlp-engineer-reviewed');
    expect(job?.jobFields?.roleFamily).toBe('engineering');
    expect(getTopClickedJob(sourceItems, [['dataset-sec-edgar', 1]])).toBeUndefined();
  });

  it('summarizes the leading clicked source type from analytics metrics', () => {
    const sourceSignal = getTopClickedSourceType([['dataset', 1], ['unknown_source', 3], ['job', 'bad-count']]);

    expect(sourceSignal).toEqual({ sourceType: 'dataset', clicks: 1 });
    expect(getTopClickedSourceType([['unknown_source', 3]])).toBeUndefined();
  });

  it('adds Hugging Face models and papers as first-class finance AI sources', () => {
    const counts = getSourceCounts(sourceItems);
    const coverage = getHuggingFaceCoverage(sourceItems);
    const modelResults = searchItems(sourceItems, { query: 'FinBERT', sourceType: 'huggingface_model', theme: 'all', dateWindow: 'all' });
    const paperResults = searchItems(sourceItems, { query: 'FinGPT', sourceType: 'huggingface_paper', theme: 'all', dateWindow: 'all' });

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
