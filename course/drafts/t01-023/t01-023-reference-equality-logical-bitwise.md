<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Equality, logical, and bitwise operators

*This is an automatically generated draft.*

# Scope and version
This lesson covers the C# equality, logical, and bitwise operators as defined in the C# 15 stable release on .NET 11 GA. The information provided is based on the official Microsoft Learn C# language reference and specification (checked 2026-11-14).

# How this group fits the mental model
In C#, expressions combine operands (the data) and operators (the actions) to produce values. This group of operators is essential for controlling program flow and comparing data:
*   **Equality/Inequality:** Determine if two values are the same or different.
*   **Bitwise:** Perform operations on the individual bits of integral types.
*   **Logical:** Perform Boolean algebra on `bool` values.
*   **Conditional:** Evaluate expressions while potentially skipping work (short-circuiting).

# Supplied names explained

*   `Equality operator ==`: Returns `true` if the operands are equal; otherwise, `false`. For reference types, it checks if both operands refer to the same object instance, unless the operator is overloaded.
*   `Inequality operator !=`: Returns `true` if the operands are not equal; otherwise, `false`. It is the logical negation of the `==` operator.
*   `Boolean and bitwise AND operator &`: For integral types, it performs a bitwise logical AND. For `bool` operands, it performs a logical AND, evaluating both sides regardless of the result of the first.
*   `Boolean and bitwise XOR operator ^`: For integral types, it performs a bitwise exclusive OR. For `bool` operands, it performs a logical exclusive OR.
*   `Boolean and bitwise OR operator |`: For integral types, it performs a bitwise inclusive OR. For `bool` operands, it performs a logical inclusive OR, evaluating both sides regardless of the result of the first.
*   `Conditional AND operator &&`: Performs a logical AND on `bool` operands. It uses "short-circuiting": if the left operand is `false`, the right operand is not evaluated.
*   `Conditional OR operator ||`: Performs a logical OR on `bool` operands. It uses "short-circuiting": if the left operand is `true`, the right operand is not evaluated.

# Cross-item comparison

*   **`&` vs `&&`**: The `&` operator always evaluates both operands. The `&&` operator is a "short-circuit" operator; it only evaluates the right side if the left side does not determine the final result. Use `&&` for Boolean logic to avoid unnecessary work or potential side effects.
*   **`|` vs `||`**: Similar to the AND operators, `|` evaluates both sides, while `||` short-circuits. Use `||` for Boolean logic to improve performance and safety.
*   **`==` vs `!=`**: These are inverse operations. If `a == b` is `true`, then `a != b` is `false`.

# Examples

```csharp
int a = 5; // Binary: 0101
int b = 3; // Binary: 0011

// Bitwise operations
int andResult = a & b; // 0001 (1)
int orResult = a | b;  // 0111 (7)
int xorResult = a ^ b; // 0110 (6)

// Logical and short-circuiting
bool check = (a > 0) && (b > 0); // Both evaluated
int divisor = 0;
bool safeCheck = (divisor != 0) && (10 / divisor > 1); // Safe: right side is skipped when divisor is 0
```

# Common mistakes

1.  **Confusing `&` with `&&`**: Using `&` in a Boolean condition when you intend to short-circuit can lead to performance issues or runtime errors (e.g., a `NullReferenceException` on the right side even if the left side was `null`).
2.  **Reference vs. Value Equality**: Assuming `==` compares the content of objects rather than their references (unless the type has overloaded the operator, like `string`).

# Knowledge checks with answers

1.  **Question:** If `x` is `false`, what happens when evaluating `x && y`?
    *   **Answer:** The expression short-circuits; `y` is not evaluated, and the result is `false`.
2.  **Question:** What is the difference between `&` and `&&` when used with `bool` operands?
    *   **Answer:** `&` evaluates both operands, while `&&` evaluates the second operand only if necessary (short-circuiting).
3.  **Question:** Which operator would you use to check if two integers are not equal?
    *   **Answer:** The inequality operator `!=`.

*Source: [Microsoft Learn C# Operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)*
