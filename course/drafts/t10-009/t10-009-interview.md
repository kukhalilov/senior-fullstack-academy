# architecture interviews tradeoffs requirements and constraints — Interview questions and reasoning

## Core questions

These interview methods follow [Microsoft technical interview guidance](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html) and the [Google Cloud architecture framework](https://docs.cloud.google.com/architecture/framework).

1. How do you start a system-design interview when the prompt is vague?
2. What is the difference between functional and nonfunctional requirements?
3. How do you estimate RPS from a daily-active-user assumption?
4. Why do you separate average and peak demand?
5. What belongs in a useful high-level architecture diagram?
6. When would you introduce a queue, cache, read replica, or shard?
7. How do retries, idempotency, and at-least-once delivery interact?
8. How do you explain consistency and freshness requirements?
9. What do RPO and RTO measure?
10. How do you respond when the interviewer changes a constraint?

## Concise interview answers

1. Restate the product goal, identify the primary user journey, ask a few decision-changing questions, and state any remaining assumptions before drawing a baseline.
2. Functional requirements name capabilities; nonfunctional requirements qualify their performance, availability, security, privacy, durability, or operating limits.
3. Divide `DAU × requests per user per day` by 86,400 seconds, then state active-time distribution and exclusions such as retries or background fan-out.
4. Averages hide bursts and overload. Peak rate needs a meaningful time window and should come from data or a labeled assumption.
5. Show clients, entry point, services, authoritative data stores, derived stores, asynchronous components, ownership, and important synchronous/asynchronous arrows.
6. Add each after naming its requirement or measured bottleneck. Explain its freshness, failure, cost, and operating implications.
7. At-least-once delivery can repeat a message. Retries need bounds; idempotent processing or deduplication prevents repeated side effects.
8. Define which user operation reads which version of data and within what delay. “Eventually consistent” alone does not describe the user experience.
9. RPO bounds acceptable data-loss time; RTO is the target recovery duration. Both should be validated by recovery exercises.
10. Clarify the new requirement, identify which assumptions or guarantees it invalidates, compare the affected alternatives, and pivot only the necessary parts while narrating the change.

## Deep follow-up answers

**What happens when a user types into a search bar?** The browser input updates local state; optional debounce schedules a request; cancellation and a generation guard prevent obsolete results from winning a race. The API validates and authorizes, applies rate/query bounds, and searches an appropriate index or store. The UI models loading, no results, errors, keyboard selection, and accessible announcements. Client cancellation does not guarantee server work never started, and result selection must re-check authorization.

**Explain the critical rendering path.** The browser parses HTML into DOM and CSS into CSSOM, executes scripts according to loading semantics, constructs a render tree, computes style and layout, paints, and composites. Identify actual blocking resources with a trace. Optimize discovery, transfer, and main-thread work for the target metric; preserve correctness and verify the change.

**How do you deploy a full-stack change safely?** Build and test a versioned artifact once, promote it through environments, protect credentials, and use a staged rollout with health and user-facing signals. Make schema changes backward compatible while old and new versions overlap; expand, backfill, then contract. Stop or roll back application traffic on regression, but do not assume a destructive database migration can be reversed.

**What if a cache is stale?** State the permitted staleness and invalidation/update policy. If correctness is strict, read from the source or use a version/consistency mechanism. If eventual freshness is acceptable, monitor lag and provide a rebuild/repair strategy.

**When do you choose a monolith over services?** Start with cohesive modules in one deployable when independent scaling, release, ownership, or isolation requirements do not justify network boundaries. Split when evidence shows a boundary has independent value and the team can operate the added failure modes.

## Scenario questions

1. A 10x load increase is announced late in the interview. Which estimates and bottlenecks do you revisit first?
2. A dependent service is timing out. Explain what your caller does and how you prevent retry amplification.
3. A product requires reads of a user's own write immediately, but other users may see the update later. What consistency contract is this?
4. The interviewer asks for multi-region active-active. Which data conflict, residency, and recovery questions must be answered before selecting it?

## Tradeoffs and alternatives

Use a relational database for transactional relationships when its model fits; use document storage when aggregate-shaped access and update behavior fit. A queue buffers work while a stream supports retained ordered event consumption within partition boundaries. A cache lowers repeated read cost but adds freshness and invalidation work. A single-region baseline is easier to reason about; multi-region can improve geographic resilience only when replication and failover semantics are designed.

## Common weak answers

- “Use microservices/Kafka/Redis” with no requirement or failure model.
- “Scale horizontally” without state ownership, partition keys, or a bottleneck.
- “Retry on error” without deadline, budget, backoff, or idempotency.
- “Use eventual consistency” without a bounded user-visible freshness expectation.
- Presenting exact capacity from guessed inputs without a range or validation plan.

## Self-check rubric

Score each from 0 (missing) to 2 (clear and supported): requirements, assumptions, capacity units, read/write flow, data ownership, tradeoffs, failure behavior, security/privacy, and concise summary. A strong interview answer scores at least 14/18 and invites correction as it develops.
