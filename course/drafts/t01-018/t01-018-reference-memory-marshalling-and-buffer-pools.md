<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# memory spans allocation garbage collection pooling and diagnostics — Reference: ArrayPool, MemoryPool, MemoryMarshal, Buffer, pinning, and unmanaged allocation boundaries

# Scope and version

This lesson covers the exact `memory-marshalling-and-buffer-pools` inventory for .NET 11 GA and C# 15 stable APIs. The central rule is ownership: every buffer has an owner, a valid-use interval, and a release action. The [memory and spans guide](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/), [ArrayPool API](https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1), [MemoryMarshal API](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.memorymarshal), and [NativeMemory API](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.nativememory) are the source references.

# How this group fits the mental model

An array pool lends an array; it does not transfer ownership permanently. A memory pool commonly lends an `IMemoryOwner<T>` whose disposal returns/releases its storage. `MemoryMarshal`, `Buffer`, pinning, and native allocation bridge representations and runtime boundaries. These lower-level tools can reduce copying or allocation, but move lifetime, bounds, initialization, and cleanup obligations to the caller. Prefer ordinary spans and safe managed ownership unless measurements or interop requirements justify crossing the boundary.

# Supplied names explained

Each item below is reproduced exactly from the manifest. Related methods are explained together where their behavior is the same, with differences called out.

