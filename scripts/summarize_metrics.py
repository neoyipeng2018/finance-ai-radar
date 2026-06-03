import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / 'data' / 'analytics_events.tsv'
OUTPUT = ROOT / 'data' / 'daily_metrics.json'
MIN_DWELL_MS = 15000

def average(values: list[int]) -> int:
    return round(sum(values) / len(values)) if values else 0

def main() -> None:
    if not EVENTS.exists():
        OUTPUT.write_text(json.dumps({'status': 'no_events'}, indent=2))
        print(json.dumps({'status': 'no_events'}, indent=2))
        return

    item_clicks: Counter[str] = Counter()
    source_clicks: Counter[str] = Counter()
    theme_clicks: Counter[str] = Counter()
    job_clicks: Counter[str] = Counter()
    sessions: set[str] = set()
    dwell_by_path: dict[str, list[int]] = defaultdict(list)
    scroll_depths: list[int] = []

    with EVENTS.open(newline='') as f:
        for row in csv.DictReader(f, delimiter='\t'):
            session_id = row.get('session_id', '')
            if session_id:
                sessions.add(session_id)
            event_type = row.get('event_type')
            if event_type == 'source_click':
                item_clicks[row.get('item_id', '')] += 1
                source_clicks[row.get('source_type', '')] += 1
                theme_clicks[row.get('theme', '')] += 1
            if event_type == 'job_click':
                job_clicks[row.get('job_id', '')] += 1
            if event_type == 'session_end':
                dwell_by_path[row.get('path', '/')].append(int(row.get('dwell_ms') or 0))
                if row.get('scroll_depth'):
                    scroll_depths.append(int(row['scroll_depth']))

    summary = {
        'sessions': len(sessions),
        'total_source_clicks': sum(item_clicks.values()),
        'top_items': item_clicks.most_common(10),
        'top_source_types': source_clicks.most_common(10),
        'top_themes': theme_clicks.most_common(10),
        'top_jobs': job_clicks.most_common(10),
        'average_scroll_depth': average(scroll_depths),
        'high_intent_paths': [
            {'path': path, 'avg_dwell_ms': average(values), 'sessions': len(values)}
            for path, values in dwell_by_path.items()
            if average(values) >= MIN_DWELL_MS
        ],
    }
    OUTPUT.write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))

if __name__ == '__main__':
    main()
