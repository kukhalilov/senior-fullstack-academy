# system design foundations and infrastructure building blocks — Reference: epoll

Sources: [Linux man-pages epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html).

## Scope and version

This lesson explains Linux `epoll` as documented by the Linux man-pages project. The supplied named scope is `epoll`. System-call details and limits depend on the running Linux kernel; check that kernel’s documentation and process limits when operating production services.

## How this group fits the mental model

An event-driven server may keep many sockets open while only a small fraction need attention at a given moment. Repeatedly asking about every socket wastes work. `epoll` lets a process register file descriptors of interest, wait for readiness notifications, and handle those that may make progress. It is an I/O notification mechanism: it does not read or write the data, parse HTTP, create concurrency by itself, or make blocking operations safe.

## Supplied names explained

- `epoll` — A Linux I/O event notification facility with an interest list of registered file descriptors and a kernel-maintained ready list. The application consumes notifications, performs nonblocking I/O, maintains connection state, and handles errors and closure.

## The event loop in three system calls

1. **Create an instance:** `epoll_create1()` returns a file descriptor for an epoll instance. Close it when the event loop is shut down.
2. **Register or change interest:** `epoll_ctl()` uses `EPOLL_CTL_ADD`, `EPOLL_CTL_MOD`, or `EPOLL_CTL_DEL` to add, modify, or remove a watched descriptor and its event mask/user data.
3. **Wait for events:** `epoll_wait()` blocks (or times out) until events are available and copies a bounded batch into the application’s array. The application dispatches them to its connection state machines.

The kernel interest list is the set the process asked to watch. The ready list reflects descriptors that may currently perform the requested I/O. Readiness is not a message boundary and does not promise that a full application request is available. A socket may become readable with only part of a protocol frame; the application must buffer and parse according to its protocol.

## Readiness, nonblocking I/O, and backpressure

Read readiness means a read may make progress, return end-of-stream, or report an error; write readiness means a write may accept some bytes. It does not mean the full buffer can be transferred. Use nonblocking descriptors so one slow peer cannot stall the thread that handles every connection. Maintain per-connection input/output buffers and protocol state. A partial write leaves bytes queued for a later writable event.

Writable sockets are often ready almost all the time. Register write interest when output is actually pending, then remove or modify it after the buffer drains; permanently watching writable events can create a busy loop. Apply backpressure when output queues grow: bound memory, pause upstream reads or reject work according to the service policy, and resume when the queue falls. Readiness notification does not solve memory exhaustion or overload.

## Level-triggered and edge-triggered modes

**Level-triggered (LT)** is the default. While a descriptor remains ready, subsequent waits can report it again. This is easier to reason about: process some data, return to the loop, and the descriptor can be reported again if it remains ready. It may result in repeated notifications until the application drains or disables the condition.

**Edge-triggered (ET)** uses `EPOLLET` and notifies on readiness changes. If a socket becomes readable and the application reads only part of the available bytes, there may be no new edge while unread bytes remain. Waiting again can then stall despite buffered data. The documented safe pattern is to use nonblocking descriptors and continue reading or writing until the operation returns `EAGAIN`/`EWOULDBLOCK`, then wait for another event.

Draining without limit can let one busy connection monopolize the event-loop thread. If fairness matters, keep an application ready queue and process a bounded amount per connection per turn; retain the connection as runnable when yielding before `EAGAIN`. This application scheduling policy must be designed so ET readiness is not forgotten.

## One-shot delivery and multiple waiters

`EPOLLONESHOT` disables the descriptor after delivery until the application rearms it with `epoll_ctl(EPOLL_CTL_MOD)`. This can help coordinate ownership when worker threads share an event loop, but the application must rearm at the right point and avoid concurrent mutation of connection state. When multiple threads wait on the same epoll instance, ET notification wakes one waiter for a ready descriptor in the documented case, reducing some thundering-herd wakeups. This is not a general-purpose lock or guarantee that all application races disappear.

## Connection lifecycle and descriptor identity

File descriptor numbers are process-local handles and can be reused after close. A robust event loop associates an event with a connection object and generation/identity, not only a numeric descriptor, so a stale queued event cannot act on a newly reused descriptor. Remove a connection from application data structures when it closes, handle EOF and error/hangup conditions, unregister as appropriate, and release buffers and timers exactly once.

The Linux man page notes a subtle case: duplicated descriptors refer to the same open file description. Closing one descriptor does not necessarily remove the monitored open-file description from all epoll interest lists while another duplicate remains open. If descriptor duplication or library internals are involved, understand ownership and explicitly remove registrations when needed. Events can already have been copied into an application batch when another event closes the connection; invalidate the connection state and ignore stale entries safely.

