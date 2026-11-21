# ai and machine learning system design — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [NIST Generative AI Risk Management Profile](https://nvlpubs.nist.gov/nistpubs/AI/NIST.AI.600-1.pdf), [Google Cloud RAG architecture](https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search), [Feast architecture](https://docs.feast.dev/getting-started/components/overview), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/).

## Goals

Practice translating a vague AI product request into measurable requirements, a safe baseline, an end-to-end data and inference path, evaluation evidence, operational limits, and explicit failure behavior. The exercises are technology-neutral; named services in other references are examples, not prerequisites.

## A repeatable design worksheet

For each case, write:
1. User, task, allowed inputs, expected output, and harmful outcomes.
2. Functional requirements and quality objectives with metric, population, threshold, and time window.
3. Workload: average/peak requests, concurrency, input/output size, burst shape, freshness, retention.
4. Source-of-truth data, derived data, authorization owner, provenance, deletion, and freshness.
5. Simplest baseline and why a model is or is not needed.
6. Request path, state changes, idempotency, deadline, backpressure, and fallback.
7. Evaluation suite, release gate, monitoring, on-call owner, and rollback trigger.
8. Cost per successful task, including failed calls, retrieval, serving capacity, retries, review, and operations.

## Worked example

**Request.** Employees ask questions about current HR and expense policy. The assistant may draft an answer and source links, but it cannot approve benefits or reimbursements.

**Requirements.** The answer must be based on current authorized documents and show sources. If no sufficient evidence exists, say so. The service must not disclose documents the caller cannot read. Set measurable targets with stakeholders, for example retrieval recall on a labeled suite, citation support, answer usefulness, abstention correctness, p95 latency, and cost per resolved question. Threshold values must come from product risk and workload evidence, not a universal template.

**Data and path.** Connectors use scoped credentials and incremental sync. Each document and derived chunk retains tenant, ACL, source revision, timestamp, and deletion state. Parse and chunk content; index lexical terms and embeddings. At request time authenticate the employee, filter retrieval by current ACL, retrieve candidates, optionally rerank if measured improvement justifies its cost, then send a bounded context. The application validates returned citation IDs and that references belong to the authorized retrieved set. The model receives no approval tool.

**Evaluation.** Component suite measures retrieval recall and access filtering; end-to-end suite checks answer correctness, groundedness, citations, abstention, and user task completion. Include ambiguous questions, conflicting policy versions, prompt injection in source documents, no-answer cases, revoked access, and low-resource language cases. Human reviewers adjudicate high-impact disagreements. A new model first runs offline, then in shadow, then on a bounded canary with rollback thresholds.

**Failure behavior.** If the index is stale, disclose the freshness limit or abstain. If retrieval times out, offer search or retry within a bounded budget. If model serving fails, return a safe unavailable response. If a source ACL changes, propagate it to chunks, vectors, caches, and retained traces according to policy. Never let prompt text override access control.

## Exercises

### Exercise 1: decide whether to use an LLM

A company wants to classify incoming purchase requests into one of six fixed categories and reject requests over a policy limit.

**Your task:** propose a baseline, define the model boundary if one is useful, and explain validation.

**Worked answer:** Start with deterministic category rules and a schema-validated form for structured inputs. If free-form descriptions require semantic classification, evaluate a conventional classifier or LLM against a labeled and representative set. The model can suggest a category with uncertainty; deterministic code validates category membership and computes policy limits. It must not approve a purchase. Compare quality, calibration, human correction rate, latency, privacy, and total cost against the rules baseline. Route ambiguous or high-impact requests to people.

### Exercise 2: estimate serving capacity

An assistant sees 30,000 requests per day. Peaks are 5 times the daily average; mean input is 1,200 tokens and mean output is 250 tokens. Assume a 10-hour workday for the first rough estimate.

**Worked answer:** Average request rate during that window is 30,000 / 36,000 seconds ≈ 0.83 requests/s. A 5x peak is about 4.2 requests/s before burstiness and concurrency. Token throughput at that peak is approximately 4.2 × 1,450 ≈ 6,090 tokens/s, but input prefill and output decoding have different service costs. This estimate is not a GPU count. Measure request-length distributions, concurrency, time-to-first-token, inter-token latency, batching, retrieval, safety checks, and provider limits on the intended hardware/model. Add headroom for bursts and failures; bound admission and queues.

### Exercise 3: diagnose RAG regressions

A policy assistant’s answers became less grounded after a document refresh. The model and prompt did not change.

