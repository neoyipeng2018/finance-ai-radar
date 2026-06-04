# Finance AI Radar Operating Guide

## Mission
Become the highest-signal AI-in-finance aggregator for practitioners, builders, finance researchers, and career-switchers who want evidence-backed sources rather than hype.

## Editorial Rule
Do not publish an item unless it has: source link, finance use case, why it matters, caveat, license or rights note, and review status.

## Review Criteria
A hosted item must pass all of these checks before it moves from candidate/triaged to reviewed/published:
- **Real artifact, not a placeholder:** link to the actual article, paper, model card, dataset page, GitHub repo, regulator page, or job post. Search pages, vendor category pages, and `example.com` placeholders stay in the queue until a specific artifact is selected.
- **Finance-native relevance:** explain the concrete finance workflow, asset class, institution function, or research use case. Reject generic AI items unless the finance connection is explicit and useful.
- **Evidence quality:** prefer primary sources, reproducible papers, maintained repos, public datasets, regulator material, model cards, and clearly sourced practitioner evidence. Vendor/customer stories are allowed only when labeled as vendor narrative and paired with a caveat.
- **Freshness discipline:** by default, all homepage `featured` items must be no more than 30 days old at build/review time. Evergreen older material can remain in the all-time library only when the summary explains why it is still an anchor reference, but it must not displace current featured items.
- **Rights and citation safety:** publish links, metadata, and short summaries only; do not republish proprietary broker research, paywalled excerpts, NDA/expert-call content, or scraped personal data. Record a license/rights note for every item.
- **Specificity over broad feeds:** a broad feed/search page is acceptable only as a monitoring source in the queue. Published cards should name the specific paper/article/repo/dataset/job being recommended.
- **Decision usefulness:** include why it matters, caveat/risk, maturity, audience, score, and reading time so a practitioner can decide whether to open it.
- **Dataset/model/paper completeness:** datasets need access mode, license, NLP use case, and leakage-risk note; Hugging Face models need task/family/license/deployment fit/model-risk notes; papers need linked models/datasets, method type, reproducibility posture, and finance-domain tags.
- **Job listing boundaries:** job posts must have employer, role family, location, seniority, skills, finance domain, posting freshness, and sponsor status; expired or unverifiable postings are archived rather than hosted.

## Current Learning
- 2026-06-03: Initial loop installed. Metrics are seeded only for system validation; wait for real click, dwell, filter, dataset, Hugging Face model, Hugging Face paper, job, and sponsor events before changing ranking heuristics.
- 2026-06-04: Runtime analytics is implemented for Vercel-style Next.js hosting with Neon/Postgres via `DATABASE_URL`; GitHub Pages remains a static mirror at https://neoyipeng2018.github.io/finance-ai-radar/ until a canonical runtime URL is provisioned and smoke-tested.
- 2026-06-04: The searchable library defaults to past-month freshness with 7-day, week, month, year, all-time, and custom-day filters; switch to all-time when recent filters hide evergreen source material.
- 2026-06-04: Homepage featured cards now default to reviewed items from the last 30 days; older anchor references belong in the all-time library unless deliberately re-reviewed with a current artifact.

## Ranking Heuristics
- Prefer primary sources, maintained GitHub repos, Hugging Face models with clear model cards, Hugging Face papers with linked assets, public datasets, regulators, reproducible papers, and practitioner discussions with clear caveats.
- Treat datasets, Hugging Face models, Hugging Face papers, and jobs as compounding surfaces: datasets help builders learn; models reveal reusable building blocks; papers connect methods to assets; jobs reveal which workflows have budget.

## Dataset Priorities
- Prioritize public-domain or clearly licensed finance/NLP datasets: SEC EDGAR, FRED, CFPB, BIS, World Bank, Hugging Face dataset cards, Kaggle datasets with clear provenance.
- Every dataset needs access mode, license, NLP use case, and leakage-risk note.

## Hugging Face Priorities
- Track finance-relevant Hugging Face models and papers alongside datasets. Models need task, family, license, finance adaptation, deployment fit, and model-risk notes.
- Papers need linked models, linked datasets, method type, reproducibility posture, and finance-domain tags.
- Prefer model/paper clusters that connect to public text datasets, SEC filings, earnings calls, sentiment, compliance, credit, or analyst workflow automation.

## Jobs Intelligence Priorities
- Track roles that combine AI and finance: AI research analyst, quant ML engineer, financial NLP engineer, model risk AI specialist, compliance AI product manager, credit ML scientist, bank AI transformation lead, and investment data scientist.
- Treat jobs as demand-side evidence: hiring patterns reveal which AI-in-finance workflows have budget, urgency, and repeatable buyer pain.
- Prefer public job posts with clear role requirements, employer, location, seniority, tools, and finance domain. Do not scrape personal data.

## Daily Loop Rules
- Reflection agent may update Current Learning, Ranking Heuristics, Dataset Priorities, Hugging Face Priorities, Jobs Intelligence Priorities, and Experiment Backlog.
- Implementation agent may execute one coherent change per run. It can be small or large, but it must be scoped by a written hypothesis, verification plan, and rollback note.
- Every change needs tests, typecheck, lint, build, and a row in data/daily_reflections.tsv.
- 03:00 SGT job refreshes/exports metrics before proposing changes; 05:00 SGT job applies one verified improvement and deploys; 05:45 SGT job drains the review queue after the update window.
- Queue draining means archiving non-active, duplicate, stale, rejected, or already-promoted rows to `data/review_archive.tsv`; never silently delete provenance from `data/review_queue.tsv`.
- Runtime metrics belong in durable storage when `DATABASE_URL` is set; local TSV analytics are development fallback only.
- Never republish proprietary broker research or NDA/expert-call content.
- Paid job listings and sponsor slots must be clearly labeled and must not silently affect editorial ranking.

## Experiment Backlog
- [x] Build queue foundations with review_queue.tsv, typed parser, tests, and /review page.
- [x] Add dataset ingestion scaffolds and reviewed public finance/NLP datasets.
- [x] Add AI + finance jobs intelligence with jobs ledger, reviewed role signals, and /jobs page.
- [x] Add first-party analytics for page, source, filter, sponsor, newsletter, Hugging Face model/paper, and job events.
- [x] Add daily reflection and implementation-agent cron jobs with verification gates.
- [x] Add loop-powered UX surfaces for datasets, jobs, quality-console queue metrics, and hiring signals.
- [x] Add Hugging Face models and papers as first-class sources with reviewed items, ingestion scripts, tests, and /huggingface page.
