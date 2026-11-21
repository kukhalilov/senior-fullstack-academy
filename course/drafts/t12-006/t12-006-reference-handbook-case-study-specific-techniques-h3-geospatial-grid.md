# end-to-end system design case studies — Reference: H3 geospatial grid

Sources: [HLD Handbook](https://hld.handbook.academy/), [current H3 documentation](https://h3geo.org/docs/), [H3 cell indexing](https://h3geo.org/docs/library/index/cell/), [H3 hierarchy API](https://h3geo.org/docs/api/hierarchy/), [H3 traversal API](https://h3geo.org/docs/api/traversal/), [H3 cell statistics](https://h3geo.org/docs/core-library/restable/), [Uber: H3's design](https://www.uber.com/us/en/blog/h3/).

## Scope and version

This case study explains the H3 discrete global grid system and its use as a spatial indexing layer. Current H3 documentation was checked on 2026-11-21; use the linked API documentation for exact behavior of the library release and language binding in use. H3 is an index, not a complete GIS database, routing engine, map projection for display, or substitute for geometry predicates.

## How this group fits the mental model

An application often needs to group nearby events, find candidate locations around a point, or aggregate activity by area. A raw latitude/longitude pair is awkward as a database grouping key: points are continuous, boundaries are complex, and exact geometry queries can be expensive. A spatial index maps locations to discrete cells so systems can group, partition, cache, or search using stable cell identifiers.

H3 is a global hierarchical grid based on an icosahedron projection. Most cells are hexagons, with twelve pentagons required by the global topology. A location can be indexed at a chosen resolution. Coarser cells group larger regions; finer cells separate more local activity. That gives a useful operational knob, but the cell is a spatial approximation: choosing a cell size changes aggregation error, query fan-out, storage volume, and privacy characteristics.

## Supplied names explained

- `H3 geospatial grid` — H3 is Uber's hierarchical global spatial index. It assigns cell indexes to geographic locations and provides operations for hierarchy, boundaries, neighbors, and traversal. Its grid has hexagonal and pentagonal cells, so designs must not assume every cell has six neighbors or that every child is a perfect geometric subdivision.

### Core model and data path

1. Validate coordinates and coordinate order at the API boundary. Latitude/longitude reversal is a common bug; reject invalid or out-of-range input instead of silently indexing it.
2. Select a resolution based on the product question. A delivery heatmap may tolerate aggregation across a broad area; dispatching to a specific nearby driver needs finer candidate search followed by exact distance and eligibility checks.
3. Convert a point to an H3 cell. Store the original coordinates when later logic needs exact geometry, distance, or a different resolution. Do not treat the cell ID as the original coordinate.
4. Aggregate or partition records by cell and time bucket. Use a database index and partitioning strategy appropriate to query patterns; H3 does not itself store records, enforce access control, or provide distributed transactions.
5. For a nearby search, enumerate a neighborhood of candidate cells, fetch eligible records, then calculate exact geodesic distance and apply product rules. A grid neighborhood is a candidate-generation tool, not proof that every point within a radius was included or that every returned result is within that radius.

H3 indexes are hierarchical, but child cell boundaries are only approximately contained by parent boundaries. Parent/child indexing is useful for rollups and compact representation, while geometry-sensitive aggregation may need boundary-aware treatment. Resolution is discrete; average cell area and edge length are not a promise that all cells have identical geometry everywhere on Earth.

## Cross-item comparison

This assigned group contains one named item, so no within-group comparison applies. In a real design, compare H3's global hexagonal hierarchy with alternatives such as geohash or a projected square grid against the exact workload: indexing cost, region coverage, neighborhood traversal, storage/query support, compatibility, and acceptable boundary error. No scheme makes approximate cell membership equivalent to an exact radius or polygon intersection.

## Examples

### Heatmap aggregation

Suppose an application receives location events and displays counts by region. Convert each valid event to an H3 index at a selected resolution, group by `(cell, time bucket)`, and retain a route to the source events or finer-grained rollups if the product later needs drill-down. If the view zooms out, roll up to parent cells or recompute at the target resolution while accounting for boundary semantics. Do not average cell identifiers; aggregate counts or coordinates using a mathematically appropriate operation.

### Nearby drivers

For a rider at point P, search a neighborhood large enough for the requested maximum radius under the chosen resolution and distance model. Fetch candidates, filter availability and authorization, calculate exact point-to-point distance, and rank. Expand the candidate neighborhood when too few eligible drivers exist. Include cells across grid seams, pentagon neighborhoods, and the antimeridian; test high-latitude and boundary cases. The final answer should be based on exact coordinates and product policy, not just cell adjacency.

### Correctness and scale checks

Measure index conversion throughput, cells scanned per query, candidate-to-result ratio, hot-cell skew, and storage by resolution. Test points on cell boundaries, invalid coordinates, polar/antimeridian locations, parent rollups, and all neighborhood shapes used by the application. A popular urban cell can become a hot partition; salt or subdivide workload keys where needed, and preserve a way to combine the resulting partial aggregates.

## Common mistakes

- Calling H3 a map projection or a complete GIS system; it is a spatial indexing system with its own geometric model.
- Assuming that every cell is a hexagon, has six neighbors, or subdivides into exactly seven geometrically contained child cells.
- Treating cell equality, adjacency, or grid distance as exact physical distance.
- Choosing resolution by intuition without measuring coverage error, candidate fan-out, and storage/query cost.
- Dropping original coordinates when future queries require exact point, line, or polygon calculations.
- Assuming the nearest cell set automatically covers a circular radius; validate candidate coverage and refine with exact distance.
- Using hierarchical parent rollups as if cells were perfectly nested geometrically.
- Letting a cell identifier become a privacy boundary; location re-identification risk depends on resolution, auxiliary data, and repeated observations.

## Knowledge checks with answers

1. **Why map a point to a cell?** A discrete cell key makes spatial grouping, indexing, and candidate search practical; it intentionally approximates continuous geography.
2. **Can an H3 neighbor query prove a location is within five kilometers?** No. It gives grid-related candidates; compute an appropriate exact geographic distance and apply the radius condition.
3. **Why keep the original coordinates?** To support exact geometry, distance, alternate resolutions, and audit or correction when the cell approximation is insufficient.
4. **Can every H3 cell be treated as a hexagon with six neighbors?** No. H3 includes pentagons, and global grid topology and face boundaries require handling exceptional cases.
5. **What should drive resolution choice?** Product accuracy and query semantics, measured candidate count and coverage, storage, aggregation error, latency, and privacy requirements.

## Practice

Design a “nearby open pharmacies” query. State the resolution-selection method, candidate neighborhood strategy, exact distance and opening-status checks, handling for grid boundaries, and metrics that would show a too-coarse or too-fine resolution. Explain why the index speeds candidate lookup without replacing the final geographic predicate.
