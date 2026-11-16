import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/data-structures-and-algorithms/t11-031.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
for (const group of manifest.inventory) {
  group.items = group.items.map(item => item === 'Power-of-two-of-two boundary' ? 'Power-of-two shift-width boundary' : item);
}
const grouped = Object.fromEntries(manifest.inventory.map(group => [group.id, group.items]));
const sources = [...new Set([...manifest.sourceSnapshot.urls, ...manifest.comparisonSources])];
const bibliography = sources.map(url => `- [Reference](${url})`).join('\n');
const exact = {
  'Bitwise AND': 'For each bit position, the result is 1 only when both operands have 1. It is commonly used to test or clear selected bits.',
  'Bitwise OR': 'For each position, the result is 1 when either operand has 1. OR with a mask sets the mask’s selected bits.',
  'Bitwise XOR': 'For each position, the result is 1 when the operand bits differ. XOR toggles selected bits and cancels equal values in pairs.',
  'Bitwise NOT': 'Flips every bit in the fixed-width representation. In C#, `~x` includes the sign bit and is not a logical Boolean negation.',
  'Left shift': 'Moves bit positions toward more significant positions and fills low positions with zero. Bits shifted out are discarded; C# bitwise and shift operations never throw for overflow and behave identically in checked and unchecked contexts. The resulting signed value may have a changed sign bit. [C# shift semantics](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)',
  'Right shift': 'Moves bits toward less significant positions. C# signed `>>` is arithmetic and copies the sign bit; unsigned `>>` fills high positions with zero.',
  'Logical versus arithmetic right shift': 'A logical shift fills high bits with zero; an arithmetic shift of a signed value replicates the sign bit. C# 11 added `>>>` for logical right shift; unsigned operands also shift logically.',
  'XOR self-inverse identity': '`x ^ x` is zero, `x ^ 0` is x, and `(x ^ y) ^ y` is x. Parentheses are unnecessary mathematically, but precedence and casts matter in code.',
  'AND/OR truth tables': 'AND outputs 1 only for (1,1); OR outputs 0 only for (0,0). These per-bit truth tables explain mask set/test/clear operations.',
  "Two's-complement representation": 'C# signed integer types use fixed-width two’s-complement representation. Negation is bitwise complement plus one modulo the width; the most significant bit is the sign bit.',
  'One-bit mask 1 shifted by index': 'For a valid bit index i, `1u << i` selects that bit in a 32-bit unsigned word. Use `1UL` for 64-bit masks; signed `1 << 31` produces the sign bit.',
  'Test bit': 'A bit is set when `(value & mask) != 0`. Ensure mask and value use compatible widths and intended signed/unsigned interpretation.',
  'Set bit': 'Use `value | mask` to make every selected bit 1 without changing other bits.',
  'Clear bit': 'Use `value & ~mask` to make selected bits 0 and preserve all others.',
  'Toggle bit': 'Use `value ^ mask` to flip selected bits; applying the same mask again restores the original value.',
  'Mask low k bits': 'For a width-safe unsigned type, `(1u << k) - 1` selects the lowest k bits only when k is in range and below the word width. Handle k=0 and k=width separately to avoid shift-count wrap.',
  'Extract bit range': 'Shift the desired low endpoint to bit zero, then AND with a mask of the range width. Validate start, length, and end against the type width; avoid constructing a mask with an invalid full-width shift.',
  'Unsigned shift behavior': 'Unsigned right shift fills vacated high bits with zero, which is useful for treating a signed int’s bit pattern as raw bits after an explicit unchecked cast to uint.',
  'Shift-count bounds': 'C# masks shift counts: for int/uint only the low 5 bits are used, and for long/ulong the low 6 bits are used. A shift by the type width therefore behaves like shift by zero; guard counts explicitly.',
  'Bit-width assumptions': 'A bit trick is meaningful only with a stated fixed width and interpretation. In C#, int/uint have 32 bits and long/ulong have 64; casts, overflow context, and signed shifts affect behavior.',
  'Isolate least significant set bit x AND -x': 'For nonzero two’s-complement x, `x & -x` retains only its lowest 1 bit. For signed minimum value, negation wraps to itself in unchecked arithmetic, so the expression still yields that bit pattern; unsigned reasoning is often clearer.',
  'Clear least significant set bit x AND (x-1)': 'For nonzero x, `x & (x - 1)` clears its lowest 1 bit. Repeating it reaches zero after exactly the number of set bits.',
  'Population count': 'Counts 1 bits in a fixed-width representation. Brian Kernighan’s loop clears one set bit each iteration; hardware/library popcount may be faster but may be disallowed by a problem.',
  'Parity bit': 'The parity is the population count modulo two. XORing each bit/value accumulates parity because pairs cancel.',
  'Power-of-two test': 'A positive unsigned x is a power of two exactly when `x & (x - 1)` is zero. Also require x != 0; zero has no set bit.',
  'Power-of-two shift-width boundary': 'A positive power of two has one set bit, but constructing `2^n` as `1 << n` requires n below the integer width. In C#, a width-sized shift wraps the count; choose a wider unsigned type or represent the boundary differently.',
  'XOR of range pattern': 'The XOR from 0 through n repeats a four-case pattern based on n modulo 4: n, 1, n+1, 0. XOR of [L,R] is prefixXor(R) XOR prefixXor(L-1), with a special case when L=0.',
  'XOR cancellation by even multiplicity': 'A value XORed an even number of times cancels to zero; an odd multiplicity leaves one copy. The singleton solution additionally requires every non-singleton value to occur exactly twice.',
  'Mask off higher bits': 'AND with a low-bit mask to discard higher positions. Construct the mask using a type and edge-case branch that handles zero bits and the full width safely.',
  'Subset bit mask': 'For a universe of n indexed elements, bit i indicates whether element i is included. There are 2^n masks, each representing one distinct subset.',
  'Enumerate all masks from zero to 2^n minus one': 'Loop over masks in `[0, 2^n)`; mask zero represents the empty subset. The count and shift must fit the chosen integer width.',
  'Test whether subset contains element': 'Element i is present when `(mask & (1 << i)) != 0`. Index i must be below the mask width.',
  'Enumerate submasks of a mask': 'For nonzero submasks, repeatedly use `sub = (sub - 1) & mask`, starting at mask. This visits every nonzero submask in descending order; process zero separately if required.',
  'O(2^n) subset enumeration': 'There are 2^n masks. If each mask scans n elements to materialize/output a subset, total work is O(n·2^n), and output storage can also be exponential.',
  'O(3^n) all-mask submask enumeration': 'Across every mask, iterating its submasks costs `sum_k C(n,k)2^k = 3^n` mask/submask pairs. This is feasible only for small n.',
  'Bitmask DP connection': 'A subset mask can be a DP state; transitions add/remove one item. The state count is 2^n, often with another factor n, so this technique targets small universes rather than arbitrary n.',
  'Small-universe requirement': 'Bitmask representation requires the universe size to fit the chosen word and exhaustive subset iteration also grows exponentially. Use arrays, sets, or another representation for larger universes.',
  'Signed overflow hazard': 'In C#, signed overflow is unchecked by default unless configured otherwise; checked contexts can throw. Shifting into a sign bit, negating the minimum value, and computing `1 << width` need explicit width-aware reasoning.'
};

