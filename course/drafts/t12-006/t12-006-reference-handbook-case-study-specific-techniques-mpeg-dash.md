# end-to-end system design case studies — Reference: MPEG-DASH

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [MPEG-DASH standard overview](https://www.mpeg.org/standards/MPEG-DASH/), [Apple HLS/CMAF overview](https://developer.apple.com/documentation/http-live-streaming/about-the-common-media-application-format-with-http-live-streaming-hls), [DASH Industry Forum](https://dashif.org/Guidelines-TimingModel/Timing-Model.pdf).

## Scope and version

MPEG-DASH means Dynamic Adaptive Streaming over HTTP and is standardized in the ISO/IEC 23009 series. MPEG lists Part 1 for the Media Presentation Description and segment formats, plus additional parts for conformance, implementation guidelines, segment encryption/authentication, server/network-assisted DASH, DASH with push/WebSockets, CMAF delivery, session-based operations, and encoder/packager synchronization. The suite and profiles evolve; check the current standard, selected profile, codecs, DRM system, player versions, and packager behavior before deployment.

## How this group fits the mental model

DASH describes media presentations and how a client can retrieve media segments over HTTP. It separates the manifest/control description from the encoded media resources, allowing a player to select among available representations as conditions change. Standard HTTP servers, caches, and CDNs can deliver the resources; adaptive selection is performed by compatible clients using the manifest and observed playback/network conditions.

## Supplied names explained

- `MPEG-DASH` — An adaptive HTTP streaming standard whose Media Presentation Description (MPD) describes periods, adaptation sets, representations, and segment access information. Profiles constrain combinations of features and media formats for interoperability.

## Manifest and media organization

- **MPD:** the XML media presentation description. It describes the presentation timeline and the available media structure.
- **Period:** a temporal section of a presentation. Period boundaries can represent discontinuities or changes in the presentation model.
- **AdaptationSet:** a set of interchangeable or related media components, commonly grouped by type such as video, audio, or subtitles.
- **Representation:** one encoded alternative with attributes such as bandwidth, resolution, codec, or language, as constrained by the selected profile.
- **Segments:** addressable media resources that a client requests according to the MPD and playback state. Addressing and timing are profile- and MPD-dependent.

The player chooses an available representation and requests its segments. A valid adaptive switch requires compatible timestamps, segment boundaries, codec support, initialization data, audio/subtitle grouping, and protection configuration. Advertising a bitrate ladder in a manifest does not guarantee a seamless switch if the media is misaligned or the target device cannot decode it.

## Live and on-demand operation

A static MPD describes a bounded presentation; a dynamic MPD is updated to describe a changing/live presentation. A live system must coordinate encoder/packager clocks, segment publication, MPD update timing, CDN caching, availability windows, and player buffering. Incorrect availability timing can make a valid segment appear missing or cause the player to request it too early. Clock synchronization and timeline mapping matter across encoder, packager, origin, and player.

For live delivery, tune segment duration and manifest update cadence against startup delay, glass-to-glass latency, request rate, cache efficiency, and rebuffer risk. Low-latency behavior depends on a compatible profile and a chain of encoder, packager, HTTP server/CDN, and player support; shortening segments alone does not establish low-latency playback.

## Content protection and operations

DASH can describe protected content and key/license acquisition through profile-specific signaling, but a manifest is not itself a DRM system. Select a DRM/content-protection profile supported by the required devices and license service. Protect license endpoints and authorization tokens, and test key rotation, seek, failover, and expiration behavior. Encryption and transport security solve different problems; use TLS for HTTP delivery and the chosen content-protection system for media authorization/confidentiality requirements.

Instrument MPD errors, segment 4xx/5xx and timeouts, startup delay, rebuffering, representation switches, live-edge distance, license failures, and CDN cache behavior. Validate manifests and encoded output with conformance tools and real target players; manifest parsing alone cannot prove that a codec/profile is decodable.

## Cross-item comparison

- **MPEG-DASH:** uses an MPD and its ISO/IEC profile ecosystem.
- **HLS:** uses Multivariant and Media Playlists, with Apple-maintained authoring and low-latency material alongside RFC 8216's older version-7 description.
- **CMAF:** is a media packaging format that can be used with compatible HLS and DASH presentations; it is not a replacement manifest or player protocol.

HLS and DASH share the broad adaptive-over-HTTP delivery model, but manifest syntax, profiles, codecs, DRM signaling, low-latency behavior, and device support differ. Choose by tested interoperability across target clients and distribution systems, not by assuming one standard works everywhere.

## Examples

For a live lecture with web and mobile clients, encode aligned video representations and audio/subtitle sets, create an MPD whose profile and codec attributes match the actual media, and publish segments through an origin/CDN. Verify that the slowest supported player can retrieve the initialization data and switch representations. During an origin delay, observe whether the MPD directs players to resources that are already available; keep playlist/manifest TTL and segment retention consistent with the live window. Compare the same media package in DASH and HLS only after validating each generated manifest and target player.

## Common mistakes

- Treating the MPD as if it contains the media itself.
- Assuming every DASH player implements every ISO profile or DRM scheme.
- Publishing incompatible or misaligned representations and expecting the player to repair them.
- Caching a dynamic MPD for longer than its update and availability-window policy permits.
- Calling a short segment “low latency” without testing the complete publication and playback path.
- Treating a DASH manifest as authentication or authorization for protected media.

## Knowledge checks with answers

1. **What does the MPD do?** It describes presentation structure and segment access so a client can select and request media resources.
2. **What makes an adaptive switch work?** The client must support the representation and the media must have compatible timing, boundaries, initialization, and stream grouping under the chosen profile.
3. **Does DASH alone ensure DRM or low latency?** No. Those depend on the chosen protection/profile and compatible behavior across encoder, packager, origin/CDN, and player.
