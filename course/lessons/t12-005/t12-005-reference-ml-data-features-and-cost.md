# ai and machine learning system design — Reference: Classical ML pipelines, feedback, and economics

Sources: [HLD Handbook](https://hld.handbook.academy/curriculum/ai-ml-system-design/), [Feast architecture](https://docs.feast.dev/getting-started/components/overview), [Feast model inference](https://docs.feast.dev/getting-started/architecture/model-inference), [MLflow Model Registry](https://mlflow.org/docs/latest/ml/model-registry/), [MLflow registry workflow and stage migration](https://mlflow.org/docs/latest/ml/model-registry/workflow/), [KServe](https://kserve.github.io/website/), [Google recommendation systems](https://developers.google.com/machine-learning/recommendation).

## Scope and version

This lesson covers all twelve supplied terms. Product documentation was checked 2026-11-20. MLflow Model Stages have been deprecated since version 2.9.0; current guidance favors aliases, tags, and environment-aware access. Feature-store and serving behavior depends on selected implementation and backend.

## How this group fits the mental model

A production model is one component in a chain: define a target; collect and validate sources; create features without leaking future information; train and evaluate; register an artifact with lineage; deploy a version; fetch features at inference; validate the score; convert it to an action; collect delayed outcomes; monitor and retrain under controlled conditions.

Separate model quality from decision quality. A ranker can predict clicks well while optimizing a harmful or low-value objective. Define outcomes and constraints before selecting algorithms.

## Supplied names explained

- **Feature store** organizes reusable feature definitions and often offline historical and online low-latency serving. It helps share definitions and point-in-time retrieval; it does not guarantee freshness or parity automatically.
- **Training-serving skew** is a mismatch between training and inference features or transformations. Causes include separate code, clocks, missing-value defaults, stale online values, and point-in-time leakage. Reuse transformations and test both paths on identical records.
- **Model registry** catalogs versioned artifacts, lineage, metadata, and deployment references. It improves reproducibility but does not itself deploy or guarantee the intended model is loaded. In MLflow use current aliases/tags and environment controls; avoid new workflows based on deprecated fixed stages.
- **Canary model rollout** gives a bounded traffic share or cohort to a candidate while checking predeclared quality, safety, latency, and cost. Use interpretable assignment and avoid risky exposure until controls are in place.
- **Recommendation system** selects or ranks items for a user or context. Candidate generation, ranking, and final policy are distinct stages; optimize real outcomes with relevance, diversity, freshness, safety, and business constraints.
- **Cold-start problem** is sparse history for a new user, item, or context. Use explicit defaults, content/context signals, popularity priors, and carefully bounded exploration; do not infer a detailed preference profile from little evidence.
- **Feedback loop** occurs when the model changes what users see and therefore which outcomes are observed. Exposure and position create selection bias and can reinforce earlier choices. Log exposure and policy context; use suitable experimentation and causal methods.
- **Batch inference** computes predictions ahead for a known population. It amortizes compute and reduces request latency, but values age and need refresh/invalidation rules.
- **Real-time inference** computes during a request using live or near-live features. It can be fresher but adds synchronous latency and dependencies; define deadline, bounded retries, and fallback.
- **Multimodal model** handles more than one modality such as text, images, audio, or video. Each modality requires appropriate preprocessing, privacy, and evaluation; cross-modal similarity is not proof of correct grounding.
- **Token budget** bounds prompt, retrieved context, tool results, and output within context, latency, and price constraints. Reserve room for output; truncate by relevance and policy rather than blindly dropping the tail.
- **Fallback policy** defines behavior when a model/provider/feature is unavailable, too slow, over budget, or unsupported by evidence. Options include deterministic baseline, fresh-enough cache with disclosure, simpler model, defer, abstain, or fail closed for sensitive actions.

## Cross-item comparison

Historical training rows must join only facts available at prediction time; later outcomes must not leak backward. Parity checks should cover timestamps, late arrivals, missingness, defaults, deletes, and transformations. Measure freshness at decision time, not just job completion. Define whether a stale feature is acceptable, recomputed, defaulted, or grounds for abstention.

Estimate total cost per successful task: acquisition and transformation, training, storage, online reads, inference, network, evaluation, human review, and retries. A lower token or GPU price can still cost more per useful result if quality is worse or correction/retry rates rise. Track quality and p50/p95/p99 latency with cost.

A model rollout records model, feature, code, and data versions; limits exposure; and keeps a rollback path. Shadow execution avoids using candidate output for the live decision, but copied inputs still have privacy costs and side effects must be disabled.

## Examples

Generate candidates from retrieval and eligible catalog, rank them with user/context features, then apply hard inventory, region, and content-policy rules. Give new users a safe default blend and an explicit path to personalization. Log items exposed, their positions, relevant versions, and outcomes. Evaluate retrieval recall and ranking quality plus coverage, diversity, latency, and downstream value; watch for feedback bias.

## Common mistakes

- Training with future information or leaking users/items across temporal evaluation splits.
- Assuming a feature store proves freshness, parity, and lineage.
- Promoting solely because offline accuracy rose.
- Ignoring candidate-generation recall when evaluating a ranker.
- Treating clicks as unbiased preference labels.
- Calling inference real time when input features are stale.
- Building on deprecated MLflow stages rather than current registry workflows.
- Rolling back a model without considering its feature schema or preprocessing version.
- Comparing unit price instead of cost per successful outcome.

## Knowledge checks with answers

1. **Why point-in-time joins?** They ensure training uses only information available at the historical decision time and reduce leakage.
2. **Why log exposures?** Only shown items can produce observed outcomes; exposure and position explain selection bias.
3. **When is batch inference useful?** When its freshness window meets the product need and scheduled computation reduces synchronous load.
4. **Does a feature store eliminate skew?** No. It helps share definitions, while time, missing values, defaults, and backend differences still need tests.
5. **What should a canary compare?** Predeclared quality, safety, latency, cost, and relevant subgroup outcomes with rollback thresholds.
