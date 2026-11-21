# end-to-end system design case studies — Reference: Redis GEO commands/geosets

Sources: [Redis GEOSEARCH](https://redis.io/docs/latest/commands/geosearch/), [Redis GEOADD](https://redis.io/docs/latest/commands/geoadd/), [Redis geospatial indexes](https://redis.io/docs/latest/develop/data-types/geospatial/).

## Scope and version

Redis geospatial commands store longitude/latitude points and query nearby members. This lesson focuses on `GEOADD` and `GEOSEARCH`, the current general search command. `GEORADIUS` and `GEORADIUSBYMEMBER` are deprecated in favor of `GEOSEARCH`; check the docs for the exact Redis release and client library in use. Redis’s geospatial representation is designed for proximity lookup, not as a general GIS engine.

## How this group fits the mental model

Use a geospatial index when the common query is “which known points are near this coordinate?” The application stores a member identifier with a coordinate, then searches within a radius or box. The result is a candidate set; business eligibility, availability, route distance, and ranking may require additional filters or a separate service.

This approach is useful for nearby drivers, stores, couriers, or devices when updates and queries fit the Redis deployment’s memory and throughput budget. It is less suitable for complex polygon intersection, coordinate reference transformations, large spatial joins, or durable authoritative geometry. For those needs, compare PostGIS and other spatial databases with dedicated indexes and exact geometry operations.

## Supplied names explained

**Redis GEO commands/geosets** refers to Redis geospatial operations over members stored in a sorted-set-backed index.

- **`GEOADD key longitude latitude member [...]`**: adds or updates members at coordinates. Coordinates are longitude first, latitude second. Values must fall within supported geographic bounds; invalid coordinates produce an error. A repeated member updates its position rather than creating a second independent point.
- **`GEOSEARCH key FROMMEMBER member BYRADIUS radius unit`**: searches around an existing member.
- **`GEOSEARCH key FROMLONLAT longitude latitude BYRADIUS radius unit`**: searches around an explicit point.
- **`GEOSEARCH ... BYBOX width height unit`**: searches within a rectangle centered at the origin point; the width and height are physical dimensions, not latitude/longitude degrees.
- **`ASC` / `DESC`**: orders matches by distance from the origin when requested. Without ordering, do not assume nearest-first order.
- **`COUNT n`**: limits the number of results. `COUNT n ANY` may stop early after enough matches and can return a faster but not necessarily nearest or fully sorted subset. Use it only when approximate selection is acceptable.
- **`WITHDIST`, `WITHCOORD`, `WITHHASH`**: request distance, coordinates, or the internal geohash score with each result. A geohash score is not a substitute for a stable public location identifier.
- **`ZREM`**: removes a member from the sorted-set-backed geospatial index. Expiration can be applied at key scope, so per-member freshness often needs explicit cleanup or a separate expiry index.

## Query behavior and accuracy

Redis encodes coordinates into a geohash-derived sorted-set score. The data structure efficiently narrows candidates, but the storage encoding is quantized; treat results as proximity candidates, not survey-grade exact geometry. For high-precision decisions, recompute distance from returned coordinates using an appropriate geodesic formula and account for the Earth’s curvature. If the user-facing requirement is driving distance, straight-line distance is only a prefilter; road-network routing is a different query.

Use a consistent unit (`m`, `km`, `mi`, or `ft`) and validate input at the API boundary. Longitude wraps at the international date line, while a naive bounding-box implementation can mishandle that edge; verify the command’s behavior for your data and tests. Large radii, very dense regions, or unbounded result sets can consume substantial CPU and network bandwidth. Set a result cap and design pagination separately; Redis GEOSEARCH is not a cursor-paginated spatial API.

## Cross-item comparison

Redis GEOSEARCH is an in-memory proximity candidate lookup with a compact command surface. PostGIS is a better fit for durable relational geometry, richer predicates, and spatial joins. A routing engine answers road-network distance or travel-time questions that a straight-line radius query cannot. A geospatial index does not replace business filtering, assignment, or reservation.

## Examples

### Update and consistency design

For frequently moving entities, update positions at a deliberate cadence. Every update changes the member’s current location; if historical tracks matter, store events separately. If a query needs only fresh drivers, include a heartbeat/freshness model and remove or filter stale members. A stale geospatial entry can make an unavailable driver appear eligible.

The GEO index should often be treated as a derived, rebuildable index from an authoritative entity/position store or event stream. Decide what happens if the GEO update succeeds but the durable write fails, or vice versa. An outbox/consumer or idempotent update pipeline can repair divergence. Multi-region deployments need a clear location authority and update-order rule to prevent delayed updates from moving an entity backward.

### Example

Add three couriers with `GEOADD couriers -73.9857 40.7484 courier-1 ...`, then query a 2 km radius from a customer coordinate with `GEOSEARCH couriers FROMLONLAT -73.99 40.75 BYRADIUS 2 km ASC COUNT 50 WITHDIST`. Filter the returned candidates by active status, vehicle type, and last heartbeat, then use a routing estimate for the top candidates if needed. Recheck availability transactionally when assigning a courier; a proximity result is not a reservation.

## Common mistakes

- Reversing latitude and longitude.
- Treating `COUNT ... ANY` as a guaranteed nearest-N query.
- Assuming unsorted results are nearest-first.
- Using straight-line distance as if it were travel time.
- Treating a GEO result as proof that a driver remains available.
- Letting stale positions remain indefinitely.
- Expecting `GEOSEARCH` to perform arbitrary polygon or spatial-join queries.
- Ignoring hot keys and large result sets in dense urban areas.

## Knowledge checks with answers

1. **What replaced `GEORADIUS` for new designs?** `GEOSEARCH`, which supports origin selection and radius or box queries.
2. **What does `COUNT n ANY` trade away?** It can return early and does not promise the nearest sorted `n` results.
3. **Does finding a courier reserve that courier?** No. Assignment needs a separate atomic claim or reservation.
4. **When is PostGIS a better fit?** When durable geometry, complex spatial predicates, joins, or richer GIS operations are required.
