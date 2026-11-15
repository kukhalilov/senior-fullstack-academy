<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Reference: Interface variance declarations, validity rules, and BCL examples

# Scope and version
This reference lesson covers the exact inventory group for **Interface variance declarations, validity rules, and BCL examples** under current .NET 11 and C# 15 variance rules checked 2026-11-14 [https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/). Variance describes safe conversions between constructed generic interfaces or delegates whose type arguments have an inheritance relationship. Covariance preserves the direction for produced values; contravariance reverses it for consumed values; invariance permits neither conversion.

# How this group fits the mental model
Before diving into individual declarations and Base Class Library (BCL) types, it helps to understand the problem variance solves. When working with object-oriented hierarchies, a reference of type `String` can be assigned to a variable of type `Object` because a string is an object. However, generic types like `IEnumerable<String>` and `IEnumerable<Object>` are constructed with different type arguments. Without variance rules, the C# type system treats them as completely unrelated types, preventing you from passing a more specific sequence where a general one is expected.

Variance annotations (`out` and `in`) establish a contract about how a generic type parameter is used:
- **Producers** (output-only) can be **covariant** using `out`.
- **Consumers** (input-only) can be **contravariant** using `in`.
- **Read/write abstractions** must remain **invariant** (neither `out` nor `in`) to prevent type safety violations at runtime.

Variance conversions apply only when the type arguments are reference types. For example, `IEnumerable<string>` can convert to `IEnumerable<object>`, but `IEnumerable<int>` cannot convert to `IEnumerable<object>` even though `int` can be boxed as `object`.

# Supplied names explained
This section explains every item in the assigned reference inventory exactly as supplied.

* `Variant generic interface declaration`
  An interface declaration that includes variance annotations (`out` or `in`) on one or more of its generic type parameters. This tells the C# compiler that constructed versions of the interface support safe implicit reference conversions when their type arguments share an inheritance relationship.

* `Covariant interface type parameter`
  A type parameter marked with the `out` modifier in a generic interface declaration. It indicates that the type parameter is used strictly as an output (e.g., return types or read-only properties), enabling covariant assignment compatibility.

* `Contravariant interface type parameter`
  A type parameter marked with the `in` modifier in a generic interface declaration. It indicates that the type parameter is used strictly as an input (e.g., method parameter types), enabling contravariant assignment compatibility.

* `Covariant parameter used as method return type`
  A valid usage position for a covariant (`out`) type parameter where the generic method returns a value of that type parameter. Because the type flows *out* of the interface to the caller, safety is preserved.

* `Covariant parameter used as read-only property type`
  A valid usage position for a covariant (`out`) type parameter where a property exposes a get accessor returning that type. This represents output flow from the object to the consumer.

* `Covariant parameter used in covariant interface position`
  A position where a covariant type parameter is used as a type argument of another covariant generic interface nested inside the current interface contract.

* `Contravariant parameter used as method parameter type`
  A valid usage position for a contravariant (`in`) type parameter where a method accepts an argument of that type parameter. Because the caller supplies a more derived type than required, the consumer can safely process it.

* `Contravariant parameter used as write-only property type`
  A valid usage position for a contravariant (`in`) type parameter where a property exposes a set accessor accepting that type. This represents input flow from the consumer into the object.

* `Contravariant parameter used in contravariant interface position`
  A position where a contravariant type parameter is used within a nested interface or delegate position that maintains correct directional safety.

* `Invalid variance position`
  A compilation error that occurs when a type parameter annotated with `out` is used in an input position (such as a method parameter), or when a type parameter annotated with `in` is used in an output position (such as a return type). The compiler rejects these to maintain type safety.

* `Variance validity of nested generic interface`
  The compiler rule governing how variance annotations propagate or nest when a generic interface includes another generic interface as a type argument or base. The nested positions must align with the declared variance of the parameters.

* `Variance validity of nested generic delegate`
  The compiler rule ensuring that when generic delegates appear within type definitions or signatures, their variance properties do not violate input/output safety boundaries.

* `Variant interface inheritance`
  The ability of a variant interface to inherit from another interface, provided that the variance safety rules across the inheritance chain are strictly respected by the compiler.

* `Variant interface implementation`
  The realization of a variant interface by a concrete class. Variance conversions apply to compatible interface references; they do not make the implementing class type itself variant. For example, `List<string>` is not convertible to `List<object>`.

* `Variance conversion from implementing class`
  An implicit reference conversion from an implementing class instance to a compatible constructed interface. For example, an object implementing `IProducer<string>` can be used through `IProducer<object>` when `IProducer<out T>` declares `T` covariant. The conversion is available only for reference-type arguments.

* `IEnumerable<T> covariance`
  The built-in covariance behavior of `System.Collections.Generic.IEnumerable<T>` [https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance], where `T` is marked with `out`, allowing `IEnumerable<String>` to be implicitly converted to `IEnumerable<Object>`.

* `IEnumerator<T> covariance`
  The covariance behavior of `System.Collections.Generic.IEnumerator<T>` [https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance], utilizing an `out` parameter for its traversal output (`Current` property).

