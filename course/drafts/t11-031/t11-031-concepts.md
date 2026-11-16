<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# bitwise operations, masks, and subset enumeration — Core concepts and how they fit together

# Learning objectives
- Reason about independent binary digits using bitwise operators (`&`, `|`, `^`, `~`) and two's-complement arithmetic.
- Construct and manipulate single-bit masks to test, set, clear, and toggle individual bits in fixed-width integer types (`int`, `uint`, `long`, `ulong`).
- Apply fundamental bit identities, such as isolating the least significant set bit (`x & -x`), clearing it (`x & (x-1)`), and leveraging XOR self-inversion for cancellation.
- Enumerate $2^n$ subset masks and $3^n$ submask pairs while recognizing exponential time complexity and fixed-width integer boundaries.

# Prerequisites
- Understanding of binary (base-2) integer representation and positional notation.
- Familiarity with fixed-width integer types and two's-complement negative number representation.
- Basic procedural programming constructs (loops, conditionals, and functions).

# Core concepts
Bitwise operations act independently on corresponding binary digits of integer operands. A **bit mask** encodes a discrete set using one bit per element, allowing constant-time membership tests and compact subset states when the universe fits within the integer width. 

To solve problems involving small sets or fast state compression without allocating collections, we use bit manipulation. The conceptual map of this topic proceeds from basic operators to single-bit manipulations, specialized bit identities, and finally full subset enumeration.

- **Operators and truth tables**: Bitwise AND (`&`), OR (`|`), XOR (`^`), and NOT (`~`) evaluate each bit position independently.
- **Shifts and sign rules**: Left shift (`<<`) and right shift (`>>` or `>>>`) move bits across positions. In C# 11 and later, `>>>` provides logical right shift for signed operands (introduced in C# 11; checked under C# 15 semantics) [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator, https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning].
- **Masking patterns**: Shifting `1` by an index creates single-bit masks to inspect or alter specific positions.
- **Advanced bit identities**: Expressions like `x & -x` and `x & (x-1)` extract or remove the lowest set bit in two's-complement arithmetic.
- **Enumeration limits**: All $2^n$ subsets can be represented via integer masks from $0$ to $2^n - 1$, and submask loops scale at $O(3^n)$ total pairs.

# Mechanisms and relationships
Bitwise operations manipulate numbers at the hardware level, bypassing the overhead of collection-based data structures. 

In fixed-width two's-complement arithmetic (`int` and `uint` are 32-bit; `long` and `ulong` are 64-bit), shift counts are masked to the low bits of the count operand (five low count bits for 32-bit types, six for 64-bit types). Consequently, shifting a 32-bit integer by 32 results in a shift by zero because `32 & 31` is `0`. 

