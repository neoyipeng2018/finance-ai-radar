import type { ThemeBrief } from '../lib/types';

export function ThemeGrid({ themes }: { themes: ThemeBrief[] }) {
  return (
    <section className="section" id="themes">
      <div className="section-head">
        <div>
          <div className="eyebrow">Persistent research maps</div>
          <h2>Theme pages compound over time.</h2>
        </div>
        <p>The homepage is weekly; theme pages become evergreen maps of workflows, repos, datasets, papers, risks, and investable adoption signals.</p>
      </div>
      <div className="grid three">
        {themes.slice(0, 9).map((theme) => (
          <article className="theme-card" key={theme.name}>
            <strong>{theme.name}</strong>
            <span>{theme.items} items · average score {theme.averageScore}</span>
            <p>{theme.topUseCase}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
