<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Exercises and worked solutions

*This is an automatically generated draft.*

# Goals
* Understand how to use `Pattern matching` to inspect data structures and control program flow.
* Learn to implement `User-defined conversion` and `Operator overload` to make custom types feel native.
* Master `Switch expression` and `is pattern expression` for clean, readable decision logic.
* Recognize when to prefer `Named method` over operator overloading to maintain code clarity.

# Worked example
Imagine a `Temperature` type that needs to support arithmetic and conditional logic. We use `IAdditionOperators` to define addition and a `switch expression` to categorize the temperature.

```csharp
using System.Numerics;

public record struct Temperature(double Celsius) : IAdditionOperators<Temperature, Temperature, Temperature>
{
    // Operator overload
    public static Temperature operator +(Temperature left, Temperature right)
        => new(left.Celsius + right.Celsius);

    // Categorization using switch expression and relational patterns
    public string GetCategory() => this.Celsius switch
    {
        < 0 => "Freezing",
        >= 0 and < 20 => "Cool",
        >= 20 and < 35 => "Warm",
        _ => "Hot" // Discard pattern for exhaustiveness
    };
}
```

# Exercises
1. **Pattern Matching:** Given a `List pattern`, write a `switch expression` that returns "Empty" if a list is empty, "Single" if it has one element, and "Multiple" otherwise.
2. **Conversion:** Create a `struct` named `Meters` and implement an `Implicit conversion operator` to `double` (representing the raw value).
3. **Operators:** Implement `IComparisonOperators` for a `Point` struct so that `p1 < p2` compares their distance from the origin.

# Progressive hints
* **Exercise 1:** Use `[]` for the empty list, `[var _]` for a single element, and `[_, ..]` for multiple.
* **Exercise 2:** Use the syntax `public static implicit operator double(Meters m) => m.Value;`.
* **Exercise 3:** Remember that `Operator must be public and static`. Use `Math.Sqrt` to calculate distance.

# Complete solutions
1. **Pattern Matching:**
   ```csharp
   string Describe(int[] list) => list switch {
       [] => "Empty",
       [_] => "Single",
       [_, ..] => "Multiple"
   };
   ```
2. **Conversion:**
   ```csharp
   public struct Meters(double Value) {
       public static implicit operator double(Meters m) => m.Value;
   }
   ```
3. **Operators:**
   ```csharp
   using System.Numerics;

public readonly record struct Point(double X, double Y) : IComparisonOperators<Point, Point, bool> {
       private static double SquaredDistance(Point p) => p.X * p.X + p.Y * p.Y;
       public static bool operator <(Point left, Point right) => SquaredDistance(left) < SquaredDistance(right);
       public static bool operator >(Point left, Point right) => SquaredDistance(left) > SquaredDistance(right);
       public static bool operator <=(Point left, Point right) => SquaredDistance(left) <= SquaredDistance(right);
       public static bool operator >=(Point left, Point right) => SquaredDistance(left) >= SquaredDistance(right);
   }
   ```

# Tests and edge cases
* **Exhaustiveness:** Use a fallback arm when runtime values may exist outside the recognized patterns. C# 15 unions and closed hierarchies can support exhaustiveness analysis, but an unmatched non-exhaustive switch expression still throws.
* **Nullability:** `Pattern matching` handles nulls gracefully. A `Type pattern` like `x is string s` will return `false` if `x` is null.
* **Overflow:** Use checked context for applicable integral overflow; it does not prevent floating-point precision loss or all conversion loss.
* **Consistency:** Keep `==`, `!=`, and `Object.Equals` behavior coherent as a design guideline; C# requires `==` and `!=` to be paired.

# Reflection questions
1. Why is it often better to use a `Named method` instead of an `Operator overload` if the operation is expensive or asymmetric?
2. How does `Pattern subsumption diagnostic` help you write safer code?
3. In what scenario would you choose an `Explicit conversion operator` over an `Implicit conversion operator`? (Hint: Think about `Prefer explicit conversion for lossy transformation`).

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns)*
