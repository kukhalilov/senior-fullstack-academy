# ai and machine learning system design — Reference: Evaluation, governance, and safe operations

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [NIST Generative AI Risk Management Profile](https://nvlpubs.nist.gov/nistpubs/AI/NIST.AI.600-1.pdf), [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/), [Ragas metrics](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/), [LangSmith evaluation types](https://docs.langchain.com/langsmith/evaluation-types).

## Scope and version

This lesson covers the ten supplied evaluation and governance terms. OWASP’s 2026 Top 10 is the current edition checked 2026-11-20. Its categories and numbering differ from the 2025 list; use the current edition when preparing a threat model. A risk taxonomy is a planning input, not a complete control standard. NIST’s Generative AI Profile provides lifecycle risk-management guidance.

## Start with the product claim

Before selecting metrics, state what a user should be able to do, what must never happen, who could be harmed, and what evidence demonstrates success. “The model is accurate” is not testable. Define population, task, context, acceptable error, severity, measurement window, and response when a threshold fails.

Separate capability, reliability, and risk. A single average can hide rare severe errors, subgroup regressions, retrieval misses, or changed behavior. Maintain measures tied to explicit release and operational decisions.

## Supplied names explained

- **Offline evaluation** runs a frozen candidate against a fixed dataset before release. It is repeatable and useful for regressions, but only covers examples, labels, and environments represented in that set.
- **Online evaluation** measures live outcomes or a controlled experiment. It reveals real distributions, but requires privacy controls, safe exposure, sound experiment design, and protection against harmful variants.
- **Golden dataset** is a versioned, curated set of representative cases with labels or expected properties. Record provenance, labeling guidance, disagreement, difficult cases, and coverage gaps; multiple answers may be valid.
- **LLM-as-judge** uses a model to grade outputs against a rubric. It can scale subjective review but may prefer verbosity, position, style, or its own biases. Calibrate against blinded human judgments, measure agreement by task and subgroup, retain disagreements, and use code for deterministic properties.
- **Hallucination** is a generated statement that is factually wrong or unsupported by reliable evidence. Distinguish wrong facts, unsupported claims, fabricated citations, and false claims of action. Retrieval improves access to evidence but does not prove truth.
- **Human-in-the-loop review** lets a person review, correct, approve, or label model output. Define routing criteria, give reviewers source context and authority to reject, and measure queue delay and consistency. Review is not a meaningful safeguard if the person lacks evidence, time, or ability to stop an action.
- **Prompt/version registry** records prompt and instruction revisions together with model identifier, parameters, tool/schema versions, data, code, and evaluations. A prompt string alone cannot reproduce behavior when its dependencies change.
- **Model drift** is a change in inputs, input/target relationship, output behavior, or environment that may reduce performance. Monitor data quality, distributions, delayed labels, calibration, and outcomes. A drift alert signals investigation; it does not prove retraining is the answer.
- **Data poisoning** is malicious or accidental corruption of training, fine-tuning, evaluation, retrieval, or feedback data. Protect provenance and write access, validate sources, preserve audit trails, and test whether contamination changes system behavior.
- **Responsible AI risk assessment** identifies affected people and foreseeable harms, assesses likelihood and severity, assigns mitigations and owners, records residual risk, and monitors whether controls work. Revisit when users, data, models, tools, or deployment context change.

## How this group fits the mental model

Use layers: deterministic unit checks for schemas, access filters, budgets, and tool authorization; component checks for retrieval, ranking, transcription, and classification; end-to-end journeys including tools and failure paths; adversarial cases; operational measures; and human review for qualities automation cannot reliably judge.

For RAG, measure retrieval separately from generation. Context precision/recall, faithfulness, response relevance, and answer correctness address different questions. Ragas offers metrics for RAG and agent/tool tasks, but framework implementations and metric names change. Pin versions and correlate scores with human judgment on the target task. For tool systems, test selected tool, arguments, permission decision, side effect, and final user-visible result. A fluent explanation does not prove that an action succeeded.

## Cross-item comparison

Offline suites catch known regressions before exposure. Online measures reveal behavior under real distributions. Combine offline gates, shadow runs, safe canaries, and monitored expansion when appropriate. Set rollback criteria before release and include quality and safety alongside uptime. Do not silently treat clicks, acceptance, or dwell time as ground truth: users may accept an error, and the system itself changes exposure. Preserve label provenance and selection context.

## Examples

A support assistant answers from a changing policy corpus. Its golden set includes current and historical policy versions, paraphrases, access-control variants, and cases where it must abstain. Component checks verify that the right document was retrieved; end-to-end review checks answer support, citations, permission boundaries, and refusal behavior. A shadow run evaluates a new model without showing its output. A small canary expands only while quality, safety, latency, and cost remain within thresholds. Updating a policy requires index-freshness checks; a green model score cannot compensate for stale source data.

## Common mistakes

- Reporting one average without coverage, uncertainty, severity, or subgroup results.
- Using an LLM judge as the sole authority or without calibration.
- Calling clicks ground truth without considering exposure and selection bias.
- Testing prompts while omitting retrieval, tools, permissions, and side effects.
- Monitoring input drift while ignoring delayed outcomes and calibration.
- Treating a large dataset as automatically representative.
- Treating a risk taxonomy as certification of safety.
- Changing prompts or metrics without versioning and rerunning baselines.
- Sending sensitive examples to an external evaluator without reviewing retention and access.

## Knowledge checks with answers

1. **Why keep component and end-to-end evaluations?** Component tests localize defects; end-to-end tests reveal interactions and user-visible outcomes.
2. **When is an LLM judge appropriate?** For calibrated rubric judgments at scale; use deterministic code for exact constraints.
3. **What does an online metric prove?** Only what its measurement and experimental design support; it does not automatically establish causation or correctness.
4. **When should a risk assessment be revisited?** When models, data, affected users, tools, deployment, or impact changes.
5. **How should the OWASP 2026 list be used?** As the current risk taxonomy checked here, combined with application-specific threat modeling, enforceable controls, and lifecycle risk management.
