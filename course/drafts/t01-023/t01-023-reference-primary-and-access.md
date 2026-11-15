<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Primary, access, and invocation operators

# Scope and version

This reference lesson covers the exact named primary, access, and invocation operators and expressions defined in the C# language reference snapshot. 

- **Scope boundary:** This document explains only the assigned inventory group: primary, access, and invocation expressions/operators. It excludes statement forms, query expressions, user-defined operator declaration syntax, and operators from other groups unless referenced for comparison.
- **Edition baseline:** C# 15 stable on .NET 11 GA. Memory safety features remain preview-only. Checked on 2026-11-14.
- **Authority and source mapping:** Based on the Microsoft Learn C# operators and expressions reference and language specification [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model

In C#, expressions combine operands and operators to produce values or references. Before arithmetic, logical, or assignment operations can occur, you must first access members, evaluate elements, invoke methods, or instantiate types. 

The primary, access, and invocation operators form the highest-precedence foundation of the expression grammar. They allow you to:
1. Navigate object graphs and type structures (using member access, element access, and pointer access).
2. Guard against null reference exceptions safely (using null-conditional operators and the null-forgiving operator).
3. Execute methods, instantiate objects, query types, allocate memory, and manage overflow safety contexts.

These constructs evaluate operands from left to right, binding tighter than arithmetic or logical operators.

# Supplied names explained

- `Member access operator .`
  - *Purpose and behavior:* Accesses a member (such as a field, property, or method) of a namespace, type, or instance. It evaluates the left-hand operand first, then accesses the named member on the resulting reference or value.

- `Null-conditional member access operator ?.`
  - *Purpose and behavior:* Accesses a member only when its receiver is non-null. For value-producing members, a null receiver generally lifts a non-nullable value result to its nullable form or yields null for reference results; a conditional call to a `void` method remains a `void` expression.

- `Element access operator []`
  - *Purpose and behavior:* Accesses an element of an array, indexer, or pointer. It evaluates the primary expression followed by the index arguments inside the brackets, returning the referenced element value or reference.

- `Null-conditional element access operator ?[]`
  - *Purpose and behavior:* Accesses an element only when its receiver is non-null. If the receiver is null, evaluation short-circuits; value-type element results are nullable-lifted and reference results can be null.

- `Invocation operator ()`
  - *Purpose and behavior:* Invokes a method, delegate, or function pointer. It evaluates the target expression and any argument expressions from left to right, passing the arguments to the callable target and returning its result.

- `Post-increment operator ++`
  - *Purpose and behavior:* Increments its numeric or pointer operand by 1. As a *post*-operator, it evaluates to the original, unincremented value of the operand before the increment side effect takes place.

- `Post-decrement operator --`
  - *Purpose and behavior:* Decrements its numeric or pointer operand by 1. As a *post*-operator, it evaluates to the original, undecremented value of the operand before the decrement side effect takes place.

- `Null-forgiving operator !`
  - *Purpose and behavior:* Also known as the null-suppression operator, it suppresses any nullable warning (`CS8600` or similar) on its operand expression at compile time. It has no runtime effect and compiles down to a direct pass-through of the underlying value.

- `new expression`
  - *Purpose and behavior:* Creates an object, value-type instance, delegate, or collection and performs applicable initialization. A `new` expression does not by itself determine stack-versus-heap storage; storage and lifetime depend on the value's type and use context.

- `typeof expression`
  - *Purpose and behavior:* `typeof(T)` obtains the `System.Type` object for a type (including an unbound generic type) at runtime. Its operand is a type, not a runtime value expression.

- `checked expression`
  - *Purpose and behavior:* Explicitly enables overflow checking for integral-type arithmetic operations and conversions performed within its block or sub-expression. If an overflow occurs, it throws an `OverflowException`.

- `unchecked expression`
  - *Purpose and behavior:* Explicitly disables overflow checking for integral-type arithmetic operations and conversions performed within its block or sub-expression, causing overflowing results to silently wrap around.

- `default expression`
  - *Purpose and behavior:* Produces the default value of a given type. For reference types, this is `null`; for numeric value types, `0`; and for structs, a value where all fields are set to their respective default values.

- `nameof expression`
  - *Purpose and behavior:* Produces the string representation of the name of a variable, type, member, or parameter at compile time. This avoids hardcoding magic strings when refactoring.

- `delegate expression`
  - *Purpose and behavior:* Creates an anonymous method or delegate instance inline, allowing statement blocks or expressions to be treated as delegate objects.

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

- **Misusing the null-conditional operator with value types:** Using `?.` on a non-nullable value type changes the return type to a nullable wrapper (`Nullable<T>`), which can cause type mismatch compilation errors if not handled properly.
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
