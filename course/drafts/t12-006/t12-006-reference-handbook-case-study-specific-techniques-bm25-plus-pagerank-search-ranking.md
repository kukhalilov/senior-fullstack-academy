# end-to-end system design case studies — Reference: BM25 plus PageRank search ranking

Sources: [HLD Handbook](https://hld.handbook.academy/), [Robertson and Zaragoza, The Probabilistic Relevance Framework: BM25 and Beyond](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf), [Page, Brin, Motwani, and Winograd, The PageRank Citation Ranking](https://cs.brown.edu/courses/csci2531/papers/pagerank.pdf), [Google ML: recommendation and candidate ranking overview](https://developers.google.com/machine-learning/recommendation/overview/types).

## Scope and version

This case study combines lexical retrieval scoring with a link-graph importance feature for a corpus whose documents link to one another. BM25 variants, PageRank variants, index implementations, and ranking pipelines differ. The original PageRank work is a historical algorithm description, not a claim about any current commercial search engine’s ranking formula.

## How this group fits the mental model

Search first retrieves plausible documents, then ranks them for the user’s query. BM25 scores lexical evidence: term frequency in a document, rarity across the corpus, and document-length normalization. PageRank estimates graph-based importance from incoming links and the importance of linking pages. They measure different things: a highly linked document can be irrelevant to a particular query, and a textually perfect document may be low authority or new with few links.

Use BM25 to produce a query-relevant candidate set and PageRank as one possible ranking feature, not as a replacement for query relevance. A production search system can add field weights, phrase/proximity features, freshness, language, personalization, safety, and learned ranking after retrieving a candidate set. Evaluate each feature’s incremental effect.

## Supplied names explained

- **Term frequency (TF):** how often a query term occurs in a document; BM25 saturates the benefit so repetition does not increase score without bound.
- **Inverse document frequency (IDF):** gives more weight to terms occurring in fewer documents than common terms, based on the indexed corpus/statistics.
- **Length normalization:** adjusts for document length so longer documents do not win solely because they contain more words; BM25 uses a tunable normalization parameter.
- **BM25 parameters:** commonly include `k1` controlling term-frequency saturation and `b` controlling length normalization. Formula variants and defaults differ by implementation; tune against relevance judgments, not folklore.
- **PageRank:** iterative link-analysis score based on incoming edges and a damping/teleportation model. It is query-independent in its basic form and depends on graph snapshot, dangling-node handling, and parameter choices.
- **Score fusion:** combining features with different ranges/distributions, often through normalization, learned weights, rank fusion, or a learning-to-rank model.
- **Candidate generation and reranking:** retrieve a manageable relevant set first; apply more expensive or diverse features to those candidates afterward.

## Cross-item comparison

| Signal | Answers | Blind spots |
| --- | --- | --- |
| BM25 | How strongly does this document match the query terms under this corpus/tokenization? | Synonyms, semantic intent, quality, link authority, freshness, and adversarial keyword stuffing are not solved automatically |
| PageRank | How prominent is this node in the link graph under the graph model? | Query intent, document truth/quality, recency, topic relevance, and link manipulation are not guaranteed |
| Combined score | How should lexical evidence and a graph feature influence ordering? | Raw BM25 and PageRank scales are not directly comparable; naïve addition can swamp one feature and encode unintended bias |

For a small corpus, exact graph computation and a simple linear fusion may suffice. For large dynamic collections, graph recalculation, index freshness, candidate recall, and feature serving costs matter. PageRank can be topic-specific or time-aware in variants, but those are additional design choices, not properties of the basic score.

## Examples

Query: “distributed transaction timeout.” Document A contains those exact terms in a concise technical answer but has few links; document B is a highly linked homepage that mentions only “transaction.” BM25 should favor A for query match; PageRank alone may favor B for graph prominence. A simple combined rank could still put B first if its raw numeric score is much larger. Normalize or learn feature weights from judged query-document pairs, then test whether the result improves metrics such as nDCG/MRR and human relevance judgments without harming rare or new content.

An implementation pipeline may tokenize and analyze query/document text, retrieve top candidates from an inverted index with BM25, fetch PageRank for each candidate from a versioned graph snapshot, combine calibrated signals, apply safety/freshness/diversity rules, and return results with observable ranking explanations. Track zero-result and query-class behavior, feature freshness, index version, latency, and online user outcomes; online clicks are biased by the ranking that produced them and should not be treated as unbiased relevance labels.

## Common mistakes

- Claiming BM25 understands semantic meaning or guarantees relevance; it is a lexical ranking function over an analyzed corpus.
- Treating PageRank as query-specific relevance or as proof that a page is authoritative and trustworthy.
- Adding raw BM25 and PageRank values without calibration or evaluating feature dominance.
- Ignoring tokenization, stemming, language, field weights, duplicate documents, corpus changes, and IDF refreshes.
- Using a stale graph/index without making feature freshness visible to operators.
- Letting link farms or reciprocal-link patterns manipulate the graph feature without spam controls.
- Overfitting parameters to a small query set or optimizing clicks alone while ignoring position bias and user satisfaction.
- Describing basic PageRank as the formula used by a current search engine.

## Knowledge checks with answers

1. **Which signal responds to query-term match?** BM25; basic PageRank is a graph-importance feature independent of the query.
2. **Why not add their raw scores?** Their ranges and distributions differ, so one can dominate accidentally; calibrate/normalize or learn a combination and evaluate it.
3. **What may PageRank miss for a newly published high-quality page?** It may have few incoming links in the current graph, so graph importance can be low despite strong textual relevance.
4. **How do you know whether adding PageRank helped?** Evaluate on held-out judged query-document data and online guardrails/experiments, accounting for click and position bias.

## Review status

BM25 framing is checked against the probabilistic relevance review; PageRank against its original paper. This lesson remains pending full claim-by-claim audit and manifest omission check.
