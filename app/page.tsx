import Link from 'next/link';
import { Hero } from '../components/Hero';
import { ContentCard } from '../components/ContentCard';
import { EditorialMetrics } from '../components/EditorialMetrics';
import { HiringSignals } from '../components/HiringSignals';
import { LibraryExplorer } from '../components/LibraryExplorer';
import { Monetization } from '../components/Monetization';
import { NewsletterBox } from '../components/NewsletterBox';
import { ThemeGrid } from '../components/ThemeGrid';
import { sourceItems } from '../data/sourceItems';
import { getReviewCandidates, reviewQueueSummary } from '../lib/reviewQueueStore';
import { getAllThemes, getEditorialMetrics, getFeaturedItems, getSourceCounts, getThemeBriefs } from '../lib/library';

export default function Home() {
  const featured = getFeaturedItems(sourceItems, 6);
  const sourceCounts = getSourceCounts(sourceItems);
  const themes = getThemeBriefs(sourceItems);
  const queue = reviewQueueSummary(getReviewCandidates());
  const editorialMetrics = getEditorialMetrics(sourceItems, queue);
  const reviewedItems = sourceItems.filter((item) => item.reviewStatus === 'reviewed').length;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="logo" href="#top"><span className="logo-mark">Ƒ</span><span>Finance AI Radar</span></a>
        <nav className="nav">
          <a href="#featured">Featured</a>
          <a href="#library">Library</a>
          <Link href="/datasets">Datasets</Link>
          <Link href="/huggingface">Hugging Face</Link>
          <Link href="/jobs">Jobs</Link>
          <a href="#themes">Themes</a>
          <a href="#monetization">Sponsor</a>
          <Link href="/review">Queue</Link>
        </nav>
      </header>

      <Hero totalItems={sourceItems.length} githubItems={sourceCounts.github} themeCount={getAllThemes(sourceItems).length} reviewedItems={reviewedItems} />

      <section className="section" id="featured">
        <div className="section-head">
          <div>
            <div className="eyebrow">Editor-ranked this week</div>
            <h2>The highest-signal starting set.</h2>
          </div>
          <p>Not sorted by hype. Sorted by finance relevance, actionability, evidence quality, repo usefulness, deployment realism, and demand-side signal.</p>
        </div>
        <div className="grid three">
          {featured.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}
        </div>
      </section>

      <LibraryExplorer items={sourceItems} />
      <EditorialMetrics metrics={editorialMetrics} />
      <HiringSignals items={sourceItems} />
      <ThemeGrid themes={themes} />
      <Monetization />

      <section className="section">
        <NewsletterBox />
      </section>

      <footer className="footer">
        <span>Finance AI Radar · curated, rights-aware, source-linked.</span>
        <span>Editorial rule: source link + why it matters + caveat, or it does not publish.</span>
      </footer>
    </main>
  );
}
