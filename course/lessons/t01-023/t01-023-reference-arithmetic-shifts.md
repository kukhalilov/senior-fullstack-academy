
# C# operators, precedence, and operand evaluation — Reference: Arithmetic and shift operators

# Scope and version
This lesson covers arithmetic and bitwise shift operators in C# 15, running on .NET 11 GA. The information is based on the official Microsoft C# language reference and specification as of November 17, 2026.

# How this group fits the mental model
In C#, expressions combine operands (data) and operators (actions) to produce values. Arithmetic and shift operators are fundamental tools for numerical manipulation. Arithmetic operators perform standard mathematical calculations, while shift operators manipulate the binary representation of integral types by moving bits left or right. These operators follow specific precedence rules, meaning they are evaluated in a defined order unless parentheses are used to override that order.

# Supplied names explained

* `Multiplication operator *`: Computes a product for supported numeric operands; user-defined types can overload this operator.
* `Division operator /`: Computes a quotient for supported numeric operands. Integer division truncates toward zero; signed minimum-value divided by -1 overflows.
* `Remainder operator %`: Computes a remainder for supported numeric operands. For integer operands, the nonzero result has the sign of the left operand; floating-point remainder follows the language operation semantics and is not mathematical modulo.
* `Addition operator +`: Computes a sum for supported numeric operands; built-in string and delegate combinations also support `+`, and user-defined types may overload it.
* `Subtraction operator -`: Computes a difference for supported numeric operands; user-defined types can overload this operator.
* `Left-shift operator <<`: Shifts the bits of the left-hand operand to the left by the number of positions specified by the right-hand operand. Vacated positions are filled with zeros.
* `Right-shift operator >>`: Shifts the bits of the left-hand operand to the right. For signed types, the sign bit is propagated (arithmetic shift). For unsigned types, vacated positions are filled with zeros.
* `Unsigned right-shift operator >>>`: Shifts the bits of the left-hand operand to the right, always filling vacated positions with zeros, regardless of the operand's sign. Introduced in C# 11.

# Cross-item comparison

* **Arithmetic vs. Shift**: Arithmetic operators (`*`, `/`, `%`, `+`, `-`) operate on the numerical value of the operands. Shift operators (`<<`, `>>`, `>>>`) operate on the underlying binary bit pattern of integral types.
* **Right-shift variants**: The `>>` operator performs an arithmetic shift (preserving the sign bit for signed integers), whereas `>>>` performs a logical shift (always filling with zeros).

# Examples

```csharp
int a = 10;
int b = 3;

int sum = a + b;       // 13
int product = a * b;   // 30
int remainder = a % b; // 1

int bits = 8;          // Binary: 0000 1000
int left = bits << 1;  // 16 (Binary: 0001 0000)
int right = bits >> 1; // 4  (Binary: 0000 0100)

int signed = -8;       // 32-bit two's-complement value ends in ...1111 1000
int arith = signed >> 1;  // -4 (sign bit is propagated)
int logical = signed >>> 1; // 2147483644 (high bit is zero-filled)
```

# Common mistakes

* **Integer Division**: Beginners often expect `5 / 2` to result in `2.5`. Because both operands are integers, C# performs integer division, resulting in `2`. Use `5.0 / 2` to get a floating-point result. Division by zero throws; signed minimum divided by `-1` overflows.
* **Numeric promotions**: `byte`, `sbyte`, `short`, `ushort`, and `char` are promoted to `int` for most arithmetic; the result type may therefore differ from the operand type. Mixed numeric operands are converted under the language promotion rules.
* **Shift Overflow**: Shifting by a number of bits greater than or equal to the bit-width of the type (e.g., shifting a 32-bit `int` by 32 or more) uses only the low 5 bits of the shift count for `int`/`uint`, and the low 6 bits for `long`/`ulong` (for example, shifting an `int` by 32 uses an effective count of 0).
* **Checked context**: Shifts and bitwise operations do not overflow and produce the same results in checked and unchecked contexts.
* **Operator Precedence**: Assuming `+` happens before `*`. Multiplication and division have higher precedence than addition and subtraction. Use parentheses `(a + b) * c` to ensure the intended order.

# Knowledge checks with answers

1. **Question**: What is the result of `7 % 3`?
   **Answer**: `1`. The remainder of 7 divided by 3 is 1.

2. **Question**: How does `>>>` differ from `>>` when used on a negative signed integer?
   **Answer**: `>>` preserves the sign bit (filling with 1s for negative numbers), while `>>>` ignores the sign and always fills vacated positions with 0s.

3. **Question**: If you have `int x = 5 / 2;`, what is the value of `x`?
   **Answer**: `2`. Integer division truncates the decimal part.

*Source: [Microsoft C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)*
