# system design foundations and infrastructure building blocks — Reference: MQTT

Sources: [OASIS MQTT Version 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html), [OASIS MQTT Version 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html).

## Scope and version

This lesson covers MQTT as a brokered publish/subscribe protocol, with MQTT 5.0 as the current OASIS standard baseline and MQTT 3.1.1 as a widely deployed earlier version. Broker support and extensions differ; check the exact broker/client version and feature matrix. MQTT does not require one specific transport, though TCP/TLS and WebSocket transports are common.

## How this group fits the mental model

Many devices are intermittently connected, bandwidth-constrained, or behind networks where direct inbound connections are difficult. MQTT clients make outbound connections to a broker, publish messages to topic names, and subscribe to topic filters. The broker routes messages to matching subscriptions. This decouples publishers from subscribers, but puts broker availability, authorization, session storage, and delivery policy on the critical path.

## Supplied names explained

- `MQTT` — A lightweight brokered publish/subscribe messaging protocol with topic filters, per-hop quality-of-service levels, optional retained state, and session behavior defined by the protocol version and broker configuration.

## Core model: clients, broker, topic names, and filters

A client connects to a **server/broker** with a client identifier and may authenticate, subscribe, publish, and disconnect. A **topic name** identifies a published message route, such as `plant/line-4/temperature`. A **topic filter** is a subscription pattern; `+` matches one topic level and `#` matches remaining levels under the protocol’s rules. Topic names and filters are case-sensitive. Keep a deliberate hierarchy: tenants/devices, metric types, and command/status paths should be predictable.

The broker is a trust boundary. ACLs should constrain which authenticated client can publish or subscribe to each topic. A broad wildcard subscription can expose all tenants or devices; enforce tenant-specific prefixes and prevent clients from publishing into control-command namespaces they do not own. Use TLS for transport confidentiality/integrity and an authentication/authorization design appropriate to constrained devices.

## QoS 0, 1, and 2

MQTT defines delivery QoS levels between a sending client and receiving broker/client hop:

- **QoS 0 — at most once:** best effort; no protocol acknowledgment or retry guarantee for delivery.
- **QoS 1 — at least once:** acknowledgment-based delivery; duplicates can occur, so the receiver should tolerate repeated messages.
- **QoS 2 — exactly once at the MQTT protocol exchange:** a multi-step handshake aims to deliver the application message once on that protocol hop, at higher state and packet cost.

The QoS delivered to a subscriber is bounded by the publisher’s sent QoS and the subscription’s granted QoS according to the protocol. QoS is not a guarantee that a database mutation, actuator action, or downstream event happens exactly once. A process can perform an effect and crash before its protocol acknowledgment is durably completed. Use business event IDs, idempotent handlers, sequence numbers, and persistent application state for side-effect correctness.

## Sessions, offline messages, and version differences

MQTT 3.1.1 uses the `Clean Session` flag to choose whether connection state is discarded or resumed. MQTT 5.0 separates the decision to start clean (`Clean Start`) from how long the session persists after disconnect (`Session Expiry Interval`). Session state may include subscriptions and in-flight QoS messages; actual persistence/storage capacity and cluster behavior depend on the broker. A persistent session is not infinite retention: message expiry, broker limits, and session expiry can remove state.

MQTT 5.0 adds properties and reason codes that improve control and diagnostics. Examples include session expiry, message expiry, reason codes/reason strings, topic aliases, shared subscriptions, and request/response-related properties. Do not send v5-only features to a v3.1.1 peer; negotiate protocol level and provide a compatible fallback when required. Broker product support may be partial or impose limits.

## Retained messages and Last Will

A retained publication stores the latest retained application message for a topic at the broker so a future matching subscriber can receive current state immediately. It is useful for device status/configuration snapshots, not a complete event history: a later retained publication replaces the prior retained value; publishing an empty retained message clears it under the spec’s rules. Use a separate durable log/queue for every event that must be replayed.

A **Will Message** is configured at connection time and published by the broker if the client connection ends without a normal DISCONNECT under the protocol’s conditions. MQTT 5.0 adds Will Delay Interval. Wills can report device offline state, but should account for transient network partitions, delayed will publication, reconnects, and stale retained status. Include timestamps/epochs and make consumers distinguish “last known” from guaranteed current state.

## Shared subscriptions and scaling consumers

MQTT 5.0 defines shared subscriptions, commonly written as `$share/{share-name}/{topic-filter}`, which let the broker distribute matching messages among sessions in the group. This resembles competing consumers rather than broadcast-to-every-subscriber. Distribution algorithm and delivery/retry behavior depend on broker and subscription semantics; shared subscriptions do not provide a global order across consumers. They can increase consumer throughput but should be used only when messages may be processed independently or application partitioning preserves required state order.

