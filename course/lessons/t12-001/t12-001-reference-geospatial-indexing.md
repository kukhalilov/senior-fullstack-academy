# system design foundations and infrastructure building blocks — Reference: Spatial partitioning and geospatial query structures

Sources: [HLD Handbook](https://hld.handbook.academy/), [S2 cell hierarchy](https://s2geometry.io/devguide/s2cell_hierarchy), [H3 indexing](https://h3geo.org/docs/highlights/indexing/), [H3 cell indexes](https://h3geo.org/docs/library/index/cell/), [PostGIS spatial indexes](https://postgis.net/documentation/faq/spatial-indexes/), [PostGIS index use and costs](https://postgis.net/docs/manual-3.5/en/using_postgis_dbmanagement.html), [PostGIS ST_DWithin](https://postgis.net/docs/ST_DWithin.html).

## Scope and version

This lesson teaches the supplied geospatial concepts at the level needed to design location search, map analytics, and spatial data access. The named scope is Geohash, Quadtree, R-tree, S2 geometry, H3 grid, bounding-box candidate search, and spatial hot cell. It is not an API reference for a particular database or library; verify implementation behavior and coordinate-system assumptions against its current documentation.

## How this group fits the mental model

## Begin with the problem

Latitude and longitude describe positions in a continuous space. A query such as “find stores within 3 km” cannot efficiently compare the query point with every store once the dataset is large. A spatial index organizes locations or shapes so the system can quickly find a smaller set of plausible matches. The application then applies the exact rule to those candidates.

Keep two jobs separate:

1. **Candidate generation:** use a grid cell, tree, or bounding-box index to avoid scanning the entire dataset.
2. **Exact decision:** calculate the actual distance or geometry relationship using the chosen coordinate model.

The index is generally an accelerator, not the final authority on whether a point is within a radius or a line intersects a polygon. A coarse candidate filter may include false positives; it must not lose true matches. PostGIS documents this pattern explicitly: spatial indexes store geometry bounding boxes and spatial predicates apply a more specific secondary filter.

Before choosing an index, define the query: point lookup, radius search, nearest neighbor, polygon containment, intersection, or aggregation by area. Also define whether distances are planar or earth-surface distances, which coordinate reference system is used, the tolerated error, update rate, data distribution, and whether global coverage is required.

## Points, shapes, grids, and exact geometry

- A **point index** associates a location with an index key or tree leaf. It is useful for finding nearby records or aggregating points.
- A **shape index** stores or indexes geometries such as roads, service regions, and polygons. Bounding rectangles are often used as a fast first filter; complex geometry checks follow.
- A **discrete global grid** assigns the globe to cells. Each point maps to a cell, allowing grouping and neighboring-cell lookup. A cell is an approximation of an area, not a substitute for the original geometry or exact distance predicate.
- A **map tile** is a rendering and delivery unit. It can use a spatial grid but serves a different purpose from an index used to answer a database predicate.

Coordinate handling is part of correctness. Longitude and latitude are angular coordinates, not uniform Cartesian distances: one degree of longitude spans different ground distances at different latitudes. Planar geometry operations use units and distortion defined by their coordinate reference system; geodesic/geography operations model distance on the earth. Keep coordinate order, units, SRID/reference system, and transformation rules explicit. A fast index built in one coordinate model does not make a distance computed in another model correct.

## Supplied names explained

## Geohash

Geohash repeatedly bisects longitude and latitude intervals, interleaves the subdivision bits, and encodes them as a string. A longer prefix identifies a smaller rectangular cell; shared prefixes make hierarchical grouping and prefix-range storage convenient. This is useful for coarse bucketing, database key scans, and simple map aggregation.

The rectangular cells are not uniform in ground dimensions, and points that are physically close can fall into different cells when they lie on opposite sides of a cell boundary. A radius query must examine the query cell and enough neighboring cells, then perform the exact distance check. Prefix similarity is not a distance guarantee. Choose precision from the query scale and measured candidate count, and handle the antimeridian explicitly when a neighborhood wraps around ±180° longitude.

## Quadtree

A quadtree recursively divides a two-dimensional region into four subregions. It can subdivide only dense regions, so it adapts its spatial resolution to the data distribution. A leaf may hold several points, and implementations choose their own capacity, depth limit, and split/merge policy.

Quadtrees are useful for point clustering, viewport queries, and adaptive spatial partitioning. A query visits every cell intersecting its query extent and filters the points or shapes found there. A fixed root extent, boundary conventions, maximum depth, and behavior for points on split lines must be defined for deterministic results. Skew can create deep or heavily populated leaves; subdivision does not automatically make load balanced. Distributed systems may need to split hot leaves or assign subregions to different workers while preserving a way to query across partition edges.

## R-tree and bounding rectangles

An R-tree indexes minimum bounding rectangles (MBRs) in a hierarchy. Internal nodes enclose the rectangles below them. A range or intersection query follows nodes whose rectangles overlap the query rectangle, producing candidate geometries. If node rectangles overlap heavily, the search may visit many branches and approach a broad scan; performance depends on geometry shape, insertion/splitting strategy, and workload.

This is a common shape-indexing approach. PostGIS describes its GiST spatial index as an R-tree implemented on top of GiST. The index uses bounding boxes as a primary filter, so the database applies the spatial predicate to confirm the actual geometry match. For a radius search, use the database’s index-aware distance predicate where appropriate (for PostGIS, `ST_DWithin` is documented as index-aware) and confirm the query plan on representative data. An index existing in the schema does not guarantee that every query uses it efficiently.

## S2 geometry

S2 is a spherical indexing and geometry library. Its cells are quadrilaterals bounded by spherical geodesics. It projects the six faces of a cube onto the unit sphere and recursively subdivides cells into four children, with hierarchy levels from 0 through 30. This supplies a global cell hierarchy whose geometry follows the sphere more naturally than treating the entire world as a flat longitude/latitude rectangle.

Use S2 when hierarchical global cells and spherical geometry are useful for covering regions, indexing, or neighborhood operations. A covering represents a region with a set of cells at selected levels; the cover is a practical approximation/partition for candidate retrieval, and the original geometry predicate may still be required for exact inclusion. Choose cell levels and covering limits based on acceptable candidate volume and computation. Do not assume that a cell identifier itself provides exact metric distance or that all cell areas have identical real-world size.

## H3 grid

H3 is a hierarchical discrete global grid built on an icosahedral projection. At each resolution it has mostly hexagonal cells and 12 pentagons; the pentagons are a necessary part of covering a sphere. H3 indexes have a parent/child hierarchy and support mapping points to cells, aggregating by resolution, and traversing cell neighborhoods. Its regular-looking grid is often useful for heat maps, regional summaries, and spatial joins between datasets that use compatible resolutions.

H3 cells are not exact administrative regions or circles. A point-to-cell assignment answers which grid cell contains the point under H3’s boundary rules; a set of cells around an origin is a candidate area, not automatically the exact set of points within a requested number of meters. For exact radius, boundary, or polygon semantics, refine the candidates with a suitable geometry/distance calculation. Account for pentagon-related traversal cases, cell boundaries, and resolution choices in tests. H3 is an alternative to S2 and geohash, not an interchangeable encoding: its cell geometry, hierarchy, and operations differ.

## Bounding-box candidate search

A bounding box is a cheap rectangular envelope around a point neighborhood or geometry. For a radius query, construct a conservative envelope around the search point, retrieve indexed objects whose bounding boxes overlap it, and calculate exact distances for those candidates. The envelope must be conservative in the chosen coordinate model so it does not exclude valid results.

Common edge cases include a search area crossing the antimeridian, high latitudes where longitude scale changes sharply, geometries spanning a large region, and invalid or mismatched coordinate reference systems. A region crossing the antimeridian may need to be represented as two longitude ranges. Near the poles, a naïve fixed longitude/latitude offset can be wrong; use a geodesically sound envelope or an appropriate projection and verify it. For shapes whose bounding boxes cover much more area than the shape itself, expect many false positives and consider a better index or decomposition. Bounding-box intersection alone does not mean that the underlying lines or polygons intersect.

## Spatial hot cell

A spatial hot cell is a partition receiving far more records or requests than its peers. Dense city centers, popular landmarks, and uneven populations can overload one shard even when a grid appears evenly sized. Monitor per-cell request rate, stored rows, candidate fan-out, latency, and skew rather than relying on global averages.

Possible responses include finer cells in dense areas, adaptive subdivision, splitting one cell’s records across subpartitions, caching popular results, or replicating read-heavy data. Each changes routing or merge work. Neighbor queries must still check all cells that can intersect the query; writes and deduplication must not silently lose records at split boundaries. If several fine cells are combined into a coarse cell for analytics, define whether aggregation is exact, approximate, or delayed, and make the cell resolution part of the result’s meaning.

## Cross-item comparison

## Compare the structures by their job

| Structure | Organizes | Strong fit | Main correctness/performance concern |
|---|---|---|---|
| Geohash | Points encoded as hierarchical rectangular string cells | Prefix grouping and simple key-based bucketing | Neighboring cells are required; prefixes do not encode distance |
| Quadtree | 2D points/regions in recursively split quadrants | Adaptive subdivision and viewport/range search | Skew, depth, split boundaries, and balancing policy |
| R-tree | Shape bounding rectangles in a hierarchy | Geometry range/intersection candidate search | Overlapping envelopes create false positives and extra branch visits |
| S2 | Spherical geometry in hierarchical quadrilateral cells | Global spherical indexing and region coverings | Cell covering is a retrieval aid; exact geometry and level choice matter |
| H3 | Global hierarchical hexagon/pentagon cells | Aggregation and grid-based neighborhood analysis | Grid membership is not exact radius/polygon semantics |
| Bounding box | A conservative envelope for a query/object | Fast first-stage candidate filtering | Coordinate model, antimeridian, poles, and false positives |

These can be composed: for example, a database R-tree may find polygon candidates while an H3 key supports analytics. Composition adds maintenance and consistency questions. Keep one authoritative geometry or point, derive indexes/cell IDs from it, and rebuild or reconcile derived values when the source changes.

## Examples

## Design example: nearby open pharmacies

Suppose an application must return pharmacies within 5 km, ranked by distance. Store the authoritative point with a declared coordinate reference system and availability state. Use a spatial index or a conservative set of grid cells to find candidates; ensure candidate coverage includes cell neighbors or the full bounding envelope. Filter availability according to the request’s consistency requirement, calculate exact geodesic distance, discard anything beyond 5 km, then sort and limit. If the query is common, cache by a deliberately chosen area/resolution and freshness window, but do not treat a coarse cached cell result as a definitive radius answer.

Test points exactly inside and outside the radius, on cell boundaries, across the antimeridian, near high latitudes, and at the maximum supported coordinate range. Compare indexed results with a brute-force exact calculation on a sample dataset; this is a useful way to detect candidate-generation false negatives.

## Common mistakes

- Treating a cell ID or bounding-box hit as an exact distance or intersection result.
- Searching only the point’s own geohash/H3/quadtree cell for a radius query.
- Assuming equal angular coordinate differences mean equal ground distances everywhere.
- Forgetting antimeridian, polar, SRID, unit, and coordinate-order cases.
- Picking a grid resolution without measuring candidate counts, update costs, and query scale.
- Assuming hierarchical cells have equal area or that a grid boundary matches a business boundary.
- Assuming a spatial index will always be selected or will eliminate all exact geometry work.
- Splitting a hot cell without preserving boundary coverage, uniqueness, and aggregation semantics.

## Knowledge checks with answers

1. **Why can a spatial index return false positives safely but not false negatives?** The index is only the candidate stage. Exact filtering removes extra candidates, but a missing true match can never be recovered later.
2. **Why must a radius query inspect more than the cell containing its center?** The radius may cross cell boundaries; nearby points can have different cell IDs or prefixes.
3. **When is an R-tree more natural than H3?** For indexing arbitrary shapes and finding geometry candidates by bounding rectangles. H3 is often useful when the application’s workload benefits from global cell aggregation and grid neighborhoods.
4. **Does an H3 cell ring of a chosen size guarantee a particular meter radius?** No. It is a grid-neighborhood operation; candidate coverage and exact distance must be handled for the required metric semantics.
5. **How can a hot cell be split without losing nearby-search results?** Define child routing and boundary conventions, query every child/neighbor whose region intersects the conservative query extent, and deduplicate records by stable identity before exact filtering.

## Practice

Design nearby-restaurant lookup for a global service with dense downtown clusters and sparse rural regions. State the authoritative location representation, coordinate/distance model, candidate index, boundary handling, exact filter, hot-cell response, and the measurements you would use to tune precision. Then explain how your design changes if the primary query becomes “which service polygon contains this delivery point?”

**Suggested answer:** Keep the restaurant’s authoritative point in a declared global coordinate system. Use a spatial database index or a global cell index to generate candidates; do not assume one cell covers the entire radius. Build a conservative envelope or neighboring-cell set, including antimeridian and high-latitude cases, then compute exact geodesic distance and sort. Measure candidate-to-result ratio, p95/p99 latency, cell/shard skew, index size, write amplification, and cache freshness. Split or refine dense downtown partitions while preserving cross-boundary search and deduplication. For polygon containment, index polygon bounding rectangles or coverings to find candidates, then run an exact point-in-polygon predicate using explicitly defined boundary semantics.