Bitwise operations never cause overflow and produce identical results in checked and unchecked contexts [https://usaco.guide/silver/bitwise?lang=cpp]. 

Below is the inventory of named features covered in this topic, organized into functional groups:

- **Operators, truth tables, and shifts**
  - `Bitwise AND`
  - `Bitwise OR`
  - `Bitwise XOR`
  - `Bitwise NOT`
  - `Left shift`
  - `Right shift`
  - `Logical versus arithmetic right shift`
  - `XOR self-inverse identity`
  - `AND/OR truth tables`
  - `Two's-complement representation`

- **Testing and changing individual bits**
  - `One-bit mask 1 shifted by index`
  - `Test bit`
  - `Set bit`
  - `Clear bit`
  - `Toggle bit`
  - `Mask low k bits`
  - `Extract bit range`
  - `Unsigned shift behavior`
  - `Shift-count bounds`
  - `Bit-width assumptions`

- **Low bits, parity, and population counts**
  - `Isolate least significant set bit x AND -x`
  - `Clear least significant set bit x AND (x-1)`
  - `Population count`
  - `Parity bit`
  - `Power-of-two test`
  - `Power-of-two shift-width boundary`
  - `XOR of range pattern`
  - `XOR cancellation by even multiplicity`
  - `Mask off higher bits`

- **Subset masks and limits**
  - `Subset bit mask`
  - `Enumerate all masks from zero to 2^n minus one`
  - `Test whether subset contains element`
  - `Enumerate submasks of a mask`
  - `O(2^n) subset enumeration`
  - `O(3^n) all-mask submask enumeration`
  - `Bitmask DP connection`
  - `Small-universe requirement`
  - `Signed overflow hazard`

# Worked examples

## Example 1: Isolating and clearing bits
This snippet demonstrates how to test, isolate, and clear bits using a 32-bit unsigned integer in C#.

```csharp
uint mask = 1U << 3; // Selects index 3 (binary 00001000)
uint value = 0b1011; // Binary 11

// Test whether bit 3 is set
bool isSet = (value & mask) != 0; // false

// Set bit 3
uint withBit = value | mask; // 0b1111 (Decimal 15)

// Isolate least significant set bit using x & -x
uint lowestBit = withBit & (uint)-(int)withBit; // 0b0001 (Decimal 1)

// Clear least significant set bit using x & (x-1)
uint cleared = withBit & (withBit - 1); // 0b1110 (Decimal 14)
```

Expected behavior: `isSet` evaluates to `false` because the 3rd bit of `11` (`1011`) is `0`. `withBit` sets that bit, yielding `15`. Isolating the lowest set bit on `15` yields `1`, and clearing it yields `14`.

## Example 2: Population count loop
Counting the number of set bits (population count) can be achieved efficiently by repeatedly clearing the lowest set bit until the value reaches zero.

```csharp
int CountSetBits(uint n) {
    int count = 0;
    while (n != 0) {
        n &= (n - 1); // Clears the least significant set bit
        count++;
    }
    return count;
}

int result = CountSetBits(0b10110); // Binary 22, has 3 set bits
```

Expected behavior: The function executes three iterations (clearing bits at positions 1, 2, and 4) and returns `3`.

# Misconceptions and edge cases
- **Misconception: XOR cancellation solves single-element searches of any distribution.** XOR cancellation relies on even multiplicity. If an element appears an odd number of times greater than one, XOR alone will not isolate a single unique instance [https://leetcode.com/problems/single-number/].
- **Edge case: Shifting by the type width.** In C#, shifting an `int` or `uint` by 32 or more uses only the lowest 5 bits of the shift count (`count & 31`), meaning `1 << 32` evaluates to `1 << 0` (which is `1`), not `0`. Width-sized or wider masks require explicit handling [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].
- **Misconception: Bit tricks eliminate exponential complexity.** While bitwise representation compresses state and speeds up inner loops, enumerating all subsets ($2^n$) or submask pairs ($3^n$) remains strictly exponential and becomes impractical for large $n$ (typically $n > 20$ to $30$) [https://usaco.guide/gold/dp-bitmasks].
- **Edge case: Signed minimum values.** Applying `x & -x` on a negative minimum value in two's-complement arithmetic can preserve the sign bit or trigger unexpected sign extension hazards if signed types are promoted incorrectly.

# Knowledge checks with answers

1. **Question:** What is the result of evaluating `6 & 3` in binary arithmetic?
   - **Answer:** `2` (Binary `0110` AND `0011` yields `0010`).

2. **Question:** How does `x & (x - 1)` modify an integer `x`?
   - **Answer:** It clears the least significant set bit (turns the rightmost `1` into a `0`).

3. **Question:** Why does `1 << 32` fail to produce `0` in a 32-bit integer type in C#?
   - **Answer:** C# masks shift counts to the lowest 5 bits for 32-bit integers (`32 & 31` equals `0`), causing the shift amount to wrap around to `0`.

4. **Question:** What is the total time complexity required to iterate over all submasks for every possible mask of size $n$?
   - **Answer:** $O(3^n)$ total pairs.

Sources: [Topic reference](https://usaco.guide/silver/bitwise?lang=cpp)
