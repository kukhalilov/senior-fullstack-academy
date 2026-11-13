<!-- Generated with gemini-3-flash-preview; automated review only; source and code verification pending. -->

## Simple explanation

In C#, **Generics** allow you to write code that works with any data type. **Variance** describes how inheritance rules apply to these generic types when one type is used in place of another.

Imagine you have a `Cat` class that inherits from `Animal`.
*   **Covariance (`out`)**: Allows you to use a more specific type than originally specified. For example, if you have an `IEnumerable<Cat>`, covariance lets you treat it as an `IEnumerable<Animal>`. It is "covariant" because the inheritance direction is preserved (a `Cat` is an `Animal`, so a collection of `Cats` can be viewed as a collection of `Animals`).
*   **Contravariance (`in`)**: Allows you to use a more general type than originally specified. If you have an `Action<Animal>` (a method that can handle any animal), contravariance lets you treat it as an `Action<Cat>`. It is "contravariant" because the assignment direction is the reverse of the inheritance direction (you are assigning a base-type handler to a derived-type variable).

**Key Rule:** 
*   **Covariance (`out`)** is for **producing** data (the type only comes **out** of the object).
*   **Contravariance (`in`)** is for **consuming** data (the type only goes **in** to the object).

---

## How it works

Variance in C# generics applies only to **interfaces** and **delegates**. It does not apply to generic classes. Furthermore, variance only works with **reference types** (e.g., `string`, `class`); it does not work with value types (e.g., `int`, `struct`) due to memory layout differences.

1.  **Covariance (`out T`)**: You mark a type parameter with `out`. This tells the compiler that `T` will only appear in "output" positions, such as the return type of a method. Because you can only *get* items out, it is safe to treat a `Cat` coming out as a more general `Animal`.
2.  **Contravariance (`in T`)**: You mark a type parameter with `in`. This tells the compiler that `T` will only appear in "input" positions, such as method parameters. Because the object only *consumes* items, it is safe to use a method that handles any `Animal` when the code expects something that handles a `Cat`.

If you try to use `out` in an input parameter or `in` in a return type, the C# compiler will throw an error to maintain type safety.

---

## Examples

### Covariance (`IEnumerable<out T>`)
`IEnumerable<T>` is covariant because it is a read-only collection provider.
```csharp
IEnumerable<Cat> cats = new List<Cat>();
// This works because IEnumerable is defined as IEnumerable<out T>
IEnumerable<Animal> animals = cats; 
```

### Contravariance (`Action<in T>`)
`Action<T>` is contravariant because it represents a method that performs an action on an input.
```csharp
Action<Animal> feedAnimal = (animal) => Console.WriteLine("Feeding animal");
// This works because Action is defined as Action<in T>
// A method that can feed ANY animal can certainly feed a cat.
Action<Cat> feedCat = feedAnimal; 
```

---

## Tradeoffs and comparisons

| Feature | Covariance (`out`) | Contravariance (`in`) | Invariance (Default) |
| :--- | :--- | :--- | :--- |
| **Direction** | Same as inheritance | Opposite of inheritance | Must match exactly |
| **Usage** | Output (Return values) | Input (Method parameters) | Both Input and Output |
| **Reference Types** | Supported | Supported | Supported |
| **Value Types** | **Not Supported** | **Not Supported** | Supported |

**Tradeoff:** The main cost is **design complexity**. You must strictly separate your interfaces into producers or consumers to use variance. If an interface needs to both read and write (like `IList<T>`), it **cannot** be variant; it must be **invariant** to prevent runtime errors (like trying to put a `Dog` into a `List<Cat>`).

---

## Interview questions and answers

**Q: Why is `List<T>` invariant?**
*   **Answer:** `List<T>` allows both adding (input) and reading (output). If `List<Cat>` were covariant to `List<Animal>`, you could add a `Dog` to the `List<Animal>` reference. Since the underlying object is actually a `List<Cat>`, this would violate type safety and crash. Therefore, classes like `List<T>` must be invariant.

**Q: What is the difference between `in`, `out`, and invariance?**
*   **Answer:** Invariance means the type must match exactly. Covariance (`out`) allows a more derived (specific) type to be used. Contravariance (`in`) allows a more base (general) type to be used.

**Q: Can I use variance with value types like `int` or `DateTime`?**
*   **Answer:** No. Variance only applies to reference types. `IEnumerable<int>` cannot be implicitly converted to `IEnumerable<object>` because value types require "boxing" and have different memory sizes, which breaks the underlying pointer logic used by variance.

---

## Exercises and solutions

### Exercise 1: Identify the variance
Given the following interface, is it covariant, contravariant, or invariant?
`interface IProcessor<in T> { void Process(T item); }`

**Solution:** **Contravariant**, because of the `in` keyword and the use of `T` exclusively as an input parameter.

### Exercise 2: Fix the code
The following code fails to compile. Why?
`interface IRepository<out T> { T Get(); void Save(T item); }`

**Solution:** This code fails because `T` is marked as `out` (covariant), but it is used as an input parameter in the `Save(T item)` method. To fix this, you must either remove the `out` keyword (making it **invariant**) or split it into two interfaces: `IReader<out T>` and `IWriter<in T>`.

---

## Review questions (with Solutions)

1.  **What happens if you try to use `out T` as a method parameter?**
    *   *Solution:* The compiler will generate an error. The `out` keyword promises that the type will only be used as an output (return value). Using it as a parameter violates this promise.
2.  **Why is `Action<T>` contravariant?**
    *   *Solution:* Because it only "consumes" the type `T` as a method argument. It is safe to pass a more specific object (Cat) to a function that knows how to handle a more general object (Animal).
3.  **If `Dog` inherits from `Animal`, can you assign `List<Dog>` to `List<Animal>`? Why or why not?**
    *   *Solution:* No. `List<T>` is a class and is **invariant**. If this were allowed, you could potentially add a `Cat` to the `List<Animal>` reference, which would break the `List<Dog>`'s integrity.

---

## Sources and limitations

*   **Sources:** Based on the official Microsoft C# Language Specification and .NET documentation regarding Generics and Variance.
*   **Limitations:** This guide covers standard C# variance for generics. It does not cover "Array Covariance" (which exists in C# for historical reasons but is considered type-unsafe) or Java-style "use-site" variance.
*   **Uncertainty:** While the performance impact is negligible, the underlying IL (Intermediate Language) handles variant casts via specific instructions that may have minor differences across different .NET Runtimes (Core vs. Framework).
