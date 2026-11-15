> **Pilot failed quality review.** This generated sample contains outdated version claims and/or technical errors. It is not ready for study.

<!-- Generated with gemini-3-flash-preview; automated review only; source and code verification pending. -->

## Scope and version

This lesson covers **Variance** in C# (specifically Covariance, Contravariance, and Invariance) as it applies to reference conversions and the principle of substitutability. 

*   **Scope**: Generic interfaces, generic delegates, method group conversions, and array covariance. It details the mechanics of `in` and `out` keywords, type safety, and the rules of "input-safe" and "output-safe" types.
*   **Version**: Based on **C# 12/13** (latest stable as of late 2024). 
*   **Recent Major Changes**: 
    *   **C# 8.0**: Default Interface Methods (DIMs) introduced new rules for how variance interacts with interface members.
    *   **C# 11**: Static virtual members in interfaces; these are generally invariant as they do not operate on instances.
*   **Preview Features**: No major changes to the core variance logic are currently in preview for C# 13 (Source check: October 2024).

## Simple explanation

**Variance** is about whether you can use a "more specific" or "less specific" type than originally specified.

1.  **Assignment Compatibility**: If a `Dog` is an `Animal`, you can put a `Dog` object into an `Animal` variable. This is the foundation of polymorphism.
2.  **Covariance (`out`)**: Think of this as a **Producer**. If a factory produces `Dogs`, it is also a factory that produces `Animals`. You can use a `Factory<Dog>` where a `Factory<Animal>` is expected. (Preserves the direction of assignment).
3.  **Contravariance (`in`)**: Think of this as a **Consumer**. If a person can feed any `Animal`, they can certainly feed a `Dog`. You can use a `Feeder<Animal>` where a `Feeder<Dog>` is expected. (Reverses the direction of assignment).
4.  **Invariance**: This is a **Storage** container (like a `List`). If you have a list of `Dogs`, you cannot treat it as a list of `Animals` because someone might try to put a `Cat` into your list of `Dogs`, which would break the program.

## How it works

### 1. Identity and Implicit Reference Conversions
Variance relies on **Implicit Reference Conversions**.
*   **Identity Conversion**: A conversion between two types that are identical at runtime (e.g., `string` to `string`).
*   **Implicit Reference Conversion**: A conversion where the reference remains the same, but the "view" of the object changes (e.g., `string` to `object`). This only works for **reference types**, never for value types (like `int` or `struct`).

### 2. Assignment Direction
*   **Covariance**: `Base b = Derived;` (Normal direction). In generics: `IEnumerable<Base> b = IEnumerable<Derived>;`.
*   **Contravariance**: `Action<Derived> d = Action<Base>;` (Reversed direction).

### 3. Variance Safety (Input vs. Output)
According to the C# Language Specification ([Source 2](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces)), the compiler enforces safety through two rules:
*   **Output-Safe**: A type is output-safe if it is not a contravariant type parameter. Covariant parameters (`out`) are allowed as return types.
*   **Input-Safe**: A type is input-safe if it is not a covariant type parameter. Contravariant parameters (`in`) are allowed as method arguments.

### 4. Array Covariance (The "Broken" Variance)
C# supports array covariance (e.g., `object[] x = new string[10]`). However, this is **not type-safe**. If you try to do `x[0] = 5;`, the compiler allows it, but the runtime throws an `ArrayTypeMismatchException` because an integer cannot be stored in a string array ([Source 1](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)).

## Examples

### Covariance (The Producer)
```csharp
// IEnumerable<out T> is covariant
IEnumerable<string> strings = new List<string> { "Hello" };
IEnumerable<object> objects = strings; // Compiles: string is more derived than object
```

### Contravariance (The Consumer)
```csharp
// Action<in T> is contravariant
Action<object> actObject = (obj) => Console.WriteLine(obj);
Action<string> actString = actObject; // Compiles: Assignment compatibility is reversed
```

### Invariance (The Storage)
```csharp
// List<T> is invariant
List<string> strings = new List<string>();
// List<object> objects = strings; // COMPILE ERROR: Cannot convert List<string> to List<object>
```
*Why?* If the line above worked, you could do `objects.Add(10);`, which would put an integer into a list of strings.

### Method Group Variance
```csharp
static object GetObject() => new object();
static string GetString() => "test";

// Covariant return type
Func<object> f = GetString; 
```

## API and feature inventory

### Keywords and Attributes
| Feature | Purpose | Constraints |
| :--- | :--- | :--- |
| `out` | Marks a type parameter as **Covariant**. | Only allowed in "output" positions (return types, getters). |
| `in` | Marks a type parameter as **Contravariant**. | Only allowed in "input" positions (method arguments, setters). |

### Common Variant Interfaces ([Source 1](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/))
*   `IEnumerable<out T>`: Covariant. You only "get" items.
*   `IEnumerator<out T>`: Covariant.
*   `IQueryable<out T>`: Covariant.
*   `IComparer<in T>`: Contravariant. You "input" two items to compare them.
*   `IComparable<in T>`: Contravariant.

