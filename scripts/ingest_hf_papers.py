import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'data' / 'review_queue.tsv'
FIELDS = ['candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at', 'relevance_reason', 'license_guess', 'status', 'reviewer_notes']
QUERIES = ['FinGPT', 'financial sentiment', 'finance large language model', 'financial question answering', 'FinBERT']

def fetch_papers(query: str) -> list[dict[str, object]]:
    url = f'https://huggingface.co/api/daily_papers?query={quote(query)}'
    req = Request(url, headers={'User-Agent': 'finance-ai-radar/0.1'})
    with urlopen(req, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []

def text_value(value: object, fallback: str) -> str:
    return value if isinstance(value, str) and value else fallback

def paper_title(paper: dict[str, object]) -> str:
    nested = paper.get('paper')
    if isinstance(nested, dict):
        return text_value(nested.get('title'), text_value(paper.get('title'), 'Hugging Face paper'))
    return text_value(paper.get('title'), 'Hugging Face paper')

def paper_id(paper: dict[str, object]) -> str:
    nested = paper.get('paper')
    if isinstance(nested, dict):
        return text_value(nested.get('id'), text_value(paper.get('id'), paper_title(paper)))
    return text_value(paper.get('id'), paper_title(paper))

def candidate(paper: dict[str, object], query: str) -> dict[str, str]:
    pid = paper_id(paper)
    title = paper_title(paper)
    slug = ''.join(ch.lower() if ch.isalnum() else '-' for ch in pid).strip('-')
    return {
        'candidate_id': f'hf-paper-{slug}'[:96],
        'source_type': 'huggingface_paper',
        'title': title,
        'url': f'https://huggingface.co/papers/{pid}',
        'publisher': 'Hugging Face Papers',
        'discovered_at': datetime.now(timezone.utc).isoformat(),
        'relevance_reason': f"Matched Hugging Face paper query '{query}' for finance AI research monitoring.",
        'license_guess': 'Paper metadata is public; check linked arXiv, code, model, and dataset terms',
        'status': 'candidate',
        'reviewer_notes': 'Needs linked models, datasets, reproducibility, finance domain, and claims review.',
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
            for paper in fetch_papers(query):
                row = candidate(paper, query)
                if row['candidate_id'] not in existing and row['title']:
                    writer.writerow(row)
                    existing.add(row['candidate_id'])

if __name__ == '__main__':
    main()
