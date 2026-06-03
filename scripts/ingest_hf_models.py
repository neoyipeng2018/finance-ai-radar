import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'data' / 'review_queue.tsv'
FIELDS = ['candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at', 'relevance_reason', 'license_guess', 'status', 'reviewer_notes']
QUERIES = ['finbert', 'finance sentiment', 'financial embedding', 'sec filings', 'financial nlp']

def fetch_models(query: str) -> list[dict[str, object]]:
    url = f'https://huggingface.co/api/models?search={quote(query)}&limit=12&full=true'
    req = Request(url, headers={'User-Agent': 'finance-ai-radar/0.1'})
    with urlopen(req, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []

def text_value(value: object, fallback: str) -> str:
    return value if isinstance(value, str) and value else fallback

def license_value(model: dict[str, object]) -> str:
    card = model.get('cardData')
    if isinstance(card, dict):
        value = card.get('license')
        if isinstance(value, str) and value:
            return value
    return 'Check model card license and upstream training data terms'

def candidate(model: dict[str, object], query: str) -> dict[str, str]:
    model_id = text_value(model.get('modelId'), text_value(model.get('id'), ''))
    pipeline = text_value(model.get('pipeline_tag'), 'model')
    return {
        'candidate_id': f"hf-model-{model_id.replace('/', '-').lower()}",
        'source_type': 'huggingface_model',
        'title': model_id,
        'url': f'https://huggingface.co/{model_id}',
        'publisher': model_id.split('/')[0] if '/' in model_id else 'Hugging Face',
        'discovered_at': datetime.now(timezone.utc).isoformat(),
        'relevance_reason': f"Matched Hugging Face model query '{query}' for finance AI monitoring; pipeline tag: {pipeline}.",
        'license_guess': license_value(model),
        'status': 'candidate',
        'reviewer_notes': 'Needs model-card, license, task fit, finance adaptation, benchmark, and deployment-risk review.',
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
            for model in fetch_models(query):
                row = candidate(model, query)
                if row['candidate_id'] not in existing and row['title']:
                    writer.writerow(row)
                    existing.add(row['candidate_id'])

if __name__ == '__main__':
    main()