### Common Variant Delegates
*   `Func<..., out TResult>`: The result is covariant.
*   `Action<in T>`: The parameters are contravariant.
*   `Predicate<in T>`: Contravariant.

## Tradeoffs and comparisons

| Feature | Pros | Cons |
| :--- | :--- | :--- |
| **Generic Variance** | Compile-time safe; allows flexible API design (e.g., passing `List<string>` to a method taking `IEnumerable<object>`). | Only works with Reference Types; requires explicit `in`/`out` annotations on interfaces. |
| **Array Covariance** | Historical compatibility with Java; allows simple generic-like behavior before generics existed. | **Runtime Unsafe**; can cause `ArrayTypeMismatchException`. |
| **Invariance** | Maximum safety; prevents accidental insertion of wrong types into collections. | Rigid; requires manual casting or copying of collections to change types. |

## Interview questions and answers

**Q1: Why does C# not allow `List<object> list = new List<string>();`?**
**A:** `List<T>` is invariant. If this were allowed, you could call `list.Add(new Dog())` on what is actually a list of strings. This would violate type safety. Variance is only safe when the data flow is strictly one-way (either only out or only in).

**Q2: Can you use variance with value types (e.g., `IEnumerable<int>` to `IEnumerable<object>`)?**
**A:** No. Variance only applies to **Implicit Reference Conversions**. Converting an `int` to an `object` requires **Boxing**, which is a representation change, not just a reference change. Therefore, generic variance does not support value types ([Source 2](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces)).

**Q3: What is the difference between `out` in generics and `out` in method parameters?**
**A:** They are unrelated. `out` in method parameters means the method must assign a value before returning. `out` in generics (variance) means the type parameter is covariant and can only be used as a return type.

**Follow-up:** How does `in` in generics differ from the `in` parameter modifier?
**A:** Similarly, the `in` parameter modifier passes an argument by reference for read-only purposes. The `in` generic modifier marks a type parameter as contravariant.

## Exercises and solutions

### Exercise 1: Identify the Variance
Which of the following lines will compile?
1. `IComparer<object> objComp = ...; IComparer<string> strComp = objComp;`
2. `Func<string> strFunc = ...; Func<object> objFunc = strFunc;`
3. `Action<string> strAct = ...; Action<object> objAct = strAct;`

**Solution:**
1. **Compiles** (Contravariance: `IComparer<in T>`).
2. **Compiles** (Covariance: `Func<out T>`).
3. **Fails** (Action is `Action<in T>`, so assignment compatibility is reversed: you can assign an `Action<object>` to an `Action<string>`, but assigning `Action<string>` to `Action<object>` fails to compile).

### Exercise 2: DSA - The Shape Processor
**Problem**: You are building a graphics engine. You have a base class `Shape` and a derived class `Circle`. You need a `Processor<T>` interface.
1. If the processor only **reads** shapes to calculate total area, should it be covariant, contravariant, or invariant?
2. If the processor only **adds** shapes to a canvas, should it be covariant, contravariant, or invariant?

**Solution**:
1. **Covariant** (`out T`). It produces area data from shapes. You can use a `Processor<Circle>` as a `Processor<Shape>`.
2. **Contravariant** (`in T`). It consumes shapes to draw them. You can use a `Processor<Shape>` as a `Processor<Circle>`.

### Exercise 3: Fix the Code
The following code fails to compile. Fix the interface definition to allow the assignment in `Main`.

```csharp
interface IStorage<T> {
    T GetItem(int index);
}

class Program {
    static void Main() {
        IStorage<string> strStore = null;
        IStorage<object> objStore = strStore; // Error here
    }
}
```
**Solution**: Change the interface to `interface IStorage<out T>`. Since `T` is only used as a return type, it is output-safe.

## Review questions
1. What keyword is used to enable contravariance in a generic interface?
2. Why is `Action<T>` contravariant rather than covariant?
3. True or False: Array covariance is checked at compile-time for type safety.
4. Define "Identity Conversion."
5. Can an interface be both covariant and contravariant on the same type parameter? (e.g., `interface I<in out T>`).

## Sources and limitations

*   **Sources**:
    *   [Microsoft Learn: Covariance and Contravariance (C#)](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)
    *   [C# Language Specification: Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces)
*   **Limitations**: This lesson does not cover variance in "Unsafe" code or the internal IL (Intermediate Language) representation of variance (e.g., the `+` and `-` symbols in metadata). It focuses on high-level C# usage and safety.

## Gaps and follow-up

*   **Unexamined Members**: This lesson did not detail every single variant interface in the `.NET` BCL (Base Class Library), such as `IReadOnlyList<out T>` or `IGrouping<out TKey, out TElement>`.
*   **Complex Edge Cases**: Interaction between variance and **Generic Constraints** (e.g., `where T : new()`) was mentioned briefly via Source 2 but not explored in depth.
*   **Follow-up**: To deepen knowledge, research "Higher-kinded polymorphism" (not supported in C#) or "Default Interface Methods" and how they can provide implementations for variant interfaces.
