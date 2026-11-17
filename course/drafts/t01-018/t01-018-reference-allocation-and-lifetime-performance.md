<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# memory spans allocation garbage collection pooling and diagnostics — Reference: Allocation behavior, object layout, pooling tradeoffs, pinning, and memory ownership design

# Scope and version

This lesson closes the `allocation-and-lifetime-performance` inventory for .NET 11 and C# 15. It focuses on how allocations, references, and lifetimes affect memory cost, not on a universal object-size formula. See [memory and spans](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/), [GC fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals), and [LOH guidance](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap).

# How this group fits the mental model

Allocation asks how much new managed data is created; retention asks which objects remain reachable. High allocation can cause GC work without a leak. A leak-like growth pattern can instead come from a small number of long-lived roots retaining a large graph. Pooling changes allocation churn into retained capacity and ownership obligations. Optimize only after measuring both churn and retention under a representative workload.

# Supplied names explained

| Supplied name | Meaning, tradeoff, or invariant |
|---|---|
| `Allocation rate` | Managed bytes allocated per unit time; useful for detecting churn, but not a measure of live memory. |
| `Allocation volume versus retained heap size` | Total bytes created over an interval versus bytes still reachable after collection; distinguish transient churn from retention. |
| `Temporary allocation` | Short-lived objects often fit the generational collector's efficient path, though excessive volume still costs CPU and bandwidth. |
| `Object lifetime distribution` | How long objects survive; generation behavior is efficient when many die young, while long-lived survivors add tracing/retention cost. |
| `Object graph retention` | Reachability through chains of references can keep a large subgraph alive even when the application no longer conceptually needs it. |
| `Unintended object retention` | Objects remain rooted by caches, callbacks, tasks, statics, or event subscriptions after their useful lifetime. |
| `Event-handler reference leak` | A long-lived publisher retains a subscribed target through its delegate until unsubscription or publisher disposal. |
| `Static-field retention` | A static reference roots its target for process lifetime unless replaced/cleared; avoid unbounded static caches. |
| `Large object retention` | Keeping a large array or graph reachable can dominate heap size and increase full-GC pressure. |
| `Closure allocation` | Capturing local variables may create a closure object or related allocations; compiler optimizations vary, so measure actual output. |
| `Boxing allocation` | Converting a value type to `object` or an interface can create a boxed object in relevant contexts; generic APIs may avoid it. |
| `String concatenation allocation` | Immutable string operations create new strings in many patterns; repeated concatenation in a loop can create avoidable churn. |
| `StringBuilder pooling tradeoff` | Reuse may reduce allocation but retains capacity and complicates ownership; modern runtime optimizations and workload size affect the break-even point. |
| `Struct copy cost` | Value copies may copy fields and increase work; large structs passed repeatedly can cost more than a carefully designed reference-based alternative. |
| `Array allocation and zero initialization` | Managed arrays are initialized to default values for safety; large arrays add allocation/initialization cost and may go to LOH. |
| `Object header and alignment implementation detail` | Runtime object headers, padding, and alignment are implementation details that can vary by architecture/runtime; do not promise a universal size. |
| `Object size measurement limitations` | Managed size tools observe runtime-specific layout and retained graph estimates; shallow size is not equivalent to total retained cost. |
| `LOH allocation impact` | Large objects are handled on LOH and collected with generation 2; frequent large allocations can add full-GC and fragmentation costs. |
| `Pinned object fragmentation` | Long-lived pins can prevent compaction around pinned objects and fragment movable heaps; minimize pin duration or consider supported POH allocation. |
| `Pinned object handle lifetime` | A pinned handle must remain allocated while native code relies on the address, then be freed exactly once. |
| `Pinning versus copying interop data` | Pinning avoids a copy but constrains GC movement; copying costs bandwidth/allocation but can simplify lifetime. Benchmark the complete interop call. |
| `Short-lived pinning versus long-lived pinning` | Brief pins are generally less disruptive; long-lived pins can impair compaction and should have a clear design justification. |
| `Array pooling break-even point` | Pooling helps when repeated allocation cost exceeds rent/return and retention/clearing costs; no universal size or frequency threshold exists. |
| `Pooling retained memory tradeoff` | Pools keep capacity available and can increase steady-state memory/working set even as allocation rate falls. |
| `Pool ownership and concurrent access` | A lease has one owner; concurrent access requires its own synchronization and returning while any user remains active is invalid. |
| `Clearing sensitive pooled buffers` | Clear secret material before release; stale pooled contents may be exposed to a later renter. Clearing adds CPU cost. |
| `Uninitialized memory security risk` | APIs that skip zeroing expose prior/undefined contents until overwritten; never read before complete initialization. |
| `Zero-initialization safety guarantee` | Managed allocations are default-initialized before exposure; avoid relying on this for native or explicitly uninitialized allocation APIs. |
| `Span-based parsing to avoid temporary strings` | `ReadOnlySpan<char>` can parse substrings by slicing existing string storage without creating each substring; returned values must obey lifetime rules. |
| `Memory<T> across async suspension` | Heap-capable `Memory<T>` can be retained across awaits, but the backing owner must remain alive and not return/reuse the buffer. |
| `Span<T> cannot be used across an async suspension boundary` | A span cannot be live across `await`; C# 13 permits a ref-struct local in an async method only when it is not used across suspension. |
| `Buffer ownership transfer` | Passing a view is not an ownership transfer; define who may mutate, retain, and release the backing storage. |
| `IMemoryOwner<T> disposal contract` | Dispose ends the owned memory lease; derived views become invalid for use even if they still physically reference storage. |
| `ArraySegment<T> versus Memory<T>` | Both describe array-backed ranges; `Memory<T>` composes with span APIs and non-array memory managers, while `ArraySegment<T>` specifically describes an array slice. |
| `ArraySegment<T> versus Span<T>` | `ArraySegment<T>` is heap-storable metadata over an array; `Span<T>` is a stack-only view over broader contiguous memory. |
| `Memory<T> versus Span<T>` | `Memory<T>` can cross async/heap boundaries; `Span<T>` is a stack-only synchronous view and can expose ref access efficiently. |
| `Safe memory access versus unsafe pointer access` | Safe views enforce bounds/lifetime constraints; pointers enable interop/performance cases but transfer proof obligations to the programmer. |
| `stackalloc versus ArrayPool<T>` | `stackalloc` offers conservatively small, bounded stack storage with strict lifetime limits; available stack size is environment-dependent. Pool rent serves reusable buffers but needs return discipline. |
| `Optimize allocations after measurement` | Profile representative workload and fix a demonstrated bottleneck; avoid speculative micro-optimization that obscures ownership. |
| `Avoid pooling tiny or infrequent allocations without evidence` | Pool bookkeeping, clearing, retained capacity, and complexity can exceed the cost of ordinary allocation. |
| `Avoid manual GC.Collect in normal application flow` | Explicit collection usually adds pauses without fixing reachable retention; use diagnostics and correct ownership instead. |

