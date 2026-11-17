# ai and machine learning system design — Reference: Model serving, retrieval, and orchestration

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [reference 1](https://docs.vllm.ai/), [reference 2](https://huggingface.co/docs/text-generation-inference/index), [reference 3](https://nvidia.github.io/TensorRT-LLM/), [reference 4](https://owasp.org/www-project-top-10-for-large-language-model-applications/), [reference 5](https://modelcontextprotocol.io/specification/), [reference 6](https://webrtc.org/), [reference 7](https://github.com/feast-dev/feast), [reference 8](https://kserve.github.io/website/), [reference 9](https://mlflow.org/docs/latest/ml/model-registry/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Model serving` — Hosts an inference model behind an API; capacity, batching, hardware, cold starts, and model version affect latency and cost.
- `Inference endpoint` — A network contract for submitting inputs and receiving model outputs; authentication, quotas, timeouts, and schema validation remain necessary.
- `Retrieval-augmented generation (RAG)` — Supplies retrieved external context to a generative model at request time; retrieval quality, authorization, freshness, and grounding determine usefulness.
- `Embedding` — A numeric representation of content used for similarity operations; model choice, chunking, and version compatibility affect retrieval.
- `Vector search` — Finds similar embeddings, often approximately; filters, recall, index freshness, and tenant isolation must be measured.
- `Reranking` — Reorders a retrieved candidate set with a more targeted relevance model; it adds cost and latency and cannot recover absent candidates.
- `Agent` — A model-driven loop that selects tools or actions over multiple steps; permissions, stopping limits, idempotency, and human escalation matter.
- `Tool calling` — A structured request for an application to invoke a named tool; the server must validate arguments and authorize each action.
- `Context window` — The bounded model input/output token capacity for a request; fitting content does not guarantee relevance or correctness.
- `Prompt injection` — Untrusted content attempts to override instructions or trigger actions; separation of data and policy plus least privilege reduce impact but cannot guarantee prevention.

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