const missing = Object.values(grouped).flat().filter(item => !exact[item]);
if (missing.length) throw new Error('Missing exact bitwise explanations: ' + missing.join(' | '));
manifest.accuracyFacts = [
  'C# int and uint are 32-bit fixed-width types; long and ulong are 64-bit. For int/uint shifts only five low count bits are used; for long/ulong six low count bits are used.',
  'C# signed right shift >> is arithmetic; C# 11 introduced >>> for logical right shift. Unsigned right shift fills high bits with zero.',
  'C# bitwise and shift operations never cause overflow and produce the same results in checked and unchecked contexts; shift counts are masked to the width-specific low bits.',
  'The one-bit mask expression 1 << 31 selects the sign bit in a 32-bit signed int; 1 << 32 shifts by zero in C# because the count is masked, so width-sized masks need explicit handling.',
  'XOR cancellation solves the single-pair problem only when all other values have even multiplicity; XOR alone does not identify one singleton among arbitrary multiplicities.',
  'For positive unsigned x, x & (x-1) clears the least significant 1 bit; x & -x isolates it in fixed-width two’s-complement arithmetic, but signed overflow context and minimum values require care.',
  'Enumerating all subsets is exponential: 2^n masks; visiting all submask pairs over every mask is 3^n.',
  'The C# unsigned right-shift operator >>> was introduced in C# 11; C# 15 is the current language version checked 2026-11-16.'
];
manifest.sourceSnapshot.checkedAt = '2026-11-16';
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const head = '# ' + manifest.title;
const conceptList = manifest.concepts.map((x, i) => `${i + 1}. ${x}`).join('\n');
const write = async (id, body) => fs.writeFile(`course/drafts/data-structures-and-algorithms/t11-031/${id}.md`, body.trim() + '\n');
await fs.mkdir('course/drafts/data-structures-and-algorithms/t11-031', { recursive: true });

