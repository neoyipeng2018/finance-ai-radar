import Link from 'next/link';
import { ContentCard } from '../../components/ContentCard';
import { sourceItems } from '../../data/sourceItems';
import { getJobsCoverage } from '../../lib/library';

export default function JobsPage() {
  const jobs = sourceItems.filter((item) => item.sourceType === 'job' && item.jobFields);
  const coverage = getJobsCoverage(sourceItems);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="logo" href="/"><span className="logo-mark">Ƒ</span><span>Finance AI Radar</span></Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/datasets">Datasets</Link><Link href="/review">Queue</Link></nav>
      </header>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">AI + finance jobs</div>
            <h1>Hiring demand as market intelligence.</h1>
          </div>
          <p>{coverage.reviewed} reviewed role signals across {coverage.roleFamilies.join(', ')}. Jobs connect learning resources to budget-backed demand.</p>
        </div>
        <div className="quality-grid">
          <article className="moat-card">
            <h3>Top skill signals</h3>
            <div className="meta">{coverage.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
          </article>
          <article className="moat-card">
            <h3>Finance domains</h3>
            <div className="meta">{coverage.financeDomains.map((domain) => <span className="chip" key={domain}>{domain}</span>)}</div>
          </article>
        </div>
        <div className="library-list">
          {jobs.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}
        </div>
      </section>
    </main>
  );
}
