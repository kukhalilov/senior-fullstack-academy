<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Unsafe statement forms

*This is an automatically generated draft.*

# Scope and version
This lesson covers the `unsafe` and `fixed` statement forms in C#. These features are part of the C# 15 language specification running on .NET 11 GA. Note that while these statements are stable, broader memory safety features in C# remain in preview as of the 2026-11-14 snapshot.

# How this group fits the mental model
In C#, the runtime (CLR) manages memory automatically. However, some performance-critical or low-level tasks require direct memory access, similar to languages like C or C++. The `unsafe` and `fixed` statements provide a "sandbox" where you can bypass standard safety checks to perform pointer arithmetic or interact with unmanaged memory.

*   **`unsafe` statement**: Acts as a container. It tells the compiler that the code inside is allowed to use pointers and perform operations that the runtime cannot verify for safety.
*   **`fixed` statement**: Acts as a protector. It tells the garbage collector (GC) to "pin" a variable in memory so that its address does not change while you are working with it via a pointer.

# Supplied names explained

*   `unsafe statement`: This statement defines a block of code where pointer types and pointer-related operations are permitted. You cannot use pointers outside of an `unsafe` context. The compiler requires the project to be configured to allow unsafe code to compile this block.
*   `fixed statement`: This statement prevents the garbage collector from relocating a movable variable. It creates a pointer to the variable, which remains valid only for the duration of the `fixed` block. Once the block exits, the variable is "unpinned" and the garbage collector is free to move it again.

# Cross-item comparison

| Feature | Primary Purpose | Scope |
| :--- | :--- | :--- |
| `unsafe` | Enables the use of pointers and unsafe operations. | Defines a block where unsafe code is permitted. |
| `fixed` | Pins memory to prevent the GC from moving an object. | Pins a specific variable for the duration of the block. |

The `fixed` statement is almost always used *inside* an `unsafe` block, as `fixed` requires the ability to work with pointers. While `unsafe` enables the *capability* to use pointers, `fixed` provides the *safety guarantee* required to use them on managed objects.

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
2.  **Accessing pointers after the `fixed` block**: Once the `fixed` block ends, the pointer variable is no longer valid. Attempting to use the pointer outside the block is a common source of memory corruption or undefined behavior.
3.  **Overusing `unsafe`**: Because these statements bypass the runtime's memory safety, they should only be used when necessary for performance or interop. Using them unnecessarily increases the risk of bugs that the compiler cannot detect.

# Knowledge checks with answers

**1. Why is the `fixed` statement necessary when working with managed arrays?**
*Answer*: The garbage collector can move objects in memory to optimize heap space. If you have a pointer to an array, the GC might move the array, making your pointer point to invalid memory. `fixed` prevents this movement.

**2. Can you use a pointer outside of an `unsafe` block?**
*Answer*: No. The compiler enforces that pointer types and pointer operations are only allowed within an `unsafe` context.

**3. What happens to the pointer created by `fixed` once the block finishes?**
*Answer*: The pointer becomes invalid, and the variable is no longer pinned, meaning the garbage collector is free to move it again.

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
