<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# operators, precedence, and operand evaluation — Exercises and worked solutions

# Goals
- Practice solving independent problems involving C# operators, operator precedence, associativity, operand evaluation order, and expression forms (C# 15 stable on .NET 11 GA; checked 2026-11-17 [https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15]).
- Develop practical fluency in diagnosing precedence traps, short-circuit behavior, and overflow contexts using selected inventory features.

# Worked example
Consider an expression that mixes a null-coalescing operator `??`, a conditional operator `?:`, and an invocation operator `()`. 
```csharp
string GetDefault() => "fallback";
string? input = null;
string result = input ?? (string.IsNullOrEmpty(input) ? GetDefault() : "active");
Console.WriteLine(result);
```
Expected output:
```text
fallback
```
*Proof idea & dry run*: 
1. `input` is `null`. 
2. The null-coalescing operator `??` evaluates its left-hand side first. Because `input` is `null`, it proceeds to the right-hand side.
3. The right-hand side is a parenthesized conditional expression: `string.IsNullOrEmpty(input) ? GetDefault() : "active"`.
4. `string.IsNullOrEmpty(input)` evaluates to `true`.
5. Therefore, the conditional operator `?:` selects the true branch: `GetDefault()`, which returns `"fallback"`.
6. C# language specifications reference: [Microsoft Learn C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).

# Exercises
1. **Precedence and Short-Circuiting**: Given `int x = 5; bool res = false && (++x > 5);`, what are the final values of `res` and `x`? Explain why `++x` is or is not evaluated. Reference source: [Microsoft Learn C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).
2. **Null-Coalescing Assignment**: Write a self-contained snippet using `??=` to initialize a nullable integer-array variable initialized to null (`int[]? numbers = null;`) with a newly allocated array of 3 elements using a collection expression. Reference source: [Microsoft Learn C# Collection Expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions).
3. **Checked Context Overflow**: Write a snippet using a `checked expression` to multiply `int.MaxValue` by `2`, and catch the resulting `OverflowException`. Reference source: [Microsoft Learn Checked and Unchecked Keywords](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/checked-and-unchecked).

# Progressive hints
- *Hint for Exercise 1*: Remember that `&&` uses short-circuit evaluation. If the left operand is false, the right operand is never evaluated.
- *Hint for Exercise 2*: `??=` assigns the right-hand side only if the left-hand side is `null`. A collection expression syntax looks like `[1, 2, 3]`.
- *Hint for Exercise 3*: Wrap the multiplication operation inside `checked(...)` and enclose it in a `try-catch` block catching `OverflowException`.

# Complete solutions
1. **Solution 1**: `res` is `false`, and `x` remains `5`. Because `&&` is a conditional logical operator, it short-circuits when the left operand is `false`. The prefix increment `++x` on the right side is never executed. Source: [Microsoft Learn C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).
2. **Solution 2**:
   ```csharp
   int[]? numbers = null;
   numbers ??= [10, 20, 30];
   ```
   Source: [Microsoft Learn C# Collection Expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions).
3. **Solution 3**:
   ```csharp
   try
   {
       int factor = 2;
       int value = checked(int.MaxValue * factor);
   }
   catch (OverflowException)
   {
       Console.WriteLine("Overflow caught successfully.");
   }
   ```
   Source: [Microsoft Learn Checked and Unchecked Keywords](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked).

# Tests and edge cases
- *Edge Case 1 (Null Receiver)*: Using the null-conditional member access operator `?.` on a null reference evaluates to `null` rather than throwing a `NullReferenceException`. Source: [Microsoft Learn C# Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/).
- *Edge Case 2 (Unsigned Shift)*: The unsigned right-shift operator `>>>` (introduced in C# 11) always introduces zeros in the high-order bits, unlike the signed right-shift `>>`. Source: [Microsoft Learn C# 11 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11).

# Reflection questions
- How does operand evaluation order differ from operator precedence when dealing with side effects (like increment operators)?
- When should you choose a conditional operator `?:` versus an if-else statement for readability?
