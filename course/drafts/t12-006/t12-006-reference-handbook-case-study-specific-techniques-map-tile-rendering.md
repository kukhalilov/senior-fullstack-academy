# end-to-end system design case studies — Reference: Map tile rendering

Sources: [HLD Handbook](https://hld.handbook.academy/), [Mapbox Vector Tile specification 2.1](https://github.com/mapbox/vector-tile-spec/blob/master/2.1/README.md), [Mapbox vector-tile standards](https://docs.mapbox.com/data/tilesets/guides/vector-tiles-standards/), [Mapbox vector-tile recipe and buffers](https://docs.mapbox.com/mapbox-tiling-service/recipe-specification/vector/), [Mapbox vector tile source behavior](https://docs.mapbox.com/style-spec/reference/sources/), [Mapbox vector tiles introduction](https://docs.mapbox.com/data/tilesets/guides/vector-tiles-introduction/).

## Scope and version

This lesson explains a vendor-neutral tiled map rendering architecture and uses the Mapbox Vector Tile (MVT) specification as a concrete vector-tile format. MVT 2.1 is the latest published specification version listed in the specification repository as checked on 2026-11-17. Tile URL schemes, projections, source metadata, cache rules, licensing, and renderer features vary; do not assume one provider's conventions are universal.

## How this group fits the mental model

A user rarely needs the entire planet's map data at once. A map client shows a viewport, so it requests only geographic pieces at the needed level of detail. A tile is a bounded chunk of map data addressed by location and zoom (often z/x/y). The server or CDN can cache that chunk and send it to many clients. Panning and zooming become requests for overlapping sets of chunks instead of downloads of one enormous map.

The tiling pipeline has four responsibilities: transform source geography into a tiling coordinate system; select and simplify features for a zoom range; encode them as raster images or vector features; and serve immutable or versioned tiles through a cache. The client fetches visible tiles plus a margin, decodes them if vector, applies style and labels, and draws them into one continuous view.

## Supplied names explained

- `Map tile rendering` — Divides geographic data into addressable pieces at multiple zoom levels so clients can fetch, cache, decode, and draw only the map content needed for a viewport.

### Tile and render path

1. **Start with canonical source data.** Keep authoritative geometries, coordinate reference systems, feature identifiers, and attributes in a source store. A tile is a derived representation; do not make it the only copy of editable source data unless that is an explicit product decision.
2. **Project and partition.** Convert geometry into the tiling scheme's coordinate space and determine which tile extents it intersects at each zoom. Web Mercator with an XYZ-style pyramid is common, but not universal. Projection choices affect distortion and usable latitude range; H3 or another analysis grid is not interchangeable with a display tile pyramid.
3. **Generalize by zoom.** Lower zooms cover larger areas and need fewer, simpler features. Filter, aggregate, simplify, or cluster according to visual and product rules. Preserve meaningful topology: careless simplification can break polygon rings, road continuity, or shared borders. Avoid shipping every attribute at every zoom.
4. **Encode and publish.** Raster tiles are ready-to-display pixels at a selected style, but changing style or querying feature attributes may require regenerating tiles. Vector tiles carry geometric features and attributes so a client can style them, but require decoding and client rendering. MVT encodes layers, features, geometry commands, and key/value attributes in Protocol Buffers; it assumes the consumer knows the tile's bounds and projection from external tile metadata or the URL scheme.
5. **Serve through a cache.** A tile cache key must distinguish every input that changes the bytes or meaning: dataset/version, z/x/y, style or variant when baked in, language or filters if relevant, and authorization scope for private data. Publish a new immutable versioned path or use a reliable invalidation strategy. A stale tile can be visually plausible while containing obsolete boundaries or labels.
6. **Fetch and draw.** The client calculates visible tiles, requests them concurrently with cancellation and priority, reuses cached results, and draws neighboring tiles into a continuous world view. It must handle slow or missing tiles, zoom transitions, device pixel ratio, attribution, and out-of-order responses without replacing newer state with an older response.

### Coordinate and tile boundaries

Treat coordinate reference system, axis order, tile origin, x/y convention, zoom definition, and bounds as part of the API contract. XYZ and TMS conventions differ in vertical tile indexing; a client and server that disagree can return a valid tile for the wrong region. Test known landmarks and tile corners across zoom levels. For global coverage, explicitly handle the antimeridian and projection limits instead of assuming longitude wraps harmlessly in every data pipeline.

Features often cross tile edges. Vector-tile encoders may retain geometry beyond a tile's nominal extent as a render buffer so line strokes, symbols, and labels can appear without seams. The MVT specification allows geometry outside the extent and says the format does not prescribe a single clipping algorithm. Buffer size, clipping, simplification, and deduplication must work together: too little buffer cuts symbols at edges; too much duplicates features or increases transfer and rendering cost. The client should clip to the visible tile while preserving enough context to render joins and labels.

## Cross-item comparison

This lesson has one assigned item, so no within-group comparison applies. The key implementation choice inside the architecture is raster versus vector delivery. Raster shifts projection and drawing work to tile production and makes display simple; each baked style or resolution may require another representation. Vector tiles can support client styling, interaction, and multiple visual treatments from shared data, but consume client CPU/memory and require careful schema, simplification, and compatibility management. Hybrid systems commonly use vector basemaps with raster imagery or terrain layers.

Compare pre-generated tiles with on-demand generation separately. Pre-generation spends compute and storage ahead of requests and gives predictable latency; it can be expensive for large datasets and many zooms. On-demand generation saves work for unseen areas but adds request-time compute, cold-cache latency, and load-spike risk. A hybrid warms popular areas and generates uncommon regions on demand under bounded concurrency.

## Examples

### A road changes

The source geometry is updated in the authoritative dataset. The tile pipeline produces a new data version and affected z/x/y tiles, validates geometry and metadata, then publishes a versioned tileset. The client switches to the new version as a coherent snapshot. If tiles are overwritten in place, invalidation and CDN propagation must be reliable; otherwise a user can see a mixture of old and new neighboring tiles. Use stable feature IDs where the product needs feature interaction across tile boundaries, but do not assume tile-local IDs are globally unique unless the contract says so.

### Diagnose a seam at a tile edge

Reproduce the same feature with both neighboring tiles and inspect source geometry, clipping extent, buffer, line width, symbol placement, and zoom transition. If the feature is absent from one tile because of an incorrect intersection test, rendering tweaks cannot restore it. If it is present but clipped too tightly, increase or correct the buffer. If duplicated labels overlap, coordinate placement and cross-tile symbol deduplication matter. Capture the exact z/x/y, source version, style version, and client version so the defect can be reproduced.

### Capacity and cache behavior

Estimate request rate from viewport changes, tile count per viewport, zoom transitions, cache hit ratio, and popular-area skew. Track tile latency and errors by zoom and region, bytes per tile, decode time, dropped frames, cache age, and generation backlog. Apply request cancellation during rapid pan, protect generation backends with concurrency limits, and avoid unbounded cache-key variation. Test cold-cache storms, invalidation, a missing tile, and fallback behavior.

## Common mistakes

- Treating a tile URL scheme, coordinate convention, or projection as universal.
- Confusing data analysis cells such as H3 with a display pyramid's z/x/y address space.
- Serving tiles without a versioned or reliable invalidation story.
- Clipping exactly at a tile edge and causing road, polygon, or label seams.
- Using one level of detail for every zoom and exhausting bandwidth, CPU, or storage.
- Assuming vector tiles contain their projection and bounds; MVT consumers need that context from the tiling scheme or metadata.
- Putting sensitive attributes in public vector tiles because the UI merely hides them.
- Using a CDN cache key that omits locale, style, dataset version, or authorization dimensions that change results.
- Measuring only server response time while ignoring decode, style evaluation, and frame rendering on the client.

## Knowledge checks with answers

1. **Why use tiles?** They let clients request, cache, and draw localized pieces at an appropriate level of detail instead of retrieving an entire world dataset.
2. **What does MVT specify?** A vector-tile encoding for layers, features, geometry, and attributes. It does not by itself define every tiling, projection, clipping, URL, or cache policy.
3. **Why buffer vector geometry beyond tile bounds?** A renderer may need neighboring context to draw a continuous line or symbol at the edge. Buffering is balanced against duplicate geometry and cost.
4. **Why can an old tile remain after an edit?** CDN and client caches may still hold bytes under the same key. Versioned URLs or correct invalidation provide a consistency strategy.
5. **When are vector tiles a poor choice?** When the client cannot afford decoding/rendering complexity, the map is static and pre-rendered pixels suffice, or exposing the encoded attributes creates unacceptable privacy or security risk.

## Practice

Design a global public transit map with routes, stops, and live vehicle positions. Decide which data is tiled and which uses a live update channel; define projection and coordinate contracts, zoom generalization, edge buffers, cache/version strategy, authorization, and client fallback. Explain how you would diagnose a route seam and prevent a stale tile from overwriting a newer dataset.
