<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Operator declarations, overloadable operators, checked forms, and generic math contracts

*This is an automatically generated draft.*

# Scope and version
This lesson covers the syntax and design contracts for user-defined operators and generic math interfaces in C# 15 (.NET 11). It focuses on how custom types can implement standard mathematical and logical behaviors. This content is based on the stable C# language specification and does not include preview features like memory-safety extensions.

# How this group fits the mental model
In C#, operators (like `+`, `==`, or `!`) are usually reserved for built-in types. User-defined operators allow your custom classes or structs to behave like native types, making code more readable.

The mental model is twofold:
1. **Operator Overloading:** You define how an operator behaves when applied to your type. Traditional unary and binary operator declarations must be `public static`; C# 14 compound-assignment operators use a separate instance `void` form.
2. **Generic Math Contracts:** These are interfaces (like `IAdditionOperators`) that enforce a consistent "contract" for your types. They allow your types to be used in generic algorithms that perform math, ensuring that if a type supports addition, it does so in a predictable way.

# Supplied names explained

* `Unary operator overload declaration`: Defines behavior for operators with one operand (e.g., `-x`).
* `Binary operator overload declaration`: Defines behavior for operators with two operands (e.g., `x + y`).
* `Checked operator declaration`: Declares a checked form of supported arithmetic, increment/decrement, or explicit conversion operators using `operator checked`; a matching ordinary operator must also be declared.
* `Pairing checked and unchecked operator overloads`: The language requirement that a checked operator has a corresponding ordinary operator declaration in the same type; checked context selects the checked form, unchecked context the ordinary form.
* `Overloadable arithmetic operators`: The set of symbols (`+`, `-`, `*`, `/`, `%`) that can be redefined for custom types.
* `Overloadable bitwise operators`: The set of symbols (`&`, `|`, `^`, `~`) that can be redefined for custom types.
* `Overloadable comparison operators`: The set of symbols (`<`, `>`, `<=`, `>=`) that can be redefined.
* `Overloadable equality operators`: The set of symbols (`==`, `!=`) that can be redefined.
* `Overloadable true operator`: Allows a type to be used in boolean contexts (like `if (myType)`).
* `Overloadable false operator`: The Boolean test counterpart to `operator true`; C# requires `true` and `false` operators as a pair, and conditional logical operators use them.
* `Overloadable increment operator`: The `++` operator follows the declared type’s required signature; prefix/postfix use the same overload declaration and expression result semantics are defined by the language.
* `Overloadable decrement operator`: The `--` operator follows the declared type’s required signature; prefix/postfix use the same overload declaration and expression result semantics are defined by the language.
* `User-defined conditional logical operators via true false and bitwise operators`: `&&` and `||` cannot be overloaded directly. A type can support conditional `&&` using `operator false` and `operator &`, and conditional `||` using `operator true` and `operator |`, with required signatures.
* `Overloadable shift operators`: The `<<` and `>>` operators.
* `Unsigned right shift overload`: The `>>>` operator, specifically for bitwise shifting without sign extension.
* `Operator overload declaration restrictions`: Assignment `=`, `&&`, `||`, `??`, `?:`, `is`, and many other operators cannot be overloaded directly; an overload cannot change precedence. C# 14 adds explicit compound-assignment overloads.
* `Ordinary user-defined operators must be public and static`: Traditional unary/binary operator overloads are declared `public static`; C# 14 explicit compound-assignment operators are a distinct instance-void form.
* `C# 14 explicit compound assignment operator overload`: C# 14 permits a type to declare an instance operator such as `public void operator +=(T value)` to mutate the receiver in place.
* `C# 14 compound assignment operator instance signature`: An explicit compound-assignment operator is non-static, takes one parameter, and returns `void`; checked forms require a corresponding ordinary form.
* `Compound assignment operator fallback to binary operator`: If there is no applicable explicit compound-assignment operator, ordinary compound-assignment rules apply using the binary operator and assignment.
* `At least one operator operand type must contain declaring type`: At least one operand must be the containing type (or relevant type parameter for generic operators), so operators are declared by a participating type.
* `Equality operator paired declaration`: C# requires `==` and `!=` declarations to appear as a pair.
* `Equality and Object.Equals consistency`: A design guideline to keep `==`, `!=`, `Equals`, and `GetHashCode` behavior coherent; the compiler does not require identical implementations.
* `Required relational operator pairs and comparison consistency`: C# requires `<` with `>` and `<=` with `>=`; consistency among their ordering semantics is also a design requirement.
* `Operator overload semantic expectation`: The principle that operators should follow standard mathematical or logical rules (e.g., `+` should not perform subtraction).
* `IAdditionOperators<TSelf,TOther,TResult>`: Generic math interface declaring addition and checked-addition contracts for a self type, right operand type, and result type.
* `ISubtractionOperators<TSelf,TOther,TResult>`: Interface for types that support subtraction.
* `IMultiplyOperators<TSelf,TOther,TResult>`: Interface for types that support multiplication.
* `IDivisionOperators<TSelf,TOther,TResult>`: Interface for types that support division.
* `IComparisonOperators<TSelf,TOther,TResult>`: Generic math interface declaring relational comparison operators with result type `TResult` (commonly `bool`).
* `IEqualityOperators<TSelf,TOther,TResult>`: Generic math interface declaring equality and inequality operators with result type `TResult` (commonly `bool`).
* `IUnaryNegationOperators<TSelf,TResult>`: Interface for types that support the unary `-` operator.
* `IBinaryInteger<TSelf>`: A complex interface for types that behave like integers.
* `INumber<TSelf>`: A base interface for types that support general numeric operations.
* `Generic math static abstract operator contract`: The mechanism allowing interfaces to require static methods on implementing types.
* `Named method versus operator overload`: The design choice to use a method (e.g., `Add()`) instead of an operator when the operation is expensive or non-intuitive.

