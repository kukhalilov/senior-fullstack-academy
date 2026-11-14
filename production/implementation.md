# Production status

## Curriculum structure

`curriculum/catalog.json` indexes 196 atomic topics across 11 tracks. Every topic has one JSON manifest. `curriculum/prompt-template.json` contains the shared authoring contract, and `curriculum/queue.json` is rebuilt from those manifests. The current queue has 1,492 units: overview and concept lessons first, then bounded reference groups, practice units, and interview preparation. Every named DSA problem receives a separate practice unit.

The overview establishes the purpose, mental model, relationships among major concepts, and a running example before item-by-item API details. Reference lessons explain only names explicitly listed in their assigned manifest group. Timeless topics do not receive artificial version lessons. Relevant major recent release changes are included only when their exact release and source are recorded.

The learning path puts foundational DSA in the programming stage and intermediate DSA after .NET basics, before the web track. Later stack topics follow their own prerequisites in `curriculum/learning-path.json`.

## Inventory and generation status

Seventy-five manifests have source-backed inventories: seventy-four are fully enabled for draft generation and one DSA analysis topic enables all phases except its practice unit. Thirty-two enabled DSA topics have 213 named practice problems between them. The remaining 121 manifests do not yet have complete concept maps and exact closed inventories, so they remain blocked.

GitHub Actions runs automatically every six hours with a maximum of 100 Gemini API calls per run, counting retries, second-pass content reviews, and revisions. The worker writes checked-shape drafts to `course/drafts/`. Deterministic checks verify required headings, supplied reference names, allowed citations, and output paths. Each lesson receives a second-pass review against the same frozen manifest; issues trigger bounded rewriting. Each DSA problem must contain a standalone C# solution that builds and passes its embedded checks on .NET 10 before the workflow commits generated files. Automated review does not prove that the teaching prose is factually complete or correct. The three original pilot lessons failed quality review and remain quarantined.

`npm run validate:catalog` intentionally fails until all 196 topic inventories are complete. Whole-catalog generation is not enabled.
