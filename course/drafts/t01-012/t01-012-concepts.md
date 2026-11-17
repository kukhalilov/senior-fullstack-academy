<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Core concepts and how they fit together

Mark this as an automatically generated draft.

# Learning objectives

By the end of this lesson, you will be able to:
- Explain how user-defined operators and conversions interact with static typing and compiler overload resolution.
- Choose between implicit conversions, explicit conversions, operator overloads, and named methods based on safety, predictability, and domain logic.
- Differentiate pattern matching evaluation rules from user-defined conversion rules.
- Select and compose pattern forms (constant, type, declaration, var, relational, logical, property, positional, list) to test data structures safely.
- Construct clear switch expressions and switch statements, evaluating exhaustiveness across open and closed type hierarchies while keeping pattern guards free of side effects.

---

# Prerequisites

Before studying this topic, you should be familiar with the following concepts:
- **Strong Typing and Static Types**: C# enforces type boundaries at compile time. Every variable and expression has a type known to the compiler.
- **Basic Control Flow**: Conditional branching using `if-else` statements and basic `switch` control structures.
- **Value Types and Reference Types**: The difference between `struct` types (passed by value) and `class` types (passed by reference).

### Key Terms Defined
- **Overload Resolution**: The compile-time process where the compiler selects the best-matching method or operator declaration for a given invocation based on argument types.
- **Pattern Matching**: A language mechanism that tests whether an input expression matches a specific shape, type, or value criteria, and optionally extracts bound variables from it.
- **Exhaustiveness**: Compiler analysis that checks whether recognized alternatives are covered by a decision structure; open runtime domains can still contain unmatched values.

---

# Core concepts

## The Problem
When building custom domain types (such as custom numeric types, financial units, or complex domain models), software needs two distinct capabilities:
1. **Type Integration**: Allowing custom types to transform into other types or participate in familiar arithmetic/logical operations (like `+` or implicit casting).
2. **Structural Inspection**: Testing the shape, state, or subtype of a value at runtime to branch execution cleanly without writing brittle nested conditional logic or unsafe manual casts.

If type transformations silently lose precision or if control flow relies on complex casting logic, code becomes error-prone and hard to maintain.

## The Mental Model
Think of your program logic as divided into two separate systems:

1. **Transformations and Algebra (Conversions & Operators)**:
   You explicitly define how types convert into one another or combine with operators. These rules are applied at compile time based on static types.
2. **Shape and Inspection (Pattern Matching)**:
   You define rules to inspect data values at runtime. Pattern matching evaluates type, property, element, or constant conditions under language rules. User-defined conversions do not affect `is` or `as`; user-defined conversion operators do not create pattern compatibility.

```
+-----------------------------------------------------------------------+
|                            Input Value                                |
+-----------------------------------------------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
[ Compile-Time Transformations ]                  [ Runtime Structural Inspection ]
 - Standard & User-Defined Conversions             - Type & Declaration Patterns
 - Operator Overloads & Named Methods              - Property, Positional, List Patterns
 - Checked / Unchecked Evaluation                  - Relational & Logical Combinators
         |                                                   |
         v                                                   v
Target Type / Arith. Result                       Result / Branch Selected
```

---

# Mechanisms and relationships

## 1. Conversions: Standard, User-Defined, Checked, and Unchecked

A conversion transforms an expression of one type into a target type.

### Built-in vs. User-Defined Conversions
- **Built-in Conversions**: Language-defined conversions such as identity conversions, numeric conversions (e.g., `int` to `double`), implicit reference conversions (derived class to base class), and boxing/unboxing conversions between value types and `object`.
- **User-Defined Conversions**: Methods declared with `operator` syntax on a custom class or struct that allow converting between custom types or between a custom type and a built-in type.

### Implicit vs. Explicit Conversions
- **Implicit Conversion**: Applied automatically when the language defines a conversion for the source and target types. The compiler doesn't guarantee that every implicit conversion preserves information or cannot throw: converting a sufficiently large `long` to `double` can lose integer precision, and a user-defined conversion can execute code that throws. Keep implicit conversions unsurprising and safe for the values the type permits.
- **Explicit Conversion**: Written with a cast such as `(TargetType)value` so the caller acknowledges a conversion that may lose information, change domain meaning, or fail for some values. An explicit conversion can still succeed or fail according to its implementation and the active checked context.

