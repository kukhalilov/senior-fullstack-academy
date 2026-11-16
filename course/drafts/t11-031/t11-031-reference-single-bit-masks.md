<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# bitwise operations, masks, and subset enumeration — Reference: Testing and changing individual bits

# Scope and version
This reference lesson covers the exact named feature group **Testing and changing individual bits** under C# 15 semantics [https://usaco.guide/silver/bitwise?lang=cpp, https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning]. This is an automatically generated draft.

Bit-level operations allow developers to manipulate individual binary digits inside fixed-width integers. A bit mask encodes a set or a state where each bit position corresponds to an element or a boolean flag. Understanding single-bit manipulation is a prerequisite for subset enumeration, bit-packing, and high-performance algorithms.

# How this group fits the mental model
In low-level state management, tracking dozens of boolean flags with separate variables is memory-inefficient. Instead, we pack them into a single integer. 

The mental model relies on a fixed-width integer (such as a 32-bit `int` or `uint` in C#) where individual bits are indexed from right to left, starting at index `0` for the least significant bit. To inspect, turn on, turn off, or flip a specific bit at index $i$, we create a "one-bit mask" by shifting the integer `1` left by $i$ positions (`1 << i`). We then combine this mask with our target integer using standard bitwise operators: `&` (AND), `|` (OR), or `^` (XOR).

# Supplied names explained
Every name assigned to this inventory group is explained below in its exact form:

* `One-bit mask 1 shifted by index`
  * **Purpose and behavior**: Creates a pattern with a single `1` bit at a chosen zero-based index. In C#, this is typically written as `1 << index`. This mask forms the building block for all single-bit operations, targeting exactly one position while leaving all other bits unaffected when applied correctly.
* `Test bit`
  * **Purpose and behavior**: Checks whether a specific bit at a given index is set (`1`) or clear (`0`). It uses a bitwise AND operation between the target integer and a one-bit mask: `(value & (1 << index)) != 0`. If the result is non-zero, the bit is set.
* `Set bit`
  * **Purpose and behavior**: Forces a specific bit to `1` regardless of its current state. It uses a bitwise OR operation: `value | (1 << index)`. The OR operator leaves all existing bits unchanged while ensuring the target position becomes `1`.
* `Clear bit`
  * **Purpose and behavior**: Forces a specific bit to `0` regardless of its current state. It uses a bitwise AND combined with the bitwise complement (NOT) of the one-bit mask: `value & ~(1 << index)`. The inverted mask has zeros only at the target position, clearing it while preserving all other bits.
* `Toggle bit`
  * **Purpose and behavior**: Flips a specific bit (turning `0` to `1`, or `1` to `0`). It uses a bitwise XOR operation: `value ^ (1 << index)`. Because XOR with `1` inverts a bit, this toggles the exact position requested.
* `Mask low k bits`
  * **Purpose and behavior**: Isolates the lowest $k$ bits of an integer while clearing all higher bits. This is typically calculated using `(1 << k) - 1`. For example, masking the lowest 3 bits gives `(1 << 3) - 1`, which equals `7` (`0b111` in binary).
* `Extract bit range`
  * **Purpose and behavior**: Isolates a contiguous block of bits from a larger integer. This is performed by first shifting the desired range down to the least significant position and then applying a low-bit mask: `(value >> startIndex) & MaskLowKBits`.
* `Unsigned shift behavior`
  * **Purpose and behavior**: Controls how high-order bits are filled during a right-shift operation. In C#, the signed right shift (`>>`) is arithmetic (replicates the sign bit), whereas the unsigned right-shift operator (`>>>`, introduced in C# 11) is logical and always fills high-order bits with zeros [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator].
* `Shift-count bounds`
  * **Purpose and behavior**: Defines how the language runtime handles shift amounts that meet or exceed the bit width of the type. In C#, for 32-bit types (`int`, `uint`), only the five low-order bits of the shift count are used (masking the count modulo 32); for 64-bit types (`long`, `ulong`), the six low-order bits are used (modulo 64) [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators]. Shifting by 32 on a 32-bit integer actually shifts by 0.
* `Bit-width assumptions`
  * **Purpose and behavior**: Explicitly accounts for the underlying storage size of the integer type (e.g., 32 bits for `int`/`uint`, 64 bits for `long`/`ulong`). Assuming an incorrect bit width leads to unexpected mask failures, sign extension bugs, or overflow miscalculations when dealing with high-order bits such as the sign bit `1 << 31`.

# Cross-item comparison
Within this group, the items operate on individual bit states using masks:
* `Set bit` and `Toggle bit` both modify the target integer, but `Set bit` (`|`) is idempotent (repeating it changes nothing further), whereas `Toggle bit` (`^`) is self-reversing (applying it twice restores the original value).
* `Test bit` is read-only, querying state via `&`, whereas `Set bit`, `Clear bit`, and `Toggle bit` are write operations modifying state via `|`, `& ~`, and `^`.
* `Unsigned shift behavior` and `Shift-count bounds` govern the safety rules and hardware mechanics of how bit positions are calculated across types, whereas the other items represent the specific logical recipes applied using those shifts.

# Examples
The following complete, valid C# snippet demonstrates testing, setting, clearing, and toggling a single bit, along with shift-count safety on a 32-bit integer.

```csharp
using System;

class Program
{
    static void Main()
    {
        int value = 0b0000; // Start with 0
        int index = 2;

        // 1. Set bit at index 2
        value = value | (1 << index);
        Console.Out.WriteLine("After Set bit: " + Convert.ToString(value, 2));

        // 2. Test bit at index 2
        bool isSet = (value & (1 << index)) != 0;
        Console.Out.WriteLine("Test bit 2: " + isSet);

        // 3. Toggle bit at index 2 (turns it back to 0)
        value = value ^ (1 << index);
        Console.Out.WriteLine("After Toggle bit: " + Convert.ToString(value, 2));

        // 4. Clear bit example (ensure bit 3 is cleared)
        int sample = 0b1000; // bit 3 is set
        sample = sample & ~(1 << 3);
        Console.Out.WriteLine("After Clear bit: " + sample);
        
        // 5. Shift-count bounds note: shifting 1 by 32 on int uses count & 31 (shift by 0)
        int wrapCheck = 1 << 32;
        Console.Out.WriteLine("1 << 32 evaluates to: " + wrapCheck);
    }
}
```

Expected output:
```text
After Set bit: 100
Test bit 2: True
After Toggle bit: 0
After Clear bit: 0
1 << 32 evaluates to: 1
```

# Common mistakes
* **Assuming shift-by-width equals zeroed output**: In C#, shifting a 32-bit `int` by 32 (`1 << 32`) does not yield `0`; the shift count is masked to its lowest 5 bits, meaning `1 << 32` is equivalent to `1 << 0`, resulting in `1` [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].
* **Forgetting operator precedence**: Bitwise operators have lower precedence than comparison operators. Writing `value & 1 == 0` evaluates `1 == 0` first. Always use parentheses: `(value & 1) == 0`.
* **Confusing signed and unsigned right shift**: Using arithmetic right shift (`>>`) on negative integers propagates the sign bit (fills high-order bits with ones). Use the unsigned right-shift operator (`>>>`) when logical zero-fill is required [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator].
* **Incorrect bit-width assumptions**: Assuming an `int` has more or fewer than 32 bits when constructing masks like `1 << 31` (which targets the sign bit) can cause unintended sign extension or overflow behavior.

# Knowledge checks with answers
1. **Question**: What C# expression tests whether the bit at index `3` is set in an integer variable `val`?
   * **Answer**: `(val & (1 << 3)) != 0`
2. **Question**: Why does `1 << 32` equal `1` instead of `0` in C# 32-bit integer operations?
   * **Answer**: C# restricts shift counts for 32-bit types to the lowest five bits (`count & 31`), so a shift of 32 is masked to a shift of 0 [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators].
3. **Question**: Which operator should you use to toggle a bit at a specific index, and why?
   * **Answer**: Use the XOR operator (`^`) because XORing a bit with `1` inverts its current state (`0` becomes `1`, and `1` becomes `0`), whereas XORing with `0` leaves it unchanged.

Sources: [Topic reference](https://usaco.guide/silver/bitwise?lang=cpp)