await write('t11-031-overview', `${head} — Big-picture orientation and mental model

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

For example, four permissions can be represented by four low bits. If a flag is at index 2, \`mask = 1u << 2\` selects it; \`value & mask\` tests it, \`value | mask\` sets it, and \`value ^ mask\` toggles it. This is reliable only after defining the bit numbering and making sure index 2 fits the word.

# End-to-end walkthrough

Suppose every number in an array appears twice except one. XOR all values. Each duplicate pair contributes \`x ^ x = 0\`; XORing zero with the singleton leaves it. The method is O(n) time and O(1) extra space, including negative \`int\` bit patterns, but it depends exactly on the “all others occur twice” guarantee. If values can occur three times, this cancellation no longer isolates the answer; count each bit modulo three instead.

# When to use it and tradeoffs

Use bit operations for compact flags, fixed-width representations, parity, population count, and small-set state. Prefer readable Boolean/set representations when the universe is large or the operation is not naturally bitwise. A bitmask DP with n elements has 2^n possible states; a shorter implementation does not make that search scalable.

# What later lessons cover

The references explain operators and shifts, single-bit masks, low-bit identities/counting, and subset enumeration/complexity. The practice problems apply XOR, population count, bit reversal, carry propagation, and masks. Bitmask DP beyond subset enumeration, binary tries, number theory, SIMD, and cryptography are outside this topic.

# Recent language change

C# 11 added \`>>>\`, a direct logical right shift for signed operands. Earlier C# code can cast to an unsigned type before shifting; \`>>\` on signed values remains arithmetic. Current language version is C# 15 as checked 2026-11-16. [C# 11 unsigned right shift](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator) [C# language versions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning)

# Sources

${bibliography}`);

await write('t11-031-concepts', `${head} — Core concepts and how they fit together

# Learning objectives

- Explain the truth table of each bitwise operator and distinguish logical from arithmetic shifts.
- Build correct masks for testing, setting, clearing, toggling, and extracting bits.
- Prove XOR cancellation and low-bit counting methods under explicit assumptions.
- Estimate the state/time cost of subset and submask enumeration.
- Avoid C# signedness, overflow, and shift-count traps.

# Prerequisites

Know binary place values and the fixed-width nature of C# integer types: \`int\`/\`uint\` have 32 bits, while \`long\`/\`ulong\` have 64. Bit index 0 is the least significant bit.

# Core concepts

${conceptList}

# Mechanisms and relationships

## Operators are per-bit truth tables

For each position, AND is 1 only for 1&1; OR is 1 for 1|0, 0|1, or 1|1; XOR is 1 for unequal bits. NOT flips every bit in the operand width. For a byte, \`00001100 & 00001010 = 00001000\`, while XOR gives \`00000110\`. Signed values do not change these bitwise rules, but their width and interpretation affect what the printed result means.

## Shifts and C# width behavior

Left shift moves bits toward the sign/high end and fills zeroes at the low end. Right shift of an unsigned value is logical; C# signed \`>>\` is arithmetic and fills with the sign bit. C# 11 \`>>>\` performs logical right shift on signed input. In C#, the shift count is masked to 5 low bits for 32-bit operands and 6 for 64-bit operands: \`1 << 32\` is therefore equivalent to \`1 << 0\`, not a 32-bit mask. Guard the count and handle full-width extraction separately. [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)

## Masks are small Boolean formulas

To test index i, build \`1u << i\` and AND it with the value. OR sets, AND with complement clears, and XOR toggles. For extracting a range, shift its low endpoint to zero and mask the desired width. Make the type unsigned when the value is a raw bit pattern, and validate indexes against its width.

## Low bits and multiplicity

For nonzero two’s-complement x, \`x & (x - 1)\` removes its least significant set bit, so the loop count equals the population count. \`x & -x\` isolates that bit. XOR cancels pairs because it is associative, commutative, and self-inverse; a singleton among pairs is the XOR of all inputs. If other multiplicities are odd, the XOR result contains their combined contribution and the singleton argument fails.

## Subsets and complexity

With n indexed elements, an n-bit mask defines one subset and there are 2^n masks. Scanning all n bits to emit each subset costs O(n·2^n). For every mask, iterating its submasks takes 3^n total mask/submask pairs. These approaches target small n even though a single bit operation is constant time.

# Worked examples

## Set, test, clear, toggle

For \`value = 0101₂\` and \`mask = 0100₂\`, AND is nonzero (bit 2 is set). OR leaves it set, AND with \`~mask\` clears it (\`0001₂\`), and XOR toggles it (\`0001₂\`). Apply XOR again to recover \`0101₂\`.

## Count bits without a built-in

For \`x = 10110000₂\`, repeatedly replace x with \`x & (x - 1)\`: \`10100000\`, \`10000000\`, \`00000000\`. Three iterations mean three set bits. For signed negatives, first decide whether to count the full 32-bit pattern; convert to \`uint\` if that is the intended interpretation.

## Enumerate a submask

For mask \`1010₂\`, start \`sub = mask\` and repeat \`(sub - 1) & mask\`, yielding \`1010\`, \`1000\`, \`0010\`, then \`0000\`. The common loop stops before zero; include zero explicitly when the empty submask is needed.

# Misconceptions and edge cases

- \`~x\` is width-dependent and is not equivalent to Boolean \`!x\`.
- \`x & (x-1) == 0\` also holds for x=0; include \`x > 0\` in a power-of-two test.
- A signed right shift preserves sign; it does not shift in zeros.
- A shift by 32 in C# does not clear a 32-bit value.
- \`1 << 31\` is a negative signed int bit pattern; use \`1u << 31\` for an unsigned mask.
- XOR can only exploit known even multiplicities; it does not solve arbitrary “one appears once” variants.
- Enumerating all subsets is exponential regardless of low per-mask overhead.

# Knowledge checks with answers

1. What does \`x & (x-1)\` do for nonzero x? **Clears its least significant set bit.**
2. Why does XOR find one singleton among pairs? **Every paired value cancels and only the singleton remains.**
3. What is the difference between \`>>\` and \`>>>\` for a negative C# int? **\`>>\` copies the sign bit; \`>>>\` shifts in zeroes.**
4. How many subsets does n elements have? **2^n.**
5. What is wrong with \`1 << 32\` as a 32-bit full mask? **C# masks the shift count, so it shifts by zero. Handle width separately.**

# Sources

${bibliography}`);

