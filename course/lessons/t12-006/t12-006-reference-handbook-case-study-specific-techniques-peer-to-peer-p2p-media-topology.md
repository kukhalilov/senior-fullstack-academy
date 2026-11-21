# end-to-end system design case studies — Reference: Peer-to-peer (P2P) media topology

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 8825: WebRTC overview](https://www.rfc-editor.org/rfc/rfc8825.html), [RFC 8835: WebRTC transports](https://www.rfc-editor.org/rfc/rfc8835.html), [RFC 8445: ICE](https://www.rfc-editor.org/rfc/rfc8445.html), [RFC 8656: TURN](https://www.rfc-editor.org/rfc/rfc8656.html), [RFC 8834: RTP media transport](https://www.rfc-editor.org/rfc/rfc8834.html), [RFC 8831: WebRTC data channels](https://www.rfc-editor.org/rfc/rfc8831.html), [mediasoup scalability and SFU behavior](https://mediasoup.org/documentation/v3/scalability/), [mediasoup communication model](https://mediasoup.org/documentation/v3/communication-between-client-and-server/).

## Scope and version

This lesson explains direct peer-to-peer media, mesh conferencing, and the practical alternatives used when participant count, network reachability, moderation, or reliability make a pure mesh unsuitable. The protocol references were checked on 2026-11-21. WebRTC APIs and codec support are browser/runtime-dependent; server products and their limits vary. “P2P” describes a media path, not the signaling, identity, room state, or business control plane.

## How this group fits the mental model

In a direct P2P call, two endpoints exchange media packets without a media-forwarding server in the path. That can reduce relay bandwidth and avoid an extra media hop, but both endpoints must discover and establish a viable network path, upload media to each other, and adapt to the weaker participant's uplink and device.

For group calls, a full mesh creates a direct connection between each pair. At `N` participants this produces `N(N−1)/2` pairwise connections; each sender generally uploads a copy of each track to every other participant. An SFU (Selective Forwarding Unit) changes this topology: each sender publishes a track to a media server, and the server selectively forwards packets to subscribed recipients. This moves bandwidth and operational work to the service while reducing client connection and upload growth. An MCU (Multipoint Control Unit) instead decodes and mixes/transcodes streams into composite output, which can simplify receivers but costs more server compute and can constrain layouts/quality.

P2P is therefore a topology choice with a trade-off between endpoint resources, server egress/compute, latency, reachability, privacy, and product controls. A production design often uses direct P2P for small calls or data channels and an SFU or relay fallback when mesh connectivity or scale is unsuitable.

## Supplied names explained

- **Signaling:** application-defined exchange of session descriptions, ICE credentials, and candidates through a service such as HTTPS or WebSocket. WebRTC does not prescribe a room-signaling protocol; authenticate and authorize signaling independently.
- **SDP offer/answer:** negotiation payloads describing media sections, codecs, directions, and transport parameters. SDP is signaling data; sending an offer does not itself create a network route.
- **ICE (Interactive Connectivity Establishment):** gathers candidate addresses, exchanges them through signaling, runs connectivity checks, and selects a working candidate pair. ICE uses host, server-reflexive, and relayed candidates and can handle multiple interfaces/address families.
- **STUN:** helps a client discover a server-reflexive address as observed from outside its NAT. It does not relay media and cannot guarantee that two NAT/firewall policies allow direct connectivity.
- **TURN:** allocates a relay address and forwards traffic when direct candidate pairs fail or when relay-only privacy/policy is desired. TURN increases provider bandwidth and can add latency; credentials and quotas must prevent unauthorized relay abuse.
- **ICE candidate pair / nomination:** one local and one remote transport candidate tested for connectivity; a nominated pair is selected for the session. Connectivity can later fail or change, requiring ICE restart/recovery behavior.
- **Trickle ICE:** gathers and signals candidates incrementally instead of waiting for all gathering to finish, often reducing setup time; the signaling implementation must handle candidate ordering, completion, and late arrival.
- **RTP/RTCP and SRTP:** RTP transports real-time audio/video with sequence/timing information; RTCP supplies control/feedback. WebRTC media uses secure RTP with negotiated keys, and transport feedback supports adaptation. UDP is common; WebRTC can use ICE/TCP/TLS paths where needed, with performance trade-offs.
- **DTLS-SRTP:** DTLS handshake establishes keys for SRTP media transport. WebRTC transport security protects the endpoint-to-endpoint or endpoint-to-media-server leg; a conventional SFU can forward encrypted media without being end-to-end encrypted against that SFU at the application layer.
- **Data channel:** non-media data transport using SCTP over DTLS over ICE, with ordered/unordered and reliable/partially reliable options. It is not a general replacement for server-authoritative application state or durable messaging.
- **Mesh:** all-to-all participant topology. It avoids a central media forwarder but connection count and per-sender upload grow with room size.
- **SFU:** receives media streams and selectively forwards them, potentially choosing simulcast/SVC layers per consumer. It typically does not decode or mix every stream; clients still render and decode received tracks.
- **MCU:** decodes and combines streams server-side, usually producing a composite stream. It can reduce receiver work and simplify layout, at the cost of server CPU/GPU, encoding delay, and less flexible per-user layouts.
- **Simulcast / SVC:** multiple spatial/temporal encodings or scalable layers let an SFU select quality appropriate to each recipient. The source, browser, codec, and server must all support the chosen mode; support and behavior are implementation-dependent.
- **Congestion control and adaptation:** sender/receiver use transport feedback, packet loss, delay, and available bandwidth estimates to adjust bitrate, frame rate, resolution, or forwarded layers. Do not equate a connected ICE path with adequate sustained media quality.

## Architecture and call flow

1. **Create an authorized room.** The application server authenticates users, enforces room membership and moderation, issues short-lived signaling/relay credentials, and defines who may publish or subscribe. Do not let an opaque room ID act as authorization.
2. **Collect local media.** The client requests microphone/camera permission, selects devices, captures tracks, and applies mute/camera state. Permission denial, device changes, backgrounding, and capture failure are normal states with explicit UX.
3. **Negotiate session capabilities.** The client creates or receives an SDP offer/answer through the signaling service. Codec intersection, directions, track IDs, and renegotiation must be handled; a signaling server routes control messages but need not carry media.
4. **Find a path.** ICE gathers host candidates, asks configured STUN servers for server-reflexive candidates, and obtains TURN relay candidates as configured. Candidates are signaled; ICE checks candidate pairs and nominates one. Use trickle ICE where supported to reduce setup delay. Provide TURN because direct connectivity is not universally possible.
5. **Send protected media.** Once transport is established, media flows using WebRTC's secure transport and RTP mechanisms. The application measures connection state, round-trip time, packet loss, jitter, bitrate, and audio/video quality; it adapts to changing networks and may restart ICE after a path failure.
6. **Select topology by room size and requirements.** For 1:1 or very small groups, mesh may be appropriate if endpoint uplink and connection costs are measured. For larger groups, connect clients to an SFU; choose subscriptions and simulcast/SVC layers. Use an MCU only when server-side mixing is worth its processing and flexibility trade-offs.
7. **Scale media service.** Place signaling/room coordination separately from media workers where useful. Assign participants to a room's authoritative media region/worker, plan ingress and egress bandwidth, CPU, UDP port capacity, TURN capacity, and cross-region traffic. If rooms span workers, use explicit inter-router forwarding or a supported cascading design; avoid assuming an SFU is infinitely scalable.
8. **Handle membership and failure.** On mute, leave, kick, network switch, or worker loss, update authorization and subscriptions, close transports, expire credentials, and restore or rejoin under an explicit room policy. A server-forwarded stream may be easier to moderate/record, but every action and data-retention rule needs user-visible policy and access control.

## Cross-item comparison

| Topology | Endpoint cost | Server cost/control | Good fit and limits |
| --- | --- | --- | --- |
| 1:1 direct P2P | One send/receive path per peer | Signaling and optional TURN; no media forwarder on direct path | Low-latency calls; direct path may fail or reveal network addressing depending on candidate policy |
| Full mesh | Each participant maintains up to `N−1` peer connections and uploads tracks repeatedly | Low forwarding cost if direct paths work; more signaling/connection state | Very small rooms; client CPU/uplink and connection count grow quickly |
| SFU | Usually one uplink per published track plus selected downlinks | High packet egress and regional capacity; central moderation/subscription control | Medium/large calls and broadcasts; each viewer still receives and decodes selected streams |
| MCU | Usually fewer composite streams to receive | High decode/mix/encode compute and added processing | Constrained clients or fixed composite layouts; less per-viewer flexibility and more server processing |
| TURN relay | Similar endpoint transport model but relayed path | Significant bandwidth/egress; can improve reachability and hide peer address when configured | Fallback for blocked direct paths or relay-only policy; does not mix or moderate media content |

Choose based on room-size distribution, expected codec/bitrate, client uplink, geographic latency, relay percentage, moderation/recording requirements, privacy model, and cost per participant-minute. WebRTC's hop encryption does not itself provide application-level end-to-end confidentiality from a media server; true E2EE for group media requires additional key distribution and media encryption design and can constrain server-side processing.

## Examples

### Three-person study call

Each participant has two other peers, so a full mesh has three pairwise connections. A participant publishing 1.5 Mbps video may upload roughly two copies before overhead if sending full quality to both peers; actual rate depends on codec, congestion, resolution, and simulcast. With an SFU, that participant can upload one or more simulcast layers and the SFU forwards appropriate layers to each viewer. The SFU uses more service egress but avoids requiring each client to upload a separate full-quality stream per recipient.

### Corporate firewall blocks direct UDP

ICE tests host and server-reflexive candidates, but no direct pair succeeds because policy blocks the path. The clients connect through TURN using an allowed relay transport. The call now incurs relay bandwidth and possibly additional latency; monitor relay ratio and regional capacity. If TURN fails, present a clear reconnect/degraded-call state rather than claiming the peer is offline.

### Layer selection under bandwidth loss

A viewer's downlink degrades. The SFU can forward a lower simulcast/SVC layer or fewer active-speaker videos while preserving audio priority. If the source publishes only one high-resolution layer, the SFU cannot invent a lower-resolution encoded stream without decoding/transcoding. The client may reduce its send quality, pause nonessential video, or reconnect on another path.

## Common mistakes

- Assuming P2P means the entire application has no server; signaling, identity, room policy, telemetry, and optional TURN still need services.
- Assuming STUN guarantees direct connectivity; TURN is required for networks where no direct candidate pair works.
- Using mesh for large rooms without calculating pair count, client upload, decoder load, battery, and failure rate.
- Assuming an SFU mixes or transcodes media; many SFUs forward packets and select layers without decoding them.
- Treating ICE connected state as proof of good audio/video quality; observe loss, jitter, round-trip time, bitrate, and media rendering.
- Assuming media encryption hides content from an SFU; hop-level DTLS-SRTP terminates at each endpoint/server leg unless an additional E2EE scheme is used.
- Using room IDs or client claims as authorization for publish/subscribe, recording, or moderation actions.
- Failing to provision TURN bandwidth or short-lived authenticated credentials, creating either outages or an open relay.
- Ignoring signaling races, late ICE candidates, renegotiation, ICE restart, network handoff, or permission/device failures.
- Assuming each endpoint can decode every received stream; cap subscriptions and select quality for device/network limits.

## Knowledge checks with answers

1. **Why doesn't a STUN server relay the call?** STUN helps discover a mapped address; TURN is the relay protocol when direct connectivity is unavailable or intentionally avoided.
2. **Why does mesh become expensive as participants grow?** Pairwise connections grow quadratically, and each sender may upload a copy to every other participant.
3. **What does an SFU do that a mesh does not?** It receives publisher streams and selectively forwards tracks/layers to subscribers, shifting fan-out bandwidth to managed infrastructure.
4. **Can an SFU lower video resolution if it receives only one encoded stream?** It can select an available layer, but cannot create a new lower-resolution encoding without decoding/transcoding.
5. **Does a successful ICE connection guarantee usable media quality?** No. Congestion, loss, jitter, and endpoint limits still affect quality; monitor and adapt media.
6. **What remains server-side in a P2P application?** At minimum, identity/authorization and signaling are commonly server-backed; TURN, room state, analytics, moderation, and recording may also be required by product policy.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder material with a complete topology lesson. IETF RFCs were checked for ICE candidate checks, TURN relay behavior, RTP/WebRTC transport, and data-channel transport; mediasoup's official architecture docs support the bounded description of SFU forwarding and layer selection. The lesson distinguishes mesh, SFU, MCU, signaling, STUN/TURN, encryption boundaries, and capacity trade-offs. No material factual issues or missing core concepts were found in the supplied topic scope.
