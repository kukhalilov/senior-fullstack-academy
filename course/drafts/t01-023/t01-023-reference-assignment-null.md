<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Reference: Assignment and null-coalescing operators

*Draft: Automatically generated.*

# Scope and version
This lesson covers assignment and null-coalescing operators in C# 15, running on .NET 11 GA. These operators are fundamental to state management and handling nullability in C#. For further details, refer to the [Microsoft Learn C# operators reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# How this group fits the mental model
In C#, expressions combine operands and operators to produce values. Assignment operators update the state of a variable, while null-coalescing operators provide a concise way to handle `null` values by providing a fallback. These operators allow you to transform data and manage variable state efficiently, often reducing the need for verbose `if-else` blocks.

# Supplied names explained

* `Simple assignment operator =`: Sets the value of the left-hand operand to the value of the right-hand operand.
* `Compound addition assignment operator +=`: Adds the right-hand operand to the left-hand operand and assigns the result to the left-hand operand.
* `Compound subtraction assignment operator -=`: Subtracts the right-hand operand from the left-hand operand and assigns the result to the left-hand operand.
* `Compound multiplication assignment operator *=`: Multiplies the left-hand operand by the right-hand operand and assigns the result to the left-hand operand.
* `Compound division assignment operator /=`: Divides the left-hand operand by the right-hand operand and assigns the result to the left-hand operand.
* `Compound remainder assignment operator %=`: Computes the remainder of the division of the left-hand operand by the right-hand operand and assigns the result to the left-hand operand.
* `Compound bitwise AND assignment operator &=`: Performs a bitwise AND on both operands and assigns the result to the left-hand operand.
* `Compound bitwise XOR assignment operator ^=`: Performs a bitwise XOR on both operands and assigns the result to the left-hand operand.
* `Compound bitwise OR assignment operator |=`: Performs a bitwise OR on both operands and assigns the result to the left-hand operand.
* `Compound left-shift assignment operator <<=`: Shifts the left-hand operand left by the number of bits specified by the right-hand operand and assigns the result to the left-hand operand.
* `Compound right-shift assignment operator >>=`: Shifts the left-hand operand right by the number of bits specified by the right-hand operand and assigns the result to the left-hand operand.
* `Compound unsigned right-shift assignment operator >>>=`: Shifts the left-hand operand right (filling with zeros) by the number of bits specified by the right-hand operand (introduced in C# 11).
* `Null-coalescing operator ??`: Returns the value of its left-hand operand if it is not `null`; otherwise, it returns the right-hand operand.
* `Null-coalescing assignment operator ??=`: Assigns the value of the right-hand operand to the left-hand operand only if the left-hand operand is `null`.
* `Conditional access assignment`: Allows assigning a value to a member only if the receiver is not `null` (e.g., `receiver?.Property = value;`, supported since C# 14).
* `Conditional ref expression`: A ternary-like expression that returns a reference to one of two variables based on a boolean condition (e.g., `ref var result = ref (condition ? ref a : ref b);`).

# Cross-item comparison
* **Null-coalescing vs. Null-coalescing assignment**: `??` is an expression that evaluates to a value without modifying the original variable. `??=` is a statement-like operator that modifies the variable if it is currently `null`.
* **Simple vs. Compound assignment**: Simple assignment replaces the value entirely. Compound assignment operators perform an operation (like addition or bitwise logic) before storing the result back into the same variable.

# Examples

```csharp
int x = 10;
x += 5; // x is now 15

string? name = null;
string result = name ?? "Default"; // result is "Default"

name ??= "Assigned"; // name is now "Assigned"

// Conditional access assignment (C# 14+)
myObject?.Value = 100; 

// Conditional ref expression
int a = 1, b = 2;
bool condition = true;
ref int r = ref (condition ? ref a : ref b);
r = 10; // a is now 10
```

# Common mistakes
* **Misunderstanding `??`**: Using `??` does not change the variable on the left; it only provides a fallback value for the expression.
* **Order of operations**: Compound assignment operators have lower precedence than most other operators. Always use parentheses if you are unsure about the evaluation order.
* **Nullability**: Attempting to use `??=` on a non-nullable value type will result in a compiler warning or error, as the variable can never be `null`.

# Knowledge checks with answers
1. **Question**: If `int x = 5;`, what is the value of `x` after `x *= 2 + 3;`?
   * **Answer**: 25. The expression is evaluated as `x = x * (2 + 3)`.
2. **Question**: What is the difference between `??` and `??=`?
   * **Answer**: `??` is a null-coalescing operator that returns a value; `??=` is a null-coalescing assignment operator that updates the variable if it is `null`.
3. **Question**: Can you use `?.` for assignment?
   * **Answer**: Yes, conditional access assignment (e.g., `obj?.Prop = val;`) is supported as of C# 14.
