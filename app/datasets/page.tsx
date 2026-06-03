import Link from 'next/link';
import { ContentCard } from '../../components/ContentCard';
import { sourceItems } from '../../data/sourceItems';
import { getDatasetCoverage } from '../../lib/library';

export default function DatasetsPage() {
  const datasets = sourceItems.filter((item) => item.datasetFields);
  const coverage = getDatasetCoverage(sourceItems);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="logo" href="/"><span className="logo-mark">Ƒ</span><span>Finance AI Radar</span></Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/jobs">Jobs</Link><Link href="/review">Queue</Link></nav>
      </header>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Public finance/NLP datasets</div>
            <h1>Datasets that make finance AI reproducible.</h1>
          </div>
          <p>{coverage.reviewed} reviewed datasets across {coverage.modalities.join(', ')} modalities. Every dataset includes license and leakage posture.</p>
        </div>
        <div className="meta">{coverage.nlpUseCases.map((useCase) => <span className="chip" key={useCase}>{useCase}</span>)}</div>
        <div className="library-list">
          {datasets.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}
        </div>
      </section>
    </main>
  );
}
