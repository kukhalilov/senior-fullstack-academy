# system design foundations and infrastructure building blocks — Reference: io_uring

Sources: [Linux man-pages io_uring(7)](https://man7.org/linux/man-pages/man7/io_uring.7.html).

## Scope and version

This lesson explains Linux `io_uring` using the Linux man-pages interface documentation. It is a conceptual guide, not a version-specific opcode catalogue: supported operations, flags, and behaviors depend on kernel version and operation type. Check the target kernel documentation and probe support when deploying.

## How this group fits the mental model

With readiness notification, an application is told “this socket may be ready; now try I/O.” With an asynchronous submission/completion interface, the application asks the kernel to perform an operation and later handles its result. `io_uring` provides shared submission and completion queues for this model. It can reduce transitions for batches, but brings explicit operation lifetimes, completion correlation, ordering, cancellation, and resource management.

## Supplied names explained

- `io_uring` — A Linux asynchronous I/O interface with a submission queue (SQ) for requests and a completion queue (CQ) for results, shared between user space and the kernel.

## Request and completion lifecycle

1. **Set up a ring:** `io_uring_setup` and memory mappings create the SQ and CQ structures (often through a library wrapper). Configuration controls queue sizes and optional features.
2. **Prepare an SQE:** a submission queue entry describes an operation such as read, write, accept, or another supported opcode, plus its file descriptor, buffers/arguments, flags, and `user_data` correlation value.
3. **Submit work:** `io_uring_enter` informs the kernel that requests are available and can optionally wait for a number of completions. Submission queue polling (SQPOLL) is an optional mode in which a kernel thread polls the submission queue, trading fewer enter calls for CPU and scheduling costs.
4. **Consume a CQE:** a completion queue entry reports the operation result and carries `user_data` back to identify the request. Errors are reported as negative error numbers in the completion result, rather than through the submitting thread’s `errno`.
5. **Release or reuse resources:** only after the operation’s contract permits it may the application reuse buffers, request objects, or associated state.

Batching multiple SQEs and processing multiple CQEs can reduce per-operation overhead. The kernel can execute concurrent requests and their completion order is not generally the submission order. Correlate each completion with its request and design ordering explicitly.

## Buffer lifetime and completion correctness

An asynchronous operation can outlive the function call that submitted it. A read/write buffer must remain allocated and valid until the operation has finished using it. Likewise, the request context in `user_data` must not point to freed or repurposed state while a completion can still arrive. Some operation parameters are consumed at submission, while data buffers are accessed during execution; follow the operation-specific lifetime contract rather than assuming all pointers have the same lifetime.

For each completion, inspect the result. A successful write may still transfer fewer bytes than requested; enqueue or submit the remainder according to the operation’s semantics. A successful read may return fewer bytes than requested or zero for end-of-file/closed stream, where applicable. Handle negative results, cancellation races, shutdown, and late completions without double-freeing or applying work to a reused connection.

## Ordering, concurrency, and cancellation

Requests can complete out of order. This matters for stream sockets: overlapping sends or receives on one socket can violate the application’s desired byte order or complicate state. Use a per-connection state machine to serialize operations when ordering is required. `IOSQE_IO_LINK` can express dependency/order among linked operations in supported situations, but does not remove the need to understand operation contracts and cancellation/error propagation.

Cancellation is itself asynchronous and may race with completion. A cancel request does not mean the original request definitely did no work; the operation might already have completed. Keep state alive until the relevant completions establish what happened. Side-effecting operations need idempotency or reconciliation when their result is uncertain, just as they do across network failures.

Some operations are multi-shot and can yield more than one completion; CQE flags can indicate that more completions are expected. Some modes can omit successful completion entries or produce notification CQEs under specific flags. Therefore, “one SQE always means exactly one CQE” is only the basic model; account for the selected feature semantics and kernel version.

## Cross-item comparison

## io_uring and epoll solve different interfaces

`epoll` reports readiness for registered file descriptors; the application then calls read/write itself. `io_uring` submits I/O operations and reports their completions. `io_uring` also has poll operations and can be used in readiness-like ways, but that does not make the two interfaces interchangeable in every application. An event-driven service may use epoll with nonblocking sockets, io_uring operations, or a runtime abstraction. Compare measured syscall/transition cost, batching opportunities, kernel support, complexity, latency, and operational compatibility.

## Security and operational constraints

Do not infer that using io_uring makes every operation asynchronous or available on every kernel/filesystem/device. Some operations may complete immediately, fall back to worker threads, or be unsupported in a given environment. Feature availability and behavior have changed over kernel releases; probe supported features and test the production kernel/configuration. Restricting io_uring through system policy can affect applications that depend on it, so coordinate runtime requirements with container and host security policy.

Monitor submission/completion queue occupancy, completion latency, operations in flight, negative results, cancellations, buffer-pool pressure, dropped/overflowed events where applicable, and CPU consumed by polling. Bound outstanding work and memory; asynchronous submission can otherwise shift overload into a large queue rather than removing it.

## Examples

A file service reads blocks from storage to answer a request. It submits reads with request IDs in `user_data`, keeps each destination buffer alive, and handles CQEs as they arrive. A disk read for request B may complete before request A even when A was submitted first; the service matches results to requests and only emits an ordered response when its protocol requires it. If one read returns fewer bytes than requested, the service follows file semantics and may submit another read. During shutdown, it stops accepting work, resolves or cancels in-flight operations, drains resulting completions, and only then frees ring and request state.

For a socket response, serialize sends per connection if byte ordering matters. Keep the response buffer until completion, account for partial sends, and do not free the connection object until all outstanding operations are completed or safely canceled and drained.

## Common mistakes

- Treating `io_uring` as a magic asynchronous wrapper that guarantees every opcode is nonblocking in every environment.
- Freeing or reusing an I/O buffer immediately after submission.
- Assuming CQEs arrive in submission order or that concurrent stream sends can overlap safely.
- Assuming cancellation guarantees the original operation did not take effect.
- Reading only the top-level success/failure without handling partial results.
- Assuming one SQE always yields exactly one CQE despite multi-shot and completion-suppression modes.
- Allowing unbounded in-flight operations, buffers, or completion queues.
- Choosing SQPOLL without measuring its CPU/latency tradeoff.
- Shipping code based on a development kernel without checking target-kernel support and security restrictions.

## Knowledge checks with answers

1. **What is the basic SQ/CQ relationship?** The application places operation descriptions in the SQ; the kernel processes them and places results in the CQ, which the application drains.
2. **Why must a read/write buffer outlive submission?** The kernel may still access that memory while the I/O is in flight; freeing or reusing it can corrupt data or cause memory-safety bugs.
3. **Can completions be matched by their position in the CQ?** No. Completion order can differ from submission order; use `user_data` or equivalent stable request context.
4. **Does canceling an operation prove no side effect occurred?** No. Completion and cancellation can race. Resolve the actual result and use idempotency/reconciliation for uncertain side effects.
5. **How does io_uring differ from epoll?** Epoll notifies that a descriptor may be ready, after which the application performs I/O; io_uring submits I/O requests and later reports their operation results.

## Practice

Design an io_uring-based response path for multiple requests on persistent TCP connections. Explain request IDs, buffer lifetime, per-connection send ordering, partial results, cancellation, shutdown, and backpressure. State when you would prefer a simpler epoll-based implementation.

**Suggested answer:** Allocate stable request contexts and buffers, submit operations with a unique correlation ID, and retain each context until all expected completions have been consumed. Serialize sends per connection when the byte stream’s response ordering matters, handle partial results, and avoid freeing connection state while operations remain in flight. Bound outstanding operations and buffers; reject, pause, or queue upstream work at a defined limit. During shutdown, stop accepting new work, cancel or drain outstanding operations, process the resulting completions, then release resources. Prefer epoll if readiness-based nonblocking I/O already meets measured performance needs and the team values a simpler, more portable runtime model.
