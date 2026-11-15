<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# memory spans allocation garbage collection pooling and diagnostics — Reference: Contiguous memory views, slicing, stack allocation, and lifetime constraints

# Scope and version

*Automatically generated draft.*

This reference lesson covers contiguous memory views, slicing, stack allocation, and lifetime constraints in .NET 11 GA and C# 15 stable memory APIs (checked 2026-11-14). The inventory focuses strictly on types like `Span<T>`, `Memory<T>`, and related slicing, pinning, and helper APIs used to manage memory efficiently without unnecessary heap allocations.

For background on the broader ecosystem, see the official documentation on [Microsoft .NET memory and spans](https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/) and [GC fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals).

# How this group fits the mental model

In managed languages, objects typically reside on the garbage-collected heap. While this protects developers from manual memory management errors, creating many short-lived buffers or splitting large arrays can put pressure on the garbage collector. 

Contiguous memory views solve this problem by letting you inspect and manipulate subsets of existing arrays, strings, or stack memory without copying data or creating new heap objects. 
- **Stack-only views (`Span<T>`, `ReadOnlySpan<T>`)**: Fast, lightweight `ref struct` views that cannot escape to the heap or be stored in ordinary class fields. Through C# 12, they could not be local variables in async methods. Starting in C# 13, they can be declared and used in async methods when their scope and use do not cross an `await` suspension boundary.
- **Heap/async-capable views (`Memory<T>`, `ReadOnlyMemory<T>`)**: Wrapper structures that can be stored on the heap, passed across `async/await` boundaries, and converted into spans when synchronous work is needed.
- **Lifetimes and safety**: Because these types are only windows into underlying storage, they do not own that storage. The backing buffer must remain alive as long as any view references it.

# Supplied names explained

Below is the complete inventory of assigned names for this group. Every item is explained in its exact form:

