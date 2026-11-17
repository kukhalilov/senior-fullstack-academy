<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

To master C# expressions, you must understand how the compiler interprets code. Expressions are combinations of operands (data) and operators (actions) that produce a value or reference.

*   **How does the compiler decide the order of operations?** It uses **precedence** (which operator acts first) and **associativity** (the direction of evaluation for operators with the same precedence).
*   **What is the difference between `&` and `&&`?** The `&` operator is a bitwise/logical AND that evaluates both sides. The `&&` operator is a **conditional AND**; it performs "short-circuiting," meaning it skips the second operand if the first is false.
*   **How do I handle potential overflows?** You use the `checked expression` or `unchecked expression` to explicitly define whether the runtime should throw an exception when an arithmetic operation exceeds the capacity of the integral type.

# Concise interview answers

*   **Explain `is` vs `as`:** The `is` operator checks if an expression is compatible with a type/pattern and returns a `bool` (or binds a pattern variable). The `as` operator attempts a permitted reference/nullable conversion, returning null if no compatible value exists.
*   **What is the `?.` operator?** It is the **null-conditional member access operator**. It allows you to access a member only if the receiver is not null; otherwise, it returns null, preventing a `NullReferenceException`.
*   **What is the `??` operator?** The **null-coalescing operator** returns the value of its left-hand operand if it is not null; otherwise, it returns the right-hand operand.

# Deep follow-up answers

*   **How does operand evaluation work?** C# generally evaluates operands from left to right. However, short-circuiting operators like `&&`, `||`, and `??` conditionally skip the evaluation of the right-hand operand based on the result of the left.
*   **What changed in C# 15 regarding collections?** You can now use a `Collection expression` that begins with a `with(...)` argument element to pass specific configuration arguments to the underlying collection constructor or factory.
*   **What is the `>>>` operator?** Introduced in C# 11, the **unsigned right-shift operator** shifts bits to the right and fills the vacated high-order bits with zeros, regardless of the sign of the original number.

# Scenario questions

*   **Scenario:** You need to update a property only if an object is not null.
    *   **Solution:** Use the **conditional access assignment** (e.g., `receiver?.Property = value;`). This feature was introduced in C# 14.
*   **Scenario:** You are working with a collection and need to access the last element.
    *   **Solution:** Use the **index-from-end operator** `^`. For example, `array[^1]` constructs an index from the end that selects the last element for an indexable sequence supporting that index.
*   **Scenario:** You need to perform a calculation that might overflow.
    *   **Solution:** Wrap the operation in a `checked expression` to detect applicable integral overflow, or `unchecked expression` to request unchecked behavior for those operations.

# Tradeoffs and alternatives

*   **`!` (Logical negation) vs `~` (Bitwise complement):** Use `!` for boolean logic. Use `~` to invert the individual bits of an integral type.
*   **`==` vs `is`:** `==` applies the type’s equality semantics (which may be reference identity or overloaded value equality). `is` performs a type or pattern test; a constant pattern uses the language’s constant-pattern equality semantics.
*   **`switch` statement vs `switch expression`:** The `switch` statement is for control flow (executing blocks of code). The `switch expression` is for transforming data into a result value.

# Common weak answers

*   **"Operators are always evaluated left to right."** This confuses grouping with operand evaluation. C# defines left-to-right operand evaluation in general, but short-circuit and conditional constructs skip operands/branches; precedence determines grouping.
*   **"The `!` operator is always for negation."** In postfix position, `!` is the null-forgiving operator and changes nullable-flow analysis only; prefix `!` is logical negation.
*   **"I don't need to worry about overflow."** This ignores the `checked` context, which is critical for financial or safety-sensitive calculations.

# Self-check rubric

1.  **Precedence:** Can you explain why `a + b * c` evaluates the multiplication first? (Answer: Multiplication has higher precedence than addition).
2.  **Short-circuiting:** If `x` is null, what happens in `x?.Method() ?? defaultValue`? (Answer: `x?.Method()` returns null, triggering the `??` operator to return `defaultValue`).
3.  **Memory Safety:** Are you aware that memory safety features in C# 15 are still in preview? (Answer: Yes, they are not yet stable).
4.  **Assignment:** Can you distinguish between `??` and `??=`? (Answer: `??` is an expression that returns a value; `??=` is an assignment operator that updates a variable if it is null).

*Sources:*
[Microsoft Learn C# Operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)
[C# Language Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions)
[C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
[C# 14 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14)
[C# 11 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11)
[Checked/Unchecked Keywords](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
[Collection Expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions)
