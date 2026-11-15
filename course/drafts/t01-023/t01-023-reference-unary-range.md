<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Unary and range operators

*This is an automatically generated draft.*

# Scope and version
This lesson covers unary and range operators in C# 15, running on .NET 11 GA. These operators perform operations on a single operand or define ranges for collection indexing. This content is based on the [Microsoft Learn C# operators and expressions reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model
In C#, expressions combine operands and operators to produce values. Unary operators are unique because they act on a single operand, often modifying its state or transforming its type. Range operators provide a concise syntax for slicing collections. These operators sit at the high-precedence end of the expression hierarchy, meaning they are typically evaluated before binary operators like addition or multiplication.

# Supplied names explained
* `Unary plus operator +`: Returns the value of its operand. It is defined for all numeric types.
* `Unary minus operator -`: Computes the numeric negation of its operand.
* `Logical negation operator !`: Reverses the boolean value of its operand (true becomes false, and vice versa).
* `Bitwise complement operator ~`: Performs a bitwise complement operation on its integral operand, flipping every bit.
* `Prefix increment operator ++`: Increments its operand by 1. When used as a prefix, the value is incremented before the result is used in the expression.
* `Prefix decrement operator --`: Decrements its operand by 1. When used as a prefix, the value is decremented before the result is used in the expression.
* `Index-from-end operator ^`: Used in indexers to specify a position relative to the end of a sequence. `^1` refers to the last element.
* `Cast expression (T)`: Explicitly converts an expression to type `T`. This may result in data loss or runtime exceptions if the conversion is invalid.
* `await expression`: Suspends the evaluation of the enclosing async method until the awaited task completes.
* `Address-of operator &`: Returns the memory address of its operand. This requires an `unsafe` context.
* `Pointer indirection operator *`: Accesses the value at the memory address held by a pointer. This requires an `unsafe` context.
* `true operator`: A user-definable operator that returns a `bool` to indicate if an object is considered "true" in conditional contexts.
* `false operator`: A user-definable operator that returns a `bool` to indicate if an object is considered "false" in conditional contexts.
* `Range operator ..`: Creates a `Range` value that specifies the start and end indices of a collection slice.

# Cross-item comparison
Within this group, the `Logical negation operator !` and `Bitwise complement operator ~` are both unary operators that invert their operands, but they operate on different domains: `!` is for boolean logic, while `~` is for bit-level manipulation of integral types. Similarly, the `Prefix increment operator ++` and `Prefix decrement operator --` are counterparts that modify state, whereas the `Index-from-end operator ^` and `Range operator ..` are used specifically for collection navigation and slicing.

# Examples
```csharp
int x = 5;
int y = -x; // Unary minus: y is -5

bool active = true;
bool inactive = !active; // Logical negation: inactive is false

int[] numbers = { 0, 1, 2, 3, 4 };
var slice = numbers[1..^1]; // Range operator: slice is { 1, 2, 3 }
```

# Common mistakes
* **Precedence confusion**: Assuming `++` or `--` behaves the same way when placed after an operand (postfix) versus before (prefix). The prefix version modifies the value before the expression uses it.
* **Unsafe context**: Attempting to use the `Address-of operator &` or `Pointer indirection operator *` without marking the code block or method as `unsafe`.
* **Range bounds**: Misunderstanding that the `Range operator ..` is inclusive of the start index but exclusive of the end index.

# Knowledge checks with answers
1. **Question**: What is the result of `!true`?
   **Answer**: `false`.
2. **Question**: If an array has 5 elements, what does `^1` represent?
   **Answer**: The last element (index 4).
3. **Question**: Does the `Unary plus operator +` change the value of a numeric operand?
   **Answer**: No, it returns the value of the operand as-is.
4. **Question**: Which operator is used to suspend an async method?
   **Answer**: The `await expression`.
