<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: Integer literal forms and notation

# Scope and version

* **Topic:** Integer literal forms and notation in C#
* **Edition/Scope:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-17 ([Microsoft Learn C# numeric literal reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types))
* **Automatic Generation Notice:** This is an automatically generated draft.

---

# How this group fits the mental model

Integer literals form the bedrock of constant numeric values in C#. Before numbers can participate in arithmetic, assignments, or numeric conversions, the C# compiler must inspect how they are written in source code.

The notation choices—such as base prefixes, trailing suffixes, and grouping characters—instruct the compiler on two critical attributes:
1. **The numerical value** (in decimal, hexadecimal, or binary).
2. **The exact compile-time integer type** (such as `int`, `uint`, `long`, or `ulong`), which subsequently dictates whether implicit or explicit conversions are required.

---

# Supplied names explained

* **Decimal integer literal:** Standard base-10 integer notation written without a prefix (e.g., `42`). It is the most common way to represent everyday whole numbers in source code.
* **Hexadecimal integer literal:** Base-16 integer notation designated by the prefix `0x` or `0X` (e.g., `0x2A`). It uses digits `0`–`9` and letters `a`–`f` (or `A`–`F`) and is frequently used for bitmasks, memory addresses, or byte-level manipulation.
* **Binary integer literal:** Base-2 integer notation designated by the prefix `0b` or `0B` (e.g., `0b00101010`). It allows developers to specify exact bit patterns visually in code.
* **Integer literal type selection:** The compiler rule that automatically assigns a type to an integer literal based on its value and whether a suffix is present, selecting the first type in a sequence that can accommodate the value (`int`, `uint`, `long`, `ulong`).
* **Digit separator _:** The underscore character (`_`) placed between digits (e.g., `1_000_000`) to improve human readability. It is ignored entirely by the compiler during compilation and type selection.
* **Unsigned suffix U or u:** A trailing modifier appended to an integer literal to force its type to be unsigned (`uint` or `ulong` depending on magnitude and other suffixes).
* **Long suffix L or l:** A trailing modifier appended to an integer literal to force its type to be a 64-bit integer (`long` or `ulong`).
* **Combined unsigned long suffix UL, Ul, uL, or ul:** `UL`, `Ul`, `uL`, `ul`, `LU`, `Lu`, `lU`, or `lu` select `ulong`. **Combined unsigned long suffix LU, Lu, lU, or lu** are alternate spellings for the same suffix.

---

# Cross-item comparison

* **Decimal vs. Hexadecimal vs. Binary integer literals:** All three represent identical numeric values if configured correctly (e.g., decimal `42`, hexadecimal `0x2A`, and binary `0b00101010`), but they use different numeral bases and prefixes (`0x`/`0b`/none) to optimize clarity for human readers depending on domain logic.
* **Unsigned suffix U or u vs. Long suffix L or l vs. Combined unsigned long suffix UL:**
  * `U` / `u` forces an unsigned type representation.
  * `L` / `l` selects the first fitting type among `long` and `ulong`.
  * A combined suffix (`UL`, `Ul`, `uL`, `ul`, `LU`, `Lu`, `lU`, or `lu`) selects `ulong`.
* **Digit separator _ vs. Raw digits:** Underscores have zero effect on value, type selection, or runtime performance; they exist solely to chunk long numbers for human readability.

---

# Examples

```csharp
// Unverified code example
// Demonstrating various integer literal forms and notation rules in C#

// 1. Base representations and digit separator _
int decimalValue = 1_000_000;         // Decimal integer literal with Digit separator _
int hexValue = 0x000F_FFFF;           // Hexadecimal integer literal with Digit separator _
int binaryValue = 0b1010_0011_1100;   // Binary integer literal with Digit separator _

// 2. Suffixes and Integer literal type selection
var defaultInt = 42;                  // Fits in int by default
var explicitUint = 42U;               // Unsigned suffix U or u selects uint (or ulong)
var explicitLong = 42L;               // Long suffix L or l selects long
var explicitULong = 42UL;             // Combined unsigned long suffix UL forces ulong
```

---

# Common mistakes

* **Using lowercase letter `l` for the long suffix:** While allowed, lowercase `l` can easily be mistaken for the number `1` in certain fonts or code editors. Prefer uppercase `L` for clarity.
* **Placing digit separators incorrectly:** The `_` character cannot be placed at the very beginning or end of a literal, nor immediately adjacent to a prefix or suffix (e.g., `0x_123` or `123_U` are invalid syntax).
* **Assuming suffixes change runtime behavior:** Suffixes dictate compile-time type selection and prevent or alter implicit narrowing rules, but they do not substitute for proper explicit conversions or overflow boundaries.

---

# Knowledge checks with answers

1. **Question:** What is the primary purpose of the **Digit separator _** in a numeric literal?
   * **Answer:** It improves human readability by grouping digits (e.g., `1_000`), and it is ignored by the compiler without altering the literal's value or type.
2. **Question:** Which compile-time type does a literal end with the **Combined unsigned long suffix UL, Ul, uL, or ul** select?
   * **Answer:** It selects `ulong`.
3. **Question:** How does a **Hexadecimal integer literal** differ syntactically from a **Binary integer literal**?
   * **Answer:** Hexadecimal literals use the prefix `0x` or `0X` with base-16 digits (`0–9`, `a–f`), whereas binary literals use the prefix `0b` or `0B` with base-2 digits (`0` and `1`).
