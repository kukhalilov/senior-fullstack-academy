# Senior Full-Stack Academy

An independently readable .NET, React, and DSA learning library. The course is generated in small units and stored in Git. Open this folder as an Obsidian vault or read Markdown directly on GitHub.

## Curriculum and production status

The scope map has 12 tracks and 211 atomic topics. Each topic has its own JSON manifest under `curriculum/manifests/`; the learning path orders all 211 topics and the queue contains 2,387 lesson units, including one separate unit for each named DSA problem. The overview comes before the item-by-item references. All 211 manifests have source-backed inventories and are eligible for local draft generation. Thirty-two DSA topics include 213 named problems; `npm run validate:dsa` compiles and runs each problem's C# assertions. The cloud curriculum separates provider-neutral foundations, Azure, and AWS. The system-design track adds nine topics, 56 case exercises, the HLD Handbook's 67 named technologies across 21 references, 22 standalone tradeoff references, 91 named AI/ML systems and methods, and 221 separately taught Handbook module examples and techniques. The learning path puts intermediate DSA before the web stack while keeping its prerequisites explicit.

The model must not be asked to discover API names from memory. Each frozen manifest contains the exact names and versioned scope directly in the prompt payload, with checked source references recorded in the repo. The generator's job is to explain only those supplied items and must not add names. The overview lesson first teaches the purpose, mental model, parts, and a running example without requiring API memorization. For large platforms, define an edition, package, namespace, API family or documentation boundary first. Unbounded “everything” is not a checkable requirement. Missing concept maps or source inventories block generation. Recent major changes are stored as concrete named changes with release/source data and included only where relevant.

GitHub Actions generation has been removed. The repository has no scheduled or push-triggered lesson-generation job. `npm run generate` remains a local command and requires its own API configuration if used.

## Read the course

Open `course/` by track, or inspect `curriculum/learning-path.json`, `curriculum/catalog.json`, and `curriculum/queue.json` for the planned scope. Generated files under `course/drafts/` are checked-shape drafts, not independently verified course material. The three original pilot lessons carry failure warnings. The 213 named DSA problem units include constraints, hints, C# solutions, dry runs, proofs, complexity analyses, and edge-case assertions. `curriculum/factual-review-ledger.json` tracks the required manual claim-by-claim audit; no lesson is promoted based on structural or AI checks alone. The committed content remains accessible without Codex.

Generated text remains draft material until claim-by-claim review is complete. DSA solution programs are compiled and their embedded assertions executed before commit; this does not establish that every algorithm explanation or factual claim is correct. AI review alone cannot establish factual accuracy. Do not use generated security guidance as the sole source of truth.

## Local development

Requires Node.js 20+. `npm test` runs offline checks. `npm run build:queue` regenerates the lesson sequence from the catalog and topic manifests. `npm run validate:structure` checks the index and queue. `npm run validate:catalog` audits full readiness and passes when all manifests are complete. `npm run generate` processes eligible units locally within a hard request budget.