| Supplied name | Meaning and important boundary |
|---|---|
| `ArrayPool<T>` | Abstract reusable-array lending service. A rented array must be returned to the same pool after its last use. |
| `ArrayPool<T>.Shared` | Process-wide shared pool for general use; it may retain arrays for reuse and is not an ownership mechanism for concurrent use of one array. |
| `ArrayPool<T>.Create()` | Creates a configurable pool; custom sizing/retention is a policy choice and should be based on workload evidence. |
| `ArrayPool<T>.Rent(Int32)` | Returns an array whose length is at least the requested minimum; it can be larger and its contents can be stale. |
| `ArrayPool<T>.Return(T[],Boolean)` | Ends the caller's lease. `clearArray: true` requests clearing before reuse where the pool retains it; it is not a replacement for deliberately clearing sensitive data before releasing ownership. |
| `ArrayPool<T> returned-buffer ownership rule` | Only the current borrower may use the array; after return, treat every reference as invalid because another renter may receive it. |
| `ArrayPool<T> rented length may exceed requested length` | Always track the logical data length separately; never process the entire rented array as if every slot were input. |
| `ArrayPool<T> contents are not guaranteed initialized` | Clear or overwrite every element that will be read. Pooling does not promise zeroed buffers. |
| `ArrayPool<T> clearArray security option` | Requests clearing on return if the pool stores the array. For secrets, ensure clearing occurs before ownership ends and account for copies elsewhere. |
| `ArrayPool<T> return exactly once rule` | Double return can cause the same array to be leased to two callers; encode the lease in one `try/finally` or one disposable owner. |
| `ArrayPool<T> use-after-return hazard` | A stale alias can observe another caller's data or corrupt its work; do not retain spans, memories, or closures over returned storage. |
| `MemoryPool<T>` | Abstract provider of disposable memory leases; use its owner to make release explicit. |
| `MemoryPool<T>.Shared` | Shared default pool. `Rent` still returns an ownership-bearing object that must be disposed. |
| `MemoryPool<T>.Rent(Int32)` | Requests at least a minimum buffer size and returns an owner; inspect `owner.Memory.Length` rather than assuming an exact size. |
| `IMemoryOwner<T> ownership and disposal` | The owner controls the lease. Dispose once, and stop using its `Memory` and all derived views afterward. |
| `MemoryPool<T> custom implementation` | An application/provider-specific pool can impose storage and lifetime policy; callers must honor the interface contract rather than assume arrays or exact sizes. |
| `MemoryMarshal.AsBytes<T>` | Reinterprets a span of unmanaged-compatible values as bytes without copying; byte order, padding, and representation are platform/runtime concerns, not a portable serialization format. |
| `MemoryMarshal.Cast<TFrom,TTo>` | Reinterprets a span's storage as another element type where constraints permit; resulting length is derived from byte capacity and partial trailing bytes are not exposed as an element. |
| `MemoryMarshal.CreateSpan<T>` | Creates a span from a reference and length. Caller must guarantee the reference points to enough live contiguous storage for the entire span. |
| `MemoryMarshal.CreateReadOnlySpan<T>` | Read-only counterpart to `CreateSpan`; read-only access does not make the underlying storage immutable to other aliases. |
| `MemoryMarshal.GetReference<T>` | Gets a by-reference to the first element, including for empty spans; an empty span's reference must not be dereferenced. |
| `MemoryMarshal.TryGetArray<T>` | Attempts to recover an `ArraySegment<T>` from `ReadOnlyMemory<T>` backed by an array; failure is normal for other memory managers. |
| `MemoryMarshal.TryGetMemoryManager<T,TManager>` | Attempts to expose the underlying custom memory manager and range; callers must respect that manager's own lifetime/ownership rules. |
| `MemoryMarshal.TryGetString` | Attempts to recover a backing string and character range from `ReadOnlyMemory<char>`; success gives read-only string storage, not mutable characters. |
| `MemoryMarshal.GetArrayDataReference<T>` | Obtains a reference to an array's first data element without ordinary bounds checking; use only with carefully proved bounds and lifetime. |
| `MemoryMarshal.CreateFromPinnedArray<T>` | Creates memory tied to a pinned array and a supplied range; pinning and disposal/lifetime must be controlled, and this is not a general substitute for `Memory<T>`. |
| `MemoryMarshal.Read<T>` | Reads a value of `T` from a span's bytes; source must contain enough bytes and layout/endianness must match the intended representation. |
| `MemoryMarshal.Write<T>` | Writes a value's raw representation to a span; destination must be large enough and representation is not automatically portable. |
| `MemoryMarshal.TryRead<T>` | Attempts a raw read and reports failure when the source is too short, avoiding an exception for that size mismatch. |
| `MemoryMarshal.TryWrite<T>` | Attempts a raw write and reports failure when the destination is too short. |
| `MemoryMarshal.AsRef<T>` | Reinterprets the first bytes as a reference to `T`; alignment, size, type safety, and lifetime are caller obligations. Prefer safe typed APIs. |
| `MemoryMarshal.GetStringDataReference` | Obtains a by-reference to a string's character storage for specialized low-level use; the string remains immutable and the reference must not be used to mutate it. |
| `MemoryMarshal.ToEnumerable<T>` | Adapts a span to an enumerable; enumeration is deferred over the referenced storage and does not make the span escape its permitted lifetime in supported usage. |
| `Buffer.BlockCopy` | Copies raw bytes between primitive arrays using byte offsets/counts; it is not element-wise conversion and does not define serialization byte order. |
| `Buffer.MemoryCopy` | Unsafe pointer-based byte copy. Validate source/destination sizes, pointer validity, and overlap assumptions required by the overload. |
| `Buffer.ByteLength(Array)` | Returns byte length for supported primitive arrays; it is not a general object-size or arbitrary array-layout API. |
| `Buffer.GetByte(Array,Int32)` | Reads one byte by byte offset from a supported primitive array. |
| `Buffer.SetByte(Array,Int32,Byte)` | Writes one byte at a byte offset in a supported primitive array; bounds and representation effects matter. |
| `GCHandle` | Explicit handle that controls how a managed object is tracked by the runtime; it is a resource and must be freed. |
| `GCHandle.Alloc(Object,GCHandleType)` | Allocates a handle with a selected rooting/pinning/weak-reference policy. Choose the least powerful kind that meets the interop need. |
| `GCHandle.Free()` | Releases the handle. Calling code must ensure it has not already been freed and that native consumers no longer rely on it. |
| `GCHandle.Target` | Gets or sets the associated object where applicable; a normal handle roots the target, while weak handles do not provide that same strong-liveness guarantee. |
| `GCHandle.AddrOfPinnedObject()` | Returns an address usable only while the object is pinned and alive; free the handle only after native code stops using it. |
| `GCHandleType.Normal` | Strong handle that keeps an object reachable but does not pin it at a stable address. |
| `GCHandleType.Pinned` | Strong handle plus pinning, preventing relocation while held; long-lived pins can harm GC heap behavior. |
| `GCHandleType.Weak` | Weak handle that does not keep the object alive; target may disappear during collection. |
| `GCHandleType.WeakTrackResurrection` | Weak handle that remains available through ordinary finalization and is cleared later in the resurrection cycle; rarely needed. |
| `fixed statement` | Temporarily pins a movable managed object while a pointer is in use; keep the scope short and never let the pointer escape it. |
| `fixed buffer pinning` | A fixed-size buffer field has special unsafe layout rules; pin the containing storage before taking a pointer and obey its declared capacity. |
| `fixed local initialization from Span<T>` | C# permits fixed initialization from supported span forms to obtain a pointer for a bounded scope; the span's backing memory and pinning semantics govern validity. |
| `fixed statement pin lifetime` | The pin lasts only for the fixed block; native code must not retain the pointer beyond that interval. |
| `GC.AllocateArray<T>(Int32,Boolean)` | Allocates a managed array, with the Boolean selecting pinned allocation when requested and supported. |
| `GC.AllocateUninitializedArray<T>(Int32,Boolean)` | May skip zero-initialization for eligible arrays to reduce cost; callers must initialize every value before reading, and the option is not a security shortcut. |
| `GC.AllocateArray<T> pinned allocation and POH` | Pinned allocation places supported arrays on the pinned object heap (POH), reducing movement concerns but not eliminating lifetime, size, or pinning-cost tradeoffs. |
| `NativeMemory.Alloc(UIntPtr)` | Allocates uninitialized native memory; check for allocation failure as required by the API contract and initialize before reading. |
| `NativeMemory.AllocZeroed(UIntPtr)` | Allocates native memory initialized to zero. Caller still owns and must free it. |
| `NativeMemory.Realloc(Void*,UIntPtr)` | Resizes a native allocation; the returned pointer may differ, and failure/ownership handling must preserve the original allocation according to API semantics. |
| `NativeMemory.Free(Void*)` | Releases compatible native allocation; pair allocation and free exactly once and never use the pointer afterward. |
| `NativeMemory.AlignedAlloc(UIntPtr,UIntPtr)` | Allocates native storage with requested alignment; alignment and size constraints must be valid. |
| `NativeMemory.AlignedFree(Void*)` | Releases memory allocated by the aligned allocator; pair the matching allocator/free family. |
| `NativeMemory.Clear(Void*,UIntPtr)` | Clears a native byte region; pointer must designate the full valid region. |
| `NativeMemory.Fill(Void*,UIntPtr,Byte)` | Fills a native byte region with one byte value; validate pointer and length. |
| `SafeBuffer` | Safe-handle-based abstraction for unmanaged buffers with bounds-aware pointer access; it still requires correct initialization and acquire/release pairing. |
| `SafeBuffer.AcquirePointer` | Acquires a pointer while holding the safe buffer's lifetime; pair with `ReleasePointer` in `finally`. |
| `SafeBuffer.ReleasePointer` | Releases an acquired pointer reference so the safe handle can be closed when no longer in use. |
| `Marshal.AllocHGlobal(IntPtr)` | Allocates unmanaged memory from the HGlobal allocator family; it is uninitialized and must be freed with the matching API. |
| `Marshal.FreeHGlobal(IntPtr)` | Frees compatible `AllocHGlobal` memory. Never mix allocator families. |
| `Marshal.AllocCoTaskMem(Int32)` | Allocates unmanaged memory from the CoTaskMem family; interop contracts may require this allocator. |
| `Marshal.FreeCoTaskMem(IntPtr)` | Frees compatible CoTaskMem memory; match allocator and free operation exactly. |
| `NativeMemory ownership versus SafeHandle` | `NativeMemory` exposes manual pointer ownership; `SafeHandle`/`SafeBuffer` wrap release in deterministic and finalizer-safe lifetime management. Prefer a safe owner at API boundaries. |

