<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# bitwise operations, masks, and subset enumeration — Reference: Operators, truth tables, and shifts

# Scope and version

*Automatically generated draft.*

This reference lesson covers the exact set of bitwise operators, fundamental truth-table behaviors, shift mechanics, and integer representations assigned under the topic of bitwise operations, masks, and subset enumeration. The scope focuses on bit-level algorithms, fixed-width integer semantics, and modern C# 15 execution models checked as of November 2026. 

Advanced topics such as binary tries, number theory, modular arithmetic, SIMD (Single Instruction, Multiple Data) vector instruction sets, and cryptography are excluded. Version-specific behavior follows Microsoft .NET specifications where the unsigned right-shift operator `>>>` was introduced in C# 11 and remains standard through C# 15 [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator, https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning].

# How this group fits the mental model

In low-level algorithm design, standard integer arithmetic treats a variable as a single numeric magnitude. Bitwise operations, by contrast, treat an integer as an ordered array of independent binary digits (bits). 

* **The Problem:** Processing large collections of boolean flags or checking subset memberships iteratively can introduce high time and memory overhead. 
* **The Plain-Language Mental Model:** Think of an integer as a fixed row of light switches. Each switch is either off (`0`) or on (`1`). A bitwise operator acts on all switches simultaneously in constant time. 
* **The Architectural Map:** The foundational building blocks are truth tables (AND, OR, XOR, NOT), which govern individual bit transformations. Shifts (`<<`, `>>`, `>>>`) move these bit patterns left or right across the integer width, while two's-complement representation dictates how negative values store their sign bits. Mastering these operators allows programmers to compose *bit masks*—patterns used to set, clear, toggle, or query specific flags without branching or looping.

# Supplied names explained

Every item in the assigned reference inventory is listed below in its exact string format, complete with its purpose and behavior within the broader bitwise architecture:

* `Bitwise AND`
  * **Purpose and Behavior:** Evaluates two integer operands bit by bit, returning `1` only if *both* corresponding input bits are `1`. It is universally used for masking (filtering out specific bits by applying zeros) and testing whether individual bits are set.

* `Bitwise OR`
  * **Purpose and Behavior:** Evaluates two integer operands bit by bit, returning `1` if *at least one* corresponding input bit is `1`. It is commonly used to combine flags or force specific bits to `1` without altering neighboring bits.

* `Bitwise XOR`
  * **Purpose and Behavior:** Evaluates two integer operands bit by bit, returning `1` if the corresponding input bits are *different* (one is `0` and the other is `1`). Because identical bits cancel out to `0`, XOR acts as a toggle mechanism and supports parity/cancellation patterns under strict multiplicity rules.

* `Bitwise NOT`
  * **Purpose and Behavior:** Flips every bit in a single integer operand, changing all `0`s to `1`s and all `1`s to `0`s. In two's-complement arithmetic, this operation effectively computes `-x - 1`.

* `Left shift`
  * **Purpose and Behavior:** Shifts the bits of an integer operand to the left by a specified count, filling vacated low-order positions with zeros. Mathematically, shifting left by $k$ multiplies the value by $2^k$, provided no overflow occurs. In C# `int`/`uint` types, only the five lowest bits of the shift count are evaluated [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].

* `Right shift`
  * **Purpose and Behavior:** Shifts the bits of an integer operand to the right by a specified count. Depending on the operator variant and operand sign, vacated high-order positions are handled via sign extension or zero-filling.

