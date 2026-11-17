# System-design coverage map

The [HLD Handbook](https://hld.handbook.academy/) currently reports 159 units across 12 parts: 103 topic modules plus 56 end-to-end case studies. This academy maps all 159 source titles in [the module coverage matrix](system-design-handbook-module-coverage.json). The matrix tracks title coverage separately from depth and factual verification. Each topic connects to the core system-design track and to relevant existing tracks, including .NET, React, databases, security, and operations. System-design lessons compare technologies across ecosystems; those named integrations are examples, not restrictions to the learner’s primary stack. Handbook syllabus titles are adapted under CC BY-SA 4.0; lesson explanations and worked designs are original.

| Handbook part | Units | Academy mapping |
|---|---:|---|
| 0. Prerequisites | 5 | [t12-001 lessons](../course/drafts/t12-001/) and linked cross-track lessons |
| 1. Core Fundamentals | 7 | [t12-001 lessons](../course/drafts/t12-001/) and linked cross-track lessons |
| 2. Building Blocks | 16 | [t12-001 lessons](../course/drafts/t12-001/) and linked cross-track lessons |
| 3. Distributed Systems Theory | 11 | [t12-002 lessons](../course/drafts/t12-002/) and linked cross-track lessons |
| 4. Data Systems | 10 | [t12-003 lessons](../course/drafts/t12-003/) and linked cross-track lessons |
| 5. Architecture Patterns | 11 | [t12-004 lessons](../course/drafts/t12-004/) and linked cross-track lessons |
| 6. Reliability and Operations | 11 | [t12-004 lessons](../course/drafts/t12-004/) and linked cross-track lessons |
| 7. Security at Scale | 10 | [t12-004 lessons](../course/drafts/t12-004/) and linked cross-track lessons |
| 8. Case Studies | 56 | [56 separate worked cases](system-design-case-studies.md) |
| 9. AI & ML System Design | 15 | [t12-005 lessons](../course/drafts/t12-005/) and linked cross-track lessons |
| 10. Emerging Patterns | 1 | [t12-004 lessons](../course/drafts/t12-004/) and linked cross-track lessons |
| 11. Interview Framework | 6 | [t12-006 lessons](../course/drafts/t12-006/) and linked cross-track lessons |

## Technology breadth and stack integration

System-design answers must compare appropriate alternatives across technology ecosystems, including open-source and managed platforms, different languages/runtimes, databases, brokers, caches, storage, networking, and cloud providers. .NET/ASP.NET Core and React are connected where their application and client behavior materially affects the design; they do not constrain the solution. Compare by workload, guarantees, operability, cost, team skill, portability, and current vendor documentation. The technology index and 22 trade-off references provide additional comparison scope.

## Coverage and factual-review status

The matrix currently maps Handbook titles to candidate academy lesson locations. Its coverage status remains title-mapped-depth-audit-pending until each unit’s lesson is checked for complete topic scope and all claims have primary-source evidence. All lesson files remain drafts until their factual-review ledger records claim-level evidence and omissions have been addressed. See [the factual-review ledger](factual-review-ledger.json).
