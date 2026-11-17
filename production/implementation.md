# Historical implementation notes

> Superseded on 2026-11-17. These notes describe a former repository state and are not current instructions. GitHub Actions generation was removed; see [automation status](automation.md) and the current [README](../README.md).

## Curriculum structure

`curriculum/catalog.json` indexes 200 atomic topics across 11 tracks. Every topic has one JSON manifest. `curriculum/prompt-template.json` contains the shared authoring contract, and `curriculum/queue.json` is rebuilt from those manifests. The current queue has 1,867 units: overview and concept lessons first, then bounded reference groups, practice units, and interview preparation. Every named DSA problem receives a separate practice unit.

The overview establishes the purpose, mental model, relationships among major concepts, and a running example before item-by-item API details. Reference lessons explain only names explicitly listed in their assigned manifest group. Timeless topics do not receive artificial version lessons. Relevant major recent release changes are included only when their exact release and source are recorded.

The learning path puts foundational DSA in the programming stage and intermediate DSA after .NET basics, before the web track. Later stack topics follow their own prerequisites in `curriculum/learning-path.json`.

## Inventory and generation status

One hundred sixty-six manifests have source-backed inventories: one hundred sixty-five are fully enabled for draft generation and one DSA analysis topic enables all phases except its practice unit. Thirty-two enabled DSA topics have 213 named practice problems between them. The remaining 34 manifests do not yet have complete concept maps and exact closed inventories, so they remain blocked. Cloud scope is split into provider-neutral foundations, Azure, and AWS inventories.

GitHub Actions starts a four-lesson, eight-request batch after curriculum source updates, then runs automatically every four hours with a maximum of 160 Gemini API calls per scheduled run, counting retries, second-pass content reviews, and revisions. Calls alternate between Gemini 3.5 Flash-Lite and Gemini 3.1 Flash-Lite; one update batch plus six scheduled runs caps each model at 484 requests for that day, below the observed 500 RPD limit. The worker writes checked-shape drafts to `course/drafts/`. Deterministic checks verify required headings, supplied reference names, allowed citations, and output paths. Each lesson receives a second-pass review against the same frozen manifest; issues trigger bounded rewriting. Each DSA problem must contain a standalone C# solution that builds and passes its embedded checks on .NET 11 before the workflow commits generated files. Automated review does not prove that the teaching prose is factually complete or correct. The three original pilot lessons failed quality review and remain quarantined.

The C# track now includes frozen, source-backed inventories for inheritance/interfaces/accessibility, fields/properties/indexers/methods/parameters, generic declarations and constraints, covariance/contravariance, delegates/events/lambdas/expression trees, patterns/user-defined operators/conversions, collections, and exception/disposal behavior. `npm run validate:catalog` intentionally fails until all 200 topic inventories are complete. Whole-catalog generation is not enabled.