* `Logical versus arithmetic right shift`
  * **Purpose and Behavior:** Distinguishes how high-order bits are populated during a right shift. An *arithmetic* right shift (performed by `>>` on signed types) preserves the sign bit by replicating the highest bit. A *logical* right shift (performed by `>>>` introduced in C# 11) always fills vacated high-order bits with zeros, regardless of the operand's sign [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator].

* `XOR self-inverse identity`
  * **Purpose and Behavior:** Encapsulates the algebraic property that applying XOR twice with the same operand restores the original value ($x \oplus y \oplus y = x$), and any number XORed with zero equals itself ($x \oplus 0 = x$). This identity underpins algorithms that locate unique elements in arrays where duplicates appear an even number of times [https://usaco.guide/silver/bitwise?lang=cpp].

* `AND/OR truth tables`
  * **Purpose and Behavior:** Define the exhaustive output rules for binary logical combinations ($0$ and $0 \rightarrow 0$; $1$ and $1 \rightarrow 1$; etc.). They serve as the foundational logic gate specifications for all bitwise filtering and combination tasks.

* `Two's-complement representation`
  * **Purpose and Behavior:** The standard binary encoding for signed integers in modern computing architectures. Negative numbers are represented by inverting the bits of the absolute value and adding one. This representation ensures that addition, subtraction, and bitwise operations function consistently across positive and negative boundaries without special-case hardware branches.

# Cross-item comparison

Within this assigned group, several items contrast in function and use case:

* **Bitwise AND vs. Bitwise OR:** AND filters out bits by clearing targets where the mask has zeros, whereas OR merges patterns by injecting ones where the mask specifies.
* **Left shift vs. Right shift:** Left shift scales values upward by powers of two toward the high-order bits, while right shift scales values downward toward the low-order bits.
* **Logical vs. Arithmetic right shift:** Arithmetic right shift (`>>` on signed types) maintains negative sign integrity by copying the topmost bit, whereas logical right shift (`>>>`) strictly pads high-order positions with zeros.
* **XOR self-inverse identity vs. AND/OR truth tables:** Truth tables define static 2-input/1-output mappings for basic operations, whereas the XOR self-inverse identity describes a dynamic multi-step algebraic cancellation rule used across algorithm loops.

# Examples

The following C# snippet demonstrates how bitwise operations, masks, and shifts interact in practice.

```csharp
using System;

class Program
{
    static void Main()
    {
        // Define a bit mask for permissions: Read (1), Write (2), Execute (4)
        int permissions = 0; // 0000 in binary
        int readMask = 1;    // 0001
        int writeMask = 2;   // 0010

        // 1. Set the Read and Write bits using Bitwise OR
        permissions = permissions | readMask | writeMask; // Result: 3 (0011)

        // 2. Test if the Read bit is set using Bitwise AND
        bool hasRead = (permissions & readMask) != 0; // True

        // 3. Toggle the Write bit using Bitwise XOR
        permissions = permissions ^ writeMask; // Write bit cleared, result: 1 (0001)

        // 4. Use Left shift to build a positional flag
        int shiftFlag = 1 << 3; // Value is 8 (1000 in binary)

        // 5. Isolate the lowest set bit using two's-complement arithmetic
        int value = 12; // Binary: 1100
        int lowestBit = value & -value; // Result: 4 (binary 0100)
        
        Console.WriteLine($"Permissions: {permissions}");
        Console.WriteLine($"Has Read: {hasRead}");
        Console.WriteLine($"Shift Flag: {shiftFlag}");
        Console.WriteLine($"Lowest Set Bit of 12: {lowestBit}");
    }
}
```

**Expected Console Output:**
```text
Permissions: 1
Has Read: True
Shift Flag: 8
Lowest Set Bit of 12: 4
```

# Common mistakes

* **Confusing signed arithmetic right shift with logical shift:** Using standard `>>` on negative numbers preserves the sign bit (padding with `1`s), which can break bit-mask extraction routines expecting zero-padding. Use `>>>` (available in C# 11 and later) when logical zero-fill is required [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator].
* **Exceeding type width limits during shifts:** In 32-bit integer operations (`int`/`uint`), shifting by 32 or more does not yield zero; the shift count is masked to its lowest 5 bits (values $0$ to $31$), meaning `1 << 32` evaluates to `1 << 0` [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].
* **Misapplying XOR cancellation:** Assuming XOR cancellation isolates a single unique element when other elements have odd multiplicities greater than one. XOR cancellation only identifies singletons if all duplicate elements appear in exact pairs (even multiplicity) [https://usaco.guide/silver/bitwise?lang=cpp].
* **Ignoring two's-complement edge cases:** Applying the expression `x & -x` on minimum negative values (`int.MinValue`) can produce unexpected behavior due to overflow constraints in signed integer arithmetic.

# Knowledge checks with answers

1. **Question:** What is the outcome in C# when a signed 32-bit integer is shifted right using the `>>>` operator compared to the `>>` operator if the number is negative?
   * **Answer:** The `>>>` operator performs a logical right shift, filling the vacated high-order bits with zeros regardless of the sign. The `>>` operator performs an arithmetic right shift, preserving the negative sign by filling vacated high-order bits with ones.

2. **Question:** Why does the expression `1 << 32` fail to yield zero in a 32-bit integer context in C#?
   * **Answer:** C# masks the shift count to the lowest five bits for 32-bit integers (`int` and `uint`), meaning a shift count of 32 is treated as a shift count of zero (`32 & 31 = 0`), resulting in the original value unchanged [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].

3. **Question:** Under what condition does the XOR self-inverse identity successfully isolate a single unique number in an array?
   * **Answer:** It succeeds only when every other number in the array appears an even number of times (pairs), allowing all duplicate values to cancel out to zero [https://usaco.guide/silver/bitwise?lang=cpp].

Sources: [Topic reference](https://usaco.guide/silver/bitwise?lang=cpp)