* `System.Span<T>`: A ref struct representing a type-safe, contiguous region of arbitrary memory. It provides fast access to managed arrays, native memory, or stack-allocated buffers without heap allocations.
* `System.ReadOnlySpan<T>`: A ref struct representing a read-only, contiguous view over arbitrary memory. It prevents modification of the underlying data.
* `System.Memory<T>`: A structure representing a contiguous region of memory, similar to `Span<T>`, but not restricted to the stack. It can be stored on the heap and used across asynchronous operations.
* `System.ReadOnlyMemory<T>`: A read-only, heap-capable structure representing a contiguous region of memory, safe for asynchronous and long-lived storage scenarios.
* `System.Buffers.MemoryHandle`: A handle that pins the underlying memory of a `Memory<T>` or `ReadOnlyMemory<T>`, preventing the garbage collector from moving it until the handle is disposed.
* `System.Buffers.IMemoryOwner<T>`: An interface representing the owner of a block of memory, responsible for disposing of the memory buffer when it is no longer needed.
* `Span<T>.Empty`: A static property returning a zero-length `Span<T>` with a null pointer.
* `Span<T>.Length`: A property returning the number of items contained within the span.
* `Span<T>.IsEmpty`: A property returning a boolean value indicating whether the span's length is zero.
* `Span<T>.this[Int32]`: An indexer that returns a reference to the element at the specified zero-based index.
* `Span<T>.Slice(Int32)`: Overload that forms a slice out of the current span, starting at a specified index to the end of the span.
* `Span<T>.Slice(Int32,Int32)`: Overload that forms a slice out of the current span, starting at a specified index for a specified length.
* `Span<T>.ToArray()`: Copies the contents of the span into a newly allocated managed array on the heap.
* `Span<T>.CopyTo(Span<T>)`: Copies the contents of this span into a destination span, throwing `ArgumentException` when the destination is shorter than the source. A longer destination is allowed; overlapping source and destination ranges are supported.
* `Span<T>.TryCopyTo(Span<T>)`: Attempts to copy the entire source into the destination and returns `false` without writing if the destination is too short; overlapping ranges are supported.
* `Span<T>.Clear()`: Sets the contents of the span to default values (`0` or `null`).
* `Span<T>.Fill(T)`: Fills every element of the span with the specified value.
* `Span<T>.IndexOf(T)`: Searches for the specified value and returns the index of its first occurrence.
* `Span<T>.IndexOfAny`: Searches the span for any of the specified items, returning the first matching index.
* `Span<T>.LastIndexOf(T)`: Searches for the specified value and returns the index of its last occurrence.
* `Span<T>.SequenceEqual(ReadOnlySpan<T>)`: Determines whether two sequences are equal by comparing their elements item by item.
* `Span<T>.StartsWith(ReadOnlySpan<T>)`: Determines whether the span starts with the specified sequence.
* `Span<T>.EndsWith(ReadOnlySpan<T>)`: Determines whether the span ends with the specified sequence.
* `Span<T>.Overlaps(Span<T>)`: Determines whether the specified span overlaps with the current span in memory.
* `ReadOnlySpan<T>.CopyTo(Span<T>)`: Copies the full source into the destination; throws `ArgumentException` if the destination is shorter. Overlap is supported.
* `ReadOnlySpan<T>.TryCopyTo(Span<T>)`: Attempts the full copy, returning `false` without writing if the destination is shorter; overlap is supported.
* `ReadOnlySpan<T>.ToArray()`: Copies the read-only span's contents into a new managed array.
* `ReadOnlySpan<T>.Slice(Int32)`: Forms a slice out of the read-only span from a specified index to the end.
* `ReadOnlySpan<T>.Slice(Int32,Int32)`: Forms a slice out of the read-only span starting at a specified index for a specified length.
* `Memory<T>.Length`: Returns the number of items in the memory region.
* `Memory<T>.IsEmpty`: Returns a boolean indicating whether the memory region has a length of zero.
* `Memory<T>.Span`: Creates a `Span<T>` view over the underlying memory region for synchronous operations.
* `Memory<T>.Slice(Int32)`: Forms a slice out of the memory region from a specified index to the end.
* `Memory<T>.Slice(Int32,Int32)`: Forms a slice out of the memory region starting at an index for a specified length.
* `Memory<T>.Pin()`: Pins the underlying memory buffer so the garbage collector cannot relocate it, returning a `MemoryHandle`.
* `Memory<T>.CopyTo(Memory<T>)`: Copies the source into the destination; throws `ArgumentException` if the destination is shorter than the source. Overlap is supported.
* `Memory<T>.TryCopyTo(Memory<T>)`: Attempts to copy into the destination and returns `false` without writing if the destination is shorter; overlap is supported.
* `Memory<T>.ToArray()`: Copies the memory region's contents into a newly allocated heap array.
* `ReadOnlyMemory<T>.CopyTo(Memory<T>)`: Copies the read-only source into a writable destination; throws `ArgumentException` if the destination is shorter. Overlap is supported.
* `ReadOnlyMemory<T>.TryCopyTo(Memory<T>)`: Attempts the copy and returns `false` without writing if the destination is shorter; overlap is supported.
* `ReadOnlyMemory<T>.Span`: Creates a `ReadOnlySpan<T>` view over the underlying memory region.
* `ReadOnlyMemory<T>.Slice(Int32)`: Forms a slice out of the read-only memory region from a specified index.
* `ReadOnlyMemory<T>.Slice(Int32,Int32)`: Forms a slice out of the read-only memory region starting at an index for a length.
* `ReadOnlyMemory<T>.Pin()`: Pins the read-only memory buffer and returns a `MemoryHandle`.
* `MemoryHandle.Pointer`: Retrieves a pointer to the pinned memory buffer (unsafe context).
* `MemoryHandle.Dispose()`: Releases the pin on the memory buffer, allowing the garbage collector to move it again.
* `IMemoryOwner<T>.Memory`: Retrieves the `Memory<T>` instance owned by this object.
* `IMemoryOwner<T>.Dispose() ownership transfer`: Disposes the underlying memory resource, often returning pooled buffers to their source pool.
* `Span<T> ref struct lifetime restriction`: A `ref struct` cannot escape to the heap, be boxed, or be captured. Before C# 13, it could not be a local in an async method. C# 13 permits ref-struct locals in async methods provided they are not used across an `await` boundary.
* `Span<T> cannot be boxed`: Prevents `Span<T>` from being converted into `object`, `ValueType`, or interface types.
* `Span<T> cannot be captured by lambda`: Prevents `Span<T>` instances from escaping their current stack frame via closures.
* `Span<T> cannot be stored in ordinary class field`: Prevents `Span<T>` from living inside reference types on the heap, ensuring it remains stack-bound.
* `Span<T> synchronous API parameter guideline`: Use `Span<T>` or `ReadOnlySpan<T>` for high-performance, synchronous method parameters.
* `Memory<T> asynchronous API parameter guideline`: Use `Memory<T>` or `ReadOnlyMemory<T>` when parameters must cross `await` boundaries or persist across asynchronous callbacks.
* `ReadOnlySpan<T> input-only API guideline`: Use `ReadOnlySpan<T>` for parameters that read data without modifying it, accepting inputs from arrays, strings, or stack memory.
* `Span<T> aliasing and overlapping slices`: Slices pointing to the same backing buffer can alias each other; modifying one slice affects overlapping views.
* `Span<T> slicing does not copy underlying data`: Slicing creates a lightweight pointer/length adjustment without duplicating elements.
* `Span<T> bounds checking`: Runtime checks ensure that indexing or slicing outside valid span boundaries throws an exception.
* `stackalloc expression`: Allocates memory directly on the execution stack.
* `stackalloc Span<T> in safe context`: Allocates stack memory and assigns it directly to a `Span<T>` in safe code without requiring `unsafe` blocks.
* `stackalloc pointer in unsafe context`: Allocates stack memory as a raw pointer in an `unsafe` context.
* `Stack allocation size limits`: Excessive stack allocation risks `StackOverflowException`; keep sizes small (typically under a few kilobytes).
* `stackalloc inside loop risk`: Allocating stack memory repeatedly inside a loop can exhaust stack space quickly.
* `Collection expression to Span<T>`: Allows collection expressions (like `[1, 2, 3]`) to initialize a stack-allocated span directly.
* `Array.AsSpan()`: Extension method or helper returning a span wrapping an entire array.
* `String.AsSpan()`: Returns a `ReadOnlySpan<char>` wrapping the characters of a string without allocation.
* `String.AsMemory()`: Returns a `ReadOnlyMemory<char>` wrapping the characters of a string.
* `MemoryExtensions.AsSpan`: Helper method providing span conversion views over arrays and strings.
* `MemoryExtensions.AsMemory`: Helper method providing memory conversion views over arrays.
* `MemoryExtensions.SequenceEqual`: Extension method comparing two spans or memory regions for equal elements.
* `MemoryExtensions.IndexOf`: Extension method searching for elements or sub-sequences within spans.
* `MemoryExtensions.Trim`: Extension method removing specified leading and trailing elements from a span.
* `MemoryExtensions.Split`: Extension method splitting a span into enumerated sub-spans using a delimiter.
* `MemoryExtensions.SplitAny`: Extension method splitting a span using any of multiple delimiters.
* `MemoryExtensions.Replace`: Extension method replacing elements in a span.
* `MemoryExtensions.Count`: Extension method counting occurrences of an element or sequence in a span.
* `MemoryExtensions.EnumerateRunes`: Extension method that enumerates Unicode runes from a character span.
* `MemoryExtensions.Equals(ReadOnlySpan<Char>,ReadOnlySpan<Char>,StringComparison)`: Compares two character spans using specified string comparison rules.
* `MemoryExtensions.CompareTo`: Compares two spans lexicographically.
* `ReadOnlySpan<char> string parsing without allocation`: Parsing numbers, dates, or tokens from sub-strings using spans to avoid allocating temporary string objects.
* `Span<T> lifetime cannot outlive backing storage`: The span view must not persist longer than the array, stack frame, or native buffer that backs it.

