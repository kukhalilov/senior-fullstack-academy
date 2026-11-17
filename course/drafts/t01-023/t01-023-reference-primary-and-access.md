<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Primary, access, and invocation operators

# Scope and version

This reference lesson covers the exact named primary, access, and invocation operators and expressions defined in the C# language reference snapshot. 

- **Scope boundary:** This document explains only the assigned inventory group: primary, access, and invocation expressions/operators. It excludes statement forms, query expressions, user-defined operator declaration syntax, and operators from other groups unless referenced for comparison.
- **Edition baseline:** C# 15 stable on .NET 11 GA. Memory safety features remain preview-only. Checked on 2026-11-17.
- **Authority and source mapping:** Based on the Microsoft Learn C# operators and expressions reference and language specification [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model

In C#, expressions combine operands and operators to produce values or references. Before arithmetic, logical, or assignment operations can occur, you must first access members, evaluate elements, invoke methods, or instantiate types. 

The primary, access, and invocation operators form the highest-precedence foundation of the expression grammar. They allow you to:
1. Navigate object graphs and type structures (using member access, element access, and pointer access).
2. Guard against null reference exceptions safely (using null-conditional operators and the null-forgiving operator).
3. Execute methods, instantiate objects, query types, allocate memory, and manage overflow safety contexts.

These constructs have primary-level precedence and generally evaluate their operands left to right. Conditional access skips subsequent member/element access and invocation arguments when the receiver is null.

# Supplied names explained

- `Member access operator .`
  - *Purpose and behavior:* Accesses a member (such as a field, property, or method) of a namespace, type, or instance. For instance access, the receiver expression is evaluated before the member access; namespace and type qualification is resolved statically.

- `Null-conditional member access operator ?.`
  - *Purpose and behavior:* Accesses a member only when its receiver is non-null. For value-producing members, a null receiver generally lifts a non-nullable value result to its nullable form or yields null for reference results; a conditional call to a `void` method remains a `void` expression.

- `Element access operator []`
  - *Purpose and behavior:* Accesses an element of an array, indexer, or pointer. It evaluates the primary expression followed by the index arguments inside the brackets, returning the referenced element value or reference.

- `Null-conditional element access operator ?[]`
  - *Purpose and behavior:* Accesses an element only when its receiver is non-null. If the receiver is null, evaluation short-circuits; value-type element results are nullable-lifted and reference results can be null.

- `Invocation operator ()`
  - *Purpose and behavior:* Invokes a method, delegate, or function pointer. It evaluates the target expression and any argument expressions from left to right, passing the arguments to the callable target and returning its result.

- `Post-increment operator ++`
  - *Purpose and behavior:* Increments a permitted variable, property, or indexer operand by 1. As a *post*-operator, its expression value is the operand value before increment (with user-defined operator rules applying where overloaded).

- `Post-decrement operator --`
  - *Purpose and behavior:* Decrements a permitted variable, property, or indexer operand by 1. As a *post*-operator, its expression value is the operand value before decrement (with user-defined operator rules applying where overloaded).

- `Null-forgiving operator !`
  - *Purpose and behavior:* Also known as the null-suppression operator, it suppresses any nullable warning (`CS8600` or similar) on its operand expression at compile time. It changes nullable-flow analysis only; it has no runtime effect and does not make a null value safe to dereference.

- `new expression`
  - *Purpose and behavior:* Creates an object, value-type instance, delegate, or collection and performs applicable initialization. A `new` expression does not by itself determine stack-versus-heap storage; storage and lifetime depend on the value's type and use context. C# also has target-typed `new()` syntax where the target type supplies the type argument.

- `typeof expression`
  - *Purpose and behavior:* `typeof(T)` obtains the `System.Type` object for a type (including an unbound generic type) at runtime. Its operand is a type, not a runtime value expression.

- `checked expression`
  - *Purpose and behavior:* Explicitly enables overflow checking for applicable integral arithmetic and conversions textually inside its parenthesized expression. For applicable integral arithmetic or conversions, overflow throws `OverflowException`; decimal overflow throws regardless of checked context, and called method bodies are not placed in that context.

- `unchecked expression`
  - *Purpose and behavior:* Explicitly disables overflow checking for applicable integral arithmetic and conversions textually inside its parenthesized expression; decimal overflow still throws, and division by zero still throws.

