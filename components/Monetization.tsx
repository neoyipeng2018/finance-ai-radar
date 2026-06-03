const monetization = [
  ['Newsletter sponsor', 'One clearly labeled sponsor in the weekly brief for AI-forward finance professionals.'],
  ['Theme ownership', 'Dedicated sponsorship of pages like AI compliance, SEC filing agents, or open-source finance repos.'],
  ['Paid intelligence brief', 'Monthly PDF/HTML briefing: best repos, papers, adoption signals, and vendor movements.'],
  ['Expert-call product', 'Rights-cleared calls with bank AI leads, model-risk teams, data vendors, and quant researchers.'],
];

export function Monetization() {
  return (
    <section className="section" id="monetization">
      <div className="section-head">
        <div>
          <div className="eyebrow">Monetization without killing trust</div>
          <h2>Ads are the floor. Intelligence products are the upside.</h2>
        </div>
        <p>Every monetization surface is clearly labeled and aligned with the audience. The brand promise stays curation quality first.</p>
      </div>
      <div className="grid four">
        {monetization.map(([title, description]) => (
          <article className="moat-card" key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
