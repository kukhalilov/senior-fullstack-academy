<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Relational and type-testing operators

*This is an automatically generated draft.*

# Scope and version
This lesson covers the relational and type-testing operators in C# 15, running on .NET 11 GA. These operators are used to compare values or verify the runtime type of an object. This content is based on the [Microsoft Learn C# operators reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model
In C#, expressions combine operands (data) and operators (logic) to produce results. Relational operators allow you to compare two values to produce a `bool` (true/false) result, which is essential for control flow. Type-testing operators allow you to inspect the nature of an object at runtime, enabling safe casting and polymorphic behavior. Together, these operators form the foundation of conditional logic in your programs.

# Supplied names explained

* `Less-than operator <`: Returns `true` if the left operand is less than the right operand; otherwise, `false`.
* `Greater-than operator >`: Returns `true` if the left operand is greater than the right operand; otherwise, `false`.
* `Less-than-or-equal operator <=`: Returns `true` if the left operand is less than or equal to the right operand; otherwise, `false`.
* `Greater-than-or-equal operator >=`: Returns `true` if the left operand is greater than or equal to the right operand; otherwise, `false`. For built-in floating-point comparisons, any ordered comparison involving `NaN` is false. If you overload `<` or `>`, you must provide both; similarly, `<=` and `>=` are a required pair.
* `is operator`: Checks if the result of an expression is compatible with a given type or matches a pattern. It returns `true` if the runtime value is compatible with the type or matches the pattern; null and incompatible values yield `false`. It does not apply user-defined conversions.
* `as operator`: Attempts to cast an expression to a specified type. If the cast is successful, it returns the object as that type; if the cast fails, it returns `null` instead of throwing an exception.

# Cross-item comparison

* **Relational vs. Type-testing**: The relational operators (`<`, `>`, `<=`, `>=`) compare supported operands (including numeric and user-defined types with operators); they do not automatically use `IComparable<T>`. The type-testing operators (`is`, `as`) are used for runtime type identification and safe conversion.
* **`is` vs. `as`**: The `is` operator tests a runtime type or pattern and returns a Boolean (or assigns a pattern variable when that form is used). The `as` operator attempts a permitted reference, boxing, unboxing, or nullable-value conversion (including applicable type-parameter cases) and yields `null` if it cannot produce the requested type; it does not use user-defined conversions.

# Examples

```csharp
using System;

int a = 5;
int b = 10;

// Relational operators
bool result1 = a < b;  // true
bool result2 = a >= b; // false

object obj = "Hello";

// Type-testing operators
if (obj is string) 
{
    string s = obj as string; // Safe cast
    Console.WriteLine(s.Length); // 5
}
```

# Common mistakes

* **Using `as` with value types**: The `as` operator only works with reference types or nullable value types. Using `as` on a non-nullable value type (like `int`) will result in a compilation error.
* **Confusing `is` with assignment**: The `is` operator checks for type compatibility; it does not assign the value to a variable. Use pattern matching (e.g., `if (obj is string s)`) if you need to both check the type and assign it to a variable in one step.
* **Ignoring nulls with `as`**: Remember that `as` returns `null` if the cast fails. If you do not check for `null` before accessing members of the resulting variable, you may encounter a `NullReferenceException`.

# Knowledge checks with answers

1. **Question**: Which operator should you use if you want to check if an object is a specific type and then immediately use it as that type?
   **Answer**: The `is` operator with a pattern (e.g., `if (obj is string s)`).

2. **Question**: What does the `as` operator return if the object is not of the specified type?
   **Answer**: It returns `null`.

3. **Question**: Can you use the `<` operator to compare two objects of different types?
   **Answer**: Generally, no. The operands must be of types that support the comparison (typically numeric types or types that have overloaded the operator).
