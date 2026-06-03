import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'data' / 'review_queue.tsv'
FIELDS = ['candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at', 'relevance_reason', 'license_guess', 'status', 'reviewer_notes']
QUERIES = ['finance nlp', 'financial sentiment', 'sec filings', 'financial question answering', 'earnings call']

def search(query: str) -> list[dict[str, object]]:
    url = f'https://huggingface.co/api/datasets?search={quote(query)}&limit=10&full=true'
    req = Request(url, headers={'User-Agent': 'finance-ai-radar/0.1'})
    with urlopen(req, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []

def string_value(value: object, fallback: str) -> str:
    return value if isinstance(value, str) and value else fallback

def license_from(dataset: dict[str, object]) -> str:
    card = dataset.get('cardData')
    if isinstance(card, dict):
        license_value = card.get('license')
        if isinstance(license_value, str):
            return license_value
    return 'Check dataset card and original source'

def candidate(dataset: dict[str, object], query: str) -> dict[str, str]:
    dataset_id = string_value(dataset.get('id'), '')
    return {
        'candidate_id': f"hf-{dataset_id.replace('/', '-').lower()}",
        'source_type': 'huggingface_dataset',
        'title': dataset_id,
        'url': f'https://huggingface.co/datasets/{dataset_id}',
        'publisher': dataset_id.split('/')[0] if '/' in dataset_id else 'Hugging Face',
        'discovered_at': datetime.now(timezone.utc).isoformat(),
        'relevance_reason': f"Matched Hugging Face dataset query '{query}' for finance/NLP monitoring.",
        'license_guess': license_from(dataset),
        'status': 'candidate',
        'reviewer_notes': 'Needs dataset-card review, source provenance, task fit, and leakage-risk note.',
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
            for item in search(query):
                row = candidate(item, query)
                if row['candidate_id'] not in existing and row['title']:
                    writer.writerow(row)
                    existing.add(row['candidate_id'])

if __name__ == '__main__':
    main()
