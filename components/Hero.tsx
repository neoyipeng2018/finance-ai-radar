import type { DashboardSnapshot } from '../lib/types';

type HeroProps = {
  dashboard: DashboardSnapshot;
};

export function Hero({ dashboard }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="panel hero-main">
        <div className="eyebrow">Finance AI Radar</div>
        <h1>AI-finance signals, ranked for action.</h1>
        <p className="lede">One clean operating dashboard for what matters now: deployable repos, public-domain datasets, model papers, hiring demand, and regulatory signals.</p>
        <div className="hero-actions">
          <a className="cta" href="#dashboard">View dashboard</a>
          <a className="ghost" href="#library">Search library</a>
        </div>
        <div className="kpi-grid">
          {dashboard.heroStats.map((stat) => (
            <div className="kpi" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <small>{stat.detail}</small>
            </div>
          ))}
        </div>
      </div>
      <aside className="panel command-panel">
        <div className="eyebrow">Today at a glance</div>
        {dashboard.priorityPanels.map((panel) => (
          <a className="priority-row" href={panel.href} key={panel.label}>
            <span>{panel.label}</span>
            <strong>{panel.title}</strong>
            <small>{panel.detail}</small>
          </a>
        ))}
      </aside>
    </section>
  );
}
