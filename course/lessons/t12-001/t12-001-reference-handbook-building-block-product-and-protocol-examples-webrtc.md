# system design foundations and infrastructure building blocks — Reference: WebRTC

Sources: [W3C WebRTC 1.0](https://www.w3.org/TR/webrtc/), [RFC 8835 WebRTC transports](https://www.rfc-editor.org/rfc/rfc8835.html), [RFC 8445 ICE](https://www.rfc-editor.org/rfc/rfc8445.html), [RFC 8489 STUN](https://www.rfc-editor.org/rfc/rfc8489.html), [RFC 8656 TURN](https://www.rfc-editor.org/rfc/rfc8656.html), [RFC 8831 WebRTC data channels](https://www.rfc-editor.org/rfc/rfc8831.html), [RFC 8827 WebRTC security architecture](https://www.rfc-editor.org/rfc/rfc8827.html).

## Scope and version

This lesson explains browser/application WebRTC architecture and its core connection path using the current W3C WebRTC 1.0 specification and IETF transport/security standards. Browser support and API details evolve; check current browser compatibility and device/platform APIs. WebRTC is a set of APIs and protocols, not a hosted signaling service or a guarantee that peers connect directly.

## How this group fits the mental model

WebRTC enables interactive audio, video, and data between endpoints with low-latency transports. Two peers still need an application-defined way to discover each other and exchange connection information. They also need to traverse NATs/firewalls, negotiate media/data capabilities, secure the session, handle bandwidth changes, and recover when a path fails. The system design includes signaling, ICE infrastructure, media relays/SFUs when needed, and operational controls around sessions.

## Supplied names explained

- `WebRTC` — A standards-based set of real-time communication APIs and protocols for establishing secure media and data sessions between browsers or other compatible endpoints, with application-supplied signaling and ICE server configuration.

## Connection setup: signaling is application-owned

The application creates an `RTCPeerConnection`, adds media tracks and/or data channels, then uses an offer/answer exchange to negotiate session descriptions (SDP). The offer, answer, and trickled ICE candidates must travel between peers over a separate signaling channel, commonly WebSocket or HTTPS. WebRTC does not prescribe the signaling protocol, account model, room service, or how users find one another.

The app’s signaling layer must authenticate participants, authorize room membership, validate message sizes/rates, bind negotiation messages to the right session, and expire abandoned sessions. Treat SDP and ICE candidates as untrusted input. A signaling server coordinates setup; it does not normally relay media unless the architecture explicitly uses a media relay.

## ICE, STUN, and TURN

ICE gathers candidate network addresses and tests candidate pairs to find a working path. Host candidates represent local interfaces, server-reflexive candidates are discovered using STUN, and relayed candidates use TURN. ICE checks connectivity; it does not provide the signaling channel itself.

STUN helps an endpoint discover a server-reflexive address and supports ICE connectivity checks. STUN alone cannot guarantee traversal through every NAT or firewall. TURN allocates a relay address and forwards packets when a direct path cannot be established or a policy requires relaying. TURN adds bandwidth and regional capacity costs, but is necessary for reliable connectivity in restrictive networks. WebRTC transport requirements include ICE and TURN support for relevant NAT cases and TURN over TCP/TLS for UDP-blocking environments.

Gather multiple candidate paths and monitor selected candidate type. If all candidate pairs fail, surface a reconnect/retry path and diagnose firewall, DNS, credential, and relay-capacity problems. TURN credentials should be short-lived and authorized; an open relay can be abused for bandwidth theft and denial of service.

## Media and data transport

WebRTC media uses RTP/SRTP with RTCP feedback and congestion control; session negotiation coordinates codecs, tracks, and transport parameters. A direct peer connection is encrypted, but encryption does not mean the application has end-to-end identity verification beyond its signaling/authentication design.

Data channels use SCTP over DTLS over ICE/UDP. SCTP supports multiple streams and reliable or partially reliable/unordered message delivery options. Select ordered/reliable behavior for commands or state transitions that require it; use unordered/partially reliable modes only when stale data is less valuable than timely data. Messages are not an unbounded free transport: apply application framing, size limits, backpressure, and queue bounds.

## Direct peer, relay, and SFU architectures

- **Direct peer-to-peer:** low server media bandwidth for two-party calls when connectivity succeeds; each peer sends to the other and handles its own capture/rendering.
- **TURN relay:** forwards packets when direct connectivity fails or is disallowed. It does not decode/transcode media merely by relaying.
- **Selective Forwarding Unit (SFU):** receives media streams and forwards selected streams/layers to participants, common for multi-party conferencing. It reduces the full-mesh upload burden but adds server egress, routing, subscription, and congestion-control design.
- **Multipoint Control Unit (MCU):** decodes/mixes/transcodes media centrally and sends composed outputs. It can simplify clients or layout, but increases compute and often reduces flexibility/increases latency.

In a full mesh with N participants, each participant may need to send to N−1 peers; uplink and encoding cost grow quickly. An SFU commonly lets each client publish a small number of streams while the server forwards selected streams to subscribers. Choose from participant count, device capability, desired layout, network uplink, latency, privacy, and cost. WebRTC does not mandate one topology.

## Congestion, quality, and lifecycle

Networks vary in bandwidth, loss, and delay. Congestion control and RTCP feedback help adapt sending rates and media quality, but the application still needs product policies: prefer audio over video under pressure, reduce resolution/frame rate, pause layers, or show degraded connectivity. Track ICE state, connection state, selected candidate pair, RTT, packet loss, jitter, bitrate, frames dropped, and relay usage.

Handle ICE restarts and network changes, tab backgrounding, device permission loss, camera/microphone changes, and peer departure. Sessions need heartbeats/leases at the application layer and a cleanup policy for stale rooms. A successful setup does not guarantee a stable session for its full duration.

## Security and privacy

Browser media capture requires user permission and secure-context constraints defined by the platform. Clearly communicate when capture is active and stop tracks when no longer needed. Signaling must prevent unauthorized room joins and session hijacking. Use authenticated signaling, short-lived TURN credentials, rate limits, and abuse detection. Consider IP-address exposure, location privacy, recording consent, retention, and participant identity verification. Encryption in transit protects packets, but a TURN relay can observe network metadata and an SFU generally terminates transport security for forwarded streams unless a separate end-to-end media encryption design is used.

## Cross-item comparison

| Component | Role | Does not provide by itself |
|---|---|---|
| Signaling service | Exchanges SDP/candidates and manages session coordination | Media transport or guaranteed NAT traversal |
| STUN | Discovers/refines public-facing candidate information and supports checks | A relay path through every firewall |
| TURN | Relays packets through a reachable server | Media mixing, room authorization, or free bandwidth |
| SFU | Receives and forwards selected streams | Full media mixing or application signaling |
| MCU | Decodes/mixes/transcodes media | Low compute cost or endpoint-to-endpoint media secrecy |
| WebSocket/HTTP signaling | Application transport for negotiation messages | WebRTC itself or peer connectivity |

## Examples

For a two-person support call, users join an authenticated room through a signaling service, exchange offers/answers and ICE candidates, and establish an `RTCPeerConnection`. ICE first tests direct candidates; if blocked, each endpoint uses a TURN relay with short-lived credentials. The app reports selected path and call quality. If the user changes networks, it attempts ICE restart; if that fails, it renegotiates or reconnects. On hangup, tracks stop and room/session state expires.

For a 20-person meeting, a full mesh would require each participant to upload streams to many peers. Use an SFU with per-participant published tracks, subscriber selection, simulcast/SVC layer selection where supported, and bounded egress. The application still needs signaling, room authorization, relay fallback, congestion handling, and a recording policy.

## Common mistakes

- Assuming WebRTC includes signaling, room discovery, or a managed TURN service.
- Assuming STUN alone guarantees connectivity through restrictive NATs/firewalls.
- Planning only for direct paths and ignoring TURN bandwidth/availability/cost.
- Treating encryption as participant identity verification or complete end-to-end secrecy through an SFU.
- Using full mesh for many participants without analyzing uplink/encoding growth.
- Ignoring congestion control, quality adaptation, and long-lived session cleanup.
- Using reliable ordered data channels for all messages, even stale telemetry or cursor updates.
- Exposing long-lived TURN credentials or running an unauthenticated relay.
- Failing to validate signaling messages and authorize room participation.

## Knowledge checks with answers

1. **Does WebRTC define how peers exchange offers and ICE candidates?** No. Signaling is application-defined and typically carries those negotiation messages.
2. **What is the role of STUN versus TURN?** STUN helps discover/check candidate connectivity; TURN relays traffic when direct paths cannot work or are not allowed.
3. **Does a TURN relay automatically mix video?** No. It forwards packets; an SFU forwards selected streams and an MCU decodes/mixes them.
4. **Why does full mesh become costly as participants grow?** Each participant may send separate streams to many peers, increasing upload bandwidth and encoding load.
5. **Does DTLS/SRTP encryption prove that the remote participant is who they claim to be?** No. Identity and authorization depend on authenticated signaling/session design.

## Practice

Design a browser-based 12-person video meeting for users on restrictive corporate networks. Specify signaling, ICE/STUN/TURN, topology, security, congestion behavior, monitoring, and reconnect.

**Suggested answer:** Authenticate users and authorize room membership through a signaling service that exchanges SDP and trickled ICE candidates. Use an SFU rather than full mesh for the group; support TURN over UDP plus TCP/TLS fallback and monitor the proportion of relayed sessions and regional capacity. Use short-lived TURN credentials, secure signaling, rate limits, and a recording/consent policy. Adapt video layers/bitrate under congestion while preserving audio, bound data-channel messages, and observe ICE/connection state, RTT, loss, jitter, bitrate, and SFU egress. On network change, attempt ICE restart, then renegotiate/reconnect; expire abandoned room state.
