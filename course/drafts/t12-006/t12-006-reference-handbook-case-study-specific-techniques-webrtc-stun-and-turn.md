# end-to-end system design case studies — Reference: WebRTC STUN and TURN

Sources: [RFC 8445: ICE](https://www.rfc-editor.org/rfc/rfc8445.html), [RFC 8489: STUN](https://www.rfc-editor.org/rfc/rfc8489.html), [RFC 8656: TURN](https://www.rfc-editor.org/rfc/rfc8656.html), [W3C WebRTC specification](https://www.w3.org/TR/webrtc/).

## Scope and version

STUN and TURN are NAT-traversal tools commonly used by ICE in WebRTC. Current core specifications are RFC 8445 for ICE, RFC 8489 for STUN, and RFC 8656 for TURN. WebRTC still needs a signaling channel to exchange offers, answers, and ICE candidates; these protocols do not define the application’s signaling service. Browser support and supported ICE transports must be tested in target clients.

## How this group fits the mental model

Two peers often sit behind NATs or firewalls and cannot send media directly using their private addresses. ICE gathers candidate transport addresses, exchanges them through signaling, and tests candidate pairs with connectivity checks. STUN helps a client discover a server-reflexive address and perform connectivity checks. If direct connectivity cannot be established, TURN provides a relay address through which packets can flow.

STUN is not itself a complete NAT traversal solution. Learning a public mapped address does not guarantee that the peer can reach it: NAT mapping/filtering behavior, symmetric mappings, enterprise firewall policy, and carrier networks can prevent direct paths. TURN is the reliability fallback with bandwidth and infrastructure cost. Prefer direct paths when ICE proves them usable, but provide sufficient relay capacity for the real share of sessions that need it.

## Supplied names explained

- **STUN**: a protocol tool to discover a mapped IP address/port, maintain a NAT binding, and support ICE connectivity checks. It does not relay the application’s media packets.
- **TURN**: a relay protocol. A client obtains an allocation and relayed transport address, then sends/receives peer traffic through that relay. TURN is an extension to STUN and is commonly used as ICE fallback.
- **ICE agent**: the endpoint gathering candidates, exchanging them through signaling, forming candidate pairs, and running connectivity checks to select a usable path.
- **Host candidate**: a local interface address/port. It may be private, link-local, or otherwise unreachable from the peer and can reveal network information depending on browser policy.
- **Server-reflexive candidate (`srflx`)**: the address/port a STUN server observes for the client’s request. It represents one NAT mapping and may not be reachable by all peers.
- **Relay candidate**: the address allocated by a TURN server. It adds a network hop but is usable when direct candidates fail, subject to permissions, allocation lifetime, capacity, and firewall reachability.
- **Candidate pair and connectivity check**: ICE tests local/remote candidate combinations with STUN-based checks and nominates a working pair according to the ICE procedure. Merely gathering candidates does not establish a media path.
- **ICE restart**: renegotiation that gathers new connectivity state after a network change or failure. Application signaling and peer state must support it.

## Cross-item comparison

STUN is a discovery/checking tool; TURN transports packets through a relay; ICE coordinates the candidate search and choice. A VPN or reverse proxy solves different network and application problems and is not a substitute for ICE candidate checks. A media SFU/MCU is an application-level media topology that may itself require ICE connectivity between each client and the server; TURN and SFU can be used together.

## Examples

Two browsers signal an offer/answer and candidate messages through the application server. Each gathers host and STUN-derived candidates. ICE checks candidate pairs; a direct UDP pair succeeds, so media bypasses TURN. If a corporate firewall blocks that path, the clients gather authenticated TURN relay candidates and ICE selects a relayed pair. Media then crosses the TURN service, which must be sized for bandwidth, concurrent allocations, regional latency, and egress cost. The SFU or peer remains the media endpoint; TURN is the packet relay.

Operationally, issue short-lived TURN credentials rather than embedding a permanent shared secret in client code. Rate-limit allocation creation, bound allocation lifetimes, prevent open relay abuse, monitor relay bytes and failed allocations, and provide capacity in regions close to users. Test IPv4/IPv6, Wi-Fi/mobile handover, restrictive NATs, UDP-blocked networks, and server outages. A client that silently lacks TURN fallback may work at home but fail for users on enterprise networks.

## Common mistakes

- Saying STUN guarantees a peer-to-peer path through every NAT.
- Treating a server-reflexive address as universally reachable.
- Omitting TURN because direct connectivity succeeds in a developer’s network.
- Confusing TURN relay with an SFU that selects and forwards media streams.
- Assuming STUN/TURN provides WebRTC signaling.
- Exposing long-lived TURN credentials to clients or allowing unauthenticated relay allocations.
- Ignoring relay bandwidth, regional placement, and egress cost.
- Forgetting to restart/re-gather ICE state after network changes.

## Knowledge checks with answers

1. **What does STUN provide?** Address discovery and connectivity-check support; it does not relay media by itself.
2. **When does TURN help?** When ICE cannot establish a direct candidate pair and needs a relay path.
3. **Does a relay candidate mean the app is using an SFU?** No. TURN forwards packets at the transport layer; an SFU understands media streams and chooses what to forward.
4. **What does ICE do with candidates?** It forms and checks candidate pairs, then selects a usable path through the connectivity procedure.
