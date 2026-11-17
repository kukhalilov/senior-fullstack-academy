# ai and machine learning system design — Reference: Evaluation, governance, and safe operations

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [reference 1](https://docs.vllm.ai/), [reference 2](https://huggingface.co/docs/text-generation-inference/index), [reference 3](https://nvidia.github.io/TensorRT-LLM/), [reference 4](https://owasp.org/www-project-top-10-for-large-language-model-applications/), [reference 5](https://modelcontextprotocol.io/specification/), [reference 6](https://webrtc.org/), [reference 7](https://github.com/feast-dev/feast), [reference 8](https://kserve.github.io/website/), [reference 9](https://mlflow.org/docs/latest/ml/model-registry/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Offline evaluation` — Scores a fixed representative dataset before release; it supports comparisons but can miss live distribution shifts.
- `Online evaluation` — Measures real usage outcomes or experiments; guardrails, consent, privacy, and causal interpretation are required.
- `Golden dataset` — A curated set of cases with expected behavior used to detect regressions; coverage and label quality limit its value.
- `LLM-as-judge` — Uses a model to score outputs against a rubric; calibration, bias, and agreement with human judgments must be measured.
- `Hallucination` — A fluent generated claim unsupported by reliable evidence; retrieval and constraints reduce risk but do not prove truth.
- `Human-in-the-loop review` — Routes uncertain or high-impact decisions to a person; queue load, reviewer context, and appeal paths affect safety.
- `Prompt/version registry` — Tracks prompt templates and linked model/config versions to support review and rollback.
- `Model drift` — Changes in input, target, or model-output behavior that reduce performance over time; monitoring and retraining criteria should be explicit.
- `Data poisoning` — Malicious or faulty training/knowledge data corrupts downstream behavior; provenance, access controls, validation, and audit help detect it.
- `Responsible AI risk assessment` — Documents foreseeable harms, affected users, mitigations, evaluation, and monitoring across the system lifecycle.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.