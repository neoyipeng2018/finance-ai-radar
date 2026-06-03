import csv
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'data' / 'review_queue.tsv'

QUERIES = [
    'financial news nlp',
    'finance sentiment',
    'sec filings',
    'credit default',
    'loan default',
    'credit card fraud',
    'earnings call transcript',
]

FIELDS = [
    'candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at',
    'relevance_reason', 'license_guess', 'status', 'reviewer_notes'
]

def run_kaggle(query: str) -> list[dict[str, str]]:
    result = subprocess.run(
        ['kaggle', 'datasets', 'list', '--search', query, '--csv'],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        print(json.dumps({'query': query, 'status': 'skipped', 'stderr': result.stderr[:300]}))
        return []
    return list(csv.DictReader(result.stdout.splitlines()))[:8]

def candidate_from_row(row: dict[str, str], query: str) -> dict[str, str]:
    ref = row.get('ref', '').strip()
    title = row.get('title', ref).strip()
    return {
        'candidate_id': f"kaggle-{ref.replace('/', '-').lower()}",
        'source_type': 'kaggle',
        'title': title,
        'url': f'https://www.kaggle.com/datasets/{ref}',
        'publisher': ref.split('/')[0] if '/' in ref else 'Kaggle',
        'discovered_at': datetime.now(timezone.utc).isoformat(),
        'relevance_reason': f"Matched Kaggle query '{query}' for finance/NLP dataset monitoring.",
        'license_guess': row.get('licenseName', 'Check Kaggle dataset page before reuse') or 'Check Kaggle dataset page before reuse',
        'status': 'candidate',
        'reviewer_notes': 'Needs provenance, license, NLP use case, leakage risk, and quality review.',
    }

def existing_ids() -> set[str]:
    if not QUEUE.exists():
        return set()
    with QUEUE.open(newline='') as f:
        return {row['candidate_id'] for row in csv.DictReader(f, delimiter='\t')}

def main() -> None:
    QUEUE.parent.mkdir(parents=True, exist_ok=True)
    existing = existing_ids()
    write_header = not QUEUE.exists()
    with QUEUE.open('a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, delimiter='\t')
        if write_header:
            writer.writeheader()
        for query in QUERIES:
            for row in run_kaggle(query):
                candidate = candidate_from_row(row, query)
                if candidate['candidate_id'] not in existing and candidate['url'].endswith('/') is False:
                    writer.writerow(candidate)
                    existing.add(candidate['candidate_id'])

if __name__ == '__main__':
    main()