for (const [groupId, items] of Object.entries(grouped)) {
  const group = manifest.inventory.find(x => x.id === groupId);
  const rows = items.map(item => `- \`${item}\` — ${exact[item]}`).join('\n\n');
  await write(`t11-031-reference-${groupId}`, `${head} — Reference: ${group.title}

# Scope and version

The language-specific notes are for current C# 15, checked 2026-11-16. C# 11 introduced the unsigned right-shift operator \`>>>\`. All other names below are the exact supplied inventory items.

# How this group fits the mental model

This group provides the bit-level building blocks for masks and subset state. Begin with fixed-width bit patterns, then reason about an operator’s truth table and the type of its operands. Signedness does not alter AND/OR/XOR truth tables, but it matters for shifts, overflow, casts, and displaying a result.

# Supplied names explained

${rows}

# Cross-item comparison

AND inspects/intersects selected 1-bits; OR sets selected 1-bits; XOR toggles and cancels equal operands. Arithmetic right shift preserves sign; logical right shift fills with zero. Set and toggle differ because setting an already-set bit leaves it set while toggling clears it. \`x & (x-1)\` removes one low set bit, whereas a fixed-width scan examines every position regardless of how many are set. Subset masks compactly encode a set, but recursion can be clearer and works beyond a machine word; neither representation changes the exponential output size.

# Examples

With a 32-bit unsigned value \`0b1010\`, mask bit 1 is \`1u << 1\`. AND tests it, OR sets it, \`value & ~mask\` clears it, and XOR toggles it. For extraction, first validate the requested bit interval, then shift and mask; special-case a range spanning the entire width rather than shifting by the width.

# Common mistakes

- Failing to state whether bit 0 is least significant.
- Applying a signed shift to a raw bit pattern and expecting zero fill.
- Constructing a signed mask at the highest bit without considering the sign.
- Forgetting C# masks the shift count to the operand width.
- Using a fixed-width trick where the universe exceeds that width.
- Quoting O(2^n) while omitting the extra O(n) work to output each subset.

# Knowledge checks with answers

1. What happens when a set bit is toggled twice? **It returns to its original state.**
2. How many submask pairs exist over all masks of n bits? **3^n.**
3. Why does a signed negative number count need an explicit interpretation? **It may mean mathematical magnitude or the full fixed-width two’s-complement pattern.**
4. When is a full-width mask special? **The usual \`(1 << width)-1\` shifts by zero in C# rather than producing all ones; use an explicit all-ones value or branch.**

# Sources

${bibliography}`);
}

