# end-to-end system design case studies — Reference: Neural reranking cascade

Sources: [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832), [ColBERT project and implementation](https://github.com/stanford-futuredata/ColBERT), [MTEB: Massive Text Embedding Benchmark](https://arxiv.org/abs/2210.07316), [BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models](https://arxiv.org/abs/2104.08663).

## Scope and version

A neural reranking cascade orders search candidates with progressively more expensive scoring stages. The pattern is model-agnostic; the cited ColBERT paper illustrates late interaction, not a universal best choice. Benchmark quality depends on corpus, query distribution, language, labels, hardware, and serving configuration. Re-evaluate when models or data change.

## How this group fits the mental model

Search usually has two different jobs. Candidate retrieval must find a reasonably broad set cheaply from a large corpus. Ranking then orders that candidate set by usefulness. A candidate omitted by retrieval cannot be recovered by a reranker, so measure recall at each stage as well as final ranking quality.

A common cascade starts with lexical retrieval (for example BM25) and/or an embedding-vector retriever, merges candidates, then applies a more expensive model to a bounded top-K. A cross-encoder reads the query and each candidate together and predicts relevance; it can model token interactions but requires one inference per query-document pair. A late-interaction model such as ColBERT independently encodes query and document tokens and scores their token-level interactions, enabling offline document representations with a different memory/compute tradeoff. The final system may combine scores or ranks, diversify results, apply policy filters, and then return results.

## Supplied names explained

- **Candidate generator/retriever:** fast lexical, sparse, dense, or hybrid stage that searches the full index and produces a shortlist.
- **Cross-encoder reranker:** jointly processes each query-candidate pair; often expressive but more expensive per candidate.
- **Late interaction:** separately encodes query and document tokens, then computes fine-grained token interactions; ColBERT is an example, with larger index/storage needs than one-vector dense retrieval.
- **Top-K:** number of candidates passed forward; increasing it can improve recall but raises downstream latency and cost.
- **Rank/score fusion:** combines ranked lists or model scores. Reciprocal Rank Fusion combines ranks without requiring scores to be calibrated to the same scale; learned or weighted score fusion needs validation.
- **Judgment set:** human or behavioral relevance labels used to measure ranking quality; biased or incomplete labels can mislead model selection.
- **Fallback:** a lower-cost retrieval/ranking path used when a model, feature store, or inference service is unavailable or over budget.

## Cross-item comparison

| Stage | Strength | Main cost or risk |
| --- | --- | --- |
| BM25/lexical retrieval | Exact terms, identifiers, and explainable matching; efficient inverted index | Vocabulary mismatch and semantic paraphrases can be missed |
| Dense-vector retrieval | Semantic matching across related wording | Embedding/index cost, domain drift, and missed exact constraints or identifiers |
| Cross-encoder reranking | Rich query-document interaction on a short list | Per-pair inference cost, latency, batch sizing, truncation, and serving capacity |
| ColBERT-style late interaction | Token-level interaction while precomputing document representations | Multi-vector index and memory/serving complexity; still needs retrieval and tuning |

## Examples

For an API documentation search, retrieve candidates from BM25 and dense vectors, union and deduplicate them, then rerank perhaps a bounded top-K using a cross-encoder. Preserve lexical hits for exact symbol names such as `HttpClientFactory`; a semantic model may prefer a generally related article. Set a strict inference deadline and return the base ranking if the reranker is slow. Log model version, candidate count, latency, timeout/fallback rate, and result position without retaining sensitive query text longer than policy permits.

Evaluate on held-out queries with metrics suited to the task: Recall@K for candidate retrieval, and metrics such as NDCG@K or MRR for final ordering. Use human judgments or reliable task outcomes, slice results by query type, language, freshness, and user group, and compare relevance with p50/p95 latency, throughput, cost, and failure rate. Online experiments need guardrails; click-through is an imperfect relevance label because position and presentation influence clicks.

## Common mistakes

- Expecting a reranker to recover a relevant item absent from candidate retrieval.
- Increasing K without measuring inference latency, queueing, and cost.
- Using only semantic retrieval and losing exact-match behavior for names, IDs, and quoted terms.
- Comparing raw scores from different models without calibration or rank fusion.
- Training or evaluating on leaked/overlapping query-document data and overestimating generalization.
- Treating clicks as unbiased ground truth or optimizing relevance without latency and safety guardrails.
- Truncating long candidates without checking whether relevant evidence is beyond the model’s input window.
- Omitting fallback behavior, model-version tracking, or monitoring for distribution drift.

## Knowledge checks with answers

1. **Can reranking improve recall over the candidate set?** No. It changes order among retrieved candidates; broaden or improve retrieval to recover omitted documents.
2. **Why use a cascade?** Cheap stages search broadly, while expensive models spend compute only on a small candidate set.
3. **What is the main cross-encoder cost?** It evaluates query-document pairs jointly, so cost grows with candidate count and query volume.
4. **How do you decide if the cascade is better?** Measure retrieval recall, final ranking quality, slices, latency, throughput, cost, and failure behavior on representative held-out data and controlled online tests.
