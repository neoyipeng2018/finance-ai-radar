import json
import os
import urllib.parse
import urllib.request

QUERIES = [
    'ai finance language:Python stars:>20 pushed:>2025-01-01',
    'llm investment research stars:>10 pushed:>2025-01-01',
    'sec filings llm stars:>10 pushed:>2025-01-01',
    'portfolio optimization machine learning stars:>20 pushed:>2025-01-01',
]


def request_json(url: str) -> dict:
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'finance-ai-radar'}
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = f'Bearer {token}'
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))


def repo_health_score(repo: dict) -> int:
    stars = min(int(repo.get('stargazers_count', 0)), 500) / 500
    low_issue_burden = 1 if int(repo.get('open_issues_count', 0)) < 50 else 0.5
    has_description = 1 if repo.get('description') else 0
    has_license = 1 if repo.get('license') else 0
    return round(stars * 35 + low_issue_burden * 20 + has_description * 20 + has_license * 25)


def search_repos(query: str) -> list[dict]:
    encoded = urllib.parse.urlencode({'q': query, 'sort': 'updated', 'order': 'desc', 'per_page': '10'})
    payload = request_json(f'https://api.github.com/search/repositories?{encoded}')
    return list(payload.get('items', []))


def main() -> None:
    seen: set[str] = set()
    rows = []
    for query in QUERIES:
        for repo in search_repos(query):
            url = str(repo['html_url'])
            if url in seen:
                continue
            seen.add(url)
            license_info = repo.get('license') or {}
            rows.append({
                'source_type': 'github',
                'title': repo['full_name'],
                'url': url,
                'publisher': 'GitHub',
                'summary': repo.get('description') or '',
                'score': repo_health_score(repo),
                'license_note': license_info.get('spdx_id', 'NOASSERTION'),
                'human_review_required': True,
            })
    print(json.dumps(rows, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
