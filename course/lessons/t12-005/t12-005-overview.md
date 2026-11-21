# ai and machine learning system design — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [NIST AI RMF Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/AI/NIST.AI.600-1.pdf), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [Google Cloud RAG reference architecture](https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search), [vLLM documentation](https://docs.vllm.ai/), [MLflow Model Registry](https://mlflow.org/docs/latest/ml/model-registry/).

## Problem and purpose

An AI feature is a product system with uncertain components, not just a model endpoint. It includes the user goal, data and permissions, retrieval or features, model selection and serving, validation, downstream actions, evaluation, monitoring, and fallback. The first design decision is whether a model is needed at all. Deterministic rules, search, conventional ML, or a human workflow may be safer, cheaper, and easier to evaluate for parts of a task.

Begin with a clear success criterion and the cost of a wrong output. A demo that produces a plausible answer does not establish correctness, safety, useful latency, lawful data handling, or production economics. State which outputs are suggestions, which can trigger side effects, and where a human or deterministic policy must remain authoritative.

## Plain-language mental model

Trace the user request through a sequence of bounded decisions:

1. **Understand the task:** what input and output does the user need, and what counts as a correct/helpful result?
2. **Find allowed evidence:** which documents, records, or features may this user access, and how fresh must they be?
3. **Choose computation:** deterministic logic, a classical model, an LLM, retrieval, or a combination. Use the least complex path that meets measured quality.
4. **Bound uncertainty and authority:** validate structure and permissions, constrain tools, and keep irreversible actions behind explicit authorization/confirmation.
5. **Return an honest result:** cite evidence where appropriate, express uncertainty or refusal, and provide a fallback when the system cannot meet its quality or time budget.
6. **Learn safely:** evaluate quality and failures with representative data, protect sensitive inputs, and roll changes out with a reversible path.

```text
user goal + risk
  → authorized inputs and explicit requirements
  → deterministic / ML / retrieval / generative step
  → validation, policy, and bounded action
  → user-visible result or safe fallback
  → evaluation, telemetry, and controlled improvement
```

## How the parts fit together

### Classical ML path

Historical events produce labeled examples and features. A training pipeline creates a model artifact, evaluation checks it against appropriate baselines and slices, a registry records lineage/version, and a serving path retrieves online features to produce a prediction. The application combines that prediction with deterministic business rules and logs outcomes for monitoring. Risks include leakage, training-serving skew, drift, feedback loops, delayed labels, and unfair error distribution.

### Generative/retrieval path

Content is permission-checked, parsed, chunked, embedded or indexed, and refreshed. At query time, the system applies the caller’s access rights to retrieval, optionally reranks candidate passages, sends a bounded context to an LLM, validates the response, and returns it with evidence or abstains. RAG can make current/private information available to a model at inference time; it does not guarantee the model used the evidence correctly, prevent prompt injection, or make source data accurate.

### Serving and operations path

Model loading, GPU/CPU capacity, batching, queues, request deadlines, context/output size, cache behavior, and provider limits determine user-facing latency and cost. Track end-to-end success, quality, safety, p50/p95/p99 latency, queue wait, token/compute use, retrieval quality, and fallback rates. Capacity metrics alone cannot say whether the output is useful; quality metrics alone cannot say whether the service is operable.

## Concept map

| Question | Typical design concerns |
|---|---|
| Is a model needed? | Deterministic workflow, search, classical ML, LLM, or human review |
| What information may it use? | Data governance, permissions, freshness, feature/document pipelines |
| How does it respond? | Inference serving, RAG, prompts, tools, structured output, batching |
| How do we know it works? | Golden dataset, offline and online evaluation, human review, drift |
| How can it fail or be attacked? | Hallucination, injection, poisoning, privacy leakage, excessive agency |
| Can it meet SLO and cost? | Token/compute budgets, routing/cascade, cache, fallback, capacity |
| How do we change it safely? | Versioned data/model/prompt, registry, shadow/canary, rollback |

## End-to-end walkthrough

An employee asks an internal policy assistant whether a particular travel expense is reimbursable. The service authenticates the employee and authorizes access to the relevant policy corpus. Retrieval filters content by the user’s allowed scope, finds passages, and records document/version identifiers. The prompt treats retrieved text as untrusted content; the model has no direct authority to issue reimbursements. It returns a constrained response with citations or abstains if evidence is weak. The application checks citation IDs and response shape, then shows the answer and policy source. A separate deterministic expense policy and authorized workflow decide reimbursement.

The evaluation set includes ordinary questions, ambiguous cases, outdated policy, inaccessible documents, prompt-injection text, and questions with no supporting evidence. Evaluation compares retrieval coverage, groundedness, answer correctness, refusal behavior, latency, and cost. Traces store request IDs, model/prompt/index versions, retrieval IDs, timings, and token usage; raw personal content is minimized and protected. A new model or prompt is tested offline and in shadow/canary before broader rollout, with a safe rollback.

## When to use it and tradeoffs

Use a model only where it improves a measured user task enough to justify probabilistic output and operational cost. Use retrieval when a model needs authorized, changing or private source material; fine-tuning may teach behavior or style but does not reliably provide current factual records or access control. Use agents/tools only when a multi-step action genuinely needs model-directed choice; deterministic workflow code should retain authorization and irreversible side-effect control.

The simplest baseline is often a search or rules flow plus a model for one bounded transformation. Add vector retrieval, reranking, multiple agents, or custom GPU serving only when evaluation shows the simpler design misses requirements. Every extra stage adds cost, latency, failure modes, and attack surface.

## What later lessons cover

The concepts lesson gives a repeatable system design sequence. Reference lessons explain inference/RAG, evaluation and safety, classical ML/data/cost, and LLM operations/agents. The named-scope reference covers serving engines, retrieval algorithms, agent frameworks, evaluation tools, safety patterns, recommendation, speech, multimodal processing, and feature/model serving. Practice and interview lessons work through design cases. Framework-specific APIs are versioned in their current official documentation; this course explains system boundaries rather than asserting that one vendor or library is universally best.