const problems = [
  {
    id: 'single-number', title: 'Single Number', method: 'SingleNumber',
    statement: 'Find the value that occurs once when every other value occurs twice, using linear time and constant extra space.',
    approach: 'XOR all values. Each duplicate pair cancels, leaving the singleton.',
    code: `using System;\n\npublic static class SingleNumberSolution\n{\n    public static int SingleNumber(int[] nums)\n    {\n        int answer = 0;\n        foreach (int value in nums)\n        {\n            answer ^= value;\n        }\n\n        return answer;\n    }\n\n    public static void Main()\n    {\n        if (SingleNumber(new[] { 2, 2, 1 }) != 1 ||\n            SingleNumber(new[] { 4, 1, 2, 1, 2 }) != 4 ||\n            SingleNumber(new[] { 1 }) != 1 ||\n            SingleNumber(new[] { -7, 5, 5 }) != -7)\n        {\n            throw new InvalidOperationException("Single Number check failed.");\n        }\n    }\n}`,
    proof: 'XOR is associative/commutative, x XOR x is zero, and x XOR zero is x. Reordering the fold into pairs plus the singleton leaves exactly the singleton. The result depends on every other value occurring an even number of times; the problem’s pair guarantee is sufficient.',
    dry: 'For [4,1,2,1,2], start at 0: 0^4=4, 4^1=5, 5^2=7, 7^1=6, 6^2=4. Each 1 and 2 pair cancels.',
    time: 'O(n), one XOR per value.', space: 'O(1) auxiliary space.',
    tests: 'Use one element; singleton at either end; negative singleton; duplicate pairs in different orders. A triple-occurrence variant is not covered by this proof.'
  },
  {
    id: 'number-of-1-bits', title: 'Number of 1 Bits', method: 'HammingWeight',
    statement: 'Return the Hamming weight (number of set bits) in the 32-bit representation of n.',
    approach: 'Cast the input to uint so right shifts are logical, then clear one lowest set bit per loop.',
    code: `using System;\n\npublic static class HammingWeightSolution\n{\n    public static int HammingWeight(int n)\n    {\n        uint bits = unchecked((uint)n);\n        int count = 0;\n\n        while (bits != 0)\n        {\n            bits &= bits - 1;\n            count++;\n        }\n\n        return count;\n    }\n\n    public static void Main()\n    {\n        if (HammingWeight(11) != 3 ||\n            HammingWeight(128) != 1 ||\n            HammingWeight(2147483645) != 30 ||\n            HammingWeight(-1) != 32)\n        {\n            throw new InvalidOperationException("Hamming Weight check failed.");\n        }\n    }\n}`,
    proof: 'For every nonzero unsigned bit pattern, `bits & (bits-1)` clears exactly its least significant 1 and preserves all other 1-bits. The loop ends at zero, so it increments once per set bit. Casting int to uint preserves the same 32-bit pattern; the negative test demonstrates the full-pattern interpretation outside the supplied positive-input constraints.',
    dry: 'For 11 (`1011₂`): clear low 1 → `1010`, count 1; clear low 1 → `1000`, count 2; clear low 1 → `0000`, count 3.',
    time: 'O(k), where k is the number of set bits; worst case O(32) for a uint.', space: 'O(1) auxiliary space.',
    tests: 'One set bit; alternating bits; maximum positive int; zero if supporting it; -1 as the all-ones 32-bit pattern. The official input constraints are positive.'
  },
  {
    id: 'counting-bits', title: 'Counting Bits', method: 'CountBits',
    statement: 'Return the set-bit count for every integer from zero through n without using a built-in population count.',
    approach: 'Remove the lowest set bit: the remaining value is `i & (i-1)`, whose answer is already computed.',
    code: `using System;\n\npublic static class CountingBitsSolution\n{\n    public static int[] CountBits(int n)\n    {\n        var counts = new int[n + 1];\n\n        for (int value = 1; value <= n; value++)\n        {\n            counts[value] = counts[value & (value - 1)] + 1;\n        }\n\n        return counts;\n    }\n\n    public static void Main()\n    {\n        if (string.Join(",", CountBits(2)) != "0,1,1" ||\n            string.Join(",", CountBits(5)) != "0,1,1,2,1,2" ||\n            string.Join(",", CountBits(0)) != "0")\n        {\n            throw new InvalidOperationException("Counting Bits check failed.");\n        }\n    }\n}`,
    proof: 'The base value 0 has no set bits. For any positive value i, `i & (i-1)` is a smaller nonnegative integer with exactly one fewer set bit. By induction, its stored count is correct, and adding one yields the count for i.',
    dry: 'For n=5: counts[0]=0; 1→0+1=1; 2→0+1=1; 3→2+1=2; 4→0+1=1; 5→4+1=2.',
    time: 'O(n), one constant-time recurrence per value.', space: 'O(n) for the required result array.',
    tests: 'n=0, n=1, powers of two, one below and above a power of two, and n=100000. The loop intentionally avoids built-in popcount.'
  },
  {
    id: 'reverse-bits', title: 'Reverse Bits', method: 'ReverseBits',
    statement: 'Reverse exactly all 32 bit positions of the input value.',
    approach: 'Repeat 32 times: append the input’s least significant bit to the output, then shift input and output by one.',
    code: `using System;\n\npublic static class ReverseBitsSolution\n{\n    public static int ReverseBits(int n)\n    {\n        uint remaining = unchecked((uint)n);\n        uint reversed = 0;\n\n        for (int bit = 0; bit < 32; bit++)\n        {\n            reversed = (reversed << 1) | (remaining & 1u);\n            remaining >>= 1;\n        }\n\n        return unchecked((int)reversed);\n    }\n\n    public static void Main()\n    {\n        if (ReverseBits(43261596) != 964176192 ||\n            ReverseBits(2147483644) != 1073741822 ||\n            ReverseBits(0) != 0 ||\n            ReverseBits(unchecked((int)0x80000000u)) != 1)\n        {\n            throw new InvalidOperationException("Reverse Bits check failed.");\n        }\n    }\n}`,
    proof: 'Before iteration t, `reversed` contains the reverse of the t low input bits in its t low positions, and `remaining` has shifted right t times. Appending the next low bit maintains this invariant. After 32 iterations every original bit has been consumed and occupies its mirrored position. The final unchecked cast preserves the 32-bit pattern in the required int return type.',
    dry: 'For a small illustration, process low bits `1,0,1`: output evolves `0→1→2→5` (binary `1→10→101`). The real algorithm continues with zeroes for all remaining positions until exactly 32 bits have been processed.',
    time: 'O(32), hence O(1) for a fixed 32-bit input.', space: 'O(1) auxiliary space.',
    tests: 'Official examples; zero; input with only bit 31 set (outside official nonnegative constraints) to verify unsigned handling; a pattern with leading zeroes to confirm they become trailing zeroes.'
  },
  {
    id: 'sum-two-integers', title: 'Sum of Two Integers', method: 'GetSum',
    statement: 'Return the sum of two integers without using addition or subtraction operators.',
    approach: 'XOR computes the sum bits without carries. AND identifies carry positions; shift carry left and repeat until no carry remains.',
    code: `using System;\n\npublic static class SumTwoIntegersSolution\n{\n    public static int GetSum(int a, int b)\n    {\n        uint x = unchecked((uint)a);\n        uint y = unchecked((uint)b);\n\n        while (y != 0)\n        {\n            uint carry = (x & y) << 1;\n            x ^= y;\n            y = carry;\n        }\n\n        return unchecked((int)x);\n    }\n\n    public static void Main()\n    {\n        if (GetSum(1, 2) != 3 || GetSum(2, 3) != 5 ||\n            GetSum(-4, 1) != -3 ||\n            GetSum(int.MaxValue, 1) != int.MinValue)\n        {\n            throw new InvalidOperationException("Sum Two Integers check failed.");\n        }\n    }\n}`,
    proof: 'At each bit, XOR gives the addition result assuming no carry-in. A carry is generated exactly where both current bits are 1, represented by `x & y`, and affects the next more significant bit, represented by shifting left. Thus each loop replaces the pair by an equivalent partial sum and pending carry. Carry propagation terminates within the fixed 32-bit word; the final uint-to-int unchecked cast gives the two’s-complement 32-bit result. Official input bounds avoid mathematical overflow; the extra boundary test demonstrates modulo-2^32 behavior.',
    dry: 'For 1+2: x=`0001`, y=`0010`; carry=`0000`, xor=`0011`; y=0, return 3. For 3+1: carry=`0010`, xor=`0010`; next carry=`0100`, xor=`0000`; next carry=`0000`, xor=`0110`, return 4.',
    time: 'O(32) worst case for a fixed-width word; each round propagates at least one carry toward higher positions.', space: 'O(1) auxiliary space.',
    tests: 'Both official examples; positive plus negative; zero operand; a carry across several adjacent ones; int.MaxValue+1 outside official bounds to confirm explicitly chosen unchecked wraparound.'
  },
  {
    id: 'single-number-ii', title: 'Single Number II', method: 'SingleNumber',
    statement: 'Find the one value appearing once when every other value appears exactly three times, in linear time and constant extra space.',
    approach: 'For each of the 32 bit positions, count set bits modulo three. Bits contributed by tripled values vanish; the singleton’s bit remains.',
    code: `using System;\n\npublic static class SingleNumberTwoSolution\n{\n    public static int SingleNumber(int[] nums)\n    {\n        uint answer = 0;\n\n        for (int bit = 0; bit < 32; bit++)\n        {\n            int count = 0;\n            uint mask = 1u << bit;\n\n            foreach (int value in nums)\n            {\n                if ((unchecked((uint)value) & mask) != 0)\n                {\n                    count++;\n                }\n            }\n\n            if (count % 3 != 0)\n            {\n                answer |= mask;\n            }\n        }\n\n        return unchecked((int)answer);\n    }\n\n    public static void Main()\n    {\n        if (SingleNumber(new[] { 2, 2, 3, 2 }) != 3 ||\n            SingleNumber(new[] { 0, 1, 0, 1, 0, 1, 99 }) != 99 ||\n            SingleNumber(new[] { -2, 5, 5, 5 }) != -2)\n        {\n            throw new InvalidOperationException("Single Number II check failed.");\n        }\n    }\n}`,
    proof: 'For a fixed bit position, each value appearing three times contributes either zero or three set bits, which is 0 modulo 3. The singleton contributes either zero or one. Therefore the count modulo three reconstructs exactly that value’s 32-bit pattern. Casting through uint preserves the sign bit; the unchecked cast back restores the signed int result.',
    dry: 'For [2,2,3,2], bit 1 is set in all four values, so count 4 mod 3 = 1 and the answer keeps bit 1. Bit 0 is set only in 3, so count 1 mod 3 = 1 and the answer keeps bit 0. Together these yield 3.',
    time: 'O(32n), which is O(n) for fixed-width 32-bit integers.', space: 'O(1) auxiliary space (32 counters are a constant).',
    tests: 'Official examples; singleton zero; negative singleton including sign bit; repeated negative values; permutations of the input. The exact multiplicity-three guarantee is essential.'
  },
  {
    id: 'bitwise-and-numbers-range', title: 'Bitwise AND of Numbers Range', method: 'RangeBitwiseAnd',
    statement: 'Return the bitwise AND of every integer in the inclusive range [left,right].',
    approach: 'Only the common most-significant prefix can remain set across every value. Shift both endpoints until they match, then restore the removed zero suffix.',
    code: `using System;\n\npublic static class BitwiseAndRangeSolution\n{\n    public static int RangeBitwiseAnd(int left, int right)\n    {\n        uint low = (uint)left;\n        uint high = (uint)right;\n        int shifts = 0;\n\n        while (low != high)\n        {\n            low >>= 1;\n            high >>= 1;\n            shifts++;\n        }\n\n        return (int)(low << shifts);\n    }\n\n    public static void Main()\n    {\n        if (RangeBitwiseAnd(5, 7) != 4 ||\n            RangeBitwiseAnd(0, 0) != 0 ||\n            RangeBitwiseAnd(1, int.MaxValue) != 0 ||\n            RangeBitwiseAnd(8, 15) != 8)\n        {\n            throw new InvalidOperationException("Range AND check failed.");\n        }\n    }\n}`,
    proof: 'As consecutive integers cross a binary boundary, at least one bit in their differing suffix is zero for some value in the interval; AND therefore clears every position below their common prefix. Bits above the common prefix are identical in all values and survive. Right-shifting both endpoints until equal identifies that prefix; shifting it back restores exactly the surviving bits.',
    dry: 'For [5,7], binary endpoints are 0101 and 0111. Shift once: 010 and 011; shift again: 01 and 01. The shared prefix 01 shifted left twice is 0100₂ = 4.',
    time: 'O(w), where w=32 is the word width.', space: 'O(1) auxiliary space.',
    tests: 'Single-element range; ranges sharing all but a low suffix; crossing a power-of-two boundary; [0,int.MaxValue]; endpoints equal and maximum.'
  },
  {
    id: 'subsets-bitmask', title: 'Subsets', method: 'Subsets',
    statement: 'Return every subset of unique input values, including the empty subset, in any order.',
    approach: 'Enumerate integer masks from zero to 2^n-1. For each input index, include its value exactly when the corresponding mask bit is set.',
    code: `using System;\nusing System.Collections.Generic;\n\npublic static class SubsetsBitmaskSolution\n{\n    public static IList<IList<int>> Subsets(int[] nums)\n    {\n        int subsetCount = 1 << nums.Length;\n        var result = new List<IList<int>>(subsetCount);\n\n        for (int mask = 0; mask < subsetCount; mask++)\n        {\n            var subset = new List<int>();\n\n            for (int index = 0; index < nums.Length; index++)\n            {\n                if ((mask & (1 << index)) != 0)\n                {\n                    subset.Add(nums[index]);\n                }\n            }\n\n            result.Add(subset);\n        }\n\n        return result;\n    }\n\n    public static void Main()\n    {\n        IList<IList<int>> result = Subsets(new[] { 1, 2, 3 });\n        if (result.Count != 8 || result[0].Count != 0 ||\n            Subsets(new[] { 0 }).Count != 2 || Subsets(new[] { 0 })[0].Count != 0)\n        {\n            throw new InvalidOperationException("Subsets check failed.");\n        }\n    }\n}`,
    proof: 'Every subset uniquely determines one bit per input position: 1 means included and 0 means excluded. The range `[0,2^n)` contains every n-bit pattern exactly once, and the inner loop includes exactly the positions marked 1. Therefore each possible subset is emitted once, including mask zero for the empty subset.',
    dry: 'For nums=[1,2,3]: mask 000 emits []; 001 emits [1]; 010 emits [2]; 011 emits [1,2]; continuing through 111 emits [1,2,3]. Eight masks produce all 2^3 subsets.',
    time: 'O(n·2^n): there are 2^n masks and each scans n positions. Constructing output itself is exponential.',
    space: 'O(n·2^n) for all emitted element references in the worst case, plus per-subset list overhead. Auxiliary working space excluding output is O(n).',
    tests: 'n=1; n=10 maximum constraint gives 1024 subsets; empty subset included; zero is treated as a value, not as an empty marker; unique values assumed by the prompt.'
  }
];

