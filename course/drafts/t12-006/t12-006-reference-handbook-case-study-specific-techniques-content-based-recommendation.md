# end-to-end system design case studies — Reference: Content-based recommendation

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google ML: candidate generation overview](https://developers.google.com/machine-learning/recommendation/overview/candidate-generation), [Google ML: recommendation system stages](https://developers.google.com/machine-learning/recommendation/overview/types), [Google ML: collaborative filtering basics](https://developers.google.com/machine-learning/recommendation/collaborative/basics), [Google ML: retrieval](https://developers.google.com/machine-learning/recommendation/dnn/retrieval).

## Scope and version

This lesson covers recommendations derived from item attributes and a user’s expressed or inferred preferences. It is a general design pattern; feature representations, similarity functions, serving systems, and evaluation methods vary. Metadata and behavioral signals should be governed by privacy, safety, and product policies.

## How this group fits the mental model

Content-based recommendation asks: “Given properties of items a user liked or selected, which other items have relevant properties?” Represent items with features such as category, language, tags, creator, text embedding, or price range. Build a user profile from selected, consumed, or explicitly preferred features, retrieve similar items, score them in context, and apply availability, safety, and diversity rules.

Because the method uses item features, it can recommend a new item before users have interacted with it, as long as its metadata is available. It can also over-focus on items similar to the user’s history, limiting discovery. It does not automatically understand feature quality, context, or whether similarity means the user will enjoy an item.

## Supplied names explained

- **Item feature vector:** structured or learned representation of an item’s attributes. Normalize categorical/numeric fields and handle missing/noisy metadata intentionally.
- **User profile:** aggregation of item features weighted by explicit preferences or interactions, potentially with recency/negative-feedback rules. It is a model of preference, not a full identity or fixed truth about the person.
- **Similarity measure:** method such as cosine similarity or a learned compatibility score to compare item/user representations; scaling and feature weighting affect outcomes.
- **Content-based candidate retrieval:** search or nearest-neighbor step that returns items close to a profile/item representation.
- **Re-ranking and diversity:** later stage adjusts candidate order or removes duplicates to incorporate context, freshness, policy, and broader discovery goals.
- **Cold start:** new users may still lack a profile; ask preferences, use current-session context, or offer broad choices. New items can be handled with metadata-derived features.

## Cross-item comparison

| Method | Primary evidence | Strength | Typical limitation |
| --- | --- | --- | --- |
| Content-based | Item attributes and user/item profile | Can recommend new items with features and explain shared attributes | Can create a narrow “more of the same” loop and depends on metadata quality |
| Collaborative filtering | User-item interaction patterns | Finds relationships beyond hand-authored metadata | Sparse data, exposure bias, and new-user/new-item cold start |
| Hybrid | Both content and interaction signals | Can combine cold-start coverage with learned behavioral affinity | More features, data pipelines, evaluation, and explanation complexity |
| Popularity baseline | Aggregate consumption/popularity | Strong, simple fallback and candidate source | Tends to favor already-popular items and can reduce personalized discovery |

## Examples

A reader repeatedly selects beginner guides about database indexes. A content model can build a profile over “database,” “beginner,” and related concepts, then retrieve an introductory query-planning guide even if it was just published. The UI can explain the shared topics. If the profile only matches previous categories, however, it may never offer adjacent material; reserve some slots for diverse or exploratory candidates and measure whether users find them useful.

For cold-start visitors, ask for a few interests or use the current page/session context without constructing an invasive long-term profile. For a new item, validate metadata, generate its feature representation, put it into the retrieval index, and monitor candidate coverage. If its tags are wrong or incomplete, the ranking may systematically misrepresent it; provide correction and editorial pathways.

An end-to-end pipeline versions feature schemas and model/index versions, refreshes item vectors after catalog changes, retrieves candidates under a latency budget, scores them with current context, removes ineligible items, applies diversity constraints, and logs eligible impressions and outcomes. Evaluate relevance and novelty, catalog coverage, freshness, latency, and user-level guardrails; do not infer success from similarity scores alone.

## Common mistakes

- Treating item similarity as a guarantee that the user will like or benefit from an item.
- Building profiles from noisy clicks without separating accidental/low-intent interactions from explicit preference.
- Leaving outdated, missing, or biased item metadata unchecked.
- Recommending only near-duplicates and creating a filter bubble.
- Assuming content-based models solve new-user cold start; they still need a profile or context.
- Using sensitive user attributes without necessity, safeguards, and a clear policy.
- Updating the catalog without refreshing feature vectors or retrieval indexes.
- Evaluating only offline similarity or click-through while ignoring diversity, coverage, safety, and exposure effects.

## Knowledge checks with answers

1. **Can content-based retrieval recommend a brand-new item?** Yes, if its item features are available and indexed; it does not require interaction history for that item.
2. **Does that solve the new-user problem?** No. A user profile may still be absent; use explicit preferences, session context, broad candidates, or exploration.
3. **Why add diversity after similarity retrieval?** Similarity tends to return near-neighbors, so re-ranking can broaden discovery and avoid repetitive recommendations.
4. **What breaks when item metadata changes?** Stale vectors/index entries can make retrieval wrong until the feature and index pipeline refreshes them.

## Review status

Recommendation pipeline distinctions are checked against Google ML documentation. This lesson remains pending full claim-by-claim audit and manifest omission check.