**Worked answer:** Inspect ingestion and index versions first: parsing errors, source ACL, duplicate or missing chunks, metadata, document revision, embedding model/preprocessing, index build, filters, retrieval scores, and top-k. Compare retrieval recall and freshness separately from answer faithfulness. Check whether the corpus changed language, length, layout, or policy terminology. Use source IDs to reproduce failures. Roll back the index or repair the pipeline if needed; changing the prompt may mask rather than fix the root cause.

### Exercise 4: feature skew and label leakage

A churn model performs well offline but poorly in production. A feature called days_since_last_support_contact was recomputed using the current table rather than a historical snapshot.

**Worked answer:** This is likely point-in-time leakage: training sees support contacts recorded after the prediction timestamp. Rebuild training examples from event-time snapshots and join only data available at each prediction time. Compare offline and online transformations on identical entities/timestamps; inspect late events, defaults, missingness, and clock boundaries. Use time-based splits, then shadow or canary the corrected model. Do not retrain from the leaked data.

### Exercise 5: choose batch or online inference

A nightly warehouse job scores millions of catalog items for a home page, while a fraud decision must use the latest transaction context within a short request deadline.

**Worked answer:** Precompute catalog scores when their freshness window allows batch inference; refresh on a schedule or relevant catalog events. Fraud scoring may need online inference and current features, but use a bounded synchronous path with cached/streamed features where semantics permit. Define a fail-closed or step-up review policy for uncertain/high-risk fraud decisions; do not silently use stale scores. Compare staleness, infrastructure, latency, cost, and recovery.

### Exercise 6: contain a tool-using agent

A support agent can read tickets and create refunds. A retrieved ticket contains text instructing the model to refund every customer.

**Worked answer:** Treat ticket text as untrusted data. Separate read and refund capabilities; authorize against the authenticated user, ticket, amount, and policy in server code. Require confirmation or human approval based on impact. Use narrow schemas, spending limits, idempotency keys, audit, and bounded steps. Test direct and indirect prompt injection, replay, tenant substitution, malformed arguments, tool timeout after success, and revoked credentials. The agent’s request is not permission.

### Exercise 7: evaluate a model cascade

A small model answers most questions quickly; a larger model is called when confidence is low. The cascade costs more than the larger model alone.

**Worked answer:** Check escalation frequency, repeated context/token charges, retries, evaluator errors, and timeouts. The small-model confidence may not correlate with correctness; calibrate escalation on representative and subgroup cases. Measure successful task cost and p95/p99 latency, not model price alone. Consider routing by task type, a fixed model for sensitive cases, a simpler deterministic fallback, or removing the cascade.

### Exercise 8: voice interruption race

A user starts a new question while old TTS audio is still playing. A late transcription from the earlier turn arrives afterward.

**Worked answer:** Assign monotonically increasing turn IDs and cancel the prior generation/playback on barge-in. Drop late ASR and TTS events for obsolete turns, even if the provider completes them. Measure interruption-stop latency and test packet delay, reordered events, cancellation failure, partial/final transcripts, and reconnects. Do not execute irreversible tools from partial ASR without explicit confirmation.

### Exercise 9: move a candidate model safely

The candidate’s overall quality improves, but one language subgroup has more severe errors.

**Worked answer:** Do not promote on the aggregate score. Inspect sample size, label quality, error severity, confidence intervals, and task distribution for that language. Determine whether the change comes from preprocessing, data coverage, calibration, or model behavior. Add representative cases to evaluation, choose a mitigation or decline rollout, and set subgroup rollback gates. Keep an accountable owner and record residual risk.

## Progressive hints

Start from user harm, data authority, and the simplest baseline. Draw one request path and one failure path before picking components. Separate retrieval, model, and downstream action. Estimate with ranges and label assumptions. Define evaluation and rollback gates before a release.

## Complete solutions

Each exercise includes a worked solution immediately after its prompt. Use the solution to compare reasoning, then revisit the case with changed assumptions such as tighter privacy, weaker labels, or slower dependencies.

## Tests and edge cases

Test duplicate requests, source ACL revocation, stale or deleted documents, queue saturation, timeouts after successful side effects, partial model output, malformed structured data, tenant substitution, prompt injection, late voice events, subgroup regressions, and rollback across model plus feature/index versions.

## Review rubric

Score each design 0–2: requirements and assumptions; baseline choice; data authority and freshness; request and state path; failure/recovery; evaluation and risk; identity/privacy; latency/capacity; cost; rollout/rollback. A strong answer gives concrete measures and explains uncertainty rather than naming many tools.

## Reflection questions

Which assumption most affects your capacity estimate? Which component can return stale or unauthorized data? What operation could succeed despite a timeout? What metric might improve while user harm worsens? Which mechanism can be deleted without losing a required guarantee?
