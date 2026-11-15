<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Native-sized integral type keywords

*Automatically generated draft.*

# C# Native-Sized Integral Types: `nint` and `nuint`

## Scope and version
This lesson covers the C# keywords `nint` and `nuint`. These types are stable as of C# 15 on .NET 11 GA. 
*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*

## How this group fits the mental model
In C#, most numeric types have a fixed size (e.g., `int` is always 32 bits). However, when interacting with low-level memory addresses or native APIs, you often need an integer that matches the size of the processor's pointer (32 bits on a 32-bit system, 64 bits on a 64-bit system). 

`nint` and `nuint` provide this "native-sized" behavior. They allow your code to remain portable and performant across different hardware architectures without manually checking the system's bit-width.

## Supplied names explained

*   **`nint`**: A signed native-sized integer. It is an alias for the .NET type `System.IntPtr`. Its size is determined by the underlying platform's pointer size.
*   **`nuint`**: An unsigned native-sized integer. It is an alias for the .NET type `System.UIntPtr`. Like `nint`, its size adjusts automatically to the platform's pointer size.

## Cross-item comparison

| Feature | `nint` | `nuint` | `int` | `uint` |
| :--- | :--- | :--- | :--- | :--- |
| **Signedness** | Signed | Unsigned | Signed | Unsigned |
| **Size** | Platform-dependent | Platform-dependent | Fixed (32-bit) | Fixed (32-bit) |
| **Primary Use** | Pointer math | Pointer math | General logic | General logic |

*Source: [C# 9 Native-sized integers](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)*

## Examples

```csharp
// Unverified example
nint pointerSize = sizeof(nint); 
// On a 64-bit system, pointerSize will be 8.
// On a 32-bit system, pointerSize will be 4.

nuint address = 0x12345678; 
// This is safe for pointer arithmetic regardless of the platform.
```

## Common mistakes
1.  **Assuming fixed size:** Developers often mistakenly assume `nint` is always 64 bits because they work on 64-bit machines. Always treat these types as platform-dependent.
2.  **Mixing with fixed types:** While you can perform arithmetic between `nint` and `int`, be aware that implicit conversions may result in data loss or overflow if the `nint` value exceeds the range of the fixed-size type.
3.  **Overuse:** Do not use `nint` or `nuint` for general-purpose counters or loop indices. Use `int` or `long` for standard application logic to maintain readability and intent.

## Knowledge checks with answers

**1. What is the primary difference between `nint` and `int`?**
*Answer:* `int` is always 32 bits, whereas `nint` changes its size to match the pointer size of the underlying platform (32 or 64 bits).

**2. If you are writing code that needs to handle memory addresses, which type is more appropriate: `nint` or `int`?**
*Answer:* `nint` (or `nuint`), because it is designed to match the native pointer size of the processor.

**3. Is `nint` a signed or unsigned type?**
*Answer:* `nint` is a signed type.
