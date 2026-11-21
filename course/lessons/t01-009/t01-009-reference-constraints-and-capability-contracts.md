
# generics constraints and generic methods — Reference: Constraint forms, ordering, nullability, and capability guarantees

# Scope and version
This lesson covers generic constraints and generic methods in C# 15 / .NET 11. It focuses on how constraints define the capabilities of type parameters and how these constraints interact with the compiler's type-checking process.

# How this group fits the mental model
Generics allow you to write code that works with any type while maintaining static type safety. However, if your code needs to perform specific actions—like calling a method, creating an instance, or ensuring a type is a value type—you must tell the compiler what the type parameter is allowed to do. 

Constraints act as a "contract" between the caller and the generic implementation. By applying constraints, you narrow the set of allowed types to only those that satisfy your requirements, enabling the compiler to verify your code safely.

# Supplied names explained

* `where constraint clause`: The syntax used to apply one or more constraints to a type parameter.
* `Base class constraint`: Requires the type argument to be a specific class or inherit from it.
* `Interface constraint`: Requires the type argument to implement a specific interface.
* `Multiple interface constraints`: Allows a type parameter to be constrained by several interfaces simultaneously.
* `class constraint`: Requires a reference-type argument; in a nullable-enabled context it means non-nullable reference type and a nullable argument produces a warning.
* `class? constraint`: Requires a reference type and permits nullable or non-nullable reference-type arguments.
* `notnull constraint`: In an enabled nullable context, expresses a non-nullable type-argument contract; violation produces a warning rather than an error, and the constraint is not enforced in oblivious context.
* `struct constraint`: Specifies that the type argument must be a value type (non-nullable).
* `unmanaged constraint`: Requires a non-nullable value type whose fields recursively contain no managed references; it implies `struct` and cannot be combined with `struct` or `new()`.
* `new() constraint`: Requires the type argument to have a public parameterless constructor.
* `Type parameter constraint`: A constraint that uses another type parameter as the requirement (e.g., `where T : U`).
* `allows ref struct anti-constraint`: Permits the use of `ref struct` types as arguments, provided the code follows ref-safety rules (introduced in C# 13).
* `default constraint`: Used only on an override or explicit interface implementation to resolve `T?` ambiguity when inherited constraints do not specify `class` or `struct`; it does not mean "no constraints" generally.
* `Constraint ordering`: At most one primary constraint comes first; then an optional base-class or interface/type-parameter constraints; `new()` follows these and is last among ordinary constraints; `allows ref struct` follows all constraints. Some combinations are disallowed.
* `Constraint cannot repeat sealed type`: A sealed class cannot be specified as a base-class constraint; base-class constraints must be inheritable classes.
* `Constraint on type parameter`: The application of a constraint to a generic type's parameter.
* `Constraint on generic method`: The application of a constraint to a method's specific type parameter.
* `Constraint on generic type`: The application of a constraint to a class, struct, or interface's type parameter.
* `Constraint inheritance`: A derived generic type must repeat constraints needed to satisfy the corresponding constrained base type parameter; constraints on an override/interface implementation are inherited from the contract and cannot be freely restated.
* `Constraint satisfaction`: The process where the compiler verifies that a provided type argument meets all declared constraints.
* `Constraint diagnostic`: The compiler error or warning generated when a type argument fails to meet a constraint.
* `Nullable reference type constraint`: `class` versus `class?` controls non-nullable-only versus nullable-or-non-nullable reference type arguments in nullable-aware context; `notnull` also admits non-nullable value types and is warning-based.
* `Value type constraint`: A conceptual grouping for constraints like `struct` or `unmanaged`.
* `Reference type constraint`: A conceptual grouping for constraints like `class`.
* `Unmanaged type constraint`: Requires an unmanaged value type and enables unmanaged-oriented operations such as `sizeof(T)` in permitted unsafe contexts; pointer types themselves are not legal generic type arguments.
* `Constructor constraint`: Another name for the `new()` constraint.
* `Static abstract interface constraint`: An interface constraint whose static abstract members can be called through a constrained type parameter, enabling compile-time polymorphism such as generic math.
* `Generic math constraint`: Constraints used to enable generic arithmetic operations.
* `Constraint does not select a type argument`: A reminder that constraints filter types; they do not perform "search" to find a matching type.
* `Constraint does not imply variance`: A reminder that constraints and variance (how types relate in hierarchies) are independent concepts.

# Cross-item comparison

| Feature | Purpose |
| :--- | :--- |
| `class constraint` | Restricts to reference types. |
| `struct constraint` | Restricts to value types. |
| `unmanaged constraint` | Requires a non-nullable value type with no managed references in any field; a value type may still contain references and fail this constraint. |
| `Base class constraint` | Enforces inheritance hierarchy. |
| `Interface constraint` | Enforces capability implementation. |

# Examples

```csharp
// A generic method with multiple constraints
public T CreateAndProcess<T>(T input) where T : class, new()
{
    // The new() constraint permits new T() when T has a public parameterless constructor.
    T instance = new T();
    return instance;
}

// Using an interface constraint
public void PrintData<T>(T item) where T : IPrintable
{
    item.Print();
}
```
The examples are illustrative; `IPrintable` is an application-defined interface.

# Common mistakes
* **Over-constraining:** Adding constraints you don't actually need, which limits the usability of your generic code.
* **Ignoring Order:** Constraint ordering has primary, secondary, constructor, and anti-constraint positions, with prohibited combinations; `new()` follows interface/base constraints and precedes `allows ref struct`.
* **Assuming Inference:** Expecting the compiler to "find" a type that satisfies a constraint rather than requiring the caller to provide a valid type.

# Knowledge checks with answers
1. **Question:** Can you use a `sealed` class as a base class constraint?
   **Answer:** No. The class-type constraint must be inheritable, and a sealed class cannot be used as a base-class constraint.
2. **Question:** What is the purpose of the `new()` constraint?
   **Answer:** It allows the generic code to instantiate the type parameter using `new T()`.
3. **Question:** Does a constraint help the compiler infer a type argument?
   **Answer:** No, constraints validate the arguments provided; they do not perform a search to discover a type.

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*
