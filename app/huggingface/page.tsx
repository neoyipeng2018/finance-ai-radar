import Link from 'next/link';
import { ContentCard } from '../../components/ContentCard';
import { sourceItems } from '../../data/sourceItems';
import { getHuggingFaceCoverage } from '../../lib/library';

export default function HuggingFacePage() {
  const items = sourceItems.filter((item) => item.sourceType === 'huggingface_model' || item.sourceType === 'huggingface_paper' || item.sourceType === 'huggingface_dataset');
  const models = items.filter((item) => item.sourceType === 'huggingface_model');
  const papers = items.filter((item) => item.sourceType === 'huggingface_paper');
  const coverage = getHuggingFaceCoverage(sourceItems);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="logo" href="/"><span className="logo-mark">Ƒ</span><span>Finance AI Radar</span></Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/datasets">Datasets</Link><Link href="/jobs">Jobs</Link><Link href="/review">Queue</Link></nav>
      </header>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Hugging Face intelligence</div>
            <h1>Models, datasets, and papers for applied finance AI.</h1>
          </div>
          <p>{coverage.reviewedModels} reviewed models and {coverage.reviewedPapers} reviewed paper surfaces. Track what is reusable, licensed, finance-adapted, and reproducible.</p>
        </div>
        <div className="quality-grid">
          <article className="moat-card">
            <h3>Model tasks</h3>
            <div className="meta">{coverage.tasks.map((task) => <span className="chip" key={task}>{task}</span>)}</div>
          </article>
          <article className="moat-card">
            <h3>Finance domains</h3>
            <div className="meta">{coverage.financeDomains.map((domain) => <span className="chip" key={domain}>{domain}</span>)}</div>
          </article>
        </div>
        <div className="section-head compact-head"><h2>Reviewed models</h2><p>Model cards are treated as candidates, not proof: license, finance adaptation, deployment fit, and model risk are explicit.</p></div>
        <div className="library-list">{models.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}</div>
        <div className="section-head compact-head"><h2>Reviewed papers</h2><p>Papers are valuable when they connect methods to reproducible code, models, datasets, or finance-domain evaluation.</p></div>
        <div className="library-list">{papers.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}</div>
      </section>
    </main>
  );
}
