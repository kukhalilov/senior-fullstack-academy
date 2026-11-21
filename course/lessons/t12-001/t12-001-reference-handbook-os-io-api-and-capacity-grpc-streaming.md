# system design foundations and infrastructure building blocks — Reference: gRPC streaming

Sources: [gRPC core concepts and RPC lifecycle](https://grpc.io/docs/what-is-grpc/core-concepts/), [gRPC flow control](https://grpc.io/docs/guides/flow-control/), [gRPC deadlines](https://grpc.io/docs/guides/deadlines/), [gRPC cancellation](https://grpc.io/docs/guides/cancellation/).

## Scope and version

This lesson covers the four gRPC RPC shapes and the operational semantics of streaming. gRPC APIs and behavior vary by language implementation; check language-specific documentation for threading, write readiness, cancellation propagation, and lifecycle details. Streaming runs over a transport connection but its message flow, backpressure, and application contract must be designed explicitly.

## How this group fits the mental model

Unary RPC sends one request and receives one response. Streaming RPCs let one side or both sides send sequences of messages during one call. Streaming can avoid repeated setup and support large or continuous exchanges, but it keeps a call and associated state alive longer. That makes flow control, deadlines, cancellation, reconnect, authorization, and resource limits central parts of the design.

## Supplied names explained

- `gRPC streaming` — Server-streaming, client-streaming, or bidirectional-streaming RPCs that exchange ordered message sequences within a call, with transport/framework flow control and application-managed lifecycle.

## The four RPC shapes

- **Unary:** one request, one response. Simple retry and deadline boundary, but large exchanges require another design.
- **Server streaming:** one client request followed by a sequence of server messages. Useful for progress, feeds, or result batches.
- **Client streaming:** a sequence of client messages followed by one server response. Useful for upload, aggregation, or telemetry batches.
- **Bidirectional streaming:** both sides exchange sequences independently within one call. Each direction preserves its message order; the two directions can progress independently, so the application must define whether messages form a request/response conversation or separate flows.

Message ordering is within an individual RPC stream. It does not establish ordering across separate calls, reconnects, clients, or database transactions. A stream can end with status and trailing metadata; receiving some messages does not guarantee the overall RPC ended successfully.

## Flow control and backpressure

Flow control prevents a fast sender from overwhelming a receiver. gRPC integrates flow control with the transport; a successful application `write` means the message was handed to the gRPC framework, not necessarily sent over the network or consumed by the peer application. Some language APIs block or signal readiness when flow-control capacity is exhausted; behavior is implementation-specific. Receivers must continue reading for senders to make progress.

Bound application queues and message sizes. If the producer creates data faster than the consumer can process it, choose a policy: slow production, pause reads, buffer within a limit, drop/coalesce replaceable updates, or fail the stream. Do not turn framework buffering into an unbounded memory queue. Bidirectional streams can deadlock if both peers synchronously write a large amount while neither reads; design concurrent read/write loops or alternate reads and writes according to the protocol.

## Deadlines, cancellation, and long-lived calls

Clients should set realistic deadlines for finite RPCs and propagate the remaining budget to downstream calls where supported. Some APIs express a deadline timestamp; others accept a duration. Deadline expiration ends the RPC from the client’s perspective, but application work may continue unless the server observes cancellation and stops its computation and downstream requests.

Long-lived streams need an explicit lifetime policy. A single short deadline may be inappropriate for an indefinite subscription; instead define lease/renewal, idle timeout, heartbeat, maximum session age, and reconnect behavior. Cancellation or a broken transport does not roll back state changes already made. For commands carried in a stream, use sequence numbers, acknowledgments, idempotency keys, or resume tokens when the client needs reliable recovery from an uncertain disconnect.

## Reconnect and delivery semantics

A stream is a transport session, not a durable message queue. If the connection breaks, the client may not know whether the last sent message was processed or whether the last received update was committed. Define whether the product offers at-most-once, at-least-once, or effectively-once processing, and how clients resume. A cursor/offset must refer to an authoritative ordered log or snapshot version; deduplicate retried commands using stable IDs when effects must not repeat.

Avoid promising end-to-end exactly-once behavior from gRPC transport alone. The service must coordinate message acknowledgment, persistence, and side effects. A server that sends a response and then crashes before recording completion can leave the caller uncertain; durable state and idempotent handling address that application-level ambiguity.

## Resource and security controls

Long-lived calls consume connection slots, buffers, timers, authentication state, and often per-stream application objects. Set concurrent-stream limits, maximum message size, per-client quotas, idle/session timeouts, and backpressure policies. Revalidate authorization for sensitive long-lived sessions if permissions can change. Avoid trusting a connection’s initial authorization forever where policy requires revocation.

Observe active streams, messages/bytes per direction, stream age, flow-control stalls, queue depth, cancellation/deadline outcomes, reconnect/resume rates, and per-method resource use. Distinguish successful message delivery from successful RPC completion in traces and metrics.

## Cross-item comparison

| Need | Often suitable shape | Main design question |
|---|---|---|
| Small command/result | Unary | Deadline, idempotent retry, and status semantics |
| Server pushes progress/results | Server streaming | Backpressure, event cursor, and reconnect/resume |
| Client uploads chunks | Client streaming | Chunk identity, size limits, and final commit acknowledgment |
| Interactive continuous exchange | Bidirectional streaming | Independent read/write loops, ordering, cancellation, and session lifecycle |
| Durable offline delivery | Persistent queue/log plus RPC | gRPC stream alone is not a durable broker |

## Examples

A server streams export records to a client. The request contains a snapshot/version and resume cursor. The server sends bounded batches; the client processes and checkpoints each batch, then reconnects with the last committed cursor if the stream fails. The service enforces a deadline or session lease, checks cancellation while reading the export, and limits concurrent exports. Duplicate records at resume boundaries are tolerated through stable IDs or cursor semantics.

A bidirectional collaborative session has client edits flowing upstream and server updates downstream. Each direction has sequence/version identifiers; the client continues reading while sending so flow-control windows can advance. On reconnect it supplies its last acknowledged revision and the server returns missing operations or a fresh snapshot. The stream does not itself persist edits or guarantee exactly-once application.

## Common mistakes

- Treating a completed write call as proof the peer received or processed a message.
- Assuming the RPC is successful because some stream messages arrived; check final status.
- Ignoring flow control and accumulating unbounded application buffers.
- Having both sides write synchronously without reading, causing flow-control deadlock.
- Assuming cancellation interrupts arbitrary handler code or rolls back prior side effects.
- Giving an indefinite stream no heartbeat, idle policy, lease, or reconnect mechanism.
- Assuming ordering across separate calls or automatic exactly-once behavior after reconnect.
- Failing to propagate deadlines or honor cancellation in downstream work.
- Allowing long-lived streams to outlive authorization or resource quotas.

## Knowledge checks with answers

1. **What distinguishes the four RPC types?** Whether the client and server each send one message or a sequence of messages.
2. **Does a gRPC stream write mean bytes reached the remote application?** No. It hands the message to the local framework, which buffers/transmits under flow control.
3. **Why must a bidirectional service read while it writes?** The peer may need reads to free flow-control capacity; two synchronous writers can wait indefinitely on each other.
4. **What does cancellation guarantee about earlier side effects?** Nothing is rolled back automatically; work already performed remains unless application logic compensates it.
5. **How should a client recover after a stream disconnect?** Use explicit cursor/sequence and acknowledgment semantics, resume from durable state, and deduplicate where a message may have been processed before the disconnect.

## Practice

Design a client-streaming upload for a 2 GB file over an unreliable connection. Specify chunk identity, flow control, retry/resume, integrity checking, final commit semantics, deadlines, cancellation, and server resource limits.

**Suggested answer:** Give the upload a stable ID and each chunk an offset/sequence and checksum. Bound chunk size and in-flight chunks; let flow control and an application-level quota pace the sender. Persist received chunks or a durable resume cursor and acknowledge only the state the service can recover. On reconnect, negotiate the next missing offset and allow idempotent retransmission. Verify complete length and final digest before atomically publishing the file, then return a final response/status that represents commit. Use a realistic per-call deadline or renewable session policy, propagate cancellation to storage work, and reclaim abandoned uploads with quotas and expiration.