### Checked vs. Unchecked Conversions and Arithmetic
In C#, integral arithmetic and numeric conversions evaluate in either a `checked` or `unchecked` context:
- For integral arithmetic and narrowing integral conversions, a **checked** context throws `OverflowException` when the result is outside the target type's range. In an **unchecked** context, integral overflow wraps or discards high-order bits according to the operation.
- Floating-point-to-integral conversions have different rules: a checked conversion throws when the value is outside the target range, while the result of an out-of-range unchecked conversion is unspecified. Don't generalize integral wraparound behavior to floating-point conversions.
- Since C# 11, the arithmetic operators `+`, `-`, `*`, `++`, and `--`, plus explicit conversion operators, can declare separate checked variants. Other user-defined operators don't gain checked variants merely by being called inside a `checked` block.

```
                  Conversion Classification
                             |
         +-------------------+-------------------+
         |                                       |
  [ Built-in ]                           [ User-Defined ]
         |                                       |
    +----+----+                             +----+----+
    |         |                             |         |
Implicit   Explicit                      Implicit   Explicit
 (Safe)     (Lossy/Cast)                  (Safe)    (Lossy/Cast)
                                            |         |
                                         Checked / Unchecked
                                              Overloads
```

---

## 2. Operator Overloads vs. Named Methods

User-defined operators let custom types participate in expressions using operators like `+`, `-`, `==`, or `>`.

- **Operator Overload**: Used when an operation has clear, well-understood mathematical or logical semantics that are symmetric and non-surprising (for example, adding two `Distance` values).
- **Named Method**: Preferred when an operation is asymmetric, computationally expensive, has side effects, or lacks an universally accepted operator meaning (for example, `CalculateDistanceTo()` instead of overloading an operator).

### Operator Rules and Semantics
- Operators declared in classes and structs must be `public static`; interfaces can declare static abstract or virtual operator contracts for implementing types.
- At least one operand must be of the type declaring the operator.
- Logical and comparison operators must be declared in pairs (e.g., overloading `==` requires overloading `!=`; overloading `<` requires overloading `>`).
- Keep `==`, `!=`, and `Object.Equals` behavior coherent as a design guideline; the compiler requires `==` and `!=` as a pair but does not require identical implementations.

---

## 3. Pattern Matching Mechanics

Pattern matching tests whether an expression matches a given pattern form and optionally binds variables.

### Pattern Categories

| Category | Pattern Form | Syntax Example | Description |
| :--- | :--- | :--- | :--- |
| **Basic** | Constant pattern | `0` or `"active"` | Matches if the input equals a constant expression. |
| **Basic** | Type pattern | `int` | Matches if the runtime type matches the specified type. |
| **Basic** | Declaration pattern | `int n` | Matches the type and binds the result to a new variable. |
| **Basic** | Var pattern | `var x` | Matches any input (including `null`) and binds it to a variable. |
| **Basic** | Discard pattern | `_` | Matches any input without binding a variable. |
| **Relational & Logical** | Relational pattern | `< 0` or `>= 100` | Compares the input against a constant boundary using `<`, `<=`, `>`, or `>=`. |
| **Relational & Logical** | Logical pattern | `not null`, `> 0 and <= 10` | Combines patterns using `and`, `or`, and `not`. |
| **Structural** | Property pattern | `{ Length: > 0 }` | Matches when properties of an object match nested sub-patterns. |
| **Structural** | Positional pattern | `(var x, var y)` | Deconstructs an object using a `Deconstruct` method and matches positional elements. |
| **Structural** | List pattern | `[var head, ..]` | Matches sequence elements by position, length, or slice (`..`). |

### Language Evolution
- C# 8 introduced switch expressions and recursive patterns ([C# 8 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8)).
- C# 9 added relational and logical patterns ([C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)).
- C# 11 added list patterns ([C# 11 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11)).
- C# 15 added union types, closed hierarchies, and labeled break/continue statements ([C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).

---

## 4. Decision Constructs: Switch Expressions vs. Switch Statements

### Switch Expression vs. Switch Statement
- **Switch Statement**: A control-flow statement composed of `case` labels. It executes statements, requires explicit termination (`break`, `return`, or labeled break), and does not produce a value directly.
- **Switch Expression**: A functional syntax construct introduced in C# 8 that evaluates arms and returns a single value.

