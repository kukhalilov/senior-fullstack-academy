# Scope and readiness audit — 2026-11-14

## Inventory totals

- 11 tracks and 157 canonical topic manifests.
- 799 planned lesson units in overview → concepts → bounded references → practice → interview order.
- 3 topic manifests are enabled for draft generation; a fourth, DSA cost analysis, has a complete source-backed inventory but remains blocked until generated C# solutions can be checked.
- 153 manifests remain inventory scaffolds; the existing validator fails as intended.
- Three legacy pilot lessons remain in `course/` with quarantine warnings and are excluded from the accepted curriculum.
- Scheduled GitHub Actions generation is implemented for manifests explicitly enabled for draft generation. JavaScript values/types, Array, and C# program structure are currently enabled; whole-catalog generation is still blocked.
- DSA is listed as a track, but it currently has no independently generated course lessons.

## Coverage review

Track titles and topics provide a useful senior full-stack outline, but they do not prove complete coverage. Several topic titles still combine broad areas—for example, browser/HTML/CSS, JavaScript functions/prototypes, React/frontend, SQL querying/data modeling, architecture, and infrastructure. These should be split further when their source-derived concept maps show that a lesson would become an overloaded unit. Each scope must say what current product/version boundary it covers; timeless areas should not get artificial version chapters.

A first 10-stage prerequisite learning path now covers all topics; its ordering should be refined as topic scope work progresses. The curriculum still needs a DSA problem catalog with named patterns, representative problems, constraints, hints, complete C# solutions, dry runs, complexity analysis, and test cases. The per-topic sequence remains overview → concepts → references → practice → interview.

## Production readiness

The deterministic prompt builder and scheduled draft worker now exist. Draft generation is limited to three explicitly enabled source-backed manifests. Current checks validate exact section headings, reference-name coverage, source URL allowlists, and output path containment, then save files under `course/drafts/`; they do not establish factual accuracy. Add syntax/code execution checks and DSA solution/test completeness before enabling more manifests. A second model review would remain advisory, not factual validation.

The first 10-stage learning path now places all 157 topics in an explicit order, and a scheduled draft worker is active for the three enabled manifests. The current repository is still not a complete self-study academy. The user requirement that the full curriculum be committed and independently readable is not met until lesson files exist for every accepted topic and DSA practice set.
