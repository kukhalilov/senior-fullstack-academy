<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Arithmetic and shift operators

*This is an automatically generated draft.*

# Scope and version
This lesson covers arithmetic and bitwise shift operators in C# 15, running on .NET 11 GA. The information is based on the official Microsoft C# language reference and specification as of November 14, 2026.

# How this group fits the mental model
In C#, expressions combine operands (data) and operators (actions) to produce values. Arithmetic and shift operators are fundamental tools for numerical manipulation. Arithmetic operators perform standard mathematical calculations, while shift operators manipulate the binary representation of integral types by moving bits left or right. These operators follow specific precedence rules, meaning they are evaluated in a defined order unless parentheses are used to override that order.

# Supplied names explained

* `Multiplication operator *`: Computes the product of two numeric operands.
* `Division operator /`: Computes the quotient of two numeric operands. For integers, it performs truncation toward zero.
* `Remainder operator %`: Computes the remainder after division of two numeric operands. The sign of the result matches the sign of the dividend.
* `Addition operator +`: Computes the sum of two numeric operands or concatenates two strings.
* `Subtraction operator -`: Computes the difference between two numeric operands.
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

int signed = -8;       // Binary: 1111 1000
int arith = signed >> 1;  // -4 (Binary: 1111 1100)
int logical = signed >>> 1; // 2147483644 (Binary: 0111 1100)
```

# Common mistakes

* **Integer Division**: Beginners often expect `5 / 2` to result in `2.5`. Because both operands are integers, C# performs integer division, resulting in `2`. Use `5.0 / 2` to get a floating-point result.
* **Shift Overflow**: Shifting by a number of bits greater than or equal to the bit-width of the type (e.g., shifting a 32-bit `int` by 32 or more) results in unexpected behavior; C# uses only the lower 5 bits of the shift count for 32-bit integers.
* **Operator Precedence**: Assuming `+` happens before `*`. Multiplication and division have higher precedence than addition and subtraction. Use parentheses `(a + b) * c` to ensure the intended order.

# Knowledge checks with answers

1. **Question**: What is the result of `7 % 3`?
   **Answer**: `1`. The remainder of 7 divided by 3 is 1.

2. **Question**: How does `>>>` differ from `>>` when used on a negative signed integer?
   **Answer**: `>>` preserves the sign bit (filling with 1s for negative numbers), while `>>>` ignores the sign and always fills vacated positions with 0s.

3. **Question**: If you have `int x = 5 / 2;`, what is the value of `x`?
   **Answer**: `2`. Integer division truncates the decimal part.

*Source: [Microsoft C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)*
