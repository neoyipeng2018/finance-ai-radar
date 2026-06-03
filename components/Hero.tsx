type HeroProps = {
  totalItems: number;
  githubItems: number;
  themeCount: number;
  reviewedItems: number;
};

export function Hero({ totalItems, githubItems, themeCount, reviewedItems }: HeroProps) {
  return (
    <section className="hero">
      <div className="panel hero-main">
        <div className="eyebrow">Finance AI Radar</div>
        <h1>The signal layer for AI that actually matters in finance.</h1>
        <p className="lede">A curated intelligence homepage for applied AI in finance: papers, GitHub repositories, public-domain datasets, practitioner debates, regulatory signals, expert-call ideas, and monetizable sponsor inventory.</p>
        <div className="hero-actions">
          <a className="cta" href="#library">Explore the library</a>
          <a className="ghost" href="#monetization">Sponsor the brief</a>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><strong>{totalItems}</strong><span>seed signals</span></div>
          <div className="kpi"><strong>{githubItems}</strong><span>GitHub repos</span></div>
          <div className="kpi"><strong>{themeCount}</strong><span>themes</span></div>
          <div className="kpi"><strong>{reviewedItems}</strong><span>reviewed</span></div>
        </div>
      </div>
      <aside className="panel sponsor-card" id="sponsor">
        <div>
          <div className="eyebrow">Premium sponsor slot</div>
          <h2>Reach AI-forward finance buyers before the category gets crowded.</h2>
          <p>Best-fit sponsors: data vendors, research copilots, model-eval platforms, compliance AI, expert networks, quant infrastructure, and AI-finance hiring teams.</p>
        </div>
        <div>
          <p className="price">Launch inventory: newsletter, homepage, theme page, expert-call series.</p>
          <a className="cta" href="mailto:sponsor@financeairadar.example">Request media kit</a>
        </div>
      </aside>
    </section>
  );
}
