
# memory spans allocation garbage collection pooling and diagnostics — Core concepts and how they fit together

# Learning objectives
- Understand how .NET manages memory through garbage collection, generational heaps, and explicit non-memory resource cleanup.
- Master contiguous memory views like `Span<T>` and `Memory<T>`, including their lifetimes, stack allocation, and slicing behavior.
- Learn how to reduce allocation overhead using buffer pooling via `ArrayPool<T>` and `MemoryPool<T>`.
- Diagnose memory usage, allocation rates, and garbage collection behavior using runtime diagnostics and profiling tools.

# Prerequisites
- Familiarity with basic C# syntax, value types, and reference types.
- Understanding of asynchronous programming fundamentals (`async` and `await`).
- Basic awareness of operating system process resources (such as memory working sets).

# Core concepts
Memory management in .NET balances automated runtime cleanup for managed objects with developer responsibility for external system resources [https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/]. 

## Managed Memory and Reachability
Managed objects live in garbage-collected memory and remain alive while reachable from roots (such as static fields or active stack frames). The runtime reclaims unreachable objects automatically. However, developers still own deterministic disposal of files, sockets, handles, and other non-memory resources [https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals].

## Generational Garbage Collection
The generational collector optimizes for short-lived allocations across three generations (Generation 0, Generation 1, and Generation 2) plus specialized heaps like the Large Object Heap (LOH) and Pinned Object Heap (POH) [https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals]. Frequent small temporary allocations are cheap, but high allocation volume, long-lived graphs, large arrays, pinning, and finalizers increase collection cost and working set [https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc].

