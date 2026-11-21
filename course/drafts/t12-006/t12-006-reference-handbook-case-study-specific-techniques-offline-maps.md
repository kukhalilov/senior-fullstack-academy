# end-to-end system design case studies — Reference: Offline maps

Sources: [Mapbox offline maps overview](https://docs.mapbox.com/help/dive-deeper/mobile-offline/), [Mapbox offline data concepts](https://docs.mapbox.com/android/maps/guides/offline/concepts/), [Mapbox offline usage estimation](https://docs.mapbox.com/help/troubleshooting/estimating-offline-usage/), [Google Maps Platform Android policies](https://developers.google.com/maps/documentation/android-sdk/policies).

## Scope and version

Offline maps let a client render selected geographic areas after connectivity is lost. SDKs, map providers, data licenses, and offline capabilities differ. Mapbox pages are concrete examples, not universal limits or defaults. Google Maps Platform has specific caching and storage restrictions; a product must follow the applicable service terms and use a provider/data source that permits the intended offline use.

## How this group fits the mental model

An offline map is a pre-positioned dataset plus a renderer, not simply a browser cache. Before disconnect, the client selects a region, zoom range, style, and any required language or layers. The download service computes the required tile resources, style metadata, fonts, sprites, and related assets, then stores them locally. While offline, the renderer uses those resources; location, routing, search, and live traffic may still be unavailable unless separately cached or computed.

The shape and zoom range drive cost. A large polygon and high maximum zoom can require far more data than a small region at low detail. Several styles or tilesets may multiply the required resources. Estimate, download with progress/cancellation/resume behavior, check available storage, and let users choose or remove regions. Offline coverage should be explicit: users need to know which region and detail levels are available and when the data was last refreshed.

## Supplied names explained

- **Tile:** map data for a geographic area at a particular zoom or resolution, often delivered as vector or raster data.
- **Tile region:** an area and zoom range selected for offline use; SDKs may map this to multiple tile packs.
- **Style pack/assets:** style definition and non-tile resources such as fonts and sprites required to render the chosen appearance.
- **Tile pack:** provider-defined bundle of tiles optimized for offline download and storage; packaging is implementation-specific.
- **Offline index/manifest:** local metadata describing downloaded resources, coverage, versions, and refresh status.
- **Stale data:** locally available map data that may no longer reflect current roads or points of interest; do not imply freshness without a refresh policy.
- **Attribution and license:** provider/source notices and data rights that must continue to be respected offline.

## Cross-item comparison

| Strategy | Benefit | Limit |
| --- | --- | --- |
| Pre-download a selected region | Predictable offline coverage and user control | Storage/network cost; updates and partial failures need management |
| Opportunistic tile cache | Reuses recently viewed map data | Coverage is unpredictable and may omit the route/area the user needs |
| Whole-country or global download | Broad coverage without planning | Often excessive storage, download time, and license/terms complexity |
| Server-rendered map images | Can simplify client rendering | Images are not a full navigable tile dataset; offline interaction and arbitrary zoom are limited |
| Local routing/search index | Can support navigation/search without network | Separate data, compute, update, and licensing burden; map tiles alone do not provide routing |

## Examples

A hiking app offers a user-selected trail corridor with zoom levels 8–15. It computes the download estimate, downloads the map data and style assets over Wi-Fi, verifies completion, and displays the covered boundary and update date. On airplane mode, the map continues to render within the boundary. The UI explains that live traffic and server-side place search are unavailable and can show a pre-downloaded route only if routing data was included separately.

Downloads should be resumable and safe to cancel. Store a region manifest and activate it only after required assets are verified; otherwise, an interrupted download can appear complete while missing high-zoom tiles. Refresh should preserve the previous valid region until the new version is ready, subject to storage constraints. Eviction should be visible and should not silently delete a user-pinned region.

## Common mistakes

- Treating a memory/disk tile cache as guaranteed offline coverage.
- Downloading tiles without style resources, fonts, sprites, or other required sources.
- Assuming offline rendering means offline routing, search, geocoding, or traffic.
- Ignoring the multiplicative effect of zoom levels, styles, geography, and data density on storage.
- Showing “offline ready” before all required resources are verified.
- Refreshing in place and losing the last valid dataset if the new download fails.
- Storing third-party map content in violation of provider terms; policies can differ sharply by provider.
- Omitting attribution, freshness date, coverage boundaries, and a user-facing data deletion control.

## Knowledge checks with answers

1. **Why is an offline map not just a cache?** A cache contains opportunistically viewed items; an offline region is planned coverage with required data/assets and explicit completeness state.
2. **Does a tile pack necessarily include everything needed to render a style?** Not necessarily. Style definitions, fonts, sprites, and other resources may be separate.
3. **How should the client handle a failed update?** Keep the prior verified region active where possible and report the update failure instead of claiming new coverage.
4. **Why check licensing before building offline support?** Provider terms govern whether map content can be downloaded, stored, refreshed, or redistributed offline.
