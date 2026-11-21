
# C# statements, control flow, and exception-handling statement forms — Reference: Unsafe statement forms

# Scope and version
This lesson covers the `unsafe` and `fixed` statement forms in C#. These features are part of the C# 15 language specification running on .NET 11 GA. Note that while these statements are stable, broader memory safety features in C# remain in preview as of the 2026-11-14 snapshot.

# How this group fits the mental model
In C#, the runtime (CLR) manages memory automatically. However, some performance-critical or low-level tasks require direct memory access, similar to languages like C or C++. An `unsafe` context permits pointer operations that the compiler cannot fully verify. It is not a sandbox and does not disable all runtime checks; it makes the programmer responsible for correct pointer use.

*   **`unsafe` statement**: Marks a block in which pointer types and operations are permitted, provided the project allows unsafe code.
*   **`fixed` statement**: Pins movable managed storage for the pointer lifetime so the GC does not relocate that storage while the pointer is in use.

# Supplied names explained

*   `unsafe statement`: This statement defines a block of code where pointer types and pointer-related operations are permitted. You cannot use pointers outside of an `unsafe` context. The compiler requires the project to be configured to allow unsafe code to compile this block.
*   `fixed statement`: This statement pins movable managed storage while a pointer is in use. The pointer is valid only for the pinning lifetime; after exit, the GC may move the storage.
* `fixed statement GetPinnableReference pattern`: A type can participate in a `fixed` initializer by exposing `GetPinnableReference`; the returned managed reference is pinned for the `fixed` scope.
* `fixed pinning lifetime does not make pointer use safe`: Pinning stabilizes an address only during the scope; bounds, lifetime, aliasing, and correct pointer arithmetic remain the programmer's responsibility.

# Cross-item comparison

| Feature | Primary Purpose | Scope |
| :--- | :--- | :--- |
| `unsafe` | Enables the use of pointers and unsafe operations. | Defines a block where unsafe code is permitted. |
| `fixed` | Pins memory to prevent the GC from moving an object. | Pins a specific variable for the duration of the block. |

A `fixed` statement producing a pointer is used in an unsafe context. It pins movable storage for the statement lifetime; this stabilizes the address but does not make pointer operations safe. C# also supports pinnable-reference patterns such as `GetPinnableReference`.

# Examples

```csharp
// Example: Pinning an array to access its memory directly
int[] numbers = { 1, 2, 3 };

unsafe 
{
    // 'fixed' pins the array so the GC doesn't move it
    fixed (int* p = numbers)
    {
        // We can now use pointer arithmetic
        int first = *p;
        int second = *(p + 1);
    } 
    // 'numbers' is unpinned here
}
```

# Common mistakes

1.  **Forgetting to enable unsafe code**: Even if you write the `unsafe` keyword, your project file must have `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` set, or the compiler will reject the code.
2.  **Accessing pointers after the `fixed` block**: Once the `fixed` block ends, the address is no longer guaranteed to remain stable. Do not use a pointer to movable managed data beyond the pinning lifetime.
3.  **Overusing `unsafe`**: Unsafe contexts relax compile-time pointer safety checks; the GC and other runtime services still operate. Use pointers only when required for interop or measured low-level needs, and maintain bounds, lifetime, and ownership invariants yourself.

# Knowledge checks with answers

**1. Why is the `fixed` statement necessary when working with managed arrays?**
*Answer*: The garbage collector can move objects in memory to optimize heap space. If you have a pointer to an array, the GC might move the array, making your pointer point to invalid memory. `fixed` prevents this movement.

**2. Can you use a pointer outside of an `unsafe` block?**
*Answer*: No. The compiler enforces that pointer types and pointer operations are only allowed within an `unsafe` context.

**3. What happens to the pointer created by `fixed` once the block finishes?**
*Answer*: The storage is unpinned and may move. A retained pointer no longer has a guaranteed stable address and must not be used as if the pin were still active.

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