# Cross-item comparison

| Choice | Use when | Ownership obligation |
|---|---|---|
| `ArrayPool<T>` | You need a reusable array and will manage its lease directly. | Return exactly once; stop using every alias. |
| `MemoryPool<T>` | You want a disposable memory owner abstraction, including custom memory managers. | Dispose the `IMemoryOwner<T>` exactly once. |
| `GCHandleType.Normal` / `Pinned` | Native code needs a managed object rooted, and possibly at a stable address. | Free the handle after native access ends; minimize pin duration. |
| `NativeMemory` | The API genuinely requires unmanaged allocation or explicit alignment. | Pair exact allocation/free families and guard every pointer/length. |
| `SafeBuffer` / `SafeHandle` | Native resource lifetime should be encapsulated safely. | Use acquire/release correctly; do not expose raw pointers beyond lease. |

# Examples

```csharp
using System.Buffers;

byte[] rented = ArrayPool<byte>.Shared.Rent(4096);
try
{
    int bytesWritten = FillBuffer(rented.AsSpan(0, 4096));
    Consume(rented.AsSpan(0, bytesWritten));
}
finally
{
    // Set clearArray to true when the pool should clear retained contents.
    ArrayPool<byte>.Shared.Return(rented, clearArray: true);
}

static int FillBuffer(Span<byte> destination) => destination.Length;
static void Consume(ReadOnlySpan<byte> input) { }
```

The requested capacity and logical written length are separate. In real code, ensure the writer cannot exceed the slice and that no derived view survives the return. For native memory, prefer a `SafeHandle`-derived owner or `SafeBuffer` wrapper over scattered raw allocation/free calls.

# Common mistakes

- Returning a pooled array while an async operation, callback, or span still uses it.
- Assuming `Rent(n)` returns exactly `n` initialized elements.
- Treating `MemoryMarshal` raw representation as a portable wire format; serialization must define endianness and layout explicitly.
- Keeping a pinned handle or `fixed` pointer longer than required.
- Mutating string storage through unsafe references; strings remain immutable by contract.
- Reading uninitialized output from `AllocateUninitializedArray` or `NativeMemory.Alloc`.
- Pairing `AllocHGlobal` with `FreeCoTaskMem`, freeing twice, or forgetting a native allocation on exceptional exit.

# Knowledge checks with answers

1. **Does `ArrayPool<T>.Rent(100)` promise an initialized array of length 100?** No. Length is at least 100 and contents are unspecified.
2. **Can a caller keep using an array after returning it?** No. Return ends the lease; another renter may immediately receive it.
3. **Does pinning make memory owned by native code?** No. It stabilizes an address temporarily; the managed owner and pin lifetime still govern validity.
4. **Can `MemoryMarshal.Read<T>` define a portable binary format?** No. It reads a runtime representation; explicit serialization must define field layout and byte order.
5. **What is the key difference between manual native allocation and SafeBuffer?** Manual allocation leaves cleanup and pointer validity to each caller; SafeBuffer encapsulates handle lifetime and pointer acquisition/release.