# Cross-item comparison

Within this assigned group, items differ primarily in their lifetime restrictions, storage locations, and mutability:
- **`Span<T>` vs `Memory<T>`**: `Span<T>` is a stack-only `ref struct` optimized for high-speed, synchronous operations. `Memory<T>` can be stored on the heap and passed across `async/await` boundaries, at the cost of slight overhead.
- **`ReadOnlySpan<T>` vs `ReadOnlyMemory<T>`**: Mirrors the distinction above, enforcing read-only access while respecting stack-only (`ReadOnlySpan<T>`) versus heap-capable (`ReadOnlyMemory<T>`) constraints.
- **`Array.AsSpan()` / `String.AsSpan()` vs `ToArray()`**: Conversion methods like `AsSpan` create zero-allocation views over existing data, whereas `ToArray()` allocates a brand-new array on the managed heap.

# Examples

### Example 1: Basic String Slicing and Parsing Without Allocation

This snippet demonstrates how to parse numbers from a string using `ReadOnlySpan<char>` without allocating temporary substrings:

```csharp
ReadOnlySpan<char> logMessage = "ERROR: 404";
int colonIndex = logMessage.IndexOf(':');

if (colonIndex >= 0)
{
    // Slice the error code part without allocating a new string
    ReadOnlySpan<char> errorCodeSpan = logMessage.Slice(colonIndex + 2);
    
    if (errorCodeSpan.SequenceEqual("404"))
    {
        // Handle 404 error code
    }
}
```

### Example 2: Using `stackalloc` with Collection Expressions

This example shows how to use stack allocation safely in modern C#:

```csharp
void ProcessNumbers()
{
    // Allocate a small buffer on the stack using a collection expression
    Span<int> numbers = [1, 2, 3, 4, 5];
    
    numbers.Clear();
}
```

# Common mistakes

- **Using a span across an await**: C# 13 permits ref-struct locals inside async methods only when they do not cross an `await` boundary. Keep span work in a scope that ends before suspension, or use `Memory<T>` when the view must survive across an await. Older C# versions reject ref-struct locals in async methods.
- **Using `stackalloc` inside large loops**: Repeatedly allocating stack memory inside a tight loop can quickly exhaust available stack space, leading to a `StackOverflowException`.
- **Assuming slicing copies data**: Developers sometimes forget that modifying a `Span<T>` slice alters the underlying array or buffer because slicing only creates a window, not a duplicate.
- **Letting spans outlive their backing storage**: Assigning a span pointing to a temporary buffer or stack variable to a longer-lived context violates safety rules and results in undefined behavior or compiler errors.

# Knowledge checks with answers

1. **Question**: Why can `Span<T>` not be stored as a field in an ordinary reference class?
   * **Answer**: `Span<T>` is a `ref struct` constrained to live on the execution stack to prevent it from escaping into long-lived heap allocations where it could outlive its backing data.
2. **Question**: When should you choose `Memory<T>` over `Span<T>`?
   * **Answer**: Choose `Memory<T>` when you need to store the buffer in a class field, pass it across `await` boundaries in asynchronous methods, or place it in collections that require heap-allocated types.
3. **Question**: What happens to underlying data when you call `Span<T>.Slice()`?
   * **Answer**: Nothing is copied. Slicing only adjusts a pointer offset and length to provide a narrowed window over the existing memory.
