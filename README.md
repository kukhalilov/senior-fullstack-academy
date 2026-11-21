# Senior Full-Stack Academy

A self-study library for C#/.NET, React, data structures and algorithms, system design, and senior full-stack engineering.

## Open in Obsidian

1. Open the repository folder as an Obsidian vault.
2. Open [Start Here](Start%20Here.md) and follow the links.
3. Use the generated learning-path, track, and topic indexes to navigate the course. Each topic page links its lessons in study order.

The `.obsidian` folder enables internal wikilinks and keeps links updated. The index pages are generated from the curriculum catalog, learning path, manifests, and lesson queue. Rebuild them with `npm run build:vault` after changing curriculum scope.

## Repository layout

- `course/lessons/` — 2,387 self-contained Markdown lessons grouped by topic ID.
- `course/indexes/` — Obsidian navigation for tracks, topics, and the ordered learning path.
- `curriculum/manifests/` — topic scope, closed inventories, version notes, and source snapshots.
- `curriculum/` — catalog, learning path, lesson queue, factual-review ledger, and supporting system-design maps.
- `scripts/` — curriculum build tools and offline validators. There is no Gemini or GitHub Actions lesson generator.
- `archive/failed-pilots/` — three rejected early samples kept only for historical reference; they are not study material.

The curriculum has 12 tracks and 211 topics. The system-design track draws from the HLD Handbook; see [its coverage map](curriculum/system-design-coverage.md) for attribution and scope notes. The course includes 213 individually named DSA problem lessons.

## Review status

The factual-review ledger records the claim and inventory audit for each lesson. Its current global promotion gate is true, with all 2,387 lessons reviewed and no unresolved lesson issues. Structure validation checks lesson shape and supplied inventory names; DSA validation additionally compiles and runs the embedded C# assertions. These automated checks are not a substitute for the recorded source review.

## Local maintenance

Requires Node.js 20 or later. No API key is required to study, build indexes, or run offline checks.

```sh
npm run build:vault
npm run build:queue
npm run validate:catalog
npm run validate:lessons
npm run validate:dsa
npm test
```

Rebuild the queue only after changing topic manifests or learning-path order, then rebuild the Obsidian indexes. The committed Markdown lessons remain directly readable on GitHub and without Codex.
