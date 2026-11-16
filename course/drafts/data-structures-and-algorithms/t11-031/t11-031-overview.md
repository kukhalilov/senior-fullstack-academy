# bitwise operations, masks, and subset enumeration — Big-picture orientation and mental model

# Problem and purpose

Bits are a compact way to represent Boolean facts. A bitwise operation applies a tiny truth table independently at each position, so one integer can encode flags, parity, or a subset of a small universe. Bit tricks are useful when their width and assumptions match the problem; they are not magic shortcuts around proof or complexity.

# Plain-language mental model

Imagine a row of switches labeled from bit 0 upward. An integer stores which switches are on. A mask is a stencil: AND inspects selected switches, OR turns them on, and XOR toggles them. In subset problems, each input element gets one switch, so a mask is one complete yes/no choice for every element.

# How the parts fit together

1. State the integer width and whether values are signed or unsigned.
2. Read each operator by its per-bit truth table.
3. Build a mask for the position/range of interest and apply AND, OR, or XOR.
4. Use low-bit identities for counting or parity only after proving multiplicity/sign assumptions.
5. Represent a subset by a mask only when the universe is small enough.
6. Check shift counts, overflow, sign extension, and full-width boundary cases in the implementation language.

# Concept map

| Goal | Bit pattern idea | Common risk |
| --- | --- | --- |
| Inspect or change one flag | One-bit mask with AND/OR/XOR | Wrong bit index or signed mask |
| Count set bits | Clear one lowest 1 repeatedly | Negative value interpretation |
| Find an odd-multiplicity value | XOR cancellation | Multiplicity assumption missing |
| Store a subset | One bit per element | Exponential number of masks |
| Shift/extract a field | Move bits, then mask | Shift count equal to word width |

For example, four permissions can be represented by four low bits. If a flag is at index 2, `mask = 1u << 2` selects it; `value & mask` tests it, `value | mask` sets it, and `value ^ mask` toggles it. This is reliable only after defining the bit numbering and making sure index 2 fits the word.

# End-to-end walkthrough

Suppose every number in an array appears twice except one. XOR all values. Each duplicate pair contributes `x ^ x = 0`; XORing zero with the singleton leaves it. The method is O(n) time and O(1) extra space, including negative `int` bit patterns, but it depends exactly on the “all others occur twice” guarantee. If values can occur three times, this cancellation no longer isolates the answer; count each bit modulo three instead.

# When to use it and tradeoffs

Use bit operations for compact flags, fixed-width representations, parity, population count, and small-set state. Prefer readable Boolean/set representations when the universe is large or the operation is not naturally bitwise. A bitmask DP with n elements has 2^n possible states; a shorter implementation does not make that search scalable.

# What later lessons cover

The references explain operators and shifts, single-bit masks, low-bit identities/counting, and subset enumeration/complexity. The practice problems apply XOR, population count, bit reversal, carry propagation, and masks. Bitmask DP beyond subset enumeration, binary tries, number theory, SIMD, and cryptography are outside this topic.

# Recent language change

C# 11 added `>>>`, a direct logical right shift for signed operands. Earlier C# code can cast to an unsigned type before shifting; `>>` on signed values remains arithmetic. Current language version is C# 15 as checked 2026-11-16. [C# 11 unsigned right shift](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator) [C# language versions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning)

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
