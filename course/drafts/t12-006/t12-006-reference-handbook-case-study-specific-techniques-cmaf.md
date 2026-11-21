# end-to-end system design case studies — Reference: CMAF

Sources: [MPEG CMAF standard overview](https://www.mpeg.org/standards/MPEG-A/19/), [ISO/IEC 23000-19:2024 base standard](https://www.iso.org/standard/85623.html), [ISO/IEC 23000-19:2024/Amd 2:2026](https://committee.iso.org/standard/89043.html), [Apple CMAF with HLS](https://developer.apple.com/documentation/http-live-streaming/about-the-common-media-application-format-with-http-live-streaming-hls), [Apple HLS authoring specification](https://developer.apple.com/streaming/hls-authoring-specification-for-apple-devices.html), [MPEG-DASH standard overview](https://www.mpeg.org/standards/MPEG-DASH/), [DASH-IF implementation guidelines](https://dashif.org/Guidelines-TimingModel/Timing-Model.pdf).

## Scope and version

The Common Media Application Format (CMAF) is standardized as ISO/IEC 23000-19 for segmented media. The currently published base standard is ISO/IEC 23000-19:2024, Edition 3; Amendment 2:2026 added an additional structural CMAF brand profile. MPEG also lists work on Edition 4 as ongoing. Confirm which published edition and amendments a packager/player implements instead of assuming the in-progress edition is already normative. This lesson covers packaging and delivery, not every codec, DRM, or device profile. Confirm the actual HLS/DASH profile support of target packagers and players.

## How this group fits the mental model

CMAF defines interoperable media objects and constraints for segmented delivery using ISO Base Media File Format (ISO BMFF). It can let compatible HLS and DASH presentations reference shared media resources, which can reduce duplicate packaging/storage and improve CDN reuse. CMAF sits below presentation manifests: HLS playlists or a DASH MPD still describe how a client selects and requests media. Shared resources are conditional on the selected CMAF edition/profile, codecs, encryption, packaging alignment, and client support.

CMAF is not a codec, CDN, manifest, streaming protocol, or DRM product. A valid CMAF file still needs a supported codec/profile, aligned timing, appropriate initialization and fragment structure, compatible encryption signaling, and a player that implements the selected presentation profile.

## Supplied names explained

- `CMAF` — A standardized format for segmented media objects, organized into tracks and fragments so compatible adaptive presentations can address common media resources.

## Object model

- **Track:** encoded samples for one media component such as audio, video, or subtitles, carried in an ISO BMFF-derived container.
- **Header / initialization data:** information a player needs to initialize decoding for the track.
- **Fragment:** a sequence of media samples in the track. Whether a fragment can be decoded independently depends on the CMAF profile, sample structure, and applicable switching/segment rules; do not infer it from the filename or boundary alone.
- **Segment:** one or more consecutive fragments exposed as a delivery resource.
- **Chunk:** a sequential subset of samples from a fragment. Chunked publication can expose media before a full parent segment is complete when the delivery profile and player support it.
- **Switching Set:** alternative tracks intended to switch between, such as different bitrates/resolutions of the same content. Alignment at switch boundaries is essential.

Apple's CMAF/HLS guidance describes CMAF addressable objects and explains that an HLS playlist and a DASH MPD can, under compatible profiles, reference the same resources. This is an interoperability option, not a guarantee that one encode, encryption setup, manifest, or player works unchanged across all devices. Apple documents three CMAF presentation profiles (unencrypted, `cbcs`, and `cenc`) and says HLS supports unencrypted and `cbcs`; check the target HLS revision and player requirements before selecting encryption. Apple's current authoring material says the published RFC 8216 does not capture all HLS evolution and points to the evolving bis draft.

## Packaging and delivery choices

1. Choose codecs, profiles, frame rates, audio layouts, captions, and encryption based on target devices and business requirements.
2. Encode a bitrate ladder with aligned timestamps and switch boundaries.
3. Package CMAF tracks, headers, fragments, and segments; validate decode, timing, and discontinuity behavior.
4. Generate separate HLS playlists and/or DASH MPDs that point to compatible media objects.
5. Deliver objects and manifests through an origin/CDN with different freshness rules: media segments are often immutable, while live manifests change frequently.
6. Validate seek, representation switching, subtitles, language changes, key rotation, failover, and low-latency playback on actual target clients.

If HLS and DASH share objects, keep their cache keys and content-protection metadata consistent while preserving the different manifest semantics. For encrypted media, the CMAF/ISO encryption scheme, HLS `EXT-X-KEY` signaling, DASH protection descriptors, and DRM license services must agree with the target profile. HLS's documented CMAF support does not include every CMAF encryption profile. Do not infer compatibility solely from the `.m4s` extension.

## Cross-item comparison

- **CMAF vs HLS/DASH:** CMAF describes compatible media packaging; HLS and DASH provide presentation manifests and client delivery semantics.
- **CMAF vs a codec:** a codec defines how samples are encoded; CMAF defines how encoded samples are packaged and segmented.
- **CMAF vs DRM:** CMAF may carry protected media under supported encryption profiles, while a DRM/license system manages keys and playback authorization.
- **CMAF vs MPEG-2 Transport Stream:** both can be used in streaming workflows, but container and player/profile support differ; choose from the required client matrix rather than assuming a universal replacement.

## Examples

For a VOD service supporting both HLS and DASH on modern devices, encode aligned AVC or HEVC renditions into CMAF-compatible fragmented MP4 resources. Generate an HLS Multivariant Playlist/Media Playlists and a DASH MPD that reference those resources where each target profile allows. Verify sample timestamps, initialization segments, bandwidth/codecs metadata, audio/subtitle groups, and content-protection signaling. A legacy player that supports only an older transport-stream or codec profile may need a separate package; shared CMAF objects do not remove that compatibility requirement.

For low-latency live playback, smaller CMAF chunks can be published before the parent segment is complete, but the packager, origin/CDN, manifest update policy, and player must all support the chosen low-latency profile. Test live-edge distance and rebuffering under realistic cache and network conditions.

## Common mistakes

- Treating CMAF as if it were an adaptive streaming protocol or a codec.
- Assuming shared media bytes imply shared manifests, DRM signaling, or universal player compatibility.
- Misaligning timestamps or segment boundaries across renditions.
- Confusing fragments, chunks, and delivery segments.
- Mixing encryption schemes or initialization data that the selected player/profile does not support.
- Caching a live manifest like immutable media or serving media before it is fully available when the client expects otherwise.

## Knowledge checks with answers

1. **Can CMAF media be referenced by both HLS and DASH?** Yes, where the media packaging and the respective presentation profiles are compatible; separate manifests are still required.
2. **Does CMAF specify the codec?** No. The codec and profile determine sample encoding; CMAF defines media packaging and object structure.
3. **What does a shared CMAF object not guarantee?** It does not guarantee that every client supports the codec, profile, encryption/DRM, timing, or manifest behavior.
