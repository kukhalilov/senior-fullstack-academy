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
- **Exhaustiveness**: A property of a decision structure (such as a switch expression) where every possible value of the governing input type is handled by at least one pattern arm.

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
   You define rules to inspect data values at runtime. Pattern matching evaluates the structural shape of a value (its runtime type, property values, elements, or constants). Crucially, **pattern matching uses built-in language rules and does not call user-defined conversion operators**.

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
- **Implicit Conversion**: Performed automatically by the compiler when the conversion is guaranteed to succeed without losing data or throwing runtime exceptions (e.g., converting a 32-bit integer to a 64-bit integer).
- **Explicit Conversion**: Requires an explicit cast operator `(TargetType)value` because the transformation may lose information (such as truncating fractional digits), change domain semantics, or throw an exception if the input value falls outside the valid target range.

### Checked vs. Unchecked Conversions and Arithmetic
In C#, integral operations and conversions evaluate in either a `checked` or `unchecked` context:
- In a **checked** context, operations that overflow the memory boundary of the target type throw an `OverflowException`.
- In an **unchecked** context, overflow truncates the high-order bits without throwing an exception.
- User-defined operators and explicit conversion operators can declare separate `checked` versions to enforce explicit overflow checking when invoked inside a `checked` block or compiler option.

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
- Operators must be declared as `public static`.
- At least one operand must be of the type declaring the operator.
- Logical and comparison operators must be declared in pairs (e.g., overloading `==` requires overloading `!=`; overloading `<` requires overloading `>`).
- Overloading `==` should always be kept consistent with an override of `Object.Equals`.

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
- **Open Hierarchy**: A general class hierarchy where new derived types can be added anywhere. Switch expressions over open hierarchies require a discard arm (`_`) to guarantee exhaustiveness at compile time.
- **Closed Hierarchy**: A finite type set (such as enum types, union types, or closed hierarchies added in C# 15) where all possible subtype alternatives are known to the compiler ([C# 15 Features](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)). When matching against a closed hierarchy, the compiler can verify exhaustiveness without requiring a fallback discard arm.

### Pattern Guards
A pattern arm can include a `when` guard clause: `pattern when condition`. The arm selects only if the pattern matches **and** the Boolean guard evaluates to `true`. Guards must be side-effect free because the compiler does not guarantee a fixed evaluation count or order for guard checks across branches.

---

# Worked examples

Let's build a complete example demonstrating custom operators, conversions, and pattern matching working together.

### Step 1: Defining a Custom Type with Conversions and Operators

The following code declares a `Distance` value type with implicit/explicit conversions and checked operator support.

```csharp
using System;

public readonly struct Distance : IEquatable<Distance>
{
    public double Meters { get; }

    public Distance(double meters)
    {
        if (double.IsNaN(meters) || meters < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(meters), "Distance cannot be negative or NaN.");
        }
        Meters = meters;
    }

    // Implicit conversion from int (meters) to Distance: Safe and non-lossy
    public static implicit operator Distance(int meters) => new Distance(meters);

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

Let's trace what happens when we evaluate `OrderProcessor.ClassifyPackage(25, new double[] { 15.0, 20.0 })`:

1. **Implicit Conversion**: Passing integer `25` to `Distance` implicitly invokes `Distance.operator implicit(int)`, creating a `Distance` instance with `Meters = 25.0`.
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

// WRONG ASSUMPTION: Expecting this to return true via implicit conversion to int
if (dist is int number) 
{
    // This code line is NEVER reached because dist is a Distance struct at runtime, not an int.
}

// CORRECT APPROACH: Use explicit casting when invoking user-defined conversions
int integerMeters = (int)dist;
```

## 2. Misconception: Pattern Guards (`when`) Are Deterministic Side-Effect Containers
Putting code that modifies state inside a `when` guard creates severe bugs.

**Fact**: The compiler reserves the right to evaluate or skip `when` guards depending on arm ordering and pattern optimization. If a guard changes program state, outcome depends on compiler internal behavior. **Guards must always be side-effect free.**

## 3. Edge Case: Null Handling in Property Patterns
A property pattern like `{ Meters: > 0 }` automatically performs a non-null check when applied to a reference type or nullable value type. If the governing input is `null`, the property pattern evaluates to `false` without throwing a `NullReferenceException`.

## 4. Edge Case: Checked vs. Unchecked Integral Operations
When overloading binary operators or conversion operators for arithmetic types, integer overflow in an `unchecked` context wraps around silently without throwing. If domain logic mandates safe bounds, provide explicit `checked` operator overloads.

---

# Knowledge checks with answers

### Question 1
What is the primary difference between an implicit conversion operator and an explicit conversion operator in C# design guidelines?

**Answer**:
Implicit conversions must be safe, non-lossy, and guaranteed not to throw exceptions under normal runtime operations. Explicit conversions are used when a transformation might lose precision or data (such as truncating floating-point numbers to integers) or throw an exception when values exceed target type boundaries.

---

### Question 2
Consider a user-defined type `Currency` that defines an implicit conversion operator to `decimal`. If an instance `Currency c = new Currency(100)` is evaluated in the expression `c is decimal d`, what will occur?

**Answer**:
The pattern match evaluates to `false`. Pattern matching checks actual runtime types according to compiler specification rules ([User-Defined Conversion Operators Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators)). It does not execute user-defined implicit or explicit conversion operators. To perform the conversion, an explicit cast or method call must be used instead of a type pattern.

---

### Question 3
Why should pattern match guards (`when` clauses) remain side-effect free?

**Answer**:
Pattern guards should remain side-effect free because pattern evaluation order is determined by compiler optimization logic. If a guard contains side effects (such as modifying a field or mutating global state), the number of times or the order in which the guard executes cannot be guaranteed, leading to non-deterministic program behavior.

---

### Question 4
When matching a variable against a switch expression over an open class hierarchy, why does the compiler require a discard arm (`_`) or fallback arm?

**Answer**:
An open class hierarchy allows new derived classes to be declared anywhere in external code or assemblies. Because the compiler cannot know every possible subtype that might exist at runtime, a discard arm (`_`) is required to guarantee exhaustiveness and prevent unhandled runtime exceptions. Closed hierarchies (such as enums or finite closed types) allow the compiler to verify complete coverage without requiring a fallback discard arm ([Selection Statements Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements)).
