# code review refactoring and legacy modernization — Big-picture orientation and mental model

# Problem and purpose

Software changes must be judged for behavior, risk, and future cost while still reaching users. Code review gives another engineer a bounded chance to detect defects, improve design, and understand the change. Refactoring makes existing code easier to change while preserving its externally observable behavior. Legacy modernization applies those practices at system scale, where dependencies, undocumented behavior, data, and business continuity make replacement risky.

These practices form one feedback loop: make an intentional, reviewable change; verify it with automated evidence; have humans reason about what automation cannot establish; then learn from how the software behaves in use. A review is neither a vote on the author nor a substitute for tests. Refactoring is neither a promise that no bug can occur nor permission to smuggle a feature change into a structural diff. Modernization is an investment plan with measurable outcomes and controlled migration steps.

# Plain-language mental model

Treat a code change like a carefully labeled package moving through a checkpoint. The author explains what it contains, why it is needed, what could be affected, and how it was checked. Automated gates scan repeatable properties. Reviewers inspect the parts where context and judgment matter. If the package changes a public contract, data shape, security boundary, or operational behavior, that fact must be visible so the right people can assess it.

For older systems, imagine renovating an occupied building. First learn which doors, pipes, and circuits people rely on, including undocumented ones. Add safe access points and measurements, then replace one bounded area at a time. A perfect blueprint of the old behavior may not exist, so characterization tests and observed workflows help record what the system actually does. Some behavior may be accidental, but silently changing it can still harm users; intentional behavior changes need an explicit product decision.

# How the parts fit together

```text
intent and scope
  └─ small coherent change with context and verification evidence
       ├─ automated repeatable checks
       └─ human review of behavior, design, risks, and edge cases
            └─ resolve comments and disclose residual risk
                 └─ release and observe
                      └─ refactor safely or modernize incrementally
                           ├─ characterize critical behavior
                           ├─ create a seam and migrate a slice
                           └─ verify, roll forward/back, and retire old path
```

Small changes reduce the amount a reviewer must hold in working memory, but “small” is not an absolute line-count threshold. A coherent change can require several files; a tiny change can still be dangerous if it alters authorization or data deletion. Review order should follow risk: understand purpose and boundaries, inspect behavior and failure paths, then assess readability and polish. Review guidance and terminology vary by organization. [Google’s reviewer guide](https://google.github.io/eng-practices/review/reviewer/) [Google’s author guide](https://google.github.io/eng-practices/review/developer/)

# Concept map

| Concern | Author asks | Reviewer asks | Evidence or control |
| --- | --- | --- | --- |
| Intent | What problem and scope does this change address? | Is the proposed change appropriate to that problem? | Description, linked requirement, risk disclosure |
| Behavior | What observable behavior changes? | Are normal, boundary, and failure cases correct? | Tests, contracts, traces, explicit examples |
| Design | Why is this structure understandable and maintainable? | Does it fit the domain and existing boundaries? | Small diff, naming, dependency direction |
| Safety | What can fail and how is harm contained? | Are security, compatibility, performance, and data risks addressed? | Automated checks, targeted expertise, rollback or recovery plan |
| Modernization | What outcome justifies the migration? | Can each slice be validated and reversed or safely continued? | Characterization baseline, seam, migration checkpoints |
| Collaboration | What feedback needs a decision? | Is each comment specific, respectful, and actionable? | Comment resolution, documented decision, follow-up issue |

# End-to-end walkthrough

Suppose a legacy billing service stores a customer’s old and new addresses in one text column. A request asks to support address verification. The author first maps readers and writers of the column, finds exports and downstream jobs, and records critical current workflows. They propose a sequence: add a new nullable structured field, write compatible code that can read both representations, backfill with validation, switch writes, observe parity and errors, then remove the old path only after all consumers are accounted for. The migration is split into reviewable changes with explicit rollout and recovery criteria.

The first change description states the goal, the behavior that remains unchanged, the migration order, risks, and test evidence. Automated checks cover formatting, analyzers, unit/integration behavior, and repository security policy. Reviewers examine whether null/invalid legacy data is handled, whether two application versions can coexist, whether logs expose personal data, and whether the rollback story remains valid after writes begin. Feedback distinguishes a blocking data-loss risk from a naming preference. The author answers with a code change, a reasoned explanation, or a follow-up issue with an owner; “resolved” means the concern has a clear disposition, not necessarily that every suggestion was accepted.

After rollout, the team compares structured-address verification outcomes and migration counts against the baseline. If checks fail, the team pauses or rolls back according to the checkpoint. Only after all consumers use the new contract does it remove compatibility code. This is evolutionary modernization: deliver useful behavior while progressively reducing dependence on the old representation. It does not guarantee reversibility after irreversible data changes, so checkpoints and recovery plans must be designed before rollout. [Fowler on evolutionary database design](https://martinfowler.com/articles/evodb.html) [Fowler on the Strangler Fig approach](https://martinfowler.com/bliki/StranglerFigApplication.html)

# When to use it and tradeoffs

Use code review when a second perspective, shared ownership, or policy requires it; shape the review process so high-risk changes get appropriate expertise without turning every change into a queue bottleneck. Automation should handle deterministic rules, while reviewers examine intent and contextual risk. More approvers do not automatically produce more safety; clear ownership, manageable diffs, prompt feedback, and explicit decision records matter.

Refactor when the expected reduction in future change cost justifies the effort and a credible safety net exists. If tests are weak, first characterize the behavior that matters and transform in small steps. A rewrite can be justified when incremental change cannot meet a defined outcome, but it must budget for discovering undocumented behavior, parallel operation, data migration, and a long period before users receive value. A Strangler Fig approach reduces the size of each replacement but adds transitional architecture and temporary complexity. Neither strategy is universally superior.

# What later lessons cover

The concepts lesson develops review sequencing, behavior-preserving transformations, and modernization decisions. Reference lessons explain every supplied term in review intent, reviewer reasoning, refactoring, migration risk, and team quality gates. Practice exercises review a risky pull request and plan a migration slice. The interview lesson builds concise and deep answers. Detailed Git mechanics are in t09-002; test design is in t10-001 and t10-004; database migration mechanics belong to the database track.

# Sources

- [Google Engineering Practices: code review](https://google.github.io/eng-practices/review/reviewer/)
- [Google Engineering Practices: author guide](https://google.github.io/eng-practices/review/developer/)
- [Martin Fowler: definition of refactoring](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Martin Fowler: evolutionary database design](https://martinfowler.com/articles/evodb.html)
- [Martin Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
