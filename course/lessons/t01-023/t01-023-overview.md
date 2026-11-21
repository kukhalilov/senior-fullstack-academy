
# C# operators, precedence, and operand evaluation — Big-picture orientation and mental model

# Problem and purpose

In C#, programs perform work by calculating values, inspecting objects, and transforming data. However, write statements like `int result = a + b * c;` and a fundamental question arises: which operation happens first? Does the multiplication happen before the addition, or does evaluation proceed strictly from left to right? Without clear rules, identical code could yield different results depending on how it is interpreted. 

Furthermore, expressions must handle edge cases gracefully—such as avoiding null reference exceptions when navigating object hierarchies, guarding against integer overflow, and efficiently skipping unnecessary logic when a condition is already met. This lesson explores how C# **expressions**—combinations of operands and operators that produce values or references—solve these problems through well-defined execution order, precedence, evaluation rules, and specialized expression forms.

# Plain-language mental model

Think of evaluating a C# expression like solving a complex mathematical formula combined with a set of assembly instructions on a factory assembly line:

1. **Operands and Operators**: **Operands** are the raw materials (like numbers, variables, or object instances), and **operators** are the tools (like `+`, `-`, or `.` for member access) that act on those materials to build something new.
2. **Precedence (The Hierarchy of Tools)**: Just as multiplication takes precedence over addition in standard arithmetic, C# assigns a strict ranking to every operator. Higher-precedence operators bind more tightly when the expression is grouped; this does not mean every higher-precedence operand is evaluated first. Parentheses can change grouping.
3. **Associativity (The Tie-Breaker)**: When operators of the exact same rank sit side-by-side (like `a + b + c`), **associativity** decides how the expression is grouped; operand evaluation order is a separate rule.
4. **Operand Evaluation Order**: Operands are generally evaluated from left to right, but special **short-circuit** constructs act like safety valves—they conditionally skip work entirely if the final outcome is already known (for instance, if the first part of an `&&` check is false).

# How the parts fit together

To understand how expressions execute, you need to see how the major parts fit together in the language architecture:

* **Static Types and Conversions**: Before an operator can run, the compiler checks the static types of its operands. These types determine whether a built-in operator applies or whether an overloaded operator must be invoked.
* **Precedence and Grouping**: The compiler analyzes the expression text to build a syntax tree based on operator precedence and associativity, ensuring high-priority operations are nested deeper in execution order.
* **Operand Evaluation**: As the program runs, individual operands are evaluated, transforming variables and method calls into concrete values.
* **Specialized Expressions**: Beyond basic arithmetic, structured forms—such as pattern tests, range creation, null checks, and conditional logic—compose these operations into expressive, concise transformations.
* **Runtime Contexts**: Execution wrappers like checked contexts affect overflow for applicable integral arithmetic and conversions; decimal overflow throws independently of checked context, while floating-point overflow produces infinity or another non-finite result.

# Concept map

* **Expressions combine operands and operators to produce values or references**: The foundational building blocks of C# logic.
* **Precedence groups operators and associativity resolves operators at the same precedence**: Rules that remove ambiguity in complex equations.
* **Operands are generally evaluated left to right, but short-circuit constructs conditionally skip work**: Execution behavior that dictates when code runs and when it is bypassed.
* **Static types and conversions determine which built-in or overloaded operator applies**: Type safety guarantees that operators receive compatible inputs.
* **Pattern tests, ranges, switch expressions, and with expressions express structured transformations**: Modern constructs that simplify complex data manipulation.
* **Checked context affects overflow behavior for applicable integral operations**: Safety boundaries for arithmetic limits.

# End-to-End walkthrough

Consider a small, practical scenario where a program calculates an adjusted account score using several expression mechanics:

```csharp
// Snippet: Demonstrating operator precedence, null-conditional access, and short-circuiting
int baseScore = 50;
int bonus = 10;
bool isPremium = true;

// Precedence ensures multiplication happens before addition: 50 + (10 * 2) = 70
int calculated = baseScore + bonus * 2;

// Short-circuit evaluation: if isPremium is true, the right side of || is skipped
bool grantsAccess = isPremium || (calculated > 100);

// Null-conditional member access paired with null-coalescing
string? accountName = null;
string displayName = accountName?.ToUpper() ?? "Default User";
```

**Step-by-Step Execution:**
1. **Precedence in `baseScore + bonus * 2`**: The multiplication operator `*` has higher precedence than the addition operator `+`. Therefore, `bonus * 2` evaluates to `20` first, and then `50 + 20` produces `70`.
2. **Short-circuiting in `isPremium || ...`**: The logical OR operator `||` evaluates its left operand (`isPremium`) first. Because `isPremium` is `true`, the short-circuit rule skips evaluating `(calculated > 100)` entirely, as the overall expression is already guaranteed to be true.
3. **Null-conditional safety (`accountName?.ToUpper()`)**: Because `accountName` is `null`, the null-conditional member access operator `?.` halts execution of the method call, safely returning `null` instead of throwing a `NullReferenceException`.
4. **Null-coalescing fallback (`??`)**: The null-coalescing operator `??` detects that the left-hand side resolved to `null`, so it returns the fallback string `"Default User"`.

# When to use it and tradeoffs

**When to use:**
* Use operator precedence rules and parentheses (`()`) to make complex arithmetic and logical conditions unambiguous.
* Use short-circuit operators (`&&`, `||`) to protect downstream operations from running when preconditions fail (such as checking `obj != null && obj.IsValid`).
* Use modern structured expressions (like null-coalescing and conditional access) to write concise, null-safe data pipelines.

**Tradeoffs and pitfalls:**
* **Readability vs. Conciseness**: Relying entirely on complex precedence rules without parentheses can confuse readers. When in doubt, use parentheses to make intent explicit.
* **Side-Effect Ordering**: C# specifies operand evaluation order separately from precedence. Embedding method calls with side effects inside complex expressions (e.g., `a() + b()`) can make behavior hard to follow. Keep operand expressions clean and side-effect-free.

# What later lessons cover

Subsequent lessons and reference catalogs dive deeper into specific operator groups, user-defined operator overloading, pattern matching mechanics (such as switch expressions and exhaustive matching covered in t01-012), query expressions, and statement-level control flow.

## Sources

- [C# operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)
- [C# expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions)
- [C# operator precedence](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/)

