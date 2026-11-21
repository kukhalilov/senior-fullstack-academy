# end-to-end system design case studies — Reference: Simulcast

Sources: [RFC 8853: Using Simulcast in SDP and RTP](https://www.rfc-editor.org/rfc/rfc8853.html), [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667.html), [W3C WebRTC specification](https://www.w3.org/TR/webrtc/).

## Scope and version

Simulcast sends multiple alternative encoded streams of the same media source, often at different resolutions or bitrates. RFC 8853 specifies SDP/RTP signaling for simulcast, including the `simulcast` media attribute and identification of related streams. Actual encoding support, layer count, codec, and WebRTC API behavior vary by browser and implementation and must be negotiated and tested.

## How this group fits the mental model

An SFU may need to deliver different video quality to different subscribers. If a publisher sends only one high-resolution stream, the SFU cannot always create an efficient lower-resolution version without decoding/transcoding. With simulcast, the publisher encodes several independent alternatives; the SFU selects one suitable stream for each subscriber. This shifts encode and uplink work to the sender in exchange for lower server transcoding cost and flexible receiver adaptation.

Simulcast layers are alternative encodings of the same source, not necessarily a base layer plus dependent enhancements. Each stream can be independently selected, but sending several at once consumes uplink bandwidth and encoder resources. A congestion controller or SFU policy can pause or switch layers, and a switch may need a keyframe before clean decoding. The sender’s total upstream bitrate is the sum of active encodings, bounded by capture and congestion policies.

## Supplied names explained

- **Simulcast**: simultaneous transmission of multiple differently encoded versions of one media source, signaled as related RTP streams.
- **RTP stream identification**: identifiers such as SSRC and RTP stream ID (RID) associate streams and allow signaling to identify alternatives. Identifier reuse and renegotiation need protocol-aware handling.
- **SDP `simulcast` attribute**: signals send/receive simulcast capability and direction/stream alternatives in the session description. It is negotiated; a client must not assume the peer accepted every requested encoding.
- **Encoding parameters**: resolution, frame rate, bitrate, scale-down, and active state for each sender encoding. Exact WebRTC APIs and supported combinations vary.
- **SFU layer selection**: per-subscriber choice of one of the available encodings based on subscription, layout, bandwidth estimate, and device capability.
- **Keyframe**: intra-coded frame that can let a receiver start or recover decoding after switching; frequent keyframe requests can create a bitrate spike.

## Cross-item comparison

Simulcast creates several independent encoded alternatives; SVC encodes a layered stream where compatible receivers can decode a base layer and selected enhancement layers. Simulcast can offer broader compatibility across codec support but costs more publisher encoding and uplink bandwidth. SVC may use bandwidth more efficiently, but depends on codec, encoder, browser, and server support for the relevant scalability mode. An MCU instead decodes and composes media centrally, while an SFU commonly selects among forwarded simulcast encodings.

## Examples

A participant publishes low, medium, and high video encodings. The SFU forwards low quality to a subscriber viewing a large gallery, high quality to a pinned-speaker subscriber, and pauses video to an audio-only client. If bandwidth falls, the SFU switches that subscriber down; the receiver may wait for a usable keyframe. The publisher still pays the encode and upstream cost of producing active alternatives, so test battery use, CPU, and aggregate uplink on mobile devices.

Measure quality switches, time to first decodable frame, publisher CPU, upstream bitrate, SFU egress, and packet loss. Test clients that negotiate only a subset of requested encodings and verify fallback to a single encoding or another codec. Ensure signaling and SFU state agree about which RID/SSRC is active after renegotiation and reconnection.

## Common mistakes

- Treating simulcast alternatives as dependent spatial/temporal enhancement layers.
- Assuming every browser or codec supports the same number of encodings or API controls.
- Forgetting to negotiate and verify SDP capabilities.
- Counting only SFU egress while ignoring publisher CPU and uplink.
- Switching quality without considering keyframe delay and keyframe storms.
- Assuming the SFU can synthesize a missing resolution without transcoding.
- Treating each RID or SSRC as a separate user camera instead of related encodings.

## Knowledge checks with answers

1. **What does simulcast send?** Multiple alternative encodings of one media source.
2. **How does it help an SFU?** The SFU can choose an already encoded quality for each subscriber without necessarily transcoding.
3. **What is a key trade-off?** More encoding and sender uplink work in exchange for flexible quality selection and reduced server transcoding.
4. **How does SVC differ?** SVC uses a layered bitstream with dependencies; simulcast sends distinct alternative streams.
