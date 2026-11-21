# ai and machine learning system design — Core concepts and how they fit together

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [NIST AI RMF Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/AI/NIST.AI.600-1.pdf), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [Feast architecture overview](https://docs.feast.dev/getting-started/components/overview), [MLflow Model Registry](https://mlflow.org/docs/latest/ml/model-registry/), [vLLM documentation](https://docs.vllm.ai/), [Google Cloud RAG architecture](https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search).

## Learning objectives

After this lesson, you should be able to frame an AI feature as a measurable product system; distinguish classical ML, generative inference, retrieval, and deterministic policy; trace a production data/model lifecycle; reason about evaluation, privacy, safety, latency, cost, and fallback; and identify the evidence needed before increasing model authority or traffic.

## Prerequisites

Know basic HTTP/API request lifecycles, databases and transactions, background jobs, authentication and authorization, deployment/rollback, and the distinction between test data and production data. Basic probability helps interpret model outputs, but no special model-training math is needed to understand the architecture decisions here.

## Core concepts

### 1. Model the task and harm before choosing a model

Write the input, output, user, and decision boundary in plain terms. Define a successful result with a measurable criterion and include a cost-of-error analysis: false positive, false negative, unsupported answer, privacy leak, or unsafe action can have very different consequences. Decide what the model may suggest, what deterministic code must enforce, and when to abstain or request human review.

An AI system may combine conventional software, a trained predictor, and a generative model. Use deterministic validation for schemas, arithmetic, identity, entitlements, and policy gates. Use a model where handling varied or ambiguous input adds value. Do not assign the model authority merely because its answer sounds confident.

### 2. Data, labels, features, and documents have different lifecycles

Classical ML learns patterns from examples. Training data needs a well-defined label, timestamp, entity key, provenance, retention policy, and permission. A feature is an input representation computed from source data. For training, point-in-time correctness matters: a feature must reflect what was knowable at prediction time, not future data leaked backward. For online inference, recent feature values may be served from a low-latency store; the offline training source and online serving path must have compatible transformations and timestamps.

Generative systems often use documents or live application context rather than a trained per-task feature vector. Indexing has ingestion, parsing, metadata, chunking, embedding, permissions, versioning, and refresh steps. Data freshness and access checks are independent: a current document must still be filtered to the caller’s authorized scope.

### 3. Training and inference are separate systems

Training is an offline workflow: collect/validate data, build datasets, fit a model, evaluate against baselines and slices, record code/data/config lineage, and register an immutable model artifact. Inference is an online or batch workload: load a selected artifact, obtain compatible inputs, compute a prediction, apply application policy, and return or persist the result. Model registry aliases or deployment configuration can point to a chosen version; never make “latest” an implicit reproducibility policy.

Deployment choices include batch inference for large non-urgent workloads and online inference for request-time decisions. Online serving adds latency, availability, concurrency, scaling, and fallback constraints. A canary or shadow rollout compares a candidate under controlled traffic before it becomes authoritative. Shadow outputs must not trigger production side effects.

### 4. Retrieval grounds a generator but does not make it trustworthy

RAG retrieves relevant external content at inference time and places selected passages into model context. Its pipeline has at least two quality surfaces: retrieval (did it find the right authorized evidence?) and generation (did the model use it correctly?). Evaluate them separately as well as end to end. Chunk size, overlap, metadata filters, embedding model, sparse/dense retrieval, reranking, and context budget interact; optimize against representative questions and documents rather than intuition alone.

Retrieved content is data, not trusted instruction. It can contain malicious prompt injection, stale policy, conflicting versions, or text from an unauthorized tenant. Enforce access in retrieval and downstream tools; delimit and identify sources; do not assume prompt wording is a security boundary. A citation is useful only if it resolves to the passage actually retrieved and the output’s claim is supported by it.

### 5. Evaluation is a portfolio, not one score

Build a versioned golden dataset from representative successful, ambiguous, adversarial, and no-answer cases. Keep training/evaluation separation where applicable and watch for leakage. Offline tests can compare models, prompts, retrieval settings, and structured-output validity repeatably. Human review supplies domain judgments for high-impact errors and calibrates automated checks. LLM-as-judge can help triage at scale but has bias, variance, rubric sensitivity, and correlated-model limitations; validate it against human labels and never treat it as ground truth by itself.

Online evaluation observes real distributions, user correction/acceptance, latency, cost, and incident reports. Randomized experiments need stable assignment, privacy-aware event collection, and guardrails; user feedback is biased and delayed. A model can appear better on an aggregate score while regressing for a language, tenant, or high-risk subgroup. Define slice analysis and a stop/rollback threshold before rollout.

### 6. Safety and security are architectural boundaries

Threat-model input, retrieved content, model output, tools, memory, logs, model artifacts, and vendors. Prompt injection can arrive directly or through documents. Output may contain unsupported claims, malicious markup, sensitive data, or unexpected structure. Treat tool calls as untrusted proposals: the application checks schema, identity, authorization, scope, rate, and confirmation before any side effect. Use least privilege, separate data access from model text, bound tool choices and execution time, and log decision metadata without retaining unnecessary raw content.

Assess privacy, data retention, consent, residency, bias, explainability needs, human oversight, misuse, and incident response in the context of the use case. Guardrails (input/output filters, schema checks, policy rules) reduce specific risks but do not prove safe behavior. Defense in depth combines product constraints, access control, deterministic checks, monitoring, and an operational process. Use the OWASP 2026 LLM Top 10 as a current risk taxonomy alongside lifecycle guidance such as NIST AI RMF; neither a checklist nor one red-team pass guarantees safety.

### 7. Cost and latency emerge from the whole path

For an LLM request, cost may depend on input/output tokens, model/region rates, retries, embedding/index operations, reranking, cache hits, tool calls, and human review. Latency includes queue wait, retrieval, model prefill/generation, network, validation, and retries. Track per-request and per-successful-task economics, not only per-token or GPU-hour. A low unit price can be offset by retries, long context, poor retrieval, or low task success.

Bound input size, output tokens, concurrency, wall-clock deadlines, and retry budgets. Routing can send tasks to models chosen for cost/quality/latency, while cascading tries a cheaper model first and escalates selected failures; both require compatible evaluation, observable reason codes, and protection against amplified latency or inconsistent behavior. Prompt caching is provider/model-specific and sensitive to exact cache eligibility, placement, TTL, and privacy semantics; verify current contracts before assuming savings.

### 8. Feedback loops can improve or corrupt the system

Predictions influence what users see and therefore which examples are later labeled. Recommendations affect what is clicked; moderation filters affect which content remains; a generated answer can become future retrieval content. This feedback can create selection bias, popularity loops, reward hacking, and gradual loss of coverage. Record model/data versions and outcome timestamps, distinguish observed behavior from ground truth, sample for human review, and monitor drift and segment quality. Do not retrain automatically from untrusted user feedback without validation and poisoning controls.

## Mechanisms and relationships

Use this design sequence:

1. **Requirements and baseline:** define user task, success/error costs, service SLO, privacy constraints, workload, budget, and an ordinary-software baseline.
2. **Data authority:** identify source-of-truth systems, permission owner, event time, retention/erasure behavior, and derived datasets/indexes. Define data contracts and freshness objectives.
3. **Model boundary:** choose classical prediction, generative model, retrieval, or no model. Define expected output schema, uncertainty handling, prompt/context policy, and maximum authority.
4. **Evaluation gate:** specify offline cases, human rubric, critical failure thresholds, subgroup slices, adversarial tests, and rollout criteria before tuning.
5. **Serving path:** define batch or online execution, model/artifact version, feature/context retrieval, timeouts, concurrency, token budget, queue, and fallback.
6. **Security and operations:** gate every data/tool action in application code, minimize telemetry content, observe quality plus infrastructure, and assign a model/data owner and incident response path.
7. **Controlled evolution:** shadow/canary, compare against baseline, check quality/cost/SLO guardrails, promote explicitly, and roll back model, prompt, index, or feature definitions independently where possible.

These dependencies are real: a model registry cannot repair mislabeled data; an evaluation set cannot prove general safety; a RAG index cannot provide authorization by itself; autoscaling cannot compensate for a slow third-party model quota; and an LLM judge cannot replace a high-quality reference label.

## Worked examples

### Recommendation ranking

The system first generates eligible candidate items using deterministic availability and policy filters. A ranking model scores candidates from point-in-time user/item features. The application removes disallowed content and returns a bounded list. Offline evaluation uses time-based splits to reduce leakage and checks ranking quality by cohort; online experimentation monitors engagement plus negative outcomes and fairness guardrails. A feature store may make offline/online features consistent, but the team validates freshness and actual serving transformations. If feature retrieval times out, use a safe popular/default ranking rather than returning unauthorized items.

### Internal policy assistant

The service authorizes the corpus scope, retrieves current policy passages, labels them as untrusted evidence, and asks the model for a schema-bound answer with references. The backend verifies that references belong to retrieved authorized passages, applies a confidence/evidence threshold, and abstains when support is missing. User feedback is reviewed for quality but is not automatically treated as truth. Offline evaluation tests retrieval recall and answer support separately; online monitoring catches corpus drift and latency. A deterministic policy engine remains authoritative for actual eligibility.

## Misconceptions and edge cases

- A high confidence score is not necessarily a calibrated probability or evidence of correctness.
- RAG can reduce some stale-knowledge issues but can still retrieve the wrong, malicious, or unauthorized passage and generate a false answer.
- A model registry records and points to artifacts; it does not validate data quality or deployment safety by itself. In MLflow, stages are deprecated in favor of aliases; APIs evolve by release.
- Offline evaluation can be gamed by tuning repeatedly against a narrow golden set; hold out test data and refresh cases from observed failures.
- Human review can itself be inconsistent or overloaded; define sampling, rubric, escalation, privacy, and decision authority.
- Feature-store presence does not guarantee training-serving parity; transformations, timestamps, defaults, and source lag must match.
- Fine-tuning does not provide dynamic authorization or dependable up-to-date factual lookup.
- Safety filters and prompt instructions reduce specific risks but do not make the model a trusted security boundary.
- Caching can return stale, cross-tenant, or personalized responses if cache keys and access checks are wrong.
- A model fallback should preserve the task’s safety contract; silently switching to a lower-quality model can be worse than an honest unavailable response.
- More agents add coordination, duplicated context, non-determinism, cost, and tool attack surface; use them only if measured task quality needs them.

## Knowledge checks with answers

1. **What should you establish before selecting a model?** The user task, success measure, cost of errors, privacy/authority boundary, workload, and a baseline alternative.
2. **Does RAG guarantee factual answers?** No. It adds a retrieval path; retrieval relevance, source freshness/authorization, and generation grounding must be evaluated independently.
3. **Why are point-in-time features important?** Training data must not include information unavailable at the prediction timestamp, or evaluation can leak the future and overstate model quality.
4. **Can an LLM judge serve as unquestioned ground truth?** No. Calibrate it against human/domain judgments and measure its bias, inconsistency, and rubric sensitivity.
5. **What protects a tool call from prompt injection?** Application-side authorization, least privilege, strict argument validation, scope limits, confirmation for high-impact effects, and monitoring; prompt text alone is not a security control.
6. **What is the correct rollout gate?** Predefined quality/safety/SLO/cost criteria on representative cases and controlled traffic, with explicit rollback and owner.
