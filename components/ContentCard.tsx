import { sourceLabel } from '../lib/library';
import type { ContentItem } from '../lib/types';
import { TrackedSourceLink } from './TrackedSourceLink';

export function ContentCard({ item, rankPosition }: { item: ContentItem; rankPosition?: number }) {
  return (
    <article className="item-card">
      <div className="card-top">
        <span className="badge">{sourceLabel(item.sourceType)}</span>
        <span className="score">{item.score}</span>
      </div>
      <h3>
        <TrackedSourceLink href={item.url} itemId={item.id} sourceType={item.sourceType} theme={item.themes[0] ?? 'Unclassified'} rankPosition={rankPosition}>
          {item.title}
        </TrackedSourceLink>
      </h3>
      <p>{item.summary}</p>
      <div className="meta">
        {item.themes.slice(0, 3).map((theme) => <span className="chip" key={theme}>{theme}</span>)}
      </div>
      <details className="rationale">
        <summary>Why this matters</summary>
        {item.datasetFields ? (
          <div className="signal-box">
            <strong>Dataset:</strong> {item.datasetFields.modality} · {item.datasetFields.access} · {item.datasetFields.license}
          </div>
        ) : null}
        {item.jobFields ? (
          <div className="signal-box">
            <strong>Hiring signal:</strong> {item.jobFields.roleFamily} · {item.jobFields.location} · {item.jobFields.skills.slice(0, 3).join(', ')}
          </div>
        ) : null}
        {item.huggingFaceModelFields ? (
          <div className="signal-box">
            <strong>HF model:</strong> {item.huggingFaceModelFields.modelFamily} · {item.huggingFaceModelFields.task} · {item.huggingFaceModelFields.deploymentFit}
          </div>
        ) : null}
        {item.huggingFacePaperFields ? (
          <div className="signal-box">
            <strong>HF paper:</strong> {item.huggingFacePaperFields.methodType} · {item.huggingFacePaperFields.reproducibility} · {item.huggingFacePaperFields.financeDomains.slice(0, 2).join(', ')}
          </div>
        ) : null}
        <p><strong>Use case:</strong> {item.financeUseCase}</p>
        <p><strong>Why it matters:</strong> {item.whyItMatters}</p>
        <p><strong>Caveat:</strong> {item.riskOrCaveat}</p>
      </details>
    </article>
  );
}
