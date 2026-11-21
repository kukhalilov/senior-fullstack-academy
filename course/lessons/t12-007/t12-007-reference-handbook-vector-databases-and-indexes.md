# system design technology landscape and selection — Reference: Vector databases and indexes

Sources: [Pinecone: Filter by metadata](https://docs.pinecone.io/guides/search/filter-by-metadata), [Weaviate: Hybrid search](https://docs.weaviate.io/weaviate/search/hybrid), [Milvus: Index vector fields](https://milvus.io/docs/index-vector-fields.md), [Qdrant: Manage data](https://qdrant.tech/documentation/manage-data/), [Faiss: Indexes](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes), [pgvector project](https://github.com/pgvector/pgvector), [HLD Handbook: Technology index](https://hld.handbook.academy/technologies/).

## Scope and version

Vector search retrieves items whose numeric representations are near a query representation under a chosen distance or similarity measure. A vector database adds data management and search features around vectors; it is not automatically a semantic search product, and vector similarity is not the same as truth or relevance. This lesson compares Pinecone, Weaviate, Milvus, Qdrant, Faiss, and pgvector at the system-design level. APIs, index options, and hosted features change; check current product documentation. Sources checked 2026-11-21.

## How this group fits the mental model

An embedding model maps an item and query into vectors. An index finds nearby candidates; metadata filters, keyword retrieval, and a reranker may then refine results. Quality depends on the embedding model, chunking or item representation, distance metric, filters, and evaluation data as much as on the storage engine. The system must also keep embeddings in sync with source content and enforce tenant access independently of approximate similarity.

## Supplied names explained

- **Vector embedding:** a fixed-dimensional numeric representation produced by an embedding model. Similarity is useful only to the extent the model’s training and representation match the task. Query and indexed vectors must use compatible models, dimensions, and preprocessing.
- **Distance/similarity metric:** a scoring rule such as cosine, dot product, or Euclidean/L2 distance. The metric and any vector normalization must match the model and index configuration; score values are not universally comparable across models or metrics.
- **Exact search:** compare a query with every vector. It offers exact nearest neighbors for the selected metric but can become expensive as the corpus grows. Use it as a baseline and where data size/latency permit.
- **Approximate nearest-neighbor (ANN) index:** structures such as HNSW graphs or IVF partitions reduce search work, trading some recall for latency, memory, build time, or update complexity. Measure recall and latency on representative data rather than assuming one index is best.
- **Metadata filtering and hybrid retrieval:** filters enforce structured constraints (such as tenant, language, date, or product availability); lexical retrieval catches exact names and identifiers. Hybrid ranking combines lexical and vector candidates. A filter applied after retrieval can return too few eligible items or leak unauthorized candidates into downstream stages; enforce access before results are exposed.
- **Pinecone:** managed vector database with documented vector metadata filtering and server-side document/vector search capabilities that vary by API and index type. Evaluate managed operations, namespaces/tenant boundaries, filter semantics, data freshness, and cost against the current API.
- **Weaviate:** vector database with vector, keyword/BM25, and hybrid search. Its documentation describes configurable score fusion and filters; confirm current collection and query APIs for the selected version.
- **Milvus:** vector database supporting multiple vector types and index/metric combinations. The vector field index is a key design choice; compatibility depends on vector type, metric, and index.
- **Qdrant:** vector database organized around collections and points, with optional payload and filtering indexes. It documents dense, sparse, and multivector representations as well as quantization and storage/index options.
- **Faiss:** similarity-search and clustering library, not a complete multi-tenant database service. It offers exact and approximate index families, including flat, HNSW, IVF, and quantized approaches; the application owns persistence, metadata filtering, replication, access control, and service operations around it.
- **pgvector:** PostgreSQL extension for vector types and similarity search. Its project documents exact search by default and approximate HNSW/IVFFlat indexes; using it keeps vectors near relational data and SQL but does not eliminate index tuning, filter selectivity, or database resource contention.

## Cross-item comparison

| Option | Operational shape | Often a fit when | Main design burden |
| --- | --- | --- | --- |
| Pinecone | Managed vector service | You want a hosted vector retrieval service and its current API fits the workload | Provider behavior, data model, tenancy, filtering, cost, and portability |
| Weaviate | Vector database with built-in lexical/hybrid retrieval features | One platform’s search and data model fit retrieval needs | Versioned query features, index configuration, and service operations |
| Milvus | Vector database with multiple index choices | You need its supported vector/index combinations and can operate the chosen deployment | Index/metric fit, ingestion, scaling, and recovery |
| Qdrant | Vector database with payload filtering and vector index controls | Metadata-filtered retrieval and its deployment model fit | Filter selectivity, payload indexes, replication, and capacity |
| Faiss | Search library embedded in an application | You want algorithmic control and can build the surrounding service | Persistence, metadata, security, distributed serving, updates, and monitoring |
| pgvector | PostgreSQL extension | Relational transactions/joins and vector search can coexist within the database’s capacity | Index tuning, query planning/filter behavior, and shared resource contention |

This is not a performance ranking. Benchmark with the same embeddings, filters, concurrency, update pattern, recall target, and failure conditions. Include source-of-truth storage and re-embedding costs in the comparison.

## Examples

For document retrieval, keep authoritative document text and ACLs in the content system. Chunk documents with stable source IDs, generate embeddings with a versioned model, and store vectors plus tenant/document metadata in the retrieval index. At query time, authenticate the caller, apply authorized tenant/document filters, retrieve a candidate set, optionally merge BM25 results, rerank candidates, and fetch current source content before generation. When a document changes or is deleted, update/delete its chunks and embeddings, propagate access changes, and monitor stale-index lag. Evaluate Recall@k, ranking quality, latency, cost, and cross-tenant isolation; a high vector similarity score alone is not a success metric.

## Common mistakes

- Treating vector similarity as factual correctness or equating a model score with calibrated confidence.
- Mixing embeddings from incompatible models or versions without tracking re-embedding and index migration.
- Choosing an ANN index based only on an advertised query speed while ignoring recall, memory, build, and update costs.
- Assuming metadata filtering is free or always occurs before candidate selection; test selective and broad filters.
- Omitting lexical search for exact names, codes, or identifiers that embeddings may rank poorly.
- Assuming a vector database provides source-of-truth durability, authorization, document lifecycle, or tenant isolation automatically.
- Treating Faiss as a complete database service or pgvector as free of PostgreSQL resource limits.
- Forgetting deletion propagation, stale embeddings, model evaluation, and reindex rollout.

## Knowledge checks with answers

1. **What should be measured when comparing ANN indexes?** Recall against an exact baseline, latency under target concurrency, memory, build/update cost, and filtered-query quality.
2. **Why combine keyword and vector search?** Semantic similarity handles paraphrase; lexical search helps exact terms, identifiers, and rare names.
3. **Does a vector database replace the source-of-truth document store?** Usually not by itself. Keep authoritative content and lifecycle/access rules explicit.
4. **What distinguishes Faiss from the database products?** Faiss is a search library; the application must supply persistent data management, security, metadata, and service operations.
5. **Why version the embedding model?** A change in model or preprocessing can make stored and query vectors incompatible and require a controlled re-embedding/index migration.

## Review status

Reviewed 2026-11-21. Replaced the generic placeholder with a comparative lesson across all six supplied options. Checked official/product documentation for Weaviate hybrid retrieval, Milvus vector/index combinations, Qdrant collections/payload/indexing, Faiss library/index scope, pgvector exact and approximate search, and Pinecone filtering. Added model compatibility, metric, recall/latency, ACL, lifecycle, and evaluation concerns. No vendor performance ranking or unsupported guarantee is asserted. No material omission remains in the supplied topic scope.
