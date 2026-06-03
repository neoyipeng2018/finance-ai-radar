import Link from 'next/link';
import { getReviewCandidates, reviewQueueSummary } from '../../lib/reviewQueueStore';

export default function ReviewQueuePage() {
  const candidates = getReviewCandidates();
  const summary = reviewQueueSummary(candidates);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="logo" href="/"><span className="logo-mark">Ƒ</span><span>Finance AI Radar</span></Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/datasets">Datasets</Link><Link href="/jobs">Jobs</Link></nav>
      </header>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Editorial queue</div>
            <h1>Review candidates before they touch the homepage.</h1>
          </div>
          <p>{summary.total} candidates staged. {summary.staleCandidates} stale candidates. Publish only after license, caveat, and rationale are complete.</p>
        </div>
        <div className="grid four">
          {Object.entries(summary.byStatus).map(([status, count]) => (
            <article className="metric-card" key={status}><span>{status}</span><strong>{count}</strong><p>Queue status count</p></article>
          ))}
        </div>
        <div className="library-list">
          {candidates.map((candidate) => (
            <article className="item-card" key={candidate.candidateId}>
              <div className="card-top">
                <span className="badge">{candidate.sourceType}</span>
                <span className="score">{candidate.status}</span>
              </div>
              <h3><a href={candidate.url}>{candidate.title}</a></h3>
              <p>{candidate.relevanceReason}</p>
              <div className="rationale">
                <p><strong>Publisher:</strong> {candidate.publisher}</p>
                <p><strong>License guess:</strong> {candidate.licenseGuess}</p>
                <p><strong>Reviewer notes:</strong> {candidate.reviewerNotes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
