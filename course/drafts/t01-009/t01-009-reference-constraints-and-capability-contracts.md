<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Reference: Constraint forms, ordering, nullability, and capability guarantees

*This is an automatically generated draft.*

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
* `class constraint`: Specifies that the type argument must be a reference type.
* `class? constraint`: Specifies that the type argument can be a nullable reference type.
* `notnull constraint`: Ensures the type argument cannot be null.
* `struct constraint`: Specifies that the type argument must be a value type (non-nullable).
* `unmanaged constraint`: Specifies that the type argument must be an unmanaged type (types that do not contain reference types).
* `new() constraint`: Requires the type argument to have a public parameterless constructor.
* `Type parameter constraint`: A constraint that uses another type parameter as the requirement (e.g., `where T : U`).
* `allows ref struct anti-constraint`: Permits the use of `ref struct` types as arguments, provided the code follows ref-safety rules (introduced in C# 13).
* `default constraint`: Used to specify that a type parameter has no constraints.
* `Constraint ordering`: The required sequence of constraints (e.g., class/struct must come first, followed by interfaces, then `new()`).
* `Constraint cannot repeat sealed type`: A rule preventing the use of a `sealed` class as a base class constraint, as it cannot be inherited.
* `Constraint on type parameter`: The application of a constraint to a generic type's parameter.
* `Constraint on generic method`: The application of a constraint to a method's specific type parameter.
* `Constraint on generic type`: The application of a constraint to a class, struct, or interface's type parameter.
* `Constraint inheritance`: The behavior where derived classes inherit the constraints of their base classes.
* `Constraint satisfaction`: The process where the compiler verifies that a provided type argument meets all declared constraints.
* `Constraint diagnostic`: The compiler error or warning generated when a type argument fails to meet a constraint.
* `Nullable reference type constraint`: A constraint specifically targeting the nullability state of a reference type.
* `Value type constraint`: A conceptual grouping for constraints like `struct` or `unmanaged`.
* `Reference type constraint`: A conceptual grouping for constraints like `class`.
* `Unmanaged type constraint`: A specific requirement for types that can be used in pointer operations.
* `Constructor constraint`: Another name for the `new()` constraint.
* `Static abstract interface constraint`: Allows generic code to call static members defined in interfaces.
* `Generic math constraint`: Constraints used to enable generic arithmetic operations.
* `Constraint does not select a type argument`: A reminder that constraints filter types; they do not perform "search" to find a matching type.
* `Constraint does not imply variance`: A reminder that constraints and variance (how types relate in hierarchies) are independent concepts.

# Cross-item comparison

| Feature | Purpose |
| :--- | :--- |
| `class constraint` | Restricts to reference types. |
| `struct constraint` | Restricts to value types. |
| `unmanaged constraint` | Restricts to types without references (storable in memory blocks). |
| `Base class constraint` | Enforces inheritance hierarchy. |
| `Interface constraint` | Enforces capability implementation. |

# Examples

```csharp
// A generic method with multiple constraints
public T CreateAndProcess<T>(T input) where T : class, new()
{
    // 'new()' allows us to call new T()
    T instance = new T();
    return instance;
}

// Using an interface constraint
public void PrintData<T>(T item) where T : IPrintable
{
    item.Print();
}
```
*Unverified example.*

# Common mistakes
* **Over-constraining:** Adding constraints you don't actually need, which limits the usability of your generic code.
* **Ignoring Order:** Placing the `new()` constraint before a `class` or `struct` constraint will cause a compiler error.
* **Assuming Inference:** Expecting the compiler to "find" a type that satisfies a constraint rather than requiring the caller to provide a valid type.

# Knowledge checks with answers
1. **Question:** Can you use a `sealed` class as a base class constraint?
   **Answer:** No, because a `sealed` class cannot be inherited.
2. **Question:** What is the purpose of the `new()` constraint?
   **Answer:** It allows the generic code to instantiate the type parameter using `new T()`.
3. **Question:** Does a constraint help the compiler infer a type argument?
   **Answer:** No, constraints validate the arguments provided; they do not perform a search to discover a type.

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*