for (const problem of problems) {
  const frozen = manifest.practiceProblems.find(item => item.id === problem.id);
  if (!frozen) throw new Error('Missing frozen problem: ' + problem.id);
  const examples = frozen.examples.map(example => `- \`${example.input}\` → \`${example.output}\``).join('\n');
  const constraints = frozen.constraints.map(item => `- ${item}`).join('\n');
  const text = `# ${manifest.title} — Problem: ${frozen.name}

# Goals

- Recognize the bit pattern invariant behind ${frozen.name}.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

${frozen.statement}

# Input constraints

${constraints}

# Examples with expected output

${examples}

# Clarifying assumptions

Inputs follow the frozen problem guarantee. C# \`int\` is 32-bit signed; the solutions that manipulate raw patterns cast to \`uint\` and cast back unchecked when needed. This makes the intended two’s-complement word operation explicit.

# Progressive hints

1. Identify the invariant each bit represents: parity, membership, population, or shared prefix.
2. State exactly how every bit or mask contributes to the answer.
3. Use the fixed 32-bit width and handle the sign bit without losing its bit pattern.
4. Check the stated multiplicity/range guarantee; bit tricks depend on it.

# Complete C# solution

\`\`\`csharp dsa-solution
${problem.code}
\`\`\`

# Correctness argument

${problem.proof}

# Step-by-step dry run

${problem.dry}

# Time complexity

${problem.time}

# Space complexity

${problem.space}

# Edge-case tests

${problem.tests}

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative \`int\` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](${frozen.sourceUrls[0]})
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
`;
  await write(`t11-031-practice-${problem.id}`, text);
}

