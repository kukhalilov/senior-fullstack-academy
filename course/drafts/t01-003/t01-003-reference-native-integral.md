<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Native-sized integral type keywords

*Automatically generated draft.*

# C# Native-Sized Integral Types: `nint` and `nuint`

## Scope and version
This lesson covers the C# keywords `nint` and `nuint`. These types are stable as of C# 15 on .NET 11 GA.
*Sources: [Microsoft built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table), [integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types), and [C# version history](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history).*

## How this group fits the mental model
In C#, most numeric types have a fixed size (e.g., `int` is always 32 bits). Native-sized integers may be useful with native-sized integer APIs or low-level libraries; their width matches the process pointer size (32 bits in a 32-bit process, 64 bits in a 64-bit process).

`nint` and `nuint` provide native-sized integer behavior. They do not by themselves ensure portability or performance; arithmetic, conversions, and API contracts still matter.

## Supplied names explained

*   **`nint`**: A signed native-sized integer. It is an alias for the .NET type `System.IntPtr`. Its width is 32 or 64 bits according to the process architecture.
*   **`nuint`**: An unsigned native-sized integer. It is an alias for the .NET type `System.UIntPtr`. Its width is 32 or 64 bits according to the process architecture.

## Cross-item comparison

| Feature | `nint` | `nuint` | `int` | `uint` |
| :--- | :--- | :--- | :--- | :--- |
| **Signedness** | Signed | Unsigned | Signed | Unsigned |
| **Size** | Platform-dependent | Platform-dependent | Fixed (32-bit) | Fixed (32-bit) |
| **Typical use** | Native interop/low-level integer APIs | Native interop/low-level integer APIs | General integer values | General integer values |

*Source: [C# 9 Native-sized integers](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)*

## Examples

```csharp
// Unverified example
nint byteSize = sizeof(nint);
// 4 in a 32-bit process; 8 in a 64-bit process.

nuint nativeValue = 0x12345678;
// Width follows the process; this alone does not make pointer arithmetic safe.
```

## Common mistakes
1.  **Assuming fixed size:** Developers often mistakenly assume `nint` is always 64 bits because they work on 64-bit machines. Always treat these types as platform-dependent.
2.  **Mixing with fixed types:** Native integer operators and conversions have language-defined rules; narrowing conversions and arithmetic can overflow. Check the applicable checked/unchecked context and API contract.
3.  **Overuse:** Do not use `nint` or `nuint` for general-purpose counters or loop indices. Use `int` or `long` for standard application logic to maintain readability and intent.

## Knowledge checks with answers

**1. What is the primary difference between `nint` and `int`?**
*Answer:* `int` is always 32 bits, whereas `nint` changes its size to match the pointer size of the underlying platform (32 or 64 bits).

**2. If you are writing code that needs to handle memory addresses, which type is more appropriate: `nint` or `int`?**
*Answer:* `nint` (or `nuint`), because its width follows process architecture and may match native-sized API values; it is not itself a managed reference or a guarantee of safe pointer arithmetic.

**3. Is `nint` a signed or unsigned type?**
*Answer:* `nint` is a signed type.
