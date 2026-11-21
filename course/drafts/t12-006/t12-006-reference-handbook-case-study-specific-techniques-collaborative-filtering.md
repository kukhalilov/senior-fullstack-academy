# end-to-end system design case studies — Reference: Collaborative filtering

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google ML: Collaborative filtering basics](https://developers.google.com/machine-learning/recommendation/collaborative/basics), [Google ML: candidate generation overview](https://developers.google.com/machine-learning/recommendation/overview/candidate-generation), [Google ML: recommendation system stages](https://developers.google.com/machine-learning/recommendation/overview/types), [Google ML: retrieval](https://developers.google.com/machine-learning/recommendation/dnn/retrieval).

## Scope and version

This lesson introduces collaborative filtering for personalized recommendations. Model families and platform tools evolve; the linked Google ML material explains general concepts and examples, not a universal production recipe. The feature, feedback, training, privacy, and evaluation policy must be designed for the product.

## How this group fits the mental model

Collaborative filtering recommends items using patterns in user-item interactions: people with similar behavior may like similar items, or items consumed by similar users may be related. It can discover relationships that are not obvious from item metadata, but it depends on interaction data. New users and new items have little or no interaction history, and historical exposure affects what the model learns.

Large recommendation systems usually separate candidate generation from scoring and re-ranking. Collaborative filtering may retrieve a manageable set of candidates; later stages can rank for the current context, apply policy/safety filters, and diversify the results. The model is only one part of a serving and feedback system.

## Supplied names explained

- **User-item interaction matrix:** sparse representation of users and items with observed ratings, views, purchases, skips, or other feedback. Most pairs are unobserved; missing does not necessarily mean dislike.
- **Explicit feedback:** intentional ratings or preference labels. It can be sparse and self-selected.
- **Implicit feedback:** behavior such as clicks, watch time, or purchases. It is abundant but ambiguous: a view may be accidental, exposure-limited, or not a positive preference.
- **User-user filtering:** find users with similar interaction patterns and recommend items they engaged with.
- **Item-item filtering:** find items co-consumed by similar users and recommend related items.
- **Latent-factor/matrix-factorization model:** represents users and items in learned lower-dimensional vectors whose compatibility predicts interaction preference; trained factors do not inherently explain causality or user intent.
- **Candidate generation:** retrieve a relatively small set from a large catalog, sometimes using nearest-neighbor retrieval over learned embeddings.
- **Cold start:** lack of interaction history for a new user/item; mitigate with onboarding, popularity, content features, contextual signals, or exploration, while respecting privacy/consent.

## Cross-item comparison

| Method | Data basis | Strengths | Weaknesses |
| --- | --- | --- | --- |
| User-user collaborative filtering | Similar user interaction histories | Intuitive neighborhood explanations and personalized items | User neighborhoods can be costly, sparse, unstable, and sensitive to behavior change |
| Item-item collaborative filtering | Co-interaction patterns among items | Item relationships can be reused for many users; often useful for “similar items” | New items have few interactions; co-occurrence may reflect exposure/popularity, not intrinsic similarity |
| Latent-factor collaborative filtering | Learned user/item interaction vectors | Compact representation and broad generalization across observed patterns | Requires model training/serving and can be hard to explain; sparse/biased data and cold start remain |
| Content-based recommendation | Item attributes and user/item profile | Can recommend new items with metadata and explain shared features | Depends on metadata quality and may over-specialize around already-consumed characteristics |

## Examples

If users who watched items A and B often also watch C, an item-item model may retrieve C for someone who watched A. This is a behavioral association, not proof A caused interest in C. If C was rarely shown to users, lack of co-clicks may reflect lack of exposure rather than lack of relevance. Log impressions as well as interactions, account for position/exposure bias, and evaluate with offline held-out data plus online experiments and guardrails.

A practical pipeline collects consented, minimized events with timestamps and impression context; builds a training dataset with a defined feedback window; trains or updates embeddings/neighborhoods; generates candidates; scores them for user/context; filters unavailable, unsafe, or already-consumed items; applies diversity or business constraints; and serves a versioned result. Monitor candidate recall, coverage, freshness, latency, diversity, popularity concentration, feedback loops, and outcomes across relevant user groups.

For a brand-new user, blend a short preference selection or session context with broadly useful candidates and controlled exploration. For a new item, content features or editorial candidates can bridge the gap until interactions accumulate. Avoid silently interpreting every unobserved item as a negative training example.

## Common mistakes

- Treating missing user-item interactions as negative preferences.
- Training only on clicks without accounting for what was shown, where it appeared, and who could see it.
- Assuming co-occurrence means causal similarity or user satisfaction.
- Expecting collaborative filtering alone to solve new-user/new-item cold start.
- Optimizing only click-through rate, which can favor clickbait or narrow popularity loops.
- Recommending already-consumed, unavailable, unsafe, or repetitive items because retrieval lacks post-filters/diversity.
- Using sensitive behavior without clear purpose, consent/notice, retention controls, and access safeguards.
- Deploying a new embedding model without versioning, fallback, stale-candidate handling, or monitoring.

## Knowledge checks with answers

1. **A user never clicked an item. Does that mean they dislike it?** No. The item may never have been shown; non-observation is not the same as negative feedback.
2. **Why keep impression events?** They help distinguish lack of interest from lack of exposure and support analysis of position/exposure bias.
3. **How can a new item be recommended before it has interactions?** Use content metadata/editorial candidates or exploration until collaborative signals become available.
4. **Why split candidate generation and ranking?** Candidate generation narrows a huge catalog efficiently; a later scorer and re-ranker can use richer context and policy constraints.

## Review status

Reviewed 2026-11-21. Google ML documentation confirms interaction-matrix collaborative filtering, latent embeddings, candidate generation, cold-start limitations, and the separate scoring/re-ranking stages. The lesson correctly treats missing interactions as unknown rather than negative feedback and notes exposure bias and privacy/consent requirements. No material factual corrections or missing core concepts were found.
