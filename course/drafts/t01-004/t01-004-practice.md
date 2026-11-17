<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Exercises and worked solutions

*Automatically generated draft.*

# Goals
* Understand the difference between **Value types** and **Reference types** regarding assignment and copying.
* Distinguish between **Value equality** and **Reference equality**.
* Learn how to predict the behavior of shared mutable state versus independent copies.
* Apply correct equality patterns using `EqualityComparer<T>.Default` and `IEquatable<T>`.

# Worked example
Consider the difference between a `struct` (value type) and a `class` (reference type).

```csharp
// Value type: Struct
struct Point { public int X; }

// Reference type: Class
class Box { public int X; }

// Copying behavior
Point p1 = new Point { X = 10 };
Point p2 = p1; // Value copy: p2 has its own X = 10
p2.X = 20;     // p1.X remains 10

Box b1 = new Box { X = 10 };
Box b2 = b1;   // Reference copy: b2 points to the same object as b1
b2.X = 20;     // b1.X is now 20 (aliasing)
```

**Why this happens:**
When you assign a struct variable, the target receives a copy of its value (including any reference fields). When you assign a class variable, the target receives a copy of the reference; both can designate the same object. Physical storage is a runtime implementation detail.

# Exercises
1. Create a `struct` named `Dimensions` with two `int` fields. Assign one instance to another and modify the second. Verify whether the first variable changed. Then add an array field and see whether the copied structs still refer to the same array.
2. Create a `class` named `Container` with one `int` field. Assign one instance to another and modify the second. Verify if the first changed.
3. Use `object.ReferenceEquals` to compare two different instances of a `class` with the same data, then compare the same instance to itself.

# Progressive hints
* **Hint 1:** Remember that `struct` types are value types. Modifying a copied field doesn't affect the original variable, but copied reference fields can still refer to shared objects.
* **Hint 2:** `class` types are reference types. If two variables hold the same reference, they are aliases for the same object.
* **Hint 3:** `ReferenceEquals` checks whether two references identify the same object instance (identity), not if their contents are the same.

# Complete solutions
```csharp
// Exercise 1
struct Dimensions { public int W, H; }
Dimensions d1 = new Dimensions { W = 1, H = 2 };
Dimensions d2 = d1;
d2.W = 5; // d1.W is still 1

// Exercise 2
class Container { public int W; }
Container c1 = new Container { W = 1 };
Container c2 = c1;
c2.W = 5; // c1.W is now 5

// Exercise 3
Container a = new Container { W = 1 };
Container b = new Container { W = 1 };
bool sameRef = object.ReferenceEquals(a, b); // False
bool sameSelf = object.ReferenceEquals(a, a); // True
```

# Tests and edge cases
* **Boxing:** Casting a struct value to `object` creates a boxed object containing a copy. Mutating that boxed copy does not mutate the original struct variable; boxing commonly allocates, though optimization can remove unobservable allocation.
* **Mutable Structs:** A `struct` containing a reference type (like an array) can be dangerous. Copying the `struct` copies the reference, so both `struct` copies will point to the same array.
* **NaN Equality:** Floating-point types have specific rules where `double.NaN == double.NaN` is false, while `Double.Equals(double.NaN)` returns true.
* **Nullable boxing:** Boxing an empty `int?` produces `null`; boxing a non-empty `int?` produces a boxed `int`, not a boxed `Nullable<int>`.

# Reflection questions
1. Why is it generally safer to make `struct` types immutable?
2. If you need to compare two objects for equality in a generic method, why is `EqualityComparer<T>.Default` preferred over `==`?
3. Does the "stack versus heap" rule accurately describe C# semantics, or is it an implementation detail?

*Sources:*
* [Microsoft Learn: Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [Microsoft Learn: Reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
* [Microsoft Learn: Equality comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
