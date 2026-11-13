## Scope and version

This lesson covers the concepts of **Covariance**, **Contravariance**, and **Invariance** within the C# programming language. It focuses on how these concepts apply to arrays, generic interfaces, and delegates.

*   **Primary Versions:** C# 4.0 and later (introduction of generic variance), .NET Framework 4+.
*   **Language Features:** `in` and `out` variance annotations for generic type parameters.
*   **APIs Covered:** `IEnumerable<out T>`, `Action<in T>`, `Func<out TResult>`, `IComparable<in T>`, and standard Array behavior.
*   **Objective:** To provide a deep-dive into how type safety is maintained while allowing flexible assignments between related types.

## Simple explanation

In C#, "Variance" refers to how objects of different types can be substituted for one another based on their inheritance relationship (Base class vs. Derived class).

1.  **Invariance:** You must use the **exact** type specified. No substitution is allowed. Most generic classes (like `List<T>`) are invariant.
2.  **Covariance (`out`):** You can use a **more derived** (more specific) type than originally specified. Think of this as "Output." If a method gives you a `Bird`, it is safe to treat it as an `Animal`.
3.  **Contravariance (`in`):** You can use a **less derived** (more general) type than originally specified. Think of this as "Input." If a method needs to process a `Bird`, a method that can process any `Animal` will work perfectly fine.

**Analogy:**
*   **Covariance:** A store promises to give you a "Fruit." If they give you an "Apple," you are happy because an Apple is a Fruit.
*   **Contravariance:** You hire a "Piano Mover." If a "Furniture Mover" shows up, they can still move the piano because a piano is furniture.

## How it works

### 1. Assignment Compatibility
The foundation of variance is that a more derived type can be assigned to a less derived type.
```csharp
string str = "test";
object obj = str; // Legal: string inherits from object
```
Source: [Microsoft Learn - Covariance and Contravariance](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)

### 2. Covariance (`out` keyword)
Covariance applies to types that "come out" of an object. In generics, we use the `out` keyword.
*   **Rule:** A type `T` is **output-safe** if it is used as a return type.
*   **Behavior:** `IEnumerable<string>` can be assigned to `IEnumerable<object>`. This is safe because you are only reading from the collection; every `string` you pull out is guaranteed to be an `object`.

### 3. Contravariance (`in` keyword)
Contravariance applies to types that "go into" an object. In generics, we use the `in` keyword.
*   **Rule:** A type `T` is **input-safe** if it is used as a parameter.
*   **Behavior:** `Action<object>` can be assigned to `Action<string>`. This is safe because the `Action<object>` knows how to handle any object; therefore, it can certainly handle a `string`.

