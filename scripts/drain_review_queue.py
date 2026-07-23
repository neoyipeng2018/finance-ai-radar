#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'data' / 'review_queue.tsv'
ARCHIVE = ROOT / 'data' / 'review_archive.tsv'
SOURCE_LEDGER = ROOT / 'data' / 'source_ledger.tsv'
SOURCE_ITEMS = ROOT / 'data' / 'sourceItems.ts'
FIELDS = ['candidate_id', 'source_type', 'title', 'url', 'publisher', 'discovered_at', 'relevance_reason', 'license_guess', 'status', 'reviewer_notes']
ARCHIVE_FIELDS = FIELDS + ['drained_at', 'drain_reason', 'drain_run_id', 'source_match']
ACTIVE_STATUSES = {'candidate', 'triaged', 'reviewed'}


def read_tsv(path: Path) -> list[dict[str, str]]:
    if not path.exists() or path.read_text().strip() == '':
        return []
    with path.open(newline='') as handle:
        return [{key: value for key, value in row.items() if key is not None} for row in csv.DictReader(handle, delimiter='\t')]


def write_tsv_atomic(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', newline='', delete=False, dir=path.parent) as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, delimiter='\t', extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)
        temporary = Path(handle.name)
    temporary.replace(path)


def normalize_url(url: str) -> str:
    return url.strip().rstrip('/').lower()


def parse_date(value: str) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def read_source_markers(ledger: Path, source_items: Path) -> dict[str, str]:
    markers: dict[str, str] = {}
    for row in read_tsv(ledger):
        item_id = row.get('item_id', '').strip()
        url = normalize_url(row.get('url', ''))
        if item_id:
            markers[item_id] = item_id
        if url:
            markers[url] = url
    if source_items.exists():
        text = source_items.read_text()
        for item_id in re.findall(r"id:\s*'([^']+)'", text):
            markers[item_id] = item_id
        for url in re.findall(r"url:\s*'([^']+)'", text):
            markers[normalize_url(url)] = normalize_url(url)
    return markers


def row_key(row: dict[str, str]) -> str:
    return f"{row.get('candidate_id', '')}\t{normalize_url(row.get('url', ''))}\t{row.get('drain_reason', '')}"


def is_valid_row(row: dict[str, str]) -> bool:
    return all(field in row for field in FIELDS) and bool(row.get('candidate_id', '').strip()) and bool(row.get('url', '').strip())


def classify_row(row: dict[str, str], markers: dict[str, str], stale_days: int, now: datetime, seen_ids: set[str], seen_urls: set[str]) -> tuple[str | None, str]:
    if not is_valid_row(row):
        return 'invalid_row', ''
    candidate_id = row['candidate_id'].strip()
    url = normalize_url(row['url'])
    status = row.get('status', '').strip()
    if status == 'published':
        return 'status_published', candidate_id
    if status == 'rejected':
        return 'status_rejected', candidate_id
    if candidate_id in markers:
        return 'already_in_source_library', markers[candidate_id]
    if url in markers:
        return 'already_in_source_library', markers[url]
    if candidate_id in seen_ids:
        return 'duplicate_candidate_id', candidate_id
    if url in seen_urls:
        return 'duplicate_url', url
    discovered = parse_date(row.get('discovered_at', ''))
    if status in ACTIVE_STATUSES and discovered is not None and (now - discovered).days > stale_days:
        return f'stale_gt_{stale_days}_days', row.get('discovered_at', '')
    return None, ''


def duplicate_values(rows: list[dict[str, str]], key: str) -> set[str]:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for row in rows:
        value = normalize_url(row.get(key, '')) if key == 'url' else row.get(key, '').strip()
        if not value:
            continue
        if value in seen:
            duplicates.add(value)
        else:
            seen.add(value)
    return duplicates


def drain(queue: Path, archive: Path, ledger: Path, source_items: Path, stale_days: int, run_id: str, dry_run: bool) -> str:
    now = datetime.now(timezone.utc)
    rows = read_tsv(queue)
    existing_archive = read_tsv(archive)
    archived_keys = {row_key(row) for row in existing_archive}
    markers = read_source_markers(ledger, source_items)
    seen_ids: set[str] = set()
    seen_urls: set[str] = set()
    active: list[dict[str, str]] = []
    new_archive: list[dict[str, str]] = []
    reason_counts: dict[str, int] = {}

    for row in rows:
        reason, source_match = classify_row(row, markers, stale_days, now, seen_ids, seen_urls)
        if is_valid_row(row):
            seen_ids.add(row['candidate_id'].strip())
            seen_urls.add(normalize_url(row['url']))
        if reason:
            archive_row = {**row, 'drained_at': now.isoformat(), 'drain_reason': reason, 'drain_run_id': run_id, 'source_match': source_match}
            if row_key(archive_row) not in archived_keys:
                new_archive.append(archive_row)
                archived_keys.add(row_key(archive_row))
                reason_counts[reason] = reason_counts.get(reason, 0) + 1
        else:
            active.append(row)

    if not dry_run:
        write_tsv_atomic(archive, existing_archive + new_archive, ARCHIVE_FIELDS)
        write_tsv_atomic(queue, active, FIELDS)
    counts = ' '.join(f'{key}={reason_counts[key]}' for key in sorted(reason_counts))
    return f"queue_before={len(rows)} queue_after={len(active)} archived={len(new_archive)} dry_run={str(dry_run).lower()} {counts}".strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--queue', type=Path, default=QUEUE)
    parser.add_argument('--archive', type=Path, default=ARCHIVE)
    parser.add_argument('--ledger', type=Path, default=SOURCE_LEDGER)
    parser.add_argument('--source-items', type=Path, default=SOURCE_ITEMS)
    parser.add_argument('--stale-days', type=int, default=30)
    parser.add_argument('--run-id', default=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    print(drain(args.queue, args.archive, args.ledger, args.source_items, args.stale_days, args.run_id, args.dry_run))


if __name__ == '__main__':
    main()
