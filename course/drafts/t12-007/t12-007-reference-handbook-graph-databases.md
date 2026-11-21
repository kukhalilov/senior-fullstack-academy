# system design technology landscape and selection — Reference: Graph databases

Sources: [Neo4j graph database concepts](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/), [Neo4j graph modeling tips](https://neo4j.com/docs/getting-started/data-modeling/modeling-tips/), [Neo4j index configuration](https://neo4j.com/docs/operations-manual/current/performance/index-configuration/), [Neo4j graph type and schema ingestion guide](https://neo4j.com/docs/data-ingestion-guide/best-practices/schema-and-indexes/), [HLD Handbook technology overview](https://hld.handbook.academy/technologies/).

## Scope and version

This lesson explains property-graph database design using Neo4j as the named product. It focuses on current Neo4j documentation and general graph-modeling principles. Neo4j’s Cypher, editions, graph algorithms, clustering, and APIs evolve; versioned features such as graph types introduced in Neo4j 2026.02 require compatible Cypher 25 support. Check the deployed edition/version for exact capabilities.

## How this group fits the mental model

A property graph stores entities as nodes and their connections as relationships; both can have properties. Labels classify nodes, relationship types describe connections, and relationships have direction (queries may choose to traverse either direction). The graph is useful when the question is about paths and connections: “Which devices are connected to accounts that share a suspicious address within three hops?” or “What route connects this component to a service dependency?”

Unlike a relational join that repeatedly matches foreign-key values, a graph engine can traverse stored relationships directly. But the database does not make every query fast automatically. Start queries from selective, indexed anchor nodes, constrain relationship types and depth, and avoid unconstrained path expansion. Model around the questions that matter, measure with realistic graph sizes, and expect some queries to be better served by relational or search indexes.

Graph shape matters. A supernode with millions of edges can become a traversal hotspot; high-degree nodes require query bounds, alternate projections, partitioning, or precomputation. A relationship can carry meaningful attributes such as `since`, `role`, or `weight`. Promote a property to its own node when it is shared, independently queried, or has its own lifecycle. Avoid turning every attribute into a node because that adds path length and complexity.

## Supplied names explained

- **Neo4j:** property-graph database queried with Cypher. It supports property indexes, constraints, text/full-text and point indexes; the query planner selects suitable indexes for Cypher. Graph Data Science and vector-search capabilities are additional product areas whose availability and behavior depend on product/version.
- **Node:** entity such as person, account, device, or service; labels and properties classify/describe it.
- **Relationship:** directed, typed connection between two nodes; properties can describe the edge itself.
- **Traversal:** following relationships from a starting node under type, direction, depth, and predicate constraints.
- **Path:** ordered sequence of nodes and relationships; variable-length path queries need explicit bounds and uniqueness semantics to control work.
- **Index/constraint:** indexes help locate anchor nodes or properties; constraints enforce data invariants such as key uniqueness. Indexing every property increases storage and write maintenance.
- **Graph type (Neo4j 2026.02+, Cypher 25):** a newer schema mechanism for declaring graph element/property types and constraints; older deployments may use traditional indexes and constraints instead.

## Cross-item comparison

| Model | Strong fit | Trade-off |
| --- | --- | --- |
| Property graph | Multi-hop relationship queries and evolving connection-centric models | Query shape and graph degree govern cost; not a replacement for every relational constraint or aggregate scan |
| Relational tables | Structured entities, joins, constraints, reporting, and set-based operations | Deep recursive traversals can require recursive queries and repeated joins; performance depends on indexes and query shape |
| Document store | Aggregate-oriented reads of nested data | Relationship traversal across many documents can require repeated fetches or denormalization |
| RDF/triple store | Semantic web/RDF data with subject-predicate-object and ontology standards | Different data/query model (e.g., SPARQL); property-graph and RDF semantics are not interchangeable |
| Graph processing engine | Large offline algorithms such as centrality/community detection over snapshots | Batch processing may not provide the same online transactional update/query path as an operational graph DB |

## Examples

For fraud investigation, model `(:Account)-[:USES]->(:Device)` and `(:Account)-[:SENDS_TO]->(:Account)`. Add uniqueness constraints for stable account/device IDs and indexes on properties used to find an initial account. A query searches only a bounded path pattern and returns the explanation path for an investigator. If a device is used by an unusually large number of accounts, make that fan-out explicit in monitoring and cap or route broad expansion separately; otherwise, one request can touch a large portion of the graph.

Use transactional writes for related node/relationship changes when they must appear together. Define idempotent ingestion keys so replay does not create duplicate graph entities. Index only properties used in lookup/traversal entry points, and profile queries on representative data. For graph analytics, a snapshot or projection can be processed by a graph algorithm engine; avoid running an expensive global algorithm synchronously on a user request.

## Common mistakes

- Choosing a graph database because the domain has relationships; relational databases also model relationships well.
- Starting a traversal from all nodes or permitting unbounded variable-length paths.
- Using generic relationship types and filtering huge edge sets after traversal.
- Creating a supernode without understanding degree, fan-out, and read/write hotspots.
- Adding an index for every property and increasing write/storage cost without useful query selectivity.
- Confusing property graphs, RDF triples, and graph-processing platforms as one interchangeable “graph DB.”
- Treating Cypher syntax or protocol familiarity as proof of scale, transaction, or edition parity.
- Modeling queries before listing the business questions, then accumulating workarounds that expand the graph unnecessarily.

## Knowledge checks with answers

1. **When is a graph database a good fit?** When important queries repeatedly navigate multi-hop relationships and the graph model makes those paths natural and efficient.
2. **Why do graph queries still need indexes?** Indexes find selective starting points; traversals then expand from those anchors instead of scanning all nodes.
3. **What makes a supernode risky?** Its large degree can make traversals expensive and concentrate load; query bounds and alternate representations may be needed.
4. **Does Neo4j’s 2026 graph type feature apply to all versions?** No. The documentation says graph types are introduced in 2026.02 and require Cypher 25; earlier versions use other schema mechanisms.