# Cross-item comparison

| Comparison | Decision rule |
|---|---|
| Allocation rate / retained heap | High rate with stable heap suggests churn; rising retained heap suggests growing reachable graphs or caches. |
| Pin / copy | Pin when a stable address is required and lifetime can be short; copy when it simplifies a bounded boundary and measured cost is acceptable. |
| Pool / allocate | Pool only when repeated use justifies retained memory and lease complexity. |
| `Span<T>` / `Memory<T>` | Use a span inside synchronous bounded work; use memory when a view must be stored or cross async boundaries. |
| `stackalloc` / `ArrayPool<T>` | Stack allocation for small bounded temporary data; pooling for larger reusable buffers with explicit ownership. |

# Examples

```csharp
static int ParseFields(ReadOnlySpan<char> line, Span<int> destination)
{
    int written = 0;
    foreach (Range range in line.Split(','))
    {
        if (written == destination.Length)
            throw new ArgumentException("Destination is too short.", nameof(destination));

        ReadOnlySpan<char> field = line[range];
        if (!int.TryParse(field, out destination[written]))
            throw new FormatException($"Invalid integer field: {field.ToString()}");
        written++;
    }
    return written;
}
```

The span slices the original line rather than allocating a string for every token. The interpolation on the error path can allocate, which is usually acceptable because invalid input is exceptional; optimize only if profiling shows otherwise.

# Common mistakes

- Calling rising allocation rate a memory leak without inspecting post-collection retained objects and roots.
- Assuming a smaller allocation count always improves end-to-end latency; pooling can increase retained memory and synchronization.
- Using `Memory<T>` after its `IMemoryOwner<T>` is disposed or using a pooled array after return.
- Pinning a buffer for an unbounded native operation when a copy or POH allocation would fit better.
- Depending on a fixed object-header size or a single runtime's struct/array layout.
- Using `stackalloc` with input-controlled sizes or inside an unbounded loop.
- Skipping initialization and then reading pooled or uninitialized data.

# Knowledge checks with answers

1. **Can allocation rate be high without a leak?** Yes; short-lived objects can create churn while retained heap stays stable.
2. **Can a low allocation rate hide a leak?** Yes; a few long-lived roots can retain a large graph without continued allocation.
3. **Why may pooling increase memory usage?** The pool retains buffers for reuse and may keep more capacity than active demand requires.
4. **When is pinning justified?** When a stable address is needed and the pin can be scoped, measured, and safely released.
5. **Why avoid universal object-size claims?** Layout, headers, and alignment are runtime and architecture implementation details.
