# System-design coverage map

The [HLD Handbook](https://hld.handbook.academy/) organizes its syllabus into 12 parts and 159 modules, including 56 end-to-end case studies. This map connects that syllabus to the existing course and new system-design lessons. The Handbook guides topic selection; the lessons below are original explanations and worked designs rather than copied chapter text. Its case-study topic list is adapted in [the case-study index](system-design-case-studies.md) under CC BY-SA 4.0.

| Handbook part | Main topics | Course coverage |
|---|---|---|
| 0. Prerequisites | Networking, OS behavior, distributed data structures, database fundamentals, API design | [t12-001](../course/drafts/t12-001/t12-001-overview.md); C# concurrency/memory/collections in Track 01; HTTP/API protocols in t08-007; SQL and EF Core in Tracks 03–04 |
| 1. Core fundamentals | Scalability, latency/throughput/tail behavior, availability, consistency, estimation, interview method, tradeoffs | t08-006, t08-012, [t10-009](../course/drafts/t10-009/t10-009-overview.md), and t12-001 concepts |
| 2. Building blocks | Load balancing, proxies/gateways, CDN/cache, SQL/NoSQL, sharding/replication, queues/streams/pub-sub, realtime, rate limits, discovery/mesh, object storage, geospatial, edge | [t12-001](../course/drafts/t12-001/t12-001-concepts.md) and its reference groups; t08-007–013; t09 infrastructure/cloud lessons |
| 3. Distributed-systems theory | Consensus, consistency, quorums, CAP/PACELC, clocks, CRDTs, distributed transactions, idempotency, failure detection, hashing, anti-entropy | [t12-002](../course/drafts/t12-002/t12-002-overview.md); t08-005 and t08-008–012 |
| 4. Data systems | B-tree/LSM storage, OLTP/OLAP, lake/warehouse/lakehouse, batch/stream, CDC/outbox, search, time series, graph, vector, key-value | [t12-003](../course/drafts/t12-003/t12-003-overview.md); SQL Server and EF Core Tracks 03–04; t08 messaging/cache topics |
| 5. Architecture patterns | Monolith/microservices, team boundaries, event-driven, CQRS, event sourcing, serverless, BFF, Strangler, clean/hexagonal, multi-region, multi-tenancy, local-first | [t12-004](../course/drafts/t12-004/t12-004-overview.md); t08-001–005; ASP.NET Core and React architecture lessons |
| 6. Reliability and operations | Observability, SLI/SLO/SLA, resilience, degradation, scaling, deployment, chaos, incidents, health/readiness, FinOps, platform engineering | t12-004; t02-016 and t02-021; Track 09 operations and deployment; t08-006, t08-009, t08-013 |
| 7. Security at scale | AuthN/AuthZ models, OAuth/OIDC/JWT, mTLS, secrets, DDoS/WAF, residency/erasure, supply chain, privacy-preserving ML, post-quantum migration | t12-004 security reference; Web Security Track 05; ASP.NET Core identity/security in t02-011–014 |
| 8. Case studies | 56 end-to-end designs spanning URLs, messaging, feeds, payments, infrastructure, AI, marketplaces, and developer platforms | [t12-006](system-design-case-studies.md) has 56 separate prompt-and-worked-answer lessons; t10-009 adds cross-domain interview scenarios |
| 9. AI/ML system design | LLM serving, RAG, vector retrieval, agents, evaluation, LLMOps, cost, safety, ML systems, features/recommendations, voice, multimodal, AI data/MCP | [t12-005](../course/drafts/t12-005/t12-005-overview.md); web security and React/.NET lessons provide application-level boundaries |
| 10. Emerging patterns | Carbon-aware scheduling, PUE, sustainable computing | Sustainability, carbon-aware scheduling, PUE, and FinOps unit economics in t12-004 reference lessons |
| 11. Interview framework | Scoping, prioritization, diagramming, tradeoff communication, company context, RFC/ADR/design docs | [t10-009](../course/drafts/t10-009/t10-009-interview.md), t12-006 design artifacts, and the 56 case exercises |

## Stack-specific integration

- **.NET / ASP.NET Core:** t01-016 connects asynchronous work and bounded concurrency to service capacity. t02-016 explains end-to-end OpenTelemetry tracing from HTTP through SQL and queued work. t02-021 covers readiness, draining, proxy trust, and schema-compatible rollout. t04-008 explains why EF Core transactions do not include broker delivery and how an outbox composes with idempotent consumers.
- **React / frontend:** t07-009 connects server rendering, streaming, hydration, cache scope, and asset delivery to the request path. t07-013 ties client/server trust boundaries to tenant authorization. t07-023 covers route data caches, freshness, server mutations, and mixed-version asset/API deployments. t10-009 retains the critical-rendering-path and end-to-end search questions.

## Case-study scope

Each of the 56 named case-study prompts has an individual Markdown lesson with a case-specific design answer, exercises, failure tests, and reflection questions. Workload numbers displayed by the source handbook are not treated as universal facts: each interview answer requires the learner to state and test its own assumptions.
