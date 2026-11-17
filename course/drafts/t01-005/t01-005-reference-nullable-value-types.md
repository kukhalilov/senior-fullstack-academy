<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Reference: Nullable<T>, lifted operations, pattern checks, and nullable value APIs

# Scope and version

* Automatically generated draft.
* **Topic Scope:** This reference lesson covers the precise inventory group assigned under C# 15 and .NET 11: `Nullable value type`, `Nullable<T>`, `T? nullable value type syntax`, `System.Nullable<T>`, `Nullable<T>.HasValue`, `Nullable<T>.Value`, `Nullable<T>.GetValueOrDefault()`, `Nullable<T>.GetValueOrDefault(T)`, `Nullable.GetUnderlyingType(Type)`, `Nullable<T>.ToString()`, `Nullable<T>.Equals(Object?)`, `Nullable<T>.GetHashCode()`, `Nullable<T>.op_Implicit(T)`, `Nullable<T>.op_Explicit(Nullable<T>)`, `Nullable<T>.operator true`, `Nullable<T>.operator false`, `Lifted unary operator`, `Lifted binary operator`, `Lifted equality operator`, `Nullable value type boxing`, `HasValue check`, `is null pattern on nullable value`, `is not null pattern on nullable value`, `GetValueOrDefault versus Value`, `Nullable<T>.Value InvalidOperationException`, `Nullable enum`, `Nullable numeric value`, `Nullable tuple value`, `default nullable value`, `Null-coalescing operator (??)`, `Null-coalescing assignment operator (??=)`, `Null-conditional operator (?.)`, `Null-conditional element access (?[])`, `Nullable value type conversion`, `Nullable value type generic constraint`, `where T : struct`, `where T : notnull`, `Nullable<T> versus optional domain value`, and `Nullable value type default value`.
* **Source Snapshot & Authority:** Official Microsoft Learn C# language reference and .NET API pages checked on 2026-11-17.
* **Source URLs:** 
  * [Nullable Value Types (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types)
  * [Nullable Reference Types (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)
  * [System.Nullable<T> API (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/api/system.nullable-1)

---

# How this group fits the mental model

In C#, non-nullable value types such as `int`, `bool`, and structs do not represent null. Real-world models may need to distinguish an absent value from a value such as zero, false, or a default enum member.

To solve this, C# provides value types that can encapsulate an underlying value or represent an empty state. Null means no value for a nullable value type (unlike reference types, where it means no object reference). 

The mental model is an optional value: `Nullable<T>` (abbreviated via `T? nullable value type syntax`) represents either no value or a value of underlying non-nullable value type `T`. Do not rely on a particular physical field layout; the CLR and compiler may optimize representation.

---

# Supplied names explained

## Core Types and Syntax
* **Nullable value type**: A value type that can represent its normal range of values plus an additional state representing an absent value.
* **Nullable<T>**: The generic struct that represents either no value or a value of an underlying non-nullable value type `T`.
* **T? nullable value type syntax**: The convenient shorthand language syntax (e.g., `int?`) that translates directly into `Nullable<T>`.
* **System.Nullable<T>**: The fully qualified type name for the nullable value wrapper structure in the `System` namespace.

## State and Retrieval Members
* **Nullable<T>.HasValue**: A read-only Boolean property indicating whether the instance contains an underlying value (`true`) or is empty (`false`).
* **Nullable<T>.Value**: A read-only property returning the underlying value if `HasValue` is `true`, or throwing `InvalidOperationException` if empty.
* **Nullable<T>.GetValueOrDefault()**: Returns the underlying value if present, or the default value of type `T` (`default(T)`) if empty.
* **Nullable<T>.GetValueOrDefault(T)**: Returns the underlying value if present, or the specified fallback argument value if empty.
* **Nullable.GetUnderlyingType(Type)**: A static utility method that returns the underlying type argument `T` if the specified `Type` is a closed generic nullable value type, or `null` otherwise.

## Object Overrides and Equality
* **Nullable<T>.ToString()**: Returns the underlying value's string representation, or an empty string if the nullable instance has no value; formatting behavior comes from the underlying value.
* **Nullable<T>.Equals(Object?)**: Compares nullable values and boxed underlying values according to nullable value equality; two empty nullable values are equal.
* **Nullable<T>.GetHashCode()**: Returns zero when empty and the underlying value's hash code when populated; hash codes can collide and are not stable identifiers.

## Operators and Conversions
* **Nullable<T>.op_Implicit(T)**: Implicit conversion from an underlying value of type `T` to `Nullable<T>`; ordinary assignment syntax uses this conversion.
* **Nullable<T>.op_Explicit(Nullable<T>)**: Metadata name for explicit conversion from `Nullable<T>` to `T`; it throws `InvalidOperationException` when the nullable is empty.
* **Nullable<T>.operator true**: `Nullable<T>` has no `operator true` member. The `true` operator is user-definable for custom types and participates in conditional/logical-operator rules; it is not how nullable values are tested.
* **Nullable<T>.operator false**: `Nullable<T>` has no `operator false` member. The `false` operator is user-definable for custom types and participates in conditional/logical-operator rules; it is not how nullable values are tested.
* **Lifted unary operator**: An applicable unary operator on a non-nullable value type can be lifted to nullable operands; an absent input generally produces an absent result, subject to the language-defined lifted form for that operator.
* **Lifted binary operator**: An applicable binary operator can be lifted to nullable operands. Most lifted arithmetic operators propagate absence; `bool?` `&` and `|` have three-valued behavior, equality returns a non-nullable `bool` with special null rules, and relational operators (`<`, `>`, `<=`, `>=`) return `false` if either operand is null. User-defined operator applicability follows the language rules.
* **Lifted equality operator**: Lifted `==` and `!=` return non-nullable `bool`: two null operands compare equal; exactly one null operand compares unequal; otherwise the underlying operator is applied.
* **Lifted relational operator**: Lifted `<`, `>`, `<=`, and `>=` return non-nullable `bool`; if either nullable operand is null, the result is `false`. This differs from lifted arithmetic, which commonly propagates null.

## Evaluation, Patterns, and Expressions
* **Nullable value type boxing**: The runtime rule where a populated `Nullable<T>` boxes as type `T`, and an empty `Nullable<T>` boxes as a direct `null` reference.
* **HasValue check**: A test for presence before accessing `.Value`; flow analysis can then treat `.Value` as safe for that checked nullable value, provided it isn't independently changed.
* **is null pattern on nullable value**: Pattern matching syntax (`expr is null`) used to determine if a nullable value type lacks an active value.
* **is not null pattern on nullable value**: Pattern matching syntax (`expr is not null`) used to confirm that a nullable value type contains an active value.
* **GetValueOrDefault versus Value**: `.Value` makes absence an exception; `GetValueOrDefault()` silently maps absence to a value. Choose a fallback only if it preserves domain meaning.
* **Nullable<T>.Value InvalidOperationException**: The `InvalidOperationException` thrown when attempting to read `.Value` on an instance where `HasValue` is `false`.

## Specialized Nullable Value Variants
* **Nullable enum**: An enum value wrapped as a nullable type (e.g., `DayOfWeek?`), allowing absence to be distinct from each declared enum value (including any zero/default member).
* **Nullable numeric value**: A numeric value wrapped as a nullable type (e.g., `int?`, `double?`), useful when absence is distinct from zero; mapping to database columns is provider/schema-specific.
* **Nullable tuple value**: A tuple can contain nullable elements (for example, `(string? Name, int? Age)`); the tuple value itself is a struct and can also be nullable as `(string Name, int Age)?`.
* **default nullable value**: The default value of `Nullable<T>`, equivalent to its empty state with `HasValue == false`.

## Null-Handling Operators
* **Null-coalescing operator (??)**: Returns the left operand when non-null/valued; otherwise evaluates and returns the right operand. With nullable value types, the result is generally the underlying type or compatible right operand, not necessarily another nullable wrapper.
* **Null-coalescing assignment operator (??=)**: Assigns the right-hand operand only if the left operand is null; the left operand must be a variable, property, or indexer with a valid setter.
* **Null-conditional operator (?.)**: Skips the member access when the receiver is null and produces a nullable result where applicable; it doesn't suppress exceptions thrown by the member itself.
* **Null-conditional element access (?[])**: Skips element access when the receiver is null; it doesn't suppress bounds or other exceptions when a non-null receiver is indexed.

## Conversions and Constraints
* **Nullable value type conversion**: Nullable conversions include implicit lifting from `T` to `T?`, explicit extraction from `T?` to `T` (which can throw if empty), and lifted underlying conversions; null propagation and overflow follow the applicable conversion rules.
* **Nullable value type generic constraint**: `Nullable<T>` requires a non-nullable value type argument; a generic `where T : struct` method can form `T?`, while `Nullable<U>` itself does not satisfy that constraint.
* **where T : struct**: A generic constraint ensuring type parameter `T` is a non-nullable value type. It excludes `Nullable<U>` itself, so a method constrained this way can construct `T?`.
* **where T : notnull**: A nullable-analysis constraint that produces diagnostics when a nullable type argument is used; it is not a CLR runtime enforcement rule.
* **Nullable<T> versus optional domain value**: Architectural distinction between using system-level `Nullable<T>` wrappers versus custom domain modeling types (such as `Option<T>` or `Maybe<T>`).
* **Nullable value type default value**: Default initialization of `Nullable<T>` yields the empty state; for example, `default(int?)` has `HasValue == false`.

---

# Cross-item comparison

| Feature A | Feature B | Primary Difference |
| :--- | :--- | :--- |
| `Nullable<T>` | `Nullable reference type annotation` | `Nullable<T>` is a distinct runtime value type representing absence or an underlying value; reference annotations guide analysis and metadata without a distinct runtime type or automatic check. |
| `Nullable<T>.Value` | `Nullable<T>.GetValueOrDefault()` | `.Value` throws an `InvalidOperationException` if empty, whereas `GetValueOrDefault()` returns default(T) or a supplied value. Substitution is appropriate only when that fallback preserves domain meaning. |
| `is null pattern on nullable value` | `HasValue check` | Both test absence; `n is null` and `!n.HasValue` are commonly equivalent checks, while `HasValue` exposes the nullable API property directly. |
| `Null-coalescing operator (??)` | `Null-conditional operator (?.)` | `??` selects a fallback when the left operand is absent; `?.` skips member/element access when its receiver is null and can still propagate exceptions from invoked operations. |
| `where T : struct` | `where T : notnull` | The `struct` constraint admits non-nullable value types, not `Nullable<T>`; `notnull` requests nullable-analysis diagnostics for nullable type arguments and is not a CLR runtime check. |
| Lifted arithmetic | Lifted relational comparison | Arithmetic usually propagates null; relational comparisons produce `false` when either operand is null. |

---

# Examples

## Example 1: Basic Declarations and Property Checks
Example of basic syntax, `HasValue`, `.Value`, and `GetValueOrDefault()`:

```csharp
int? nullableAge = null;
int? concreteAge = 30;

// Checking presence using HasValue
if (nullableAge.HasValue)
{
    Console.WriteLine(nullableAge.Value);
}
else
{
    Console.WriteLine("Age is unassigned."); // Executes
}

// Using GetValueOrDefault with a fallback
int safeAge = nullableAge.GetValueOrDefault(18); // Returns 18
```

## Example 2: Pattern Matching and Null-Coalescing Operators
Example of pattern matching and operators:

```csharp
double? temperature = null;

// Pattern matching
string status = temperature is null ? "No reading" : "Reading available";

// Null-coalescing assignment
double currentTemp = temperature ?? 20.5; // Evaluates to 20.5
temperature ??= 25.0; // temperature now holds 25.0
```

## Example 3: Lifted Operators with Nullable Enums and Numerics
Example of lifted arithmetic and nullable enums:

```csharp
int? a = 10;
int? b = null;

// Lifted arithmetic: if an operand is null, the nullable result is null
int? sum = a + b; // Evaluates to null

DayOfWeek? preferredDay = DayOfWeek.Monday;
bool isMonday = preferredDay == DayOfWeek.Monday; // Lifted equality
int? optionalTemperature = null;
bool isBelowFreezing = optionalTemperature < 0; // false: a null operand makes relational comparison false
```

---

# Common mistakes

* **Accessing `.Value` blindly:** Calling `.Value` without establishing presence throws `InvalidOperationException` when empty. Use a presence check, pattern, or fallback that matches the domain.
* **Confusing compiler annotations with runtime enforcement:** `Nullable<T>` is a distinct runtime value type, whereas nullable reference annotations do not create a new CLR type or automatic runtime null checks. Physical representation and optimization are implementation details.
* **Misunderstanding boxing behavior:** Boxing a null `Nullable<T>` results in a literal `null` reference, not a boxed struct instance with `HasValue == false`.

---

# Knowledge checks with answers

1. **Question:** What happens when you invoke `Nullable<T>.Value` on an instance where `HasValue` is `false`?
   * **Answer:** It throws a `System.InvalidOperationException`.

2. **Question:** What is the difference between `Nullable<T>.GetValueOrDefault()` and `Nullable<T>.GetValueOrDefault(T defaultValue)`?
    * **Answer:** The parameterless overload returns `default(T)` when empty; the parameterized overload returns its supplied fallback. Neither throws for an empty nullable.

3. **Question:** How do lifted arithmetic, equality, and relational operators behave when an operand is null?
   * **Answer:** Most lifted arithmetic operations propagate null; nullable `==`/`!=` return non-nullable `bool` with two nulls equal and one null unequal; nullable `<`, `>`, `<=`, and `>=` return `false` if either operand is null. Nullable `bool` also has special `&` and `|` three-valued behavior.

4. **Question:** What does the `where T : struct` generic constraint enforce compared to `where T : notnull`?
    * **Answer:** `where T : struct` restricts `T` to non-nullable value types and excludes `Nullable<U>` as the type argument; `where T : notnull` produces nullable-analysis diagnostics for nullable arguments but is not a general runtime check.
