import Link from 'next/link';
import { sourceItems } from '../data/sourceItems';
import { getDashboardSnapshot, getDatasetCoverage, getEditorialMetrics, getHuggingFaceCoverage, getJobsCoverage, getSourceCounts, getThemeBriefs, searchItems, sourceLabel } from '../lib/library';
import { getReviewCandidates, reviewQueueSummary } from '../lib/reviewQueueStore';
import type { ContentItem, SourceType, ThemeBrief } from '../lib/types';

function pct(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function CompactSignal({ item, rank }: { item: ContentItem; rank: number }) {
  return (
    <a className="signal-row" href={item.url}>
      <span className="rank">0{rank}</span>
      <span className="signal-copy">
        <strong>{item.title}</strong>
        <small>{item.financeUseCase}</small>
      </span>
      <span className="source-pill">{sourceLabel(item.sourceType)}</span>
      <span className="score">{item.score}</span>
    </a>
  );
}

function DataAssetRow({ item }: { item: ContentItem }) {
  const label = item.datasetFields
    ? `${item.datasetFields.modality} · ${item.datasetFields.license}`
    : item.huggingFaceModelFields
      ? `${item.huggingFaceModelFields.task} · ${item.huggingFaceModelFields.license}`
      : item.huggingFacePaperFields
        ? `${item.huggingFacePaperFields.methodType} · ${item.huggingFacePaperFields.reproducibility}`
        : item.sourceType;

  return (
    <a className="asset-row" href={item.url}>
      <span>
        <strong>{item.title}</strong>
        <small>{label}</small>
      </span>
      <span>{item.score}</span>
    </a>
  );
}

function ThemeRow({ theme }: { theme: ThemeBrief }) {
  return (
    <div className="theme-row">
      <span>{theme.name}</span>
      <strong>{theme.items}</strong>
      <small>{theme.averageScore}</small>
    </div>
  );
}

export default function Home() {
  const queue = reviewQueueSummary(getReviewCandidates());
  const dashboard = getDashboardSnapshot(sourceItems);
  const editorialMetrics = getEditorialMetrics(sourceItems, queue);
  const datasetCoverage = getDatasetCoverage(sourceItems);
  const jobsCoverage = getJobsCoverage(sourceItems);
  const huggingFaceCoverage = getHuggingFaceCoverage(sourceItems);
  const themes = getThemeBriefs(sourceItems).slice(0, 5);
  const sourceCounts = getSourceCounts(sourceItems);
  const activeSources = (Object.entries(sourceCounts) as Array<[SourceType, number]>)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const dataAssets = searchItems(sourceItems, { query: '', sourceType: 'all', theme: 'Finance NLP datasets', dateWindow: 'all' })
    .filter((item) => item.datasetFields || item.huggingFaceModelFields || item.huggingFacePaperFields)
    .slice(0, 4);
  const hiringSignal = searchItems(sourceItems, { query: '', sourceType: 'job', theme: 'all', dateWindow: 'all' })[0];
  const topSignals = dashboard.topItems.slice(0, 3);
  const reviewedItems = dashboard.heroStats.find((stat) => stat.label === 'Reviewed')?.value ?? '0';

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">Ƒ</span>
          <span>Finance AI Radar</span>
        </Link>
        <div className="topbar-center">Data as a business: sources → datasets → signals → paid decisions</div>
        <nav className="dashboard-nav" aria-label="Secondary pages">
          <Link href="/datasets">Datasets</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/review">Queue</Link>
        </nav>
      </header>

      <section className="dashboard-canvas" aria-label="Finance AI Radar one-page dashboard">
        <section className="hero-panel panel">
          <div className="eyebrow">Single-screen operating view</div>
          <h1>AI finance radar for monetizable data advantages.</h1>
          <p className="lede">One landscape dashboard: what to watch, what data can become a product, where evidence is strong, and which demand signals prove the market cares.</p>
          <div className="kpi-strip">
            <div className="kpi"><strong>{sourceItems.length}</strong><span>Signals</span><small>curated, source-linked</small></div>
            <div className="kpi"><strong>{reviewedItems}</strong><span>Reviewed</span><small>{editorialMetrics.reviewedCoverage}% front-page trust</small></div>
            <div className="kpi"><strong>{datasetCoverage.reviewed}</strong><span>Data assets</span><small>{datasetCoverage.modalities.slice(0, 3).join(' / ')}</small></div>
            <div className="kpi"><strong>{jobsCoverage.reviewed}</strong><span>Hiring proof</span><small>{jobsCoverage.roleFamilies.slice(0, 2).join(' + ')}</small></div>
          </div>
          <div className="business-loop">
            <span>Discover</span><span>Rights-check</span><span>Package</span><span>Sell</span>
          </div>
        </section>

        <section className="signals-panel panel">
          <div className="panel-head">
            <span className="eyebrow">Ranked now</span>
            <span className="subtle">top reviewed items</span>
          </div>
          <div className="signal-list">
            {topSignals.map((item, index) => <CompactSignal item={item} rank={index + 1} key={item.id} />)}
          </div>
          <div className="mini-grid">
            {dashboard.priorityPanels.map((panel) => (
              <a className="mini-card" href={panel.href} key={panel.label}>
                <span>{panel.label}</span>
                <strong>{panel.title}</strong>
                <small>{panel.detail}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="data-panel panel">
          <div className="panel-head">
            <span className="eyebrow">Data business desk</span>
            <span className="subtle">assets worth packaging</span>
          </div>
          <div className="asset-list">
            {dataAssets.map((item) => <DataAssetRow item={item} key={item.id} />)}
          </div>
          <div className="data-metrics">
            <div><strong>{huggingFaceCoverage.reviewedModels}</strong><span>HF models</span></div>
            <div><strong>{huggingFaceCoverage.reviewedPapers}</strong><span>HF papers</span></div>
            <div><strong>{datasetCoverage.withLeakageRisks}</strong><span>risk-noted</span></div>
          </div>
        </section>

        <aside className="quality-panel panel">
          <div className="panel-head">
            <span className="eyebrow">Quality / moat</span>
            <span className="subtle">is this sellable?</span>
          </div>
          <div className="gauge-card">
            <strong>{pct(editorialMetrics.rightsSafeItems, sourceItems.length)}</strong>
            <span>rights + caveat coverage</span>
          </div>
          <div className="quality-list">
            <div><span>High evidence</span><strong>{editorialMetrics.highEvidenceItems}</strong></div>
            <div><span>Source channels</span><strong>{editorialMetrics.sourceDiversity}</strong></div>
            <div><span>Review queue</span><strong>{editorialMetrics.queueSize}</strong></div>
            <div><span>Next source</span><small>{editorialMetrics.nextBestSource}</small></div>
          </div>
        </aside>

        <section className="themes-panel panel">
          <div className="panel-head">
            <span className="eyebrow">Theme map</span>
            <span className="subtle">where attention clusters</span>
          </div>
          <div className="theme-table">
            {themes.map((theme) => <ThemeRow theme={theme} key={theme.name} />)}
          </div>
        </section>

        <section className="market-panel panel">
          <div className="panel-head">
            <span className="eyebrow">Demand proof</span>
            <span className="subtle">market wants this</span>
          </div>
          <div className="hiring-card">
            <span>Hiring signal</span>
            <strong>{hiringSignal?.title ?? 'No hiring signal yet'}</strong>
            <small>{hiringSignal?.jobFields ? `${hiringSignal.jobFields.company} · ${hiringSignal.jobFields.roleFamily} · ${hiringSignal.jobFields.skills.slice(0, 3).join(', ')}` : 'Add job evidence to validate buyer demand.'}</small>
          </div>
          <div className="source-bars">
            {activeSources.map(([sourceType, count]) => (
              <div className="source-bar" key={sourceType}>
                <span>{sourceLabel(sourceType)}</span>
                <div><i style={{ width: pct(count, sourceItems.length) }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
