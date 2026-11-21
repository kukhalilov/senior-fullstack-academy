# ai and machine learning system design — Reference: Handbook AI/ML named systems, algorithms, and design decisions

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [vLLM stable docs](https://docs.vllm.ai/en/stable/), [TGI status and docs](https://huggingface.co/docs/text-generation-inference/index), [TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/), [MCP release notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/), [Feast](https://docs.feast.dev/getting-started/components/overview), [MLflow registry workflow](https://mlflow.org/docs/latest/ml/model-registry/workflow/), [LiveKit interruption handling](https://docs.livekit.io/agents/logic/turns/adaptive-interruption-handling/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## Current version and lifecycle notes

This reference explains every name in the supplied Handbook AI/ML inventory. Product and protocol details were checked 2026-11-20 and evolve faster than underlying design principles. Current Hugging Face documentation labels TGI maintenance-mode software and recommends evaluating active alternatives for new deployments. OpenAI Swarm is explicitly experimental and educational; its repository points to the Agents SDK as the maintained evolution. MLflow Model Stages have been deprecated since version 2.9.0; current guidance uses aliases, tags, and environment-aware access. MCP 2026-07-28 removes the earlier initialize handshake and protocol-level session in its stateless core; older revisions still exist. OWASP 2026 LLM Top 10 is the latest edition at this review and supersedes the 2025 list.
## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `vLLM` — An open-source LLM inference and serving project named by the Handbook; compare supported models, scheduling, hardware, APIs, and release-specific behavior in its official documentation.
- `Text Generation Inference (TGI)` — Hugging Face's inference serving toolkit. Current documentation labels it maintenance mode and recommends evaluating active alternatives for new deployments. Existing deployments need a maintenance plan; verify pinned release, model, and hardware support.
- `TensorRT-LLM` — NVIDIA's library for optimizing and running LLM inference on supported NVIDIA platforms; verify supported architectures, precision, kernels, and release behavior in official docs.
- `Continuous batching` — Dynamically admits and retires requests in a running batch to improve accelerator utilization while balancing per-request latency and scheduling fairness.
- `Paged attention` — An attention/KV-cache management technique that organizes cache storage in blocks to reduce allocation fragmentation; implementation details differ by inference engine.
- `Key-value (KV) cache management` — Stores attention key/value state across generated tokens to avoid recomputing prior context; memory sizing, reuse, eviction, isolation, and correctness constrain concurrency.
- `Multi-tenant GPU scheduling` — Allocates accelerator capacity across tenants with isolation, fairness, batching, admission, and utilization policies; a scheduler cannot remove finite hardware capacity.
- `Chunking strategy` — Splits source content into retrieval units; boundaries, overlap, metadata, and granularity affect recall, context cost, citation quality, and update behavior.
- `Embedding model` — Maps input into a vector representation used for similarity or retrieval; model/version, normalization, language, dimensions, and preprocessing must match index and query paths.
- `Dense retrieval` — Retrieves by vector similarity, useful for semantic matching but dependent on embedding quality and index recall.
- `Sparse retrieval` — Retrieves using sparse lexical features such as terms and weights; it can capture exact token matches and complements semantic retrieval.
- `Hybrid dense-plus-sparse retrieval` — Combines dense and lexical candidate signals; fusion and evaluation need workload-specific relevance data.
- `Reranking model` — Scores a limited retrieved candidate set more directly for a query; adds compute and latency and cannot recover a relevant item missing from candidates.
- `HNSW` — Hierarchical Navigable Small World approximate-nearest-neighbor graph index; query speed, recall, memory, build cost, and update behavior trade off by implementation and configuration.
- `IVF-PQ` — A family combining inverted-file coarse partitioning with product-quantized vector codes to reduce search work and memory at an accuracy/recall cost.
- `DiskANN` — A graph-based approximate-nearest-neighbor approach designed to use SSD storage for large indexes; performance depends on hardware, workload, and implementation.
- `Product quantization` — Compresses vectors by quantizing subspaces, reducing storage and often enabling faster distance estimation with approximation error.
- `BM25` — A lexical ranking function using term frequency, inverse document frequency, and document length normalization; it is a ranking method, not a complete search system.
- `Vector index sharding` — Partitions a vector corpus across nodes or index shards; routing, recall, skew, replication, metadata filtering, and rebalancing affect results and operations.
- `ReAct` — An agent prompting pattern that interleaves reasoning and actions/observations; constrain tool permissions, iteration, and data exposure, and do not treat model reasoning as proof.
- `Reflection and self-critique` — A pattern where a model reviews or revises its output; extra calls add cost and latency and do not ensure that the critique is correct.
- `Planning and planner-executor` — Separates task decomposition from action execution; validate plans, permissions, bounds, state transitions, and recovery before executing tools.
- `Tool use and function calling` — A model emits a structured tool request that application code may execute; validate schema and authorize every action at the server boundary.
- `Short-term agent memory` — Transient context retained during a task or session; define size, lifetime, trust, tenant scope, and what happens on restart.
- `Long-term agent memory` — Persisted information reused across tasks; define provenance, consent, retention, deletion, access control, staleness, and correction semantics.
- `Orchestrator-worker topology` — A coordinator decomposes work and assigns bounded tasks to workers; concurrency, duplicate work, partial results, cancellation, and shared limits require design.
- `Agent handoff and delegation` — Transfers responsibility or context between agent roles; identity, authorization, state ownership, loops, and failure recovery must remain explicit.
- `Shared agent memory` — State visible to multiple agents; define consistency, write ownership, privacy, conflict, and prompt-injection boundaries.
- `Parallel agent fan-out` — Runs independent sub-tasks concurrently; limits, deadlines, cancellation, result aggregation, and partial failure bound the benefit.
- `Agent graph failure modes` — Includes loops, repeated or unauthorized actions, stalled nodes, inconsistent shared state, partial fan-out completion, and unbounded retries; define budgets, timeouts, checkpoints, and recovery behavior.
- `LangGraph` — A framework for stateful graph-oriented LLM workflows named by the Handbook; verify its current APIs and runtime semantics in official docs.
- `OpenAI Agents SDK` — OpenAI's agent-building SDK named by the Handbook; verify current supported APIs, handoffs, tracing, and safety guidance in official docs.
- `AutoGen` — Microsoft's framework for multi-agent applications named by the Handbook; check current project direction, API versions, and supported patterns in official docs.
- `Swarm` — An OpenAI experimental, educational framework; its repository points users to the Agents SDK as the maintained evolution. Treat it as a learning example rather than a production dependency.
- `Golden evaluation dataset` — A versioned set of representative inputs and expected properties used for regression evaluation; sampling and labeling quality constrain conclusions.
- `Reference-free evaluation metric` — An evaluation method that does not require a single gold answer; correlate it with human judgments and the actual product goal before relying on it.
- `LLM-as-judge` — Uses a model to assess outputs against a rubric; measure agreement, bias, sensitivity to phrasing, and calibration against human review.
- `Ragas` — An evaluation framework named by the Handbook for RAG/LLM applications; verify current metrics and integrations in official project docs.
- `LangSmith` — A LangChain platform for tracing and evaluating LLM applications named by the Handbook; confirm current product capabilities, privacy, and retention terms in official docs.
- `TruLens` — An evaluation and observability toolkit named by the Handbook; verify current project APIs and evaluation limitations in official docs.
- `Continuous evaluation pipeline` — Runs selected quality, safety, and regression checks on data and releases; gates need thresholds, representative sets, and review for high-impact decisions.
- `Prompt-as-code` — Stores prompts and structured instructions as reviewed, versioned artifacts with tests, release history, and rollback.
- `Prompt versioning` — Links a prompt revision to its model, parameters, tools, and evaluation results so behavior can be reproduced and compared.
- `Prompt rollback` — Restores a prior prompt configuration after a measured regression; compatibility and in-flight requests still need handling.
- `Prompt A/B testing` — Compares prompt variants using predeclared outcomes and safe traffic allocation; avoid exposing users to harmful variants and account for selection effects.
- `Structured model outputs` — Constrains generated data to a schema or format where supported; syntax validity does not prove factual correctness or authorization.
- `Guardrails` — Input/output checks and action policies that reduce specified risks; they are defense layers and need adversarial testing, not guarantees.
- `Red teaming` — Tests adversarial and misuse scenarios against model, tools, data, and deployment boundaries; findings need remediation and regression checks.
- `Semantic cache` — Reuses a response for a sufficiently similar request; key by authorization, tenant, model/prompt, and context scope, and measure harmful false matches.
- `Model routing` — Selects a model or provider using evaluated capability, data policy, latency, availability, quota, and cost constraints.
- `Model cascading` — Starts with a lower-cost or faster option and escalates selected requests under a measured policy; repeated generation may increase latency and cost.
- `Prompt caching (Anthropic and OpenAI)` — Provider features that may reuse processing for repeated prompt prefixes; exact behavior, eligibility, retention, and pricing differ by provider and version, so check each provider's current documentation.
- `Per-request model unit economics` — Relates a successful product outcome to inference, retrieval, storage, evaluation, and support cost per request or task; compare useful quality and completion rate rather than token price alone.
- `OWASP Top 10 for LLM Applications` — A community risk taxonomy for LLM applications. The 2026 edition is current here and changes the 2025 categories and numbering. Use it as one threat-model input, not a complete security standard.
- `Prompt injection` — Untrusted input attempts to influence instructions or tool use; isolate data from policy, limit privileges, and validate actions while recognizing that no text filter guarantees prevention.
- `Personally identifiable information (PII) redaction` — Detects and removes or transforms selected identifiers; detection errors and re-identification risk require data minimization and policy-specific testing.
- `Jailbreak testing` — Tests attempts to bypass model/application policy; evaluate tool and data controls independently of model refusal behavior.
- `Defense in depth for AI applications` — Combines authorization, least-privilege tools, data controls, model/input/output checks, monitoring, and response procedures so one failed layer does not grant unrestricted action.
- `Candidate generation` — Retrieves a manageable subset of items for a recommender; optimize recall and coverage before ranking while measuring latency and freshness.
- `Ranking model` — Orders candidates for a user/context according to a learned or rule-based score; objectives, constraints, feedback bias, and calibration affect outcomes.
- `Two-tower retrieval model` — Encodes a query/user and candidate item separately so vectors can be precomputed and retrieved efficiently; training-serving consistency and freshness matter.
- `Offline/online feature parity` — Keeps feature definitions and transformations consistent between training and serving; parity tests and point-in-time correctness prevent leakage and skew.
- `Training-serving skew` — A difference between training and inference feature values or transformations that degrades predictions; monitor and reproduce both pipelines.
- `Feature store` — Organizes feature definitions and offline/online serving paths; semantics, freshness, point-in-time joins, and ownership need explicit controls.
- `Feast` — An open-source feature store project named by the Handbook; verify current architecture, supported stores, and APIs in official documentation.
- `Tecton` — A feature platform named by the Handbook; current product details and service behavior must be confirmed in official documentation.
- `KServe` — A Kubernetes-based model serving project named by the Handbook; check current runtimes, API, and deployment semantics in official docs.
- `BentoML` — A framework/platform for packaging and serving ML models named by the Handbook; validate current APIs, runtimes, and deployment mode in official docs.
- `MLflow Model Registry` — A model lifecycle registry with versioning, lineage, tags, and aliases. Stages have been deprecated since MLflow 2.9.0; consult current workflow docs and avoid building new routing on fixed stages.
- `Shadow model deployment` — Evaluates a candidate model on copied or parallel inputs without using its output for the live decision; protect privacy and isolate side effects.
- `DLRM` — A deep-learning recommendation model architecture using categorical and dense feature interactions; its suitability depends on data, objective, and serving constraints.
- `Approximate-nearest-neighbor embedding retrieval` — Finds likely similar item vectors to generate recommender candidates; index freshness, recall, filtering, and latency must be measured.
- `Exploration-exploitation` — Balances recommending known high-reward choices with gathering information about alternatives; define user impact, constraints, and evaluation policy.
- `Cold-start recommendation` — Handles users or items with little interaction history using priors, content, context, or deliberate exploration; measure coverage and fairness.
- `WebRTC` — A set of protocols and browser APIs for real-time peer media/data communication; signaling, network traversal, security, and server topology remain design responsibilities.
- `LiveKit` — A real-time communications platform named by the Handbook; check current SDK, deployment, routing, and service behavior in official docs.
- `Deepgram` — A speech AI provider named by the Handbook; confirm current API, model, latency, privacy, and retention characteristics in official docs.
- `Streaming automatic speech recognition (ASR)` — Transcribes incoming audio incrementally; partial hypotheses may change, so the client must distinguish interim and final results.
- `Streaming text-to-speech (TTS)` — Produces playable audio in chunks before a full utterance is complete; cancellation and sequencing prevent stale speech after interruption.
- `Barge-in and interruption handling` — Allows a user to interrupt ongoing speech or model work; cancel generation, stop playback, and discard late events using turn/session identity.
- `End-to-end voice latency budget` — Allocates a target across capture, transport, recognition, model, and synthesis; optimize user-perceived turn-taking rather than one component alone.
- `CLIP` — A family of image/text representation models named by the Handbook; verify model/version, license, preprocessing, and evaluation for the use case.
- `Whisper` — OpenAI's speech recognition model family named by the Handbook; check current model variants, languages, deployment, and license terms in official sources.
- `LayoutLM` — A document understanding model family using text and layout information named by the Handbook; input preprocessing and supported versions affect results.
- `OCR-plus-layout document pipeline` — Combines text recognition with spatial/layout structure for document understanding; confidence, reading order, tables, and human correction need evaluation.
- `Unstructured ETL` — Extracts, normalizes, enriches, and loads non-tabular sources such as documents and media while preserving provenance and access metadata.
- `AI source connectors` — Ingest content from authorized systems using scoped credentials, incremental cursors, deletion propagation, and source-specific rate limits.
- `Embedding pipeline` — Creates and indexes vectors from source content; record model/version, preprocessing, metadata, retries, deduplication, and reindex strategy.
- `AI metadata schema` — Captures tenant, source, version, timestamps, access policy, and provenance for filtering, citations, updates, and deletion.
- `AI data freshness` — Measures the age and completeness of indexed/derived content against the source and product objective; ingestion success alone does not prove current retrieval.
- `Model Context Protocol (MCP)` — A protocol for AI clients and servers to exchange context and expose tools/resources. The 2026-07-28 core is stateless and removes the earlier initialize handshake and protocol session; older versions retain the earlier lifecycle. MCP interoperability does not provide user authorization or safe execution.

## Cross-item comparison

| Decision | Named options | Main decision inputs |
|---|---|---|
| Generate tokens | vLLM, TGI, TensorRT-LLM | Maintenance, model/hardware support, throughput, tail latency, cache behavior, license, deployment skills |
| Retrieve evidence | BM25/sparse, dense vectors, hybrid, HNSW, IVF-PQ, DiskANN | Exact terms vs semantic variation, recall, filters, index size, memory, update rate, cost |
| Coordinate work | ReAct, planner-executor, orchestrator-worker, frameworks | Uncertainty, parallelism, audit, deadlines, durable state, tool risk, maintenance |
| Evaluate | Golden set, reference-free metric, judge, human review, Ragas, LangSmith, TruLens | Label quality, metric validity, calibration, privacy, severity, explainability |
| Recommend | Candidate generation, two-tower, ANN, DLRM, ranking, features | Recall, freshness, parity, interaction volume, objective, exposure bias |
| Process speech/documents | WebRTC, ASR/TTS, CLIP, Whisper, LayoutLM, OCR/layout, ETL | Modality, turn deadline, source format, language, privacy, provenance, correction |

These options can be composed. BM25 plus dense retrieval may improve candidate coverage; reranking can refine candidates but cannot recover a missed item. Batch candidates can feed a real-time ranker. Compare end-to-end quality, latency, cost, and failure behavior, not isolated benchmark claims.

## Examples

A source connector uses scoped credentials and incremental cursors. The ingestion pipeline retains source ID, revision, ACL, tenant, timestamp, and deletion state. Parsing preserves useful layout; chunk boundaries are tested against real questions. A pinned embedding model and preprocessing version create vectors, while lexical terms support exact matching. HNSW or IVF-PQ is chosen only after measuring recall, memory, update behavior, and query latency at target corpus size. Retrieval applies caller ACLs before model generation; hybrid fusion and reranking are enabled only if evaluation shows sufficient benefit. The bounded context records source IDs, and the application validates citations and abstains on weak or conflicting evidence. Deletion and permission changes propagate through parsed text, chunks, embeddings, indexes, caches, and retained traces under the retention policy.

## Worked design: production model and agent control

Benchmark an inference engine with the exact model, tokenizer, sequence lengths, concurrency, and GPU. Continuous batching and KV-cache management can improve utilization, but finite cache memory, fairness, and tenant isolation remain constraints. A gateway enforces identity and admission. An agent planner proposes bounded steps; application code authorizes every tool call and uses idempotency keys for effects. Parallel workers share a deadline, cancellation policy, and aggregate budget. Checkpoints may resume workflow state, but external effects still require reconciliation. MCP standardizes capability exchange; it does not grant permissions. Apply the current OWASP 2026 risk taxonomy alongside NIST lifecycle risk management and threat-model-specific controls.

## Common mistakes

- Treating an index benchmark or feature matrix as a guarantee for a different workload.
- Ignoring ACL filtering, stale embeddings, delete propagation, shard skew, or filtered-search recall.
- Treating model reasoning traces as proof or automatically safe to expose.
- Sharing agent memory or prompt caches across tenants without isolation and provenance.
- Assuming structured output means truthful output or authorized action.
- Letting a shadow model trigger production side effects.
- Training from clicks or self-generated data without selection-bias and poisoning controls.
- Calling the 2025 OWASP names the current 2026 taxonomy.
- Assuming MCP statelessness removes application state, identity, or authorization requirements.
- Treating TGI, Swarm, or deprecated MLflow stages as default new-production recommendations.
- Measuring token price while omitting retries, retrieval, GPU idle capacity, review, and failed tasks.

## Knowledge checks with answers

1. **Why separate candidate generation from ranking?** Candidate generation narrows a large universe with recall and coverage goals; ranking spends richer compute on that subset. A ranker cannot score items it never receives.
2. **What happens after source deletion or ACL revocation?** Propagate it to connectors, parsed content, chunks, vectors, indexes, caches, and retained traces according to policy.
3. **Can MCP discovery authorize a tool?** No. The application must check identity, scope, arguments, and side effects.
4. **What determines responsive voice turns?** End-to-end capture, endpointing, transport, ASR, model/tool, TTS, playback, and interruption-cancellation time.
5. **How should serving engines be compared?** Check maintenance, compatibility, license, and operational fit, then benchmark representative traffic and quality on target hardware.
6. **Why log recommendation exposures?** Only exposed items can produce observed outcomes; position and selection explain bias in the feedback data.
