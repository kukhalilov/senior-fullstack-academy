
# memory spans allocation garbage collection pooling and diagnostics — Reference: Reachability, generations, heaps, collection modes, finalization, and GC control APIs

# Scope and version

This is the complete `garbage-collector-and-finalization` inventory for .NET 11 GA. GC APIs expose observations and narrowly defined controls; they do not replace ownership or deterministic disposal. See Microsoft's [GC fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals), [workstation/server GC guide](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc), [LOH guide](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap), and [GC API reference](https://learn.microsoft.com/en-us/dotnet/api/system.gc).

# How this group fits the mental model

The GC traces references from roots and reclaims unreachable managed objects. It cannot infer that an open file, native allocation, socket, or lock should be released now; those require deterministic ownership, normally `Dispose`/`SafeHandle`. Generations exploit the common short lifetime of many allocations. Finalization provides a last-resort cleanup path for unmanaged resources, but it is nondeterministic and adds retention/collection cost. Most `GC` methods are diagnostic or specialized control surfaces, not routine application flow.

# Supplied names explained

Every manifest item is listed verbatim. Runtime policies and thresholds are implementation choices and can vary; do not treat observed values as fixed contracts.

| Supplied name | Meaning and boundary |
|---|---|
| `Garbage collection roots` | References the runtime treats as starting points for liveness analysis, such as stack/register roots, statics, and handles. |
| `Reachability and object liveness` | An object is live while reachable through the traced graph from roots; dropping one local reference does not guarantee immediate collection. |
| `Managed heap` | Runtime-managed object storage reclaimed by GC; not the same as process working set or all committed memory. |
| `Small object heap (SOH)` | Heap area for ordinary managed allocations that are below the runtime's large-object threshold. |
| `Large object heap (LOH)` | Heap area for large objects; typically collected with generation 2 and has distinct allocation/fragmentation behavior. |
| `Pinned object heap (POH)` | Heap for objects allocated pinned through supported APIs, designed to reduce disruption from long-lived pins on other heaps. |
| `Generation 0` | Youngest generation, frequently collected and intended for short-lived objects. |
| `Generation 1` | Intermediate generation that separates survivors from new allocations. |
| `Generation 2` | Long-lived generation, collected during full collections; LOH is collected with it. |
| `Ephemeral generations` | Generations 0 and 1, which are collected more frequently than generation 2. |
| `Promotion and survival` | A reachable object can survive a collection and be promoted to an older generation; promotion does not mean it is permanently retained. |
| `LOH collected with generation 2` | LOH collection is associated with generation-2/full GC; large allocations can therefore affect costly collection behavior. |
| `Allocation threshold adaptive policy` | Runtime adjusts collection triggers based on observed pressure and environment; there is no fixed per-process threshold to code against. |
| `Background garbage collection` | A mode that performs some generation-2 work concurrently with managed threads while still using pauses for required phases. |
| `Blocking garbage collection` | A collection phase that suspends managed execution; “blocking” describes pauses, not a user call specifically. |
| `Workstation garbage collection` | GC configuration aimed at client responsiveness and typically a different heap/thread strategy from server GC. |
| `Server garbage collection` | Configuration using multiple heaps/collector threads to improve throughput on multiprocessor servers, with higher resource tradeoffs. |
| `Concurrent garbage collection` | Collection work overlaps application execution for supported phases; it does not mean all GC work is pause-free. |
| `SustainedLowLatency GC latency mode` | Requests a lower-latency policy for a sustained interval, trading collection behavior and memory use; it is not a no-pause guarantee. |
| `Interactive GC latency mode` | Default-style responsiveness policy for interactive workloads, balancing pause duration and throughput. |
| `Batch GC latency mode` | Favors throughput over latency, appropriate to batch work where longer pauses are acceptable. |
| `NoGCRegion latency mode` | A bounded interval in which the runtime attempts not to collect; allocation budget and exit requirements make it specialized. |
| `GC.Collect()` | Requests a collection; forcing it can hurt throughput and usually should not be used as routine performance tuning. |
| `GC.Collect(Int32,GCCollectionMode)` | Requests collection through a generation and mode. The request is policy-sensitive and does not guarantee a specific timing beyond API semantics. |
| `GC.Collect(Int32,GCCollectionMode,Boolean)` | Adds a blocking/nonblocking preference for the requested collection. Runtime support and result remain policy-dependent. |
| `GC.Collect(Int32,GCCollectionMode,Boolean,Boolean)` | Adds compaction control for applicable collection behavior; compaction can cost time and is not a general fragmentation fix. |
| `GC.GetGeneration(Object)` | Reports the object's current generation; it is a momentary diagnostic observation, not a lifetime guarantee. |
| `GC.GetTotalMemory(Boolean)` | Returns an estimate of bytes currently allocated on the managed heap excluding fragmentation. With `forceFullCollection: true`, it waits for a short interval to allow collection and finalization; it is neither allocation volume nor total process memory. |
| `GC.GetTotalAllocatedBytes(Boolean)` | Reports cumulative managed allocation volume since process start. With `precise: false`, the runtime may return a less precise but faster result; this does not request a collection. Allocation volume differs from retained heap. |
| `GC.CollectionCount(Int32)` | Returns the number of collections observed for a generation since process start. |
| `GC.GetGCMemoryInfo()` | Returns a snapshot of GC memory/collection information; interpret fields in the context of its collection index and kind. |
| `GC.GetGCMemoryInfo(GCKind)` | Requests information for a selected collection kind when available. |
| `GCMemoryInfo.HeapSizeBytes` | Heap size associated with the reported GC information, not process working set. |
| `GCMemoryInfo.FragmentedBytes` | Estimated fragmented bytes for the reported heap/collection snapshot; not automatically reclaimable memory. |
| `GCMemoryInfo.TotalAvailableMemoryBytes` | Runtime's estimate of memory available to the GC under current constraints. |
| `GCMemoryInfo.HighMemoryLoadThresholdBytes` | Threshold estimate at which the runtime considers memory load high; it is runtime/environment dependent. |
| `GCMemoryInfo.MemoryLoadBytes` | Runtime estimate of current memory load used in GC policy. |
| `GCMemoryInfo.PauseTimePercentage` | Reported percentage of time spent in GC pauses over the defined observation interval. |
| `GCMemoryInfo.Index` | Identifier/index for the GC event represented by this information. |
| `GCMemoryInfo.Generation` | Generation associated with the reported collection information. |
| `GCMemoryInfo.Compacted` | Indicates whether the represented collection compacted the heap as reported by the API. |
| `GC.GetAllocatedBytesForCurrentThread()` | Reports managed bytes allocated by the current thread; it excludes allocations by other threads and is useful for scoped measurements. |
| `GC.TryStartNoGCRegion(Int64)` | Attempts to start a no-GC region with a total allocation budget; returns false if it cannot be established. |
| `GC.TryStartNoGCRegion(Int64,Boolean)` | The Boolean is `disallowFullBlockingGC`: `true` forbids that preparatory full blocking collection; `false` allows it if needed. A successful region is still bounded by its budget and must be ended. |
| `GC.EndNoGCRegion()` | Ends the active no-GC region; it throws if no region is active or a GC occurred because the allocation budget/region conditions were violated. Calls cannot be nested, and call it only after a successful start. |
| `GC.RegisterForFullGCNotification` | Registers thresholds for receiving full-GC approach/completion notifications; not supported by all GC configurations. |
| `GC.WaitForFullGCApproach` | Waits for a registered notification that a full collection is approaching; returns a status and may time out. |
| `GC.WaitForFullGCComplete` | Waits for a registered full collection to complete; not a substitute for controlling allocation. |
| `GC.CancelFullGCNotification` | Cancels a prior notification registration. |
| `GC.AddMemoryPressure(Int64)` | Informs the GC about significant unmanaged memory associated with a managed object so collection policy can account for it; pair with removal. |
| `GC.RemoveMemoryPressure(Int64)` | Removes previously reported unmanaged-memory pressure; values must balance the corresponding additions. |
| `GC.KeepAlive(Object)` | Ensures an object remains live through the call point, useful when native code uses a resource whose managed wrapper might otherwise be finalized early. |
| `GC.SuppressFinalize(Object)` | Prevents finalizer execution after deterministic cleanup has completed, commonly from `Dispose`. |
| `GC.ReRegisterForFinalize(Object)` | Re-registers an object for finalization after suppression; specialized and rarely needed. |
| `GC.WaitForPendingFinalizers()` | Blocks until queued finalizers complete; can stall and should be limited to specialized shutdown/testing scenarios. |
| `GCSettings.IsServerGC` | Reports whether server GC is enabled in the process. |
| `GCSettings.LatencyMode` | Gets or sets the requested GC latency mode subject to runtime/configuration constraints. |
| `GCSettings.LargeObjectHeapCompactionMode` | Gets or sets the LOH compaction policy for a future applicable full collection. |
| `GCLargeObjectHeapCompactionMode.Default` | Uses the runtime's default LOH compaction behavior. |
| `GCLargeObjectHeapCompactionMode.CompactOnce` | Requests one LOH compaction during a future full blocking collection. |
| `GCCollectionMode.Default` | Uses default collection policy. |
| `GCCollectionMode.Forced` | Requests a forced collection; explicit force still has significant performance risk. |
| `GCCollectionMode.Optimized` | Lets the runtime decide whether collection is appropriate based on current conditions. |
| `GCCollectionMode.Aggressive` | Requests an aggressive collection policy where supported; use only for specialized cases. |
| `GCKind.Any` | Selects any GC kind for a memory-info query. |
| `GCKind.Ephemeral` | Selects ephemeral collections (generations 0/1) for a memory-info query. |
| `GCKind.FullBlocking` | Selects full blocking collection information. |
| `Finalizer method` | Runtime-invoked cleanup hook when an object becomes eligible; timing/order are nondeterministic and finalization delays reclamation. |
| `Finalization queue` | Runtime bookkeeping for objects awaiting finalization; queued objects remain retained until finalization processing permits reclamation. |
| `Finalization resurrection and extra collection cost` | A finalizer may restore reachability (resurrection), requiring further GC work; designs should avoid resurrection. |
| `Critical finalizer and CriticalFinalizerObject` | Specialized finalization ordering support for critical resource wrappers; prefer `SafeHandle` patterns over custom finalizers. |
| `WeakReference<T>` | Holds a non-rooting reference that permits collection; retrieve the target temporarily rather than assuming it remains alive. |
| `WeakReference<T>.TryGetTarget` | Attempts to obtain a currently live target; success gives a strong local reference for the operation. |
| `WeakReference(Boolean trackResurrection)` | Non-generic weak reference option controlling whether the target remains observable after finalization until the resurrection stage. |
| `ConditionalWeakTable<TKey,TValue>` | Associates values with key object lifetimes without keeping keys alive solely through the table; suited to metadata attached to objects. |
| `Object resurrection` | A finalizer or other mechanism makes an otherwise unreachable object reachable again; avoid relying on this subtle lifecycle. |
| `IDisposable versus finalizer` | `Dispose` is deterministic caller-controlled cleanup; a finalizer is nondeterministic fallback and should not replace disposal. |
| `SafeHandle finalization pattern` | `SafeHandle` encapsulates native-handle release and critical finalization behavior; consumers should dispose it deterministically. |
| `Large object allocation threshold` | Runtime-defined threshold separating LOH allocations; do not bake a precise threshold into portable assumptions. |
| `LOH fragmentation` | Free-space holes in LOH can make allocation difficult despite aggregate free bytes; inspect evidence before requesting compaction. |
| `POH pinning allocation` | Supported pinned-array allocation routes storage to POH; it still consumes memory and should be chosen for stable-address requirements. |