### Open vs. Closed Hierarchy Exhaustiveness
- **Open Hierarchy**: A general class hierarchy where new derived types can be added. The compiler can't prove that a switch expression handles every possible runtime type, so it reports a non-exhaustive-switch warning; the expression can still compile, but an unmatched value throws `SwitchExpressionException`. A discard arm (`_`) supplies a fallback.
- **Closed Hierarchy**: A finite alternative set, such as a C# 15 closed hierarchy or union type, can let the compiler check that every declared alternative is handled ([C# 15 Features](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)). Enums also support checks against their declared members, but an enum variable can contain an unnamed underlying value, so a fallback may still be needed for runtime safety.

### Pattern Guards
A pattern arm can include a `when` guard clause: `pattern when condition`. The arm selects only if the pattern matches **and** the Boolean guard evaluates to `true`. Switch-expression arms are evaluated in text order. For switch statements, C# doesn't specify the runtime order in which patterns are matched. Keep guards free of side effects so branch selection doesn't depend on mutating state while patterns are considered.

---

# Worked examples

Let's build a complete example demonstrating custom operators, conversions, and pattern matching working together.

### Step 1: Defining a Custom Type with Conversions and Operators

The following code declares a `Distance` value type with user-defined conversions and checked operator support.

```csharp
using System;

public readonly struct Distance : IEquatable<Distance>
{
    public double Meters { get; }

    public Distance(double meters)
    {
        if (!double.IsFinite(meters) || meters < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(meters), "Distance must be finite and nonnegative.");
        }
        Meters = meters;
    }

    // Explicit because negative values are rejected by the constructor.
    public static explicit operator Distance(int meters) => new Distance(meters);

    // Explicit conversion from Distance to int: Potentially lossy (truncates double)
    public static explicit operator int(Distance d) => (int)d.Meters;

    // Checked explicit conversion operator
    public static explicit operator checked int(Distance d)
    {
        double truncated = Math.Truncate(d.Meters);
        if (truncated < int.MinValue || truncated > int.MaxValue)
        {
            throw new OverflowException("Distance exceeds integer representation bounds.");
        }
        return (int)truncated;
    }

    // Operator overloads
    public static Distance operator +(Distance left, Distance right)
        => new Distance(left.Meters + right.Meters);

    public static bool operator ==(Distance left, Distance right) => left.Equals(right);
    public static bool operator !=(Distance left, Distance right) => !left.Equals(right);

    public bool Equals(Distance other) => Meters.Equals(other.Meters);
    public override bool Equals(object? obj) => obj is Distance d && Equals(d);
    public override int GetHashCode() => Meters.GetHashCode();
}
```

### Step 2: Processing Input Values using Pattern Matching

Now we write a processing method that categorizes shipping methods using relational patterns, property patterns, list patterns, and switch expressions.

```csharp
public enum DeliveryTier
{
    Standard,
    Express,
    Freight
}

public class OrderProcessor
{
    public static DeliveryTier ClassifyPackage(Distance distance, double[] itemWeights)
    {
        // Property pattern with relational pattern matching on the Distance instance
        DeliveryTier tierByDistance = distance switch
        {
            { Meters: 0 } => DeliveryTier.Standard,
            { Meters: > 0 and <= 50 } => DeliveryTier.Standard,
            { Meters: > 50 and <= 500 } => DeliveryTier.Express,
            _ => DeliveryTier.Freight
        };

        // List pattern matching on array of item weights
        string weightProfile = itemWeights switch
        {
            [] => "Empty",
            [var single] when single > 100.0 => "SingleHeavyItem",
            [_, ..] when CalculateTotal(itemWeights) > 500.0 => "BulkHeavy",
            _ => "Normal"
        };

        if (weightProfile is "SingleHeavyItem" or "BulkHeavy")
        {
            return DeliveryTier.Freight;
        }

        return tierByDistance;
    }

    private static double CalculateTotal(double[] weights)
    {
        double sum = 0;
        foreach (var w in weights) sum += w;
        return sum;
    }
}
```

### Step 3: Walkthrough of Execution

Let's trace what happens when we evaluate `OrderProcessor.ClassifyPackage(new Distance(25), new double[] { 15.0, 20.0 })`:

1. **Explicit Construction**: `new Distance(25)` constructs the value directly. The user-defined conversion from `int` is explicit because the constructor rejects negative values, so callers would otherwise face a hidden exception during an implicit conversion.
2. **Switch Expression on `distance`**:
   - `{ Meters: 0 }` is checked -> `25.0 == 0` is `false`.
   - `{ Meters: > 0 and <= 50 }` is checked -> `25.0 > 0` is `true` and `25.0 <= 50` is `true`.
   - Branch matches! Returns `DeliveryTier.Standard`.
