<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# memory spans allocation garbage collection pooling and diagnostics — Exercises and worked solutions

## Goals

Practice reasoning about ownership, views, GC reachability, pooling, pinning, and measurement. Each exercise asks you to name the invariant before changing code. Try the questions before reading the solutions. These rules follow Microsoft's [memory ownership guidelines](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines), [GC fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals), and [diagnostics documentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/).

## Worked example

### Parse a delimited line without allocating one string per field

The input line remains owned by its caller. The method takes a read-only view and writes parsed values into caller-owned storage. It returns the count so the caller can distinguish used slots from spare capacity.

```csharp
using System;

static int ParseCsvIntegers(ReadOnlySpan<char> line, Span<int> destination)
{
    int written = 0;
    foreach (Range range in line.Split(','))
    {
        if (written == destination.Length)
            throw new ArgumentException("Destination is too short.", nameof(destination));

        ReadOnlySpan<char> field = line[range];
        if (!int.TryParse(field, out int value))
            throw new FormatException($"Invalid integer field: {field.ToString()}");

        destination[written++] = value;
    }
    return written;
}

int[] output = new int[3];
int count = ParseCsvIntegers("12,-4,30".AsSpan(), output);
if (count != 3 || output[0] != 12 || output[1] != -4 || output[2] != 30)
    throw new InvalidOperationException("Parsing result did not match the expected values.");
```

The field spans are views into the original string. `ToString()` allocates only on the error path to build a useful exception. The destination belongs to the caller; this method neither retains nor disposes it. Slicing does not copy, and a span must not outlive its backing storage.

## Exercises

### Exercise 1: Find the pooled-buffer lifetime bug

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(1024);
Task write = stream.WriteAsync(buffer.AsMemory(0, count), cancellationToken);
ArrayPool<byte>.Shared.Return(buffer);
await write;
```

Explain the ownership violation and rewrite the sequence so the buffer remains valid until the asynchronous write completes, including exception-safe return.

### Exercise 2: Diagnose rising process memory

A service's working set grows during a long run. GC heap size rises and later falls, allocation rate is high, and post-collection snapshots show a stable object graph. Give a likely explanation and a concrete next measurement. Then state what evidence would instead suggest a retention leak.

### Exercise 3: Pick a memory type for asynchronous ownership

A producer creates a buffer, passes it to a method that awaits twice, and must return the buffer to a pool only after processing. Explain why `Span<byte>` is unsuitable as the retained view and outline an `IMemoryOwner<byte>` design. State exactly when derived `Memory<byte>` views become invalid.

### Exercise 4: Choose pinning or copying for interop

A native function reads 128 bytes synchronously and returns. Another native API stores the pointer and may use it for several seconds. Compare pinning and copying for each case and list the lifetime requirements.

### Exercise 5: Interpret a GC dump failure

`dotnet-gcdump collect` reports EventPipe data loss for a very large heap. Explain what this means, why retrying with .NET 11 blocking buffering can help, and when a process dump is the better next step.

## Progressive hints

1. Returning an array ends the caller's lease even if the write task still holds a `Memory<byte>` view. Place return in a `finally` after awaiting completion.
2. High allocation plus stable retained graph points to churn. Root-path growth or increasing retained instances after comparable collections points to retention.
3. `Memory<T>` can be stored across awaits; a span cannot live across suspension. The owner controls the lease.
4. A synchronous call has a naturally bounded pin scope. A retained native pointer outlives a `fixed` block and requires a longer-lived pinned handle or a native copy.
5. Event loss means the heap graph may be incomplete. Blocking buffering trades target responsiveness for reduced loss; process dumps capture broader state at higher storage/privacy cost.

## Complete solutions

### Solution 1

The write may still read from the array after it is returned. A later renter can overwrite it while the I/O operation is in flight. Keep the lease through completion:

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(1024);
try
{
    int count = Fill(buffer.AsSpan(0, 1024));
    await stream.WriteAsync(buffer.AsMemory(0, count), cancellationToken);
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
}
```

The `finally` runs after successful completion or an exception/cancellation. Clear sensitive data if it could otherwise be exposed to a later renter. The code assumes `Fill` returns a valid count within the requested slice.

### Solution 2

High allocation rate with a stable post-collection graph suggests allocation churn rather than a growing managed retention leak. Use allocation stacks or a `dotnet-trace` capture to find high-volume call sites, then benchmark a targeted fix under representative load. A retention leak is more likely if comparable snapshots show growing live object counts/retained bytes and root paths lead to long-lived caches, statics, subscriptions, or unfinished work. Working set also includes native and runtime memory, so compare it with GC heap and committed-memory counters.

### Solution 3

`Span<byte>` is a `ref struct` with stack-bound lifetime and cannot remain live across an `await`. Pass `Memory<byte>` or an owner across the async boundary and keep the `IMemoryOwner<byte>` alive until all processing finishes:

```csharp
using IMemoryOwner<byte> owner = MemoryPool<byte>.Shared.Rent(4096);
Memory<byte> buffer = owner.Memory;
int count = await ProduceAsync(buffer, cancellationToken);
await ProcessAsync(buffer[..count], cancellationToken);
// Disposal ends the lease here; no alias may be used afterward.
```

In production, ensure `count` is within `buffer.Length`, handle cancellation/exceptions, and do not let any child task outlive the owner. `Memory<T>` does not extend storage lifetime by itself; disposal does not necessarily erase or physically free memory immediately, but using the view after disposal is invalid by contract.

### Solution 4

For the synchronous 128-byte call, a short `fixed` scope can pin the managed buffer for the duration of the call, provided native code does not retain the pointer and the buffer is large enough. Copying to a native-owned or stack/native temporary buffer is also reasonable and may simplify the contract at a small bounded cost.

For the API that retains the pointer, a `fixed` block is insufficient. Either allocate/copy into native-owned storage and follow the native API's release contract, or keep a `GCHandle` pinned for the entire period and release it only after the native API confirms it has stopped using the pointer. Long-lived pins can affect GC behavior. Prefer a copied native buffer when ownership and release are clearer or pinning would be long.

### Solution 5

EventPipe data loss means events needed to construct the graph were dropped, so the result may be incomplete and should not be treated as a definitive retention picture. .NET 11 blocking-buffering mode can reduce loss for large captures by applying backpressure, at the cost of potentially blocking the target longer. Use it when a better GC graph is worth the measured pause. Choose a process dump when EventPipe capture remains inadequate or broader process state is needed; secure the file because it may contain credentials and application data.

## Tests and edge cases

- Exercise 1: verify the array is not returned before write completion; exercise cancellation and write failure; ensure `count` is between zero and the buffer slice length.
- Exercise 2: compare equivalent steady-state workload windows; distinguish high churn from retained growth; inspect native memory if heap remains stable while working set rises.
- Exercise 3: test empty/maximum-size buffers, cancellation at each await, producer failure, and no task escaping the owner's lifetime.
- Exercise 4: test native behavior when the pointer is retained; confirm release acknowledgment before freeing or unpinning.
- Exercise 5: confirm the capture tool's completion status and warnings; compare capture effects and keep dumps access-controlled.

## Reflection questions

1. Who owns each allocation, and what event ends its valid-use period?
2. Which views alias the same backing storage, and can any outlive its owner?
3. Does a pool reduce total memory or only allocation churn in this workload?
4. Which metric answers the question being asked: allocation rate, retained heap, committed bytes, or working set?
5. What measurement would convince you that the proposed optimization improves the actual user-visible objective?
