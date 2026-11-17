<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Core concepts and how they fit together

*This is an automatically generated draft.*

# C# Value Types, Reference Types, Copying, Identity, and Equality

## Learning objectives
* Distinguish between value types and reference types based on assignment and copying behavior.
* Understand the difference between object identity and value equality.
* Identify when to use structs versus classes based on design goals like mutability and identity.
* Recognize how equality contracts (==, Equals, GetHashCode) function across different type categories.

## Prerequisites
* Basic familiarity with C# variable declaration and assignment.
* Understanding that C# is a type-safe, managed language.

## Core concepts
The fundamental distinction in C# is how variables store data:

1.  **Value Types**: A variable of a value type contains a value. Assignment copies that value; a struct's reference-valued fields are copied too and can still refer to shared objects.
2.  **Reference Types**: A variable of a reference type contains a reference to an object; its physical representation is unspecified by the language. When you assign one reference-type variable to another, you copy the reference, not the object. Both variables now point to the same **Object identity**.

**Mental Model**: Assignment of a value type gives the target its own value; assignment of a reference type copies the reference, so two variables can refer to one object. This describes language behavior, not physical boxes or addresses.

## Mechanisms and relationships
The behavior of your code depends on these interactions:

*   **Aliasing**: When multiple references designate one object, mutation through one reference can be observed through the others. Aliasing itself doesn't mean every operation mutates shared state.
*   **Mutability**: Mutating a value type only affects the local copy. However, if a struct contains a reference type (like a class instance), the struct's copy will still point to the same shared object as the original.
*   **Storage**: While developers often associate value types with the "stack" and reference types with the "heap," this is an implementation detail. The runtime may optimize storage based on context, such as **Escape analysis** or **Boxing**.
*   **Equality**: `==`, `Equals`, and identity comparisons have type-specific behavior.
    *   **Reference equality**: Checks whether two references identify the same object instance (`Object.ReferenceEquals`); it doesn't compare physical memory addresses.
    *   **Value equality**: Checks whether two values are equivalent under a type's equality contract, often implemented through `IEquatable<T>` or overridden `Equals` methods.

## Worked examples

### Example 1: Copying Behavior
```csharp
// Value Type (struct)
int a = 10;
int b = a; // b is a copy of a
b = 20;    // a remains 10

// Reference Type (class)
List<int> list1 = new List<int> { 1 };
List<int> list2 = list1; // list2 points to the same object as list1
list2.Add(2);            // list1 now also contains { 1, 2 }
```

### Example 2: Equality
```csharp
string s1 = "hello";
string s2 = new string("hello");

bool refEq = object.ReferenceEquals(s1, s2); // False: different objects
bool valEq = s1 == s2;                       // True: string overrides == for value equality
```

## Misconceptions and edge cases
*   **"Value types always live on the stack"**: False. Storage is an implementation detail; values may be embedded in objects/arrays, boxed, or handled according to runtime optimization.
*   **"Boxing is free"**: Boxing creates an object containing a copy of the value and commonly allocates; an optimizing runtime may eliminate an unobservable allocation.
*   **Mutable Structs**: A struct field can be mutated in place in supported contexts, while a property or method may return a value copy. `readonly` and `in` contexts can also introduce defensive copies when a member isn't readonly; inspect the specific expression and member.

## Knowledge checks with answers

1.  **Question**: If you assign one `struct` variable to another, what happens?
    *   **Answer**: Assignment copies the value, including any reference-valued fields. The struct value is copied, but objects reached through copied references may remain shared.

2.  **Question**: Why is it dangerous to have a mutable struct?
    *   **Answer**: Because structs are copied by value, it is easy to accidentally mutate a copy rather than the intended original, leading to confusing state changes.

3.  **Question**: What is the difference between `==` and `Object.ReferenceEquals`?
    *   **Answer**: `==` is type-specific and may be overloaded to provide value equality (as with `string` and records); `ReferenceEquals` checks object identity. Passing value types to it boxes them, so it doesn't test their value equality.

*Source: [Microsoft Learn C# Type Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types), [Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)*