### 4. Variance Safety Restrictions
The C# compiler enforces "Variance Safety" to prevent runtime errors:
*   **Output-unsafe:** You cannot use a contravariant type parameter (`in`) as a return type.
*   **Input-unsafe:** You cannot use a covariant type parameter (`out`) as a method parameter.
Source: [C# Language Specification - Interfaces 19.2.3.2](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces)

## Examples

### Array Covariance (The "Broken" Legacy)
Arrays in C# have been covariant since version 1.0. However, they are **not type-safe** at runtime.
```csharp
object[] array = new string[10];
// This compiles but throws a Runtime Exception (ArrayTypeMismatchException)
// because you cannot put an integer into a string array.
array[0] = 10; 
```
Source: [Microsoft Learn - Covariance and Contravariance](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)

### Delegate Variance
Delegates support variance in both return types and parameters.
```csharp
static object GetObject() => new object();
static string GetString() => "hello";

static void SetObject(object o) { }
static void SetString(string s) { }

// Covariance: Func returns a string (more derived), assigned to object (less derived)
Func<object> del1 = GetString; 

// Contravariance: Action accepts an object (less derived), assigned to string (more derived)
Action<string> del2 = SetObject; 
```

### Custom Variant Interface
```csharp
// 'out' means T is only used as a return value
interface IProducer<out T> {
    T Produce();
}

// 'in' means T is only used as an input parameter
interface IConsumer<in T> {
    void Consume(T item);
}
```

## API and feature inventory

| Feature/API | Variance Type | Purpose | Signature Example |
| :--- | :--- | :--- | :--- |
| `IEnumerable<out T>` | Covariant | Allows reading a sequence of derived types as base types. | `public interface IEnumerable<out T>` |
| `Action<in T>` | Contravariant | Allows a method accepting base types to be used where derived types are expected. | `public delegate void Action<in T>(T obj)` |
| `Func<out TResult>` | Covariant | Allows a method returning a derived type to be used where a base return is expected. | `public delegate TResult Func<out TResult>()` |
| `IComparer<in T>` | Contravariant | Allows comparing derived objects using a base type logic. | `public interface IComparer<in T>` |
| `in` Keyword | Annotation | Marks a generic type parameter as contravariant. | `interface IMyInterface<in T>` |
| `out` Keyword | Annotation | Marks a generic type parameter as covariant. | `interface IMyInterface<out T>` |

**Unexamined Members:** This inventory does not cover specific internal implementations of `IQueryable` or third-party library variance.

## Tradeoffs and comparisons

### Covariance vs. Contravariance
*   **Covariance (`out`):** Focuses on **Data Retrieval**. It makes APIs more flexible for "Get" operations.
*   **Contravariance (`in`):** Focuses on **Data Processing**. It makes APIs more flexible for "Set" or "Execute" operations.

### Reference Types vs. Value Types
*   **Crucial Limitation:** Variance only works for **reference types** (classes, interfaces). It does **not** work for value types (int, struct, etc.).
*   **Example:** `IEnumerable<int>` cannot be converted to `IEnumerable<object>` because `int` is a value type and requires boxing.

### Invariance vs. Variance
*   **Invariance:** Safer but stricter. `List<T>` is invariant because it allows both reading and writing. If `List<string>` were covariant to `List<object>`, you could add an `Integer` to a `List<string>`, breaking the type system.

## Interview questions and answers

**Q1: Why is `List<string>` not convertible to `List<object>`?**
**A:** `List<T>` is invariant. If it were covariant, you could cast a `List<string>` to `List<object>` and then call `.Add(10)`. Since the underlying list is actually for strings, adding an integer would crash the program or corrupt memory. To ensure type safety, C# requires `List<T>` to be invariant.

**Q2: What is the difference between `in` and `out` in generic interfaces?**
**A:** `out` marks a type as covariant, meaning it can only be used as a return type (output). `in` marks a type as contravariant, meaning it can only be used as a method parameter (input).

**Q3: Explain the danger of Array Covariance.**
**A:** Array covariance allows `object[] x = new string[1]`. The compiler allows this, but the runtime tracks the actual type. If you try to perform `x[0] = 5`, the runtime throws an `ArrayTypeMismatchException` because an integer cannot be stored in a string array.

**Follow-up:** How do we avoid this?
**Answer:** Use generic collections like `List<T>` or `IEnumerable<T>` which provide compile-time safety for variance.

## Exercises and solutions

### Exercise 1: Identify the Variance
Given the following classes:
`class Animal {}`
`class Dog : Animal {}`

Which of these lines will compile?
1. `IEnumerable<Animal> list = new List<Dog>();`
2. `Action<Dog> action = (Animal a) => { };`
3. `List<Animal> list2 = new List<Dog>();`

**Solution:**
1. **Compiles.** `IEnumerable<T>` is covariant (`out T`).
2. **Compiles.** `Action<T>` is contravariant (`in T`). An action that handles any Animal can definitely handle a Dog.
3. **Fails.** `List<T>` is invariant.

### Exercise 2: Create a Variant Logger
Create an interface `ILogger` that is contravariant, and a class `ConsoleLogger` that implements it for `object`. Demonstrate assigning it to a `string` logger.

**Solution:**
```csharp
public interface ILogger<in T> {
    void Log(T item);
}

public class ConsoleLogger : ILogger<object> {
    public void Log(object item) => Console.WriteLine(item.ToString());
}

// Usage
ILogger<string> stringLogger = new ConsoleLogger();
stringLogger.Log("This works because of contravariance!");
```

## Review questions

1.  Does variance work for `struct` types? (No, only reference types).
2.  Which keyword is used for a type parameter that only appears in method return types? (`out`).
3.  If an interface has a method `void Update(T item)`, can `T` be marked as `out`? (No, it is in an input position).
4.  What exception is thrown when violating array covariance at runtime? (`ArrayTypeMismatchException`).

## Sources and limitations

**Sources:**
*   [Microsoft Learn: Covariance and Contravariance (C#)](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)
*   [C# Language Specification: Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces)

**Limitations:**
*   This lesson does not cover "Higher-kinded types" or variance in other languages like Java or Scala.
*   The behavior of `dynamic` types in relation to variance is not explored here.
*   Claims regarding performance are based on general CLR behavior and are not verified by specific benchmarks in the provided sources.

## Gaps and follow-up

*   **Unexamined Members:** The lesson does not detail every variant interface in the `.NET` library (e.g., `IObservable<out T>`, `IQueryable<out T>`).
*   **Complex Constraints:** The interaction between variance and complex generic constraints (e.g., `where T : new()`) was not fully explored.
*   **Follow-up:** For further study, research "Variance in Generic Delegates" to see how `Comparison<T>` behaves compared to `IComparer<T>`.