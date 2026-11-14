# Scope and readiness audit — 2026-11-14

## Inventory totals

- 11 tracks and 161 canonical topic manifests.
- The queue contains 925 lesson units, rebuilt from each topic's overview, concepts, bounded references, practice units, and interview sequence. Each named DSA problem has its own practice unit.
- 15 manifests have source-backed inventories: 14 are fully enabled and one DSA analysis topic keeps its practice unit blocked pending executable checks.
- 146 manifests remain inventory scaffolds; the full-catalog validator intentionally fails.
- Three legacy pilot lessons remain in `course/` with quarantine warnings and are excluded from the accepted curriculum.
- Scheduled GitHub Actions generation covers JavaScript values/types and Array; C# source-file organization, built-in types, numeric literals/conversions, statements, and operators; and seven DSA topics. An eighth DSA analysis topic enables non-practice phases only. Whole-catalog generation remains blocked.
- DSA arrays, strings, hash maps, sets, two-pointer/sliding-window patterns, prefix/difference arrays, and binary search are separate topics. Their 46 named problems receive distinct queue units; C# solution code is compiled and its assertions executed before workflow commits.

## Coverage review

Track titles and topic manifests provide a broad full-stack outline, but the topic map alone does not prove complete coverage. Several remaining topic titles may still combine substantial scopes, including browser/HTML/CSS, JavaScript functions/prototypes, React/frontend, SQL querying/data modeling, architecture, and infrastructure. Split these when source-derived concept maps reveal an overloaded unit. Every scope needs a checkable product/version boundary; timeless areas should not get artificial version chapters.

The ten-stage learning path places foundational DSA in the programming stage and intermediate DSA after .NET basics, before the web stack. Stage prerequisites form a directed graph so independent paths need not wait on unrelated subjects. Continue refining topic prerequisites as source scopes are completed.

The lesson sequence remains overview → concepts → reference groups → practice units → interview. The overview presents a coherent mental model and running example before the learner reaches the reference catalogs.

## Production readiness

The deterministic prompt builder and scheduled draft worker are active for the explicitly enabled scopes. Draft checks verify exact section headings, included reference names, supplied source URLs, and paths under `course/drafts/`. DSA solutions are compiled and run with embedded assertions before commit. Generated prose is not independently fact-checked; automated shape checks and executable examples cannot establish every factual claim.

The academy is not yet complete. 146 topic inventories remain unfinished, so most queue units are blocked. The three original pilot lessons remain quarantined. The goal of a complete, independently readable curriculum is met only after every intended topic has a source-backed manifest and its lesson files exist.
