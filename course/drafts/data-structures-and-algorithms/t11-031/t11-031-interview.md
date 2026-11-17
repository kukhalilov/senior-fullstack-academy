# bitwise operations, masks, and subset enumeration — Interview questions and reasoning

# Core questions

1. Explain AND, OR, XOR, and NOT at the per-bit level.
2. How do you test, set, clear, and toggle a bit?
3. What is the difference between arithmetic and logical right shift in C#?
4. Why does XOR find one singleton among pairs, and when does it fail?
5. Prove the `x & (x-1)` population-count loop.
6. How many subsets exist for n elements? Why is subset DP limited to small n?
7. Why is `1 << 32` not an all-ones 32-bit mask in C#?
8. How can you sum two integers with bitwise operations and no plus/minus?
9. Which `System.Numerics.BitOperations` helpers replace common manual bit loops, and which boundary behaviors matter?

# Concise interview answers

1. AND yields 1 only for two set bits; OR yields 1 if either is set; XOR yields 1 if they differ; NOT flips the fixed-width pattern.
2. Build a one-bit mask: AND tests, OR sets, AND with complement clears, XOR toggles.
3. Signed `>>` copies the sign bit; `>>>` shifts in zeros (available since C# 11), and unsigned `>>` also shifts logically.
4. Each duplicate pair XORs to zero. It fails if the assumed even-multiplicity grouping does not hold.
5. Subtracting one clears the rightmost set bit and sets lower trailing zeroes; AND with original removes those newly set lower positions, leaving exactly one fewer 1.
6. 2^n. Any algorithm that enumerates all subsets is exponential; scanning n bits to materialize each subset is O(n·2^n).
7. C# masks a 32-bit shift count to five low bits, so 32 becomes zero. Use an explicit uint all-ones mask or a full-width branch.
8. XOR computes sum bits without carry; `(a & b) << 1` computes carry bits. Repeat until carry is zero, with fixed-width overflow semantics stated.
9. `PopCount`, `LeadingZeroCount`, `TrailingZeroCount`, `Log2`, `IsPow2`, rotations, and `RoundUpToPowerOf2` cover common operations. Guard zero-width counts, remember `Log2(0)` returns 0 by convention, and distinguish zero input from overflow in round-up results.

# Deep follow-up answers

For bitwise reasoning, annotate the width and signedness before algebra. Algebraic identities such as `x & -x` use modular two’s-complement behavior; in checked code or at the minimum signed value, avoid silently assuming ordinary unbounded integers. For C# shifts, counts are masked, not rejected, so validate them. A mask’s universe size is a complexity issue as well as a width issue: 30 elements already means over a billion subsets, even though the mask still fits in 32 bits.

Constant-space does not mean the same as “no bit-width state”: an O(1) loop may still make 32 passes. If a problem changes multiplicities from two to three, use modulo-three per-bit counts or a finite-state bit counter rather than the pair-XOR proof. State each guarantee that makes the solution correct.

# Scenario questions

1. **A population-count loop never terminates for negative n.** Check whether it uses signed arithmetic shift; cast the intended raw pattern to uint or use the low-set-bit clearing loop.
2. **A mask for bit 31 becomes negative.** The sign is the int interpretation, not a lost bit. Use uint when unsigned mask arithmetic is clearer.
3. **A program shifts by 32 expecting zero.** C# treats the shift as a shift by zero; branch on full width.
4. **A subset enumeration is slow at n=25.** 2^25 masks already exceed 33 million; count the states and output volume before choosing the representation.
5. **XOR returns the wrong answer when repeated values occur three times.** Its cancellation guarantee only handles even multiplicity; use bit counts modulo three.

# Tradeoffs and alternatives

Bitmasks are compact and fast for small fixed universes; sets and Boolean arrays are clearer and unbounded. A low-set-bit loop depends on the number of set bits, while a fixed scan costs the word width. XOR is elegant for exact pair cancellation; a frequency map is more general but uses extra space. Subset recursion and masks both enumerate 2^n results; masks are useful when subset itself must be a compact DP key.

# Common weak answers

- “XOR finds the number that appears once” without stating the other multiplicities.
- “Right shift always fills with zero.”
- “A negative integer has infinitely many leading one bits” when the algorithm actually uses a fixed-width word.
- “Shifting by the type width clears the value.”
- “Bitmask DP is polynomial because each transition is constant time.”
- “The tails or mask is the answer” without explaining what it represents.

# Self-check rubric

Score 0–2 for: correct truth table; explicit width/signedness; valid mask boundaries; proof of multiplicity assumptions; C# shift/overflow behavior; complexity including exponential state/output; and edge-case tests for zero, sign bit, and maximum index. Strong answers justify the bit invariant rather than relying on memorized identities.

# Sources

- [Reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [Reference](https://usaco.guide/gold/dp-bitmasks)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
- [.NET `BitOperations` API](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
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
