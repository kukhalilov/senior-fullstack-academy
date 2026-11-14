# Production status

Scheduled generation now writes checked-shape drafts for explicitly enabled manifests. Whole-catalog generation and publishing remain disabled. The legacy pilot lessons failed review and remain quarantined.

## Curriculum structure

`curriculum/catalog.json` is the topic index. Each topic has one compact JSON manifest. `curriculum/prompt-template.json` contains shared teaching instructions. The queue creates an overview and concept lesson first, one reference lesson per inventory group, then practice and interview lessons. Comparisons and recent version notes are optional manifest data; they do not create a lesson phase by default.

The overview must establish the purpose, mental model, relationships among major concepts, and a running example before a learner encounters item-by-item API details. Reference lessons use exact names from their manifest. A model must never be asked to discover names or release changes from memory.

## Current inventory work

The initial 149 topic map contained several mixed scopes. The JavaScript values/types/collections topic has been split into smaller scopes, including arrays, coercion/equality, Map/Set, weak collections, typed arrays, and iterators. JavaScript values/types and Array have bounded inventories based on ECMAScript 2026; C# program structure is scoped to C# 14 and the Microsoft Learn fundamentals reference. The Array manifest includes relevant recent edition changes, a concept map, and 48 exact names grouped into ten reference lessons. The other 153 topic manifests remain incomplete scaffolds.

Only source-backed manifests with `inventoryComplete: true` and `generationAllowed: true` enter the scheduled draft worker. The worker uses the shared template and the relevant closed inventory, validates required section labels and exact reference-name inclusion, and writes to `course/drafts/`. These checks do not establish factual accuracy. Every other topic remains blocked until its concepts, finite source boundary, exact names, and relevant version notes are curated. Whole-catalog generation remains blocked.

## Next steps

1. Split broad scopes and define an ordered prerequisite path.
2. Curate and verify exact concept/API/feature inventories from primary sources.
3. Expand deterministic checks for citations, code, DSA solutions, and generated-file validation.
4. Enable additional manifests only after their inventory evidence is complete.
5. Build and validate DSA problems and solutions in the repository.
