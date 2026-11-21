# end-to-end system design case studies — Reference: Software similarity plagiarism detection (MOSS-style)

Sources: [Stanford MOSS: Plagiarism Detection](https://theory.stanford.edu/~aiken/moss/), [JPlag project](https://github.com/jplag/JPlag), [JPlag comparison algorithm technical report](https://page.mi.fu-berlin.de/prechelt/Biblio/jplagTR.pdf), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson describes a system that compares programming submissions and highlights suspicious similarity for instructor review. MOSS is Stanford’s Measure Of Software Similarity; JPlag is a separate source-code comparison system. These tools do not determine intent, authorship, or misconduct. Stanford explicitly states that a human must inspect highlighted similarities and decide whether plagiarism occurred. Check each service’s current terms, supported languages, data handling, and usage limits before sending student code.

## How this group fits the mental model

The system takes a cohort of submissions for one assignment, normalizes or tokenizes source according to language/tool support, compares submissions and optionally known starter/base code, then produces candidate pairs and highlighted regions. An instructor uses those reports alongside assignment context, allowed collaboration rules, common starter material, and student explanations. The output is an investigation queue—not a verdict.

The comparison corpus matters. If the system compares only two files, it cannot reveal patterns across the class. If it compares many years or sections, reused starter code and common idioms can create expected matches. Base-code exclusion can reduce matches on supplied scaffolding, but must be configured correctly. An algorithm can miss transformed code or report legitimate similarity when assignments constrain everyone to the same solution shape.

## Supplied names explained

- **MOSS:** Stanford-hosted Measure Of Software Similarity service for comparing program submissions; its report highlights matches, while human judgment remains necessary.
- **JPlag:** an independent open-source tool with language modules and pairwise comparison/reporting features; do not assume its algorithm, input handling, or results are identical to MOSS.
- **Normalization/tokenization:** maps source into representations that reduce superficial differences and allow structural comparison; language parsing and preprocessing affect what can be detected.
- **Base code:** instructor-provided or otherwise expected code excluded or discounted during comparison so common scaffolding is less likely to dominate results.
- **Similarity score/report:** a ranking and visualization to prioritize review, not a calibrated probability that a student cheated.
- **Review case:** human analysis of source context, assignment instructions, chronology, collaboration policy, and evidence before any academic action.

## Cross-item comparison

| Tooling approach | Use | Limit |
| --- | --- | --- |
| MOSS | Hosted comparison of submissions with visual reports | Uploads source to an external service; report is not a misconduct decision; current service terms and supported languages apply |
| JPlag | Open-source/local or programmatic source comparison with supported languages and report tooling | Requires operating and configuring the tool; similarity still needs contextual human interpretation |
| Text diff | Exact line-level changes between two files | Fragile to harmless renaming/reformatting and does not rank cohort-wide structural similarity |
| Static analysis/testing | Finds code properties, defects, or behavior | Does not establish whether students copied work |

## Examples

An instructor assigns a common parser exercise and gives everyone the same starter file. A comparison tool flags many submissions because they retain identical method signatures, comments, and provided parsing scaffolding. Exclude the known base code where supported and focus review on the non-base regions. Two solutions may still converge because the assignment has one natural approach; inspect uncommon matching sequences, chronology, and policy context before drawing conclusions.

For data handling, define which files are submitted, whether hidden files or build artifacts are excluded, who may access reports, how long code and result URLs remain available, and whether external upload is permitted. Stanford’s MOSS page warns that submitted code appears in reports accessible to anyone with the result URL; treat report links as sensitive and follow institutional policy.

## Common mistakes

- Calling a high score “proof” or treating a low score as proof of independent work.
- Comparing starter code, generated files, or standard-library boilerplate as if it were student-authored.
- Ignoring assignment design, allowed collaboration, public examples, and common algorithmic solutions.
- Using one threshold across languages, assignment types, cohort sizes, and tools without calibration.
- Uploading source code or reports without checking consent, policy, retention, and access controls.
- Assuming MOSS and JPlag use the same algorithm or expose the same data.
- Using the tool as a substitute for clear assignment design, code review, oral explanation, or fair investigation procedures.

## Knowledge checks with answers

1. **What does a similarity report establish?** It identifies code that merits inspection; it does not establish intent or a policy violation.
2. **Why exclude base code?** Shared scaffolding is expected and can obscure the parts that distinguish submissions.
3. **Why is source upload a security/privacy concern?** Student work may be confidential or regulated, and report links or stored copies may expose it; follow service and institutional rules.
4. **What is the fair next step after a suspicious match?** A trained reviewer examines highlighted code and context under the published collaboration policy, then gives the student a fair opportunity to respond.
