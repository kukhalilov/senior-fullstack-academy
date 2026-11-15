# hosted services background tasks and scheduling — Reference: Channel<T> producer consumer queues bounded capacity and worker patterns

## Scope and version

This reference covers the supplied `System.Threading.Channels` APIs and queue design concepts. The channel is an asynchronous in-process coordination primitive; it is not a persistent broker. `Channel<T>` is included in modern .NET and the package is available for supported targets as needed. Check the exact target framework and API overloads. [Channel<T> API](https://learn.microsoft.com/en-us/dotnet/api/system.threading.channels.channel-1) [Hosted-service queue patterns](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

## How this group fits the mental model

A producer writes an item to `ChannelWriter<T>` and a worker reads it from `ChannelReader<T>`. A bounded capacity makes overload a visible policy decision: wait, drop a specific queued/new item, or reject synchronously through `TryWrite`. Work stored only in this channel exists only in this process. Choose the channel for coordination and flow control; choose persistent storage/broker when delivery must survive a crash or deployment.

## Supplied names explained

### Channel creation and capacity

| Supplied name | Meaning and use |
|---|---|
| System.Threading.Channels package and namespace | Provides asynchronous producer/consumer channels under `System.Threading.Channels`; use the framework-provided assembly or package appropriate to the target framework. |
| Channel<T> | Abstract channel exposing a reader and writer for values of type `T`. Create one through the static factory methods rather than subclassing for ordinary use. |
| Channel.CreateUnbounded<T> | Creates a channel without a capacity bound. It avoids producer waits but can exhaust memory if producers outrun consumers. |
| Channel.CreateBounded<T> | Creates a finite-capacity channel with configured full behavior. Capacity must be positive and chosen from load/memory constraints. |
| BoundedChannelOptions | Configuration for capacity, full mode, reader/writer concurrency promises, and synchronous continuation behavior. |
| BoundedChannelOptions.Capacity | Maximum buffered item count. It bounds queued items, not the number or memory size of items currently being processed. |
| BoundedChannelOptions.FullMode | Controls what happens when a bounded channel is full: wait or discard according to a selected drop policy. |
| BoundedChannelFullMode.Wait | Writer waits for space; this applies backpressure. Make sure the caller can await and its request/deadline semantics allow waiting. |
| BoundedChannelFullMode.DropNewest | When full, drops the newest item already buffered to make room for the newly written item. Confirm this is the intended victim policy. |
| BoundedChannelFullMode.DropOldest | When full, drops the oldest buffered item to make room for the new write. Useful only when stale pending work is less valuable than new work. |
| BoundedChannelFullMode.DropWrite | Discards the item currently being written when full. Track/report the drop if callers need to know work was lost. |
| BoundedChannelOptions.SingleReader | Declares that one consumer reads at a time; it may allow internal optimizations. Do not set true if multiple consumers read concurrently. |
| BoundedChannelOptions.SingleWriter | Declares that one producer writes at a time; it may allow internal optimizations. Do not set true if multiple concurrent producers write. |
| BoundedChannelOptions.AllowSynchronousContinuations | Allows waiting continuations to run synchronously on the completing writer's thread. It can reduce scheduling overhead but cause unexpected reentrancy/latency; default behavior is safer unless measured. |

| Channel.CreateUnbounded<T>(UnboundedChannelOptions) | Creates an unbounded channel using explicit reader/writer concurrency and continuation options. Those flags are promises about usage, not capacity or durability. |
| UnboundedChannelOptions | Options for unbounded channels, including inherited single-reader/single-writer and synchronous-continuation settings. |
| UnboundedChannelOptions.SingleReader | Promises that no more than one read operation is active at a time; only set it when every consumer path obeys that constraint. |
| UnboundedChannelOptions.SingleWriter | Promises at most one active write operation at a time; do not set it for concurrent producers. |
| UnboundedChannelOptions.AllowSynchronousContinuations | Allows a channel operation to run a waiting continuation synchronously on the completing thread. This can add reentrancy and latency to the producer call. |
| Channel.CreateBounded<T>(int) | Creates a bounded channel by capacity using default Wait behavior and asynchronous continuations. Capacity must be greater than zero. |
| Channel.CreateBounded<T>(BoundedChannelOptions) | Creates a bounded channel with the supplied capacity/full-mode/concurrency options. |
| Channel.CreateBounded<T>(BoundedChannelOptions, Action<T>) | Creates a bounded channel with an item-drop callback. The callback can observe dropped values for the selected drop mode; keep it fast and nonblocking. |
| Action<T> itemDropped callback for bounded channels | Callback invoked when the channel discards an item due to a configured drop mode. Use it for counters/telemetry or safe cleanup, not slow I/O. |
| BoundedChannelOptions(int) constructor | Initializes bounded-channel options with a capacity. Validate capacity as a positive number before constructing it. |
### Reading and writing

| Supplied name | Meaning and use |
|---|---|
| ChannelReader<T> | Consumer-facing API for waiting for and retrieving items, plus observing completion. |
| ChannelReader<T>.ReadAsync | Asynchronously reads one item, waiting if necessary; cancellation and channel completion affect the wait. |
| ChannelReader<T>.ReadAllAsync | Exposes an async stream of available items until completion, optionally observing cancellation. Convenient for a `await foreach` consumer loop. |
| ChannelReader<T>.TryRead | Attempts a nonblocking read and reports whether an item was obtained. It does not wait for future work. |
| ChannelReader<T>.WaitToReadAsync | Waits until data may be available or the channel completes; pair with `TryRead` in loops when draining multiple items. |
| ChannelWriter<T> | Producer-facing API for writing items and completing the channel. |
| ChannelWriter<T>.WriteAsync | Asynchronously writes or applies the bounded full policy; under `Wait`, waits for space. Pass cancellation so shutdown/request cancellation can stop a blocked producer. |
| ChannelWriter<T>.TryWrite | Attempts an immediate write. It returns false when it cannot accept the item, such as full under `Wait` or already completed; decide how the caller handles rejection. |
| ChannelWriter<T>.WaitToWriteAsync | Waits until a write may succeed or channel completion is observed. A subsequent write still needs to be attempted because another writer may claim the slot. |
| ChannelWriter<T>.Complete | Marks the writer complete, optionally with an error, so readers can finish after buffered items drain. Calling completion more than once can fail. |
| ChannelWriter<T>.TryComplete | Attempts to mark completion and returns whether this call completed it. Useful when producer and shutdown paths race to finish the queue. |
| Channel<T>.Reader | Consumer endpoint for reading items and observing completion. |
| Channel<T>.Writer | Producer endpoint for writing items and completing the channel. |
| ChannelClosedException | Exception surfaced by read/write operations when the channel is completed and no item can be read/written under that operation. Handle normal shutdown completion separately from faults. |

### Application queue and delivery semantics

| Supplied name | Meaning and use |
|---|---|
| IBackgroundTaskQueue application abstraction | Application-owned interface hiding channel details from API/producer code. Define cancellation, capacity, rejection, and completion semantics explicitly. |
| QueueBackgroundWorkItemAsync backpressure contract | The enqueue method should define whether it waits, rejects, or drops when full and whether caller cancellation aborts enqueue. Do not return success if a required item was silently lost. |
| QueuedHostedService consumer loop | Hosted worker that reads queue items, executes them, creates a DI scope per item when needed, and observes host cancellation. Capture/record item failure rather than silently ending the loop. |
| Bounded channel versus unbounded channel memory risk | Bounded queue limits buffered item count and exposes overload; unbounded buffering can grow without bound under sustained producer/consumer imbalance. |
| Wait versus drop bounded-channel full modes | `Wait` slows/rejects through latency and cancellation; drop modes preserve producer progress by losing a chosen item. Neither is universally correct. |
| Single reader versus multiple worker consumers | One reader preserves simple sequencing; multiple readers increase concurrency but change ordering and can overload shared downstream services. |
| In-process Channel<T> is not durable storage | Buffered data is in process memory and disappears on process termination/restart. |
| At-most-once loss window for in-memory queued work | Work may be lost after enqueue and before completion if process fails. A consumer may also have committed a side effect before crashing, so recovery can create duplicate execution if producers resubmit. |
| Persistent broker versus in-process channel | A broker/job store can persist and distribute messages with configurable acknowledgement/retry semantics; it adds network, operational, and duplicate-delivery concerns. A local channel is simpler and faster but process-bound. |
| Queue shutdown completion and draining policy | Stop accepting writes, mark completion, and decide whether to drain buffered work or cancel/abandon it. Keep the policy within shutdown deadlines and make loss/replay visible. |
| Work item idempotency and retry policy | A work item can execute more than once after uncertain failures or durable-broker redelivery. Use stable identifiers and idempotent side effects; define retry count/backoff and terminal handling. |
| Queue depth and processing latency telemetry | Track accepted/completed/dropped/rejected counts and enqueue-to-start age with application instrumentation. Do not infer durable depth or overload from channel capacity alone. |
| Poison work item handling and dead-letter boundary | A repeatedly failing item should have bounded retry and an explicit quarantine/dead-letter/escalation path. A plain channel has no built-in dead-letter persistence. |

## Cross-item comparison

| Full mode | When full | Typical implication |
|---|---|---|
| `Wait` | Writer waits for available capacity | Backpressure; can tie up request/producer tasks |
| `DropNewest` | Discards newest buffered item, then accepts incoming write | Keeps recent work; one earlier queued item is lost |
| `DropOldest` | Discards oldest buffered item, then accepts incoming write | Keeps recent work; stale pending item is lost |
| `DropWrite` | Discards the incoming item | Existing queue preserved; current producer item is lost |

`ReadAllAsync` is concise for a consumer that drains until completion; `WaitToReadAsync` plus `TryRead` is useful when the loop needs explicit batching. A single reader simplifies ordering but limits throughput; multiple readers allow parallel processing and can complete out of enqueue order. These methods do not change the queue's durability.

## Examples

### A bounded queue with producer backpressure

```csharp
public sealed class BackgroundTaskQueue(int capacity)
{
    private readonly Channel<WorkItem> _channel =
        Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

    public ValueTask EnqueueAsync(WorkItem item, CancellationToken cancellationToken) =>
        _channel.Writer.WriteAsync(item, cancellationToken);

    public IAsyncEnumerable<WorkItem> ReadAllAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAllAsync(cancellationToken);

    public bool Complete(Exception? error = null) => _channel.Writer.TryComplete(error);
}
```

The abstraction makes capacity and cancellation visible to producers. `SingleWriter = false` is correct when multiple API requests may enqueue concurrently. Completing the channel does not persist its buffered items.

### Drain a completed channel

```csharp
await foreach (var item in queue.ReadAllAsync(stoppingToken))
{
    await ProcessOneAsync(item, stoppingToken);
}
```

This stops when the writer completes and the channel drains, or when cancellation interrupts enumeration. If shutdown cancellation happens before draining, items can remain in memory and be lost when the process exits; communicate accepted-work guarantees honestly.

## Common mistakes

- Choosing an unbounded queue without a memory/backpressure limit.
- Setting `SingleReader` or `SingleWriter` as an optimization when the actual workload violates the promise.
- Treating a drop mode as backpressure or failing to count dropped items.
- Assuming `TryWrite == false` always means only “temporarily full”; it can also mean completion.
- Completing the writer from one path and then writing from another without handling completion races.
- Using multiple readers while assuming strict FIFO completion order.
- Assuming a bounded capacity includes work currently being processed; in-flight work is additional.
- Returning an enqueue success response before durable persistence when the product promises delivery.
- Assuming `Channel<T>` survives deployments, process crashes, or machine restarts.
- Retrying a poison item forever in the same consumer loop.
- Ignoring cancellation while a producer is blocked waiting for capacity.
- Using arbitrary delegates as queued work items that capture request objects, scoped services, or large object graphs.

## Knowledge checks with answers

1. **Which mode provides backpressure?** `Wait`; producers await capacity and can themselves be cancelled.
2. **Which item is discarded by `DropWrite`?** The incoming item being written.
3. **Does `SingleReader = true` enforce a single consumer?** It is a concurrency promise/optimization hint; the application must honor it.
4. **Does `ReadAllAsync` make work durable?** No; it is an asynchronous read stream over the same in-memory channel.
5. **What should happen to poison work?** Apply bounded retries and an explicit quarantine/dead-letter/escalation policy, backed by persistence if it must survive process restart.
6. **Does a full channel capacity bound total work in the system?** No; add active/in-flight consumer work, blocked producers, and any upstream buffers.

## Sources

- [Channel<T> API](https://learn.microsoft.com/en-us/dotnet/api/system.threading.channels.channel-1)
- [ChannelReader<T> API](https://learn.microsoft.com/en-us/dotnet/api/system.threading.channels.channelreader-1)
- [ChannelWriter<T> API](https://learn.microsoft.com/en-us/dotnet/api/system.threading.channels.channelwriter-1)
- [Bounded channel full modes](https://learn.microsoft.com/en-us/dotnet/api/system.threading.channels.boundedchannelfullmode)
- [Channel creation and drop callbacks](https://learn.microsoft.com/en-us/dotnet/core/extensions/channels)
- [Hosted-service queue patterns](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
