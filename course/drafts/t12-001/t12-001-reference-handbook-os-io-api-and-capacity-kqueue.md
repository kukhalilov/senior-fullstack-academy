# system design foundations and infrastructure building blocks — Reference: kqueue

Sources: [FreeBSD 15.1 kqueue(2)/kevent(2) manual](https://man.freebsd.org/cgi/man.cgi?query=kqueue).

## Scope and version

This lesson describes `kqueue` as documented for FreeBSD 15.1. Other BSD-derived operating systems and compatibility layers may expose different filters, flags, and behavior. Check the target platform’s manual pages and headers before relying on a filter.

## How this group fits the mental model

A server with many connections needs to know which resources can make progress without repeatedly checking each one. `kqueue` is a kernel event notification mechanism: an application registers interest in conditions and waits for the events that are ready. It does not perform the application’s protocol work, guarantee that a whole request is available, or manage the application’s connection state and backpressure.

## Supplied names explained

- `kqueue` — Creates a kernel event queue; `kevent()` applies a batch of changes and retrieves a batch of triggered events. Each event is identified by an `(ident, filter)` pair.

## Registering and receiving events

Create a queue with `kqueue()` (or a platform-supported variant such as `kqueuex()`), then use `kevent()` to submit changes and receive pending events. A `struct kevent` carries an identifier, filter, action flags, filter-specific flags/data, and opaque application data (`udata`). Keep `udata` tied to a lifecycle-safe connection or resource object; a raw descriptor number alone can be reused after close.

The `kevent()` changelist is applied before pending events are returned. This lets an event loop batch registration updates and retrieval. A filter is evaluated when registered and when relevant conditions occur; repeated triggers may be aggregated into one event rather than producing one queued record per low-level trigger. The event’s `data` and flags have meanings defined by its filter. Always interpret them according to that filter and check error/EOF indications.

Common action flags include `EV_ADD` to add or modify, `EV_ENABLE`/`EV_DISABLE` to control delivery, and `EV_DELETE` to remove. `EV_ONESHOT` removes an event after its first delivery; `EV_DISPATCH` disables after delivery until re-enabled; `EV_CLEAR` resets reported state and is useful for transition-like notifications. Do not assume these flags are interchangeable: select them based on the filter and event-loop policy described by the platform documentation.

## Filters: beyond socket readability

The `EVFILT_READ` and `EVFILT_WRITE` filters report read and write conditions for supported identifiers. Their details vary by resource type. For example, a listening socket read event indicates a pending connection; a connected socket read event indicates data or a terminal/error condition. A write event signals an opportunity to write, not that an arbitrary response will fit in one call. Use nonblocking I/O and retain partial input/output state.

A distinct advantage of the kqueue model is its family of filters for other event sources. FreeBSD documents filters including `EVFILT_VNODE` for file-system-related changes, `EVFILT_PROC` for process events, `EVFILT_SIGNAL` for signals, `EVFILT_TIMER` for timers, and `EVFILT_USER` for user-triggered events, alongside AIO and other platform facilities. Their precise supported notes and semantics are OS-specific. A file notification is not automatically a durable, lossless journal of every filesystem operation; use it to trigger reconciliation when correctness depends on current state.

## Event-loop design and failure handling

For a network service, register the listening socket, accept connections when signaled, configure accepted sockets nonblocking, and register their read interest. Read available bytes into bounded buffers, parse only complete protocol messages, and queue responses. Attempt writes and preserve unsent bytes. Enable write interest while output remains, then disable it when the queue drains to avoid a busy loop. On EOF/error, stop dispatching the connection, remove its state, close resources, and ignore any stale event already present in a returned batch.

An event is a prompt to inspect and handle a condition, not a durable work item. A process can crash between notification and processing; after restart, reconstruct current state from authoritative resources. If a file watcher reports a change, for example, re-stat or rescan the relevant path rather than assuming the event itself contains the full new state. Bound event batches and per-connection work so one hot resource does not starve others.

## Cross-item comparison

`kqueue` is a FreeBSD kernel interface and has counterparts with different contracts elsewhere. Linux `epoll` centers on readiness for registered descriptors, while `kqueue` exposes a generalized filter/kevent model for multiple kinds of events. This is a useful architectural distinction, not a claim that one is universally more capable or faster. Portable runtimes hide platform backends behind one API; their behavior is defined by the runtime contract and may not expose every native filter. `io_uring` is another Linux interface with submission/completion queues and is not a drop-in name for kqueue.

## Examples

A cross-platform file-indexing service may use a native vnode filter to learn that a watched file might have changed. It marks the path dirty, coalesces duplicate notifications, reads the current file state, and updates its index idempotently. If events are lost while the process is down or a watch is invalidated, a periodic or startup reconciliation scan repairs the index. The event stream reduces detection delay; the filesystem remains the source of truth.

For a TCP API server, a writable event should cause the loop to attempt a nonblocking write of queued bytes. If only part is accepted, keep the remainder and the write interest. If the response queue grows without bound because the client is slow, apply explicit backpressure or close policy; `kqueue` does not solve resource exhaustion.

## Common mistakes

- Treating the returned event as a complete application message or as proof that all bytes can be written.
- Assuming event notifications are a durable event log or never need reconciliation.
- Assuming a filter or flag available in FreeBSD has identical behavior on every BSD-like OS.
- Leaving write interest enabled after the output queue drains.
- Using `udata` that points to freed state or dispatching a stale event to a reused descriptor.
- Confusing one-shot removal, dispatch disabling, and clear/reset semantics.
- Ignoring EOF, error, timer cancellation, or watch invalidation.
- Letting duplicate notifications trigger repeated non-idempotent work.

## Knowledge checks with answers

1. **What does a `kevent` identify?** A unique `(ident, filter)` pair within the queue; the filter defines the interpretation of associated flags and data.
2. **Does a read event mean one complete HTTP request is ready?** No. It means the filter reports a read condition; the application must perform nonblocking reads and frame protocol data itself.
3. **How do `EV_ONESHOT` and `EV_DISPATCH` differ conceptually?** One-shot removes the event after delivery; dispatch disables it after delivery so the application can explicitly enable it again.
4. **Can a file watcher replace a reconciliation scan?** Not when correctness depends on the complete current filesystem state. Treat notifications as prompts and reconcile with the authoritative filesystem.
5. **Why carry an application object in `udata`?** It can identify lifecycle state more safely than a descriptor number alone, provided the object remains valid and stale events are handled.

## Practice

Design a file-watching service using `EVFILT_VNODE`. Explain how it responds to a notification, handles several changes arriving together, survives a crash, and avoids applying an old event to a deleted or replaced file.

**Suggested answer:** Register a vnode filter on an opened file and request only the relevant supported notes. On notification, mark the logical path dirty and schedule an idempotent refresh that reads current metadata/content; coalesce bursts because the notification is a signal to recheck, not a complete change record. Maintain object identity and validate it before applying results so replaced files are not confused with old file descriptors. Recreate invalidated watches and periodically/startup reconcile the indexed directory from the filesystem. If the service crashes, the filesystem remains authoritative and reconciliation repairs missed work.
