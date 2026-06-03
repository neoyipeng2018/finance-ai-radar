import Link from 'next/link';

export default function SponsorPage() {
  return (
    <main className="page-shell">
      <Link className="ghost" href="/">← Back to Finance AI Radar</Link>
      <section className="panel hero-main section">
        <div className="eyebrow">Sponsor Finance AI Radar</div>
        <h1>Buy attention from the people building and buying AI in finance.</h1>
        <p className="lede">Sponsor slots are designed for high-trust relevance: AI research platforms, data vendors, compliance tooling, expert networks, quant infrastructure, and hiring teams.</p>
        <div className="grid three">
          <article className="moat-card"><h3>Homepage</h3><p>Premium banner plus contextual placement beside this week’s top signals.</p></article>
          <article className="moat-card"><h3>Newsletter</h3><p>One sponsor, clear labeling, direct CTA, and UTM tracking.</p></article>
          <article className="moat-card" id="expert-network"><h3>Expert series</h3><p>Rights-cleared expert calls converted into public summaries and paid team briefings.</p></article>
        </div>
      </section>
    </main>
  );
}
