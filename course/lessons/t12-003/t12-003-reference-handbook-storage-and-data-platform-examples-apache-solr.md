# data systems storage engines analytics streams and search — Reference: Apache Solr

Sources: [HLD Handbook](https://hld.handbook.academy/), [Solr 10.1.0 docs](https://solr.apache.org/docs/10_1_0/index.html), [Solr 10.1 reference guide](https://solr.apache.org/guide/solr/10_1/), [Solr 10 upgrade notes](https://solr.apache.org/guide/solr/10_1/upgrade-notes/major-changes-in-solr-10.html), [SolrCloud overview](https://solr.apache.org/guide/solr/10_1/deployment-guide/cluster-types.html), [schema and field types](https://solr.apache.org/guide/solr/10_1/indexing-guide/schema-elements.html), [SolrCloud update consistency](https://solr.apache.org/guide/solr/10_1/deployment-guide/solrcloud-update-consistency.html), [vector search](https://solr.apache.org/guide/solr/10_1/query-guide/dense-vector-search.html), [security](https://solr.apache.org/guide/solr/10_1/deployment-guide/securing-solr.html), [Solr release news](https://solr.apache.org/news.html).

## Scope and version

This reference describes Apache Solr 10.1.0, the current 10.1 documentation checked 2026-11-20. Solr is a search platform built on Apache Lucene; it is not a transactional source-of-truth database. Solr 10 is a major compatibility boundary: review upgrade notes, runtime requirements, removed modules and configuration changes before moving a Solr 9 deployment. Solr 10.1 requires Java 21 for the server and Java 17 for SolrJ per its system requirements.

## How this group fits the mental model

An application usually owns canonical records in a transactional database or event log, then projects searchable documents into Solr. At indexing time, field types and analyzers convert input into Lucene index structures optimized for text retrieval, filtering, facets, sorting, geospatial operations and vector similarity. A query parses user intent, evaluates terms/filters across an index, and returns ranked documents. Updates are distributed and become visible to searchers according to commit/searcher policies; a successful update acknowledgement is not identical to every replica immediately exposing the document.

The data flow is therefore: authoritative write → durable change capture/outbox or batch export → transform/index → Solr collection → query and ranking → result presentation. Rebuild the index from the source when schema or analyzer changes require reindexing. Define freshness, deletion propagation, retry, duplicate handling and full-rebuild strategy explicitly. Search availability must not silently decide whether a business write succeeded.

## Supplied names explained

- **Core and collection** — A core is a single Solr index/configuration instance. In SolrCloud, a collection is the logical index made from shards and replicas; a node can host replicas for multiple collections. Do not confuse a collection with one Lucene index file set.
- **Schema and field type** — The schema defines fields, types, indexing/stored/docValues behavior, multi-valued status and analyzers. A `string`-like exact field is suitable for identifiers/facets; analyzed text is tokenized and normalized for language search. Index-time and query-time analyzers must be compatible. Changing analysis does not retroactively transform already indexed terms: reindex when required.
- **Analysis chain** — Character filters, tokenizers and token filters transform text into indexed/query tokens. Stemming, stop words, synonyms, language-specific analysis and normalization affect recall and precision. Test the actual tokens with the analysis tooling; a synonym change may need reindexing depending on where it runs.
- **Update and commit** — Solr accepts add, delete, atomic/partial update, delete-by-id/query, and commit-related commands. A soft commit opens a new searcher for visibility but is not a durability guarantee. A hard commit flushes durable index state. `commitWithin`/auto-commit behavior and replica searcher refresh can produce short visibility differences. Prefer carefully configured server-side commit policies over issuing a hard commit for each document.
- **Querying and ranking** — The standard query parser supports Lucene query syntax; other parsers and JSON Request API support structured filtering and query composition. Query fields, boosts, filters, sort, pagination, faceting, highlighting, spellcheck and result grouping solve different needs. Relevance must be judged with representative queries and offline/online evaluation, not a single demo. Filters can be cached separately from scoring queries, depending on query and configuration.
- **SolrCloud** — Distributed mode uses ZooKeeper for cluster state/config coordination and supports collections, shards, replica placement, leader election, distributed requests and recovery. Sharding distributes an index but makes query fan-out and routing more complex. A collection's shard count and routing strategy are consequential; changing shard topology is not a free linear scale knob.
- **Replica types** — NRT replicas index updates locally and can become leaders; TLOG replicas record updates and can be leader-eligible while replaying logs; PULL replicas periodically copy index segments and do not accept forwarded per-document updates or become leaders. Replica type choices trade indexing work, search freshness, write throughput, recovery and failover eligibility. Check current SolrCloud documentation for exact restrictions.
- **Update consistency** — A request is routed to a shard leader, which assigns a version and forwards to in-sync NRT/TLOG replicas. PULL replicas copy segments periodically. Searchers open independently, so a just-updated document may briefly be visible on one replica and not another. SolrCloud offers useful distributed indexing behavior, but its documented guarantees are weaker than a transactional database. Read-after-write needs an explicit routing/visibility strategy and application tolerance.
- **Vector retrieval** — `DenseVectorField` and query parsers such as `knn`, `vectorSimilarity` and `knn_text_to_vector` support similarity search. Solr 10 adds/updates capabilities including quantized vectors, GPU-backed cuVS integration, filters and ANN controls. Approximate nearest-neighbor search trades recall, latency, CPU/GPU and memory; measure recall at the production filter/selectivity and data size. Vector results are not semantic truth; hybrid retrieval can combine lexical and vector signals.
- **Operational and security surface** — Solr exposes HTTP APIs and an Admin UI; protect them with authentication, authorization, TLS, network boundaries and least privilege. Keep query parameters/data from becoming an injection or resource-exhaustion surface. Monitor indexing lag, update errors, commit/searcher behavior, query latency, cache hit rates, JVM/GC, disk, replica health, leader changes and ZooKeeper. Solr 10 removes several older modules (including Hadoop auth and analytics) and moves toward newer telemetry integrations; check migration notes rather than carrying old config forward blindly.
- **SolrJ and APIs** — SolrJ is the Java client. Solr also exposes REST-like JSON APIs usable by other languages. Solr 10.1 documentation lists API modules and SolrJ variants; choose a supported client/version and use Cloud-aware routing where applicable rather than hard-coding one node.

## Cross-item comparison

Solr and Elasticsearch/OpenSearch are Lucene-based search platforms with different APIs, ecosystems and operational behavior; compare query needs, plugin compatibility, security model, upgrade cadence and team skills rather than assuming their configuration is interchangeable. PostgreSQL full-text search can be simpler when search is modest and colocating data matters; a dedicated engine is useful for richer relevance, faceting and independent query scaling. A vector database may prioritize vector-specific indexing, but Solr can combine lexical and vector search. In every case the index is usually a derived view: if it is lost, correctness depends on rebuilding from an authoritative source.

## Examples

For a product catalog, keep product transactions in the source database and publish changes through an outbox/CDC pipeline. Build Solr documents with a stable product ID, analyzed title/description, exact category and tenant fields, numeric price, availability, and optional embedding. Use filters for tenant/authorization boundaries and business constraints; use scoring for relevance. Replaying events must be safe: replace/upsert by stable ID and handle deletes and out-of-order versions. Track source-to-search freshness and provide a reindex-and-swap path for analyzer or schema changes.

In SolrCloud, a client request may land on any node; the request is routed to relevant shard leaders/replicas. If a shard leader changes during update, inspect the response and retry with idempotent document identity. A soft commit may make a result searchable before the hard-commit durability point. If clients require immediate read-after-write, route to a suitable replica/leader under a documented strategy and still handle timeouts as unknown outcomes.

## Common mistakes

- Treating Solr as the authoritative transactional database or promising immediate replica-wide read-after-write.
- Updating a schema/analyzer and assuming existing indexed documents are transformed automatically.
- Treating soft commit as equivalent to durable hard commit.
- Increasing shard count without checking routing, fan-out, shard sizing and reindex/migration implications.
- Assuming all replica types accept writes, can lead, and expose updates at the same time.
- Treating approximate vector search as exact top-k or ignoring filtered recall.
- Copying Solr 9 configuration into Solr 10 without reviewing removals, Java requirements and module changes.
- Exposing Solr Admin or update APIs without authentication, authorization and network controls.

## Knowledge checks with answers

1. **Where should the canonical product record live?** Usually the transactional source; Solr is a derived search projection with a rebuild and freshness strategy.
2. **Does an acknowledged SolrCloud update mean all replicas can search it immediately?** No. Update replication and independent searcher refresh can create brief visibility differences, especially with PULL replicas.
3. **What changes when the analyzer changes?** Query/index tokenization behavior changes; existing documents may require reindexing so stored terms match the new design.
4. **Why choose NRT, TLOG or PULL replicas deliberately?** They have different indexing, replication, freshness and leader-eligibility behavior, affecting write load, recovery and availability.
5. **How should a team validate vector search?** Measure recall and latency on representative vectors and filters, then combine with lexical/business ranking as needed.
