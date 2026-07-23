import type { ContentItem, DashboardSnapshot, DatasetCoverage, DateWindow, EditorialMetrics, HuggingFaceCoverage, JobsCoverage, SearchFilters, SourceType, ThemeBrief } from './types';
import type { ReviewQueueSummary } from './reviewQueue';

const sourceOrder: SourceType[] = ['github', 'arxiv', 'ssrn', 'reddit', 'news', 'blog', 'broker', 'expert_call', 'dataset', 'kaggle', 'huggingface_dataset', 'huggingface_model', 'huggingface_paper', 'regulator', 'job', 'tool'];

function reviewed(item: ContentItem): boolean {
  return item.reviewStatus === 'reviewed' || item.reviewStatus === 'published';
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FEATURED_RECENCY_DAYS = 30;

export function daysForWindow(dateWindow: DateWindow, customDays?: number): number | null {
  if (dateWindow === 'all') return null;
  if (dateWindow === '7d' || dateWindow === 'week') return 7;
  if (dateWindow === 'month') return 30;
  if (dateWindow === 'year') return 365;
  const value = Math.floor(customDays ?? 30);
  return Math.min(3650, Math.max(1, value));
}

export function isWithinDateWindow(publishedAt: string, dateWindow: DateWindow, customDays?: number, now = new Date()): boolean {
  const days = daysForWindow(dateWindow, customDays);
  if (days === null) return true;
  const published = new Date(`${publishedAt}T00:00:00.000Z`);
  if (Number.isNaN(published.getTime())) return false;
  const ageDays = Math.floor((now.getTime() - published.getTime()) / MS_PER_DAY);
  return ageDays >= 0 && ageDays <= days;
}

export function getFeaturedItems(items: ContentItem[], limit: number, now = new Date()): ContentItem[] {
  return [...items]
    .filter(reviewed)
    .filter((item) => isWithinDateWindow(item.publishedAt, 'custom', FEATURED_RECENCY_DAYS, now))
    .sort((a, b) => b.score - a.score || b.readingTimeMinutes - a.readingTimeMinutes || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function searchItems(items: ContentItem[], filters: SearchFilters, now = new Date()): ContentItem[] {
  const query = filters.query.trim().toLowerCase();

  return items
    .filter((item) => filters.sourceType === 'all' || item.sourceType === filters.sourceType)
    .filter((item) => filters.theme === 'all' || item.themes.includes(filters.theme))
    .filter((item) => isWithinDateWindow(item.publishedAt, filters.dateWindow, filters.customDays, now))
    .filter((item) => {
      if (!query) return true;
      const jobFields = item.jobFields ? [item.jobFields.company, item.jobFields.roleFamily, item.jobFields.location, item.jobFields.financeDomain, ...item.jobFields.skills] : [];
      const datasetFields = item.datasetFields ? [item.datasetFields.modality, item.datasetFields.access, item.datasetFields.license, ...item.datasetFields.nlpUseCases, ...item.datasetFields.leakageRisks] : [];
      const hfModelFields = item.huggingFaceModelFields ? [item.huggingFaceModelFields.task, item.huggingFaceModelFields.modelFamily, item.huggingFaceModelFields.license, item.huggingFaceModelFields.financeAdaptation, item.huggingFaceModelFields.deploymentFit, ...item.huggingFaceModelFields.modelRisks] : [];
      const hfPaperFields = item.huggingFacePaperFields ? [item.huggingFacePaperFields.paperId, item.huggingFacePaperFields.methodType, item.huggingFacePaperFields.reproducibility, ...item.huggingFacePaperFields.linkedModels, ...item.huggingFacePaperFields.linkedDatasets, ...item.huggingFacePaperFields.financeDomains] : [];
      const searchable = [
        item.title,
        item.publisher,
        item.sourceType,
        item.summary,
        item.whyItMatters,
        item.financeUseCase,
        item.aiTechnique,
        item.riskOrCaveat,
        ...item.themes,
        ...item.audience,
        ...jobFields,
        ...datasetFields,
        ...hfModelFields,
        ...hfPaperFields,
      ].join(' ').toLowerCase();
      return searchable.includes(query);
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function getSourceCounts(items: ContentItem[]): Record<SourceType, number> {
  const initialCounts: Record<SourceType, number> = {
    arxiv: 0,
    ssrn: 0,
    reddit: 0,
    news: 0,
    blog: 0,
    github: 0,
    broker: 0,
    expert_call: 0,
    dataset: 0,
    kaggle: 0,
    huggingface_dataset: 0,
    huggingface_model: 0,
    huggingface_paper: 0,
    regulator: 0,
    job: 0,
    tool: 0,
  };
  return sourceOrder.reduce<Record<SourceType, number>>((counts, sourceType) => {
    counts[sourceType] = items.filter((item) => item.sourceType === sourceType).length;
    return counts;
  }, initialCounts);
}

export function getAllThemes(items: ContentItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.themes))].sort((a, b) => a.localeCompare(b));
}

export function getThemeBriefs(items: ContentItem[]): ThemeBrief[] {
  return getAllThemes(items)
    .map((name) => {
      const themedItems = items.filter((item) => item.themes.includes(name));
      const averageScore = Math.round(themedItems.reduce((total, item) => total + item.score, 0) / themedItems.length);
      const topUseCase = themedItems.sort((a, b) => b.score - a.score)[0]?.financeUseCase ?? 'Monitoring';
      return { name, items: themedItems.length, averageScore, topUseCase };
    })
    .sort((a, b) => b.items - a.items || b.averageScore - a.averageScore || a.name.localeCompare(b.name));
}

export function getDashboardSnapshot(items: ContentItem[], now = new Date()): DashboardSnapshot {
  const sourceCounts = getSourceCounts(items);
  const themes = getThemeBriefs(items);
  const reviewedItems = items.filter(reviewed).length;
  const topItems = getFeaturedItems(items, 3, now);
  const datasetItem = searchItems(items, { query: '', sourceType: 'huggingface_dataset', theme: 'all', dateWindow: 'all' })[0]
    ?? searchItems(items, { query: '', sourceType: 'dataset', theme: 'all', dateWindow: 'all' })[0];
  const jobItem = searchItems(items, { query: '', sourceType: 'job', theme: 'all', dateWindow: 'all' })[0];
  const watchItem = topItems[0];

  return {
    heroStats: [
      { label: 'Signals', value: String(items.length), detail: 'curated source-linked items' },
      { label: 'Reviewed', value: String(reviewedItems), detail: 'cleared for front-page use' },
      { label: 'Sources', value: String(Object.values(sourceCounts).filter((count) => count > 0).length), detail: 'distinct evidence channels' },
      { label: 'Themes', value: String(themes.length), detail: 'finance AI opportunity clusters' },
    ],
    priorityPanels: [
      {
        label: 'Watch now',
        title: watchItem?.title ?? 'No current watch item',
        detail: watchItem?.financeUseCase ?? 'Add reviewed items to populate the watch panel.',
        href: watchItem?.url ?? '#library',
      },
      {
        label: 'Dataset edge',
        title: datasetItem?.title ?? 'No dataset signal yet',
        detail: datasetItem?.datasetFields ? `${datasetItem.datasetFields.modality} · ${datasetItem.datasetFields.license}` : datasetItem?.financeUseCase ?? 'Add public-domain datasets to sharpen the edge.',
        href: datasetItem?.url ?? '#library',
      },
      {
        label: 'Hiring demand',
        title: jobItem?.title ?? 'No hiring signal yet',
        detail: jobItem?.jobFields ? `${jobItem.jobFields.roleFamily} · ${jobItem.jobFields.location} · ${jobItem.jobFields.skills.slice(0, 2).join(', ')}` : jobItem?.financeUseCase ?? 'Add AI + finance jobs to track demand.',
        href: jobItem?.url ?? '#library',
      },
    ],
    topItems,
  };
}

export function sourceLabel(sourceType: SourceType): string {
  const labels: Record<SourceType, string> = {
    arxiv: 'arXiv',
    ssrn: 'SSRN',
    reddit: 'Reddit',
    news: 'News',
    blog: 'Blog',
    github: 'GitHub',
    broker: 'Broker',
    expert_call: 'Expert call',
    dataset: 'Dataset',
    kaggle: 'Kaggle dataset',
    huggingface_dataset: 'Hugging Face dataset',
    huggingface_model: 'Hugging Face model',
    huggingface_paper: 'Hugging Face paper',
    regulator: 'Regulator dataset',
    job: 'AI + finance job',
    tool: 'Tool',
  };
  return labels[sourceType];
}

export function getDatasetCoverage(items: ContentItem[]): DatasetCoverage {
  const datasets = items.filter((item) => reviewed(item) && ['dataset', 'kaggle', 'huggingface_dataset', 'huggingface_model', 'huggingface_paper', 'regulator'].includes(item.sourceType) && item.datasetFields);
  return {
    reviewed: datasets.length,
    withLeakageRisks: datasets.filter((item) => item.datasetFields && item.datasetFields.leakageRisks.length > 0 && item.licenseNote.trim().length > 0).length,
    modalities: [...new Set(datasets.flatMap((item) => item.datasetFields ? [item.datasetFields.modality] : []))].sort(),
    nlpUseCases: [...new Set(datasets.flatMap((item) => item.datasetFields?.nlpUseCases ?? []))].sort(),
  };
}

export function getJobsCoverage(items: ContentItem[]): JobsCoverage {
  const jobs = items.filter((item) => reviewed(item) && item.sourceType === 'job' && item.jobFields);
  return {
    reviewed: jobs.length,
    roleFamilies: [...new Set(jobs.flatMap((item) => item.jobFields ? [item.jobFields.roleFamily] : []))].sort(),
    financeDomains: [...new Set(jobs.flatMap((item) => item.jobFields ? [item.jobFields.financeDomain] : []))].sort(),
    skills: [...new Set(jobs.flatMap((item) => item.jobFields?.skills ?? []))].sort(),
  };
}

export function getHiringSignals(items: ContentItem[]): ThemeBrief[] {
  return getJobsCoverage(items).roleFamilies.map((roleFamily) => {
    const roleItems = items.filter((item) => item.jobFields?.roleFamily === roleFamily);
    const averageScore = Math.round(roleItems.reduce((total, item) => total + item.score, 0) / roleItems.length);
    return {
      name: roleFamily,
      items: roleItems.length,
      averageScore,
      topUseCase: roleItems.sort((a, b) => b.score - a.score)[0]?.financeUseCase ?? 'Hiring signal',
    };
  });
}


export function getHuggingFaceCoverage(items: ContentItem[]): HuggingFaceCoverage {
  const models = items.filter((item) => reviewed(item) && item.sourceType === 'huggingface_model' && item.huggingFaceModelFields);
  const papers = items.filter((item) => reviewed(item) && item.sourceType === 'huggingface_paper' && item.huggingFacePaperFields);
  return {
    reviewedModels: models.length,
    reviewedPapers: papers.length,
    tasks: [...new Set(models.flatMap((item) => item.huggingFaceModelFields ? [item.huggingFaceModelFields.task] : []))].sort(),
    modelFamilies: [...new Set(models.flatMap((item) => item.huggingFaceModelFields ? [item.huggingFaceModelFields.modelFamily] : []))].sort(),
    financeDomains: [...new Set(papers.flatMap((item) => item.huggingFacePaperFields?.financeDomains ?? []))].sort(),
    reproducibilityModes: [...new Set(papers.flatMap((item) => item.huggingFacePaperFields ? [item.huggingFacePaperFields.reproducibility] : []))].sort(),
  };
}

export function getEditorialMetrics(items: ContentItem[], queue: ReviewQueueSummary = { total: 0, byStatus: { candidate: 0, triaged: 0, reviewed: 0, published: 0, rejected: 0 }, staleCandidates: 0 }): EditorialMetrics {
  const reviewedItems = items.filter(reviewed);
  const rightsSafeItems = items.filter((item) => item.licenseNote.trim().length > 0 && item.riskOrCaveat.trim().length > 0).length;
  const highEvidenceItems = items.filter((item) => item.evidenceQuality === 'high').length;
  const sourceDiversity = Object.values(getSourceCounts(items)).filter((count) => count > 0).length;
  const datasetCoverage = getDatasetCoverage(items).reviewed;
  const jobsCoverage = getJobsCoverage(items).reviewed;
  const huggingFaceCoverage = getHuggingFaceCoverage(items);
  const expectedThemes = [
    'AI agents for analysts',
    'LLMs for equity research',
    'Risk and compliance',
    'Public-domain finance text',
    'Open-source AI finance repos',
    'Portfolio construction',
    'Financial sentiment',
    'Credit underwriting',
    'Market microstructure',
    'Bank operations automation',
    'AI + finance careers',
    'Finance NLP datasets',
    'Hugging Face finance models',
    'Hugging Face finance papers',
  ];
  const themeCounts = new Map(getThemeBriefs(items).map((theme) => [theme.name, theme.items]));
  const coverageGaps = expectedThemes.filter((theme) => (themeCounts.get(theme) ?? 0) < 2);
  const reviewedCoverage = items.length === 0 ? 0 : Math.round((reviewedItems.length / items.length) * 100);

  return {
    reviewedCoverage,
    rightsSafeItems,
    highEvidenceItems,
    sourceDiversity,
    coverageGaps,
    nextBestSource: sourceDiversity >= 12 ? 'More primary-source expert calls with publication rights' : 'More diverse primary sources',
    queueSize: queue.total,
    staleCandidates: queue.staleCandidates,
    datasetCoverage,
    jobsCoverage,
    huggingFaceModelsCoverage: huggingFaceCoverage.reviewedModels,
    huggingFacePapersCoverage: huggingFaceCoverage.reviewedPapers,
  };
}