## Contiguous Memory Views (`Span<T>` and `Memory<T>`)
- `Span<T>` and `ReadOnlySpan<T>` are stack-only views over contiguous memory that expose slices without copying, but they do not themselves own or extend the lifetime of the underlying storage [https://learn.microsoft.com/en-us/dotnet/api/system.span-1].
- `Memory<T>` and `ReadOnlyMemory<T>` wrap similar contiguous data but can cross asynchronous and heap boundaries where `ref struct` restrictions prevent `Span<T>` from going [https://learn.microsoft.com/en-us/dotnet/api/system.memory-1].

## Buffer Pooling
Pooling via `ArrayPool<T>` or `MemoryPool<T>` reduces repeated allocation pressure [https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1]. Rented buffers have explicit ownership, may exceed requested lengths, and often contain old data [https://learn.microsoft.com/en-us/dotnet/api/system.buffers.memorypool-1]. You must return each buffer exactly once, stop using it after return, and clear sensitive contents when required.

## Diagnostics and Measurement
Optimize memory only after measuring allocation rate, retained heap, GC pause behavior, and end-to-end latency using runtime diagnostics and representative workloads [https://learn.microsoft.com/en-us/dotnet/core/diagnostics/]. Do not call `GC.Collect` as a routine performance fix.

# Mechanisms and relationships

```
 [Stack / CPU Registers] 
         │
         ├── stackalloc -> stack-only Span<T> (Fast, local scope)
         ▼
 [Managed Heap (SOH / LOH / POH)]
         │
         ├── ArrayPool<T>.Rent() ──> Rented Array (Pooled storage)
         │                           │
         │                           ▼
         │                   ReadOnlySpan<T> / Memory<T> (Safe Slicing)
         ▼
 [Garbage Collector (Generational)]
         │
         ├── Tracks reachability from roots
         └── Reclaims unreachable objects automatically
```

The relationship between these features revolves around **ownership, lifetime, and safety**:
1. **Storage vs. View**: An underlying storage mechanism (heap array, native memory, stack frame, or pool) holds data. `Span<T>` and `Memory<T>` provide zero-copy views into this storage.
2. **Lifetimes**: `Span<T>` is a stack-only ref struct and cannot outlive its backing storage. C# 13 permits span locals in async methods when they are not used across an `await` suspension boundary; earlier C# versions prohibit these locals. `Memory<T>` can be retained across asynchronous boundaries but does not transfer ownership of its backing storage.
3. **Pooling Boundaries**: When object allocation pressure degrades throughput, `ArrayPool<T>.Shared.Rent(Int32)` temporarily lends arrays. Callers wrap them in spans or memory views, process data without allocations, and return buffers to the pool.

# Worked examples

## Example 1: Avoiding Allocation with Spans and Slicing
This snippet demonstrates how to parse a sub-string from a large text buffer using `ReadOnlySpan<char>` without allocating temporary `String` objects on the managed heap.

```csharp
using System;

public class LogParser
{
    public static ReadOnlySpan<char> ExtractTimestamp(ReadOnlySpan<char> logLine)
    {
        // Find the index of the first closing bracket ']'
        int endIndex = logLine.IndexOf(']');
        if (endIndex <= 1)
        {
            return ReadOnlySpan<char>.Empty;
        }

        // Slice from index 1 up to endIndex - 1 (skipping the opening bracket)
        return logLine.Slice(1, endIndex - 1);
    }
}
```
*Expected Result:* The method returns a lightweight view pointing directly into the original character memory without invoking string allocation or copying characters.

## Example 2: Using ArrayPool to Eliminate Allocation in Hot Paths
This snippet shows how to rent a temporary buffer for processing high-frequency data and ensure it is returned safely using a `try-finally` block.

```csharp
using System;
using System.Buffers;

public class DataProcessor
{
    public void ProcessData(ReadOnlySpan<byte> input)
    {
        // Rent a buffer from the shared array pool; length may be >= input.Length
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(input.Length);
        try
        {
            // Copy input into the rented buffer view
            Span<byte> workingSpan = rentedBuffer.AsSpan(0, input.Length);
            input.CopyTo(workingSpan);

            // Perform processing work...
            workingSpan.Clear(); // Clear if containing sensitive data
        }
        finally
        {
            // Always return the rented array exactly once
            ArrayPool<byte>.Shared.Return(rentedBuffer, clearArray: false);
        }
    }
}
```
*Expected Result:* Reusing a rented array can reduce array allocations on pool hits. The pool may allocate on a miss and retain returned capacity, so measure allocation rate and retained memory rather than assuming zero allocation or zero GC pressure.

# Misconceptions and edge cases
- **Misconception:** "`Span<T>` extends the lifetime of the object it wraps."  
  *Correction:* `Span<T>` is a non-owning view. A span over a managed array participates in GC lifetime tracking, so the backing array is kept alive while needed. The invalidation cases are ending a stack/native buffer's lifetime or returning/disposing storage whose owner controls its reuse; a span cannot extend those ownership contracts.
- **Edge Case:** `ArrayPool<T>.Rent(Int32)` returns a buffer whose length is **greater than or equal to** the requested count. Always slice the resulting span to your exact working length.
- **Failure Mode:** Storing a `Span<T>` inside a class field or capturing it inside a lambda expression will cause compiler errors because `ref struct` instances cannot escape their local stack frame.
- **Gotcha:** Calling `GC.Collect()` manually usually harms application throughput by forcing the runtime to stop threads and disrupt generational heuristics. Rely on adaptive tuning instead.

# Knowledge checks with answers
1. **Question:** What is the C# 13 rule for using `Span<T>` in an async method?
   **Answer:** C# 13 allows a `ref struct` local in an async method only when it is not used across an `await` suspension boundary. The restriction protects ref-safe lifetimes; it is not simply about continuations resuming on another thread. Earlier C# versions prohibit these locals in async methods.

2. **Question:** What is the primary hazard when returning an array to `ArrayPool<T>.Shared`?  
   **Answer:** Using the array after it has been returned (use-after-return hazard) or returning the same array multiple times. Rented arrays may be given to other callers, leading to data corruption or security leaks.

3. **Question:** Does `Span<T>.Slice()` allocate memory or copy data?  
   **Answer:** Neither. Slicing creates a new lightweight pointer-and-length view pointing at an offset within the existing contiguous memory without copying bytes or allocating heap memory.

4. **Question:** When should you introduce object pooling or `ArrayPool<T>` into a .NET application?  
   **Answer:** Only after measuring allocation bottlenecks, high garbage collection pause times, or working set growth using diagnostic tools like `dotnet-counters` or BenchmarkDotNet's `MemoryDiagnoser`, and verifying that allocations actually degrade performance.

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/)
