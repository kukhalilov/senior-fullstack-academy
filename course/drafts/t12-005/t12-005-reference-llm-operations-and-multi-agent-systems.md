# ai and machine learning system design — Reference: Prompt operations, multi-agent coordination, and model economics

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [reference 1](https://docs.vllm.ai/), [reference 2](https://huggingface.co/docs/text-generation-inference/index), [reference 3](https://nvidia.github.io/TensorRT-LLM/), [reference 4](https://owasp.org/www-project-top-10-for-large-language-model-applications/), [reference 5](https://modelcontextprotocol.io/specification/), [reference 6](https://webrtc.org/), [reference 7](https://github.com/feast-dev/feast), [reference 8](https://kserve.github.io/website/), [reference 9](https://mlflow.org/docs/latest/ml/model-registry/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Prompt-as-code` — Treats prompt templates and structured instructions as reviewed, versioned artifacts with tests, rollout, and rollback.
- `Red teaming` — Probes a system with adversarial inputs and misuse scenarios to find safety and security failures before and after release.
- `Multi-agent orchestration` — Coordinates multiple model-driven workers or specialists; shared state, failure propagation, loops, and budget need explicit limits.
- `Planner-executor pattern` — Separates task decomposition from action execution; validate every proposed action and bound plan depth and retries.
- `Model routing` — Selects a model/provider using task capability, privacy, quality, latency, quota, and cost constraints.
- `Model cascade` — Tries a cheaper or faster model first and escalates selected cases to a stronger model according to an evaluated policy.
- `Prompt caching` — Reuses provider-side processing for repeated prompt prefixes where supported; it does not cache the full semantic answer by itself.
- `Streaming speech recognition (ASR)` — Produces partial speech-to-text results while audio arrives, reducing perceived delay but allowing revisions.
- `Text-to-speech (TTS) streaming` — Emits generated speech incrementally so playback can begin before the full output is available.
- `Model Context Protocol (MCP)` — Defines a protocol for exposing context and tools to AI applications; client and server trust, authorization, and input validation remain essential.
- `Multimodal data pipeline` — Ingests and transforms text, image, audio, video, or documents while preserving provenance, access policy, and modality-specific evaluation.

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