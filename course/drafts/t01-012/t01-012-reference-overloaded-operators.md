<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Operator declarations, overloadable operators, checked forms, and generic math contracts

*This is an automatically generated draft.*

# Scope and version
This lesson covers the syntax and design contracts for user-defined operators and generic math interfaces in C# 15 (.NET 11). It focuses on how custom types can implement standard mathematical and logical behaviors. This content is based on the stable C# language specification and does not include preview features like memory-safety extensions.

# How this group fits the mental model
In C#, operators (like `+`, `==`, or `!`) are usually reserved for built-in types. User-defined operators allow your custom classes or structs to behave like native types, making code more readable. 

The mental model is twofold:
1. **Operator Overloading:** You define how an operator behaves when applied to your type. This must be `public` and `static`.
2. **Generic Math Contracts:** These are interfaces (like `IAdditionOperators`) that enforce a consistent "contract" for your types. They allow your types to be used in generic algorithms that perform math, ensuring that if a type supports addition, it does so in a predictable way.

# Supplied names explained

* `Unary operator overload declaration`: Defines behavior for operators with one operand (e.g., `-x`).
* `Binary operator overload declaration`: Defines behavior for operators with two operands (e.g., `x + y`).
* `Checked operator declaration`: Allows an operator to handle overflow scenarios explicitly using the `checked` keyword.
* `Pairing checked and unchecked operator overloads`: The practice of providing both versions to ensure safe arithmetic in `checked` contexts and performance in `unchecked` contexts.
* `Overloadable arithmetic operators`: The set of symbols (`+`, `-`, `*`, `/`, `%`) that can be redefined for custom types.
* `Overloadable bitwise operators`: The set of symbols (`&`, `|`, `^`, `~`) that can be redefined for custom types.
* `Overloadable comparison operators`: The set of symbols (`<`, `>`, `<=`, `>=`) that can be redefined.
* `Overloadable equality operators`: The set of symbols (`==`, `!=`) that can be redefined.
* `Overloadable true operator`: Allows a type to be used in boolean contexts (like `if (myType)`).
* `Overloadable false operator`: The counterpart to the `true` operator, required when `true` is overloaded.
* `Overloadable increment operator`: The `++` operator, which must return the incremented value.
* `Overloadable decrement operator`: The `--` operator, which must return the decremented value.
* `Overloadable logical operators`: The `&&` and `||` operators (often implemented via `true`/`false` and `&`/`|`).
* `Overloadable shift operators`: The `<<` and `>>` operators.
* `Unsigned right shift overload`: The `>>>` operator, specifically for bitwise shifting without sign extension.
* `Operator overload declaration restrictions`: Rules preventing the overloading of certain operators (like assignment `=`) or changing operator precedence.
* `Operator must be public and static`: A mandatory requirement for all user-defined operator methods.
* `At least one operator operand type must contain declaring type`: Ensures operators are scoped to the types that define them, preventing global namespace pollution.
* `Equality operator paired declaration`: The requirement that if you overload `==`, you must also overload `!=`.
* `Equality and Object.Equals consistency`: The rule that `==` should behave identically to `Object.Equals` to avoid confusing users.
* `Comparison operator consistency`: The requirement that if you overload `<`, you should logically provide `>` to maintain expected behavior.
* `Operator overload semantic expectation`: The principle that operators should follow standard mathematical or logical rules (e.g., `+` should not perform subtraction).
* `IAdditionOperators<TSelf,TOther,TResult>`: Interface for types that support addition.
* `ISubtractionOperators<TSelf,TOther,TResult>`: Interface for types that support subtraction.
* `IMultiplyOperators<TSelf,TOther,TResult>`: Interface for types that support multiplication.
* `IDivisionOperators<TSelf,TOther,TResult>`: Interface for types that support division.
* `IComparisonOperators<TSelf,TOther,TResult>`: Interface for types that support comparison (`<`, `>`, etc.).
* `IEqualityOperators<TSelf,TOther>`: Interface for types that support equality checks.
* `IUnaryNegationOperators<TSelf,TResult>`: Interface for types that support the unary `-` operator.
* `IBinaryInteger<TSelf>`: A complex interface for types that behave like integers.
* `INumber<TSelf>`: A base interface for types that support general numeric operations.
* `Generic math static abstract operator contract`: The mechanism allowing interfaces to require static methods on implementing types.
* `Named method versus operator overload`: The design choice to use a method (e.g., `Add()`) instead of an operator when the operation is expensive or non-intuitive.

# Cross-item comparison
* **Operator Overload vs. Named Method:** Use an operator for intuitive, low-cost operations (like adding two vectors). Use a named method for operations that are asymmetric, expensive, or potentially surprising to the user.
* **Implicit vs. Explicit Conversion:** Implicit conversions are safe and loss-less; explicit conversions are used when data might be lost or the conversion is expensive.
* **Checked vs. Unchecked:** Checked operators throw exceptions on overflow; unchecked operators wrap around. Providing both allows the consumer to choose the safety level.

# Examples
```csharp
// Example: Implementing an addition operator
public struct Point
{
    public int X, Y;
    public static Point operator +(Point a, Point b) => new Point { X = a.X + b.X, Y = a.Y + b.Y };
}

// Example: Using a Generic Math contract
public struct MyNumber : IAdditionOperators<MyNumber, MyNumber, MyNumber>
{
    public int Value;
    public static MyNumber operator +(MyNumber left, MyNumber right) => new MyNumber { Value = left.Value + right.Value };
}
```
*Note: These examples are unverified.*

# Common mistakes
1. **Violating Semantics:** Overloading `+` to perform subtraction. Operators should follow the "Principle of Least Astonishment."
2. **Ignoring Consistency:** Overloading `==` without overloading `!=` or failing to override `Equals()` and `GetHashCode()`.
3. **Overusing Operators:** Creating operators for complex operations that are better served by descriptive method names.
4. **Visibility:** Forgetting to mark the operator as `public static`.

# Knowledge checks with answers
1. **Question:** Can you overload the assignment operator (`=`) in C#?
   **Answer:** No, `Operator overload declaration restrictions` prevent the overloading of the assignment operator.
2. **Question:** Why must you provide both `true` and `false` operators?
   **Answer:** The compiler requires both to ensure that boolean expressions involving your type can be evaluated correctly in all contexts.
3. **Question:** What is the primary benefit of using `IAdditionOperators<TSelf,TOther,TResult>`?
   **Answer:** It allows your type to be used in generic code that requires addition, ensuring the type adheres to a standard contract.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators)*
