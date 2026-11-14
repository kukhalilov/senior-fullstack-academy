<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Core concepts and how they fit together

## Learning objectives
- Distinguish between value types and reference types in C# regarding assignment, copying, and variable contents.
- Explain how copying a value type duplicates data, while copying a reference type duplicates only the reference pointing to the same shared object.
- Differentiate between object identity and value equality, and identify which equality operators or methods apply in various scenarios.
- Recognize how mutability interacts with aliasing and copying to cause unexpected side effects.
- Apply decision criteria for choosing between classes, structs, and records based on semantics, size, and lifetime rather than simplistic physical storage rules.

## Prerequisites
- Basic familiarity with C# syntax, variables, and method declarations.
- Understanding that variables store data used during program execution.

## Core concepts
### 1. Value types and reference types
- **Value type**: A variable of a value type directly contains its data. Assigning a value-type variable to another copies the underlying value.
- **Reference type**: A variable of a reference type stores a reference (an address or handle) to the actual data object on the managed heap. Assigning a reference-type variable copies the reference, meaning both variables point to the exact same object instance.

### 2. Copying and assignment behavior
- **Value copy**: Duplicates the bits or values into a separate location. Modifying the copy does not alter the original variable.
- **Reference copy**: Duplicates the handle. Modifying the object's state through one variable reflects when accessed via the other variable (aliasing).

### 3. Equality contracts and operators
- **Reference equality**: Checks whether two variables refer to the exact same object instance in memory (`ReferenceEquals`).
- **Value equality**: Checks whether two distinct objects or values contain equivalent data.
- **Equality operator (`==`)**: Built-in or overloaded operators that can perform value or reference comparisons depending on the type definition.
- **`Equals` and `IEquatable<T>`**: Methods used to evaluate structural or logical equality.
- **`EqualityComparer<T>.Default`**: Provides a default comparison implementation for generic types.

### 4. Storage and implementation reality
- The value-versus-reference distinction defines language semantics, not an absolute guarantee that every value lives on the stack or every object on the heap. Storage location is influenced by context, JIT optimization, boxing, and runtime implementation.

## Mechanisms and relationships
### Mental model
Think of a value type as a physical box containing a specific item; if you want two items, you must buy a second box and copy the item into it. Think of a reference type as a slip of paper with a street address written on it; copying the slip gives you a second paper with the same address, but both slips point to the same house.

### Map of related features and operations
- **Parameter passing**: Value parameters pass copies, whereas `ref`, `out`, `in`, and `ref readonly` parameters pass references or pointers to variables.
- **Boxing and unboxing**: Converting a value type to an object or interface type (boxing) allocates an object on the managed heap and copies the value inside it. Unboxing extracts the value back out.
- **Copying patterns**: Ranging from simple shallow copies (such as `MemberwiseClone`) and copy constructors to immutable structures and record `with` expressions.

## Worked examples
### Example 1: Copying behavior of value types vs reference types
Consider the following pseudocode example demonstrating how assignment affects structs (value types) versus classes (reference types):

```csharp
// Struct (Value Type)
struct Point
{
    public int X;
    public int Y;
}

// Class (Reference Type)
class Box
{
    public int Dimension;
}

// Unverified code example
Point p1 = new Point { X = 10, Y = 20 };
Point p2 = p1; // Value copy: p2 gets its own independent copy of X and Y
p2.X = 99;
// Result: p1.X is still 10; p2.X is 99.

Box b1 = new Box { Dimension = 5 };
Box b2 = b1; // Reference copy: b2 references the same object as b1
b2.Dimension = 50;
// Result: b1.Dimension is 50; b2.Dimension is 50 because both point to the same object.
```

### Example 2: Equality comparisons
```csharp
// Unverified code example
string s1 = "hello";
string s2 = "hello";
bool areSameRef = object.ReferenceEquals(s1, s2); // May be true due to string interning, but logically...
bool areEqualVal = (s1 == s2);                  // True because strings compare by value.
```

## Misconceptions and edge cases
- **Misconception: "Value types always live on the stack, reference types always live on the heap."**
  *Correction*: Language semantics dictate copying and assignment behavior. The runtime decides physical storage optimization based on escape analysis and context.
- **Structs containing reference fields**: If a mutable struct contains a reference-type field, copying the struct copies the reference, meaning both copies of the struct share the underlying referenced object.
- **Floating-point and null handling**: Special values like `NaN` in floating-point math or `null` in nullable contexts require careful attention because standard equality rules may yield unexpected results.

## Knowledge checks with answers
1. **Question**: If you assign a reference-type variable to a second variable, what is duplicated in memory?
   - **Answer**: Only the object reference (address/handle) is duplicated. Both variables point to the exact same object instance on the managed heap.

2. **Question**: Does mutating a local copy of a value type modify the original variable?
   - **Answer**: No. Value types undergo a value copy upon assignment or parameter passing, keeping separate instances independent.

3. **Question**: What is the primary difference between reference equality and value equality?
   - **Answer**: Reference equality checks if two variables point to the exact same physical instance in memory, whereas value equality checks if two distinct instances hold equivalent data values.

***

*Automatically generated draft based on C# 15 stable and .NET 11 GA specifications.*
*Source references:*
- [Microsoft Learn C# Types Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
- [Microsoft Learn Value Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
- [Microsoft Learn Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
- [Microsoft Learn Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