* `IReadOnlyCollection<T> covariance`
  The covariance behavior of `System.Collections.Generic.IReadOnlyCollection<T>`, which exposes read-only sizing and enumeration, permitting covariant assignment of its generic type parameter.

* `IReadOnlyList<T> covariance`
  The covariance behavior of `System.Collections.Generic.IReadOnlyList<T>`, allowing read-only indexed access to elements in a covariant manner.

* `IQueryable<T> covariance`
  The covariance behavior of `System.Linq.IQueryable<T>`, which evaluates queries against a specific data source in a covariant relationship.

* `IOrderedEnumerable<TElement> covariance`
  The covariance behavior of `System.Linq.IOrderedEnumerable<TElement>`, representing sorted sequences whose element type parameter is covariant.

* `IGrouping<TKey,TElement> covariance`
  The covariance behavior of `System.Linq.IGrouping<TKey,TElement>`; both `TKey` and `TElement` are declared covariant.

* `IComparer<T> contravariance`
  The contravariant behavior of `System.Collections.Generic.IComparer<T>` [https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance], where `T` is marked with `in`. An `IComparer<Object>` can be used where an `IComparer<String>` is required because an object comparer can compare strings safely.

* `IEqualityComparer<T> contravariance`
  The contravariant behavior of `System.Collections.Generic.IEqualityComparer<T>`, allowing a comparer built for a base type to be supplied where a comparer for a derived type is expected.

* `IComparable<T> contravariance`
  The contravariant behavior of `System.Collections.Generic.IComparable<T>` [https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance], where the comparison input accepts the type parameter in a consumer position.

* `Mutable collection invariance`
  The rule that mutable read/write abstractions (such as `IList<T>`) must remain invariant. If `IList<T>` were covariant, you could insert an incompatible type into a collection through a base reference, breaking type safety.

# Cross-item comparison
Within this inventory group, items can be contrasted by their directional flow and safety contracts:
- Covariant items (such as `IEnumerable<T> covariance`, `IReadOnlyList<T> covariance`, and `Covariant parameter used as method return type`) produce values and preserve the assignment direction of the type hierarchy.
- Contravariant items (such as `IComparer<T> contravariance`, `IComparable<T> contravariance`, and `Contravariant parameter used as method parameter type`) consume values and reverse the assignment direction of the type hierarchy.
- Invariant items (such as `Mutable collection invariance` and `Invalid variance position`) forbid conversions entirely because mixing input and output roles on the same type parameter creates type safety hazards.

# Examples
The following complete C# snippet demonstrates covariant and contravariant interface usage in practice.

```csharp
using System;
using System.Collections.Generic;

// Covariant interface (producer)
public interface IProducer<out T>
{
    T Produce();
}

// Contravariant interface (consumer)
public interface IConsumer<in T>
{
    void Consume(T value);
}

public class StringProducer : IProducer<string>
{
    public string Produce() => "Hello, variance!";
}

public class ObjectConsumer : IConsumer<object>
{
    public void Consume(object value) => Console.WriteLine(value);
}

class Program
{
    static void Main()
    {
        // Covariance: IProducer<string> assigned to IProducer<object>
        IProducer<string> stringProducer = new StringProducer();
        IProducer<object> objectProducer = stringProducer;
        Console.WriteLine(objectProducer.Produce());

        // Contravariance: IConsumer<object> assigned to IConsumer<string>
        IConsumer<object> objectConsumer = new ObjectConsumer();
        IConsumer<string> stringConsumer = objectConsumer;
        stringConsumer.Consume("Tested successfully.");
    }
}
```

# Common mistakes
- **Treating mutable generic collections as covariant:** Trying to assign `IList<String>` to `IList<Object>` will fail to compile. Mutable collections must remain invariant.
- **Placing variant type parameters in illegal positions:** Putting an `out` parameter in a method input argument or an `in` parameter in a return position results in an `Invalid variance position` compiler error.
- **Confusing array covariance with generic variance:** Array covariance permits `String[]` to be treated as `Object[]`, but stores can fail at runtime with an `ArrayTypeMismatchException`. Generic interface covariance is strictly checked at compile time and preserves type safety.

# Knowledge checks with answers
1. **Question:** Why must `IList<T>` be invariant instead of covariant?
   **Answer:** Because `IList<T>` allows both reading and writing (producing and consuming). If it were covariant, you could take an `IList<String>`, cast it to `IList<Object>`, and insert an integer or another unrelated object into it, corrupting the underlying string collection at runtime.

2. **Question:** What does the `out` keyword signify on a generic interface type parameter?
   **Answer:** It signifies that the type parameter is covariant, meaning it is used exclusively in output positions (such as return values or read-only properties) and allows safe assignment to broader type arguments.

3. **Question:** Can a contravariant type parameter (`in`) be used as a method return type?
   **Answer:** No. Using a contravariant parameter as a return type is an invalid variance position and will cause a compilation error because input types cannot safely flow out as outputs.
