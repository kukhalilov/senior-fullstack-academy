# end-to-end system design case studies — Reference: MOSS

Sources: [HLD Handbook](https://hld.handbook.academy/), [Stanford MOSS service and policies](https://theory.stanford.edu/~aiken/moss/), [Schleimer, Wilkerson, and Aiken: Winnowing—Local Algorithms for Document Fingerprinting](https://theory.stanford.edu/~aiken/publications/papers/sigmod03.pdf).

## Scope and version

MOSS (“Measure Of Software Similarity”) is a Stanford-hosted service for finding similarities between programs. The official service page was checked on 2026-11-17; its current terms, accepted languages, submission limits, and data handling are subject to change. MOSS identifies similarity, not intent or misconduct. Its result must be interpreted by a qualified human in the context of the assignment, permitted collaboration, starter code, and evidence.

The Stanford page currently states that submitted code appears in results accessible to anyone who has the result URL; results are typically removed after 14 days, but may be deleted sooner; and submissions are limited to 100 per day per user. It also says the service is for non-commercial use. Verify the current page before submitting confidential, personal, commercially sensitive, or institutionally restricted code.

## How this group fits the mental model

Suppose a teacher or code-review team must compare thousands of programs. Comparing every character pair is expensive, and a whole-file checksum finds only exact copies. A similarity system instead normalizes code enough to ignore some irrelevant changes, extracts compact fingerprints, finds shared regions, and presents pairs and passages worth reviewing.

This is an information-retrieval and human-review pipeline. The service computes candidate similarity; a reviewer decides whether it comes from shared starter code, a common algorithm, collaboration allowed by the rules, independent convergence, copied work, or something else. A high score is a signal to inspect evidence, never an automatic verdict.

## Supplied names explained

- `MOSS` — Stanford's Measure Of Software Similarity service. It compares submitted programs and highlights similar passages to help identify pairs for closer review. Stanford explicitly warns that MOSS cannot determine why programs are similar and that similarity scores alone are not proof of plagiarism.

### Similarity pipeline and fingerprinting intuition

The Winnowing paper explains local document fingerprinting and reports experience with MOSS. A simplified fingerprinting pipeline is:

1. **Prepare comparable input.** Select the relevant files, language, and submission groups. Exclude known common material such as instructor-provided code when the tool supports it. File selection and exclusions strongly affect results.
2. **Normalize selected syntax.** A detector may remove or standardize features such as whitespace, comments, or identifier names so simple formatting or renaming changes do not hide structural overlap. The exact MOSS transformations are service-specific; do not assume every transformation occurs or that all semantic changes are ignored.
3. **Build k-grams.** A k-gram is a contiguous sequence of `k` tokens or other normalized units. Hash each k-gram. Choosing k trades sensitivity to short fragments against noise from common boilerplate. The paper's document-fingerprinting technique uses a subset rather than retaining every hash.
4. **Select local fingerprints.** Winnowing selects representative hash fingerprints from windows to provide a detection guarantee for sufficiently long shared sequences under its defined parameters. In plain terms, it reduces storage and comparison work while trying not to miss every long-enough copied region. It can still miss short overlap or produce common matches.
5. **Find candidates and passages.** An index or comparison stage finds documents sharing fingerprints and maps them back to locations so a report can show matched passages. Similarity percentages are useful for ranking relative overlap, but they do not quantify intent, direction of copying, or policy violation.
6. **Review with context.** Inspect the actual code, assignment prompt, starter files, common solution space, timing/version history where legitimately available, permitted discussions, and the applicable academic or organizational rules. Record the evidence and uncertainty; do not treat a report as a final decision.

The fingerprinting paper provides an algorithmic basis and analysis for Winnowing. It does not disclose every implementation detail of the current MOSS service, its current thresholds, ranking formula, or report internals. Keep those boundaries explicit.

## Cross-item comparison

This assigned group contains only MOSS, so no within-group comparison applies. More generally, exact hashing, token/AST comparison, fingerprint retrieval, and semantic/behavioral analysis answer different questions. Exact hashes identify byte-identical inputs. Token or syntax-aware comparison can find similar structure after superficial changes. Fingerprinting scales candidate search and locates shared regions. Semantic or execution-based analysis can find behaviorally similar code with very different structure, but costs more and can be difficult to apply safely.

No single technique detects every form of copying or proves misconduct. A robust review process combines a tool's candidate evidence with assignment context and fair procedures. Use tools as triage, not as a replacement for human judgment, an explanation from the learner, or the institution's published process.

## Examples

### Shared starter code

Two submissions both contain the same required parser scaffold. MOSS may highlight it, and the percentage of shared code may be large for a short assignment. Compare the highlighted regions with the supplied starter files and exclude expected shared material when appropriate. Then inspect overlap in the parts students were expected to implement.

### Common algorithm, different expression

Many learners implement binary search with similar loop conditions because the specification constrains the algorithm. Similarity in a short canonical pattern alone is weak evidence. Compare longer, unusual structural sequences and surrounding implementation choices, but still account for the task, course materials, and allowed collaboration.

### Report handling and privacy

An instructor submits a cohort's source files to the hosted service. The report URL is an access credential in practice because anyone who obtains it can view submitted code in the result. Restrict result links, avoid posting them publicly, minimize submitted data, and check institutional policy and current service retention terms before upload. If the data cannot be sent to a hosted service, use an approved local process or another reviewed option.

## Common mistakes

- Calling a similarity report a plagiarism verdict.
- Treating a percentage as a probability that someone copied or as proof of intent.
- Ignoring assignment scaffolding, public examples, common algorithms, libraries, or instructor-provided code.
- Assuming the current MOSS implementation uses every detail of a published fingerprinting paper.
- Believing identifier renaming or formatting changes necessarily defeat or necessarily preserve a match.
- Submitting confidential code without checking who can access the report URL and how long results remain.
- Assuming service limits, supported languages, or terms are permanent.
- Comparing only whole-file scores instead of examining highlighted regions and their context.
- Using a detector as the sole basis for a consequential academic or employment action.
- Failing to give the person a fair chance to explain legitimate overlap and review the evidence.

## Knowledge checks with answers

1. **What does MOSS report?** Similarity between programs and passages that appear alike; it does not determine why the similarity exists.
2. **What is a k-gram?** A contiguous sequence of `k` normalized units used as a building block for a document fingerprint.
3. **What does Winnowing try to achieve?** Select a smaller set of local fingerprints while retaining guarantees about detecting sufficiently long shared sequences under the algorithm's parameters; it is not a guarantee to detect every kind of plagiarism.
4. **Does a high similarity score prove misconduct?** No. The task, starter material, common solutions, rules, and actual matched code require human review.
5. **What data-handling issue should be checked before using hosted MOSS?** The official page says submitted code appears in results accessible to anyone with the result URL, and gives a typical but not guaranteed retention period. Verify current terms and protect the link.

## Practice

Design a code-similarity review process for a large introductory course. State what files are submitted, how starter code is handled, who can access result links, the human review steps, how students can respond, and how decisions are recorded. Explain why the system should prioritize suspicious regions without automatically assigning blame.
