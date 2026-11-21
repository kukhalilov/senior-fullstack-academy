
# covariance contravariance invariant types and delegates — Reference: API design choices, type safety, and variance diagnostics

# Scope and version

* **Topic:** covariance contravariance invariant types and delegates.
* **Scope and Authority:** This reference lesson covers API design choices, type safety, and variance diagnostics under current .NET 11 and C# 15 variance rules checked 2026-11-14, as documented in [.NET generic variance documentation and C# programming guide/reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/).

# How this group fits the mental model

Variance describes safe conversions between constructed generic interfaces or delegates whose type arguments have an inheritance relationship. Covariance preserves the direction for produced values; contravariance reverses it for consumed values; invariance permits neither conversion. 

When designing or consuming APIs, the `out` and `in` annotations on interface and delegate type parameters act as strict contracts on how those parameters are used. A producer can be covariant; a consumer can be contravariant; mutable read/write abstractions usually must be invariant to remain safe. These variance conversions are implicit reference conversions with specific boundaries. They do not make arbitrary generic classes variant, do not apply to value-type arguments, do not change a collection's mutability, and do not make delegate combination accept different delegate types.

# Supplied names explained

* `Producer interface design`: Designing an interface that yields or returns data through output-safe occurrences of a generic type parameter, allowing it to be annotated as covariant (`out`) so that assignments to broader base types succeed safely.
* `Consumer interface design`: Designing an interface that accepts or consumes data through input-safe occurrences of a generic type parameter, allowing it to be annotated as contravariant (`in`) so that assignments to narrower derived types or broader delegates succeed safely.
* `Read/write interface invariance`: Designing an interface that both reads and writes a generic type parameter, which forces it to remain invariant (unannotated) to prevent dangerous writes of incorrect subtypes into a storage location.
* `Input-only generic API`: An API design pattern where a generic type parameter is used in input-safe positions (such as method parameters or consumer methods), making it a candidate for contravariant usage.
* `Output-only generic API`: An API design pattern where a generic type parameter is used in output-safe positions (such as return types or property getters), making it a candidate for covariant usage.
* `Input/output generic API`: An API design pattern where a generic type parameter appears in both input and output positions, requiring invariance to maintain type and memory safety.
* `Variance for reusable APIs`: Applying variance rules to widespread library abstractions (such as delegates or sequence interfaces) so developers can pass specialized implementations into general-purpose routines without manual wrapper casts.
* `Avoid unnecessary variance annotation`: The practice of leaving type parameters invariant unless explicitly required by read-only or write-only usage, preventing compiler errors and unintended API design constraints.
* `Variance and type safety`: Variance safety rules ensure that permitted conversions preserve type safety; they do not eliminate unrelated runtime exceptions.
* `Variance versus casting`: The distinction between compile-time implicit reference conversions allowed by variance annotations and explicit downcasting or upcasting of object references at runtime.
* `Variance versus adapter allocation`: The efficiency choice between using a built-in variance conversion (which does not allocate an adapter object by itself) versus writing manual wrapper adapter classes to bridge mismatched generic types.
* `Invalid variance compiler diagnostic`: A compiler error issued when a type parameter is annotated with `out` or `in` but appears in an illegal position (such as an `out` parameter used as a method input, or an `in` parameter used as a return type).
* `Variance conversion not found diagnostic`: A compiler error issued when attempting an assignment or argument passing operation between constructed generic types that lack the required variance relationship.
* `Value-type variance conversion limitation`: The restriction that generic variance rules apply only to reference types, meaning value types (like `int` or `Guid`) and structures cannot undergo implicit variance conversions due to underlying representation differences.
* `Variance with nullable reference annotations`: The interaction between generic variance rules and nullable reference types, ensuring that nullability annotations align correctly across covariant outputs and contravariant inputs.
* `Variance and generic constraints are separate rules`: The architectural boundary stating that type parameter constraints (such as `where T : class`) and variance annotations (`out`/`in`) are distinct compile-time validation mechanisms that do not replace one another.
* `Variance and static abstract interface members`: Variance safety restrictions do not apply to occurrences within non-virtual, non-abstract static members. Static abstract or virtual interface members remain subject to the applicable variance rules; “static” alone does not exempt them.
* `Variance of a generic parameter inside a delegate argument`: The specific sub-rule governing how type parameters embedded within nested generic signatures or delegate parameters must align with outer variance directions.

# Cross-item comparison

* **Producer interface design** vs **Consumer interface design** vs **Read/write interface invariance**: A producer outputs data (`out`), a consumer accepts data (`in`), and a read/write abstraction does both, requiring invariance.
* **Input-only generic API** vs **Output-only generic API** vs **Input/output generic API**: Contravariant inputs handle consumption, covariant outputs handle production, and mixed input/output APIs must remain invariant.
* **Variance versus casting** vs **Variance versus adapter allocation**: Built-in variance provides safe implicit reference conversions, whereas manual adapter allocations require wrapping objects to match non-variant types.
* **Invalid variance compiler diagnostic** vs **Variance conversion not found diagnostic**: An invalid variance diagnostic flags illegal placement of `in`/`out` modifiers, while a conversion not found diagnostic flags attempts to assign incompatible generic types.

# Examples

## Example 1: Covariant Producer Pattern
```csharp
// Unverified / Pseudocode example illustrating covariant output design
using System;

public interface IProducer<out T>
{
    T Produce();
}

public class StringProducer : IProducer<string>
{
    public string Produce() => "Hello, Variance!";
}

public class Program
{
    public static void Main()
    {
        IProducer<string> stringProducer = new StringProducer();
        // Covariance allows assigning IProducer<string> to IProducer<object>
        IProducer<object> objectProducer = stringProducer;
        
        Console.WriteLine(objectProducer.Produce());
    }
}
```
* **Expected Result:** Compiles and prints `Hello, Variance!` because `IProducer<out T>` permits the reference variance conversion from `string` to `object`.

# Common mistakes

* **Mistake 1:** Attempting to use `out` annotations on an interface member that accepts the type parameter as a method argument. *Correction:* The compiler generates an `Invalid variance compiler diagnostic` because output parameters cannot appear in input positions.
* **Mistake 2:** Expecting value types (such as `int`) to support variance conversions. *Correction:* Remember the `Value-type variance conversion limitation`; variance applies solely to reference types.
* **Mistake 3:** Treating mutable lists like `IList<T>` as covariant. *Correction:* Mutable interfaces must use `Read/write interface invariance` because allowing covariance on a write-capable collection would break type safety.

# Knowledge checks with answers

1. **Question:** Why must read/write generic interfaces remain invariant?
   * **Answer:** Because allowing covariance would permit writing an invalid base-type instance into a collection or property meant for a narrower derived type, breaking type safety.
2. **Question:** What kind of compiler diagnostic occurs if an `out`-annotated type parameter is used as a method parameter input?
   * **Answer:** An `Invalid variance compiler diagnostic`.
3. **Question:** Do generic variance conversions apply to value types like `int` or `bool`?
   * **Answer:** No, due to the `Value-type variance conversion limitation`, generic variance applies exclusively to reference types.