## Flow control, keepalive, and resource limits

MQTT keepalive helps detect a broken connection; it is not a real-time guarantee that the peer is alive at an exact instant. MQTT 5.0 flow-control properties such as Receive Maximum bound in-flight QoS 1/2 messages per connection. Message size, queued offline messages, subscriptions, retained state, and connection count also consume broker/device memory. Set limits and expiry policies based on device capacity and recovery objectives.

Slow consumers can accumulate queued messages or block ordered processing depending on broker policy. Define whether to drop expired telemetry, retain only latest state, persist alarms, or reject overload. Instrument connect/disconnect rate, auth failures, queue depth, in-flight messages, delivery latency, retransmissions, expiry, and per-client resource usage.

## Cross-item comparison

| Pattern | Main strength | Main caveat |
|---|---|---|
| MQTT broker pub/sub | Lightweight topic routing to intermittently connected devices | Broker is a central availability/security boundary; QoS is per hop |
| HTTP polling | Simple request/response and easy infrastructure | Repeated polling overhead and slower updates |
| WebSocket | Full-duplex application connection to a server | Server must manage sessions, fan-out, buffering, and delivery policy |
| Durable queue/log | Backlog, replay, and independent consumer progress | Often heavier for constrained devices; product semantics differ |
| Retained MQTT state | Last known value for new subscribers | Not a history or event log |

## Examples

A sensor publishes `factory/line-4/device-17/temperature` at QoS 1 with a stable measurement ID and timestamp. The broker authenticates the device and permits publishing only to its namespace. A dashboard subscribes to a filtered topic; an alarm processor uses a persistent subscription and idempotent event table. Retained state stores the latest device status, while a separate telemetry store keeps history. Offline messages have an expiry policy so stale readings do not flood consumers after a long disconnect.

A command service publishes to `devices/device-17/commands/reboot` with QoS 1 and a unique command ID. The device validates authorization, deduplicates the command ID, persists command state before acting, and publishes a result/ack topic. QoS alone cannot prove the reboot occurred exactly once; the command protocol needs explicit accepted/completed states and retry semantics.

## Common mistakes

- Calling QoS 2 end-to-end exactly-once business processing.
- Assuming retained messages preserve every update or form a replay log.
- Treating persistent sessions as permanent message storage regardless of expiry/broker limits.
- Publishing commands into wildcard-accessible topics without per-device ACLs.
- Using QoS 0 for alarms that require confirmed receipt, or QoS 2 indiscriminately for high-volume telemetry.
- Assuming shared subscriptions broadcast to all group members or preserve global order.
- Treating keepalive as a precise liveness detector.
- Ignoring MQTT 3.1.1 versus 5.0 feature negotiation and broker-specific support.
- Allowing unlimited offline queues or retained topics to exhaust broker storage.

## Knowledge checks with answers

1. **Which QoS can produce duplicate delivery?** QoS 1 explicitly allows redelivery; application-level duplicate effects are possible at other levels after failures/retries too.
2. **Does QoS 2 guarantee a physical action occurs exactly once?** No. It governs the MQTT protocol exchange, not an atomic transaction with device/database side effects.
3. **What does a retained message represent?** The retained latest value for a topic, not every historical event.
4. **What changed from MQTT 3.1.1 to 5.0 in session semantics?** MQTT 5.0 separates clean-start behavior from a session-expiry interval and adds richer properties/reason codes.
5. **When are shared subscriptions appropriate?** When a group of consumers should share work rather than each receive every publication, and message ordering/state partitioning is handled explicitly.

## Practice

Design an MQTT deployment for 100,000 intermittently connected sensors and a remote command channel. Define topic structure, QoS by message class, retained state, sessions/expiry, ACLs, consumer scaling, offline behavior, and duplicate handling.

**Suggested answer:** Use device-scoped topic prefixes and broker ACLs allowing each device to publish telemetry/status and subscribe only to its command topic. Use QoS 0 for replaceable high-rate readings if loss is acceptable, QoS 1 plus event IDs/idempotent consumers for alarms and commands, and choose QoS 2 only where protocol-level duplicate suppression justifies extra state/cost. Retain latest status/configuration, not event history. Use MQTT 5.0 session expiry and message expiry matched to device offline windows; cap offline queue and in-flight limits. Scale stateless consumers with shared subscriptions only when messages can be processed independently. Persist command IDs/results and reconcile uncertain actions; monitor broker queue/storage and per-device connection health.
