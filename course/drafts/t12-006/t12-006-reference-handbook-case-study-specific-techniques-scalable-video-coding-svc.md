# end-to-end system design case studies — Reference: Scalable Video Coding (SVC)

Sources: [W3C Scalable Video Coding Extension for WebRTC](https://www.w3.org/TR/webrtc-svc/), [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667.html), [RFC 8853: Simulcast in SDP/RTP](https://www.rfc-editor.org/rfc/rfc8853.html), [RFC 7741: VP8 RTP payload](https://www.rfc-editor.org/rfc/rfc7741.html).

## Scope and version

Scalable Video Coding (SVC) encodes a video stream in layers so a decoder can use a base layer and, when supported, selected enhancement layers. The W3C WebRTC SVC extension is a Working Draft, not a final W3C Recommendation; its current published draft defines WebRTC encoding configuration such as `scalabilityMode`. Codec, encoder, browser, SFU, and RTP payload support must be negotiated and tested. Do not assume the SVC label guarantees interoperable spatial scalability in every WebRTC client.

## How this group fits the mental model

Scalability helps adapt one published video source to receivers with different bandwidth, screen size, and decode capacity. Temporal layers can reduce frame rate; spatial layers can provide different resolutions; quality layers can improve fidelity. Enhancement data depends on specified base/lower layers, so a receiver or SFU must understand the dependency structure and forward a decodable subset.

SVC can avoid producing several completely independent encodings, potentially saving encoder and uplink resources compared with simulcast. That gain depends on codec support, layer dependencies, hardware implementation, and the SFU’s ability to inspect the necessary RTP payload or dependency descriptor. A middlebox that cannot parse the codec structure or sees end-to-end-encrypted media may not be able to make fine-grained layer decisions.

## Supplied names explained

- **Scalable Video Coding (SVC)**: a family of layered encoding methods in which a base stream can be enhanced along temporal, spatial, or quality dimensions.
- **Base layer**: the minimum data needed for a usable lower-quality representation. If it is lost, dependent enhancement layers may not be decodable.
- **Enhancement layer**: data that improves frame rate, resolution, or quality when the decoder has the required lower layers.
- **Temporal scalability**: layers represent different frame rates; dropping enhancement frames can reduce motion smoothness while retaining a base frame cadence.
- **Spatial scalability**: layers represent resolutions or spatial refinements. A dependent spatial mode requires the lower layer on which it builds.
- **`scalabilityMode`**: a case-sensitive WebRTC encoding parameter in the W3C draft, such as `L1T2` or `L2T3`, describing layer structure. Capability discovery is handled through Media Capabilities; setting a mode unsupported by the negotiated codec can fail.
- **L/S mode notation**: the draft distinguishes modes with inter-layer dependencies (L modes) from modes with multiple encodings on one RTP stream (S modes). The exact allowed modes and codec mapping are specified by the draft and implementation.
- **Single RTP stream / transport (SRST)**: the cited W3C SVC extension describes layers on one RTP stream/SSRC. Its scope does not imply support for every multiple-RTP-stream SVC arrangement.
- **Dependency descriptor**: codec/RTP metadata that can help an SFU understand frame/layer dependencies, particularly when it cannot inspect encrypted or codec-specific payload internals.

## Cross-item comparison

SVC packages layers with dependencies in a scalable encoding. Simulcast transmits multiple alternative encodings of the same source, often on distinct RTP streams, so an SFU can switch among them without decoding the video. Simulcast generally increases sender encoding and upstream bandwidth; SVC can be more efficient when interoperable encoder/decoder/SFU support exists. MCU composition decodes and combines inputs centrally, trading server processing for simpler client rendering.

SVC and simulcast can be combined in supported configurations, such as temporal scalability within spatial simulcast streams, but not every browser/API combination permits every mixed mode. Negotiate codec and capabilities first, then configure encoding parameters within the offer/answer envelope.

## Examples

A publisher sends a base spatial layer plus a dependent enhancement layer and multiple temporal layers. An SFU serving a low-bandwidth subscriber forwards only the base and fewer temporal frames; a high-bandwidth subscriber receives the supported enhancement data too. If the SFU forwards an enhancement without its dependencies, the receiver may fail to decode it. The SFU must know the negotiated mode and required layer dependencies, not simply filter packets by bitrate.

At setup, inspect browser sender/receiver capabilities and the SFU’s supported codec and RTP extensions, select a compatible codec/mode, negotiate, and verify the actual outgoing encoding and received frames. Test a mode unsupported by one side, packet loss in the base layer, layer switch latency, keyframe behavior, and encrypted media. Fall back to simulcast, one encoding, or another topology if the negotiated path cannot safely adapt.

## Common mistakes

- Treating all SVC modes as interchangeable or available for every codec.
- Confusing dependent SVC layers with independent simulcast encodings.
- Forwarding enhancement data without the base or required dependency layers.
- Assuming an SFU can inspect encrypted or codec-specific layer structure.
- Assuming a W3C Working Draft is a final browser interoperability guarantee.
- Setting `scalabilityMode` without checking negotiated codec and sender/receiver capabilities.
- Counting only bandwidth savings while ignoring encoder, decoder, and SFU processing cost.
- Believing `setParameters()` triggers SDP renegotiation; it changes sending behavior within the negotiated envelope and has defined restrictions.

## Knowledge checks with answers

1. **What makes an enhancement layer useful?** The receiver has the base and every dependency required by that layer.
2. **How does SVC differ from simulcast?** SVC uses a layered stream with dependencies; simulcast sends separate alternative encodings.
3. **Does the WebRTC SVC Working Draft guarantee every codec and browser supports a requested mode?** No. Capability discovery and negotiation are required, and support varies.
4. **Why might an SFU fail to select layers in encrypted media?** It may lack access to codec payload or dependency metadata needed to identify decodable layers.
