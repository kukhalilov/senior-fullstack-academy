# ai and machine learning system design — Reference: Model serving, retrieval, and orchestration

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [vLLM documentation](https://docs.vllm.ai/en/stable/), [Hugging Face Text Generation Inference documentation](https://huggingface.co/docs/text-generation-inference/index), [TensorRT-LLM documentation](https://nvidia.github.io/TensorRT-LLM/), [Google Cloud RAG reference architecture](https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28/).

## Scope and version

This reference connects the ten supplied model-serving, retrieval, and orchestration terms. Product docs are live and version-specific; checked 2026-11-20. Hugging Face documents TGI as being in maintenance mode and recommends evaluating actively developed alternatives such as vLLM, SGLang, or local runtimes for new deployments. TensorRT-LLM is a fast-moving NVIDIA inference stack with hardware and release constraints. MCP’s 2026-07-28 spec is a stateless protocol revision; clients/servers must negotiate or otherwise support the revision they implement. Check versions, model licenses, hardware, and deployment conditions before choosing.

## How this group fits the mental model

The serving path receives a request, validates limits and permissions, places work in a bounded queue, loads or selects a model, batches compatible requests, generates output, validates the result, and returns it under a deadline. Retrieval may precede generation to supply external evidence. An agent can decide whether to call an approved tool, but the application—not model text—owns authorization and side-effect controls.

The response objective is end-to-end: queue wait + retrieval + reranking + model prefill + token generation + validation + network. A faster decoding engine cannot compensate for a slow retrieval store, oversized context, or unbounded tool loop. Optimize the measured bottleneck while protecting quality and isolation.

## Supplied names explained

- **Model serving** — Operating an inference workload behind a controlled interface, including model/artifact loading, request admission, batching, resource allocation, health, observability, and rollout. It is broader than running a model process.
- **Inference endpoint** — A network or local interface that accepts inference inputs and returns predictions/generated outputs. Its contract must define authentication, schema, model/version, deadlines, limits, errors, streaming, and fallback; an API-compatible shape does not imply identical semantics.
- **Retrieval-augmented generation (RAG)** — A pipeline that retrieves external records/passages at request time and supplies them as context to a generative model. It can ground answers in selected information, but retrieval can miss, return stale or unauthorized data, and fail to prevent unsupported generation.
- **Embedding** — A learned numeric vector representation of input such as text or images, commonly used to compare semantic similarity. Similarity in embedding space is a ranking signal, not proof that two passages are equivalent or relevant to a particular decision.
- **Vector search** — Nearest-neighbor search over embeddings, exact or approximate. Approximate indexes trade recall, latency, memory, and build cost; tune and evaluate them against task queries, metadata filters, index size, and freshness.
- **Reranking** — A second-stage scoring of an initial candidate set using a model or other richer signal to reorder likely-relevant results. It can improve top-result relevance but adds latency and compute, and cannot recover documents excluded by first-stage retrieval.
- **Agent** — An application pattern in which a model iteratively selects steps or tools toward a goal under a control loop. The model’s plan is probabilistic; constrain iterations, tool permissions, context, cost, deadlines, and user confirmation for high-impact actions.
- **Tool calling** — A structured model output requesting an application-defined function/action with arguments. The host validates arguments, identity, authorization, policy, and effects before execution, returns bounded results, and records the operation. The model’s request is not itself authorization.
- **Context window** — The model’s token capacity for the input and generated output under its interface and architecture. The effective budget must account for system instructions, conversation, retrieved passages, tool results, and response; fitting text into the window does not make all of it useful.
- **Prompt injection** — Malicious instructions in direct user input or indirect content (documents, webpages, tool output) that attempt to override intended behavior or cause disclosure/actions. Treat untrusted content as data, constrain tools in code, enforce authorization outside the model, and test attack paths; no prompt wording alone guarantees prevention.

### Serving mechanics

Autoregressive generation has a prompt-processing/prefill phase and a token-by-token decode phase. Requests with different prompt and output lengths create scheduling and GPU-memory pressure. Continuous or in-flight batching admits new sequences while existing requests decode, improving utilization but requiring fair scheduling and bounded queues. KV cache stores attention state for a request; memory use grows with tokens, layers, model architecture, precision, and concurrent sequences. Paged cache approaches manage fragmented variable-length state, but do not remove the underlying GPU-memory limit.

Serving engines offer different compatibility, kernels, hardware targeting, distributed execution, quantization, LoRA, multimodal support, scheduling, metrics, and operational surfaces. Benchmark with the actual model, tokenizer/template, input/output-length distribution, concurrency, target hardware, and SLO. Compare time-to-first-token, inter-token latency, throughput, tail latency, quality (if quantization changes behavior), GPU memory, and cost per successful task. Avoid vendor benchmark numbers that use a different workload as a deployment promise.

### Retrieval and tool orchestration

A robust retrieval flow usually: identifies caller/tenant and query; applies access-aware metadata constraints; generates one or more search queries; retrieves candidates (lexical, dense vector, or hybrid); reranks if justified; deduplicates and selects a bounded context; and tracks source IDs/version. Chunking should preserve useful semantic boundaries and metadata. Smaller chunks improve localization but can lose context; larger chunks consume context and may return irrelevant material. Test with real questions and document updates.

An agent loop should be bounded by a maximum number of model turns, tool calls, wall time, tokens, and allowed tools. Tools should expose narrow capabilities with typed arguments and scoped credentials; return only necessary data. Use deterministic orchestration where sequence and authorization are known. MCP standardizes a protocol for exposing tools/resources/prompts across clients and servers, but the host still must authenticate and authorize each use. As of the 2026-07-28 revision, MCP describes a stateless protocol core with per-request version/capability handling; older handshake-era implementations require compatibility negotiation and migration. Protocol interoperability does not remove prompt-injection or confused-deputy risks.

## Cross-item comparison

| Supplied name | Layer | Useful for | Main limit |
|---|---|---|---|
| Model serving | Runtime platform | Capacity, scheduling, model lifecycle | Does not define the business API or quality |
| Inference endpoint | Interface boundary | Contracted request/response access | Compatibility does not guarantee same model or result |
| RAG | Application data path | Current/domain evidence at inference | Retrieval and grounding can fail independently |
| Embedding | Representation | Semantic candidate matching | Similarity is not truth or authorization |
| Vector search | Retrieval mechanism | Approximate or exact nearest-neighbor lookup | Recall/latency/index freshness trade-offs |
| Reranking | Retrieval refinement | Better ordering of candidate passages | Adds a stage and cannot recover missed candidates |
| Agent | Control pattern | Adaptive multi-step tasks | Non-determinism, loops, cost, and tool risk |
| Tool calling | Action interface | Typed model-requested operation | Application must validate and authorize execution |
| Context window | Model constraint | Maximum combined input/output token budget | More context can raise cost and distract model |
| Prompt injection | Threat class | Threat modeling untrusted instructions | No text-only mitigation is a security boundary |

Within this group, embeddings feed vector search; vector search plus optional reranking provides retrieval candidates; RAG supplies selected results to model context; tool calling is one mechanism an agent can request; and inference endpoints expose the serving contract. MCP can standardize tool exchange but is not synonymous with an agent or with authorization.

## Examples

**Policy answer RAG.** The service resolves the user’s allowed policy set, retrieves keyword and dense candidates under tenant/access filters, reranks the top set, and builds a context with document IDs and dates. It caps prompt and output tokens, requests a structured answer with evidence references, validates that every reference came from retrieved material, and abstains when support is weak. Measure retrieval recall separately from citation support and answer quality. If the index is stale, show the source version or decline instead of asserting current policy.

**GPU serving overload.** A local model endpoint experiences rising queue wait. The operator verifies prompt/output lengths and concurrency, then checks GPU memory, cache pressure, batch composition, and downstream retrieval time. If queue wait consumes the deadline, admission control rejects or queues requests within a bound; optional long-context tasks are routed to a slower tier. Increasing batch size blindly could improve average throughput but worsen tail latency or memory failure.

**Tool request.** An agent asks for `create_ticket` with a project and description. The host verifies the authenticated user may create tickets in that project, validates length and fields, applies rate/approval policy, executes once using an idempotency key, and returns a minimal ticket reference. A prompt injection inside a retrieved page asking to “export all employee records” cannot expand the tool’s application-side scope.

## Common mistakes

- Treating an OpenAI-compatible endpoint as proof that every parameter or model behavior is interchangeable.
- Assuming a context window is a target; stuffing it full can increase cost and reduce attention to relevant evidence.
- Believing nearest-vector distance establishes truth, relevance, or permission.
- Expecting reranking to fix a first-stage retrieval miss or poor document parsing.
- Treating tool-call JSON as trusted code or authority.
- Giving agents broad credentials and unlimited steps, then relying on prompt instructions to prevent unsafe actions.
- Assuming RAG eliminates hallucination or prompt injection.
- Using only mean latency/throughput benchmarks and missing p95/p99, time-to-first-token, queueing, or workload-specific failure.
- Selecting serving engine from stale feature comparisons; TGI is currently documented as maintenance mode, and engine capabilities change rapidly.
- Assuming MCP handles user identity, per-tool authorization, or safe tool implementation for the host application.

## Knowledge checks with answers

1. **What can a vector search result establish?** That an indexed vector is near a query vector under a chosen metric; separate relevance, freshness, source correctness, and authorization checks remain necessary.
2. **Can an agent call a tool because the model asks?** The host may consider the request, but must independently validate arguments and authorize the user/action before execution.
3. **Why measure queue wait and time-to-first-token?** They expose admission/scheduling delay before useful output, which total generation time or GPU utilization alone can hide.
4. **What does RAG add, and what does it not guarantee?** It adds a retrieval/context path for external evidence; it does not guarantee retrieval correctness, access control, grounded output, or immunity to prompt injection.
5. **How should an inference engine be benchmarked?** Use the actual model and template, representative prompt/output lengths and concurrency, target hardware, tail/streaming metrics, quality, memory, and total cost.
