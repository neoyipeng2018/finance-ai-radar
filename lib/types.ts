export type SourceType =
  | 'arxiv'
  | 'ssrn'
  | 'reddit'
  | 'news'
  | 'blog'
  | 'github'
  | 'broker'
  | 'expert_call'
  | 'dataset'
  | 'kaggle'
  | 'huggingface_dataset'
  | 'huggingface_model'
  | 'huggingface_paper'
  | 'regulator'
  | 'job'
  | 'tool';

export type ReviewStatus = 'candidate' | 'triaged' | 'reviewed' | 'published' | 'rejected';

export type DatasetMetadata = {
  modality: 'text' | 'tabular' | 'time_series' | 'graph' | 'mixed';
  access: 'open_download' | 'api' | 'account_required' | 'metadata_only';
  license: string;
  updateFrequency: 'static' | 'daily' | 'weekly' | 'monthly' | 'irregular';
  nlpUseCases: string[];
  leakageRisks: string[];
};

export type JobMetadata = {
  company: string;
  roleFamily: 'research' | 'quant' | 'engineering' | 'risk' | 'compliance' | 'product' | 'data' | 'sales';
  location: string;
  seniority: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown';
  skills: string[];
  financeDomain: string;
  compensationSignal: 'listed' | 'not_listed' | 'range_only';
  postingFreshnessDays: number;
  sponsorStatus: 'organic' | 'sponsored' | 'partner';
};



export type HuggingFaceModelMetadata = {
  task: string;
  modelFamily: string;
  license: string;
  downloads: number;
  likes: number;
  financeAdaptation: 'native_finance' | 'adaptable' | 'benchmark_only';
  deploymentFit: 'research' | 'prototype' | 'production_candidate';
  modelRisks: string[];
};

export type HuggingFacePaperMetadata = {
  paperId: string;
  linkedModels: string[];
  linkedDatasets: string[];
  methodType: 'benchmark' | 'model' | 'survey' | 'application' | 'evaluation';
  reproducibility: 'code_available' | 'models_available' | 'datasets_available' | 'paper_only';
  financeDomains: string[];
};

export type ContentItem = {
  id: string;
  sourceType: SourceType;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
  summary: string;
  whyItMatters: string;
  financeUseCase: string;
  aiTechnique: string;
  themes: string[];
  audience: string[];
  maturity: 'research' | 'prototype' | 'production' | 'vendor' | 'regulation' | 'discussion' | 'dataset' | 'hiring_signal';
  score: number;
  evidenceQuality: 'low' | 'medium' | 'high';
  licenseNote: string;
  riskOrCaveat: string;
  reviewStatus: ReviewStatus;
  readingTimeMinutes: number;
  datasetFields?: DatasetMetadata;
  jobFields?: JobMetadata;
  huggingFaceModelFields?: HuggingFaceModelMetadata;
  huggingFacePaperFields?: HuggingFacePaperMetadata;
};

export type DateWindow = '7d' | 'week' | 'month' | 'year' | 'all' | 'custom';

export type SearchFilters = {
  query: string;
  sourceType: SourceType | 'all';
  theme: string | 'all';
  dateWindow: DateWindow;
  customDays?: number;
};

export type ThemeBrief = {
  name: string;
  items: number;
  averageScore: number;
  topUseCase: string;
};

export type EditorialMetrics = {
  reviewedCoverage: number;
  rightsSafeItems: number;
  highEvidenceItems: number;
  sourceDiversity: number;
  coverageGaps: string[];
  nextBestSource: string;
  queueSize: number;
  staleCandidates: number;
  datasetCoverage: number;
  jobsCoverage: number;
  huggingFaceModelsCoverage: number;
  huggingFacePapersCoverage: number;
};

export type DatasetCoverage = {
  reviewed: number;
  withLeakageRisks: number;
  modalities: string[];
  nlpUseCases: string[];
};

export type JobsCoverage = {
  reviewed: number;
  roleFamilies: string[];
  financeDomains: string[];
  skills: string[];
};


export type HuggingFaceCoverage = {
  reviewedModels: number;
  reviewedPapers: number;
  tasks: string[];
  modelFamilies: string[];
  financeDomains: string[];
  reproducibilityModes: string[];
};
