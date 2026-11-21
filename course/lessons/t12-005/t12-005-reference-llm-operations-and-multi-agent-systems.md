# ai and machine learning system design — Reference: Prompt operations, multi-agent coordination, and model economics

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/), [MCP 2026 revision announcement](https://blog.modelcontextprotocol.io/posts/2026-07-28/), [OpenAI Swarm repository](https://github.com/openai/swarm), [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/), [LangGraph human-in-the-loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/), [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching), [LiveKit interruption handling](https://docs.livekit.io/agents/logic/turns/adaptive-interruption-handling/), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/).

## Scope and version

This lesson covers the eleven supplied topics. Product capabilities and pricing change quickly; the operational guidance here is version-independent unless stated. MCP version 2026-07-28 introduced a stateless protocol core without the older initialize handshake and protocol session; older revisions retain their prior lifecycle. Swarm’s own repository labels it experimental and educational and points developers to the OpenAI Agents SDK as its production-oriented evolution. Do not treat project names as interchangeable or infer identical APIs.

## How this group fits the mental model

Start with a conventional workflow: explicit states, typed data, deterministic validation, and known branches. Add model decisions only where language ambiguity, perception, or flexible synthesis provides value. Add multiple agents only when measured separation, parallelism, or specialization offsets extra inference, coordination, failure, and debugging cost.

A model output is untrusted input. Identity, access checks, financial or destructive side effects, rate limits, and data-retention policy belong in application code and infrastructure. Bound every run by wall time, model turns, tokens, tool calls, fan-out, retries, and spend. Give tools narrow capabilities and scoped credentials. Record model, prompt, tool, policy, and data versions so an incident can be reproduced.

## Supplied names explained

- **Prompt-as-code** stores system instructions, templates, schemas, and examples as reviewed artifacts. Test prompts like code: lint variables and escaping, run regression and adversarial suites, version dependencies, and require a release decision.
- **Red teaming** probes model behavior, retrieval content, tool permissions, integrations, and deployment boundaries with adversarial and abuse cases. Findings should become prioritized fixes and repeatable regression tests; a one-time test cannot certify safety.
- **Multi-agent orchestration** coordinates multiple model-driven workers or roles. Explicitly define task ownership, shared state, identity, allowed tools, communication, completion criteria, cancellation, and budgets. More agents can amplify correlated mistakes and cause retry or coordination loops.
- **Planner-executor pattern** has a planner propose bounded steps and an executor perform validated operations. Treat plans as suggestions: check each step against current state, authorization, schema, invariants, deadlines, and idempotency before execution.
- **Model routing** selects an eligible model/provider based on task capability, privacy, quality threshold, latency, capacity, quota, and cost. Route only among candidates that satisfy policy; define behavior when no candidate qualifies and avoid leaking protected inputs to an unapproved provider.
- **Model cascade** starts with a cheaper or faster option and escalates selected requests under an evaluated rule. Validate escalation criteria against a representative set. It can increase tail latency and total cost when the first answer is discarded; a cascade is not automatically cheaper.
- **Prompt caching** reuses processing for repeated prompt prefixes where a provider supports it. It is distinct from caching a final answer. Eligibility, cache lifetime, privacy/isolation, accounting, and price are provider- and version-specific; test cache behavior and ensure tenant-specific content cannot cross boundaries.
- **Streaming speech recognition (ASR)** emits partial transcriptions while audio arrives. Partial hypotheses can be revised; downstream actions should wait for appropriate finalization or use reversible state.
- **Text-to-speech (TTS) streaming** delivers audio in chunks before a whole utterance is complete. Preserve chunk ordering and cancellation; stop stale speech after a user interruption or turn change.
- **Model Context Protocol (MCP)** standardizes how AI clients and servers exchange capabilities and expose tools, resources, or prompts. It does not grant a tool permission or make its implementation safe. With the 2026-07-28 revision, requests are self-describing and the core is stateless; authorization and application state still require explicit design. Support and negotiate the revision actually implemented by each peer.
- **Multimodal data pipeline** ingests and transforms text, image, audio, video, and document data. Preserve source identity, access policy, timestamps, transformations, and modality-specific quality signals; deletion and permission changes must propagate to derived artifacts such as transcripts and embeddings.

## Cross-item comparison

A prompt change can alter refusal, tool selection, verbosity, or data disclosure even when application code is unchanged. Store the prompt identifier and immutable revision with model, sampling settings, output schema, tool catalog, retrieval version, and evaluation results. Compare on a fixed regression suite, inspect representative failures, release gradually, and retain a tested rollback. Prompt A/B results need predeclared outcome measures, sufficient exposure, and a safe variant policy.

Provider prefix caching may reduce repeated prefill work but normally does not mean that the semantic answer itself is reused. Cache hits depend on exact provider rules and compatible prefixes. Do not place tenant secrets in a shared cache key space without understanding isolation guarantees; measure real hit rate, latency, and cost rather than assuming savings.

## Multi-agent topology and failure behavior

A planner-worker graph can parallelize independent searches or analyses, but it should have:
- a typed task contract and least-privilege capability per worker;
- a shared deadline and aggregate token/cost budget;
- cancellation and timeout behavior for slow or failed branches;
- deterministic merge rules that preserve source citations and disagreements;
- idempotent, authorized execution for side effects;
- trace IDs and per-node inputs/outputs with sensitive-data minimization;
- explicit memory scope, retention, provenance, and correction semantics.

Use durable checkpoints when a workflow must resume after interruption. For example, LangGraph persistence separates thread-scoped checkpoints from application-defined cross-thread stores. Resuming a graph does not make external side effects exactly-once: persist operation identifiers and use idempotency or reconciliation.

## Voice interaction latency

A voice turn includes capture, endpointing, network, ASR, orchestration/model, tools, TTS, and playback. Track end-to-end time to first useful audio and interruption-stop time, not only model latency. Barge-in should cancel or invalidate work from the previous turn; tag events with session/turn identity so delayed ASR or TTS chunks cannot overwrite the new turn. Streaming improves perceived responsiveness but creates partial-result, cancellation, and ordering cases to test.

## Examples

A fixed application flow authenticates the user, searches permitted sources, and asks a model to synthesize citations. A planner may request a bounded set of independent searches; each worker receives only the relevant scoped source access. A deterministic merger deduplicates evidence and records disagreement. If the model requests an export tool, code checks user permission, destination, data classification, size, and confirmation policy. A timeout leaves the operation outcome unknown; retry with an idempotency key or query the operation status. The system refuses or abstains when sources disagree or no eligible model meets the privacy and quality policy.

## Common mistakes

- Use deterministic workflow for known, auditable steps; use agent planning for genuine uncertainty that benefits from adaptive choices.
- Add parallel agents only when latency or task decomposition justifies their coordination overhead.
- Route to a model only after applying privacy and capability constraints; cheapest-first routing can violate policy or quality.
- Measure cascade success, fallback rate, repeat work, and p95/p99 latency as well as average token price.
- Never mistake MCP interoperability, structured output, guardrails, or prompt wording for authorization.
- Avoid shared prompt or semantic caches that ignore tenant, user, model, retrieval, or permission context.
- Do not use partial ASR transcripts as final commands for irreversible action.
- Treat prompt caching, ASR/TTS APIs, agent SDKs, and protocol revisions as current implementation details to verify before deployment.

## Knowledge checks with answers

1. **When is a multi-agent design justified?** When measured specialization or parallelism offsets coordination, cost, failure, and operational burden.
2. **What does planner-executor separation protect?** It creates a place to validate proposed steps before authorized code executes them; it does not guarantee the plan is correct.
3. **Does MCP authorize tool calls?** No. The host and server enforce identity, scopes, validation, and side-effect policy.
4. **What changes with MCP 2026-07-28?** The protocol core becomes stateless and drops the older initialize handshake/session from that revision; older revisions still exist and must be handled deliberately.
5. **How should voice interruption work?** Cancel or invalidate prior work and reject late chunks using session/turn identity.
6. **When does model cascading save money?** Only when measured escalation rates and task outcomes yield lower total cost per successful task without unacceptable latency or quality loss.
