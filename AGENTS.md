# Finance AI Radar Operating Guide

## Mission
Become the highest-signal AI-in-finance aggregator for practitioners, builders, finance researchers, and career-switchers who want evidence-backed sources rather than hype.

## Editorial Rule
Do not publish an item unless it has: source link, finance use case, why it matters, caveat, license or rights note, and review status.

## Current Learning
- 2026-06-03: Initial loop installed. Metrics are seeded only for system validation; wait for real click, dwell, filter, dataset, Hugging Face model, Hugging Face paper, job, and sponsor events before changing ranking heuristics.

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
