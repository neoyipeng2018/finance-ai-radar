import type { EditorialMetrics as Metrics } from '../lib/types';

export function EditorialMetrics({ metrics }: { metrics: Metrics }) {
  const metricCards = [
    ['Reviewed coverage', `${metrics.reviewedCoverage}%`, 'No item appears without editorial review status.'],
    ['Rights-safe posture', `${metrics.rightsSafeItems}`, 'Each item carries a license note and caveat.'],
    ['High-evidence items', `${metrics.highEvidenceItems}`, 'Prioritizes primary sources, repos, papers, datasets, and regulators.'],
    ['Source diversity', `${metrics.sourceDiversity}`, 'Broad coverage across papers, repos, news, forums, datasets, jobs, tools, and expert formats.'],
    ['Review queue', `${metrics.queueSize}`, 'Candidates staged before they can reach the homepage.'],
    ['Stale candidates', `${metrics.staleCandidates}`, 'Queue items older than seven days that need triage.'],
    ['Dataset coverage', `${metrics.datasetCoverage}`, 'Reviewed public finance/NLP datasets with license and leakage posture.'],
    ['Jobs coverage', `${metrics.jobsCoverage}`, 'Reviewed AI + finance roles tracked as hiring-market demand signals.'],
    ['HF models', `${metrics.huggingFaceModelsCoverage}`, 'Reviewed Hugging Face finance models with license, task, and model-risk posture.'],
    ['HF papers', `${metrics.huggingFacePapersCoverage}`, 'Reviewed Hugging Face paper surfaces connected to models, datasets, and reproducibility.'],
  ];

  return (
    <section className="section" id="quality">
      <div className="section-head">
        <div>
          <div className="eyebrow">Aggregator quality console</div>
          <h2>Make trust measurable, not vibes-based.</h2>
        </div>
        <p>The best finance AI aggregator needs an editorial instrumentation layer: rights posture, evidence depth, source diversity, queue health, dataset coverage, jobs coverage, and explicit gaps.</p>
      </div>
      <div className="grid four">
        {metricCards.map(([label, value, description]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="quality-grid">
        <article className="moat-card">
          <h3>Coverage gaps to fill next</h3>
          <div className="meta">
            {metrics.coverageGaps.map((gap) => <span className="chip gap" key={gap}>{gap}</span>)}
          </div>
          <p>Gaps are useful: they turn curation into an operating system rather than an endless feed.</p>
        </article>
        <article className="moat-card">
          <h3>Next best source acquisition</h3>
          <p>{metrics.nextBestSource}</p>
          <p>Priority: create rights-cleared expert summaries and dataset/job intelligence that generic link aggregators cannot cheaply copy.</p>
        </article>
      </div>
    </section>
  );
}
