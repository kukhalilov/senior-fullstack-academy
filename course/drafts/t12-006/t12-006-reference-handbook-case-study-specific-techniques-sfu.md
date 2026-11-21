# end-to-end system design case studies — Reference: SFU

Sources: [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667.html), [W3C WebRTC specification](https://www.w3.org/TR/webrtc/), [RFC 8834: RTP Usage for WebRTC](https://www.rfc-editor.org/rfc/rfc8834.html).

## Scope and version

An SFU (Selective Forwarding Unit) is a common name for a media server that receives participant RTP streams and selectively forwards them to subscribers. RFC 7667 describes related RTP topologies under Selective Forwarding Middleboxes (SFM); vendor terminology is not perfectly uniform. This lesson describes the usual WebRTC conferencing pattern, not a required W3C component or a specific vendor’s implementation.

## How this group fits the mental model

In a peer-to-peer mesh, each participant may need to send a separate stream to every other participant, so each sender’s upload and encode work grows with room size. With an SFU, each client generally sends one or a small number of encoded streams to the server. The SFU chooses which received streams, encodings, or layers to forward to each subscriber based on subscription, active-speaker policy, layout, and available bandwidth. Clients still decode and render the streams they receive.

The SFU usually forwards encoded media without composing all participants into one new video. It still terminates or participates in transport security, parses RTP/RTCP metadata, manages congestion feedback and subscriptions, and may transcode or process media in optional features. “No transcoding” is a common efficiency objective, not a universal guarantee. End-to-end media encryption can limit server-side inspection and adaptation, depending on architecture.

## Supplied names explained

- **SFU**: Selective Forwarding Unit; product term for a server that selectively forwards individual media streams to clients rather than mixing every input into one output.
- **Publisher**: participant sending an audio/video track or RTP stream to the SFU.
- **Subscriber**: participant receiving selected publications. Subscription is often controlled by application signaling, distinct from media transport.
- **Forwarding policy**: logic deciding what each subscriber receives, such as pinned speakers, active-speaker video, thumbnails, or selected quality layers.
- **RTP/RTCP feedback**: transport and control information used for stream identity, loss/congestion adaptation, and synchronization. Implementations need compatible codecs, feedback, and signaling behavior.
- **Simulcast/SVC input**: multiple encodings or scalable layers can let the server choose a suitable quality; support and negotiation depend on codec and client implementation.
- **Room placement**: routing participants to one SFU or a coordinated multi-region SFU topology. Cross-region forwarding reduces some latency but increases inter-server bandwidth and failure complexity.

## Cross-item comparison

An SFU forwards selected participant streams. An MCU (Multipoint Control Unit) typically decodes and mixes/composites inputs, then encodes one or more outputs. Mesh sends media directly among peers without one central media server. SFU reduces client upload versus full mesh while retaining per-participant streams for flexible layouts; MCU can simplify client rendering and downstream stream count at greater server processing cost.

An SFU is distinct from TURN: TURN relays packets to make a transport path possible, while an SFU understands RTP streams and makes per-subscriber forwarding decisions. A TURN relay can carry traffic to an SFU when direct ICE connectivity to the SFU fails.

## Examples

In a 12-person call, each client publishes one camera stream and one audio stream to a regional SFU. A gallery subscriber receives low-resolution video for most participants and a higher layer for the active speaker. When the client’s network degrades, congestion feedback and subscription policy reduce incoming video bitrate while preserving audio. The service monitors end-to-end latency, packet loss, jitter, bitrate, keyframe requests, SFU CPU/network capacity, and per-room participant limits.

If one SFU reaches capacity, place new rooms on other nodes rather than moving a live room without a controlled migration protocol. For very large events, use a hierarchy or broadcast fan-out architecture and distinguish interactive participants from passive viewers; one SFU forwarding every stream to every attendee can still create quadratic egress and client decode pressure.

## Common mistakes

- Calling an SFU a mixer even though it forwards separate streams.
- Assuming an SFU always avoids decode/transcode or can inspect end-to-end encrypted media.
- Forwarding every participant’s highest-quality stream to every subscriber.
- Ignoring client decode/render limits while scaling only server capacity.
- Treating TURN and SFU as interchangeable.
- Assuming WebRTC specifies the SFU’s subscription policy or signaling protocol.
- Ignoring room placement, inter-region bandwidth, and correlated node failure.

## Knowledge checks with answers

1. **What is selective about an SFU?** It chooses which participant streams or encodings to forward to each subscriber.
2. **Does an SFU normally create one composite video?** No; that is characteristic of an MCU-style mixing path.
3. **How can an SFU and TURN coexist?** TURN may relay a client’s transport packets to the SFU when direct network connectivity fails.
4. **Why can a large SFU room still overload clients?** Receiving, decoding, and rendering too many streams can exceed client bandwidth or device capacity.
