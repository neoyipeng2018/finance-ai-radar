import csv
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOBS = ROOT / 'data' / 'jobs_ledger.tsv'
INPUT = ROOT / 'data' / 'job_candidates_manual.csv'

FIELDS = [
    'job_id', 'company', 'title', 'url', 'location', 'role_family', 'skills',
    'finance_domain', 'posted_at', 'discovered_at', 'status', 'sponsor_status', 'notes'
]

def slug(value: str) -> str:
    return ''.join(ch.lower() if ch.isalnum() else '-' for ch in value).strip('-')

def normalize_job(raw: dict[str, str]) -> dict[str, str]:
    title = raw.get('title', '').strip()
    company = raw.get('company', '').strip()
    return {
        'job_id': f"job-{slug(company)}-{slug(title)}"[:96],
        'company': company,
        'title': title,
        'url': raw.get('url', '').strip(),
        'location': raw.get('location', 'unknown').strip(),
        'role_family': raw.get('role_family', 'unknown').strip(),
        'skills': raw.get('skills', '').strip(),
        'finance_domain': raw.get('finance_domain', 'finance').strip(),
        'posted_at': raw.get('posted_at', '').strip(),
        'discovered_at': datetime.now(timezone.utc).isoformat(),
        'status': 'candidate',
        'sponsor_status': raw.get('sponsor_status', 'organic').strip() or 'organic',
        'notes': 'Review for AI+finance specificity, freshness, seniority, and skill signal.',
    }

def existing_ids() -> set[str]:
    if not JOBS.exists():
        return set()
    with JOBS.open(newline='') as f:
        return {row['job_id'] for row in csv.DictReader(f, delimiter='\t')}

def main() -> None:
    JOBS.parent.mkdir(parents=True, exist_ok=True)
    if not INPUT.exists():
        print('No manual job candidate CSV found; no-op.')
        return
    existing = existing_ids()
    write_header = not JOBS.exists()
    with INPUT.open(newline='') as src, JOBS.open('a', newline='') as dst:
        reader = csv.DictReader(src)
        writer = csv.DictWriter(dst, fieldnames=FIELDS, delimiter='\t')
        if write_header:
            writer.writeheader()
        for raw in reader:
            row = normalize_job(raw)
            if row['job_id'] and row['job_id'] not in existing:
                writer.writerow(row)
                existing.add(row['job_id'])

if __name__ == '__main__':
    main()
