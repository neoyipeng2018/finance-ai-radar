import html
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

PRIORITY_ARXIV_IDS = ['2605.28359']

TERMS = [
    'ti:"From Knowing to Doing" AND all:"LLM Trading Agents"',
    'all:"large language model" AND all:finance',
    'all:LLM AND all:portfolio',
    'all:agent AND all:financial',
    'all:machine learning AND all:credit risk',
]


def normalize_text(value: str) -> str:
    return ' '.join(html.unescape(re.sub(r'<.*?>', ' ', value, flags=re.S)).split())


def request_text(url: str) -> str:
    request = urllib.request.Request(url, headers={'User-Agent': 'finance-ai-radar/0.1'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode('utf-8', 'ignore')


def row_from_fields(title: str, summary: str, link: str) -> dict:
    return {
        'source_type': 'arxiv',
        'title': title,
        'url': link,
        'publisher': 'arXiv',
        'summary': summary,
        'license_note': 'arXiv link only; summarize and cite.',
        'human_review_required': True,
    }


def search_arxiv_api(query: str) -> list[dict]:
    params = urllib.parse.urlencode({
        'search_query': query,
        'start': '0',
        'max_results': '20',
        'sortBy': 'submittedDate',
        'sortOrder': 'descending',
    })
    root = ET.fromstring(request_text(f'https://export.arxiv.org/api/query?{params}'))
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    rows = []
    for entry in root.findall('atom:entry', ns):
        title = ' '.join(entry.findtext('atom:title', default='', namespaces=ns).split())
        summary = ' '.join(entry.findtext('atom:summary', default='', namespaces=ns).split())
        link = entry.findtext('atom:id', default='', namespaces=ns)
        rows.append(row_from_fields(title, summary, link))
    return rows


def fetch_arxiv_abs(arxiv_id: str) -> dict:
    page = request_text(f'https://arxiv.org/abs/{arxiv_id}')
    title_match = re.search(r'<h1 class="title mathjax">(.*?)</h1>', page, re.S)
    abstract_match = re.search(r'<blockquote class="abstract mathjax">(.*?)</blockquote>', page, re.S)
    title = normalize_text(title_match.group(1)).removeprefix('Title:').strip() if title_match else arxiv_id
    summary = normalize_text(abstract_match.group(1)).removeprefix('Abstract:').strip() if abstract_match else ''
    return row_from_fields(title, summary, f'https://arxiv.org/abs/{arxiv_id}')


def search_arxiv_html(query: str) -> list[dict]:
    params = urllib.parse.urlencode({
        'query': query.replace('all:', '').replace('ti:', ''),
        'searchtype': 'all',
        'abstracts': 'show',
        'order': '-announced_date_first',
        'size': '25',
    })
    page = request_text(f'https://arxiv.org/search/?{params}')
    rows = []
    for block in re.findall(r'<li class="arxiv-result".*?(?=<li class="arxiv-result"|</ol>)', page, re.S):
        id_match = re.search(r'arXiv:(\d{4}\.\d{4,5})', block)
        title_match = re.search(r'<p class="title[^>]*>(.*?)</p>', block, re.S)
        abstract_match = re.search(r'<span class="abstract-full[^>]*>(.*?)</span>', block, re.S)
        if not id_match or not title_match:
            continue
        title = normalize_text(title_match.group(1))
        summary = normalize_text(abstract_match.group(1)) if abstract_match else ''
        summary = summary.replace('△ Less', '').replace('▽ More', '').strip()
        rows.append(row_from_fields(title, summary, f'https://arxiv.org/abs/{id_match.group(1)}'))
    return rows


def search_arxiv(query: str) -> list[dict]:
    try:
        return search_arxiv_api(query)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ET.ParseError):
        return search_arxiv_html(query)


def main() -> None:
    seen: set[str] = set()
    rows = []
    for arxiv_id in PRIORITY_ARXIV_IDS:
        try:
            paper = fetch_arxiv_abs(arxiv_id)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
            continue
        seen.add(paper['url'])
        rows.append(paper)
    for term in TERMS:
        try:
            papers = search_arxiv(term)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
            continue
        for paper in papers:
            if paper['url'] in seen:
                continue
            seen.add(paper['url'])
            rows.append(paper)
    print(json.dumps(rows, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