# Cross-item comparison

| Pair | Distinction |
|---|---|
| SOH / LOH / POH | Ordinary small allocations; large allocations collected with gen 2; pinned allocations with a stable-address policy. |
| Workstation / Server GC | Responsiveness-oriented versus throughput-oriented configuration, with different CPU and memory costs. |
| `Dispose` / finalizer | Deterministic cleanup now versus nondeterministic fallback later. |
| Allocation / retention | Bytes allocated measure churn; retained heap measures live object graph after collection. |
| `GC.Collect` / observation APIs | Collection forces a policy event; counters and memory-info APIs observe behavior with less intervention. |

# Examples

```csharp
sealed class NativeResource : IDisposable
{
    private SafeHandle? _handle;

    public void Dispose()
    {
        _handle?.Dispose();
        _handle = null;
        GC.SuppressFinalize(this); // relevant only if this type has its own finalizer
    }
}
```

In production, prefer holding a concrete `SafeHandle` type and ensure it is initialized correctly. Most managed classes should not define finalizers. For a memory measurement, record allocation rate and post-workload retained heap using runtime diagnostics rather than forcing `GC.Collect` and treating one number as the answer.

# Common mistakes

- Assuming unreachable means “collected immediately” or that `GetGeneration` predicts when an object dies.
- Treating process working set, managed heap size, committed bytes, allocation volume, and retained live bytes as interchangeable.
- Calling `GC.Collect()` to fix a leak; references still reachable from roots remain live.
- Using a finalizer for ordinary managed cleanup or expecting finalizers to run in a particular order/time.
- Forgetting to pair `AddMemoryPressure`/`RemoveMemoryPressure` or to dispose native handles deterministically.
- Assuming `NoGCRegion` is unlimited or safe if its budget is exceeded.
- Interpreting a requested GC latency mode or compaction flag as an absolute runtime guarantee.

# Knowledge checks with answers

1. **What makes an object live?** Reachability from GC roots at collection analysis time.
2. **Does gen 2 mean permanent?** No; a later full collection can reclaim the object if it is unreachable.
3. **Does finalization replace `Dispose`?** No. Finalization is delayed fallback; deterministic cleanup belongs to the owner.
4. **What does `GC.GetTotalAllocatedBytes` measure?** Cumulative managed allocation volume, not current retained heap or total process memory.
5. **When is `GC.Collect` appropriate?** Rare specialized scenarios with a measured, defensible reason; it is not routine tuning.