## Capacity and operational behavior

`epoll` avoids scanning every watched descriptor on every wait in the same way as traditional `select`/`poll` usage, and is designed to scale to large watched sets. That does not mean an application can watch an unlimited number of descriptors or that total server cost is constant: each connection consumes kernel and application memory, buffers, timers, TLS state, and CPU when active. Linux exposes `max_user_watches` for the total watched descriptors associated with a real user ID; inspect the live system value rather than copying an old default into capacity planning.

Instrument active and registered descriptors, ready-event batch sizes, event-loop iteration time, read/write bytes, partial writes, `EAGAIN` frequency, queue depth, close reasons, and per-connection memory. Load-test many mostly idle sockets and a smaller set of high-throughput connections. Benchmark LT and ET in the actual runtime; a theoretical syscall reduction can be outweighed by implementation complexity or workload shape.

## Cross-item comparison

`epoll` is Linux-specific. FreeBSD `kqueue` and other operating-system facilities solve related readiness-notification problems with different APIs and semantics. Portable runtimes commonly provide a cross-platform abstraction and select an OS backend internally. `io_uring` is a separate Linux interface that can submit and complete I/O operations through shared rings; do not describe it as merely another spelling of epoll readiness. Choose the abstraction based on portability, workload, runtime support, operational skills, and measured performance, not a slogan that one interface is always faster.

## Examples

Imagine a server with 40,000 persistent client connections, most idle. A single event loop waits for a batch. A readable socket gets its bytes appended to that client’s buffer; the parser may wait for the remainder of a request. A response is queued and write interest is enabled only while bytes remain. If the client stops reading, the output queue reaches its limit and the server pauses or closes according to policy. When the peer closes, the loop removes its state and releases resources. This architecture can serve many idle connections without one thread blocked on each read, but application work, active traffic, and per-connection memory still set capacity.

For ET, if a receive call reads 4 KiB from a socket with 10 KiB buffered and the loop then waits for another edge, the remaining 6 KiB may never be processed until new data arrives. Continue reading until `EAGAIN`, or explicitly retain runnable state if a fairness budget causes an early yield.

## Common mistakes

- Treating readiness as a complete message or as a promise that a full read/write will finish.
- Using blocking sockets in a loop that must service many connections.
- In ET mode, reading only once and then waiting again before reaching `EAGAIN`.
- Enabling writable interest permanently and spinning on sockets that are almost always writable.
- Letting one hot connection drain indefinitely and starve other ready connections.
- Reusing a file descriptor while stale events still reference an old connection object.
- Forgetting to rearm `EPOLLONESHOT` or coordinating shared connection state unsafely.
- Planning capacity from descriptor count alone while ignoring buffers, TLS, timers, and active CPU.
- Assuming an epoll backend makes a portable runtime’s public API Linux-specific.

## Knowledge checks with answers

1. **What does an `EPOLLIN` event guarantee?** It reports readiness according to the descriptor’s event semantics; a nonblocking read may make progress, return EOF, or fail. It does not guarantee a whole application message.
2. **Why is ET commonly paired with nonblocking descriptors and draining to `EAGAIN`?** Because a readiness transition may be reported once while unread data remains; draining ensures the loop observes the current buffer state before waiting for a new transition.
3. **When should an event loop watch for writability?** Usually while it has queued output that could not yet be written; remove the interest when the queue drains to avoid repeated immediately-ready notifications.
4. **Does `epoll` make a 40,000-connection server inexpensive?** No. It reduces the cost of discovering ready descriptors, but sockets, buffers, protocol state, TLS, active traffic, and application work still consume resources.
5. **What is the risk of identifying a connection only by its descriptor integer?** Descriptors can be reused and event batches can contain stale entries; a stale event could be applied to the wrong connection unless the application validates object identity/lifecycle.

## Practice

Sketch a single-threaded ET loop for TCP sockets. Explain registration, partial reads, parsing, partial writes, `EAGAIN`, peer close, fairness under a hot connection, and bounded output queues. Then explain which responsibilities remain the same if your runtime uses LT or a portable event-loop abstraction.

**Suggested answer:** Create an epoll instance, register nonblocking sockets, and wait for batches. For each connection, drain readable bytes until `EAGAIN` or retain runnable state if a fairness budget yields early; append bytes and parse only complete protocol frames. Queue response bytes, attempt writes until the queue empties or `EAGAIN`, and request write readiness only while output remains. On EOF/error, invalidate the connection, unregister/close, and free its state while guarding against stale events and descriptor reuse. Bound buffers and apply backpressure. LT changes the notification behavior and may simplify partial draining, but buffering, protocol framing, lifecycle, fairness, resource limits, and overload policy remain application responsibilities.
