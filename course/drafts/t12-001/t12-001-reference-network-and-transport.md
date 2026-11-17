# system design foundations and infrastructure building blocks — Reference: Network path and transport behavior

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc8446), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `DNS` — Maps a hostname to address records; caching, TTLs, and resolver behavior affect change propagation and lookup latency.
- `TCP` — Reliable ordered byte stream with connection establishment and congestion control; application messages need framing.
- `TLS` — Authenticates a peer and protects confidentiality and integrity for a connection when configured and validated correctly.
- `HTTP/1.1` — Request/response protocol with persistent connections; multiple requests may share a connection but have head-of-line and connection-management considerations.
- `HTTP/2` — Multiplexes streams over one connection and compresses headers; packet loss can still delay all streams at the transport layer.
- `HTTP/3` — Maps HTTP semantics onto QUIC over UDP, reducing transport-level head-of-line blocking between streams while retaining network and server constraints.
- `WebSocket` — Upgrades an HTTP connection to a bidirectional framed channel; connection lifetime, authorization, heartbeats, and fan-out remain application responsibilities.
- `Server-Sent Events (SSE)` — Provides a one-way server-to-client event stream over HTTP; reconnect and event IDs can aid recovery, while client-to-server actions use another request path.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.