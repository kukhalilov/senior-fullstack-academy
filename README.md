# Senior Full-Stack Academy

An independently readable .NET, React, and DSA learning library. The course is generated in small units and stored in Git. Open this folder as an Obsidian vault or read Markdown directly on GitHub.

## Curriculum and production status

The scope map has 11 tracks and 157 atomic topics. Each topic has its own JSON manifest under `curriculum/manifests/`; the learning path orders all 157 topics in ten stages, and the queue has 799 lesson units: big-picture overview, core concepts, bounded references, practice, and interview preparation. The overview comes before the item-by-item reference. Comparisons and recent release notes are optional topic data, not forced lesson types. Most manifests are scaffolds, not frozen inventories. JavaScript values/types, Array, and C# program structure are the first three source-backed bounded inventories enabled for draft generation; Array is divided into ten reference lessons. The other 153 inventories are incomplete; DSA cost analysis is scoped but waits for C# solution validation before generation. The learning path is an initial progression and needs refinement as the remaining scopes are curated.

The model must not be asked to discover API names from memory. Before reference generation, a frozen manifest must contain the exact names and versioned scope directly in the prompt payload, with checked source references recorded in the repo. The generator's job is to explain only those supplied items and must not add names. The overview lesson first teaches the purpose, mental model, parts, and a running example without requiring API memorization. For large platforms, define an edition, package, namespace, API family or documentation boundary first. Unbounded “everything” is not a checkable requirement. Missing concept maps or source inventories block generation. Recent major changes are stored as concrete named changes with release/source data and included only where relevant.

Scheduled GitHub Actions can generate draft lessons for explicitly enabled manifests. Five topics are enabled for draft generation, one complete DSA inventory is held pending C# solution validation, and 151 topics have incomplete inventories. Four automatic runs per day each have a hard budget of 100 Gemini API requests, including retries and revisions. Draft checks require exact headings, cited manifest sources, included reference names, and paths confined to the draft folder; they cannot establish factual accuracy. The three original pilot lessons failed quality review and remain quarantined. `npm run validate:catalog` intentionally fails until all 157 topics have complete, frozen inventories.

GitHub Actions uses the stable `gemini-3.5-flash-lite` model with the repository secret `GEMINI_API_KEY` and only models with available free-tier quota in Google AI Studio. Quotas, model IDs, and GitHub scheduling are subject to provider limits. No billing should be enabled if a zero API bill is required.

## Read the course

Open `course/` by track, or inspect `curriculum/learning-path.json`, `curriculum/catalog.json`, and `curriculum/queue.json` for the planned scope. Generated files under `course/drafts/` are checked-shape drafts, not independently verified course material. The three original pilot lessons carry failure warnings. DSA problem sets, hints, C# solutions, dry runs, proofs, complexity analyses, and tests still need to be built. The committed content remains accessible without Codex.

Generated text is not currently accepted as verified. Future deterministic checks must validate manifest coverage, official-source evidence and runnable code before a lesson can leave draft status. AI review alone cannot establish factual accuracy. Do not use generated security guidance as the sole source of truth.

## Local development

Requires Node.js 20+. `npm test` runs offline checks. `npm run validate:structure` checks the index and queue. `npm run validate:catalog` audits full readiness and intentionally fails while inventories are incomplete. `npm run generate` processes up to 100 eligible lesson units; GitHub Actions runs it on a schedule using the `GEMINI_API_KEY` repository secret and commits checked-shape drafts under `course/drafts/`.
