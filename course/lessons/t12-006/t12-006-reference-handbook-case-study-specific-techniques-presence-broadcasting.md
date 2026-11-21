# end-to-end system design case studies — Reference: Presence broadcasting

Sources: [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/), [Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/), [RFC 6455: The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455.html), [Azure SignalR Service scaling](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-scale-signalr), [AWS SNS message delivery](https://docs.aws.amazon.com/sns/latest/dg/message-delivery.html).

## Scope and version

Presence broadcasting publishes ephemeral facts such as “user is online,” “cursor is here,” or “typing.” It is separate from durable messages, edits, and authorization. The cited Redis behavior is current product documentation; managed realtime services have their own limits and delivery contracts.

## How this group fits the mental model

Presence is usually a best-effort view assembled from expiring signals. A client connects, authenticates, joins one or more presence scopes, sends periodic heartbeats or state changes, and receives updates for the other active members. The server associates connections with users and rooms, but a person may have several devices or tabs. Therefore distinguish connection presence from user presence: one disconnect must not mark a user offline while another valid connection remains.

Presence differs from durable collaboration state. A dropped cursor update can be corrected by the next update; a dropped document edit cannot. Persist edits and important events in an authoritative store or durable log. Broadcast ephemeral presence over WebSocket or another push channel, and make subscribers reconstruct the current view after reconnect instead of assuming every transient event was received.

## Supplied names explained

- **Presence record:** a short-lived state entry keyed by room and connection/user, with expiry and last-seen metadata.
- **Heartbeat/lease:** periodic proof that the connection is still considered active; expiry bounds stale “online” state after crashes.
- **Fan-out:** delivering one presence change to all interested room members; cost grows with recipients and update frequency.
- **WebSocket:** a persistent bidirectional connection after an HTTP upgrade; the application still defines messages, authorization, heartbeats, and resynchronization.
- **Redis Pub/Sub:** low-latency broadcast to currently connected subscribers, with at-most-once delivery; disconnected subscribers miss messages.
- **Redis Streams:** persistent stream entries and consumer-group acknowledgement/pending-message mechanisms, useful when replay or processing recovery matters, with retention and operational costs.

## Cross-item comparison

| Mechanism | Good fit | Limitation |
| --- | --- | --- |
| Per-node in-memory fan-out | Small single-node service | No cross-node delivery or recovery after process loss |
| Redis Pub/Sub | Ephemeral cross-node updates where missed events are repaired by snapshot/reconnect | At-most-once; not an event log or durable presence database |
| Redis Streams or durable broker | Events requiring replay, acknowledgements, or worker recovery | More storage/retention and consumer management; duplicates and ordering scope still need handling |
| Managed realtime hub | Offloads connection management and scale-out integration | Vendor-specific limits, pricing, regions, authorization, and delivery semantics remain part of design |

## Examples

User U has laptop and phone connected to room R. Store presence per connection with a TTL; aggregate to “U online in R if any authorized connection is live.” Each connection renews its TTL. When the laptop closes, its record expires or is removed, but U remains online while the phone connection is present. Publish a transition only when the aggregate changes, or coalesce noisy cursor/typing updates. If a subscriber reconnects, send a fresh room snapshot and then live updates; do not try to replay an unbounded sequence of ephemeral cursor positions.

For a horizontally scaled service, each gateway owns its local sockets and a broker distributes room events across gateways. Backpressure should be bounded: sample or coalesce cursor positions, cap room fan-out, and disconnect or degrade clients that cannot consume updates. Apply room authorization on both initial join and subsequent subscriptions; never let a client choose arbitrary room IDs without access checks.

## Common mistakes

- Treating a transient broadcast as durable history.
- Using only a user-level online flag when one user can have multiple devices/connections.
- Setting an infinite TTL so crashed sessions remain online forever.
- Updating and broadcasting every pointer movement without coalescing or rate limits.
- Assuming Pub/Sub replays missed messages; Redis documents at-most-once delivery.
- Counting transport delivery as proof that the client rendered or acted on an update.
- Broadcasting sensitive presence to everyone instead of defining scope, visibility, and authorization.
- Failing to send a current snapshot after reconnect or after joining a room.

## Knowledge checks with answers

1. **Why is presence often modeled with TTLs?** A crashed client cannot send a graceful offline event; expiry eventually removes its stale connection state.
2. **Does one disconnect mean the user is offline?** Only if no other valid connection for that user and scope remains.
3. **Can Redis Pub/Sub be the durable source of edits?** No. Its delivery is at-most-once; use durable storage/logging for edits that must survive subscriber disconnection.
4. **How do clients recover from missed ephemeral updates?** Rejoin with authorization, receive a current snapshot, then process subsequent live events.
