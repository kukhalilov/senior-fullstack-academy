<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Reference: Array covariance, runtime store checks, and distinct override covariance

# Scope and version

* Automatically generated draft.
* **Scope:** This lesson covers the exact named inventory group: **Array covariance, runtime store checks, and distinct override covariance**. It explains how legacy array covariance operates with runtime safety checks, how it differs from generic interface variance, and how C# 9 covariant return types for method and property overrides work.
* **Edition & Checked Date:** Current .NET 11 and C# 15 variance rules checked 2026-11-14 based on the frozen topic data and `.NET generic variance documentation and C# programming guide/reference` ([Microsoft Learn Source](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)).

# How this group fits the mental model

Variance describes safe conversions between constructed generic interfaces or delegates whose type arguments have an inheritance relationship. Within this broader domain, arrays and method overrides present distinct assignment and substitution mechanisms that do not use the generic `in`/`out` keyword annotations:

1. **Array Covariance:** Arrays of reference types are inherently covariant in language design. If `B` inherits from `A`, then `B[]` can be implicitly converted to `A[]`. However, because arrays are mutable, this cannot be verified entirely at compile time for write operations. Instead, the runtime performs a dynamic check on every reference assignment into an array.
2. **Override Return Covariance:** When a derived class overrides a virtual method or read-only property, C# allows the return type to be a more derived type than the base class declaration. This subtype substitution rule improves API ergonomics without involving generic variance type parameters.

Understanding these features prevents confusion between compile-time generic variance contracts and runtime array store checks or override return substitutions.

# Supplied names explained

* `Array`
  * **Exact String:** `Array covariance`
  * **Explanation:** A language feature permitting an array of a derived reference type to be treated as an array of a base reference type. For example, a `String[]` can be treated as an `Object[]`. Unlike generic interface covariance, array covariance is built into the language runtime for all reference types.

* `Array`
  * **Exact String:** `Reference-type array covariance`
  * **Explanation:** The restriction that array covariance applies exclusively to arrays containing reference types (such as classes or interfaces). Value-type arrays (such as `Int32[]`) do not support array covariance because value types require strict type representation and boxing/unboxing boundaries.

* `Array`
  * **Exact String:** `Array covariance conversion`
  * **Explanation:** The implicit reference conversion that allows a reference-type array instance to be assigned to a variable of a compatible supertype array type. While permitted by the compiler, it preserves the underlying object type of the array storage.

* `Array`
  * **Exact String:** `ArrayTypeMismatchException`
  * **Explanation:** The runtime exception thrown when an attempt is made to store an element of an incompatible type into an array. This occurs because array covariance allows an array reference to be typed as a supertype, but a store operation validates the runtime type of the value against the actual array creation type.

* `Array`
  * **Exact String:** `Covariant array store failure`
  * **Explanation:** The specific failure mode where a compile-time valid store operation into a covariantly-converted array fails during execution due to the runtime store check catching a type violation.

* `Array`
  * **Exact String:** `Array covariance versus generic covariance`
  * **Explanation:** The fundamental architectural distinction between arrays and generic interfaces. Array covariance is implicit, supports element mutation (with runtime safety checks), and can throw exceptions at runtime. Generic interface covariance (`out`) is statically verified at compile time, applies to read-only producers, and prevents unsafe store operations entirely through the type system.

* `Override`
  * **Exact String:** `Covariant return type in override`
  * **Explanation:** A feature allowing an overriding method in a derived class to specify a more derived return type than the virtual method it overrides. This matches the Liskov substitution principle for method outputs.

* `Override`
  * **Exact String:** `Covariant property return in override`
  * **Explanation:** A feature allowing an overriding read-only property in a derived class to specify a more derived return type than the virtual property in the base class.

* `Override`
  * **Exact String:** `Override return type must be more derived`
  * **Explanation:** The structural requirement that the return type of an overriding member must be identical to or a subclass/subinterface of the base member's return type; unrelated or broader types are disallowed.

* `Override`
  * **Exact String:** `Covariant return type versus generic variance`
  * **Explanation:** The distinction between method/property override return substitution and generic type parameter variance. Override return covariance applies to class inheritance hierarchies and member dispatch, whereas generic variance applies to constructed generic interfaces and delegates.

* `Version`
  * **Exact String:** `C# 9 covariant return types`
  * **Explanation:** The language version milestone (introduced in C# 9 and .NET 5) that enabled methods and read-only properties in derived classes to override base members with a more derived return type ([Microsoft Learn C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)).

# Cross-item comparison

The inventory items compare across two distinct operational models:

| Feature Dimension | Array Covariance Group | Override Return Covariance Group |
| :--- | :--- | :--- |
| **Primary Mechanism** | Implicit reference conversion of array instances (`Array covariance`, `Reference-type array covariance`, `Array covariance conversion`). | Subtype substitution on method and property member signatures (`Covariant return type in override`, `Covariant property return in override`). |
| **Safety Enforcement** | Deferred to runtime via `ArrayTypeMismatchException` and `Covariant array store failure` checks because arrays are mutable. | Enforced statically at compile time (`Override return type must be more derived`). |
| **Language Milestone** | Legacy runtime behavior (`Array covariance versus generic covariance`). | Modern language addition (`C# 9 covariant return types`, `Covariant return type versus generic variance`). |

# Examples

The following unverified pseudocode examples demonstrate array covariance runtime checks and C# 9 override return covariance.

```csharp
// Unverified pseudocode example: Array covariance and store failure
// Reference: https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance

string[] strings = new string[2];
object[] objects = strings; // Array covariance conversion (reference-type array covariance)

// This compiles because objects is typed as object[].
// However, strings actually holds string instances.
// Attempting to store an invalid type causes a Covariant array store failure at runtime:
// objects[0] = 42; // Throws ArrayTypeMismatchException
```

```csharp
// Unverified pseudocode example: C# 9 covariant return types in override
// Reference: https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9

public abstract class Animal { }
public abstract class Mammal : Animal { }

public abstract class BaseHandler
{
    public virtual Animal GetProduct() => null!;
}

public class DerivedHandler : BaseHandler
{
    // Covariant return type in override (Override return type must be more derived)
    public override Mammal GetProduct() => null!;
}
```

# Common mistakes

* **Confusing Array Covariance with Generic Variance:** Assuming that generic classes or mutable generic interfaces (`IList<T>`) are covariant because reference-type arrays are covariant. Generic interfaces require explicit `out` annotations and are typically read-only (`IEnumerable<T>`), whereas arrays permit mutation with runtime checks.
* **Ignoring Runtime Failures in Arrays:** Writing code that relies on array covariance without accounting for `ArrayTypeMismatchException`, forgetting that store validation happens dynamically.
* **Conflating Override Returns with Generic Variance:** Treating C# 9 covariant return types as a form of generic type parameter variance. Override return types apply to member binding in class inheritance, not to generic interfaces or delegates.

# Knowledge checks with answers

1. **Question:** Why does array covariance require a runtime store check (`ArrayTypeMismatchException`), whereas generic interface covariance does not?
   * **Answer:** Arrays are mutable read/write data structures. Because an array of a derived type can be referenced as an array of a base type, the runtime must verify that any value written into the array matches the actual allocated element type. Generic interface covariance (`out`), by contrast, is restricted to producing values (read-only), preventing write operations entirely and enabling compile-time safety.
2. **Question:** What language feature allows an overriding method in a derived class to return a more derived type than the virtual method in its base class, and in which C# version was it introduced?
   * **Answer:** Covariant return types in overrides, introduced in C# 9 and .NET 5.
