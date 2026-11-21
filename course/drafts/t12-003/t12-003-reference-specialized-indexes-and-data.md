# data systems storage engines analytics streams and search — Reference: Search, time-series, graph, and vector workloads

Sources: [HLD Handbook](https://hld.handbook.academy/), [Solr 10.1 field analysis](https://solr.apache.org/guide/solr/10_1/indexing-guide/analysis-screen.html), [Solr 10.1 BM25 field similarity](https://solr.apache.org/guide/solr/10_1/indexing-guide/field-type-definitions-and-properties.html), [PostgreSQL materialized views](https://www.postgresql.org/docs/current/rules-materializedviews.html), [PostgreSQL concurrent refresh](https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html), [Prometheus data model](https://prometheus.io/docs/concepts/data_model/), [Prometheus label guidance](https://prometheus.io/docs/practices/naming/), [Prometheus instrumentation](https://prometheus.io/docs/practices/instrumentation/), [HNSW paper](https://arxiv.org/abs/1603.09320), [Neptune graph model and query languages](https://docs.aws.amazon.com/neptune/latest/userguide/get-started-access-graph.html), [RocksDB Bloom filters](https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter), [PostgreSQL index types](https://www.postgresql.org/docs/current/indexes.html).

## Scope and version

This lesson explains the eight specialized names in the frozen inventory: inverted index, BM25, time-series database, graph database, vector database, approximate nearest neighbor (ANN) index, Bloom filter and materialized view. Current product links are examples, not universal specifications. Search and vector capabilities are changing quickly; validate the exact engine, similarity functions, filtering behavior and index implementation before relying on them.

## How this group fits the mental model

An index is a derived access structure: it spends storage and write/maintenance work to make a chosen query cheaper. The right question is not “which index is fastest?” but “what is the data shape, what must the query return, how fresh must it be, and what errors or approximations are allowed?” A text search index, metric-series index, graph adjacency/index structure and vector ANN index optimize different notions of similarity and traversal. A materialized view stores query output; a Bloom filter is a probabilistic membership hint. Neither is a universal search engine.

For any derived structure, identify the source of truth, update path, lag, deletion handling, rebuild procedure, monitoring and whether its answers are exact or approximate. Test the full workload, including filters, skew, concurrency and p99 latency. Index-only microbenchmarks often hide ingestion and refresh costs.

## Supplied names explained

- **Inverted index** — Maps a term/token to the documents or record IDs containing it. Text is analyzed first: character normalization, tokenization, stemming, stop-word removal, synonyms and position/offset information determine what is searchable and highlightable. A query is analyzed too; mismatched index-time and query-time analysis can reduce recall. Inverted indexes are excellent for term/phrase retrieval and filtering, but they do not automatically understand meaning or guarantee relevance.
- **BM25** — A widely used probabilistic lexical ranking function. It scores query terms based on term frequency, inverse document frequency and document-length normalization, with parameters commonly called `k1` and `b`; implementations may add query-term frequency or other controls. BM25 is a ranking baseline, not a semantic model or calibrated probability that a result is relevant. Field boosts, analyzers, synonyms, freshness, business rules and evaluation data influence results. Tune against judged queries and metrics such as recall@k, precision@k or NDCG rather than by intuition alone.
- **Time-series database** — A database optimized for timestamped measurements, labels/tags and time-window queries. Common mechanisms include time partitioning, compression, retention/downsampling, rollups and specialized range scans. Design metrics carefully: each unique combination of metric name and labels is a series. Unbounded labels such as user IDs or request IDs can explode series cardinality, memory, index and compaction cost. Put event-level high-cardinality data into logs/traces/analytics storage instead of a metrics label set.
- **Graph database** — Stores entities as vertices/nodes and relationships as edges, often with labels/properties. It is useful when traversals across variable-depth relationships are frequent and central to user queries. Relational joins can be simpler for shallow, predictable relationships and stronger tabular reporting. Graph engines differ in model (property graph vs RDF), query languages, indexes, traversal limits and transaction semantics; the word “graph” does not specify these. High-degree nodes, unbounded traversals and weakly selective starting points can dominate cost.
- **Vector database** — Stores vectors and supports similarity ranking, commonly for text/image/audio embeddings. The vector is a representation generated by a model; similarity is useful for retrieval but does not establish factual correctness or semantic equivalence. Choose the distance/similarity metric consistently with embedding training and normalization. Metadata filters, tenant boundaries, freshness, hybrid lexical retrieval and document access control are part of the system, not optional decorations. A vector store may provide ANN indexing, but its storage/transaction/query features vary.
- **Approximate nearest neighbor (ANN) index** — Searches for likely nearest vectors faster than exhaustive distance computation by pruning candidate space. HNSW builds a navigable proximity graph with hierarchical layers; other families include IVF/quantization and tree or disk-oriented methods. Approximation trades recall for memory, index-build time, update behavior and latency. Search controls such as `efSearch`/candidate count can improve recall at more work; build parameters affect graph size and construction. Evaluate recall@k against exact search on representative queries and filters, then benchmark p50/p95/p99, concurrency, updates and memory. Exact kNN is more expensive at scale but can be appropriate for small corpora or evaluation.
- **Bloom filter** — A compact probabilistic set-membership test. “Definitely absent” is safe for an inserted item under the filter's assumptions; “possibly present” can be a false positive. It trades bits and hash operations for a chosen false-positive rate and can reduce unnecessary disk/SSTable lookups. A Bloom filter does not return the matching value and does not prove data exists. Standard Bloom filters do not support arbitrary deletion without variants such as counting filters or rebuilding. Filters become stale/incorrect if writes are not represented in the filter lifecycle.
- **Materialized view** — Persisted output of a query, unlike a regular view that is evaluated when read. It can accelerate stable aggregate/join workloads but introduces refresh cost, refresh lag, storage, invalidation, concurrency and failure behavior. Some systems support incremental maintenance; others recompute on refresh. PostgreSQL's documented `REFRESH MATERIALIZED VIEW CONCURRENTLY` avoids blocking readers but requires a qualifying unique index and still permits only one refresh at a time for a given view. A materialized view is a derived cache/table, not necessarily transactionally synchronized with every base-table update.

## Cross-item comparison

| Query shape | Suitable structure | What it does not solve |
|---|---|---|
| “Find documents containing these terms and rank them” | Inverted index + analyzer + BM25 | Semantic understanding, source-of-truth transactions, universal relevance |
| “Find nearby embeddings” | Exact vector scan or ANN index | Factual truth, access control, guarantee of exact nearest results when approximate |
| “Read recent measurements for a service over time” | Time-series storage/partitioned time index | Unbounded label cardinality or raw-event analytics by itself |
| “Traverse relationships several hops” | Graph model/indexes or relational joins | Automatic low cost for high-degree or unbounded traversals |
| “Skip reading files that cannot contain this key” | Bloom filter | Returning the value or eliminating false positives |
| “Serve a precomputed aggregate quickly” | Materialized view/rollup | Freshness and refresh coordination |

Search systems can combine lexical, vector, filter and reranking stages. Keep the candidate-generation and final-ranking steps distinct: an ANN index can surface candidates; a reranker or business rule reorders them. Always apply authorization to the candidate set and results, including cached results.

## Examples

For product search, index normalized title, description and facets in an inverted index, rank lexical matches with BM25, and optionally retrieve embedding-near candidates for synonyms or semantic intent. Merge/rerank candidates, filter by tenant, status and permissions, and show a fallback when vector generation/indexing lags. Compare lexical-only, vector-only and hybrid retrieval using a labeled query set. Monitor zero-result rate, recall, click/conversion quality, index freshness and latency.

For service monitoring, create bounded labels such as region, service and status class, not per-request identifiers. A series `http_requests_total{service,region,status}` represents a unique label set over time. Estimate possible cardinality as the product of label value counts; if one label can take millions of values, the product may be unmanageable. Keep high-cardinality diagnostics in logs/traces with controlled retention and query them separately.

## Common mistakes

- Treating BM25 as a probability or expecting it to understand an embedding's meaning.
- Changing the analyzer and assuming existing indexed documents automatically receive new tokens.
- Calling every embedding lookup exact or evaluating ANN recall only on unfiltered toy data.
- Storing arbitrary user/request IDs as metric labels and discovering the cardinality cost after production.
- Assuming graph traversal is cheap because the underlying storage is a graph.
- Interpreting a Bloom filter's “possibly present” result as proof of membership.
- Refreshing a materialized view without defining acceptable staleness, reader behavior and failure alerts.
- Ignoring stale access control or deletions in derived search/vector indexes and result caches.

## Knowledge checks with answers

1. **Why do text analyzers matter as much as BM25?** BM25 can rank only the terms the index and query analyzers produce; tokenization/normalization controls which matches exist.
2. **How do you assess ANN quality?** Compare against exact nearest-neighbor results on representative, production-like vectors and filters; measure recall and latency together.
3. **Can a Bloom filter say “not present” incorrectly?** Under its correct construction/update assumptions, no for inserted elements; “maybe present” can be a false positive. Variants and deletion handling alter this contract.
4. **What makes a time-series metric expensive?** The count of unique metric-name/label combinations, not just how often a single series is sampled.
5. **What does a materialized view trade for speed?** It stores precomputed results and pays refresh, storage and staleness/coordination costs.
