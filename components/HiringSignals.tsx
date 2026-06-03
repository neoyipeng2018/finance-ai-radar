import type { ContentItem } from '../lib/types';

export function HiringSignals({ items }: { items: ContentItem[] }) {
  const jobs = items.filter((item) => item.sourceType === 'job' && item.jobFields);
  const skills = [...new Set(jobs.flatMap((item) => item.jobFields?.skills ?? []))].slice(0, 10);
  const domains = [...new Set(jobs.flatMap((item) => item.jobFields ? [item.jobFields.financeDomain] : []))];

  return (
    <section className="section" id="jobs">
      <div className="section-head">
        <div>
          <div className="eyebrow">Hiring signal</div>
          <h2>AI + finance jobs show where budget is moving.</h2>
        </div>
        <p>Roles are treated as demand-side intelligence: not a generic job board, but a map of skills, workflows, and finance domains with hiring urgency.</p>
      </div>
      <div className="quality-grid">
        <article className="moat-card">
          <h3>Tracked roles</h3>
          <p>{jobs.length} reviewed representative AI + finance roles spanning {domains.join(', ')}.</p>
          <div className="meta">{skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
        </article>
        <article className="moat-card">
          <h3>Jobs product surface</h3>
          <p>Use the jobs page to connect demand signals to papers, datasets, repos, and learning paths.</p>
          <a className="ghost inline-link" href="/jobs">Open AI + finance jobs</a>
        </article>
      </div>
    </section>
  );
}
