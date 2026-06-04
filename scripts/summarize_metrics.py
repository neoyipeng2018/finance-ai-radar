import csv
import json
import os
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = Path(os.environ.get('ANALYTICS_EVENTS_TSV', ROOT / 'data' / 'analytics_events.tsv'))
OUTPUT = Path(os.environ.get('DAILY_METRICS_OUTPUT', ROOT / 'data' / 'daily_metrics.json'))
MIN_DWELL_MS = 15000

Row = dict[str, str]


def average(values: list[int]) -> int:
    return round(sum(values) / len(values)) if values else 0


def rows_from_tsv(path: Path) -> list[Row]:
    if not path.exists():
        return []
    with path.open(newline='') as handle:
        return [{key: value for key, value in row.items() if key is not None} for row in csv.DictReader(handle, delimiter='\t')]


def rows_from_database(database_url: str) -> list[Row]:
    query = """
copy (
  select event_type, anonymous_id, session_id, path, coalesce(item_id, '') as item_id,
         coalesce(source_type, '') as source_type, coalesce(theme, '') as theme,
         coalesce(query, '') as query, coalesce(date_window, '') as date_window,
         coalesce(custom_days::text, '') as custom_days, coalesce(rank_position::text, '') as rank_position,
         coalesce(job_id, '') as job_id, coalesce(role_family, '') as role_family,
         coalesce(finance_domain, '') as finance_domain, coalesce(location, '') as location,
         coalesce(dwell_ms::text, '') as dwell_ms, coalesce(scroll_depth::text, '') as scroll_depth,
         coalesce(referrer, '') as referrer, created_at::text as created_at
  from analytics_events
  where created_at >= now() - interval '7 days'
  order by created_at asc
) to stdout with csv header delimiter E'\t'
"""
    completed = subprocess.run(['psql', database_url, '-c', query], check=True, capture_output=True, text=True)
    reader = csv.DictReader(completed.stdout.splitlines(), delimiter='\t')
    return [{key: value for key, value in row.items() if key is not None} for row in reader]


def increment(counter: Counter[str], value: str | None) -> None:
    if value:
        counter[value] += 1


def summarize(rows: list[Row]) -> dict[str, object]:
    item_clicks: Counter[str] = Counter()
    source_clicks: Counter[str] = Counter()
    theme_clicks: Counter[str] = Counter()
    date_windows: Counter[str] = Counter()
    job_clicks: Counter[str] = Counter()
    sessions: set[str] = set()
    dwell_by_path: dict[str, list[int]] = defaultdict(list)
    scroll_depths: list[int] = []

    for row in rows:
        session_id = row.get('session_id', '')
        if session_id:
            sessions.add(session_id)
        event_type = row.get('event_type')
        if event_type == 'source_click':
            increment(item_clicks, row.get('item_id'))
            increment(source_clicks, row.get('source_type'))
            increment(theme_clicks, row.get('theme'))
        if event_type == 'filter_change':
            increment(date_windows, row.get('date_window'))
        if event_type == 'job_click':
            increment(job_clicks, row.get('job_id'))
        if event_type == 'session_end':
            dwell_by_path[row.get('path', '/')].append(int(row.get('dwell_ms') or 0))
            if row.get('scroll_depth'):
                scroll_depths.append(int(row['scroll_depth']))

    return {
        'sessions': len(sessions),
        'total_source_clicks': sum(item_clicks.values()),
        'top_items': item_clicks.most_common(10),
        'top_source_types': source_clicks.most_common(10),
        'top_themes': theme_clicks.most_common(10),
        'top_date_windows': date_windows.most_common(10),
        'top_jobs': job_clicks.most_common(10),
        'average_scroll_depth': average(scroll_depths),
        'high_intent_paths': [
            {'path': path, 'avg_dwell_ms': average(values), 'sessions': len(values)}
            for path, values in dwell_by_path.items()
            if average(values) >= MIN_DWELL_MS
        ],
    }


def main() -> None:
    database_url = os.environ.get('DATABASE_URL')
    rows = rows_from_database(database_url) if database_url else rows_from_tsv(EVENTS)
    if not rows:
        summary: dict[str, object] = {'status': 'no_events'}
    else:
        summary = summarize(rows)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
