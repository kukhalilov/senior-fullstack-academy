# ai and machine learning system design — Reference: Classical ML pipelines, feedback, and economics

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://platform.openai.com/docs/guides/production-best-practices), [reference 2](https://cloud.google.com/architecture/framework/ai-ml), [reference 3](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 4](https://owasp.org/www-project-api-security/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Feature store` — Manages reusable feature definitions and serving paths; training/serving parity and freshness are key risks.
- `Training-serving skew` — A mismatch between feature processing during training and inference that degrades model quality.
- `Model registry` — Tracks versioned model artifacts and metadata for review, promotion, and rollback.
- `Canary model rollout` — Serves a limited portion of eligible traffic with a new model while comparing safety and quality signals.
- `Recommendation system` — Ranks candidate items for a user or context; candidate generation, ranking, feedback loops, and fairness are separate concerns.
- `Cold-start problem` — Lack of historical user/item interactions limits personalization; defaults, content signals, and exploration can help.
- `Feedback loop` — Model output influences future observed data, potentially reinforcing prior decisions or popularity bias.
- `Batch inference` — Computes predictions in advance for a known population; it improves request latency but can become stale.
- `Real-time inference` — Computes a prediction during a request; it supports fresh features but adds online latency and dependency load.
- `Multimodal model` — Processes more than one modality such as text, image, or audio; input privacy, preprocessing, and evaluation differ by modality.
- `Token budget` — A bound on prompt, context, and output tokens used to manage context limits, cost, and latency.
- `Fallback policy` — Defines safe behavior when a model is unavailable, over budget, low confidence, or fails validation.

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