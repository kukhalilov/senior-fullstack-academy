
# C# operators, precedence, and operand evaluation — Reference: Selected composed expression forms

# Scope and version

This lesson covers selected composed expression forms in C# 15, running on .NET 11 GA. These expressions allow for complex data transformation and control flow within a single expression. Memory safety features remain in preview. This content is based on the [Microsoft Learn C# operators and expressions reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model

In C#, expressions are combinations of operands and operators that produce a value or reference. While simple operators (like `+` or `*`) perform basic arithmetic, the "structured expressions" in this group allow you to perform higher-level logic—such as conditional branching, object mutation, or function definition—directly where a value is expected. These forms allow you to write more concise, functional-style code by embedding logic directly into assignments or method arguments.

# Supplied names explained

* `with expression`: Creates a shallow copy of a supported record, struct, tuple, or anonymous type and applies specified member initializers. Referenced objects are not recursively copied.
* `Conditional operator ?:`: A ternary operator that evaluates a boolean expression and returns one of two values based on the result. It acts as a compact `if-else` statement.
* `Lambda expression`: An anonymous function that can contain expressions or statement blocks. It is used extensively for delegates and expression trees.
* `Lambda operator =>`: The token used between a lambda parameter list and body; the same token also introduces expression-bodied members.
* `Anonymous method expression`: A way to define an anonymous function using the `delegate` keyword and a statement block; it converts to a compatible delegate type (not an expression tree).
* `Throw expression`: Allows an exception to be thrown within an expression context, such as a conditional operator or a null-coalescing expression.
* `Collection expression`: A target-typed syntax using square brackets `[]` to create common collection values such as arrays, lists, and spans; C# 12 introduced it.
* `Collection expression with(...) argument element`: A feature introduced in C# 15 that allows passing arguments to the underlying constructor or factory of a collection expression. The `with(...)` element is first and is followed by a comma before ordinary or spread elements.

# Cross-item comparison

* `Lambda expression` vs `Anonymous method expression`: Both define anonymous functions and can capture variables. Anonymous methods can omit the parameter list in supported delegate contexts; lambdas support expression bodies and `static` forms. Both can be async when used in a compatible context, and neither inherently prevents capturing.
* `Lambda operator =>`: This is the structural component that enables the `Lambda expression`. It does not exist as a standalone expression but is the defining syntax for the lambda.
* `Collection expression` vs `Collection expression with(...) argument element`: The former is the base syntax for initializing collections, while the latter is a specific enhancement for advanced scenarios requiring factory or constructor arguments.

# Examples

```csharp
using System;
using System.Collections.Generic;

// with expression
var point = new Point(1, 2);
var moved = point with { X = 10 };

// Conditional operator ?:
int result = (1 > 0) ? 10 : 20;

// Lambda expression and Lambda operator =>
Func<int, int> square = x => x * x;

// Throw expression
string? name = null;
string displayName = name ?? throw new ArgumentNullException(nameof(name));

// Collection expression
int[] numbers = [1, 2, 3];

// Collection expression with(...) argument element (C# 15)
List<int> list = [with(capacity: 10), 1, 2, 3];

record Point(int X, int Y);
```

# Common mistakes

* **Overusing Throw expressions**: While concise, `throw` expressions can make debugging harder if they are nested too deeply within complex logic.
* **Lambda vs. Anonymous Method**: Beginners often confuse the two; remember that `=>` appears in both lambda syntax and expression-bodied members; its meaning follows the surrounding grammar.
* **Collection Expression Type**: Collection expressions are target-typed; provide a compatible target type (such as `int[]`, `List<int>`, or a supported span type). `var values = [1, 2, 3];` has no target type and does not compile.

# Knowledge checks with answers

1. **Question**: Which operator is used to define a lambda expression?
   **Answer**: The lambda operator `=>`.

2. **Question**: What is the primary purpose of a `with expression`?
   **Answer**: To create a copy of an object (record or struct) with specific members modified, preserving the original object.

3. **Question**: Can a `throw` expression be used inside a conditional operator?
   **Answer**: Yes, for example: `var x = condition ? value : throw new Exception();`.

4. **Question**: What version introduced the `with(...)` argument element for collection expressions?
   **Answer**: C# 15 ([Source](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).