- `default expression`
  - *Purpose and behavior:* `default(T)` produces the default value of type `T` (`null` for reference types, zero for numeric types, and the zero-initialized value for a struct). The separate default literal `default` takes its type from context.

- `nameof expression`
  - *Purpose and behavior:* Produces a compile-time string for the name of a variable, type, member, or parameter, avoiding many hard-coded names. Since C# 14, an unbound generic type is permitted (for example, `nameof(List<>)` produces `List`).

- `delegate expression`
  - *Purpose and behavior:* Defines an anonymous-method expression that can be converted to a compatible delegate type; it supports a statement block body.

- `sizeof expression`
  - *Purpose and behavior:* Obtains the size in bytes of a type. `sizeof` for built-in types is permitted in safe code; for other unmanaged types, it requires an unsafe context.

- `stackalloc expression`
  - *Purpose and behavior:* Allocates a block of memory directly on the execution stack. The allocated memory is automatically discarded when the method returns, and it requires an unsafe context or span-based initialization.

- `Pointer member access operator ->`
  - *Purpose and behavior:* Combines pointer dereferencing and member access into a single operation (`x->y` is equivalent to `(*x).y`). It requires an unsafe context.

# Cross-item comparison

Within this assigned group of primary, access, and invocation constructs, several items form direct structural pairs:
- **`Member access operator .` vs. `Null-conditional member access operator ?.`**: Both access object members, but `.` throws a `NullReferenceException` if the receiver is null, whereas `?.` safely short-circuits and returns `null`.
- **`Element access operator []` vs. `Null-conditional element access operator ?[]`**: Similarly, `[]` expects a valid collection instance, whereas `?[]` safely short-circuits to `null` if the target collection reference is null.
- **`checked expression` vs. `unchecked expression`**: Both control arithmetic overflow behavior, but `checked` forces an `OverflowException` on overflow, while `unchecked` suppresses the check and permits wrap-around behavior.
- No other general pairwise comparisons are required within this specific inventory group.

# Examples

The following examples demonstrate how primary, access, and invocation constructs operate together in valid C# code.

```csharp
// Snippet demonstrating primary, instantiation, and member access operators
using System;

class Program
{
    static void Main()
    {
        // new expression and invocation operator ()
        string text = "Hello, C# 15";
        
        // Member access operator . and length property
        int len = text.Length;

        // Element access operator []
        char firstChar = text[0];

        // nameof expression
        string variableName = nameof(text);

        // default expression
        int defaultIntValue = default(int);

        // checked expression block enforcing overflow detection
        int max = int.MaxValue;
        int safeResult = checked(max + 0);

        Console.WriteLine($"{variableName}: {text} (First: {firstChar}, Length: {len})");
    }
}
```

Expected output:
```text
text: Hello, C# 15 (First: H, Length: 12)
```

# Common mistakes

- **Misusing the null-conditional operator with value types:** When a conditional access reaches a non-nullable value-type member, the result is lifted to its nullable form. The receiver itself must be nullable-capable (such as a reference or nullable value); `?.` is not used on an ordinary non-nullable value receiver.
- **Overusing the null-forgiving operator `!`:** Using `!` to silence compiler warnings without ensuring the value is genuinely non-null can lead to unexpected runtime `NullReferenceException` crashes.
- **Confusing post-increment/decrement return values:** Remembering that `++` and `--` in *post* position evaluate to the *original* value before modification can prevent logical off-by-one errors in expressions.
- **Assuming `stackalloc` is safe for large allocations:** Allocating large blocks with `stackalloc` on the execution stack can trigger a `StackOverflowException`.

# Knowledge checks with answers

1. **Question:** What is the difference between `.` and `?.` when evaluating an object reference?
   - **Answer:** The member access operator `.` throws a `NullReferenceException` if the left-hand operand is `null`. The null-conditional member access operator `?.` short-circuits evaluation and returns `null` instead of throwing an exception.

2. **Question:** What does the `nameof` expression evaluate to, and when is it evaluated?
   - **Answer:** It evaluates to a string containing the name of the specified code element (such as a variable, type, or member), and it is resolved completely at compile time.

3. **Question:** How does a `checked` expression affect integral arithmetic operations?
   - **Answer:** A `checked` expression explicitly enforces overflow checking during arithmetic operations and type conversions, throwing an `OverflowException` if the result exceeds the target type's capacity.

***

*Note: This is an automatically generated draft.*
