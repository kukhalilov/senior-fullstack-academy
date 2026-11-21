# ai and machine learning system design — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [NIST Generative AI Risk Management Profile](https://nvlpubs.nist.gov/nistpubs/AI/NIST.AI.600-1.pdf), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [Google Cloud RAG architecture](https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search), [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/), [Feast architecture](https://docs.feast.dev/getting-started/components/overview), [MLflow registry workflow](https://mlflow.org/docs/latest/ml/model-registry/workflow/).

## Core questions

1. Restate the user outcome, constraints, and unacceptable failures.
2. Ask only high-impact clarifying questions; state assumptions for the rest.
3. Estimate workload and data growth enough to reveal bottlenecks.
4. Draw the simplest system and trace one read and one state-changing path.
5. Decide where a model helps and what remains deterministic.
6. Explain data lineage, freshness, permissions, evaluation, and rollout.
7. Walk through overload, dependency failure, timeout, attack, and rollback.
8. Close with trade-offs, unresolved risks, and the evidence needed next.

## Concise interview answers

1. **How do you decide if the feature needs an LLM?** Compare deterministic rules, search, classical ML, human review, and LLM against the user task, error cost, ambiguity, privacy, latency, and cost. Start with a measurable baseline.
2. **How do you make a RAG answer trustworthy?** Authorize source retrieval, track source version/ACL/freshness, measure retrieval separately from answer grounding, validate citations, include no-answer cases, and abstain when evidence is insufficient. RAG alone is no guarantee.
3. **How would you design an LLM evaluation suite?** Version representative golden cases, measure component and end-to-end behavior, include adversarial and subgroup slices, use deterministic checks where possible, calibrate model judges against people, and define release/rollback gates.
4. **How do you mitigate prompt injection?** Treat user and retrieved text as untrusted; keep tools narrow, enforce authorization and policy in code, validate arguments, isolate tenants, bound steps and data, and test attack paths. Prompt wording is not the security boundary.
5. **How do you choose between training and retrieval?** Retrieval supplies changing external evidence at request time; fine-tuning changes model behavior/weights for learned patterns. They can be combined. Neither provides access control automatically. Compare freshness, task, data rights, quality, latency, and operational cost.
6. **How do you serve a high-volume model?** Profile representative input/output lengths, concurrency, hardware, prefill/decode, queue, KV memory, throughput, tail latency, and cost. Apply bounded admission, batching, isolation, autoscaling or capacity planning, and fallback; benchmark the actual release.
7. **How do you diagnose offline success but online failure?** Check population shift, feature freshness/skew, leakage in offline evaluation, feedback/exposure bias, serving configuration, delayed labels, and product-side changes. Reproduce with versioned inputs and compare cohorts.
8. **How should a recommendation system be evaluated?** Measure candidate recall and ranking separately, then user/business outcomes plus freshness, coverage, diversity, fairness, and latency. Log exposures and positions because unshown items cannot produce observed clicks.
9. **What does a model registry provide?** Lineage, immutable versions, metadata, and references used by deployment. It does not ensure that deployment loaded the intended artifact or that data/evaluation is valid. In current MLflow guidance, use aliases and tags rather than deprecated fixed stages.
10. **When should you use multiple agents?** Only when decomposition or parallelism improves a measured requirement enough to justify cost, correlated failure, coordination, state, and tool risk. Bound the graph and validate every side effect.

## Scenario questions

- A user types a query into a search bar: how do debounce, request cancellation, cache keys, authorization, ranking, stale responses, and keyboard/accessibility behavior interact?
- A deployment changes prompt, model, index, and feature schema at once. How do you identify the cause of a regression and roll back independently?
- A third-party model times out after possibly completing. Is the outcome known? How do you avoid duplicate side effects and reconcile status?
- Peak demand doubles while one tenant dominates GPU time. How do admission control, fairness, quotas, and capacity planning protect other tenants?
- The GPU is busy but p99 latency is rising. How do queue wait, prefill/decode, output length, retrieval, and downstream tools change your diagnosis?
- The evaluation score improves but privacy incidents rise. Which release gate failed and how should data access be redesigned?
- An embedding model changes. How do you migrate indexes, dual-read or rebuild, preserve rollback, and verify that cached vectors are not mixed?
- A batch prediction is stale while online feature lookup is down. What fallback is safe for the user and business decision?
- An agent’s tool call succeeds but the response stream disconnects. How do you determine whether the action happened?
- A voice agent is interrupted while a tool is running. Which work can be cancelled, which must be reconciled, and how do late events get rejected?
- How do you delete a user’s source document from connectors, parsed text, embeddings, vector indexes, caches, and evaluation traces?
- A model cascade escalates nearly every request. How do you establish whether the routing threshold, cheap model, or workload is the problem?
- How do you support a new language where labels and evaluation data are sparse without claiming parity from an aggregate metric?
- A feature store reports healthy reads but prediction quality falls. Which freshness, point-in-time, default-value, and skew evidence do you inspect?
- How do you explain why you chose an LLM instead of a conventional model or deterministic workflow to a security reviewer?

