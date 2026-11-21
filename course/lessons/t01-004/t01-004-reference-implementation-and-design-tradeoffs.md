
# C# value types reference types copying identity and equality — Reference: Type choice, mutability, identity, generics, and runtime representation cautions

# Scope and version
This lesson covers the design tradeoffs, memory representation, and equality semantics for C# types. It is based on C# 15 and .NET 11, as documented in the [Microsoft Learn C# 15 language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types).

# How this group fits the mental model
In C#, types are categorized by how they are copied and compared. A **value type** variable holds a value; assigning it copies that value. A **reference type** variable holds an object reference; assigning it copies the reference, so multiple variables can refer to the same instance. The language does not define the reference as a physical pointer or prescribe storage locations.

# Supplied names explained

* `Class versus struct design guideline`: Consider classes for identity/shared-state/reference semantics and structs for values with value semantics; size, immutability, copying, inheritance, and API needs all matter.
* `Struct size and copy cost`: Copy cost depends on size, usage, JIT optimization, and workload; measure rather than applying a universal size rule.
* `Mutable value type hazard`: Modifying a struct copy does not mutate the source variable; implicit copies at assignments, returns, and property/indexer boundaries can surprise code that assumes shared identity.
* `Large struct copying`: Passing or returning large structs by value may be costly in some workloads; measure before considering by-reference APIs, which have different semantics and constraints.
* `Ref struct`: A struct subject to ref-safety restrictions that prevent it from escaping into prohibited contexts or being boxed; do not treat “stack-only” as a physical placement guarantee.
* `Readonly ref struct`: A `ref struct` whose instance fields cannot be mutated after construction; referenced objects may still be mutable.
* `InlineArrayAttribute`: Marks a struct as an inline array with a specified number of elements; its elements are stored inline in the struct representation. It isn't limited to interop.
* `ref struct interface implementation` (C# 13+): a `ref struct` may implement interfaces, but it cannot be boxed or converted to an interface type. It must implement every instance member, including members with default implementations.
* `Record class versus record struct`: Both synthesize value equality; record classes have reference-type assignment and record structs have value-type assignment.
* `Record class inheritance`: Supported; allows hierarchical data modeling.
* `Struct inheritance restriction`: Structs cannot declare a class or struct base type; all derive from `System.ValueType` and may implement interfaces.
* `Interface boxing`: A normal value type converted to an interface type is boxed. C# 13 permits ref structs to implement interfaces while preventing boxing and interface conversions.
* `Generic constrained call`: Calling methods on generic types where constraints ensure specific behavior.
* `Constrained virtual call`: The `constrained.` IL prefix supports virtual/interface dispatch on a type parameter or value type; it can permit dispatch without boxing, but isn't a guarantee about every call's generated code.
* `Nullable<T>`: A value type that represents either no value or a value of underlying non-nullable value type `T`; nullable value types cannot be nested or used as a nullable underlying type argument.
* `Nullable<T>.HasValue`: Returns `true` if the instance contains a value.
* `Nullable<T>.Value`: Returns the underlying value; throws `InvalidOperationException` if `HasValue` is `false`.
* `Nullable<T>.GetValueOrDefault()`: Returns the value or the default for `T`.
* `Nullable<T>.GetValueOrDefault(T)`: Returns the value or a provided default.
* `Nullable.GetUnderlyingType(Type)`: Returns the type argument `T` of a `Nullable<T>`.
* `Nullable<T> lifted operators`: Many operators are lifted to nullable operands; a null operand generally yields null for lifted arithmetic and relational operators, with defined exceptions including bool-valued lifted equality.
* `Nullable<T> null comparison`: Lifted relational comparisons with a null operand return false; `==` and `!=` have nullable equality semantics (two nulls compare equal).
* `Nullable<T> equality semantics`: Two `Nullable<T>` are equal if both are null or both have equal values.
* `Null-coalescing operator`: The `??` operator used to provide a default value for `null`.
* `Null-conditional operator`: The `?.` operator used to access members only if the object is not `null`.
* `Identity conversion`: A conversion between identical types.
* `Implicit reference conversion`: Converting a derived class to a base class or interface.
* `Explicit reference conversion`: A conversion requiring an explicit cast, often checked at runtime for a compatible type; some conversions can succeed without a runtime check under static rules.
* `User-defined equality semantics`: Overriding `Equals` or `==` to define custom equality logic.
* `Identity-based entity`: A domain object whose equality policy treats its stable identity as significant; this is a design choice, not an automatic property of every object.
* `Value object`: A domain concept whose equality is defined by its value, regardless of object identity; this is a design choice.
* `Immutability`: A property of an API/design whose observable state cannot be changed after construction; readonly fields alone do not make referenced objects immutable, and immutability is not automatically enforced by every value type.
* `Copy-on-write design`: A strategy that shares data until a mutation requires a logically separate copy; implementations may use different granularities and need not eagerly duplicate all data.
* `Aliasing risk`: The danger of multiple references modifying the same shared state.
* `Defensive copy risk`: Extra struct copies may arise from readonly access to non-readonly members; this differs from normal copies caused by assignment or by-value parameter passing.
* `Equality comparer selection`: Choosing equality semantics appropriate to the operation: `==` is compile-time type-specific, `Equals` is a virtual method, and `IEqualityComparer<T>` supplies collection/algorithm-specific equality.
* `Equality in generic algorithms`: Using `EqualityComparer<T>.Default` to handle type-agnostic equality.
* `Equality in dictionary lookup`: Uses the dictionary's `IEqualityComparer<TKey>` (defaulting to `EqualityComparer<TKey>.Default`) for both hashing and equality.
* `Equality in LINQ distinct operations`: `Distinct` uses the default or supplied equality comparer to identify duplicate elements.
* `Runtime representation versus language guarantee`: The language defines observable semantics; runtime implementations choose representation and may optimize storage.
* `JIT optimization and local storage`: A JIT compiler may keep values in registers or use stack storage as part of an implementation strategy; source types alone do not determine this.
* `Stack versus heap misconception`: The belief that all value types are on the stack and all reference types are on the heap; this is not a language guarantee.

# Cross-item comparison
* **Value vs. Reference**: Value-type assignment copies the value; reference-type assignment copies an object reference. Neither specifies physical layout.
* **Equality**: `==` is type-specific and may be overloaded; don't infer it solely from class/struct/record category.
* **Records**: A `record class` has reference-type assignment but synthesized value equality; a `record struct` has value-type assignment and synthesized value equality.

# Examples
```csharp
// Value type: Copying creates a new independent instance
int a = 10;
int b = a; 
b = 20; // a remains 10

// Reference type: Copying shares the same object
var list1 = new List<int>();
var list2 = list1;
list2.Add(1); // list1 now also contains 1
```
*The examples show C# assignment behavior; they make no claim about physical storage.*

# Common mistakes
1. **Assuming stack allocation**: Do not infer physical storage from whether a type is a value type or reference type; storage and optimization are runtime implementation details.
2. **Mutable structs**: A property/indexer returning a struct by value gives a copy, while a ref-returning API may expose the stored element. Check the member's actual return semantics.
3. **Ignoring copy costs**: Large structs may be costly to copy in some workloads; measure and consider `in`/`ref readonly` only when their semantics and measured performance suit the API.

# Knowledge checks with answers
1. **Q: Does assigning a struct variable copy the data?**
   A: Yes. Assignment copies its fields; reference-valued fields can still point to objects shared with the source value.
2. **Q: Can a `ref struct` be stored in a class field?**
   A: An ordinary class cannot declare a field whose type is a ref struct, because that would permit the ref-like value to escape its permitted safe context. This is a ref-safety restriction, not a guarantee of a physical stack address.
3. **Q: What is the primary difference between `Record class` and `Record struct`?**
   A: Both synthesize value equality. A `record class` uses reference-type assignment, while a `record struct` uses value-type assignment.