const interview = `# ${manifest.title} — Interview questions and reasoning

# Core questions

1. Explain AND, OR, XOR, and NOT at the per-bit level.
2. How do you test, set, clear, and toggle a bit?
3. What is the difference between arithmetic and logical right shift in C#?
4. Why does XOR find one singleton among pairs, and when does it fail?
5. Prove the \`x & (x-1)\` population-count loop.
6. How many subsets exist for n elements? Why is subset DP limited to small n?
7. Why is \`1 << 32\` not an all-ones 32-bit mask in C#?
8. How can you sum two integers with bitwise operations and no plus/minus?

# Concise interview answers

1. AND yields 1 only for two set bits; OR yields 1 if either is set; XOR yields 1 if they differ; NOT flips the fixed-width pattern.
2. Build a one-bit mask: AND tests, OR sets, AND with complement clears, XOR toggles.
3. Signed \`>>\` copies the sign bit; \`>>>\` shifts in zeros (available since C# 11), and unsigned \`>>\` also shifts logically.
4. Each duplicate pair XORs to zero. It fails if the assumed even-multiplicity grouping does not hold.
5. Subtracting one clears the rightmost set bit and sets lower trailing zeroes; AND with original removes those newly set lower positions, leaving exactly one fewer 1.
6. 2^n. Any algorithm that enumerates all subsets is exponential; scanning n bits to materialize each subset is O(n·2^n).
7. C# masks a 32-bit shift count to five low bits, so 32 becomes zero. Use an explicit uint all-ones mask or a full-width branch.
8. XOR computes sum bits without carry; \`(a & b) << 1\` computes carry bits. Repeat until carry is zero, with fixed-width overflow semantics stated.

# Deep follow-up answers

For bitwise reasoning, annotate the width and signedness before algebra. Algebraic identities such as \`x & -x\` use modular two’s-complement behavior; in checked code or at the minimum signed value, avoid silently assuming ordinary unbounded integers. For C# shifts, counts are masked, not rejected, so validate them. A mask’s universe size is a complexity issue as well as a width issue: 30 elements already means over a billion subsets, even though the mask still fits in 32 bits.

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

${bibliography}
`;
await write('t11-031-interview', interview);

console.log(`Wrote overview, concepts, ${manifest.inventory.length} references, ${problems.length} problem lessons, and interview; covered ${Object.values(grouped).flat().length} exact inventory items.`);
