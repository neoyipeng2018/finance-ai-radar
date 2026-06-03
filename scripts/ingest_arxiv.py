import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

TERMS = [
    'all:"large language model" AND all:finance',
    'all:LLM AND all:portfolio',
    'all:agent AND all:financial',
    'all:machine learning AND all:credit risk',
]


def search_arxiv(query: str) -> list[dict]:
    params = urllib.parse.urlencode({
        'search_query': query,
        'start': '0',
        'max_results': '10',
        'sortBy': 'submittedDate',
        'sortOrder': 'descending',
    })
    with urllib.request.urlopen(f'https://export.arxiv.org/api/query?{params}', timeout=30) as response:
        xml = response.read().decode('utf-8')
    root = ET.fromstring(xml)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    rows = []
    for entry in root.findall('atom:entry', ns):
        title = ''.join(entry.findtext('atom:title', default='', namespaces=ns).split())
        summary = ' '.join(entry.findtext('atom:summary', default='', namespaces=ns).split())
        link = entry.findtext('atom:id', default='', namespaces=ns)
        rows.append({
            'source_type': 'arxiv',
            'title': title,
            'url': link,
            'publisher': 'arXiv',
            'summary': summary,
            'license_note': 'arXiv link only; summarize and cite.',
            'human_review_required': True,
        })
    return rows


def main() -> None:
    seen: set[str] = set()
    rows = []
    for term in TERMS:
        for paper in search_arxiv(term):
            if paper['url'] in seen:
                continue
            seen.add(paper['url'])
            rows.append(paper)
    print(json.dumps(rows, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
