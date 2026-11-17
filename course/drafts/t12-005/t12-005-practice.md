# ai and machine learning system design — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [reference 1](https://docs.vllm.ai/), [reference 2](https://huggingface.co/docs/text-generation-inference/index), [reference 3](https://nvidia.github.io/TensorRT-LLM/), [reference 4](https://owasp.org/www-project-top-10-for-large-language-model-applications/), [reference 5](https://modelcontextprotocol.io/specification/), [reference 6](https://webrtc.org/), [reference 7](https://github.com/feast-dev/feast), [reference 8](https://kserve.github.io/website/), [reference 9](https://mlflow.org/docs/latest/ml/model-registry/).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

Design an internal engineering assistant that answers questions from private documentation and may create a draft ticket through a tool.

**Worked solution.** Authenticate the user and authorize document retrieval and ticket creation separately. Filter retrieval by ACL before generation; never rely on a prompt instruction as access control. Limit document and token budgets, cite source passages, and provide abstention when evidence is missing. Treat retrieved text as untrusted against prompt injection. A ticket tool accepts a narrow schema, validates fields, previews side effects, and requires confirmation for consequential actions. Measure retrieval recall, grounded answer quality, refusal correctness, latency, cost, and access violations on offline and monitored online evaluations.

## Exercises

1. Restate the product goal as two functional requirements and three measurable quality objectives.
2. Estimate the average, peak, and burst workload. List the assumptions that most affect your estimate.
3. Identify authoritative data and one derived representation. State how the derived data is refreshed and reconciled.
4. Walk through a timeout after a write. What does the client know, and what key or query resolves ambiguity?
5. Remove one dependency from the design. Describe user-visible degradation and the telemetry that should detect it.
6. Explain which single measurement would justify the next scaling change.

## Progressive hints

Start with user behavior and invariants. Draw a baseline before adding components. Follow the write path and read path separately. Distinguish successful completion from durable acceptance and unknown outcome.

## Complete solutions

1. Functional requirements describe specific user actions and outcomes. Quality targets state boundary, workload, metric, threshold, and measurement window; they should be agreed with the product owner.
2. Use ranges and show the arithmetic. Include peak-to-average ratio, concurrency, payload, and retention; mark estimates that need measurement.
3. Name the component that owns the authoritative update. A derived store needs a delivery/rebuild policy and a freshness objective.
4. A timeout is ambiguous. Retry only with an idempotency key or verify the operation by a stable identifier before issuing a new effect.
5. Preserve critical behavior and degrade optional work. Emit dependency latency/error, request outcome, queue age where relevant, and trace context without high-cardinality sensitive fields.
6. Select evidence for the actual constraint, such as database saturation, tail latency, queue age, or cache miss cost. Scale the constrained component and retest.

## Tests and edge cases

Test duplicate requests, slow consumers, a full queue, stale cache, one node or zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant ID, and recovery from backup.

## Reflection questions

Which assumption could invalidate the design? Which invariant would be hardest to recover after a partial failure? What evidence would make you remove a component rather than add another?
