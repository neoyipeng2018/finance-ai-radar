import { ContentCard } from './ContentCard';
import type { ContentItem } from '../lib/types';

export function FreshThisMonth({ items }: { items: ContentItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section" id="fresh-month">
      <div className="section-head">
        <div>
          <div className="eyebrow">Fresh this month</div>
          <h2>Recent signals before the all-time archive.</h2>
        </div>
        <p>Six current items published in the last 30 days. Use the library filters for older evergreen material.</p>
      </div>
      <div className="grid three">
        {items.map((item, index) => <ContentCard item={item} key={item.id} rankPosition={index + 1} />)}
      </div>
      <p className="section-note"><a href="#library">Open the full all-time library filters →</a></p>
    </section>
  );
}