## Deep follow-up answers

For each design, go beyond component selection: state the invariant each mechanism protects, its limits, the measurement that would reveal failure, and the recovery owner. Ask how versions and permissions propagate to derived data. Explain what the user sees when a dependency misses its deadline.

## System design case: document assistant

**Prompt:** Design a private assistant over thousands of changing company documents. It answers questions and may create a draft ticket, but must not expose cross-team documents or create tickets without authorization.

**Reasoning outline:** Clarify user roles, document ACL source, freshness requirement, supported formats/languages, query load, answer-risk level, ticket policy, retention, and latency budget. Draw connector → parse/chunk/metadata → lexical and/or vector index → ACL-filtered retrieval → optional reranking → bounded generation → citation validation/abstention → authorized ticket workflow. Keep the ticket tool narrow and separate from answer generation. Include deletion propagation, connector cursor recovery, index rebuild, prompt injection tests, token/tool budgets, and audit.

**Evaluation and rollout:** Build retrieval labels and end-to-end answer cases, including no-answer, revoked access, outdated versions, injected instructions, and unauthorized ticket attempts. Compare retrieval recall, citation support, answer quality, refusal correctness, p95 latency, and successful-task cost. Run offline tests, shadow, then a small safe canary. Define rollback triggers and owners before launch.

**Failure analysis:** If answer quality falls after an index refresh, compare ingestion, parsing, ACL metadata, embeddings, index state, retrieval, and answer generation separately. If a ticket request times out, query its idempotency/status key before retry. If source permission is revoked, purge or filter derived chunks and caches before further answers.

## System design case: recommender with cold start

Clarify the target: watch time, conversion, satisfaction, or another value; define harmful outcomes, freshness, peak traffic, catalog size, and privacy constraints. Filter ineligible inventory deterministically. Generate candidates with a simple popularity/content baseline, then compare two-tower or ANN retrieval if scale and relevance need it. Rank candidates using point-in-time features. Apply policy constraints after scoring. Give new users a transparent default and use controlled exploration where appropriate.

Log exposure, position, features/model versions, and outcomes. Evaluate candidate recall, ranking quality, coverage, diversity, subgroup quality, latency, and business outcome. Guard against feedback loops and leakage. Batch scores are suitable only if their freshness meets the target; otherwise blend with bounded online features. Canary a candidate and rollback on predeclared safety or quality regression.

## System design case: real-time voice assistant

Clarify acceptable turn-taking delay, supported audio, languages, call concurrency, recording consent/retention, interruption behavior, and tool authority. Trace capture → transport → endpointing/VAD → streaming ASR → bounded model/tool workflow → streaming TTS → playback. Tag every event with session and turn IDs. Barge-in cancels or invalidates older generation and playback; late partial transcripts cannot trigger irreversible actions. Measure time to first useful audio and interruption stop time, not only model time. Test network jitter, reordered packets, ASR revisions, TTS failure, tool timeout, cancellation races, and reconnection.

## Tradeoffs and alternatives

- **RAG vs fine-tuning:** dynamic evidence vs learned behavior; both can be combined and both require evaluation and access policy.
- **Batch vs online inference:** cost and throughput vs freshness and synchronous dependency risk.
- **One agent vs multiple:** simpler traceability vs parallel specialization and coordination overhead.
- **Dense vs sparse retrieval:** semantic similarity vs exact term matching; hybrid needs measured fusion.
- **Managed API vs self-hosted inference:** operational control and data boundary vs capacity, maintenance, hardware, and release burden.
- **Human review vs automation:** review cost and latency vs risk reduction and accountable judgment.
- **Cache vs fresh computation:** lower latency/cost vs staleness, isolation, and invalidation complexity.

A strong answer names what a mechanism guarantees, what it cannot guarantee, how it is measured, and what happens when the assumption fails. Avoid technology lists without an explicit requirement.

## Common weak answers

- Naming fashionable components without connecting each to a requirement.
- Claiming RAG, guardrails, an evaluation score, or a protocol makes a system safe.
- Giving a single accuracy or average-latency number without workload, subgroup, tail, and failure context.
- Treating a timeout as proof that a side effect failed.
- Ignoring data deletion, permission revocation, model/prompt/index versioning, or rollback.
- Saying “add more agents” or “scale horizontally” without addressing budgets, state, and bottlenecks.

## Self-check rubric

Score 0–2 on each dimension: requirements/assumptions, workload, data ownership, model boundary, request path, correctness, evaluation, privacy/security, failure recovery, operations/cost, rollout/rollback, communication. A strong answer scores at least 18/24, explains uncertainty, and links each major component to a requirement and test.
