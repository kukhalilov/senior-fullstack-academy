# bitwise operations, masks, and subset enumeration — Core concepts and how they fit together

# Learning objectives

- Explain the truth table of each bitwise operator and distinguish logical from arithmetic shifts.
- Build correct masks for testing, setting, clearing, toggling, and extracting bits.
- Prove XOR cancellation and low-bit counting methods under explicit assumptions.
- Estimate the state/time cost of subset and submask enumeration.
- Avoid C# signedness, overflow, and shift-count traps.

# Prerequisites

Know binary place values and the fixed-width nature of C# integer types: `int`/`uint` have 32 bits, while `long`/`ulong` have 64. Bit index 0 is the least significant bit.

# Core concepts

1. Bitwise operations act independently on corresponding binary digits; AND, OR, XOR, and NOT have truth-table behavior that should be reasoned about at the bit level.
2. A bit mask encodes a small set using one bit per element, enabling constant-time membership tests and compact subset state when the universe fits the integer width.
3. Setting, clearing, toggling, and testing a bit use masks built from a one shifted to the target position; shift counts and signed integer behavior are language-specific hazards.
4. XOR is self-inverse, so equal values cancel in pairs and x XOR 0 equals x; these identities support parity and unique-element techniques under precise multiplicity assumptions.
5. The expression x AND -x isolates the least significant set bit in two's-complement integer arithmetic; clearing it with x AND (x-1) supports population-count loops.
6. Enumerating all subsets takes O(2^n) masks; enumerating all submasks across every mask takes O(3^n) total pairs, which is useful only for small n.
7. Bit tricks can reduce constants or encode state compactly, but they do not remove exponential complexity when all subsets must be considered.
8. Fixed-width overflow, negative values, sign extension, and shifting by the type width can invalidate informal identities; state the integer representation and constraints.

# Mechanisms and relationships

## Operators are per-bit truth tables

For each position, AND is 1 only for 1&1; OR is 1 for 1|0, 0|1, or 1|1; XOR is 1 for unequal bits. NOT flips every bit in the operand width. For a byte, `00001100 & 00001010 = 00001000`, while XOR gives `00000110`. Signed values do not change these bitwise rules, but their width and interpretation affect what the printed result means.

## Shifts and C# width behavior

Left shift moves bits toward the sign/high end and fills zeroes at the low end. Right shift of an unsigned value is logical; C# signed `>>` is arithmetic and fills with the sign bit. C# 11 `>>>` performs logical right shift on signed input. In C#, the shift count is masked to 5 low bits for 32-bit operands and 6 for 64-bit operands: `1 << 32` is therefore equivalent to `1 << 0`, not a 32-bit mask. Guard the count and handle full-width extraction separately. [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)

## Masks are small Boolean formulas

To test index i, build `1u << i` and AND it with the value. OR sets, AND with complement clears, and XOR toggles. For extracting a range, shift its low endpoint to zero and mask the desired width. Make the type unsigned when the value is a raw bit pattern, and validate indexes against its width.

## Low bits and multiplicity

For nonzero two’s-complement x, `x & (x - 1)` removes its least significant set bit, so the loop count equals the population count. `x & -x` isolates that bit. XOR cancels pairs because it is associative, commutative, and self-inverse; a singleton among pairs is the XOR of all inputs. If other multiplicities are odd, the XOR result contains their combined contribution and the singleton argument fails.

## Subsets and complexity

With n indexed elements, an n-bit mask defines one subset and there are 2^n masks. Scanning all n bits to emit each subset costs O(n·2^n). For every mask, iterating its submasks takes 3^n total mask/submask pairs. These approaches target small n even though a single bit operation is constant time.

# Worked examples

## Set, test, clear, toggle

For `value = 0101₂` and `mask = 0100₂`, AND is nonzero (bit 2 is set). OR leaves it set, AND with `~mask` clears it (`0001₂`), and XOR toggles it (`0001₂`). Apply XOR again to recover `0101₂`.

## Count bits without a built-in

For `x = 10110000₂`, repeatedly replace x with `x & (x - 1)`: `10100000`, `10000000`, `00000000`. Three iterations mean three set bits. For signed negatives, first decide whether to count the full 32-bit pattern; convert to `uint` if that is the intended interpretation.

## Enumerate a submask

For mask `1010₂`, start `sub = mask` and repeat `(sub - 1) & mask`, yielding `1010`, `1000`, `0010`, then `0000`. The common loop stops before zero; include zero explicitly when the empty submask is needed.

# Misconceptions and edge cases

- `~x` is width-dependent and is not equivalent to Boolean `!x`.
- `x & (x-1) == 0` also holds for x=0; include `x > 0` in a power-of-two test.
- A signed right shift preserves sign; it does not shift in zeros.
- A shift by 32 in C# does not clear a 32-bit value.
- `1 << 31` is a negative signed int bit pattern; use `1u << 31` for an unsigned mask.
- XOR can only exploit known even multiplicities; it does not solve arbitrary “one appears once” variants.
- Enumerating all subsets is exponential regardless of low per-mask overhead.

# Knowledge checks with answers

1. What does `x & (x-1)` do for nonzero x? **Clears its least significant set bit.**
2. Why does XOR find one singleton among pairs? **Every paired value cancels and only the singleton remains.**
3. What is the difference between `>>` and `>>>` for a negative C# int? **`>>` copies the sign bit; `>>>` shifts in zeroes.**
4. How many subsets does n elements have? **2^n.**
5. What is wrong with `1 << 32` as a 32-bit full mask? **C# masks the shift count, so it shifts by zero. Handle width separately.**

# Sources

- [Reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [Reference](https://usaco.guide/gold/dp-bitmasks)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator)
- [Reference](https://leetcode.com/problems/single-number/)
- [Reference](https://leetcode.com/problems/number-of-1-bits/)
- [Reference](https://leetcode.com/problems/counting-bits/)
- [Reference](https://leetcode.com/problems/reverse-bits/)
- [Reference](https://leetcode.com/problems/sum-of-two-integers/)
- [Reference](https://leetcode.com/problems/single-number-ii/)
- [Reference](https://leetcode.com/problems/bitwise-and-of-numbers-range/)
- [Reference](https://leetcode.com/problems/subsets/)
