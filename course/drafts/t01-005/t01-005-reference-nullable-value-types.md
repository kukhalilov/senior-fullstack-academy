<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Reference: Nullable<T>, lifted operations, pattern checks, and nullable value APIs

# Scope and version

* Automatically generated draft.
* **Topic Scope:** This reference lesson covers the precise inventory group assigned under C# 15 and .NET 11: `Nullable value type`, `Nullable<T>`, `T? nullable value type syntax`, `System.Nullable<T>`, `Nullable<T>.HasValue`, `Nullable<T>.Value`, `Nullable<T>.GetValueOrDefault()`, `Nullable<T>.GetValueOrDefault(T)`, `Nullable.GetUnderlyingType(Type)`, `Nullable<T>.ToString()`, `Nullable<T>.Equals(Object?)`, `Nullable<T>.GetHashCode()`, `Nullable<T>.op_Implicit(T)`, `Nullable<T>.op_Explicit(Nullable<T>)`, `Nullable<T>.operator true`, `Nullable<T>.operator false`, `Lifted unary operator`, `Lifted binary operator`, `Lifted equality operator`, `Nullable value type boxing`, `HasValue check`, `is null pattern on nullable value`, `is not null pattern on nullable value`, `GetValueOrDefault versus Value`, `Nullable<T>.Value InvalidOperationException`, `Nullable enum`, `Nullable numeric value`, `Nullable tuple value`, `default nullable value`, `Null-coalescing operator (??)`, `Null-coalescing assignment operator (??=)`, `Null-conditional operator (?.)`, `Null-conditional element access (?[])`, `Nullable value type conversion`, `Nullable value type generic constraint`, `where T : struct`, `where T : notnull`, `Nullable<T> versus optional domain value`, and `Nullable value type default value`.
* **Source Snapshot & Authority:** Validated against Microsoft Learn C# language reference and .NET 11 API reference checked on 2026-11-14.
* **Source URLs:** 
  * [Nullable Value Types (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types)
  * [Nullable Reference Types (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)
  * [System.Nullable<T> API (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/api/system.nullable-1)

---

# How this group fits the mental model

In C#, value types (like `int`, `bool`, or custom structs) cannot normally hold a `null` value because they always occupy memory representing an actual value of their type. However, real-world data models frequently require representing the absence of a value for integers, dates, and enums—such as an unset birth date or an unassigned database identifier. 

To solve this, C# provides value types that can encapsulate an underlying value or represent an empty state. Null means no value for a nullable value type (unlike reference types, where it means no object reference). 

The mental model rests on a transparent wrapper: `Nullable<T>` (abbreviated via `T? nullable value type syntax`) wraps any underlying value type `T` where `T : struct`. It maintains a boolean flag tracking whether a value is present, alongside storage for the value itself.

---

# Supplied names explained

## Core Types and Syntax
* **Nullable value type**: A value type that can represent its normal range of values plus an additional state representing an absent value.
* **Nullable<T>**: The core generic struct type in the base class library that implements nullable value capability.
* **T? nullable value type syntax**: The convenient shorthand language syntax (e.g., `int?`) that translates directly into `Nullable<T>`.
* **System.Nullable<T>**: The fully qualified namespace and type definition for the nullable wrapper structure.

## State and Retrieval Members
* **Nullable<T>.HasValue**: A read-only boolean property indicating whether the current instance has a valid underlying value (`true`) or is empty/null (`false`).
* **Nullable<T>.Value**: A read-only property returning the underlying value if `HasValue` is `true`, or throwing an exception if empty.
* **Nullable<T>.GetValueOrDefault()**: Returns the underlying value if present, or the default value of type `T` (`default(T)`) if empty.
* **Nullable<T>.GetValueOrDefault(T)**: Returns the underlying value if present, or the specified fallback argument value if empty.
* **Nullable.GetUnderlyingType(Type)**: A static utility method that returns the underlying type argument `T` if the specified `Type` is a closed generic nullable value type, or `null` otherwise.

## Object Overrides and Equality
* **Nullable<T>.ToString()**: Returns the string representation of the underlying value, or an empty string (`string.Empty`) if the nullable instance has no value.
* **Nullable<T>.Equals(Object?)**: Compares this instance to another object for equality, accounting for boxed values and missing states.
* **Nullable<T>.GetHashCode()**: Computes a hash code for the nullable instance, returning zero if empty or the underlying value's hash code if populated.

## Operators and Conversions
* **Nullable<T>.op_Implicit(T)**: Implicit conversion operator that allows a normal value of type `T` to be assigned directly to a `Nullable<T>` without explicit casting.
* **Nullable<T>.op_Explicit(Nullable<T>)**: Explicit cast operator that extracts a value of type `T` from a `Nullable<T>`, throwing an exception if the instance is empty.
* **Nullable<T>.operator true**: Boolean operator support enabling nullable value types to participate in conditional evaluation under specific compiler rules.
* **Nullable<T>.operator false**: Boolean operator counterpart to `operator true`.
* **Lifted unary operator**: Automatic lifting of unary operators (such as `+`, `-`, `!`) so that if the operand is null, the result is null.
* **Lifted binary operator**: Automatic lifting of binary operators (such as `+`, `-`, `*`, `/`) so that if any operand is null, the result is null.
* **Lifted equality operator**: Automatic lifting of comparison operations (such as `==`, `!=`) enabling safe null-aware comparisons.

## Evaluation, Patterns, and Expressions
* **Nullable value type boxing**: The runtime rule where a populated `Nullable<T>` boxes as type `T`, and an empty `Nullable<T>` boxes as a direct `null` reference.
* **HasValue check**: Explicit conditional checking of the `HasValue` property to ensure safety before accessing `.Value`.
* **is null pattern on nullable value**: Pattern matching syntax (`expr is null`) used to determine if a nullable value type lacks an active value.
* **is not null pattern on nullable value**: Pattern matching syntax (`expr is not null`) used to confirm that a nullable value type contains an active value.
* **GetValueOrDefault versus Value**: The safety design choice between calling `GetValueOrDefault()` to gracefully fallback versus accessing `.Value` directly and risking an exception.
* **Nullable<T>.Value InvalidOperationException**: The specific runtime exception thrown when attempting to read `.Value` on an instance where `HasValue` is `false`.

## Specialized Nullable Value Variants
* **Nullable enum**: An enumeration value wrapped as a nullable type (e.g., `DayOfWeek?`), allowing an unset enumeration state.
* **Nullable numeric value**: A numeric value wrapped as a nullable type (e.g., `int?`, `double?`), commonly used for nullable database fields.
* **Nullable tuple value**: A tuple structure containing nullable elements or a tuple instance itself wrapped in nullability context.
* **default nullable value**: The uninitialized state of a nullable value type, which evaluates to having `HasValue == false`.

## Null-Handling Operators
* **Null-coalescing operator (??)**: Returns the left-hand operand if it is not null; otherwise, evaluates and returns the right-hand operand.
* **Null-coalescing assignment operator (??=)**: Assigns the right-hand operand to the left-hand variable only if the left-hand variable evaluates to null/empty.
* **Null-conditional operator (?.)**: Evaluates an operand and short-circuits to null if the operand is null, preventing null reference exceptions.
* **Null-conditional element access (?[])**: Safely accesses elements in a collection or array index conditionally, returning null if the collection reference is null.

## Conversions and Constraints
* **Nullable value type conversion**: Converting between nullable and non-nullable types or compatible underlying numeric conversions.
* **Nullable value type generic constraint**: Restricting generic type parameters in type definitions.
* **where T : struct**: A generic constraint ensuring type parameter `T` is a non-nullable value type, which permits `Nullable<T>` wrapping.
* **where T : notnull**: A generic constraint enforcing that type parameter `T` cannot be null (introduced in modern C# language updates).
* **Nullable<T> versus optional domain value**: Architectural distinction between using system-level `Nullable<T>` wrappers versus custom domain modeling types (such as `Option<T>` or `Maybe<T>`).
* **Nullable value type default value**: The baseline unassigned value behavior where `default(int?)` yields an empty nullable instance.

---

# Cross-item comparison

| Feature A | Feature B | Primary Difference |
| :--- | :--- | :--- |
| `Nullable<T>` | `Nullable reference type annotation` | `Nullable<T>` is a runtime struct wrapping a value type; reference type annotations are compile-time static analysis rules. |
| `Nullable<T>.Value` | `Nullable<T>.GetValueOrDefault()` | `.Value` throws an `InvalidOperationException` if empty, whereas `GetValueOrDefault()` safely returns a fallback value. |
| `is null pattern on nullable value` | `HasValue check` | Pattern matching (`is null`) provides concise declarative syntax, while `HasValue` is a direct property check. |
| `Null-coalescing operator (??)` | `Null-conditional operator (?.)` | `??` provides a fallback value for nulls, while `?.` safe-navigates member access on object chains. |
| `where T : struct` | `where T : notnull` | `where T : struct` restricts types to value types (including nullable ones), while `where T : notnull` excludes all null types (both nullable value and reference types). |

---

# Examples

## Example 1: Basic Declarations and Property Checks
Unverified code snippet demonstrating basic syntax, `HasValue`, `.Value`, and `GetValueOrDefault()`:

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
Unverified code snippet demonstrating modern pattern matching and operators:

```csharp
double? temperature = null;

// Pattern matching
string status = temperature is null ? "No reading" : "Reading available";

// Null-coalescing assignment
double currentTemp = temperature ?? 20.5; // Evaluates to 20.5
temperature ??= 25.0; // temperature now holds 25.0
```

## Example 3: Lifted Operators with Nullable Enums and Numerics
Unverified code snippet showing lifted arithmetic and nullable enums:

```csharp
int? a = 10;
int? b = null;

// Lifted binary operator: if any operand is null, result is null
int? sum = a + b; // Evaluates to null

DayOfWeek? preferredDay = DayOfWeek.Monday;
bool isMonday = preferredDay == DayOfWeek.Monday; // Lifted equality
```

---

# Common mistakes

* **Accessing `.Value` blindly:** Calling `.Value` without checking `HasValue` or using `??` throws a `Nullable<T>.Value InvalidOperationException`. Always check state first.
* **Confusing compiler annotations with runtime enforcement:** Remember that `Nullable<T>` is a true runtime wrapper struct, whereas nullable reference types (`string?`) have zero runtime memory overhead and perform no runtime checks.
* **Misunderstanding boxing behavior:** Boxing a null `Nullable<T>` results in a literal `null` reference, not a boxed struct instance with `HasValue == false`.

---

# Knowledge checks with answers

1. **Question:** What happens when you invoke `Nullable<T>.Value` on an instance where `HasValue` is `false`?
   * **Answer:** It throws a `System.InvalidOperationException`.

2. **Question:** What is the difference between `Nullable<T>.GetValueOrDefault()` and `Nullable<T>.GetValueOrDefault(T defaultValue)`?
   * **Answer:** The parameterless overload returns `default(T)` when the instance is empty, whereas the parameterized overload returns the explicit `defaultValue` supplied by the caller.

3. **Question:** How does a lifted binary operator behave if one or both operands are null?
   * **Answer:** A lifted binary operator evaluates to `null` if any operand is null.

4. **Question:** What does the `where T : struct` generic constraint enforce compared to `where T : notnull`?
   * **Answer:** `where T : struct` restricts `T` to value types (allowing `Nullable<T>`), whereas `where T : notnull` enforces that `T` cannot be null (excluding nullable value types and nullable reference types).
