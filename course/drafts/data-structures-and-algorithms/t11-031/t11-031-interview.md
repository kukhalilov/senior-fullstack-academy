# bitwise operations, masks, and subset enumeration — Interview questions and reasoning

## Core questions

For C# shift and signedness details, see the [Microsoft operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

1. What do AND, OR, and XOR mean per bit?
2. Why does XOR find one value among pairs?
3. How do you test, set, clear, and toggle a bit?
4. What does `x & (x-1)` do?
5. What are C# signed and unsigned right shifts?
6. Why is subset enumeration exponential, and when are masks appropriate?

## Concise interview answers

1. AND needs both bits set, OR needs either, and XOR needs the bits to differ.
2. Equal pairs cancel because `x^x=0`; the identity contributes zero.
3. With `mask=1<<i`, test `x&mask`, set `x|mask`, clear `x&~mask`, toggle `x^mask`.
4. It clears the lowest set bit in the fixed-width integer representation.
5. C# `>>` sign-extends signed operands; `>>>` inserts zeros. Shift counts use five low bits for 32-bit and six for 64-bit operands.
6. Each of `n` elements independently has two choices, giving `2^n`. Masks are compact for small universes that fit the chosen type.

## Deep follow-up answers

**Why does `x & -x` isolate the low bit?** In two's complement, `-x` is the bitwise complement of `x` plus one. Trailing zeros become zeros in both operands until the lowest one, where AND retains that one; higher positions are cleared by the differing carry pattern. State the fixed width and avoid interpreting minimum signed negation as a representable positive magnitude.

**How do you count every submask of every mask?** For each outer mask, repeatedly set `sub=(sub-1)&mask`, taking care to include zero exactly once. Across all pairs, each element has three statuses, giving `3^n` total pairs.

**What is the difference between set and toggle?** Set is idempotent: applying it repeatedly leaves the bit on. Toggle changes the bit each time, so a second toggle restores its prior state.

**How do language rules change portable explanations?** Shift semantics differ across languages for negative values, oversized counts, and signed overflow. State the target language, type width, and whether the algorithm reasons about signed values or raw bit patterns. For C#, shifts mask counts and checked context does not detect discarded bits.

## Scenario questions

1. A power-of-two test accepts zero. Add the missing positive-value condition.
2. A loop counts negative `int` with `x &= x-1` and never terminates. Explain sign extension and switch to unsigned bits or a fixed-width scan.
3. A subset loop uses `1<<n` when `n==32`. Identify the masked-count issue and select a wider or alternative representation.
4. A candidate applies XOR cancellation to values that occur three times. Ask them to state the needed parity/multiplicity contract.

## Tradeoffs and alternatives

Bit masks make small-set membership and state keys compact, but arrays, `HashSet<T>`, or bit arrays are clearer for large or sparse universes. Kernighan's population count takes time proportional to the number of set bits; fixed-width scanning has predictable width cost. Per-bit modulo counting is simple and robust for one exceptional value among triples; finite-state bit counters can reduce repeated scans. Recursive subset generation avoids width limits but retains exponential output size.

## Common weak answers

- Treating integers as unbounded binary strings.
- Saying all right shifts insert zeros.
- Using XOR without stating multiplicity assumptions.
- Ignoring zero in a power-of-two predicate.
- Calling an exponential bitmask DP polynomial because bitwise operations are constant time.
- Claiming a shift by the word width clears the value in C#.

## Self-check rubric

Score 0 (missing), 1 (partial), or 2 (clear and correct): truth-table reasoning; mask construction and boundaries; signedness/width; identity proof; multiplicity assumptions; complexity; subset feasibility. A strong answer scores at least 11/14 and can explain a failure case for every shortcut.