# Cross-item comparison
* **Operator Overload vs. Named Method:** Use an operator for intuitive, low-cost operations (like adding two vectors). Use a named method for operations that are asymmetric, expensive, or potentially surprising to the user.
* **Implicit vs. Explicit Conversion:** User-defined implicit conversions should be unsurprising and lossless; explicit conversions signal possible loss or failure. Predefined implicit conversions can lose precision.
* **Checked vs. Unchecked:** In a checked context, an applicable checked operator is selected; in an unchecked context, the ordinary operator is selected. The operator body must implement its intended overflow behavior.

# Examples
```csharp
// Example: Implementing an addition operator
public struct Point
{
    public int X, Y;
    public static Point operator +(Point a, Point b) => new Point { X = a.X + b.X, Y = a.Y + b.Y };
}

// Example: Using a Generic Math contract
public readonly record struct MyNumber(int Value) : IAdditionOperators<MyNumber, MyNumber, MyNumber>
{
    public static MyNumber operator +(MyNumber left, MyNumber right) => new(left.Value + right.Value);
    public static MyNumber operator checked +(MyNumber left, MyNumber right) => new(checked(left.Value + right.Value));
}
```


# Common mistakes
1. **Violating Semantics:** Overloading `+` to perform subtraction. Operators should follow the "Principle of Least Astonishment."
2. **Ignoring Consistency:** Overloading `==` without overloading `!=` or failing to override `Equals()` and `GetHashCode()`.
3. **Overusing Operators:** Creating operators for complex operations that are better served by descriptive method names.
4. **Visibility:** Forgetting to mark the operator as `public static`.

# Knowledge checks with answers
1. **Question:** Can you overload the assignment operator (`=`) in C#?
   **Answer:** No, `Operator overload declaration restrictions` prevent the overloading of the assignment operator.
2. **Question:** Why must you provide both `true` and `false` operators?
   **Answer:** C# requires the pair; conditional `&&` and `||` also require the matching `&` or `|` overload and signatures.
3. **Question:** What is the primary benefit of using `IAdditionOperators<TSelf,TOther,TResult>`?
   **Answer:** It allows your type to be used in generic code that requires addition, ensuring the type adheres to a standard contract.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators)*
