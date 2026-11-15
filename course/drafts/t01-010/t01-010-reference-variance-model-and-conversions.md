<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Reference: Covariant, contravariant, and invariant conversions and their limits

*This is an automatically generated draft.*

# Scope and version
This lesson covers the rules and definitions of generic variance in .NET 11 and C# 15. Variance defines how inheritance relationships between types affect the compatibility of generic interfaces and delegates. For official documentation and language specifications, refer to the [.NET generic variance documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/).

# How this group fits the mental model
In C#, generic types are usually **invariant**, meaning `List<string>` is not a `List<object>`, even though `string` is an `object`. Variance allows you to relax this restriction when it is safe to do so. 
*   **Covariance** allows you to use a more derived type (e.g., `IEnumerable<string>` as `IEnumerable<object>`).
*   **Contravariance** allows you to use a less derived type (e.g., `Action<object>` as `Action<string>`).
*   **Invariance** requires an exact type match.

These rules ensure that you cannot accidentally insert an incompatible type into a collection or pass an invalid object to a method.

# Supplied names explained

* `Variance`: The overarching concept describing safe conversions between constructed generic interfaces or delegates based on the inheritance relationship of their type arguments.
* `Covariance`: A form of variance that preserves the inheritance direction; it allows a generic type with a more derived argument to be treated as one with a less derived argument.
* `Contravariance`: A form of variance that reverses the inheritance direction; it allows a generic type with a less derived argument to be treated as one with a more derived argument.
* `Invariance`: The default state where a generic type is only compatible with itself; no conversion is permitted between different type arguments.
* `Variant generic type parameter`: A type parameter marked with `in` or `out` that enables variance conversions.
* `Invariant generic type parameter`: A type parameter without `in` or `out` modifiers, restricting the generic type to exact matches.
* `out variance modifier`: An annotation used on interface or delegate type parameters to indicate the type is only used as a return value (a producer), enabling covariance.
* `in variance modifier`: An annotation used on interface or delegate type parameters to indicate the type is only used as an input parameter (a consumer), enabling contravariance.
* `Implicit reference conversion between variant interfaces`: The mechanism by which the compiler allows assigning a variant interface (e.g., `IEnumerable<string>`) to a variable of a compatible variant interface (e.g., `IEnumerable<object>`).
* `Implicit reference conversion between variant delegates`: The mechanism allowing a delegate (e.g., `Func<string>`) to be assigned to a variable of a compatible delegate type (e.g., `Func<object>`).
* `Variance conversion direction`: The rule that covariance follows the inheritance hierarchy (derived to base), while contravariance moves against it (base to derived).
* `Variance applies only to reference types`: Variance conversions are restricted to reference types; they do not apply to value types.
* `Value-type argument is invariant for variance conversion`: Even if a type parameter is marked `out` or `in`, using a value type (like `int`) prevents variance conversion.
* `Variance does not apply to classes`: You cannot define a class as covariant or contravariant; variance is strictly for interfaces and delegates.
* `Variance does not apply to structs`: Similar to classes, structs cannot be made variant.
* `Variance does not apply to generic methods`: Variance applies to the type parameters of the interface or delegate, not to the parameters of a method defined within them.
* `Variance does not apply to generic parameters of classes`: Variance modifiers cannot be placed on the type parameters of a class definition.
* `Variance does not change the constructed type identity`: The underlying object remains the same; only the reference type used to access it changes.
* `Variance does not permit mutation through a producer interface`: Covariance is only safe because the interface does not allow modifying the collection (e.g., `IEnumerable<T>` is read-only).
* `Variance and assignment compatibility`: The core rule that determines if a variable of one generic type can be assigned to another based on variance modifiers.
* `Variance and inheritance conversion`: The relationship between the inheritance of the type arguments and the compatibility of the generic types.
* `Transitive variance conversion`: If type A can be converted to B, and B to C, then A can be converted to C via variance.
* `Variance conversion with nested generic types`: Complex types (e.g., `IEnumerable<IEnumerable<T>>`) follow variance rules at each level of the nesting.
* `Variance conversion with array types`: Array covariance is a separate, older mechanism that allows `string[]` to be treated as `object[]`, but it is less safe than generic variance.
* `Variance does not apply to delegate combination`: You cannot combine two delegates of different variant types using the `+` operator.

# Cross-item comparison

| Feature | Behavior |
| :--- | :--- |
| **Covariance** | Producer (returns `T`), follows inheritance (e.g., `IEnumerable<out T>`). |
| **Contravariance** | Consumer (accepts `T`), reverses inheritance (e.g., `Action<in T>`). |
| **Invariance** | Read/Write (uses `T` as both input and output), no conversion (e.g., `IList<T>`). |
| **Array Covariance** | Built-in for reference types, allows runtime errors on invalid stores. |
| **Generic Variance** | Contract-based, enforced by the compiler for type safety. |

# Examples

```csharp
// Covariance: IEnumerable is covariant (out T)
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings; // Allowed: string is an object

// Contravariance: Action is contravariant (in T)
Action<object> actOnObject = (obj) => Console.WriteLine(obj);
Action<string> actOnString = actOnObject; // Allowed: can handle string if it can handle object
```

# Common mistakes
1. **Trying to make a class variant:** You cannot write `class MyList<out T>`. Variance is only for interfaces and delegates.
2. **Confusing Array Covariance with Generic Variance:** Array covariance allows `string[]` to be treated as `object[]`, but you can cause a `ArrayTypeMismatchException` at runtime. Generic variance prevents this at compile time.
3. **Using `out` for input:** If you mark a parameter as `out`, the compiler will prevent you from using it as a method parameter, as this would violate type safety.

# Knowledge checks with answers
1. **Question:** Can you use `in` or `out` on a `List<T>`?
   **Answer:** No. `List<T>` is invariant because it allows both reading and writing.
2. **Question:** Does variance apply to `int` or other value types?
   **Answer:** No. Variance conversions only apply to reference types.
3. **Question:** Why is `IEnumerable<T>` covariant but `IList<T>` is not?
   **Answer:** `IEnumerable<T>` only produces values (read-only), making it safe for covariance. `IList<T>` allows adding values (consumer), which requires invariance to remain type-safe.