3. **Switch Expression on `itemWeights`**:
   - `[]` is checked -> array length is 2, so `false`.
   - `[var single] when single > 100.0` is checked -> length is 2 (requires 1 element), so `false`.
   - `[_, ..] when CalculateTotal(itemWeights) > 500.0` is checked -> array matches slice pattern `[_, ..]`, guard runs: total `35.0 > 500.0` is `false`.
   - Discard arm `_` matches -> returns `"Normal"`.
4. **Final Return**: The method evaluates `weightProfile`, skips the `Freight` override, and returns `DeliveryTier.Standard`.

---

# Misconceptions and edge cases

## 1. Misconception: Pattern Matching Invokes User-Defined Conversion Operators
Learners often assume that if a user-defined implicit conversion exists from `TypeA` to `TypeB`, a pattern check `value is TypeB` will return `true` for a `TypeA` instance.

**Fact**: Pattern matching inspects runtime types and language-defined structural rules ([Pattern Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/patterns)). It does **not** trigger user-defined conversion operators.

```csharp
// Snippet context: Assumes Distance struct defined above
Distance dist = new Distance(10);
object boxed = dist;

// WRONG ASSUMPTION: expecting a type pattern to execute the user-defined conversion
if (boxed is int number)
{
    // Not reached: boxed contains a Distance, not an int.
}

// CORRECT APPROACH: use an explicit cast to invoke the user-defined conversion
int integerMeters = (int)dist;
```

## 2. Misconception: Pattern Guards (`when`) Are Deterministic Side-Effect Containers
Putting code that modifies state inside a `when` guard creates severe bugs.

**Fact**: A switch expression considers arms in text order and chooses the first arm whose pattern matches and whose guard is true. A switch statement doesn't define the runtime pattern-matching order. Side effects in a guard make selection harder to reason about, so keep guards pure; don't attribute source-order behavior to switch statements where the specification doesn't promise it.

## 3. Edge Case: Null Handling in Property Patterns
A property pattern like `{ Meters: > 0 }` automatically performs a non-null check when applied to a reference type or nullable value type. If the governing input is `null`, the property pattern evaluates to `false` without throwing a `NullReferenceException`.

## 4. Edge Case: Checked vs. Unchecked Integral Operations
For integral operations, overflow in an `unchecked` context wraps or discards high-order bits without throwing. Floating-point-to-integral conversions follow different rules, and out-of-range unchecked results are unspecified. If domain logic needs checked integral behavior, use a checked context or a supported checked operator/conversion overload.

---

# Knowledge checks with answers

### Question 1
What is the primary difference between an implicit conversion operator and an explicit conversion operator in C# design guidelines?

**Answer**:
The language applies an available implicit conversion without requiring a cast, but it doesn't guarantee that every such conversion is lossless or cannot throw. Explicit conversions require a cast to make a potentially lossy or failing conversion visible at the call site. Type authors should avoid surprising implicit conversions, especially when they can reject values.

---

### Question 2
If an object-valued expression contains a boxed `Currency` value, what happens when it is tested with `value is decimal d`?

**Answer**:
The pattern match evaluates to `false`: the boxed object contains a `Currency`, not a `decimal`. A type pattern doesn't execute user-defined implicit or explicit conversion operators. To perform the conversion, use an explicit cast such as `(decimal)currency` or call a named conversion method.

---

### Question 3
Why should pattern match guards (`when` clauses) remain side-effect free?

**Answer**:
Keep pattern guards side-effect free because their role is to decide whether an otherwise matching pattern selects an arm. Switch expressions consider arms in text order; switch statements don't specify the runtime order in which patterns are matched. Side effects in guards make the selection harder to understand and can make switch-statement behavior depend on an unspecified match order.

---

### Question 4
When a switch expression over an open class hierarchy has no fallback arm, what can happen if no arm matches?

**Answer**:
The compiler warns when it can't prove that every runtime subtype is handled, but the switch expression can still compile. If evaluation reaches a value that matches no arm, it throws `SwitchExpressionException`. A discard arm provides a fallback. Closed hierarchies let the compiler check their declared alternatives, although an enum can still contain an unnamed underlying value.
