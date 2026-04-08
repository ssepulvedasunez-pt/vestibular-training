# Vestibular Trainer (MVP Scaffold)

This repository contains an initial MVP scaffold for a vestibular bedside reasoning training app.

## MVP goals

- Force commitment before feedback.
- Emphasize high-stakes clinical reasoning errors.
- Track weak domains for targeted review.
- Keep progress local (browser-first) for early iteration.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

## Project structure

- `src/app/*`: Route pages (home, modules, drills, reference, progress, case pages).
- `src/components/*`: Shared UI pieces.
- `src/data/*`: Case content and reference cards.
- `src/lib/*`: Core helper functions (case loading, scoring, progression, storage).
- `src/types/*`: Shared TypeScript models.

## Run locally

```bash
npm install
npm run dev
```

## Current MVP status

- Basic information architecture and route skeleton created.
- Interactive case player added for `module1-case01` with commit-before-feedback behavior.
- localStorage-backed progress recording added for checkpoint attempts and completed cases.
- Progress dashboard now summarizes completed cases, attempts, queue size, and top weak tags.
- Added `Author` page to create, upload JSON, or generate case drafts from pasted source documents with validation feedback before local save.
- Added additional Module 1 seed cases and stronger review-queue tuning hooks for dangerous misses.

## Next implementation steps

1. Validate importer heuristics against real source documents and tune tag/answer confidence rules.
2. Expand seeded content pack and tune review queue thresholds using real miss distributions.
3. Add confidence labels in author UI for auto-detected options/tags.
4. Upgrade local signature/checksum to cryptographic signing when a backend key service is available.
