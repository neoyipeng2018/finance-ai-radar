import { describe, expect, it } from 'vitest';
import { sourceItems } from '../data/sourceItems';
import { getDashboardSnapshot } from '../lib/library';

describe('dashboard snapshot', () => {
  it('surfaces one-glance essentials for the landscape homepage', () => {
    const snapshot = getDashboardSnapshot(sourceItems, new Date('2026-06-15T00:00:00.000Z'));

    expect(snapshot.heroStats).toHaveLength(4);
    expect(snapshot.heroStats.map((stat) => stat.label)).toEqual(['Signals', 'Reviewed', 'Sources', 'Themes']);
    expect(snapshot.priorityPanels.map((panel) => panel.label)).toEqual(['Watch now', 'Dataset edge', 'Hiring demand']);
    expect(snapshot.priorityPanels.every((panel) => panel.title.length > 0 && panel.detail.length > 0)).toBe(true);
    expect(snapshot.topItems).toHaveLength(3);
    expect(snapshot.topItems[0].score).toBeGreaterThanOrEqual(snapshot.topItems[1].score);
  });
});
